import { Html } from '@react-three/drei';
import { RestartButton } from './RestartButton';
import { cn } from '@/helpers/cn';
import { DrawButton } from './DrawButton';
import { ReturnButton } from './ReturnButton';
import { WinScreen } from './win-screen/WinScreen';

export const GameHud = () => {
  return (
    <>
      <div
        className={cn(
          'absolute z-[10] pointer-events-none grid h-full w-full place-items-center',
          'grid-cols-[minmax(128px,_256px)_1fr_minmax(128px,_256px)]',
          'grid-rows-[minmax(64px,_128px)_1fr_minmax(64px,_128px)]',
        )}
      >
        <div className='pointer-events-auto col-start-2 h-fit w-fit'>
          <RestartButton />
          <DrawButton />
          <ReturnButton />
        </div>
      </div>
      <WinScreen />
    </>
  );
};
