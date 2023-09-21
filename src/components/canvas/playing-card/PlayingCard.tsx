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
import { useSpring, animated } from '@react-spring/three';
import { makePlayingCardName } from '@/helpers/playing-card-utils';
import { Object3DNode, extend, useFrame } from '@react-three/fiber';
import { PlayingCardImpl } from './PlayingCardImpl';
import { GlobalStateContext } from '@/components/dom/providers/GlobalStateProvider';
import { Vector3 } from 'three';

extend({ PlayingCardImpl });
declare module '@react-three/fiber' {
  interface ThreeElements {
    playingCardImpl: Object3DNode<PlayingCardImpl, typeof PlayingCardImpl>;
  }
}

const START_X = -(RANKS.length * CARD_WIDTH) / 2;
const START_Y = (Object.keys(SUITS).length * CARD_HEIGHT) / 2;

const RADIUS = CARD_WIDTH * 0.04;

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
