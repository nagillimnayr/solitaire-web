import { PileImpl } from '@/components/canvas/piles/pile';
import { PlayingCardImpl } from '@/components/canvas/playing-card/playing-card';
import { Object3DNode, extend } from '@react-three/fiber';

export class TableauPileImpl extends PileImpl {
  constructor() {
    super();
  }
}

extend({ TableauPileImpl });
declare module '@react-three/fiber' {
  interface ThreeElements {
    tableauPileImpl: Object3DNode<TableauPileImpl, typeof TableauPileImpl>;
  }
}
