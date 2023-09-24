import { StockPileImpl } from '@/components/canvas/piles/stock-pile/StockPileImpl';
import { WastePileImpl } from '@/components/canvas/piles/waste-pile/WastePileImpl';
import { TableauPileImpl } from '@/components/canvas/piles/tableau-pile/TableauPileImpl';
import { FoundationPileImpl } from '@/components/canvas/piles/foundation-pile/FoundationPileImpl';
import { PlayingCardImpl } from '@/components/canvas/playing-card/PlayingCardImpl';
import { CarryPileImpl } from '@/components/canvas/piles/carry-pile/CarryPileImpl';
import {
  CARD_WIDTH_HALF_WITH_MARGIN,
  CARD_WIDTH_WITH_MARGIN,
  NUMBER_OF_CARDS,
  Y_OFFSET,
  Z_OFFSET,
} from '@/helpers/constants';
import { ContextFrom, assign, choose, createMachine, log } from 'xstate';
import { Vector3 } from 'three';
import { randInt } from 'three/src/math/MathUtils';
const _pos1 = new Vector3();
const _pos2 = new Vector3();

type RestartContext = {
  stockPile: StockPileImpl;
  wastePile: WastePileImpl;
  tableauPiles: TableauPileImpl[];
  foundationPiles: FoundationPileImpl[];
};

export const RestartMachine = createMachine(
  {
    predictableActionArguments: true,
    schema: {
      context: {} as RestartContext,
    },
    tsTypes: {} as import('./restart-machine.typegen').Typegen0,
    id: 'restart-machine',

    context: () => ({
      stockPile: null!,
      wastePile: null!,
      tableauPiles: new Array<TableauPileImpl>(7),
      foundationPiles: new Array<FoundationPileImpl>(4),
    }),

    initial: 'restarting',
    states: {
      restarting: {
        after: {
          /** If stock pile is full, we're done returning the cards. */
          300: { cond: 'stockIsFull', target: 'finished' },
          /** Return cards to stock. */
          25: {
            cond: 'stockNotFull',
            actions: ['returnTableau', 'returnFoundation', 'returnWaste'],
            target: 'restarting',
          },
        },
      },
      finished: { type: 'final' },
    },
  },
  {
    actions: {
      returnTableau: ({ stockPile, tableauPiles }) => {
        /** Return card from first non-empty pile. */
        for (const tableauPile of tableauPiles) {
          if (!tableauPile.isEmpty()) {
            const card = tableauPile.drawCard();
            card.addToPile(stockPile, false);
          }
        }
      },
      returnFoundation: ({ stockPile, foundationPiles }) => {
        /** Return card from first non-empty pile. */
        for (const foundationPile of foundationPiles) {
          if (!foundationPile.isEmpty()) {
            const card = foundationPile.drawCard();
            card.addToPile(stockPile, false);
          }
        }
      },
      /** Return card from waste to stock. */
      returnWaste: ({ stockPile, wastePile }) => {
        const card = wastePile.drawCard();
        card?.addToPile(stockPile, false);
      },
    },
    guards: {
      stockIsFull: ({ stockPile }) => stockPile.isFull(),
      stockNotFull: ({ stockPile }) => !stockPile.isFull(),
    },
  },
);
