import { PositionProps } from '@/helpers/props';
import { CarryPileImpl } from './CarryPileImpl';
import { useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { Object3DNode, extend, useFrame, useThree } from '@react-three/fiber';
import { GlobalStateContext } from '@/components/dom/providers/GlobalStateProvider';
import { Plane, Vector3 } from 'three';
import { MeshDiscardMaterial, Ring } from '@react-three/drei';
import { PI, Z_AXIS_NEG } from '@/helpers/constants';
import { useEventListener } from 'usehooks-ts';

const _pos = new Vector3();

extend({ CarryPileImpl });
declare module '@react-three/fiber' {
  interface ThreeElements {
    carryPileImpl: Object3DNode<CarryPileImpl, typeof CarryPileImpl>;
  }
}

type CarryPileProps = PositionProps & {
  //
};
export const CarryPile = ({}: CarryPileProps) => {
  const { GameActor } = useContext(GlobalStateContext);
  const ref = useRef<CarryPileImpl>(null!);
  const getThree = useThree(({ get }) => get);

  /** Assign stock pile in global context. */
  useEffect(() => {
    const carryPile = ref.current;
    if (!carryPile) return;
    GameActor.send({ type: 'ASSIGN_CARRY_PILE', carryPile });
  }, [GameActor]);

  const plane = useMemo(() => {
    return new Plane(new Vector3(0, 0, -1), 0.1);
  }, []);

  const updatePosition = useCallback(() => {
    const { pointer, raycaster, camera } = getThree();
    const carryPile = ref.current;

    /** To avoid weird issues with the cards still following the mouse while being dropped, don't follow the mouse if in the dropping state. */
    const state = GameActor.getSnapshot()!;
    if (state.matches('droppingCards') || state.matches('autoPlaying')) return;

    raycaster.setFromCamera(pointer, camera);
    if (raycaster.ray.intersectPlane(plane, _pos)) {
      carryPile.position.copy(_pos);
    }
  }, [GameActor, getThree, plane]);

  useEventListener('mousemove', updatePosition);

  return (
    <carryPileImpl ref={ref}>
      <MeshDiscardMaterial />
      {/* <axesHelper rotation-y={PI} /> */}
      {/* <arrowHelper args={[Z_AXIS_NEG]} /> */}
      <Ring
        args={[0.9, 1]}
        scale={0.01}
        position-z={1e-3}
        material-color={'white'}
      />
    </carryPileImpl>
  );
};
