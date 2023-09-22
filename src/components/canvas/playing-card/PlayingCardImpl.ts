import { makePlayingCardName } from '@/helpers/playing-card-utils';
import { Euler, Object3D, Vector3, Vector3Tuple } from 'three';
import { Pile } from '../piles/Pile';
import {
  CARD_HEIGHT,
  CARD_WIDTH,
  CARD_WIDTH_HALF,
  PI,
  PI_2,
  PI_OVER_2,
  SMOOTH_TIME,
  Z_OFFSET,
} from '@/helpers/constants';
import { damp, damp3, dampE } from 'maath/easing';
import { SpringRef } from '@react-spring/three';

const _pos = new Vector3();
const DISTANCE_THRESHOLD = 0.001;

export type CardSpringRef = SpringRef<{
  x: number;
  y: number;
  z: number;
  rotation: number;
}>;

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

  private _springRef: CardSpringRef = null!;

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

  get springRef() {
    return this._springRef;
  }
  set springRef(springRef: CardSpringRef) {
    this._springRef = springRef;
  }

  update(deltaTime) {
    // const isMoving = damp3(
    //   this.position,
    //   this._targetPos,
    //   SMOOTH_TIME,
    //   deltaTime,
    // );

    // const isRotating = dampE(
    //   this.rotation,
    //   this._targetRotation,
    //   SMOOTH_TIME,
    //   deltaTime,
    // );
    if (this.position.distanceTo(this._targetPos) < DISTANCE_THRESHOLD) {
      this.dispatchEvent({ type: 'REST' });
    }
  }

  addToPile(pile: Pile, faceUp: boolean = false) {
    if (!Object.is(pile, this._currentPile)) {
      this._previousPile = this._currentPile;
      this._currentPile = pile;
    }
    // Call pile.addToPile() first so that targetPos will be updated before flipping the card.
    const promise = pile.addToPile(this);
    faceUp ? this.flipFaceUp() : this.flipFaceDown();

    return promise;
  }

  moveTo(newPos: Vector3) {
    // console.log('moveTo:', newPos.toArray());
    this.dispatchEvent({ type: 'START_MOVE' });
    // this.position.z += newPos.z;
    this._targetPos.copy(newPos);
    this._isMoving = true;
    const [x, y, z] = newPos.toArray();
    this._springRef.start({ x, y, z });

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

    this._springRef.start({
      to: [
        { z: this._targetPos.z + CARD_WIDTH_HALF },
        { z: this._targetPos.z },
      ],
    });

    this._springRef.start({ rotation: PI_2 });
  }
  flipFaceDown() {
    if (!this._isFaceUp) return;
    this._isFaceUp = false;

    this._springRef.start({
      to: [
        { z: this._targetPos.z + CARD_WIDTH_HALF },
        { z: this._targetPos.z },
      ],
    });
    this._springRef.start({ rotation: PI });
  }
}
