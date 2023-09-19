export const CARD_WIDTH = 63.5e-3; // 63.5mm
export const CARD_HEIGHT = 88.9e-3; // 88.9mm
export const CARD_WIDTH_HALF = CARD_WIDTH / 2;
export const CARD_HEIGHT_HALF = CARD_HEIGHT / 2;
export const CARD_ASPECT_RATIO = CARD_WIDTH / CARD_HEIGHT;
export const PILE_X_OFFSET = CARD_WIDTH_HALF + CARD_WIDTH * 0.05; // X-offset between piles.

export const BACKGROUND_COLOR = '#03C03C';

export const SUITS = Object.freeze(['Diamonds', 'Clubs', 'Hearts', 'Spades']);
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
