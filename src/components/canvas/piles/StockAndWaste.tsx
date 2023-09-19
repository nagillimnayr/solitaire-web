import { useMemo } from 'react';
import { StockPile } from './stock-pile/StockPile';
import { WastePile } from './waste-pile/WastePile';
import { Vector3 } from 'three';
import { CARD_WIDTH_HALF, PILE_X_OFFSET } from '@/helpers/constants';
import { PositionProps } from '@/helpers/props';

const STOCK_POS = new Vector3(-PILE_X_OFFSET, 0, 0);
const WASTE_POS = new Vector3(PILE_X_OFFSET, 0, 0);

export const StockAndWaste = ({ position }: PositionProps) => {
  return (
    <group position={position}>
      <StockPile position={STOCK_POS} />
      <WastePile position={WASTE_POS} />
    </group>
  );
};
