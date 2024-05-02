import React, { useEffect, useReducer, useRef } from 'react';
import { initialState, reducer } from './reducer';
import { SVG } from '@svgdotjs/svg.js';
import { Grid, spiral } from 'honeycomb-grid';
import { ReducerActionType, State } from './types';
import { render as renderSVG } from './hex';

const App: React.FC = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const {
    points,
    radius,
    gameStatus,
    info,
    showCoordinates,
    hex,
    viewBox,
  } = state as State;

  const gameFieldRef = useRef(null);

  const handleKeyUp = ({ code }): void => {
    dispatch({ type: ReducerActionType.handleKeyUp, code });
  };

  const handleShowCoordinates = (): void => {
    dispatch({ type: ReducerActionType.toggleShowCoordinates });
  };

  useEffect(
    () => {
      dispatch({ type: ReducerActionType.init });
    },
    [],
  );

  useEffect(
    () => {
      if (gameStatus !== 'Game over') return;
      document.removeEventListener('keyup', handleKeyUp);
    },
    // TODO: v
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [gameStatus],
  );

  useEffect(
    () => {
      dispatch({ type: ReducerActionType.radiusChanged });
    },
    [radius],
  );

  useEffect(
    () => {
      const gameField = gameFieldRef.current;
      const svg = SVG().addTo(gameField).size('100%', '100%');
      svg.attr('viewBox', viewBox);

      const grid = new Grid(hex, spiral({
        radius: radius - 1,
        start: [0, 0],
      }));

      grid.forEach((hex) => {
        renderSVG({ svg, hex, points, showCoordinates });
      });

      dispatch({ type: ReducerActionType.setPointsMaxSize, value: grid.size });

      if (gameStatus !== 'Game over') {
        document.addEventListener('keyup', handleKeyUp);
      }

      return () => {
        gameField.innerHTML = '';
        document.removeEventListener('keyup', handleKeyUp);
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [gameFieldRef, points, radius, viewBox, showCoordinates],
  );

  return (
    <>
      <div className="status">
        To play use Q, W, E and A, S, D keys
      </div>
      <div className="status">
        Game status: <span data-status={gameStatus}>{gameStatus}</span>
      </div>
      <div className="status">
        <input
          type="checkbox"
          id="show-coordinates"
          value={showCoordinates}
          onChange={handleShowCoordinates}
        />
        <label htmlFor="show-coordinates">
          show coordinates
        </label>
      </div>
      {
        info &&
        <div className="status">
          Info: {info}
        </div>
      }
      <div ref={gameFieldRef} id="game-field"/>
    </>
  );
};

export default App;
