import { useTexture } from '@react-three/drei';
import { RoundedRect } from '../RoundedRect';
import { CARD_HEIGHT, CARD_WIDTH } from '@/helpers/constants';
import { PlayingCardMaterial } from './playing-card-shader/PlayingCardMaterial';
import { usePlayingCardTexture } from './usePlayingCardTexture';

export enum Suit {
  Diamonds,
  Clubs,
  Hearts,
  Spades,
}

export const PlayingCard = () => {
  // const frontTexture = useTexture('textures/kenney/cardClubsA.png');
  const frontTexture = usePlayingCardTexture(1, Suit.Hearts);

  const radius = CARD_WIDTH * 0.05;
  return (
    <>
      <RoundedRect width={CARD_WIDTH} height={CARD_HEIGHT} radius={radius}>
        <PlayingCardMaterial frontTexture={frontTexture} />
      </RoundedRect>
    </>
  );
};
