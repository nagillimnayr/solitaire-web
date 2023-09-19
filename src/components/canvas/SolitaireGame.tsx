import { useMemo } from 'react';
import { Background } from './Background';
import { PileOutline } from './piles/PileOutline';
import { PlayingCard } from './playing-card/PlayingCard';
import { RANKS, SUITS } from '@/helpers/constants';
import { makePlayingCardName } from '@/helpers/playing-card-utils';

export const SolitaireGame = () => {
  const cards = useMemo(() => {
    return SUITS.map((suit, suitIndex) =>
      RANKS.map((rank, rankIndex) => {
        const key = makePlayingCardName(rankIndex, suitIndex);
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
