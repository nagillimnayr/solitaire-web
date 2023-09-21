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
  private _isMoving = false;
  private _isRotating = false;

  constructor(rank: number, suit: number) {
    super();
    this._rank = rank;
    this._suit = suit;
    this.name = makePlayingCardName(rank, suit);
  }

  update(deltaTime) {
    const isMoving = damp3(
      this.position,
      this._targetPos,
      SMOOTH_TIME,
      deltaTime,
    );
    const isRotating = dampE(
      this.rotation,
      this._targetRotation,
      SMOOTH_TIME,
      deltaTime,
    );
    if (this._isMoving && !isMoving) {
      this.dispatchEvent({ type: 'rest' });
    }
  }

  addToPile(pile: Pile, faceUp: boolean = false) {
    // Don't add to pile if already in pile.
    if (Object.is(pile, this._currentPile)) return;
    this._previousPile = this._currentPile;
    this._currentPile = pile;

    pile.addToPile(this);

    faceUp ? this.flipFaceUp() : this.flipFaceDown();

    pile.getWorldPosition(_pos);
    _pos.z += Z_OFFSET * pile.count;
    return this.moveTo(_pos);
  }

  moveTo(newPos: Vector3) {
    this.dispatchEvent({ type: 'start-move' });
    this._targetPos.copy(newPos);
    this._isMoving = true;

    // Create promise that will be resolved when the 'rest' event is triggered.
    return new Promise<never>((resolve) => {
      const onResolve = () => {
        this.removeEventListener('rest', onResolve);
        this._isMoving = false;
        resolve(null);
      };
      this.addEventListener('rest', onResolve);
    });
  }

  flipFaceUp() {
    this._isFaceUp = true;
    this._targetRotation.y = 0;
  }
  flipFaceDown() {
    this._isFaceUp = false;
    this._targetRotation.y = PI;
  }
}
