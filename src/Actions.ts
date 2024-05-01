import shiftKeys from './shiftKeys';
import { CoordinateArray, PointsMap, PointValue, ShiftKeyMap, ActionPointsMap, ActionPoint } from './types';
import constants from './constants.json';

const { WIN_VALUE } = constants;

export default class Actions {
  private _radius: number;
  private _shift: ShiftKeyMap | {};
  private _points: ActionPointsMap | {};
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
      });
  }

  _getNext(coordinates: CoordinateArray): ActionPoint {
    const newCoordinates = this._getShiftedCoordinates(coordinates);
    const { point, didChange } = this._points[newCoordinates.join(',')] || {}
    return {
      coordinates: newCoordinates,
      pointValue: point,
      didChange,
    };
  }

  _areCoordinatesOutOfRange(coordinates: CoordinateArray): boolean {
    return coordinates.some((it) => Math.abs(it) >= this._radius);
  }

  _didReachCellWithDifferentValue({ nextPoint, point }: {
    nextPoint: PointValue;
    point: PointValue;
  }): boolean {
    return !!nextPoint && nextPoint !== point;
  }

  _isCellExistAndEmpty({ point, coordinates }: ActionPoint): boolean {
    return !point && !this._areCoordinatesOutOfRange(coordinates);
  }

  _isNextPointValueSame({ point, next }: {
    point: PointValue;
    next: ActionPoint;
  }): boolean {
    const nextNext = this._getNext(next.coordinates);
    return next.pointValue === point
      && (
        nextNext.pointValue === point
        || this._isCellExistAndEmpty(nextNext)
      );
  }

  _shouldStopShifting({ next, point, didChange }: {
    next: ActionPoint;
    point: PointValue;
    didChange: boolean;
  }): boolean {
    return (didChange && !!next.pointValue)
      || next.didChange
      || this._areCoordinatesOutOfRange(next.coordinates)
      || this._didReachCellWithDifferentValue({ nextPoint: next.pointValue, point })
      || this._isNextPointValueSame({ point, next });
  }

  _getShiftedCoordinatesAndValue({ coordinates, didChange, point, wereShifts = false }: {
    coordinates: CoordinateArray;
    didChange: boolean;
    point: PointValue;
    wereShifts?: boolean;
  }): {
    newCoordinates: CoordinateArray;
    newValue: { point: PointValue; didChange: boolean; };
    wereShifts: boolean;
  } {
    const next = this._getNext(coordinates);
    if (this._shouldStopShifting({ next, point, didChange })) {
      return {
        newCoordinates: coordinates,
        newValue: { point, didChange },
        wereShifts,
      };
    }

    const shouldMerge = next.pointValue === point;

    return this._getShiftedCoordinatesAndValue({
      wereShifts: true,
      coordinates: next.coordinates,
      point: shouldMerge ? point * 2 : point,
      didChange: didChange || shouldMerge,
    });
  }

  _getUnformattedPoints(points: PointsMap): ActionPointsMap | {} {
    const unformatted = {};
    for (const [key, point] of Object.entries(points)) {
      unformatted[key] = {
        point,
        didChange: false,
      };
    }
    return unformatted;
  }

  _getFormattedPoints(points: ActionPointsMap | {}): PointsMap {
    const formatted = {};
    for (const [key, { point }] of Object.entries(points)) {
      formatted[key] = point;
    }
    return formatted;
  }

  _getShiftedPoints(): {
    shiftedPoints: PointsMap;
    wereShifts: boolean;
    didWin: boolean;
  } {
    for (const [coordinatesString, pointValue] of Object.entries(this._points)) {
      const coordinates: CoordinateArray = coordinatesString.split(',').map((it) => parseInt(it));
      const { point, didChange } = pointValue;
      const { newCoordinates, newValue, wereShifts } = this._getShiftedCoordinatesAndValue({
        coordinates,
        point,
        didChange,
      });
      if (!wereShifts) continue;
      this._wereShifts = true;
      const newCoordinatesString = newCoordinates.join(',');
      this._points[newCoordinatesString] = newValue;
      delete this._points[coordinatesString];
      if (newValue.point === WIN_VALUE) {
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
