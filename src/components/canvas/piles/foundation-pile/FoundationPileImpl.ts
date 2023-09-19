import { PileImpl } from '@/components/canvas/piles/PileImpl';
import { PlayingCardImpl } from '@/components/canvas/playing-card/PlayingCardImpl';
import { SUITS, Suit } from '@/helpers/constants';

export class FoundationPileImpl extends PileImpl {
  private _suit: Suit;

  constructor(suit: Suit) {
    super();
    this._suit = suit;
    this.name = `foundation-pile-${SUITS[suit]}`;
  }
}
