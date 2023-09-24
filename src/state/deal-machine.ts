import { StockPileImpl } from '@/components/canvas/piles/stock-pile/StockPileImpl';
import { WastePileImpl } from '@/components/canvas/piles/waste-pile/WastePileImpl';
import { TableauPileImpl } from '@/components/canvas/piles/tableau-pile/TableauPileImpl';
import { FoundationPileImpl } from '@/components/canvas/piles/foundation-pile/FoundationPileImpl';
import { PlayingCardImpl } from '@/components/canvas/playing-card/PlayingCardImpl';
import { CarryPileImpl } from '@/components/canvas/piles/carry-pile/CarryPileImpl';
import { createMachine, log } from 'xstate';
import { ShuffleMachine } from './shuffle-machine';
import {
  flipTableau,
  doTableausNeedFlipping,
} from '@/helpers/playing-card-utils';

type DealContext = {
  stockPile: StockPileImpl;
  tableauPiles: TableauPileImpl[];
};

export const DealMachine = createMachine(
  {
    predictableActionArguments: true,
    schema: {
      context: {} as DealContext,
    },
    tsTypes: {} as import('./deal-machine.typegen').Typegen0,
    id: 'deal-machine',

    context: {
      stockPile: null!,
      tableauPiles: null!,
    },

    initial: 'shuffling',
    states: {
      shuffling: {
        /** Invoke ShuffleMachine. */
        invoke: {
          id: 'shuffle-actor',
          src: ShuffleMachine,
          data: {
            stockPile: ({ stockPile }) => stockPile,
          },

          /** When child actor is finished shuffling, transition to dealing. */
          onDone: { target: 'dealing' },
        },
      },
      dealing: {
        after: {
          20: [
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
          50: {
            /** Only execute if rightmost tableau hasn't been flipped. */
            cond: 'tableausNotAllFlipped',
            /** Flip next tableau. */
            actions: ['flipTableau'],
            /** Recursively self-transition after delay. */
            target: 'flippingTableaus',
          },
          300: {
            /** If top cards of all tableaus are face-up, we're finished. */
            cond: 'tableausAllFlipped',
            target: 'finished',
          },
        },
      },
      finished: { type: 'final' },
    },
  },
  {
    actions: {
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
        flipTableau(tableauPiles);
      },
    },
    guards: {
      tableausNotAllFlipped: ({ tableauPiles }) =>
        doTableausNeedFlipping(tableauPiles),
      tableausAllFlipped: ({ tableauPiles }) =>
        !doTableausNeedFlipping(tableauPiles),
    },
  },
);
