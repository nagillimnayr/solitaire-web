import { useTexture } from '@react-three/drei';
import { Suit } from './PlayingCard';
import { RANKS, SUITS } from '@/helpers/constants';

export function usePlayingCardTexture(rank: number, suit: number) {
  const texture = useTexture(
    `textures/kenney/card${SUITS[suit]}${RANKS[rank]}.png`,
  );
  return texture;
}
