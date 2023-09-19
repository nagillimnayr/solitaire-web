import { useTexture } from '@react-three/drei';
import { Suit } from './PlayingCard';
import { CARD_TEXTURE_URLS } from '@/helpers/constants';

const RANKS = Object.freeze([
  'A',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  'J',
  'Q',
  'K',
]);

export function usePlayingCardTexture(rank: number, suit: Suit) {
  const textures = useTexture(CARD_TEXTURE_URLS);

  const index = rank - 1 + suit * RANKS.length;
  return textures[index];
}
