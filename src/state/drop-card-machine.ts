import { StockPileImpl } from '@/components/canvas/piles/stock-pile/StockPileImpl';
import { WastePileImpl } from '@/components/canvas/piles/waste-pile/WastePileImpl';
import { TableauPileImpl } from '@/components/canvas/piles/tableau-pile/TableauPileImpl';
import { FoundationPileImpl } from '@/components/canvas/piles/foundation-pile/FoundationPileImpl';
import { PlayingCardImpl } from '@/components/canvas/playing-card/PlayingCardImpl';
import { CarryPileImpl } from '@/components/canvas/piles/carry-pile/CarryPileImpl';
import { assign, createMachine, log } from 'xstate';

type DropCardContext = {
  carryPile: CarryPileImpl;
};

type DropCardEvents = { type: 'DOUBLE_CLICK_CARD'; card: PlayingCardImpl };

export const DropCardMachine = createMachine(
  {
    predictableActionArguments: true,
    schema: {
      context: {} as DropCardContext,
      events: {} as DropCardEvents,
    },
    tsTypes: {} as import('./drop-card-machine.typegen').Typegen0,
    id: 'drop-card-machine',

    context: {
      carryPile: null!,
    },

    initial: 'droppingCards',
    states: {
      droppingCards: {
        after: [
          { cond: 'carryPileIsEmpty', target: 'finished', delay: 0 },
          {
            // cond: 'carryPileNotEmpty',
            actions: ['dropCard'],
            target: 'droppingCards',
            delay: 10,
          },
        ],
      },
      finished: { type: 'final' },
    },
  },
  {
    actions: {
      dropCard: ({ carryPile }) => {
        carryPile.dropCard();
      },
    },
    guards: {
      carryPileIsEmpty: ({ carryPile }) => carryPile.isEmpty(),
      carryPileNotEmpty: ({ carryPile }) => !carryPile.isEmpty(),
    },
  },
);
