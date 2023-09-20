'use client';

import { ErrorBoundary } from 'react-error-boundary';
import { useCallback, useContext } from 'react';
import { GlobalStateContext } from '../providers/GlobalStateProvider';

type RestartButtonProps = {
  //
};
export const RestartButton = () => {
  const { GameActor } = useContext(GlobalStateContext);

  const handleClick = useCallback(() => {
    GameActor.send({ type: 'RESTART' });
  }, [GameActor]);
  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <button
        className='rounded-md border border-gray-500 bg-gray-300 p-2 transition-all hover:bg-gray-400'
        onClick={handleClick}
      >
        Restart
      </button>
    </ErrorBoundary>
  );
};
