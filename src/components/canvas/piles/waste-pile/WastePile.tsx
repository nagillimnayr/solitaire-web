import { PositionProps } from '@/helpers/props';
import { PileOutline } from '../PileOutline';
import { WastePileImpl } from './waste-pile';
import { useRef } from 'react';

type WasteProps = PositionProps & {
  //
};
export const WastePile = ({ position }: WasteProps) => {
  const ref = useRef<WastePileImpl>(null!);
  return (
    <object3D position={position}>
      <wastePileImpl ref={ref} />
    </object3D>
  );
};
