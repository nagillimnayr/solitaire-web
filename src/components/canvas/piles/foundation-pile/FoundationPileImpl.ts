import { Pile } from '@/components/canvas/piles/Pile';
import { PlayingCardImpl } from '@/components/canvas/playing-card/PlayingCardImpl';
import { SUITS, Suit } from '@/helpers/constants';
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
    this._pile.push(card);
  }
}
