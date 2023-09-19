import { makePlayingCardName } from '@/helpers/playing-card-utils';
import { Object3D } from 'three';

export class PlayingCardImpl extends Object3D {
  private _rank: number;
  private _suit: number;

  constructor(rank: number, suit: number) {
    super();
    this._rank = rank;
    this._suit = suit;
    this.name = makePlayingCardName(rank, suit);
  }
}
