import { PositionProps } from '@/helpers/props';
import { CarryPileImpl } from './CarryPileImpl';
import { useContext, useEffect, useMemo, useRef } from 'react';
import { Object3DNode, extend, useFrame } from '@react-three/fiber';
import { GlobalStateContext } from '@/components/dom/providers/GlobalStateProvider';
import { Plane, Vector3 } from 'three';
import { Ring } from '@react-three/drei';
import { PI } from '@/helpers/constants';

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

  /** Assign stock pile in global context. */
  useEffect(() => {
    const carryPile = ref.current;
    if (!carryPile) return;
    GameActor.send({ type: 'ASSIGN_CARRY_PILE', carryPile });
  }, [GameActor]);

  const plane = useMemo(() => {
    return new Plane(new Vector3(0, 0, -1), 0.1);
  }, []);

  useFrame(({ pointer, raycaster, camera }, delta) => {
    const carryPile = ref.current;
    // carryPile.position.set(pointer.x, pointer.y, 0.02);
    raycaster.setFromCamera(pointer, camera);
    if (raycaster.ray.intersectPlane(plane, _pos)) {
      carryPile.position.copy(_pos);
    }
  });

  return (
    <object3D>
      <carryPileImpl ref={ref}>
        <axesHelper rotation-y={PI} />
        <Ring args={[0.9, 1]} scale={0.01} />
      </carryPileImpl>
    </object3D>
  );
};
