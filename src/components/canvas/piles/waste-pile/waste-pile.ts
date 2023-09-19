import { PileImpl } from '@/components/canvas/piles/pile';
import { PlayingCardImpl } from '@/components/canvas/playing-card/playing-card';
import { Object3DNode, extend } from '@react-three/fiber';

export class WastePileImpl extends PileImpl {
  constructor() {
    super();
  }
}

extend({ WastePileImpl });
declare module '@react-three/fiber' {
  interface ThreeElements {
    wastePileImpl: Object3DNode<WastePileImpl, typeof WastePileImpl>;
  }
}
