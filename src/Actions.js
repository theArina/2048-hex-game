import keys from './shiftKeys';
import constants from './constants.json';

const { WIN_VALUE } = constants;

export default class Actions {
  constructor(radius) {
    this._radius = radius;
    this._shift = null;
    this._numbers = null;
    this._wereShifts = false;
  }

  _getShiftedCoordinates(coordinates) {
    const step = 1;
    return coordinates
      .map((curr, i) => {
        if (typeof this._shift[i] === 'undefined') return curr;
        return curr + (this._shift[i] ? step : -step);
      });
  }

  _getNext(coordinates) {
    const newCoordinates = this._getShiftedCoordinates(coordinates);
    const { number, didChange } = this._numbers[newCoordinates.join(',')] || {}
    return {
      coordinates: newCoordinates,
      number,
      didChange,
    };
  }

  _areCoordinatesOutOfRange(coordinates) {
    return coordinates.some((curr) => Math.abs(curr) >= this._radius); // TODO remove '>' ?
  }

  _didReachCellWithDifferentValue({ nextNumber, number }) {
    return nextNumber && nextNumber !== number;
  }

  _isCellExistAndEmpty({ number, coordinates }) {
    return !number && !this._areCoordinatesOutOfRange(coordinates)
  }

  _isNextNumberSame({ number, next }) {
    const nextNext = this._getNext(next.coordinates);
    return next.number === number
      && (
        nextNext.number === number
        || this._isCellExistAndEmpty(nextNext)
      );
  }

  _shouldStopShifting({ next, number, didChange }) {
    return (didChange && next.number) || next.didChange
      || this._areCoordinatesOutOfRange(next.coordinates)
      || this._didReachCellWithDifferentValue({ nextNumber: next.number, number })
      || this._isNextNumberSame({ number, next });
  }

  _getShiftedCoordinatesAndValue({ coordinates, didChange, number, wereShifts = false }) {
    const next = this._getNext(coordinates);
    if (this._shouldStopShifting({ next, number, didChange })) {
      return {
        newCoordinates: coordinates,
        newValue: { number, didChange },
        wereShifts,
      };
    }

    const shouldMerge = next.number === number;

    return this._getShiftedCoordinatesAndValue({
      wereShifts: true,
      coordinates: next.coordinates,
      number: shouldMerge ? number * 2 : number,
      didChange: didChange || shouldMerge,
    });
  }

  _getUnformattedNumbers(numbers) {
    const unformatted = {};
    for (const [key, number] of Object.entries(numbers)) {
      unformatted[key] = {
        number,
        didChange: false,
      };
    }
    return unformatted;
  }

  _getFormattedNumbers(numbers) {
    const formatted = {};
    for (const [key, { number }] of Object.entries(numbers)) {
      formatted[key] = number;
    }
    return formatted;
  }

  _getShiftedNumbers() {
    for (const [numbersKey, value] of Object.entries(this._numbers)) {
      const coordinates = numbersKey.split(',').map((curr) => parseInt(curr));
      const { number, didChange } = value;
      const { newCoordinates, newValue, wereShifts } = this._getShiftedCoordinatesAndValue({
        coordinates,
        number,
        didChange,
      });
      if (!wereShifts) continue;
      this._wereShifts = true;
      const newNumbersKey = newCoordinates.join(',');
      this._numbers[newNumbersKey] = newValue;
      delete this._numbers[numbersKey];
      if (newValue.number === WIN_VALUE) {
        return {
          shiftedNumbers: this._getFormattedNumbers(this._numbers),
          wereShifts: this._wereShifts,
          didWin: true,
        };
      }
      return this._getShiftedNumbers();
    }
    return { shiftedNumbers: this._getFormattedNumbers(this._numbers), wereShifts: this._wereShifts };
  }

  getShiftedNumbers({ numbers, shift, radius }) {
    if (radius) {
      this._radius = radius;
    }
    this._shift = shift;
    this._wereShifts = false;
    this._numbers = this._getUnformattedNumbers(numbers);
    return this._getShiftedNumbers();
  }

  areThereMovesLeft(numbers) {
    for (const [, shift] of Object.entries(keys)) {
      const { wereShifts } = this.getShiftedNumbers({ numbers, shift });
      if (wereShifts) return true;
    }
    return false;
  }
}
