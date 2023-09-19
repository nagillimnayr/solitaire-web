import { PositionProps } from '@/helpers/props';
import { PileOutline } from '../PileOutline';
import { useRef } from 'react';
import { TableauPileImpl } from './tableau-pile';

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
