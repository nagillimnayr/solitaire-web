export const CARD_WIDTH = 63.5e-3; // 63.5mm
export const CARD_HEIGHT = 88.9e-3; // 88.9mm
export const CARD_ASPECT_RATIO = CARD_WIDTH / CARD_HEIGHT;

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
const textureUrls = new Array<string>();
SUITS.forEach((suit) => {
  RANKS.forEach((rank) => {
    const url = `textures/kenney/card${suit}${rank}.png`;
    textureUrls.push(url);
  });
});
export const CARD_TEXTURE_URLS = textureUrls.slice();
