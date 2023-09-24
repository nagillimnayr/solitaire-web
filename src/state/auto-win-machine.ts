import { StockPileImpl } from '@/components/canvas/piles/stock-pile/StockPileImpl';
import { WastePileImpl } from '@/components/canvas/piles/waste-pile/WastePileImpl';
import { TableauPileImpl } from '@/components/canvas/piles/tableau-pile/TableauPileImpl';
import { FoundationPileImpl } from '@/components/canvas/piles/foundation-pile/FoundationPileImpl';
import { PlayingCardImpl } from '@/components/canvas/playing-card/PlayingCardImpl';
import { CarryPileImpl } from '@/components/canvas/piles/carry-pile/CarryPileImpl';
import { createMachine, log } from 'xstate';
import { Vector3 } from 'three';
import { areAllFoundationsFull } from '@/helpers/playing-card-utils';
import { ReturnWasteMachine } from './return-waste-machine';

type AutoWinContext = {
  stockPile: StockPileImpl;
  wastePile: WastePileImpl;
  tableauPiles: TableauPileImpl[];
  foundationPiles: FoundationPileImpl[];
};

export const AutoWinMachine = createMachine(
  {
    predictableActionArguments: true,
    schema: {
      context: {} as AutoWinContext,
    },
    tsTypes: {} as import('./auto-win-machine.typegen').Typegen0,
    id: 'auto-win-machine',

    context: {
      stockPile: null!,
      wastePile: null!,
      tableauPiles: null!,
      foundationPiles: null!,
    },

    initial: 'autoPlacing',
    states: {
      autoPlacing: {
        after: {
          /** Check for win. */
          300: { cond: 'hasWon', target: 'finished' },

          25: [
            /** Try to place a card from the tableaus first. */
            {
              cond: 'canPlaceFromTableau',
              actions: ['autoPlaceFromTableau'],
              target: 'autoPlacing',
            },
            /** If no move can be made from the tableaus, try to place a card from the waste. */
            {
              cond: 'canPlaceFromWaste',
              actions: ['autoPlaceFromWaste'],
              target: 'autoPlacing',
            },
            /** If no moves can be made, draw a card. */
            { target: 'drawingCard' },
          ],
        },
      },
      drawingCard: {
        after: {
          25: [
            /** If stock is empty, return cards from waste. */
            { cond: 'stockIsEmpty', target: 'returningWaste' },
            /** Draw card. */
            { actions: ['drawCard'], target: 'autoPlacing' },
          ],
        },
      },
      returningWaste: {
        always: { cond: 'wasteIsEmpty', target: 'autoPlacing' },
        /** Invoke ReturnWasteMachine. */
        invoke: {
          id: 'return-waste-actor',
          src: ReturnWasteMachine,
          data: {
            stockPile: ({ stockPile }) => stockPile,
            wastePile: ({ wastePile }) => wastePile,
          },
          onDone: { target: 'autoPlacing' },
        },
      },
      finished: { type: 'final' },
    },
  },
  {
    actions: {
      autoPlaceFromTableau: ({ foundationPiles, tableauPiles }) => {
        /** Check each tableau until a valid move is found. */
        for (const tableauPile of tableauPiles) {
          if (tableauPile.isEmpty()) continue;
          const card = tableauPile.peek();
          const foundationPile = foundationPiles[card.suit];
          if (foundationPile.canPlace(card)) {
            tableauPile.drawCard().addToPile(foundationPile);
            return;
          }
        }
      },
      autoPlaceFromWaste: ({ foundationPiles, wastePile }) => {
        /** Place card from waste to foundation. */
        const card = wastePile.drawCard();
        const foundationPile = foundationPiles[card.suit];
        card.addToPile(foundationPile);
      },
    },
    guards: {
      hasWon: ({ foundationPiles }) => areAllFoundationsFull(foundationPiles),
      canPlaceFromTableau: ({ foundationPiles, tableauPiles }) => {
        for (const tableauPile of tableauPiles) {
          if (tableauPile.isEmpty()) continue;
          const card = tableauPile.peek();
          const foundationPile = foundationPiles[card.suit];
          if (foundationPile.canPlace(card)) return true;
        }
        return false;
      },
      canPlaceFromWaste: ({ foundationPiles, wastePile }) => {
        if (wastePile.isEmpty()) return false;
        const card = wastePile.peek();
        const foundationPile = foundationPiles[card.suit];
        if (foundationPile.canPlace(card)) return true;
      },
      stockIsEmpty: ({ stockPile }) => stockPile.isEmpty(),
      wasteIsEmpty: ({ wastePile }) => wastePile.isEmpty(),
    },
    delays: {
      CARD_DELAY: 25,
    },
  },
);
