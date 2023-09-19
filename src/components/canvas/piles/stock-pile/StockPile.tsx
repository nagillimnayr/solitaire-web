import { PositionProps } from '@/helpers/props';
import { PileOutline } from '../PileOutline';
import { StockPileImpl } from './stock-pile';
import { useRef } from 'react';

type StockProps = PositionProps & {
  //
};
export const StockPile = ({ position }: StockProps) => {
  const ref = useRef<StockPileImpl>(null!);
  return (
    <object3D position={position}>
      <stockPileImpl ref={ref} />
    </object3D>
  );
};
