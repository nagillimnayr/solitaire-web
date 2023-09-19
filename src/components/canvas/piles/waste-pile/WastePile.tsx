import { PositionProps } from '@/helpers/props';
import { WastePileImpl } from './WastePileImpl';
import { useRef } from 'react';
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
  const ref = useRef<WastePileImpl>(null!);
  return (
    <object3D position={position}>
      <wastePileImpl ref={ref} />
    </object3D>
  );
};
