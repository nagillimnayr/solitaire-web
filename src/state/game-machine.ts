import { StockPileImpl } from '@/components/canvas/piles/stock-pile/StockPileImpl';
import { createMachine } from 'xstate';

type GameContext = {
  stockPile: StockPileImpl;
};

type GameEvents =
  | { type: 'RESTART' }
  | { type: 'DEAL_CARDS' }
  | { type: 'DRAW_CARD' };

export const GameMachine = createMachine({
  schema: {
    context: {} as GameContext,
    events: {} as GameEvents,
  },
  id: 'game-machine',

  initial: 'idle',

  states: {
    idle: {
      on: {
        RESTART: {
          target: 'restarting',
        },
        DEAL_CARDS: {
          target: 'dealing',
        },
        DRAW_CARD: {
          target: 'drawing',
        },
      },
    },
    restarting: {
      //
    },
    dealing: {
      //
    },
    drawing: {
      //
    },
  },
});
