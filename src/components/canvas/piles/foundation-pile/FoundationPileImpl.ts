import { Pile } from '@/components/canvas/piles/Pile';
import { PlayingCardImpl } from '@/components/canvas/playing-card/PlayingCardImpl';
import { SUITS, Suit, Z_OFFSET } from '@/helpers/constants';
import { Vector3 } from 'three';
import { lerp } from 'three/src/math/MathUtils';

const _pos = new Vector3();

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
    this.getWorldPosition(_pos);
    _pos.z += Z_OFFSET * this.count;

    this._pile.push(card);

    return card.moveTo(_pos);
  }

  canPlace(card: PlayingCardImpl) {
    /** Don't place on previous pile. */
    if (Object.is(card.previousPile, this)) return false;

    /** Must be same suit. */
    if (this.suit !== card.suit) return false;

    /** If no cards currently in the foundation, move is only valid if card being placed is an ace. */
    if (this.count === 0) return card.rank === 0;

    const topCard = this.peek();
    /** Card underneath must be of rank one less than the card being placed. */
    return topCard.rank === card.rank - 1;
  }
}
