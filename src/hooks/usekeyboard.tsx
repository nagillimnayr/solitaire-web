import { GlobalStateContext } from '@/components/dom/providers/GlobalStateProvider';
import { useContext } from 'react';
import { useEventListener } from 'usehooks-ts';

export function useKeyboard() {
  const { GameActor } = useContext(GlobalStateContext);
  useEventListener('keypress', (event) => {
    event.preventDefault();
    event.stopPropagation();
    console.log(event.code);
    switch (event.code) {
      case 'Space': {
        GameActor.send({ type: 'DRAW_CARD' });
        break;
      }
      case 'KeyS': {
        console.log('State:', GameActor.getSnapshot()!.value);
        break;
      }
      case 'KeyA': {
        GameActor.send({ type: 'START_AUTO_PLAY' });
        break;
      }
      case 'KeyD': {
        GameActor.send({ type: 'END_AUTO_PLAY' });
        break;
      }
    }
  });
}
