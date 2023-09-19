import { PositionProps } from '@/helpers/props';
import { FoundationPile } from './foundation-pile/FoundationPile';

export const Foundations = ({ position }: PositionProps) => {
  return (
    <group position={position}>
      <FoundationPile suit={0} />
    </group>
  );
};
