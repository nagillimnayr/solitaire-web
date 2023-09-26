import { GlobalStateContext } from '@/components/dom/providers/GlobalStateProvider';
import { useFrame, useThree } from '@react-three/fiber';
import { useContext, useEffect } from 'react';

const autoPlayEnabled = true;

export function useAutoPlay() {
  const { GameActor } = useContext(GlobalStateContext);
  const getThree = useThree(({ get }) => get);

  useEffect(() => {
    if (autoPlayEnabled) {
      GameActor.send({ type: 'START_AUTO_PLAY' });
    }
  }, [GameActor]);

  useFrame(() => {
    if (!GameActor.getSnapshot()!.matches('idle')) return;
  });
}
