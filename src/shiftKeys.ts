import { ShiftKeys } from './types';

// indexes
const { x, y, z } = {
  x: 0,
  y: 1,
  z: 2,
};

const shiftKeys: ShiftKeys = {
  // north-west (top-left)
  KeyQ: { // 81
    [x]: false, // decrease (-1)
    [y]: true, // increase (+1)
  },
  // north (top)
  KeyW: { // 87
    [y]: true,
    [z]: false,
  },
  // north-east (top-right)
  KeyE: { // 69
    [x]: true,
    [z]: false,
  },
  // south-west (bottom-left)
  KeyA: { // 65
    [x]: false,
    [z]: true,
  },
  // south (bottom)
  KeyS: { // 83
    [y]: false,
    [z]: true,
  },
  // south-east (bottom-right)
  KeyD: { // 68
    [x]: true,
    [y]: false,
  },
};

export default shiftKeys;
