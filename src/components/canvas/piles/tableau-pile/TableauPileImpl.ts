import { Pile } from '@/components/canvas/piles/Pile';
import { PlayingCardImpl } from '@/components/canvas/playing-card/PlayingCardImpl';

export class TableauPileImpl extends Pile {
  private _index: number;
  constructor(index: number) {
    super();
    this._index = index;
  }
  get index() {
    return this._index;
  }
  set index(index: number) {
    this._index = index;
  }

  addToPile(card: PlayingCardImpl) {
    // Check that move is valid.
    this._pile.push(card);
  }
}
