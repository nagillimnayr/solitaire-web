import { MeshBasicMaterial } from 'three';

export const NUMBER_OF_CARDS = 52;
export const NUMBER_OF_RANKS = 13;
export const NUMBER_OF_SUITS = 4;

export const CARD_WIDTH = 63.5e-3; // 63.5mm
export const CARD_HEIGHT = 88.9e-3; // 88.9mm
export const CARD_WIDTH_HALF = CARD_WIDTH / 2;
export const CARD_HEIGHT_HALF = CARD_HEIGHT / 2;
export const CARD_ASPECT_RATIO = CARD_WIDTH / CARD_HEIGHT;

export const OUTLINE_BORDER_WIDTH = 0.03 * CARD_WIDTH;
export const OUTLINE_BORDER_PADDING = 0.02 * CARD_WIDTH;

export const SMOOTH_TIME = 0.25;
export const Z_OFFSET = 1e-3;
export const Y_OFFSET = CARD_HEIGHT * 0.1;

export const PILE_X_MARGIN = CARD_WIDTH * 0.1; // X-margin around piles.
export const PILE_Y_MARGIN = CARD_HEIGHT * 0.1; // Y-margin around piles.

export const CARD_WIDTH_WITH_MARGIN = CARD_WIDTH + PILE_X_MARGIN * 2;
export const CARD_WIDTH_HALF_WITH_MARGIN = CARD_WIDTH_HALF + PILE_X_MARGIN;
export const CARD_HEIGHT_WITH_MARGIN = CARD_HEIGHT + PILE_Y_MARGIN * 2;
export const CARD_HEIGHT_HALF_WITH_MARGIN = CARD_HEIGHT_HALF + PILE_Y_MARGIN;

export const BACKGROUND_COLOR = '#03C03C';

// export const SUITS = Object.freeze(['Diamonds', 'Clubs', 'Hearts', 'Spades']);

export const SUITS = {
  0: 'Diamonds',
  1: 'Clubs',
  2: 'Hearts',
  3: 'Spades',
} as const;
export const SUIT_NAMES = {
  Diamonds: 0,
  Clubs: 1,
  Hearts: 2,
  Spades: 3,
} as const;

export type Suit = keyof typeof SUITS;
export const RANKS = Object.freeze([
  'A',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  'J',
  'Q',
  'K',
]);
export const RANK_NAMES = Object.freeze([
  'Ace',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Jack',
  'Queen',
  'King',
]);

export const ICON_MATERIAL = new MeshBasicMaterial();

export const PI = Math.PI;
export const PI_2 = PI * 2;
export const PI_OVER_2 = PI / 2;
export const PI_OVER_3 = PI / 3;
export const PI_OVER_4 = PI / 4;
export const PI_OVER_6 = PI / 6;
