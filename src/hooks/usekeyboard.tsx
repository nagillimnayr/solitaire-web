import { GlobalStateContext } from '@/components/dom/providers/GlobalStateProvider';
import { useContext } from 'react';
import { useEventListener } from 'usehooks-ts';

export function useKeyboard() {
  const { GameActor } = useContext(GlobalStateContext);
  useEventListener('keypress', (event) => {
    event.preventDefault();
    event.stopPropagation();
    // console.log(event.code);
    switch (event.code) {
      case 'Space': {
        GameActor.send({ type: 'DRAW_CARD' });
        break;
      }
    }
  });
}
