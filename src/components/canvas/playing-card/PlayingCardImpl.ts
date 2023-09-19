import { makePlayingCardName } from '@/helpers/playing-card-utils';
import { Object3D } from 'three';
import { PileImpl } from '../piles/PileImpl';

export class PlayingCardImpl extends Object3D {
  private _rank: number;
  private _suit: number;

  private _previousPile: PileImpl;
  private _currentPile: PileImpl;

  constructor(rank: number, suit: number) {
    super();
    this._rank = rank;
    this._suit = suit;
    this.name = makePlayingCardName(rank, suit);
  }

  addToPile(pile: PileImpl) {
    this._previousPile = this._currentPile;
    this._currentPile = pile;
  }
}
