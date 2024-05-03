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
  const radiusSliderRef: React.Ref<HTMLInputElement> = useRef(null);

  const handleKeyUp = useCallback(({ code }): void => {
    dispatch({
      type: ReducerActionType.handleKeyUp,
      code,
    });
  }, []);

  const handleShowCoordinates = (): void => {
    dispatch({ type: ReducerActionType.toggleShowCoordinates });
  };

  const restartGame = (_radius?: number): void => {
    const gameField = gameFieldRef.current;
    if (!gameField) {
      return;
    }
    gameField.innerHTML = '';
    dispatch({
      type: ReducerActionType.init,
      gameField: gameFieldRef.current,
      radius: _radius,
    });
  };

  useEffect(() => {
    dispatch({
      type: ReducerActionType.init,
      gameField: gameFieldRef.current,
    });
  }, []);

  useEffect(() => {
    if (gameStatus === 'Game over') {
      document.removeEventListener('keyup', handleKeyUp);
    } else {
      document.addEventListener('keyup', handleKeyUp);
    }
    return () => {

      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameStatus, handleKeyUp]);
  // TODO: check eslint

  useEffect(() => {
    grid?.forEach((hex) => {
      renderHex({ hex, svg, points, showCoordinates });
    });
  }, [grid, svg, points, showCoordinates, renderHex]);

  return (
    <>
      <div className="status">
        To play use <strong>Q, W, E</strong> and <strong>A, S, D</strong> keys
        ||
        Game status: <strong>{gameStatus}</strong>
        {
          info && <span> || {info}</span>
        }
        <button id="restart-button" onClick={() => restartGame(radius)}>
          Start again
        </button>
      </div>
      <div className="slider-container">
        <label htmlFor="slider">
          Radius: {radius}
        </label>
        <input
          ref={radiusSliderRef}
          type="range"
          min="2"
          max="7"
          id="slider"
          className="slider"
          value={radius}
          onChange={({ target: { value } }) => restartGame(parseInt(value))}
        />
        <span className="tooltip">
          Changing radius will restart the game
        </span>
      </div>
      <div className="status">
        <input
          type="checkbox"
          id="show-coordinates"
          value={showCoordinates}
          onChange={handleShowCoordinates}
        />
        <label htmlFor="show-coordinates">
          Show coordinates
        </label>
      </div>
      <div ref={gameFieldRef} id="game-field"/>
    </>
  );
};

export default App;
