import { Stack } from '@datastructures-js/stack';
import {
  Mesh,
  Object3D,
  Path,
  PlaneGeometry,
  Shape,
  ShapeGeometry,
} from 'three';
import { PlayingCardImpl } from '../playing-card/PlayingCardImpl';
import {
  CARD_HEIGHT,
  CARD_WIDTH,
  OUTLINE_BORDER_PADDING,
  OUTLINE_BORDER_WIDTH,
} from '@/helpers/constants';

export abstract class Pile extends Mesh {
  protected _pile: Stack<PlayingCardImpl> = new Stack<PlayingCardImpl>();

  constructor() {
    super(
      new PlaneGeometry(
        CARD_WIDTH + OUTLINE_BORDER_WIDTH + OUTLINE_BORDER_PADDING,
        CARD_HEIGHT + OUTLINE_BORDER_WIDTH + OUTLINE_BORDER_PADDING,
      ),
    );
  }

  abstract addToPile(card: PlayingCardImpl): Promise<never>;

  get count() {
    return this._pile.size();
  }

  isEmpty() {
    return this._pile.isEmpty();
  }
  peek() {
    return this._pile.isEmpty() ? null : this._pile.peek();
  }
  drawCard() {
    if (this._pile.isEmpty()) return null;
    return this._pile.pop();
  }
}
