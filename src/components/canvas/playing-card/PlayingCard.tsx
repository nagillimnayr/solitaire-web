import { useTexture } from '@react-three/drei';
import { RoundedRect } from '../RoundedRect';
import { CARD_HEIGHT, CARD_WIDTH, RANKS, SUITS } from '@/helpers/constants';
import { PlayingCardMaterial } from './playing-card-shader/PlayingCardMaterial';
import { usePlayingCardTexture } from './usePlayingCardTexture';
import { PositionProps } from '@/helpers/props';

export enum Suit {
  Diamonds,
  Clubs,
  Hearts,
  Spades,
}

const START_X = -(RANKS.length * CARD_WIDTH) / 2;
const START_Y = (SUITS.length * CARD_HEIGHT) / 2;

type PlayingCardProps = {
  rank: number;
  suit: number;
};
export const PlayingCard = ({ rank, suit }: PlayingCardProps) => {
  // const frontTexture = useTexture('textures/kenney/cardClubsA.png');
  const frontTexture = usePlayingCardTexture(rank, suit);

  const radius = CARD_WIDTH * 0.0;
  return (
    <>
      <object3D
        position-x={START_X + CARD_WIDTH * rank}
        position-y={START_Y - CARD_HEIGHT * suit}
      >
        <RoundedRect width={CARD_WIDTH} height={CARD_HEIGHT} radius={radius}>
          <PlayingCardMaterial frontTexture={frontTexture} />
        </RoundedRect>
      </object3D>
    </>
  );
};
