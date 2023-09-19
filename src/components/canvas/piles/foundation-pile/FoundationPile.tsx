import { PositionProps } from '@/helpers/props';
import { FoundationPileImpl } from './FoundationPileImpl';
import { useMemo, useRef } from 'react';
import { Object3DNode, extend } from '@react-three/fiber';
import { Suit } from '@/helpers/constants';

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
  suit: Suit;
};
export const FoundationPile = ({ position, suit }: FoundationProps) => {
  const ref = useRef<FoundationPileImpl>(null!);
  const args: [Suit] = useMemo(() => [suit], [suit]);
  return (
    <object3D position={position}>
      <foundationPileImpl ref={ref} args={args} />
    </object3D>
  );
};
