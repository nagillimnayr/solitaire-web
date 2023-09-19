import { makePlayingCardName } from '@/helpers/playing-card-utils';
import { Object3D } from 'three';
import { Pile } from '../piles/Pile';

export class PlayingCardImpl extends Object3D {
  private _rank: number;
  private _suit: number;

  private _previousPile: Pile;
  private _currentPile: Pile;

  private _isFaceUp = false;

  constructor(rank: number, suit: number) {
    super();
    this._rank = rank;
    this._suit = suit;
    this.name = makePlayingCardName(rank, suit);
  }

  addToPile(pile: Pile, faceUp: boolean = false) {
    this._previousPile = this._currentPile;
    this._currentPile = pile;
    pile.addToPile(this);
    this._isFaceUp = faceUp;
  }
}
