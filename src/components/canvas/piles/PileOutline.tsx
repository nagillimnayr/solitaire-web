import { CARD_HEIGHT, CARD_WIDTH } from '@/helpers/constants';
import { Path, Shape, ShapeGeometry } from 'three';

const PADDING = CARD_WIDTH * 0.02;
const WIDTH = CARD_WIDTH + PADDING;
const HEIGHT = CARD_HEIGHT + PADDING;
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

const outlineGeometry = new ShapeGeometry(shape);

export const PileOutline = () => {
  return (
    <>
      <mesh geometry={outlineGeometry}></mesh>
    </>
  );
};
