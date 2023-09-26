import { Pile } from '@/components/canvas/piles/Pile';
import { PlayingCardImpl } from '@/components/canvas/playing-card/PlayingCardImpl';
import { Y_OFFSET, Z_OFFSET } from '@/helpers/constants';
import { Vector3 } from 'three';
import { lerp } from 'three/src/math/MathUtils';

const _pos = new Vector3();

export class TableauPileImpl extends Pile {
  private _index: number;
  constructor(index: number) {
    super();
    this._index = index;
    this.name = `tableau-${index + 1}`;
  }

  get index() {
    return this._index;
  }
  get needsFlipping() {
    const topCard = this._pile.peek();

    return topCard ? !topCard.isFaceUp : false;
  }

  addToPile(card: PlayingCardImpl) {
    // Check that move is valid.
    if (this._pile.size() !== 0 && !this._pile.peek().isFaceUp) {
    }
    this.getWorldPosition(_pos);

    _pos.z += Z_OFFSET * this._pile.size();
    _pos.y -= Y_OFFSET * this._pile.size();
    this._pile.push(card);

    return card.moveTo(_pos);
  }

  flipTopCard() {
    const topCard = this._pile.peek();
    if (topCard.isFaceUp) {
      console.warn('Top card is already face up.');
      return;
    }
    topCard.flipFaceUp();
  }

  canPlace(card: PlayingCardImpl) {
    /** Don't place on previous pile. */
    if (Object.is(card.previousPile, this)) return;

    /** If Tableau is empty, move is only valid if card being placed is a King. */
    if (this.count === 0) return card.rank === 12;

    const topCard = this.peek();

    return (
      /** Card must be face up. */
      topCard.isFaceUp &&
      /** Cards must not be same color (Cannot be both even or both odd). */
      card.suit % 2 !== topCard.suit % 2 &&
      /** Card underneath must be one rank higher than the card we're placing on it. */
      topCard.rank === card.rank + 1
    );
  }

  /** Check if any cards are still face down. */
  isAllFaceUp(): boolean {
    if (this.isEmpty()) return true;
    const pile = this._pile.toArray();

    /** If bottom card is face up, then they must all be face up. */

    return pile[0].isFaceUp;
  }

  hasFaceUpKing() {
    const pile = this._pile.toArray();
    console.log(pile);
    for (let i = 1; i < this.count; ++i) {
      const card = pile[i];
      if (card.rank === 13 && card.isFaceUp) return true;
    }
    return false;
  }
}
