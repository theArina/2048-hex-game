import shiftKeys from './shiftKeys';
import { CoordinateArray, PointsMap, PointValue, ShiftKeyMap, ActionPointsMap, ActionPoint } from './types';
import constants from './constants.json';

const { WIN_VALUE } = constants;

export default class Actions {
  private _radius: number;
  private _shift: ShiftKeyMap;
  private _points: ActionPointsMap;
  private _wereShifts: boolean;

  constructor(radius: number) {
    this._radius = radius;
    this._shift = {};
    this._points = {};
    this._wereShifts = false;
  }

  _getShiftedCoordinates(coordinates: CoordinateArray): CoordinateArray {
    const step = 1;
    return coordinates
      .map((it, i) => {
        if (typeof this._shift[i] === 'undefined') return it;
        return it + (this._shift[i] ? step : -step);
      }) as CoordinateArray;
  }

  _getNext(coordinates: CoordinateArray): ActionPoint {
    const newCoordinates = this._getShiftedCoordinates(coordinates);
    const { pointValue, didChange } = this._points?.[newCoordinates.join(',')] || {};
    return {
      coordinates: newCoordinates,
      pointValue,
      didChange,
    };
  }

  _areCoordinatesOutOfRange(coordinates: CoordinateArray): boolean {
    return coordinates.some((it) => Math.abs(it) >= this._radius);
  }

  _didReachCellWithDifferentValue(nextPointValue: PointValue, currentPointValue: PointValue): boolean {
    return !!nextPointValue && nextPointValue !== currentPointValue;
  }

  _isCellExistAndEmpty({ pointValue, coordinates }: ActionPoint): boolean {
    return !pointValue && !this._areCoordinatesOutOfRange(coordinates);
  }

  _isNextPointValueSame(next: ActionPoint, current: ActionPoint): boolean {
    const nextNext = this._getNext(next.coordinates);
    return next.pointValue === current.pointValue
      && (
        nextNext.pointValue === current.pointValue
        || this._isCellExistAndEmpty(nextNext)
      );
  }

  _shouldStopShifting(next: ActionPoint, current: ActionPoint): boolean {
    return (current.didChange && !!next.pointValue)
      || next.didChange
      || this._areCoordinatesOutOfRange(next.coordinates)
      || this._didReachCellWithDifferentValue(next.pointValue, current.pointValue)
      || this._isNextPointValueSame(next, current);
  }

  _getShiftedCoordinatesAndValue(point: ActionPoint, wereShifts: boolean): ActionPoint & {
    wereShifts: boolean;
  } {
    const next = this._getNext(point.coordinates);
    if (this._shouldStopShifting(next, point)) {
      return {
        ...point,
        wereShifts,
      };
    }

    const shouldMerge = next.pointValue === point.pointValue;

    return this._getShiftedCoordinatesAndValue({
      coordinates: next.coordinates,
      pointValue: shouldMerge ? point.pointValue * 2 : point.pointValue,
      didChange: point.didChange || shouldMerge,
    }, true);
  }

  _getUnformattedPoints(points: PointsMap): ActionPointsMap {
    const unformatted: ActionPointsMap = {};
    for (const [coordinatesString, pointValue] of Object.entries(points)) {
      unformatted[coordinatesString] = {
        pointValue,
        coordinates: coordinatesString.split(',').map((it) => parseInt(it)) as CoordinateArray,
        didChange: false,
      };
    }
    return unformatted;
  }

  _getFormattedPoints(points: ActionPointsMap): PointsMap {
    const formatted: PointsMap = {};
    for (const [key, { pointValue }] of Object.entries(points)) {
      formatted[key] = pointValue;
    }
    return formatted;
  }

  _getShiftedPoints(): {
    shiftedPoints: PointsMap;
    wereShifts: boolean;
    didWin: boolean;
  } {
    for (const [coordinatesString, actionPoint] of Object.entries(this._points)) {
      const newActionPoint = this._getShiftedCoordinatesAndValue(actionPoint, false);
      if (!newActionPoint.wereShifts) continue;
      this._wereShifts = true;
      const newCoordinatesString = newActionPoint.coordinates.join(',');
      this._points[newCoordinatesString] = newActionPoint;
      delete this._points[coordinatesString];
      if (newActionPoint.pointValue === WIN_VALUE) {
        return {
          shiftedPoints: this._getFormattedPoints(this._points),
          wereShifts: this._wereShifts,
          didWin: true,
        };
      }
      return this._getShiftedPoints();
    }
    return {
      shiftedPoints: this._getFormattedPoints(this._points),
      wereShifts: this._wereShifts,
      didWin: false,
    };
  }

  getShiftedPoints({ points, shift, radius }: {
    points: PointsMap;
    shift: ShiftKeyMap;
    radius?: number;
  }): {
    shiftedPoints: PointsMap;
    wereShifts: boolean;
    didWin: boolean;
  } {
    if (radius) {
      this._radius = radius;
    }
    this._shift = shift;
    this._wereShifts = false;
    this._points = this._getUnformattedPoints(points);
    return this._getShiftedPoints();
  }

  areThereMovesLeft(points: PointsMap): boolean {
    for (const [, shift] of Object.entries(shiftKeys)) {
      const { wereShifts } = this.getShiftedPoints({ points, shift });
      if (wereShifts) return true;
    }
    return false;
  }
}
