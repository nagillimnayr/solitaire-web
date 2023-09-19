import { PileImpl } from '@/components/canvas/piles/pile';
import { PlayingCardImpl } from '@/components/canvas/playing-card/playing-card';
import { Object3DNode, extend } from '@react-three/fiber';

export class StockPileImpl extends PileImpl {
  constructor() {
    super();
  }
}

extend({ StockPileImpl });
declare module '@react-three/fiber' {
  interface ThreeElements {
    stockPileImpl: Object3DNode<StockPileImpl, typeof StockPileImpl>;
  }
}
