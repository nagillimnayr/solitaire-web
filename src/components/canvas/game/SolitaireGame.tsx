import { useContext, useEffect, useMemo } from 'react';
import { Background } from '../scene/Background';
import { PlayingCard } from '../playing-card/PlayingCard';
import {
  CARD_HEIGHT_WITH_MARGIN,
  CARD_WIDTH_HALF,
  CARD_WIDTH_HALF_WITH_MARGIN,
  RANKS,
  SUITS,
} from '@/helpers/constants';
import { makePlayingCardName } from '@/helpers/playing-card-utils';
import { StockAndWaste } from '../piles/StockAndWaste';
import { Vector3 } from 'three';
import { Tableaus } from '../piles/Tableaus';
import { Foundations } from '../piles/Foundations';
import { GlobalStateContext } from '../../dom/providers/GlobalStateProvider';
import { useKeyboard } from '@/hooks/usekeyboard';
import { CarryPile } from '../piles/carry-pile/CarryPile';
import { useThree } from '@react-three/fiber';
import { useEventListener } from 'usehooks-ts';
import { CameraControls, PerspectiveCamera } from '@react-three/drei';

const STOCK_AND_WASTE_POS = new Vector3(
  -CARD_WIDTH_HALF_WITH_MARGIN * 5,
  CARD_HEIGHT_WITH_MARGIN,
  0,
);
const FOUNDATIONS_POS = new Vector3(
  CARD_WIDTH_HALF_WITH_MARGIN * 5,
  CARD_HEIGHT_WITH_MARGIN,
  0,
);
const TABLEAUS_POS = new Vector3(0, 0, 0);

export const SolitaireGame = () => {
  const { GameActor } = useContext(GlobalStateContext);
  const getThree = useThree(({ get }) => get);

  useEffect(() => {
    GameActor.send({ type: 'ASSIGN_GET_THREE', getThree });
  }, [GameActor, getThree]);

  const cards = useMemo(() => {
    return Object.keys(SUITS).map((suit, suitIndex) =>
      RANKS.map((rank, rankIndex) => {
        const key = makePlayingCardName(rankIndex, Number(suit));
        return <PlayingCard key={key} rank={rankIndex} suit={Number(suit)} />;
      }),
    );
  }, []);

  /** Restart game. */
  useEffect(() => {
    GameActor.send({ type: 'RESTART' });
  }, [GameActor]);

  useKeyboard();

  useEventListener('pointerup', (event) => {
    GameActor.send({ type: 'DROP_CARD' });
  });

  return (
    <group name='solitaire-game'>
      <axesHelper />
      <Background />
      <StockAndWaste position={STOCK_AND_WASTE_POS} />
      <Foundations position={FOUNDATIONS_POS} />
      <Tableaus position={TABLEAUS_POS} />
      <CarryPile />
      {cards}
      <PerspectiveCamera makeDefault position-z={0.5} />
      <CameraControls makeDefault />
      <ambientLight intensity={0.7} />
    </group>
  );
};
