import { StockPileImpl } from '@/components/canvas/piles/stock-pile/StockPileImpl';
import { WastePileImpl } from '@/components/canvas/piles/waste-pile/WastePileImpl';
import { TableauPileImpl } from '@/components/canvas/piles/tableau-pile/TableauPileImpl';
import { FoundationPileImpl } from '@/components/canvas/piles/foundation-pile/FoundationPileImpl';
import { ContextFrom, assign, choose, createMachine, log, raise } from 'xstate';
import { create } from 'zustand';
import xstate from 'zustand-middleware-xstate';
import { PlayingCardImpl } from '@/components/canvas/playing-card/PlayingCardImpl';
import { NUMBER_OF_CARDS } from '@/helpers/constants';

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
  | { type: 'INIT_CARD'; card: PlayingCardImpl }

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
      INIT_CARD: {
        actions: ['initCard'],
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
              cond: 'stockIsEmpty',
              target: 'returningWaste',
            },
            {
              cond: 'stockNotEmpty',
              actions: ['logEvent'],
              target: 'drawing',
            },
          ],
        },
      },
      restarting: {
        after: {
          /** If stock pile is full, we're done returning the cards. Transition to dealing. */
          1000: { cond: 'stockIsFull', target: 'dealing' },
          RESTART_DELAY: [
            {
              /** Return cards from tableaus. */
              cond: 'tableausNotEmpty',
              actions: ['returnTableau'],
              target: 'restarting',
            },
            {
              /** Return cards from foundations. */
              cond: 'foundationsNotEmpty',
              actions: ['returnFoundation'],
              target: 'restarting',
            },
            {
              /** Return cards from waste. */
              cond: 'wasteNotEmpty',
              actions: ['returnWaste'],
              target: 'restarting',
            },
          ],
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
            cond: 'tableausNeedFlipping',
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
        invoke: {
          src: 'drawCard',
          onDone: { target: 'idle' },
        },
      },
      returningWaste: {
        after: {
          /** If waste pile is empty, transition to idle. */
          500: {
            cond: 'wasteIsEmpty',
            target: 'idle',
          },
          CARD_DELAY: {
            cond: 'wasteNotEmpty',
            actions: ['returnWaste'],
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
      initCard: ({ stockPile }, { card }) => {
        /** Add card to stock pile. */
        card.addToPile(stockPile);
      },
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

        for (const tableauPile of tableauPiles) {
          if (tableauPile.needsFlipping) {
            tableauPile.flipTopCard();
            return;
          }
        }
      },
      returnWaste: ({ stockPile, wastePile }) => {
        const card = wastePile.drawCard();
        card.addToPile(stockPile, false);
      },
      returnTableau: ({ stockPile, tableauPiles }) => {
        for (const tableauPile of tableauPiles) {
          if (!tableauPile.isEmpty()) {
            const card = tableauPile.drawCard();
            card.addToPile(stockPile, false);
          }
        }
      },
      returnFoundation: ({ stockPile, foundationPiles }) => {
        for (const foundationPile of foundationPiles) {
          const card = foundationPile.drawCard();
          card.addToPile(stockPile, false);
        }
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
      /** Stock. */
      stockIsFull: ({ stockPile }) => stockPile.count === NUMBER_OF_CARDS,
      // stockNotFull: ({ stockPile }) => stockPile.count !== NUMBER_OF_CARDS,
      stockIsEmpty: ({ stockPile }) => stockPile.isEmpty(),
      stockNotEmpty: ({ stockPile }) => !stockPile.isEmpty(),

      /** Waste. */
      wasteIsEmpty: ({ wastePile }) => wastePile.isEmpty(),
      wasteNotEmpty: ({ wastePile }) => !wastePile.isEmpty(),

      /** Tableaus. */
      // tableausAreEmpty: ({ tableauPiles }) => {
      //   /** If any piles are not empty, return false. */
      //   for (const tableauPile of tableauPiles) {
      //     if (!tableauPile.isEmpty()) return false;
      //   }
      //   return true;
      // },
      tableausNotEmpty: ({ tableauPiles }) => {
        /** If any piles are not empty, return true. */
        for (const tableauPile of tableauPiles) {
          if (!tableauPile.isEmpty()) return true;
        }
        return false;
      },
      tableausNeedFlipping: ({ tableauPiles }) => {
        /** If any piles need flipping, return true. */
        for (const tableauPile of tableauPiles) {
          if (tableauPile.needsFlipping) return true;
        }
        return false;
      },
      // tableausDontNeedFlipping: ({ tableauPiles }) => {
      //   /** If any piles need flipping, return false. */
      //   for (const tableauPile of tableauPiles) {
      //     if (tableauPile.needsFlipping) return false;
      //   }
      //   return true;
      // },

      /** Foundations. */
      // foundationsAreEmpty: ({ foundationPiles }) => {
      //   /** If any piles are not empty, return false. */
      //   for (const foundationPile of foundationPiles) {
      //     if (!foundationPile.isEmpty()) return false;
      //   }
      //   return true;
      // },
      foundationsNotEmpty: ({ foundationPiles }) => {
        /** If any piles are not empty, return true. */
        for (const foundationPile of foundationPiles) {
          if (!foundationPile.isEmpty()) return true;
        }
        return false;
      },
    },
  },
);

export const useGameStore = create(xstate(GameMachine));
