import { RANK_NAMES, SUITS } from './constants';

export function makePlayingCardName(rank: number, suit: number) {
  return `${RANK_NAMES[rank]}-of-${SUITS[suit]}`;
}
