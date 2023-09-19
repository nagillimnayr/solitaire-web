import { StockPileImpl } from '@/components/canvas/piles/stock-pile/StockPileImpl';
import { createMachine } from 'xstate';

type StockContext = {
  stockPile: StockPileImpl;
};

type StockEvents =
  | { type: 'RESTART' }
  | { type: 'DEAL_CARDS' }
  | { type: 'DRAW_CARD' };

export const StockMachine = createMachine({
  schema: {
    context: {} as StockContext,
    events: {} as StockEvents,
  },
  id: 'stock-machine',

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
