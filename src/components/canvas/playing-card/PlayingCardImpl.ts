import { makePlayingCardName } from '@/helpers/playing-card-utils';
import { Euler, Object3D, Vector3 } from 'three';
import { Pile } from '../piles/Pile';
import {
  CARD_HEIGHT,
  CARD_WIDTH,
  PI,
  SMOOTH_TIME,
  Z_OFFSET,
} from '@/helpers/constants';
import { damp, damp3, dampE } from 'maath/easing';

const _pos = new Vector3();
const DISTANCE_THRESHOLD = 0.001;

export class PlayingCardImpl extends Object3D {
  private _rank: number;
  private _suit: number;

  private _previousPile: Pile;
  private _currentPile: Pile;

  private _targetPos: Vector3 = new Vector3();
  private _targetRotation: Euler = new Euler();

  private _isFaceUp = true;
  private _isMoving = false;
  private _isRotating = false;

  constructor(rank: number, suit: number) {
    super();
    this._rank = rank;
    this._suit = suit;
    this.name = makePlayingCardName(rank, suit);
  }

  get isFaceUp() {
    return this._isFaceUp;
  }
  get currentPile() {
    return this._currentPile;
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
    if (this.position.distanceTo(this._targetPos) < DISTANCE_THRESHOLD) {
      this.dispatchEvent({ type: 'REST' });
    }
  }

  addToPile(pile: Pile, faceUp: boolean = false) {
    // Don't add to pile if already in pile.
    if (Object.is(pile, this._currentPile)) return;
    this._previousPile = this._currentPile;
    this._currentPile = pile;

    faceUp ? this.flipFaceUp() : this.flipFaceDown();

    // pile.getWorldPosition(_pos);
    // _pos.z += Z_OFFSET * pile.count;
    return pile.addToPile(this);
  }

  moveTo(newPos: Vector3) {
    this.dispatchEvent({ type: 'START_MOVE' });
    this.position.z += newPos.z * 2;
    this._targetPos.copy(newPos);
    this._isMoving = true;

    // Create promise that will be resolved when the 'rest' event is triggered.
    return new Promise<never>((resolve) => {
      const onResolve = () => {
        this.removeEventListener('REST', onResolve);
        this._isMoving = false;
        resolve(null);
      };

      this.addEventListener('REST', onResolve);
    });
  }

  flipFaceUp() {
    if (this._isFaceUp) return;
    this._isFaceUp = true;
    this._targetRotation.y = 0;
    /** Move up in Z axis when flipping to avoid clipping. */
    this.position.z += CARD_HEIGHT;
  }
  flipFaceDown() {
    if (!this._isFaceUp) return;
    this._isFaceUp = false;
    this._targetRotation.y = PI;
    /** Move up in Z axis when flipping to avoid clipping. */
    this.position.z += CARD_HEIGHT;
  }
}
