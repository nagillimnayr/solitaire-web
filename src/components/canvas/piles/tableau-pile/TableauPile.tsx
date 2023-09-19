import { PositionProps } from '@/helpers/props';
import { useRef } from 'react';
import { TableauPileImpl } from './tableau-pile';
import { Object3DNode, extend } from '@react-three/fiber';

extend({ TableauPileImpl });
declare module '@react-three/fiber' {
  interface ThreeElements {
    tableauPileImpl: Object3DNode<TableauPileImpl, typeof TableauPileImpl>;
  }
}

type TableauProps = PositionProps & {
  //
};
export const TableauPile = ({ position }: TableauProps) => {
  const ref = useRef<TableauPileImpl>(null!);
  return (
    <object3D position={position}>
      <tableauPileImpl />
    </object3D>
  );
};
