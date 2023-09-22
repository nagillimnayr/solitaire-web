'use client';
import { RoundedRect } from '../RoundedRect';
import { CARD_HEIGHT, CARD_WIDTH, RANKS, SUITS } from '@/helpers/constants';
import { PlayingCardMaterial } from './playing-card-shader/PlayingCardMaterial';
import { usePlayingCardTexture } from './usePlayingCardTexture';
import {
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import { useSpring, animated, useSpringRef } from '@react-spring/three';
import { makePlayingCardName } from '@/helpers/playing-card-utils';
import { Object3DNode, extend, useFrame } from '@react-three/fiber';
import { CardSpringRef, PlayingCardImpl } from './PlayingCardImpl';
import { GlobalStateContext } from '@/components/dom/providers/GlobalStateProvider';
import { Vector3, Vector3Tuple } from 'three';

extend({ PlayingCardImpl });
declare module '@react-three/fiber' {
  interface ThreeElements {
    playingCardImpl: Object3DNode<PlayingCardImpl, typeof PlayingCardImpl>;
  }
}

const START_X = -(RANKS.length * CARD_WIDTH) / 2;
const START_Y = (Object.keys(SUITS).length * CARD_HEIGHT) / 2;

const RADIUS = CARD_WIDTH * 0.04;

type Vec3 = {
  x: number;
  y: number;
  z: number;
};

type PlayingCardProps = {
  rank: number;
  suit: number;
};
const PlayingCard = forwardRef<PlayingCardImpl, PlayingCardProps>(
  ({ rank, suit }: PlayingCardProps, ref) => {
    const { GameActor } = useContext(GlobalStateContext);

    const frontTexture = usePlayingCardTexture(rank, suit);

    const localRef = useRef<PlayingCardImpl>(null!);
    useImperativeHandle(ref, () => localRef.current);

    useEffect(() => {
      const card = localRef.current;
      GameActor.send({ type: 'INIT_CARD', card });
    }, [GameActor]);

    /** Springs. */
    const [spring, springRef] = useSpring(() => ({
      x: 0,
      y: 0,
      z: 0,
      rotation: 0,
      onChange: (result, spring) => {
        const { x, y, z } = result.value as Vec3;
        const rotation = result.value.rotation as number;

        const card = localRef.current;

        rotation && (card.rotation.y = rotation);
        card.position.set(x, y, z);
      },
      // onChange: {
      //   position: (result, spring) => {

      //     const position = result.value as Vector3Tuple;
      //     const card = localRef.current;
      //     // card.position.set(...position);
      //   },
      //   rotation: (result, spring) => {
      //     if (typeof result !== 'number') return;
      //     const card = localRef.current;
      //     card.rotation.y = result;
      //   },
      // },
    }));

    useFrame((state, delta) => {
      const card = localRef.current;
      if (!card) return;
      card.update(delta);
    });

    const userData = useMemo(() => ({ rank, suit }), [rank, suit]);
    const name = makePlayingCardName(rank, suit);
    const args: [number, number] = useMemo(() => [rank, suit], [rank, suit]);

    return (
      <playingCardImpl
        args={args}
        ref={localRef}
        name={name}
        userData={userData}
        springRef={springRef}
      >
        <RoundedRect width={CARD_WIDTH} height={CARD_HEIGHT} radius={RADIUS}>
          <PlayingCardMaterial frontTexture={frontTexture} />
        </RoundedRect>
      </playingCardImpl>
    );
  },
);

PlayingCard.displayName = 'PlayingCard';
export { PlayingCard };
