import React, { useEffect, useReducer, useRef, useCallback } from 'react';
import { initialState, reducer } from './reducer';
import { ReducerActionType, State } from './types';
import { renderHex } from './grid';

const App: React.FC = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const {
    points,
    radius,
    gameStatus,
    info,
    showCoordinates,
    svg,
    grid,
  } = state as State;

  const gameFieldRef: React.Ref<HTMLDivElement> = useRef(null);

  const handleKeyUp = useCallback(({ code }): void => {
    dispatch({
      type: ReducerActionType.handleKeyUp,
      code,
    });
  }, []);

  const handleShowCoordinates = (): void => {
    dispatch({ type: ReducerActionType.toggleShowCoordinates });
  };

  useEffect(() => {
    dispatch({ type: ReducerActionType.init });
  }, []);

  useEffect(() => {
    if (gameStatus === 'Game over') {
      document.removeEventListener('keyup', handleKeyUp);
    }
  }, [gameStatus, handleKeyUp]);

  useEffect(() => {
    const gameField = gameFieldRef.current;
    if (!gameField) {
      return;
    }
    dispatch({
      type: ReducerActionType.radiusChanged,
      gameField,
    });

    document.addEventListener('keyup', handleKeyUp);

    return () => {
      gameField.innerHTML = '';
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [radius, gameFieldRef]);

  useEffect(() => {
    grid?.forEach((hex) => {
      renderHex({ hex, svg, points, showCoordinates });
    });
  }, [grid, svg, points, showCoordinates, renderHex]);

  return (
    <>
      <div className="status">
        To play use Q, W, E and A, S, D keys
        ||
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
