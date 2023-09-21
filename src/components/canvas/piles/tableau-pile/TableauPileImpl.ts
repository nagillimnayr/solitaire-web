import { Pile } from '@/components/canvas/piles/Pile';
import { PlayingCardImpl } from '@/components/canvas/playing-card/PlayingCardImpl';
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

  addToPile(card: PlayingCardImpl) {
    // Check that move is valid.
    this._pile.push(card);
  }
}
