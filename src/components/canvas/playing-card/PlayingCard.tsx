import { useTexture } from '@react-three/drei';
import { RoundedRect } from '../RoundedRect';
import { CARD_HEIGHT, CARD_WIDTH } from '@/helpers/constants';
import { PlayingCardMaterial } from './playing-card-shader/PlayingCardMaterial';

export const PlayingCard = () => {
  const frontTexture = useTexture('textures/kenney/cardClubsA.png');

  const radius = CARD_WIDTH * 0.05;
  return (
    <>
      <RoundedRect width={CARD_WIDTH} height={CARD_HEIGHT} radius={radius}>
        <PlayingCardMaterial frontTexture={frontTexture} />
      </RoundedRect>
    </>
  );
};
