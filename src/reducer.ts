import shiftKeys from './shiftKeys';
import { getRandomPoints } from './utils';
import Actions from './Actions';
import { Point, PointsMap, PointValue, ReducerAction, ReducerActionType, State } from './types';
import { createGrid } from './grid';
import { SVG, Svg } from '@svgdotjs/svg.js';

export const initialState: State = {
  radius: 2,
  gameStatus: 'Playing',
  points: {},
  showCoordinates: false,
  grid: null,
  svg: null,
  info: '',
}; // TODO

const mapPoints = (points: Point[]): PointsMap => {
  const mappedPoints: PointsMap = {};
  if (Array.isArray(points)) {
    points.forEach(({ x, y, z, pointValue }) => {
      const key = [x, y, z].join(',');
      mappedPoints[key] = pointValue;
    });
  }
  return mappedPoints;
};

const unmapPoints = (points: PointsMap): Point[] => {
  return Object.entries(points)
    .map(([key, pointValue]: [key: string, pointValue: PointValue]) => {
      const [x, y, z] = key.split(',').map((it) => parseInt(it));
      return { x, y, z, pointValue };
    });
};

const didLose = (points: PointsMap, pointsMaxSize: number, actions: Actions): boolean => {
  const isFieldFull = Object.keys(points).length === pointsMaxSize;
  if (!isFieldFull) return false;
  return !actions.areThereMovesLeft(points);
};

const getNewPoints = (radius: number, prevPoints: PointsMap): PointsMap => {
  const prevUnmappedPoints = unmapPoints(prevPoints);
  const newPoints = getRandomPoints(radius, prevUnmappedPoints);
  return mapPoints(newPoints);
};

export const reducer = (state: State, action: ReducerAction): State => {
  switch (action.type) {
    case ReducerActionType.init: {
      const {
        gameField,
        radius = initialState.radius,
      } = action;
      const radiusRatio = 1 - radius / 10;
      const viewBox = [0, -(radius * radiusRatio * 150), 300 * radiusRatio, 800].join(' ');
      const svg: Svg = SVG().addTo(gameField).size('100%', '100%');
      svg.attr('viewBox', viewBox);
      const grid = createGrid({
        radius,
        radiusRatio,
      });
      const points = getNewPoints(radius, initialState.points);
      return {
        ...state,
        points,
        grid,
        svg,
        radius,
        info: initialState.info,
        gameStatus: initialState.gameStatus,
        actions: new Actions(radius),
      } as State;
    }
    case ReducerActionType.handleKeyUp: {
      const shift = shiftKeys[action.code];
      if (!shift) return state;
      const {
        points,
        radius,
        actions,
      } = state as State;
      const { shiftedPoints, didWin, wereShifts } = actions.getShiftedPoints({ points, shift, radius });
      if (!wereShifts) return state;
      if (didWin) {
        return {
          ...state,
          points: { ...shiftedPoints },
          gameStatus: 'Game over',
          info: 'YOU WON!',
        } as State;
      }
      const newPoints = getNewPoints(radius, shiftedPoints);
      const newState = {
        ...state,
        info: null,
        points: {
          ...shiftedPoints,
          ...newPoints,
        },
      };
      if (didLose(newState.points, state.grid.size, state.actions)) {
        return {
          ...newState,
          gameStatus: 'Game over',
          info: 'YOU LOST :(',
        };
      }
      return newState as State;
    }
    case ReducerActionType.changeRadius: {
      const { radius } = action;
      return {
        ...state,
        radius,
      };
    }
    case ReducerActionType.toggleShowCoordinates: {
      return {
        ...state,
        showCoordinates: !state.showCoordinates,
      };
    }
    default:
      return state;
  }
}
