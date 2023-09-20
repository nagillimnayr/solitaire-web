import { makePlayingCardName } from '@/helpers/playing-card-utils';
import { Euler, Object3D, Vector3 } from 'three';
import { Pile } from '../piles/Pile';
import { PI } from '@/helpers/constants';
import { damp3, dampE } from 'maath/easing';

const SMOOTH_TIME = 0.25;
const Z_OFFSET = 1e-4;

const _pos = new Vector3();

export class PlayingCardImpl extends Object3D {
  private _rank: number;
  private _suit: number;

  private _previousPile: Pile;
  private _currentPile: Pile;

  private _targetPos: Vector3 = new Vector3();
  private _targetRotation: Euler = new Euler();

  private _isFaceUp = false;

  constructor(rank: number, suit: number) {
    super();
    this._rank = rank;
    this._suit = suit;
    this.name = makePlayingCardName(rank, suit);
  }

  update(deltaTime) {
    damp3(this.position, this._targetPos, SMOOTH_TIME, deltaTime);
    dampE(this.rotation, this._targetRotation, SMOOTH_TIME, deltaTime);
  }

  addToPile(pile: Pile, faceUp: boolean = false) {
    this._previousPile = this._currentPile;
    this._currentPile = pile;
    pile.addToPile(this);
    faceUp ? this.flipFaceUp() : this.flipFaceDown();

    pile.getWorldPosition(_pos);
    this.worldToLocal(_pos);
    _pos.z += Z_OFFSET * pile.count;

    this.moveTo(_pos);
  }

  moveTo(newPos: Vector3) {
    this._targetPos.copy(newPos);
  }

  flipFaceUp() {
    this._isFaceUp = true;
    this._targetRotation.y = PI;
  }
  flipFaceDown() {
    this._isFaceUp = false;
    this._targetRotation.y = 0;
  }
}
