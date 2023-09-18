import { BACKGROUND_COLOR } from '@/helpers/constants';
import { Plane } from '@react-three/drei';

const WIDTH = 2;
const HEIGHT = 1;
const Z_OFFSET = -1e-3;

export const Background = () => {
  return (
    <>
      <Plane scale-x={WIDTH} scale-y={HEIGHT} position-z={Z_OFFSET}>
        <meshLambertMaterial color={BACKGROUND_COLOR} />
      </Plane>
    </>
  );
};
