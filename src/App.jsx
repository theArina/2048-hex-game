import React, { useReducer, useRef, useEffect } from 'react';
import { reducer, asyncDispatch, initialState } from './reducer';
import SVG from 'svg.js';
import { defineGrid } from 'honeycomb-grid';

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const {
    numbers,
    radius,
    gameStatus,
    info,
    showCoordinates,
    hex,
    viewBox,
  } = state;

  const elementRef = useRef(null);

  function keyUpHandler({ code }) {
    asyncDispatch({
      dispatch,
      type: 'handle-key-up',
      payload: { code, ...state },
    });
  }

  useEffect(() => {
    if (gameStatus !== 'game-over') return;
    document.removeEventListener('keyup', keyUpHandler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStatus]);

  useEffect(() => {
    asyncDispatch({ dispatch, type: 'initialize-game' });
  }, []);

  useEffect(() => {
    dispatch({ type: 'radius-changed' });
  }, [radius]);

  useEffect(() => {
    const element = elementRef.current;
    const svg = SVG(element);
    svg.attr('viewBox', viewBox);
    const grid = defineGrid(hex)
      .hexagon({
        radius: radius - 1,
        center: [0, 0],
        onCreate: (he) => {
          return he.render({ svg, numbers, showCoordinates })
        }
      });
    const { length } = grid;
    dispatch({ type: 'set-numbers-max-size', length });

    if (gameStatus !== 'game-over') {
      document.addEventListener('keyup', keyUpHandler);
    }

    return () => {
      element.innerHTML = '';
      document.removeEventListener('keyup', keyUpHandler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elementRef, numbers, radius, viewBox, showCoordinates]);

  function handleShowCoordinates() {
    dispatch({ type: 'toggle-show-coordinates' });
  }

  return (
    <>
      <div className="status">
        To play use Q, W, E and A, S, D keys
      </div>
      <div className="status">
        Game status: <span data-status={gameStatus}>{gameStatus}</span>
      </div>
      <div className="status">
        <input type="checkbox" id="show-coordinates" value={showCoordinates} onChange={handleShowCoordinates}/>
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
      <div ref={elementRef} id="game-field"/>
    </>
  );
}
