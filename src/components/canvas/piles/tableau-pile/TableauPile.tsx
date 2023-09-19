import { PositionProps } from '@/helpers/props';
import { PileOutline } from '../PileOutline';

type TableauProps = PositionProps & {
  //
};
export const TableauPile = ({ position }: TableauProps) => {
  return (
    <object3D position={position}>
      <tableauPileImpl />
    </object3D>
  );
};
