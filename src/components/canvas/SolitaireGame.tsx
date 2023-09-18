import { Background } from './Background';
import { PlayingCard } from './playing-card/PlayingCard';

export const SolitaireGame = () => {
  return (
    <group>
      <Background />
      <PlayingCard />
    </group>
  );
};
