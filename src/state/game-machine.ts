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
// import { CameraControls } from 'three-stdlib';
import { type CameraControls } from '@react-three/drei';
import { RestartMachine } from './restart-machine';
import { DealMachine } from './deal-machine';
import { flipTableau } from '../helpers/playing-card-utils';
import { ReturnWasteMachine } from './return-waste-machine';
import { AutoWinMachine } from './auto-win-machine';
import { DropCardMachine } from './drop-card-machine';

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
  | { type: 'AUTO_PLACE_CARD'; card: PlayingCardImpl }
  | { type: 'PLACE_CARD_TABLEAU'; tableauPile: TableauPileImpl }
  | { type: 'PLACE_CARD_FOUNDATION'; foundationPile: FoundationPileImpl }
  | { type: 'CLICK_CARD'; card: PlayingCardImpl }
  | { type: 'DOUBLE_CLICK_CARD'; card: PlayingCardImpl };

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
            actions: [
              // 'logEvent',
              'assignLastEvent',
            ],
            target: 'restarting',
          },
          RETURN_WASTE: {
            actions: [
              // 'logEvent',
              'assignLastEvent',
            ],
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
              actions: [
                // 'logEvent',
                'assignLastEvent',
              ],
              target: 'drawing',
            },
          ],
          DROP_CARD: [
            {
              cond: 'carryPileNotEmpty',
              target: 'droppingCards',
            },
          ],
          PICKUP_CARD: {
            /** Only valid if card is face up. */
            cond: ({ carryPile }, { card }) =>
              card.isFaceUp && !Object.is(card.currentPile, carryPile),
            actions: [
              'logEvent',
              'pickupCard',
              'cancelCameraDrag',
              'assignLastEvent',
            ],
            target: 'carryingCards',
          },
          CLICK_CARD: [
            {
              /** If card is in stock pile, draw a card. */
              cond: ({ stockPile }, { card }) =>
                Object.is(card.currentPile, stockPile),
              actions: [
                // 'logEvent',
                'assignLastEvent',
              ],
              target: 'drawing',
            },
          ],
        },
      },
      restarting: {
        /** Invoke RestartMachine. */
        invoke: {
          id: 'restart-machine',
          src: RestartMachine,
          data: {
            stockPile: ({ stockPile }) => stockPile,
            wastePile: ({ wastePile }) => wastePile,
            tableauPiles: ({ tableauPiles }) => tableauPiles,
            foundationPiles: ({ foundationPiles }) => foundationPiles,
          },
          onDone: { target: 'dealing' },
        },
      },

      dealing: {
        /** Invoke DealMachine. */
        invoke: {
          id: 'deal-machine',
          src: DealMachine,
          data: {
            stockPile: ({ stockPile }) => stockPile,
            tableauPiles: ({ tableauPiles }) => tableauPiles,
          },
          onDone: { target: 'idle' },
        },
      },

      drawing: {
        invoke: {
          src: 'drawCard',
          onDone: { target: 'idle' },
        },
      },
      returningWaste: {
        /** Invoke ReturnWasteActor. */
        invoke: {
          id: 'return-waste-actor',
          src: ReturnWasteMachine,
          data: {
            stockPile: ({ stockPile }) => stockPile,
            wastePile: ({ wastePile }) => wastePile,
          },
          onDone: { target: 'idle' },
        },
      },
      carryingCards: {
        on: {
          DROP_CARD: {
            actions: [
              // 'logEvent',
              'assignLastEvent',
            ],
            target: 'droppingCards',
          },
          /** Attempt to place card(s) on Tableau pile. */
          PLACE_CARD_TABLEAU: [
            {
              // cond: 'placeTableauValid',
              cond: ({ carryPile }, { tableauPile }) => {
                const card = carryPile.peek();
                return tableauPile.canPlace(card);
              },
              actions: [
                // 'logEvent',
                'assignLastEvent',
                'flipTableau',
              ],

              target: 'placingOnTableau',
            },
            {
              // cond: 'placeTableauInvalid',
              actions: [
                // 'logEvent',
                'assignLastEvent',
              ],
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
                return foundationPile.canPlace(card);
              },
              actions: [
                // 'logEvent',
                'assignLastEvent',
                'flipTableau',
              ],
              target: 'placingOnFoundation',
            },
            {
              // cond: 'placeFoundationInvalid',
              actions: [
                // 'logEvent',
                'assignLastEvent',
              ],
              target: 'droppingCards',
            },
          ],
        },
      },
      droppingCards: {
        // after: {
        //   200: { cond: 'carryPileIsEmpty', target: 'idle' },
        //   25: {
        //     cond: 'carryPileNotEmpty',
        //     actions: ['dropCard'],
        //     target: 'droppingCards',
        //   },
        // },
        invoke: {
          id: 'drop-card-actor',
          src: DropCardMachine,
          data: {
            carryPile: ({ carryPile }) => carryPile,
          },
          onDone: { target: 'idle' },
        },
        on: {
          DOUBLE_CLICK_CARD: {
            cond: 'canAutoPlace',
            actions: [
              'logEvent',
              'assignLastEvent',
              'autoPlaceCardOnFoundation',
              'flipTableau',
            ],
            /** Check for win. */
            target: 'checkingForWin',
          },
        },
      },
      placingOnTableau: {
        after: {
          200: { cond: 'carryPileIsEmpty', target: 'checkingForWin' },
          50: {
            cond: 'carryPileNotEmpty',
            actions: ['placeOnTableau'],
            target: 'placingOnTableau',
          },
        },
      },
      placingOnFoundation: {
        always: [
          {
            /** Only one card may be placed on foundation at a time. */
            cond: ({ carryPile }) => carryPile.count !== 1,
            target: 'droppingCards',
          },
        ],

        after: {
          25:
            /** Check for win. */
            { actions: ['placeOnFoundation'], target: 'checkingForWin' },
        },
      },
      /** Check for win. */
      checkingForWin: {
        always: [
          { cond: 'hasWon', target: 'won' },
          { cond: 'allFaceUp', target: 'autoWinning' },
          { target: 'idle' },
        ],
      },
      /** If all cards are flipped face up, game is essentially one. Auto place cards on foundation to speed things up. */
      autoWinning: {
        /** Invoke promise actor that will take control until all of the cards are in place. */
        invoke: {
          id: 'auto-win-actor',
          src: AutoWinMachine,
          data: {
            stockPile: ({ stockPile }) => stockPile,
            wastePile: ({ wastePile }) => wastePile,
            tableauPiles: ({ tableauPiles }) => tableauPiles,
            foundationPiles: ({ foundationPiles }) => foundationPiles,
          },
          onDone: {
            target: 'won',
          },
        },
      },
      won: {
        entry: [log('Game Won!!!')],
        on: {
          RESTART: {
            target: 'restarting',
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

      flipTableau: ({ tableauPiles }) => {
        flipTableau(tableauPiles);
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
      cancelCameraDrag: ({ getThree }) => {
        if (!getThree) return;
        const { controls } = getThree();
        /** Force cancel camera drag action. */
        (controls as unknown as CameraControls).cancel();
      },

      // dropCard: ({ carryPile }) => {
      //   // const card = carryPile.drawCard();
      //   carryPile.dropCard();
      // },
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
      autoPlaceCardOnFoundation: ({ foundationPiles }, { card }) => {
        if (card.currentPile instanceof FoundationPileImpl) return;
        const foundationPile = foundationPiles[card.suit];

        if (foundationPile.canPlace(card)) {
          card.currentPile.drawCard();
          card.addToPile(foundationPile, true);
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
    },
    guards: {
      /** Stock. */
      // stockIsFull: ({ stockPile }) => stockPile.isFull(),
      // stockNotFull: ({ stockPile }) => !stockPile.isFull(),
      stockIsEmpty: ({ stockPile }) => stockPile.isEmpty(),
      stockNotEmpty: ({ stockPile }) => !stockPile.isEmpty(),

      /** Waste. */
      // wasteIsEmpty: ({ wastePile }) => wastePile.isEmpty(),
      // wasteNotEmpty: ({ wastePile }) => !wastePile.isEmpty(),

      /** Carry Pile. */
      carryPileIsEmpty: ({ carryPile }) => carryPile.isEmpty(),
      carryPileNotEmpty: ({ carryPile }) => !carryPile.isEmpty(),

      /** Check if auto place is valid. */
      canAutoPlace: ({ carryPile, foundationPiles }, { card }) =>
        card.isFaceUp &&
        Object.is(card, card.currentPile.peek()) &&
        foundationPiles[card.suit].canPlace(card),

      /** Check if all cards have been uncovered. */
      allFaceUp: ({ tableauPiles }) => {
        for (const tableauPile of tableauPiles) {
          if (!tableauPile.isAllFaceUp()) return false;
        }
        return true;
      },

      /** Check for win. */
      hasWon: ({ foundationPiles }) => {
        /** Check if all foundations are full. */
        for (const foundationPile of foundationPiles) {
          if (!foundationPile.isFull()) return false;
        }
        return true;
      },
    },
  },
);
