import { PositionProps } from '@/helpers/props';
import { PileOutline } from './PileOutline';

type StockProps = PositionProps & {
  //
};
export const StockPile = ({ position }: StockProps) => {
  return (
    <object3D position={position}>
      <PileOutline />
    </object3D>
  );
};
