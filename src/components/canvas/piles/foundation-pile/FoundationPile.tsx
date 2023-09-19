import { PositionProps } from '@/helpers/props';
import { FoundationPileImpl } from './foundation-pile';
import { useRef } from 'react';
import { Object3DNode, extend } from '@react-three/fiber';

extend({ FoundationPileImpl });
declare module '@react-three/fiber' {
  interface ThreeElements {
    foundationPileImpl: Object3DNode<
      FoundationPileImpl,
      typeof FoundationPileImpl
    >;
  }
}

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
