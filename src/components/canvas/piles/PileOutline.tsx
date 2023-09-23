import {
  CARD_HEIGHT,
  CARD_HEIGHT_WITH_MARGIN,
  CARD_WIDTH,
  CARD_WIDTH_WITH_MARGIN,
  OUTLINE_BORDER_PADDING,
  OUTLINE_BORDER_WIDTH,
} from '@/helpers/constants';
import { PropsWithChildren, useMemo } from 'react';
import { Path, Shape, ShapeGeometry } from 'three';

const WIDTH = CARD_WIDTH + OUTLINE_BORDER_WIDTH + OUTLINE_BORDER_PADDING;
const HEIGHT = CARD_HEIGHT + OUTLINE_BORDER_WIDTH + OUTLINE_BORDER_PADDING;
const HALF_WIDTH = WIDTH / 2;
const HALF_HEIGHT = HEIGHT / 2;
const BORDER_WIDTH = 0.03 * CARD_WIDTH;

const shape = new Shape();
shape.moveTo(HALF_WIDTH + BORDER_WIDTH, HALF_HEIGHT + BORDER_WIDTH); // Top right corner.
shape.lineTo(-(HALF_WIDTH + BORDER_WIDTH), HALF_HEIGHT + BORDER_WIDTH); // Top left corner.
shape.lineTo(-(HALF_WIDTH + BORDER_WIDTH), -(HALF_HEIGHT + BORDER_WIDTH)); // Bottom left corner.
shape.lineTo(HALF_WIDTH + BORDER_WIDTH, -(HALF_HEIGHT + BORDER_WIDTH)); // Bottom right corner.
shape.lineTo(HALF_WIDTH + BORDER_WIDTH, HALF_HEIGHT + BORDER_WIDTH); // Top right corner.

const hole = new Path();
hole.moveTo(HALF_WIDTH, HALF_HEIGHT); // Top right corner.
hole.lineTo(-HALF_WIDTH, HALF_HEIGHT); // Top left corner.
hole.lineTo(-HALF_WIDTH, -HALF_HEIGHT); // Bottom left corner.
hole.lineTo(HALF_WIDTH, -HALF_HEIGHT); // Bottom right corner.
hole.lineTo(HALF_WIDTH, HALF_HEIGHT); // Top right corner.

shape.holes.push(hole);

export const PileOutline = ({ children }: PropsWithChildren) => {
  const geometry = useMemo(() => new ShapeGeometry(shape), []);
  return <mesh geometry={geometry}>{children}</mesh>;
};
