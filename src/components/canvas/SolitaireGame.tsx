import { Background } from './Background';
import { PileOutline } from './piles/PileOutline';
import { PlayingCard } from './playing-card/PlayingCard';

export const SolitaireGame = () => {
  return (
    <group>
      <Background />
      <PlayingCard />
      <PileOutline />
    </group>
  );
};
