import { useTexture } from '@react-three/drei';
import { RoundedRect } from '../RoundedRect';
import { CARD_HEIGHT, CARD_WIDTH } from '@/helpers/constants';

const Z_OFFSET = 1e-4;

export const PlayingCard = () => {
  const [frontTexture, backTexture] = useTexture([
    'textures/kenney/cardClubsA.png',
    'textures/kenney/cardBack_red2.png',
  ]);

  const radius = CARD_WIDTH * 0.05;
  return (
    <>
      <object3D>
        <object3D>
          <RoundedRect width={CARD_WIDTH} height={CARD_HEIGHT} radius={radius}>
            <meshLambertMaterial map={frontTexture} />
          </RoundedRect>
        </object3D>
        <object3D rotation-y={Math.PI} position-z={Z_OFFSET}>
          <RoundedRect width={CARD_WIDTH} height={CARD_HEIGHT} radius={radius}>
            <meshLambertMaterial map={backTexture} />
          </RoundedRect>
        </object3D>
      </object3D>
    </>
  );
};
