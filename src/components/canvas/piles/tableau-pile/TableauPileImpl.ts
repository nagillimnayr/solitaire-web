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
    return !this._pile.peek().isFaceUp;
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
}
