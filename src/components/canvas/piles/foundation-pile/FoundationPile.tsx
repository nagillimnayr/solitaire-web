import { PositionProps } from '@/helpers/props';
import { FoundationPileImpl } from './FoundationPileImpl';
import { useMemo, useRef } from 'react';
import { Object3DNode, extend } from '@react-three/fiber';
import { ICON_MATERIAL, Suit } from '@/helpers/constants';
import { Center, Svg } from '@react-three/drei';
import { GlobalStateContext } from '@/components/dom/providers/GlobalStateProvider';

extend({ FoundationPileImpl });
declare module '@react-three/fiber' {
  interface ThreeElements {
    foundationPileImpl: Object3DNode<
      FoundationPileImpl,
      typeof FoundationPileImpl
    >;
  }
}

const SVG_URLS = [
  '/svg/MdiCardsDiamond.svg',
  '/svg/MdiCardsClub.svg',
  '/svg/MdiCardsHeart.svg',
  '/svg/MdiCardsSpade.svg',
];
const ICON_SCALE = 0.001;

type FoundationProps = PositionProps & {
  suit: Suit;
};
export const FoundationPile = ({ position, suit }: FoundationProps) => {
  const ref = useRef<FoundationPileImpl>(null!);
  const args: [Suit] = useMemo(() => [suit], [suit]);
  return (
    <object3D position={position}>
      <foundationPileImpl ref={ref} args={args} />
      <Center>
        <Svg
          src={SVG_URLS[suit]}
          fillMaterial={ICON_MATERIAL}
          scale={ICON_SCALE}
        />
      </Center>
    </object3D>
  );
};
