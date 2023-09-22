import { Pile } from '@/components/canvas/piles/Pile';
import { PlayingCardImpl } from '@/components/canvas/playing-card/PlayingCardImpl';
import { Z_OFFSET } from '@/helpers/constants';
import { Vector3 } from 'three';

const _pos1 = new Vector3();
const _pos2 = new Vector3();
const _pos3 = new Vector3();

export class CarryPileImpl extends Pile {
  constructor() {
    super();
  }

  addToPile(card: PlayingCardImpl): Promise<never> {
    card.getWorldPosition(_pos1);
    this.attach(card);

    card.getWorldPosition(_pos1);

    _pos3.copy(card.position);
    _pos3.z = Z_OFFSET * this.count;
    this._pile.push(card);
    _pos2.set(0, 0, 0);
    return card.moveTo(card.position);
    // return card.moveTo(_pos2);
  }

  dropCard() {
    const card = this.drawCard();

    card.getWorldPosition(_pos1);
    this.getWorldPosition(_pos2);
    _pos3.subVectors(_pos1, _pos2);

    this.parent?.attach(card);

    // card.position.copy(_pos3);

    card.addToPile(card.previousPile, true);
  }
}
