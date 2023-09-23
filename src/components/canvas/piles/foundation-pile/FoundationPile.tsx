import { useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { ThreeEvent } from '@react-three/fiber';
import { ICON_MATERIAL, Suit } from '@/helpers/constants';
import { Center, MeshDiscardMaterial, Svg } from '@react-three/drei';
import { GlobalStateContext } from '@/components/dom/providers/GlobalStateProvider';
import { PileOutline } from '../PileOutline';
import { PositionProps } from '@/helpers/props';
import { FoundationPileImpl } from './FoundationPileImpl';
import { Object3DNode, extend } from '@react-three/fiber';

const dummyFn = () => {
  return;
};

extend({ FoundationPileImpl });
declare module '@react-three/fiber' {
  interface ThreeElements {
    foundationPileImpl: Object3DNode<
      FoundationPileImpl,
      typeof FoundationPileImpl
    >;
  }
}

export const SVG_URLS = [
  '/svg/MdiCardsDiamond.svg',
  '/svg/MdiCardsClub.svg',
  '/svg/MdiCardsHeart.svg',
  '/svg/MdiCardsSpade.svg',
];
export const ICON_SCALE = 0.001;

export type FoundationProps = PositionProps & {
  suit: Suit;
};

export const FoundationPile = ({ position, suit }: FoundationProps) => {
  const { GameActor } = useContext(GlobalStateContext);
  const ref = useRef<FoundationPileImpl>(null!);

  /** Assign foundation pile in global context. */
  useEffect(() => {
    const foundationPile = ref.current;
    if (!foundationPile) return;
    GameActor.send({ type: 'ASSIGN_FOUNDATION', foundationPile });
  }, [GameActor]);

  const handlePointerUp = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      event.stopPropagation();
      const foundationPile = ref.current;
      console.log(`foundation ${suit}! Pointer up!`);
      GameActor.send({ type: 'PLACE_CARD_FOUNDATION', foundationPile });
    },
    [GameActor, suit],
  );
  const handlePointerDown = useCallback((event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    const pile = ref.current;
  }, []);
  const handlePointerEnter = useCallback((event: ThreeEvent<PointerEvent>) => {
    // event.stopPropagation();
    const pile = ref.current;
  }, []);

  const args: [Suit] = useMemo(() => [suit], [suit]);
  return (
    <foundationPileImpl
      ref={ref}
      args={args}
      position={position}
      onPointerUp={handlePointerUp}
      onPointerDown={handlePointerDown}
      // onPointerEnter={handlePointerEnter}
    >
      <MeshDiscardMaterial />
      <PileOutline />
      <Center onCentered={dummyFn}>
        <Svg
          src={SVG_URLS[suit]}
          fillMaterial={ICON_MATERIAL}
          scale={ICON_SCALE}
        />
      </Center>
    </foundationPileImpl>
  );
};
