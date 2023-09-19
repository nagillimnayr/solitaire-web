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
import { makePlayingCardName } from '@/helpers/playing-card-utils';
import { Object3DNode, extend } from '@react-three/fiber';
import { PlayingCardImpl } from './PlayingCardImpl';
import { GlobalStateContext } from '@/components/dom/providers/GlobalStateProvider';

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

    const metaData = useMemo(() => ({ rank, suit }), [rank, suit]);
    const args: [number, number] = useMemo(() => [rank, suit], [rank, suit]);
    const name = makePlayingCardName(rank, suit);

    useEffect(() => {
      const subscription = GameActor.subscribe((state) => {
        if (state.event.type !== 'RESTART') return;
        const card = localRef.current;
        const { stockPile } = state.context;
        card.addToPile(stockPile);
      });

      // Cleanup.
      return () => subscription.unsubscribe();
    }, [GameActor]);

    return (
      <>
        <playingCardImpl
          args={args}
          position-x={START_X + CARD_WIDTH * rank}
          position-y={START_Y - CARD_HEIGHT * suit}
          ref={localRef}
          name={name}
          userData={metaData}
        >
          <RoundedRect width={CARD_WIDTH} height={CARD_HEIGHT} radius={RADIUS}>
            <PlayingCardMaterial frontTexture={frontTexture} />
          </RoundedRect>
        </playingCardImpl>
      </>
    );
  },
);

PlayingCard.displayName = 'PlayingCard';
export { PlayingCard };
