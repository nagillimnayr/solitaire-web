import { StockPileImpl } from '@/components/canvas/piles/stock-pile/StockPileImpl';
import { WastePileImpl } from '@/components/canvas/piles/waste-pile/WastePileImpl';
import { TableauPileImpl } from '@/components/canvas/piles/tableau-pile/TableauPileImpl';
import { FoundationPileImpl } from '@/components/canvas/piles/foundation-pile/FoundationPileImpl';
import { ContextFrom, assign, choose, createMachine, log, raise } from 'xstate';
import { create } from 'zustand';
import xstate from 'zustand-middleware-xstate';
import { PlayingCardImpl } from '@/components/canvas/playing-card/PlayingCardImpl';
import {
  CARD_WIDTH_HALF_WITH_MARGIN,
  CARD_WIDTH_WITH_MARGIN,
  NUMBER_OF_CARDS,
  Y_OFFSET,
  Z_OFFSET,
} from '@/helpers/constants';
import { Vector3 } from 'three';
import { randInt } from 'three/src/math/MathUtils';
import { Stack } from '@datastructures-js/stack';
import { CarryPileImpl } from '@/components/canvas/piles/carry-pile/CarryPileImpl';
import { RootState } from '@react-three/fiber';
import { CameraControls } from 'three-stdlib';
import { TableauPile } from '../components/canvas/piles/tableau-pile/TableauPile';

const HALF_DECK_SIZE = NUMBER_OF_CARDS / 2;
const _pos1 = new Vector3();
const _pos2 = new Vector3();

/** Helper for shuffling the deck. */
type SplitPiles = {
  pile1: PlayingCardImpl[];
  pile2: PlayingCardImpl[];
};

type GameEvents =
  /** Assignment events. */
  | { type: 'ASSIGN_GET_THREE'; getThree: () => RootState }
  | { type: 'ASSIGN_STOCK'; stockPile: StockPileImpl }
  | { type: 'ASSIGN_WASTE'; wastePile: WastePileImpl }
  | { type: 'ASSIGN_TABLEAU'; tableauPile: TableauPileImpl }
  | { type: 'ASSIGN_FOUNDATION'; foundationPile: FoundationPileImpl }
  | { type: 'ASSIGN_CARRY_PILE'; carryPile: CarryPileImpl }
  | { type: 'INIT_CARD'; card: PlayingCardImpl }

  /** Game events. */
  | { type: 'RESTART' }
  | { type: 'RETURN_WASTE' }
  | { type: 'DRAW_CARD' }
  | { type: 'PICKUP_CARD'; card: PlayingCardImpl; intersection: Vector3 }
  | { type: 'DROP_CARD' }
  | { type: 'PLACE_CARD' }
  | { type: 'PLACE_CARD_TABLEAU'; tableauPile: TableauPileImpl }
  | { type: 'PLACE_CARD_FOUNDATION'; foundationPile: FoundationPileImpl }
  | { type: 'CLICK_CARD'; card: PlayingCardImpl };

type GameContext = {
  getThree: () => RootState;
  stockPile: StockPileImpl;
  wastePile: WastePileImpl;
  foundationPiles: FoundationPileImpl[];
  tableauPiles: TableauPileImpl[];
  carryPile: CarryPileImpl;

  splitPiles: SplitPiles; // Helper for shuffling the deck.

  lastEvent: GameEvents;
};

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
      getThree: null!,
      stockPile: null!,
      wastePile: null!,
      foundationPiles: new Array<FoundationPileImpl>(4),
      tableauPiles: new Array<TableauPileImpl>(7),

      carryPile: null!,

      splitPiles: {
        pile1: new Array<PlayingCardImpl>(),
        pile2: new Array<PlayingCardImpl>(),
      },

      lastEvent: null!,
    },

    on: {
      ASSIGN_GET_THREE: {
        actions: [assign({ getThree: (_, { getThree }) => getThree })],
      },
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
          ({ tableauPiles }, { tableauPile }) => {
            tableauPiles[tableauPile.index] = tableauPile;
          },
        ],
      },
      ASSIGN_FOUNDATION: {
        actions: [
          'logEvent',
          ({ foundationPiles }, { foundationPile }) => {
            foundationPiles[foundationPile.suit] = foundationPile;
          },
        ],
      },
      ASSIGN_CARRY_PILE: {
        actions: [assign({ carryPile: (_, { carryPile }) => carryPile })],
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
            actions: ['logEvent', 'assignLastEvent'],
            target: 'restarting',
          },
          RETURN_WASTE: {
            actions: ['logEvent', 'assignLastEvent'],
            target: 'returningWaste',
          },
          DRAW_CARD: [
            {
              /** If stock is empty, return cards from waste pile.  */
              cond: 'stockIsEmpty',
              target: 'returningWaste',
            },
            {
              cond: 'stockNotEmpty',
              actions: ['logEvent', 'assignLastEvent'],
              target: 'drawing',
            },
          ],
          PICKUP_CARD: {
            /** Only valid if card is face up. */
            cond: ({ carryPile }, { card }) =>
              card.isFaceUp && !Object.is(card.currentPile, carryPile),
            actions: [
              'logEvent',
              'pickupCard',
              'lockCameraControls',
              'assignLastEvent',
            ],
            target: 'carryingCards',
          },
          CLICK_CARD: {
            cond: ({ stockPile }, { card }) =>
              Object.is(card.currentPile, stockPile),
            actions: ['logEvent', 'assignLastEvent'],
            target: 'drawing',
          },
        },
      },
      restarting: {
        after: {
          /** If stock pile is full, we're done returning the cards. Transition to dealing. */
          500: { cond: 'stockIsFull', target: 'splittingDeck' },
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
          250: {
            /** Once the stockPile is empty, transition to shuffling. */
            cond: 'stockIsEmpty',
            target: 'shuffling',
          },
          20: {
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
          500: { cond: 'stockIsFull', target: 'dealing' },
          20: {
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
          100: {
            /** Only execute if rightmost hasn't been flipped. */
            cond: 'tableausNeedFlipping',
            /** Flip next tableau. */
            actions: ['flipTableau', log('Flip Tableau!')],
            /** Recursively self-transition after delay. */
            target: 'flippingTableaus',
          },
          500: {
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
          300: {
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
      carryingCards: {
        on: {
          DROP_CARD: {
            actions: ['logEvent', 'unlockCameraControls', 'assignLastEvent'],
            target: 'droppingCards',
          },
          /** Attempt to place card(s) on Tableau pile. */
          PLACE_CARD_TABLEAU: [
            {
              // cond: 'placeTableauValid',
              cond: ({ carryPile }, { tableauPile }) => {
                const card = carryPile.peek();
                const topCard = tableauPile.peek();

                /** Don't place on previous pile. */
                if (Object.is(card.previousPile, tableauPile)) return false;

                /** If Tableau is empty, move is only valid if card being placed is a King. */
                if (!topCard) return card.rank === 12;

                if (
                  /** Card must be face up. */
                  !topCard.isFaceUp ||
                  /** If both even or both odd, return false. */
                  card.suit % 2 === topCard.suit % 2 ||
                  /** Card underneath must be one rank higher than the card we're placing on it. */
                  topCard.rank !== card.rank + 1
                )
                  return false;

                return true;
              },
              actions: [
                'logEvent',
                'assignLastEvent',
                'flipTableau',
                'unlockCameraControls',
              ],

              target: 'placingOnTableau',
            },
            {
              // cond: 'placeTableauInvalid',
              actions: ['logEvent', 'assignLastEvent'],
              target: 'droppingCards',
            },
          ],
          /** Attempt to place card on Foundation. */
          PLACE_CARD_FOUNDATION: [
            {
              // cond: 'placeFoundationValid',
              cond: ({ carryPile }, { foundationPile }) => {
                /** Can only place one card at a time on the foundation. */
                if (carryPile.count > 1) return false;

                const card = carryPile.peek();

                /** Don't place on previous pile. */
                if (Object.is(card.previousPile, foundationPile)) return false;

                /** Must be same suit. */
                if (foundationPile.suit !== card.suit) return false;

                /** If no cards currently in the foundation, move is only valid if card being placed is an ace. */
                if (foundationPile.count === 0) return card.rank === 0;

                const topCard = foundationPile.peek();
                /** Card underneath must be of rank one less than the card being placed. */
                return topCard.rank === card.rank - 1;
              },
              actions: [
                'logEvent',
                'assignLastEvent',
                'flipTableau',
                'unlockCameraControls',
              ],
              target: 'placingOnFoundation',
            },
            {
              // cond: 'placeFoundationInvalid',
              actions: ['logEvent', 'assignLastEvent'],
              target: 'droppingCards',
            },
          ],
        },
      },
      droppingCards: {
        after: {
          200: { cond: 'carryPileIsEmpty', target: 'idle' },
          50: {
            cond: 'carryPileNotEmpty',
            actions: ['dropCard'],
            target: 'droppingCards',
          },
        },
      },
      placingOnTableau: {
        after: {
          200: { cond: 'carryPileIsEmpty', target: 'idle' },
          50: {
            cond: 'carryPileNotEmpty',
            actions: ['placeOnTableau'],
            target: 'placingOnTableau',
          },
        },
      },
      placingOnFoundation: {
        after: {
          200: { cond: 'carryPileIsEmpty', target: 'idle' },
          50: {
            cond: 'carryPileNotEmpty',
            actions: ['placeOnFoundation'],
            /** Can only place one card at a time on the foundation. */
            target: 'idle',
          },
        },
      },
    },
  },
  {
    actions: {
      logEvent: log((_, event) => event),
      assignLastEvent: assign({ lastEvent: (_, event) => event }),
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
        _pos1.x -= CARD_WIDTH_HALF_WITH_MARGIN;
        _pos1.z += pile1.length * Z_OFFSET;

        stockPile.getWorldPosition(_pos2);
        _pos2.x += CARD_WIDTH_HALF_WITH_MARGIN;
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
      pickupCard: ({ carryPile }, { card, intersection }) => {
        intersection.subVectors(card.position, intersection);

        if (card.currentPile instanceof TableauPileImpl) {
          const tableauPile = card.currentPile;
          const tempArr = new Array<PlayingCardImpl>();
          while (!Object.is(tableauPile.peek(), card)) {
            tempArr.push(tableauPile.drawCard());
          }
          _pos1.copy(intersection);
          tempArr.push(tableauPile.drawCard());
          tempArr.reverse();
          while (tempArr.length > 0) {
            const card2 = tempArr.pop();
            card2.addToPile(carryPile, true);
            _pos1.z = intersection.z + Z_OFFSET * tempArr.length;
            _pos1.y = intersection.y - Y_OFFSET * tempArr.length;
            card2.moveTo(_pos1);
          }
        } else {
          card.currentPile.drawCard();
          card.addToPile(carryPile, true);
          card.moveTo(intersection);
        }
      },
      lockCameraControls: ({ getThree }) => {
        const { controls } = getThree();
        (controls as unknown as CameraControls).enabled = false;
      },
      unlockCameraControls: ({ getThree }) => {
        const { controls } = getThree();
        (controls as unknown as CameraControls).enabled = true;
      },
      dropCard: ({ carryPile }) => {
        // const card = carryPile.drawCard();
        carryPile.dropCard();
      },
      placeOnTableau: ({ carryPile, lastEvent }) => {
        if (lastEvent.type !== 'PLACE_CARD_TABLEAU') {
          console.warn('ERROR: lastEvent must be PLACE_CARD_TABLEAU');
          return;
        }
        const card = carryPile.drawCard();
        const tableauPile = lastEvent.tableauPile;
        card.addToPile(tableauPile, true);
      },
      placeOnFoundation: ({ carryPile, lastEvent }) => {
        if (lastEvent.type !== 'PLACE_CARD_FOUNDATION') {
          console.warn('ERROR: lastEvent must be PLACE_CARD_FOUNDATION');
          return;
        }
        const card = carryPile.drawCard();
        const foundationPile = lastEvent.foundationPile;
        card.addToPile(foundationPile, true);
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

      /** Carry Pile. */
      carryPileIsEmpty: ({ carryPile }) => carryPile.isEmpty(),
      carryPileNotEmpty: ({ carryPile }) => !carryPile.isEmpty(),
    },
  },
);

export const useGameStore = create(xstate(GameMachine));
