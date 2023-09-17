import { useTexture } from '@react-three/drei';
import { RoundedRect } from '../RoundedRect';

const ASPECT_RATIO = 655 / 930;

export const PlayingCard = () => {
  const [frontTexture, backTexture] = useTexture([
    'textures/kenney/cardClubsA.png',
    'textures/kenney/cardBack_red2.png',
  ]);
  const height = 2;
  const width = height * ASPECT_RATIO;
  const radius = width * 0.05;
  return (
    <>
      <object3D>
        <object3D>
          <RoundedRect width={width} height={height} radius={radius}>
            <meshBasicMaterial map={frontTexture} />
          </RoundedRect>
        </object3D>
        <object3D rotation-y={Math.PI}>
          <RoundedRect width={width} height={height} radius={radius}>
            <meshBasicMaterial map={backTexture} />
          </RoundedRect>
        </object3D>
      </object3D>
    </>
  );
};
