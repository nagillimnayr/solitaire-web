import { FoundationPileImpl } from '@/components/canvas/piles/foundation-pile/FoundationPileImpl';
import { StockPileImpl } from '@/components/canvas/piles/stock-pile/StockPileImpl';
import { TableauPileImpl } from '@/components/canvas/piles/tableau-pile/TableauPileImpl';
import { WastePileImpl } from '@/components/canvas/piles/waste-pile/WastePileImpl';
import { createMachine } from 'xstate';
import { create } from 'zustand';
import xstate from 'zustand-middleware-xstate';

type GameContext = {
  stockPile: StockPileImpl;
  wastePile: WastePileImpl;
  foundationPiles: FoundationPileImpl[];
  tableauPiles: TableauPileImpl[];
};

type GameEvents =
  | { type: 'RESTART' }
  | { type: 'DEAL_CARDS' }
  | { type: 'DRAW_CARD' };

export const GameMachine = createMachine({
  tsTypes: {} as import('./game-machine.typegen').Typegen0,
  schema: {
    context: {} as GameContext,
    events: {} as GameEvents,
  },
  id: 'game-machine',

  context: {
    stockPile: null!,
    wastePile: null!,
    foundationPiles: new Array<FoundationPileImpl>(4),
    tableauPiles: new Array<TableauPileImpl>(7),
  },

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

export const useGameStore = create(xstate(GameMachine));
