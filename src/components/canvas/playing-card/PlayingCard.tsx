'use client';
import { RoundedRect } from '../RoundedRect';
import { CARD_HEIGHT, CARD_WIDTH, RANKS, SUITS } from '@/helpers/constants';
import { PlayingCardMaterial } from './playing-card-shader/PlayingCardMaterial';
import { usePlayingCardTexture } from './usePlayingCardTexture';
import {
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import { useSpring, animated, useSpringRef } from '@react-spring/three';
import { makePlayingCardName } from '@/helpers/playing-card-utils';
import {
  Object3DNode,
  ThreeEvent,
  extend,
  useFrame,
  useThree,
} from '@react-three/fiber';
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
    const getThree = useThree(({ get }) => get);

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
    }));

    useFrame((state, delta) => {
      const card = localRef.current;
      if (!card) return;
      card.update(delta);
    });

    const handlePointerDown = useCallback(
      (event: ThreeEvent<PointerEvent>) => {
        /**  */
        event.stopPropagation();
        const card = localRef.current;
        const intersection = event.point;
        card.isFaceUp
          ? GameActor.send({ type: 'PICKUP_CARD', card, intersection })
          : GameActor.send({ type: 'CLICK_CARD', card });
      },
      [GameActor],
    );
    const handlePointerUp = useCallback((event: ThreeEvent<PointerEvent>) => {
      /**  */
      event.stopPropagation();
      const card = localRef.current;
      console.log('intersections:', event.intersections);
    }, []);
    const handleClick = useCallback(
      (event: ThreeEvent<MouseEvent>) => {
        /**  */
        event.stopPropagation();
        const card = localRef.current;
        GameActor.send({ type: 'CLICK_CARD', card });
      },
      [GameActor],
    );

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
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onClick={handleClick}
      >
        <PlayingCardMaterial frontTexture={frontTexture} />
      </playingCardImpl>
    );
  },
);

PlayingCard.displayName = 'PlayingCard';
export { PlayingCard };
