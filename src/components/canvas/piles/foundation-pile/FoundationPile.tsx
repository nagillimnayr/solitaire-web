import { PositionProps } from '@/helpers/props';
import { PileOutline } from '../PileOutline';
import { FoundationPileImpl } from './foundation-pile';
import { useRef } from 'react';

type FoundationProps = PositionProps & {
  //
};
export const FoundationPile = ({ position }: FoundationProps) => {
  const ref = useRef<FoundationPileImpl>(null!);
  return (
    <object3D position={position}>
      <foundationPileImpl ref={ref} />
    </object3D>
  );
};
