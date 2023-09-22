import { Pile } from '@/components/canvas/piles/Pile';
import { PlayingCardImpl } from '@/components/canvas/playing-card/PlayingCardImpl';
import { Z_OFFSET } from '@/helpers/constants';
import { Vector3 } from 'three';

const _pos = new Vector3();

export class CarryPileImpl extends Pile {
  constructor() {
    super();
  }

  addToPile(card: PlayingCardImpl): Promise<never> {
    card.getWorldPosition(_pos);
    this.add(card);
    this.worldToLocal(_pos);
    card.position.copy(_pos);
    _pos.z = Z_OFFSET * this.count;
    this._pile.push(card);
    return card.moveTo(_pos);
  }

  dropCard() {
    const card = this.drawCard();
    card.getWorldPosition(_pos);
    card.removeFromParent();
    card.position.copy(_pos);
    card.addToPile(card.previousPile);
  }
}
