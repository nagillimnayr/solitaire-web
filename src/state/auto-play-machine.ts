import { StockPileImpl } from '@/components/canvas/piles/stock-pile/StockPileImpl';
import { WastePileImpl } from '@/components/canvas/piles/waste-pile/WastePileImpl';
import { TableauPileImpl } from '@/components/canvas/piles/tableau-pile/TableauPileImpl';
import { FoundationPileImpl } from '@/components/canvas/piles/foundation-pile/FoundationPileImpl';
import { PlayingCardImpl } from '@/components/canvas/playing-card/PlayingCardImpl';
import { CarryPileImpl } from '@/components/canvas/piles/carry-pile/CarryPileImpl';
import { assign, createMachine, log } from 'xstate';
import { Vector3 } from 'three';
import {
  areAllFoundationsFull,
  findEmptyTableau,
  findTableauWithFaceUpKing,
  flipTableau,
} from '@/helpers/playing-card-utils';
import { ReturnWasteMachine } from './return-waste-machine';
import { RootState } from '@react-three/fiber';

type AutoPlayContext = {
  getThree: () => RootState;
  stockPile: StockPileImpl;
  wastePile: WastePileImpl;
  foundationPiles: FoundationPileImpl[];
  tableauPiles: TableauPileImpl[];
  carryPile: CarryPileImpl;

  lastCardMoved: { ref: PlayingCardImpl };
  flipFlop: {
    lastMove: 'tableau' | 'waste';
  } /** Track whether last move was from tableau or waste. */;
};

type AutoPlayEvents = { type: 'END_AUTO_PLAY'; card: PlayingCardImpl };

export const AutoPlayMachine = createMachine(
  {
    predictableActionArguments: true,
    schema: {
      context: {} as AutoPlayContext,
      events: {} as AutoPlayEvents,
    },
    tsTypes: {} as import('./auto-play-machine.typegen').Typegen0,
    id: 'auto-play-machine',

    context: {
      getThree: null!,
      stockPile: null!,
      wastePile: null!,
      foundationPiles: null!,
      tableauPiles: null!,

      carryPile: null!,

      lastCardMoved: { ref: null! },
      flipFlop: { lastMove: 'waste' },
    },

    entry: [
      assign({
        lastCardMoved: () => ({ ref: null! }),
        flipFlop: () => ({ lastMove: 'waste' as 'waste' }),
      }),
    ],

    on: {
      END_AUTO_PLAY: { cond: 'carryPileIsEmpty', target: 'finished' },
    },

    initial: 'idle',
    states: {
      idle: {
        after: {
          BASE_DELAY: { target: 'movingToFoundation' },
        },
      },
      flippingTableau: {
        always: { actions: ['flipTableau'], target: 'checkingForWin' },
      },
      checkingForWin: {
        always: [{ cond: 'allFaceUp', target: 'finished' }, { target: 'idle' }],
      },
      movingToFoundation: {
        after: {
          BASE_DELAY: [
            {
              cond: 'canMoveTableauToFoundation',
              actions: ['moveTableauToFoundation'],
              target: 'flippingTableau',
            },
            /** If no move can be made from the tableaus, try to place a card from the waste. */
            {
              cond: 'canMoveWasteToFoundation',
              actions: ['moveWasteToFoundation'],
              target: 'flippingTableau',
            },
            /** If no moves can be made, draw a card. */
            { target: 'pickingUpKing' },
          ],
        },
      },
      pickingUpKing: {
        // entry: [log('entry pickingUpKing')],
        after: {
          BASE_DELAY: [
            {
              cond: 'canMoveKingToEmpty',
              actions: ['pickupKing'],
              target: 'movingKingToEmpty',
            },
            {
              cond: 'lastMoveWasTableau',
              target: 'movingFromWaste',
              actions: [({ flipFlop }) => (flipFlop.lastMove = 'waste')],
            },
            {
              cond: 'lastMoveWasWaste',
              target: 'pickingUpTableauStack',
              actions: [({ flipFlop }) => (flipFlop.lastMove = 'tableau')],
            },
          ],
        },
      },

      movingKingToEmpty: {
        // entry: [log('entry movingKingToEmpty')],
        after: {
          BASE_DELAY: [
            {
              cond: 'carryPileIsEmpty',
              target: 'flippingTableau',
            },
            {
              actions: ['moveKingToEmpty'],
              target: 'movingKingToEmpty',
            },
          ],
        },
      },
      pickingUpTableauStack: {
        // entry: [log('entry pickingUpTableauStack')],
        after: {
          BASE_DELAY: [
            {
              cond: 'canMoveTableauStack',
              actions: ['pickupTableauStack'],
              target: 'movingTableauStack',
            },
            { target: 'movingFromWaste' },
          ],
        },
      },
      movingTableauStack: {
        // entry: [log('entry movingTableauStack')],
        after: {
          BASE_DELAY: [
            { cond: 'carryPileIsEmpty', target: 'flippingTableau' },
            {
              actions: ['moveTableauStack'],
              target: 'movingTableauStack',
            },
          ],
        },
      },
      movingFromWaste: {
        // entry: [log('entry movingFromWaste')],
        after: {
          BASE_DELAY: [
            {
              cond: 'canMoveWasteToTableau',
              actions: ['moveWasteToTableau'],
              target: 'flippingTableau',
            },
            { target: 'drawingCard' },
          ],
        },
      },
      drawingCard: {
        // entry: [log('entry drawingCard')],
        after: {
          BASE_DELAY: [
            {
              cond: ({ wastePile, stockPile }) =>
                wastePile.count === 1 && stockPile.isEmpty(),
              target: 'idle',
            },
            /** If stock is empty, return cards from waste. */
            { cond: 'stockIsEmpty', target: 'returningWaste' },
            /** Draw card. */
            { actions: ['drawCard'], target: 'idle' },
          ],
        },
      },
      returningWaste: {
        always: { cond: 'wasteIsEmpty', target: 'idle' },
        /** Invoke ReturnWasteMachine. */
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
      finished: { type: 'final' },
    },
  },
  {
    actions: {
      flipTableau: ({ tableauPiles }) => {
        flipTableau(tableauPiles);
      },
      moveTableauToFoundation({ foundationPiles, tableauPiles }) {
        /** Check each tableau until a valid move is found. */
        for (const tableauPile of tableauPiles) {
          if (tableauPile.isEmpty()) continue;
          const card = tableauPile.peek();
          const foundationPile = foundationPiles[card.suit];
          if (foundationPile.canPlace(card)) {
            tableauPile.drawCard().addToPile(foundationPile, true);
            return;
          }
        }
      },
      moveWasteToFoundation({ foundationPiles, wastePile }) {
        /** Place card from waste to foundation. */
        const card = wastePile.drawCard();
        const foundationPile = foundationPiles[card.suit];
        card.addToPile(foundationPile, true);
      },
      pickupKing({ tableauPiles, carryPile }) {
        let kingIndex = findTableauWithFaceUpKing(tableauPiles);

        if (kingIndex === -1) {
          console.error('invalid move');
          return;
        }

        /** Get king. */
        let tableauPile = tableauPiles[kingIndex];
        let card: PlayingCardImpl = tableauPile.drawCard();
        card.addToPile(carryPile, true);
        while (card.rank !== 12) {
          card = tableauPile.drawCard();
          card.addToPile(carryPile, true);
        }
      },
      moveKingToEmpty({ tableauPiles, carryPile }) {
        let emptyIndex = findEmptyTableau(tableauPiles);

        if (emptyIndex === -1) {
          console.error('invalid move');
          return;
        }

        /** Get king. */
        let tableauPile = tableauPiles[emptyIndex];
        const card = carryPile.drawCard();
        card.addToPile(tableauPile, true);
      },
      pickupTableauStack({ tableauPiles, carryPile, lastCardMoved }) {
        for (const tableauPile of tableauPiles) {
          if (tableauPile.isEmpty()) continue;
          const pile = tableauPile.toArray();
          /** Don't move if bottom card is a king and all cards are face up. */
          if (tableauPile.isAllFaceUp() && pile[0].rank === 12) continue;

          for (const card of pile) {
            /** Don't move this card if it was the last card moved. */
            if (Object.is(card, lastCardMoved.ref)) continue;

            for (const otherPile of tableauPiles) {
              if (Object.is(otherPile, tableauPile)) continue;
              if (otherPile.canPlace(card)) {
                lastCardMoved.ref = card;
                while (!Object.is(tableauPile.peek(), card)) {
                  tableauPile.drawCard().addToPile(carryPile, true);
                }
                tableauPile.drawCard().addToPile(carryPile, true);
                return;
              }
            }
          }
        }
      },
      moveTableauStack({ tableauPiles, carryPile }) {
        for (const tableauPile of tableauPiles) {
          if (tableauPile.canPlace(carryPile.peek())) {
            carryPile.drawCard().addToPile(tableauPile, true);
            return;
          }
        }
      },
      moveWasteToTableau({ wastePile, tableauPiles }) {
        const card = wastePile.peek();
        for (const tableauPile of tableauPiles) {
          if (tableauPile.canPlace(card)) {
            wastePile.drawCard().addToPile(tableauPile);
            return;
          }
        }
      },
      drawCard({ stockPile, wastePile }) {
        const card = stockPile.drawCard();
        card.addToPile(wastePile, true);
      },
    },
    guards: {
      canMoveTableauToFoundation: ({ foundationPiles, tableauPiles }) => {
        for (const tableauPile of tableauPiles) {
          if (tableauPile.isEmpty()) continue;
          const card = tableauPile.peek();
          const foundationPile = foundationPiles[card.suit];
          if (foundationPile.canPlace(card)) return true;
        }
        return false;
      },
      canMoveWasteToFoundation: ({ foundationPiles, wastePile }) => {
        if (wastePile.isEmpty()) return false;
        const card = wastePile.peek();
        const foundationPile = foundationPiles[card.suit];
        return foundationPile.canPlace(card);
      },
      canMoveKingToEmpty: ({ tableauPiles }) => {
        let kingIndex = findTableauWithFaceUpKing(tableauPiles);
        let emptyIndex = findEmptyTableau(tableauPiles);

        return emptyIndex !== -1 && kingIndex !== -1;
      },
      canMoveTableauStack: ({ tableauPiles, lastCardMoved, flipFlop }) => {
        for (const tableauPile of tableauPiles) {
          if (tableauPile.isEmpty()) continue;
          const pile = tableauPile.toArray();
          /** Don't move if bottom card is a king and all cards are face up. */
          if (tableauPile.isAllFaceUp() && pile[0].rank === 12) continue;

          for (const card of pile) {
            /** Don't move this card if it was the last card moved. */
            if (Object.is(card, lastCardMoved.ref)) continue;

            for (const otherPile of tableauPiles) {
              if (Object.is(otherPile, tableauPile)) continue;
              if (otherPile.canPlace(card)) return true;
            }
          }
        }
        return false;
      },
      canMoveWasteToTableau: ({ wastePile, tableauPiles }) => {
        if (wastePile.isEmpty()) return false;
        const card = wastePile.peek();
        for (const tableauPile of tableauPiles) {
          if (tableauPile.canPlace(card)) return true;
        }
        return false;
      },

      stockIsEmpty: ({ stockPile }) => stockPile.isEmpty(),
      wasteIsEmpty: ({ wastePile }) => wastePile.isEmpty(),

      allFaceUp: ({ tableauPiles }) => {
        for (const tableauPile of tableauPiles) {
          if (!tableauPile.isAllFaceUp()) return false;
        }
        return true;
      },

      carryPileIsEmpty: ({ carryPile }) => carryPile.isEmpty(),

      lastMoveWasTableau: ({ flipFlop }) => flipFlop.lastMove === 'tableau',
      lastMoveWasWaste: ({ flipFlop }) => flipFlop.lastMove === 'waste',
    },
    delays: {
      BASE_DELAY: 50,
    },
  },
);

/** 1. Try to place cards on foundation. */
/** 2. Try to move any kings to empty tableaus. (Prioritize furthest left kings as they will get their tableau closer to being empty.) */
/** 3. Attempt to move full tableau stacks so as to uncover more cards. (Left to right to free up tableaus quicker.) */
/** 4. Attempt to place card from waste onto a tableau. */
/** 5. Draw card. */

/** 6. If no other moves can be made, attempt to move a card from a tableau onto another tableau. (This may uncover a card that can be moved to a foundation.) */

/** 7. If that doesn't work, try moving a card from foundation to tableau and then try moving a tableau onto it. */
