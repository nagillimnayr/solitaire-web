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
};

type GameEvents =
  /** Assignment events. */
  | { type: 'ASSIGN_STOCK'; stockPile: StockPileImpl }
  | { type: 'ASSIGN_WASTE'; wastePile: WastePileImpl }
  | { type: 'ASSIGN_TABLEAU'; tableauPile: TableauPileImpl }
  | { type: 'ASSIGN_FOUNDATION'; foundationPile: FoundationPileImpl }

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
        after: {
          CARD_DELAY: [
            {
              /** If rightmost tableau has 7 cards, we're done dealing. Transition to flipping top cards of each tableau. */
              cond: ({ tableauPiles }) => tableauPiles[6].count >= 7,
              target: 'flippingTableaus',
            },
            {
              actions: ['dealCard'],
              /** Recursively self-transition after delay. */
              target: 'dealing',
            },
          ],
        },
      },
      flippingTableaus: {
        after: {
          500: {
            /** Only execute if rightmost hasn't been flipped. */
            cond: ({ tableauPiles }) => tableauPiles[6].needsFlipping,
            /** Flip next tableau. */
            actions: ['flipTableau', log('Flip Tableau!')],
            /** Recursively self-transition after delay. */
            target: 'flippingTableaus',
          },
          1000: {
            /** If rightmost tableau is face-up, transition to idle. */
            // cond: ({ tableauPiles }) => !tableauPiles[6].needsFlipping,
            actions: [log('Done flipping tableaus.')],
            target: 'idle',
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
        // always: [
        //   { target: 'idle', cond: ({ wastePile }) => wastePile.isEmpty() },
        // ],
        after: {
          /** If waste pile is empty, transition to idle. */
          500: { target: 'idle', cond: ({ wastePile }) => wastePile.isEmpty() },
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
      flipTableau: ({ tableauPiles }) => {
        /** Iterate through tableaus and flip the first one that isn't face up. */
        for (let i = 0; i < tableauPiles.length; ++i) {
          if (tableauPiles[i].needsFlipping) {
            tableauPiles[i].flipTopCard();
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
        return 50;
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
    guards: {
      /**  */
    },
  },
);

export const useGameStore = create(xstate(GameMachine));
