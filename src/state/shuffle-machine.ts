import { StockPileImpl } from '@/components/canvas/piles/stock-pile/StockPileImpl';
import { PlayingCardImpl } from '@/components/canvas/playing-card/PlayingCardImpl';
import { assign, createMachine, log } from 'xstate';
import {
  CARD_WIDTH_HALF_WITH_MARGIN,
  CARD_WIDTH_WITH_MARGIN,
  NUMBER_OF_CARDS,
  Y_OFFSET,
  Z_OFFSET,
} from '@/helpers/constants';
import { Vector3 } from 'three';
import { randInt } from 'three/src/math/MathUtils';

const HALF_DECK_SIZE = NUMBER_OF_CARDS / 2;
const _pos1 = new Vector3();
const _pos2 = new Vector3();

/** Helper for shuffling the deck. */
type SplitPiles = {
  pile1: PlayingCardImpl[];
  pile2: PlayingCardImpl[];
};

type ShuffleContext = {
  stockPile: StockPileImpl;

  splitPiles: SplitPiles; // Helper for shuffling the deck.
};

export const ShuffleMachine = createMachine(
  {
    predictableActionArguments: true,
    schema: {
      context: {} as ShuffleContext,
    },
    tsTypes: {} as import('./shuffle-machine.typegen').Typegen0,
    id: 'shuffle-machine',

    context: () => ({
      stockPile: null!,
      splitPiles: null!,
    }),

    /** Initialize splitPiles on entry. */
    entry: [
      assign({
        splitPiles: () => ({
          pile1: new Array<PlayingCardImpl>(),
          pile2: new Array<PlayingCardImpl>(),
        }),
      }),
    ],

    initial: 'splitting',
    states: {
      splitting: {
        after: {
          200: {
            /** Once the stockPile is empty, transition to shuffling. */
            cond: 'stockIsEmpty',
            target: 'shuffling',
          },
          20: {
            cond: 'stockNotEmpty',
            /** Take cards from the stockPile and add them to splitPiles.*/
            actions: ['splitDeck'],
            /** Recursively self transition. */
            target: 'splitting',
          },
        },
      },
      shuffling: {
        after: {
          /** When stock is full again, shuffling is finished.. */
          500: { cond: 'stockIsFull', target: 'finished' },
          20: {
            cond: 'stockNotFull',
            /** Add the cards back to the stockPile in a random order.*/
            actions: ['shuffleDeck'],
            target: 'shuffling',
          },
        },
      },
      finished: { type: 'final' },
    },
  },
  {
    actions: {
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
    },
    guards: {
      stockIsFull: ({ stockPile }) => stockPile.isFull(),
      stockNotFull: ({ stockPile }) => !stockPile.isFull(),
      stockIsEmpty: ({ stockPile }) => stockPile.isEmpty(),
      stockNotEmpty: ({ stockPile }) => !stockPile.isEmpty(),
    },
  },
);
