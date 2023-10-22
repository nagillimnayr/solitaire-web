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

    const env = process.env.NODE_ENV;

    // console.log(event.code);
    switch (event.code) {
      case 'Space': {
        GameActor.send({ type: 'DRAW_CARD' });
        break;
      }
      case 'KeyS': {
        if (env !== 'development') return;
        console.log('State:', GameActor.getSnapshot()!.value);
        break;
      }
      case 'KeyA': {
        if (env !== 'development') return;
        GameActor.send({ type: 'START_AUTO_PLAY' });
        break;
      }
      case 'KeyD': {
        if (env !== 'development') return;
        GameActor.send({ type: 'END_AUTO_PLAY' });
        break;
      }
      case 'KeyL': {
        if (env !== 'development') return;
        const { tableauPiles } = GameActor.getSnapshot()!.context;
        for (const tableauPile of tableauPiles) {
          const pile = tableauPile.toArray();
          console.log(`tableauPiles[${tableauPile.index}].toArray():`, pile);
        }
        break;
      }
      case 'KeyF': {
        if (env !== 'development') return;
        const { foundationPiles } = GameActor.getSnapshot()!.context;
        for (const foundationPile of foundationPiles) {
          const pile = foundationPile.toArray().map((card) => card.name);
          console.log(`tableauPiles[${foundationPile.suit}].toArray():`, pile);
        }
        break;
      }
      case 'KeyI': {
        if (env !== 'development') return;
        const controls = getThree().controls as unknown as CameraControls;
        if (!controls) return;

        console.log(`azimuthAngle: ${radToDeg(controls.azimuthAngle)}`);
        console.log(`polarAngle: ${radToDeg(controls.polarAngle)}`);
        console.log(`distance: ${controls.distance}`);

        break;
      }
    }
  });
}
