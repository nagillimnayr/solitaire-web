import { TableauPileImpl } from '@/components/canvas/piles/tableau-pile/TableauPileImpl';
import { RANK_NAMES, SUITS } from './constants';

export function makePlayingCardName(rank: number, suit: number) {
  return `${RANK_NAMES[rank]}-of-${SUITS[suit]}`;
}

export function flipTableau(tableauPiles: TableauPileImpl[]) {
  /** Iterate through tableaus and flip the first one that isn't face up. */
  for (const tableauPile of tableauPiles) {
    if (tableauPile.needsFlipping) {
      tableauPile.flipTopCard();
      return;
    }
  }
}

export function doTableausNeedFlipping(tableauPiles: TableauPileImpl[]) {
  /** If any piles need flipping, return true. */
  for (const tableauPile of tableauPiles) {
    if (tableauPile.needsFlipping) return true;
  }
  return false;
}
