import { useMemo } from 'react';
import { Background } from './Background';
import { PileOutline } from './piles/PileOutline';
import { PlayingCard } from './playing-card/PlayingCard';
import { RANKS, SUITS } from '@/helpers/constants';
import { makePlayingCardName } from '@/helpers/playing-card-utils';
import { StockAndWaste } from './piles/StockAndWaste';
import { Vector3 } from 'three';

export const SolitaireGame = () => {
  const cards = useMemo(() => {
    return SUITS.map((suit, suitIndex) =>
      RANKS.map((rank, rankIndex) => {
        const key = makePlayingCardName(rankIndex, suitIndex);
        return <PlayingCard key={key} rank={rankIndex} suit={suitIndex} />;
      }),
    );
  }, []);

  const stockAndWastePos = useMemo(() => new Vector3(-0.2, 0.1, 0), []);
  return (
    <group>
      <Background />
      <StockAndWaste position={stockAndWastePos} />
      {/* {cards} */}
    </group>
  );
};
