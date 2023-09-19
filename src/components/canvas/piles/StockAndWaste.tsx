import { useMemo } from 'react';
import { StockPile } from './stock-pile/StockPile';
import { WastePile } from './waste-pile/WastePile';
import { Vector3 } from 'three';
import {
  CARD_WIDTH_HALF,
  CARD_WIDTH_HALF_WITH_MARGIN,
  CARD_WIDTH_WITH_MARGIN,
  PILE_X_MARGIN,
} from '@/helpers/constants';
import { PositionProps } from '@/helpers/props';

const STOCK_POS = new Vector3(-CARD_WIDTH_HALF_WITH_MARGIN, 0, 0);
const WASTE_POS = new Vector3(CARD_WIDTH_HALF_WITH_MARGIN, 0, 0);

export const StockAndWaste = ({ position }: PositionProps) => {
  return (
    <group position={position}>
      <axesHelper />
      <StockPile position={STOCK_POS} />
      <WastePile position={WASTE_POS} />
    </group>
  );
};
