import { PositionProps } from '@/helpers/props';
import { PileOutline } from './PileOutline';

type FoundationProps = PositionProps & {
  //
};
export const FoundationPile = ({ position }: FoundationProps) => {
  return (
    <object3D position={position}>
      <PileOutline />
    </object3D>
  );
};
