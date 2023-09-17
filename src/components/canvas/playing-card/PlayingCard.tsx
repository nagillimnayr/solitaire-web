import { useTexture } from '@react-three/drei';
import { RoundedRect } from '../RoundedRect';

const ASPECT_RATIO = 655 / 930;

export const PlayingCard = () => {
  const texture = useTexture('textures/playing-cards/Hearts_A_white.png');
  const height = 2;
  const width = height * ASPECT_RATIO;
  const radius = width * 0.1;
  return (
    <>
      <RoundedRect width={width} height={height} radius={radius}>
        <meshBasicMaterial map={texture} />
      </RoundedRect>
    </>
  );
};
