import { RestartButton } from '../RestartButton';
import { GameWonDisplay } from './GameWonDisplay';
import { useContext } from 'react';
import { GlobalStateContext } from '../../providers/GlobalStateProvider';
import { useSelector } from '@xstate/react';

export const WinScreen = () => {
  const { GameActor } = useContext(GlobalStateContext);
  const hasWon = useSelector(GameActor, (state) => state.matches('won'));
  return (
    hasWon && (
      <div className='pointer-events-none absolute z-[20] flex h-full w-full items-center justify-center '>
        <div className='flex flex-col items-center justify-center'>
          <GameWonDisplay />
          <div>
            <RestartButton />
          </div>
        </div>
      </div>
    )
  );
};
