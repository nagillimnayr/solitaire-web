import { PositionProps } from '@/helpers/props';
import { StockPileImpl } from './StockPileImpl';
import { useRef } from 'react';
import { Object3DNode, extend } from '@react-three/fiber';

extend({ StockPileImpl });
declare module '@react-three/fiber' {
  interface ThreeElements {
    stockPileImpl: Object3DNode<StockPileImpl, typeof StockPileImpl>;
  }
}

type StockProps = PositionProps & {
  //
};
export const StockPile = ({ position }: StockProps) => {
  const ref = useRef<StockPileImpl>(null!);
  return (
    <object3D position={position}>
      <stockPileImpl ref={ref} />
    </object3D>
  );
};
