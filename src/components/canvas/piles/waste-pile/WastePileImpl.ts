import { Pile } from '@/components/canvas/piles/Pile';
import { PlayingCardImpl } from '@/components/canvas/playing-card/PlayingCardImpl';
import { Z_OFFSET } from '@/helpers/constants';
import { Vector3 } from 'three';
import { lerp } from 'three/src/math/MathUtils';

const _pos = new Vector3();
export class WastePileImpl extends Pile {
  constructor() {
    super();
    this.name = `stock-pile`;
  }

  addToPile(card: PlayingCardImpl) {
    this.getWorldPosition(_pos);
    _pos.z += Z_OFFSET * this._pile.size();
    this._pile.push(card);

    return card.moveTo(_pos);
  }
}
