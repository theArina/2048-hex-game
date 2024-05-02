import { Grid, Hex } from 'honeycomb-grid';
import { Svg } from '@svgdotjs/svg.js';
import Actions from './Actions';

export enum ReducerActionType {
  'init',
  'toggleShowCoordinates',
  'radiusChanged',
  'handleKeyUp',
}

export type GameStatus = 'Playing' | 'Game over';
export type PointValue = number;
export type PointsMap = {
  [coordinatesString: string]: PointValue;
};
export type Coordinate = {
  x: number;
  y: number;
  z: number;
};
export type CoordinateArray = [
  x: number,
  y: number,
  z: number,
];
export type Point = Coordinate & {
  pointValue: PointValue;
};

export interface State {
  grid: Grid<Hex>;
  svg: Svg;
  radius: number;
  gameStatus: GameStatus;
  points: PointsMap;
  showCoordinates: boolean;
  actions?: Actions;
  info?: string;
}

export interface ReducerAction {
  type: ReducerActionType;

  [key: string]: any;
}

export type ShiftKeyMap = {
  [key: number]: boolean;
};

export interface ShiftKeys {
  [index: string]: ShiftKeyMap;
}

export type ActionPoint = {
  coordinates: CoordinateArray;
  pointValue: PointValue;
  didChange: boolean;
};
export type ActionPointsMap = PointsMap & {
  didChange: boolean;
};