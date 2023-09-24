import { StockPileImpl } from '@/components/canvas/piles/stock-pile/StockPileImpl';
import { WastePileImpl } from '@/components/canvas/piles/waste-pile/WastePileImpl';

import { createMachine, log } from 'xstate';

type ReturnWasteContext = {
  stockPile: StockPileImpl;
  wastePile: WastePileImpl;
};

export const ReturnWasteMachine = createMachine(
  {
    predictableActionArguments: true,
    schema: {
      context: {} as ReturnWasteContext,
    },
    tsTypes: {} as import('./return-waste-machine.typegen').Typegen0,
    id: 'return-waste-machine',

    context: () => ({
      stockPile: null!,
      wastePile: null!,
    }),

    initial: 'returningWaste',
    states: {
      returningWaste: {
        after: {
          25: [
            { cond: 'wasteIsEmpty', target: 'finished' },
            { actions: ['returnWaste'], target: 'returningWaste' },
          ],
        },
      },
      finished: { type: 'final' },
    },
  },
  {
    actions: {
      returnWaste: ({ stockPile, wastePile }) => {
        const card = wastePile.drawCard();
        card?.addToPile(stockPile, false);
      },
    },
    guards: {
      wasteIsEmpty: ({ wastePile }) => wastePile.isEmpty(),
    },
  },
);
