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

type AutoPlaceContext = {
  card: PlayingCardImpl;
  foundationPiles: FoundationPileImpl[];
};

type AutoPlaceEvents = { type: 'AUTO_PLACE_CARD'; card: PlayingCardImpl };

export const AutoPlaceMachine = createMachine(
  {
    predictableActionArguments: true,
    schema: {
      context: {} as AutoPlaceContext,
      events: {} as AutoPlaceEvents,
    },
    tsTypes: {} as import('./auto-place-machine.typegen').Typegen0,
    id: 'auto-place-machine',

    context: {
      card: null!,
      foundationPiles: null!,
    },
    initial: 'idle',
    states: {
      idle: {
        on: {
          AUTO_PLACE_CARD: {
            target: 'autoPlacing',
            actions: [
              assign({
                card: (_, { card }) => card,
              }),
            ],
          },
        },
      },
      autoPlacing: {
        after: {
          25: [
            {
              cond: 'canPlaceOnFoundation',
              actions: ['autoPlace'],
              target: 'finished',
            },
            { target: 'finished' },
          ],
        },
      },
      finished: { type: 'final' },
    },
  },
  {
    actions: {
      autoPlace: ({ foundationPiles, card }) => {
        card.addToPile(foundationPiles[card.suit], true);
      },
    },
    guards: {
      canPlaceOnFoundation: ({ foundationPiles, card }) => {
        return foundationPiles[card.suit].canPlace(card);
      },
    },
  },
);
