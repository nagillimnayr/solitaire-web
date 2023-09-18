import { PositionProps } from '@/helpers/props';
import { PileOutline } from './PileOutline';

type WasteProps = PositionProps & {
  //
};
export const WastePile = ({ position }: WasteProps) => {
  return (
    <object3D position={position}>
      <PileOutline />
    </object3D>
  );
};
