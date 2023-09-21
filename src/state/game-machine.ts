import { StockPileImpl } from '@/components/canvas/piles/stock-pile/StockPileImpl';
import { WastePileImpl } from '@/components/canvas/piles/waste-pile/WastePileImpl';
import { TableauPileImpl } from '@/components/canvas/piles/tableau-pile/TableauPileImpl';
import { FoundationPileImpl } from '@/components/canvas/piles/foundation-pile/FoundationPileImpl';
import { assign, choose, createMachine, log, raise } from 'xstate';
import { create } from 'zustand';
import xstate from 'zustand-middleware-xstate';
import { PlayingCardImpl } from '@/components/canvas/playing-card/PlayingCardImpl';

type GameContext = {
  stockPile: StockPileImpl;
  wastePile: WastePileImpl;
  foundationPiles: FoundationPileImpl[];
  tableauPiles: TableauPileImpl[];

  numCardsMoving: number;
};

type GameEvents =
  /** Assignment events. */
  | { type: 'ASSIGN_STOCK'; stockPile: StockPileImpl }
  | { type: 'ASSIGN_WASTE'; wastePile: WastePileImpl }
  | { type: 'ASSIGN_TABLEAU'; tableauPile: TableauPileImpl }
  | { type: 'ASSIGN_FOUNDATION'; foundationPile: FoundationPileImpl }
  | { type: 'INCREMENT_NUM_CARDS_MOVING' }
  | { type: 'DECREMENT_NUM_CARDS_MOVING' }
  /** Game events. */
  | { type: 'RESTART' }
  | { type: 'RETURN_WASTE' }
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
      numCardsMoving: 0,
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
      INCREMENT_NUM_CARDS_MOVING: {
        actions: [
          'logEvent',
          assign({
            numCardsMoving: ({ numCardsMoving }) => numCardsMoving + 1,
          }),
        ],
      },
      DECREMENT_NUM_CARDS_MOVING: {
        cond: ({ numCardsMoving }) => numCardsMoving > 0,
        actions: [
          'logEvent',
          assign({
            numCardsMoving: ({ numCardsMoving }) => numCardsMoving - 1,
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
            actions: ['logEvent'],
            target: 'restarting',
          },
          RETURN_WASTE: {
            actions: ['logEvent'],
            target: 'returningWaste',
          },
          DEAL_CARDS: {
            actions: ['logEvent'],
            target: 'dealing',
          },
          DRAW_CARD: [
            {
              /** If stock is empty, return cards from waste pile.  */
              cond: ({ stockPile }) => stockPile.isEmpty(),
              target: 'returningWaste',
            },
            {
              actions: ['logEvent'],

              target: 'drawing',
            },
          ],
        },
      },
      restarting: {
        //
        // always: [{ target: 'idle' }],
        after: {
          RESTART_DELAY: {
            target: 'dealing',
          },
        },
      },
      dealing: {
        //
        always: [
          {
            target: 'idle',
            cond: ({ tableauPiles }) => tableauPiles[6].count >= 7,
          },
        ],
        after: {
          CARD_DELAY: {
            actions: ['dealCard'],
            /** Recursively self-transition after delay. */
            target: 'dealing',
          },
        },
      },
      drawing: {
        /** If stock is empty, return cards from waste pile.  */
        // always: {
        //   cond: ({ stockPile }) => stockPile.isEmpty(),
        //   target: 'returningWaste',
        // },

        invoke: {
          src: 'drawCard',
          onDone: { target: 'idle' },
        },
      },
      returningWaste: {
        /** If waste pile is empty, transition to idle. */
        always: [
          { target: 'idle', cond: ({ wastePile }) => wastePile.isEmpty() },
        ],
        after: {
          CARD_DELAY: {
            actions: ['returnWasteToDeck'],
            /** Recursively self-transition after delay. */
            target: 'returningWaste',
          },
        },
      },
    },
  },
  {
    actions: {
      logEvent: log((_, event) => event),
      dealCard: ({ stockPile, tableauPiles }) => {
        for (let i = 0; i < tableauPiles.length; ++i) {
          const tableauPile = tableauPiles[i];
          if (tableauPile.count < i + 1) {
            const card = stockPile.drawCard();
            card.addToPile(tableauPile);
            return;
          }
        }
      },
      returnWasteToDeck: ({ stockPile, wastePile }) => {
        const card = wastePile.drawCard();
        card.addToPile(stockPile, false);
      },
    },
    delays: {
      CARD_DELAY: (context, event) => {
        return 25;
      },
      RESTART_DELAY: 500,
    },
    services: {
      drawCard: ({ stockPile, wastePile }) => {
        const card = stockPile.drawCard();
        return card.addToPile(wastePile, true);
      },
      // returnWasteToDeck: ({ stockPile, wastePile }) => {
      //   const card = wastePile.drawCard();
      //   return card.addToPile(stockPile, false);
      // },
    },
  },
);

export const useGameStore = create(xstate(GameMachine));
