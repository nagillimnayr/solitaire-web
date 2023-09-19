import { useMemo } from 'react';
import { StockPile } from './stock-pile/StockPile';
import { WastePile } from './waste-pile/WastePile';
import { Vector3 } from 'three';
import { CARD_WIDTH_HALF, PILE_X_OFFSET } from '@/helpers/constants';
import { PositionProps } from '@/helpers/props';

export const StockAndWaste = ({ position }: PositionProps) => {
  const [stockPos, wastePos] = useMemo(
    () => [new Vector3(-PILE_X_OFFSET, 0, 0), new Vector3(PILE_X_OFFSET, 0, 0)],
    [],
  );
  return (
    <group position={position}>
      <StockPile position={stockPos} />
      <WastePile position={wastePos} />
    </group>
  );
};
