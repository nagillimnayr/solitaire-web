'use client';

import { ErrorBoundary } from 'react-error-boundary';
import { useCallback, useContext } from 'react';
import { GlobalStateContext } from '../providers/GlobalStateProvider';

export const DrawButton = () => {
  const { GameActor } = useContext(GlobalStateContext);

  const handleClick = useCallback(() => {
    console.log('draw');
    GameActor.send({ type: 'DRAW_CARD' });
  }, [GameActor]);

  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <button
        className='rounded-md border border-gray-500 bg-gray-300 p-2 transition-all hover:bg-gray-400'
        onClick={handleClick}
      >
        Draw
      </button>
    </ErrorBoundary>
  );
};
