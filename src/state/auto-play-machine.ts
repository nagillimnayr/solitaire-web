import { StockPileImpl } from '@/components/canvas/piles/stock-pile/StockPileImpl';
import { WastePileImpl } from '@/components/canvas/piles/waste-pile/WastePileImpl';
import { TableauPileImpl } from '@/components/canvas/piles/tableau-pile/TableauPileImpl';
import { FoundationPileImpl } from '@/components/canvas/piles/foundation-pile/FoundationPileImpl';
import { PlayingCardImpl } from '@/components/canvas/playing-card/PlayingCardImpl';
import { CarryPileImpl } from '@/components/canvas/piles/carry-pile/CarryPileImpl';
import { assign, createMachine, log } from 'xstate';
import { Vector3 } from 'three';
import { areAllFoundationsFull } from '@/helpers/playing-card-utils';
import { ReturnWasteMachine } from './return-waste-machine';
import { RootState } from '@react-three/fiber';

type AutoPlayContext = {
  getThree: () => RootState;
  stockPile: StockPileImpl;
  wastePile: WastePileImpl;
  foundationPiles: FoundationPileImpl[];
  tableauPiles: TableauPileImpl[];
  carryPile: CarryPileImpl;
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
    },

    on: {
      END_AUTO_PLAY: { target: 'finished' },
    },

    initial: 'idle',
    states: {
      idle: {
        after: [
          /** 1. Try to place cards on foundation. */
          {
            cond: 'canMoveToFoundation',
            target: 'movingToFoundation',
            delay: 'BASE_DELAY',
          },
          /** 2. Try to move any kings to empty tableaus. (Prioritize furthest left kings as they will get their tableau closer to being empty.) */
          {
            cond: 'canMoveKingToEmpty',
            target: 'movingKingToEmpty',
            delay: 'BASE_DELAY',
          },

          /** 3. Attempt to move full tableau stacks so as to uncover more cards. (Left to right to free up tableaus quicker.) */
          {
            cond: 'canMoveTableauStack',
            target: 'movingTableauStack',
            delay: 'BASE_DELAY',
          },

          /** 4. Attempt to place card from waste onto a tableau. */
          {
            cond: 'canMoveFromWaste',
            target: 'movingFromWaste',
            delay: 'BASE_DELAY',
          },

          /** 5. Draw card. */
          { target: 'drawingCard', delay: 'BASE_DELAY' },

          /** 6. If no other moves can be made, attempt to move a card from a tableau onto another tableau. (This may uncover a card that can be moved to a foundation.) */

          /** 7. If that doesn't work, try moving a card from foundation to tableau and then try moving a tableau onto it. */
        ],
      },
      checkingForWin: {
        always: [{ cond: 'allFaceUp', target: 'finished' }, { target: 'idle' }],
      },
      movingToFoundation: {
        after: {
          BASE_DELAY: [
            {
              cond: 'canMoveTableauToFoundation',
              actions: ['autoMoveTableauToFoundation'],
              target: 'checkingForWin',
            },
            /** If no move can be made from the tableaus, try to place a card from the waste. */
            {
              cond: 'canMoveWasteToFoundation',
              actions: ['autoMoveWasteToFoundation'],
              target: 'checkingForWin',
            },
            /** If no moves can be made, draw a card. */
            { target: 'movingKingToEmpty' },
          ],
        },
      },
      movingKingToEmpty: {
        after: {
          BASE_DELAY: [
            {
              cond: 'canMoveKingToEmpty',
              actions: ['moveKingToEmpty'],
              target: 'checkingForWin',
            },
            { target: 'movingTableauStack' },
          ],
        },
      },
      movingTableauStack: {
        after: {
          BASE_DELAY: [
            {
              cond: 'canMoveTableauStack',
              actions: ['moveTableauStack'],
              target: 'checkingForWin',
            },
            { target: 'movingFromWaste' },
          ],
        },
      },
      movingFromWaste: {
        after: {
          BASE_DELAY: [
            {
              cond: 'canMoveWasteToTableau',
              actions: ['moveWasteToTableau'],
              target: 'checkingForWin',
            },
            { target: 'drawingCard' },
          ],
        },
      },
      drawingCard: {
        after: {
          50: [
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
      autoMoveTableauToFoundation({ foundationPiles, tableauPiles }) {},
      autoMoveWasteToFoundation({ foundationPiles, wastePile }) {
        /** Place card from waste to foundation. */
        const card = wastePile.drawCard();
        const foundationPile = foundationPiles[card.suit];
        card.addToPile(foundationPile, true);
      },
      moveKingToEmpty({ tableauPiles }) {},
      moveTableauStack({ tableauPiles }) {},
      moveWasteToTableau({ wastePile, tableauPiles }) {},
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
        let kingIndex = -1;
        let emptyIndex = -1;
        for (const tableauPile of tableauPiles) {
          if (tableauPile.isEmpty() && emptyIndex === -1) {
            emptyIndex = tableauPile.index;
            continue;
          }
          if (tableauPile.hasFaceUpKing()) {
            kingIndex = tableauPile.index;
          }
        }

        return emptyIndex !== -1 && kingIndex !== -1;
      },
      canMoveTableauStack: ({ tableauPiles }) => {
        return false;
      },
      canMoveWasteToTableau: ({ wastePile, tableauPiles }) => {
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
    },
    delays: {
      BASE_DELAY: 10,
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
