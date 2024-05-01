import keys from './shiftKeys';
import { getRandomPoints } from './utils';
import Actions from './Actions';
import { createHex } from './hex';
import constants from './constants.json';

const { GAME_OVER_INFO } = constants;

export const initialState = {
  radius: 2,
  gameStatus: 'playing',
  numbers: {},
  numbersMaxSize: 7,
  showCoordinates: false,
  hex: createHex(),
};

const unmapNumbers = (points) => {
  return Object.entries(points)
    .map(([key, value]) => {
      const [x, y, z] = key.split(',').map((it) => parseInt(it));
      return { x, y, z, value };
    });
};

function didLose(state) {
  const isFieldFull = Object.keys(state.numbers).length === state.numbersMaxSize;
  if (!isFieldFull) return false;
  return !state.actions.areThereMovesLeft(state.numbers);
}

function getRadiusFromUrl() {
  const url = new URL(window.location.href);
  const { searchParams } = url;
  let radiusToSet = searchParams.get('radius');
  if (!/^[2-7]$/.test(radiusToSet)) {
    radiusToSet = initialState.radius;
    searchParams.set('radius', radiusToSet);
    url.search = searchParams.toString();
    window.location.href = url.href; // TODO
  }
  return radiusToSet;
}

export function reducer(state, action) {
  switch (action.type) {
    case 'initialize-game': {
      const { radius, hostname, port } = action;
      return {
        ...state,
        radius,
        hostname,
        port,
        actions: new Actions(radius),
      };
    }
    case 'finish-game': {
      return {
        ...state,
        gameStatus: 'game-over',
        info: `YOU WON! ${GAME_OVER_INFO}`,
      };
    }
    case 'radius-changed': {
      const radiusRatio = 1 - state.radius / 10;
      return {
        ...state,
        viewBox: [0, -(state.radius * radiusRatio * 150), 300 * radiusRatio, 800].join(' '),
        hex: createHex(radiusRatio),
      };
    }
    case 'set-numbers-max-size': {
      if (state.numbersMaxSize === action.length) return state;
      return { ...state, numbersMaxSize: action.length };
    }
    case 'add-numbers': {
      const { points, shiftedNumbers = {} } = action;
      const newNumbers = {};
      Array.isArray(points)
      && points.forEach(({ x, y, z, value }) => {
        const key = [x, y, z].join(',');
        newNumbers[key] = value;
      });
      const newState = {
        ...state,
        info: null,
        numbers: {
          ...shiftedNumbers,
          ...newNumbers,
        },
      };
      if (didLose(newState)) {
        newState.gameStatus = 'game-over';
        newState.info = `YOU LOST :( ${GAME_OVER_INFO}`;
      }
      return newState;
    }
    case 'toggle-show-coordinates': {
      return {
        ...state,
        showCoordinates: !state.showCoordinates,
      };
    }
    case 'show-error': {
      return {
        ...state,
        info: 'Paused due to an error',
      };
    }
    default:
      return state;
  }
}

export async function asyncDispatch({ dispatch, type, payload }) {
  switch (type) {
    case 'initialize-game': {
      const radius = getRadiusFromUrl();
      dispatch({
        type: 'initialize-game',
        radius,
      });
      try {
        // TODO: redundant async
        const points = await getRandomPoints(radius, unmapNumbers(initialState.numbers));
        dispatch({ type: 'add-numbers', points });
      } catch (e) {
        console.error(e);
        dispatch({ type: 'show-error' });
      }
      break;
    }
    case 'handle-key-up': {
      const shift = keys[payload.code];
      if (!shift) return;
      const {
        numbers,
        radius,
        actions,
      } = payload;
      const { shiftedNumbers, didWin, wereShifts } = actions.getShiftedNumbers({ numbers, shift, radius });
      if (!wereShifts) return;
      if (didWin) {
        dispatch({ type: 'add-numbers', shiftedNumbers });
        dispatch({ type: 'finish-game' });
        return;
      }
      try {
        const points = await getRandomPoints(radius, unmapNumbers(shiftedNumbers));
        dispatch({ type: 'add-numbers', points, shiftedNumbers });
      } catch (e) {
        console.error(e);
        dispatch({ type: 'show-error' });
      }
      break;
    }
    default:
      break;
  }
}
