import { Pile } from '@/components/canvas/piles/Pile';
import { PlayingCardImpl } from '@/components/canvas/playing-card/PlayingCardImpl';
import { SUITS, Suit } from '@/helpers/constants';

export class FoundationPileImpl extends Pile {
  private _suit: Suit;

  constructor(suit: Suit) {
    super();
    this._suit = suit;
    this.name = `foundation-pile-${SUITS[suit]}`;
  }

  get suit() {
    return this._suit;
  }

  addToPile(card: PlayingCardImpl) {
    //
  }
}
