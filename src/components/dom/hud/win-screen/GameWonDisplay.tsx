import { useContext } from 'react';
import { GlobalStateContext } from '../../providers/GlobalStateProvider';
import { useSelector } from '@xstate/react';

export const GameWonDisplay = () => {
  const { GameActor } = useContext(GlobalStateContext);
  const hasWon = useSelector(GameActor, (state) => state.matches('won'));

  return (
    <div className=''>
      <span className='bg-violet-500 bg-clip-text text-6xl font-bold '>
        Game Won!
      </span>
    </div>
  );
};
