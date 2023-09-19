import { useMemo } from 'react';
import { Background } from './Background';
import { PileOutline } from './piles/PileOutline';
import { PlayingCard, Suit } from './playing-card/PlayingCard';
import { RANKS, SUITS } from '@/helpers/constants';

export const SolitaireGame = () => {
  const cards = useMemo(() => {
    return SUITS.map((suit, suitIndex) =>
      RANKS.map((rank, rankIndex) => {
        const key = `${rank}-of-${suit}`;
        return <PlayingCard key={key} rank={rankIndex} suit={suitIndex} />;
      }),
    );
  }, []);
  return (
    <group>
      <Background />

      <PileOutline />
      {cards}
    </group>
  );
};
