'use client';

import { ErrorBoundary } from 'react-error-boundary';
import { useCallback, useContext } from 'react';
import { GlobalStateContext } from '../providers/GlobalStateProvider';

type ReturnButtonProps = {
  //
};
export const ReturnButton = () => {
  const { GameActor } = useContext(GlobalStateContext);

  const handleClick = useCallback(() => {
    GameActor.send({ type: 'RETURN_WASTE' });
  }, [GameActor]);
  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <button
        className='rounded-md border border-gray-500 bg-gray-300 p-2 transition-all hover:bg-gray-400'
        onClick={handleClick}
      >
        Return
      </button>
    </ErrorBoundary>
  );
};
