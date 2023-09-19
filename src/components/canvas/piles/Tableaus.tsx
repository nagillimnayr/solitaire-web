import { Vector3 } from 'three';
import { generateUUID } from 'three/src/math/MathUtils';
import { TableauPile } from './tableau-pile/TableauPile';
import {
  CARD_WIDTH,
  CARD_WIDTH_HALF_WITH_MARGIN,
  CARD_WIDTH_WITH_MARGIN,
  PILE_X_MARGIN,
} from '@/helpers/constants';
import { PositionProps } from '@/helpers/props';

const TABLEAU_KEYS = Object.freeze([
  generateUUID(), // 1.
  generateUUID(), // 2.
  generateUUID(), // 3.
  generateUUID(), // 4.
  generateUUID(), // 5.
  generateUUID(), // 6.
  generateUUID(), // 7.
]);
// const START_X_POS = -((CARD_WIDTH + PILE_X_MARGIN / 2) * 6) / 2;
const START_X_POS = -CARD_WIDTH_HALF_WITH_MARGIN * 4;

type TableausProps = PositionProps;
export const Tableaus = ({ position }: PositionProps) => {
  return (
    <group position={position}>
      {TABLEAU_KEYS.map((uuid, index) => (
        <object3D
          key={uuid}
          position-x={START_X_POS + index * CARD_WIDTH_WITH_MARGIN}
        >
          <TableauPile />
        </object3D>
      ))}
    </group>
  );
};
