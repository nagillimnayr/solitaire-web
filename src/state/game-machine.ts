import { StockPileImpl } from '@/components/canvas/piles/stock-pile/StockPileImpl';
import { WastePileImpl } from '@/components/canvas/piles/waste-pile/WastePileImpl';
import { TableauPileImpl } from '@/components/canvas/piles/tableau-pile/TableauPileImpl';
import { FoundationPileImpl } from '@/components/canvas/piles/foundation-pile/FoundationPileImpl';
import { ContextFrom, assign, choose, createMachine, log, raise } from 'xstate';
import { create } from 'zustand';
import xstate from 'zustand-middleware-xstate';
import { PlayingCardImpl } from '@/components/canvas/playing-card/PlayingCardImpl';
import {
  CARD_WIDTH_WITH_MARGIN,
  NUMBER_OF_CARDS,
  Z_OFFSET,
} from '@/helpers/constants';
import { Vector3 } from 'three';
import { randInt } from 'three/src/math/MathUtils';

const HALF_DECK_SIZE = NUMBER_OF_CARDS / 2;
const _pos1 = new Vector3();
const _pos2 = new Vector3();

/** Helper for shuffling the deck. */
type SplitPiles = {
  pile1: PlayingCardImpl[];
  pile2: PlayingCardImpl[];
};

type GameContext = {
  stockPile: StockPileImpl;
  wastePile: WastePileImpl;
  foundationPiles: FoundationPileImpl[];
  tableauPiles: TableauPileImpl[];

  splitPiles: SplitPiles; // Helper for shuffling the deck.
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

      splitPiles: {
        pile1: new Array<PlayingCardImpl>(),
        pile2: new Array<PlayingCardImpl>(),
      },
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
          1000: { cond: 'stockIsFull', target: 'splittingDeck' },
          50: [
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
      splittingDeck: {
        after: {
          1000: {
            /** Once the stockPile is empty, transition to shuffling. */
            cond: 'stockIsEmpty',
            target: 'shuffling',
          },
          50: {
            cond: 'stockNotEmpty',
            // cond: ({ stockPile }) => stockPile.count > HALF_DECK_SIZE,
            /** Take cards from the stockPile and add them to splitPiles.*/
            actions: ['splitDeck'],
            target: 'splittingDeck',
          },
        },
      },

      shuffling: {
        after: {
          /** When stock is full again, transition to dealing. */
          1000: { cond: 'stockIsFull', target: 'dealing' },
          CARD_DELAY: {
            cond: 'stockNotFull',
            /** Add the cards back to the stockPile in a random order.*/
            actions: ['shuffleDeck'],
            target: 'shuffling',
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
          300: {
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
      splitDeck: ({ stockPile, splitPiles }) => {
        /** Move two cards from stockPile to splitPiles. */
        const { pile1, pile2 } = splitPiles;
        const card1 = stockPile.drawCard();
        const card2 = stockPile.drawCard();

        stockPile.getWorldPosition(_pos1);
        stockPile.getWorldPosition(_pos2);
        _pos1.x -= CARD_WIDTH_WITH_MARGIN;
        _pos1.z += pile1.length * Z_OFFSET;
        _pos2.z += pile2.length * Z_OFFSET;

        /** Randomize which card goes to which pile. */
        const order = randInt(0, 1);
        if (order === 1) {
          pile1.push(card1);
          card1.moveTo(_pos1);

          pile2.push(card2);
          card2.moveTo(_pos2);
        } else {
          pile1.push(card2);
          card2.moveTo(_pos1);

          pile2.push(card1);
          card1.moveTo(_pos2);
        }
      },
      shuffleDeck: ({ stockPile, splitPiles }) => {
        const { pile1, pile2 } = splitPiles;

        /** Randomly select a card from each split pile. */
        const index1 = randInt(0, pile1.length - 1);
        const index2 = randInt(0, pile2.length - 1);
        const card1 = pile1[index1];
        const card2 = pile2[index2];

        /** And the cards to stockPile and randomize which one gets added first. */
        const order = randInt(0, 1);
        if (order === 0) {
          card1.addToPile(stockPile);
          card2.addToPile(stockPile);
        } else {
          card2.addToPile(stockPile);
          card1.addToPile(stockPile);
        }

        /** Remove the cards from split piles. */
        pile1.splice(index1, 1);
        pile2.splice(index2, 1);
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
        /** Return card from first non-empty pile. */
        for (const tableauPile of tableauPiles) {
          if (!tableauPile.isEmpty()) {
            const card = tableauPile.drawCard();
            card.addToPile(stockPile, false);
            return;
          }
        }
      },
      returnFoundation: ({ stockPile, foundationPiles }) => {
        /** Return card from first non-empty pile. */
        for (const foundationPile of foundationPiles) {
          const card = foundationPile.drawCard();
          card.addToPile(stockPile, false);
          return;
        }
      },
    },
    delays: {
      CARD_DELAY: (context, event) => {
        return 50;
      },
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
      stockNotFull: ({ stockPile }) => stockPile.count !== NUMBER_OF_CARDS,
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
