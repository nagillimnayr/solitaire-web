import { Pile } from '@/components/canvas/piles/Pile';
import { PlayingCardImpl } from '@/components/canvas/playing-card/PlayingCardImpl';

export class WastePileImpl extends Pile {
  constructor() {
    super();
    this.name = `stock-pile`;
  }

  addToPile(card: PlayingCardImpl) {
    this._pile.push(card);
  }
}
