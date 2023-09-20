import { PositionProps } from '@/helpers/props';
import { WastePileImpl } from './WastePileImpl';
import { useContext, useEffect, useRef } from 'react';
import { Object3DNode, extend } from '@react-three/fiber';
import { GlobalStateContext } from '@/components/dom/providers/GlobalStateProvider';

extend({ WastePileImpl });
declare module '@react-three/fiber' {
  interface ThreeElements {
    wastePileImpl: Object3DNode<WastePileImpl, typeof WastePileImpl>;
  }
}

type WasteProps = PositionProps & {
  //
};
export const WastePile = ({ position }: WasteProps) => {
  const { GameActor } = useContext(GlobalStateContext);
  const ref = useRef<WastePileImpl>(null!);

  /** Assign waste pile in global context. */
  useEffect(() => {
    const wastePile = ref.current;
    if (!wastePile) return;
    GameActor.send({ type: 'ASSIGN_WASTE', wastePile });
  }, [GameActor]);

  return (
    <object3D position={position}>
      <wastePileImpl ref={ref} />
    </object3D>
  );
};
