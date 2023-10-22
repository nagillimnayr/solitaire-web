import { GlobalStateContext } from '@/components/dom/providers/GlobalStateProvider';
import { CameraControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useContext } from 'react';
import { radToDeg } from 'three/src/math/MathUtils';
import { useEventListener } from 'usehooks-ts';

export function useKeyboard() {
  const { GameActor } = useContext(GlobalStateContext);

  const getThree = useThree(({ get }) => get);

  useEventListener('keypress', (event) => {
    event.preventDefault();
    event.stopPropagation();
    // console.log(event.code);
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
      case 'KeyL': {
        const { tableauPiles } = GameActor.getSnapshot()!.context;
        for (const tableauPile of tableauPiles) {
          const pile = tableauPile.toArray();
          console.log(`tableauPiles[${tableauPile.index}].toArray():`, pile);
        }
        break;
      }
      case 'KeyF': {
        const { foundationPiles } = GameActor.getSnapshot()!.context;
        for (const foundationPile of foundationPiles) {
          const pile = foundationPile.toArray().map((card) => card.name);
          console.log(`tableauPiles[${foundationPile.suit}].toArray():`, pile);
        }
        break;
      }
      // case 'KeyI': {
      //   const controls = getThree().controls as unknown as CameraControls;
      //   if (!controls) return;

      //   console.log(`azimuthAngle: ${radToDeg(controls.azimuthAngle)}`);
      //   console.log(`polarAngle: ${radToDeg(controls.polarAngle)}`);
      //   console.log(`distance: ${controls.distance}`);

      //   break;
      // }
    }
  });
}
