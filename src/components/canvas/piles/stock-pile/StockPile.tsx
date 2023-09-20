import { PositionProps } from '@/helpers/props';
import { StockPileImpl } from './StockPileImpl';
import { useContext, useEffect, useRef } from 'react';
import { Object3DNode, extend } from '@react-three/fiber';
import { GlobalStateContext } from '@/components/dom/providers/GlobalStateProvider';

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
  const { GameActor } = useContext(GlobalStateContext);
  const ref = useRef<StockPileImpl>(null!);

  /** Assign stock pile in global context. */
  useEffect(() => {
    const stockPile = ref.current;
    if (!stockPile) return;
    GameActor.send({ type: 'ASSIGN_STOCK', stockPile });
  }, [GameActor]);

  return (
    <object3D position={position}>
      <stockPileImpl ref={ref} />
    </object3D>
  );
};
