import { useMemo } from 'react';
import { Background } from './Background';
import { PileOutline } from './piles/PileOutline';
import { PlayingCard } from './playing-card/PlayingCard';
import { RANKS, SUITS } from '@/helpers/constants';
import { makePlayingCardName } from '@/helpers/playing-card-utils';
import { StockAndWaste } from './piles/StockAndWaste';
import { Vector3 } from 'three';
import { Tableaus } from './piles/Tableaus';

const STOCK_AND_WASTE_POS = new Vector3(-0.4, 0.2, 0);
const TABLEAUS_POS = new Vector3(0, 0, 0);

export const SolitaireGame = () => {
  const cards = useMemo(() => {
    return SUITS.map((suit, suitIndex) =>
      RANKS.map((rank, rankIndex) => {
        const key = makePlayingCardName(rankIndex, suitIndex);
        return <PlayingCard key={key} rank={rankIndex} suit={suitIndex} />;
      }),
    );
  }, []);

  const stockAndWastePos = useMemo(() => new Vector3(-0.4, 0.2, 0), []);
  return (
    <group>
      <axesHelper />
      <Background />
      <StockAndWaste position={STOCK_AND_WASTE_POS} />
      <Tableaus position={TABLEAUS_POS} />
      {/* {cards} */}
    </group>
  );
};
