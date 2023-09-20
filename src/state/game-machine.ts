import { StockPileImpl } from '@/components/canvas/piles/stock-pile/StockPileImpl';
import { WastePileImpl } from '@/components/canvas/piles/waste-pile/WastePileImpl';
import { TableauPileImpl } from '@/components/canvas/piles/tableau-pile/TableauPileImpl';
import { FoundationPileImpl } from '@/components/canvas/piles/foundation-pile/FoundationPileImpl';
import { assign, createMachine, log } from 'xstate';
import { create } from 'zustand';
import xstate from 'zustand-middleware-xstate';

type GameContext = {
  stockPile: StockPileImpl;
  wastePile: WastePileImpl;
  foundationPiles: FoundationPileImpl[];
  tableauPiles: TableauPileImpl[];
};

type GameEvents =
  /** Assignment events. */
  | { type: 'ASSIGN_STOCK'; stockPile: StockPileImpl }
  | { type: 'ASSIGN_WASTE'; wastePile: WastePileImpl }
  | { type: 'ASSIGN_TABLEAU'; tableauPile: TableauPileImpl }
  | { type: 'ASSIGN_FOUNDATION'; foundationPile: FoundationPileImpl }
  /** Game events. */
  | { type: 'RESTART' }
  | { type: 'DEAL_CARDS' }
  | { type: 'DRAW_CARD' };

export const GameMachine = createMachine(
  {
    predictableActionArguments: true,
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

    on: {
      ASSIGN_STOCK: {
        actions: [
          'logEvent',
          assign({ stockPile: (_, event) => event.stockPile }),
        ],
      },
      ASSIGN_WASTE: {
        actions: [
          'logEvent',
          assign({ wastePile: (_, event) => event.wastePile }),
        ],
      },
      ASSIGN_TABLEAU: {
        actions: [
          'logEvent',
          assign({
            tableauPiles: ({ tableauPiles }, { tableauPile }) => {
              const newArray = tableauPiles.slice();
              newArray[tableauPile.index] = tableauPile;
              return newArray;
            },
          }),
        ],
      },
      ASSIGN_FOUNDATION: {
        actions: [
          'logEvent',
          assign({
            foundationPiles: ({ foundationPiles }, { foundationPile }) => {
              const newArray = foundationPiles.slice();
              newArray[foundationPile.suit] = foundationPile;
              return newArray;
            },
          }),
        ],
      },
    },

    /** Initial state. */
    initial: 'idle',
    /** States. */
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
  },
  {
    actions: {
      logEvent: log((_, event) => event),
    },
  },
);

export const useGameStore = create(xstate(GameMachine));
