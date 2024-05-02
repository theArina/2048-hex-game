import shiftKeys from './shiftKeys';
import { getRandomPoints } from './utils';
import Actions from './Actions';
import { Point, PointsMap, PointValue, ReducerAction, ReducerActionType, State } from './types';
import constants from './constants.json';
import { createGrid } from './grid';
import { SVG, Svg } from '@svgdotjs/svg.js';

const { GAME_OVER_INFO } = constants;

export const initialState: State = {
  radius: 2,
  gameStatus: 'Playing',
  points: {},
  showCoordinates: false,
  grid: null, // TODO
  svg: null,
} as State;

const mapPoints = (points: Point[]): PointsMap => {
  const mappedPoints = {};
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

const getRadiusFromUrl = (): number => {
  const url = new URL(window.location.href);
  const { searchParams } = url;
  let radiusToSet = searchParams.get('radius') || '';
  if (!/^[2-7]$/.test(radiusToSet)) {
    radiusToSet = initialState.radius.toString();
    searchParams.set('radius', radiusToSet);
    url.search = searchParams.toString();
    window.location.href = url.href; // TODO
  }
  return parseInt(radiusToSet);
};

export const reducer = (state: State, action: ReducerAction): State => {
  switch (action.type) {
    case ReducerActionType.init: {
      const radius = getRadiusFromUrl();
      const prevPoints = unmapPoints(initialState.points);
      const newPoints = getRandomPoints(radius, prevPoints);
      const newMappedPoints = mapPoints(newPoints);
      return {
        ...state,
        info: null,
        points: {
          ...newMappedPoints,
        },
        radius,
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
          info: `YOU WON! ${GAME_OVER_INFO}`,
        } as State;
      }
      const prevPoints = unmapPoints(shiftedPoints);
      const newPoints = getRandomPoints(radius, prevPoints);
      const newMappedPoints = mapPoints(newPoints);
      const newState = {
        ...state,
        info: null,
        points: {
          ...shiftedPoints,
          ...newMappedPoints,
        },
      };
      if (didLose(newState.points, state.grid.size, state.actions as Actions)) {
        return {
          ...newState,
          gameStatus: 'Game over',
          info: `YOU LOST :( ${GAME_OVER_INFO}`,
        } as State;
      }
      return newState as State;
    }
    case ReducerActionType.radiusChanged: {
      const { gameField }: { gameField: HTMLDivElement } = action;
      const { radius }: { radius: number } = state;
      const radiusRatio = 1 - radius / 10;
      const viewBox = [0, -(radius * radiusRatio * 150), 300 * radiusRatio, 800].join(' ');
      const svg: Svg = SVG().addTo(gameField).size('100%', '100%');
      svg.attr('viewBox', viewBox);
      // TODO: maybe init this in the init state and only if radius really changed recreate again
      const grid = createGrid({
        radius,
        radiusRatio,
      });
      return {
        ...state,
        grid,
        svg,
      } as State;
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
