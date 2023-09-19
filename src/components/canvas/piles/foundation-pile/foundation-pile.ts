import { PileImpl } from '@/components/canvas/piles/pile';
import { PlayingCardImpl } from '@/components/canvas/playing-card/playing-card';
import { Object3DNode, extend } from '@react-three/fiber';

export class FoundationPileImpl extends PileImpl {
  constructor() {
    super();
  }
}

extend({ FoundationPileImpl });
declare module '@react-three/fiber' {
  interface ThreeElements {
    foundationPileImpl: Object3DNode<
      FoundationPileImpl,
      typeof FoundationPileImpl
    >;
  }
}
