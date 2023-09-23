import { PositionProps } from '@/helpers/props';
import { useContext, useEffect, useMemo, useRef } from 'react';
import { TableauPileImpl } from './TableauPileImpl';
import { Object3DNode, extend } from '@react-three/fiber';
import { GlobalStateContext } from '@/components/dom/providers/GlobalStateProvider';
import { MeshDiscardMaterial } from '@react-three/drei';
import { PileOutline } from '../PileOutline';

extend({ TableauPileImpl });
declare module '@react-three/fiber' {
  interface ThreeElements {
    tableauPileImpl: Object3DNode<TableauPileImpl, typeof TableauPileImpl>;
  }
}

type TableauProps = PositionProps & {
  //
  index: number;
};
export const TableauPile = ({ position, index }: TableauProps) => {
  const { GameActor } = useContext(GlobalStateContext);
  const ref = useRef<TableauPileImpl>(null!);

  /** Assign tableau pile in global context. */
  useEffect(() => {
    const tableauPile = ref.current;
    if (!tableauPile) return;
    GameActor.send({ type: 'ASSIGN_TABLEAU', tableauPile });
  }, [GameActor]);

  const args: [number] = useMemo(() => [index], [index]);
  return (
    <tableauPileImpl ref={ref} args={args} position={position}>
      <MeshDiscardMaterial />
      <PileOutline />
    </tableauPileImpl>
  );
};
