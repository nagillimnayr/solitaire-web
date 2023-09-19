import { PositionProps } from '@/helpers/props';
import { FoundationPile } from './foundation-pile/FoundationPile';
import {
  CARD_WIDTH,
  CARD_WIDTH_HALF_WITH_MARGIN,
  CARD_WIDTH_WITH_MARGIN,
  PILE_X_MARGIN,
  SUITS,
  Suit,
} from '@/helpers/constants';
import { generateUUID } from 'three/src/math/MathUtils';

const FOUNDATION_KEYS = Object.freeze([
  generateUUID(), // 1.
  generateUUID(), // 2.
  generateUUID(), // 3.
  generateUUID(), // 4.
]);
// const START_X_POS = -(CARD_WIDTH + PILE_X_MARGIN);
// const START_X_POS = 0;
const START_X_POS = -CARD_WIDTH_HALF_WITH_MARGIN * 3;

export const Foundations = ({ position }: PositionProps) => {
  return (
    <group position={position}>
      <axesHelper />
      {FOUNDATION_KEYS.map((uuid, index) => (
        <object3D
          key={uuid}
          position-x={START_X_POS + index * CARD_WIDTH_WITH_MARGIN}
        >
          <FoundationPile suit={index as Suit} />
        </object3D>
      ))}
    </group>
  );
};
