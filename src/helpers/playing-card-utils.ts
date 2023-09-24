import { TableauPileImpl } from '@/components/canvas/piles/tableau-pile/TableauPileImpl';
import { RANK_NAMES, SUITS } from './constants';
import { FoundationPileImpl } from '@/components/canvas/piles/foundation-pile/FoundationPileImpl';

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

/** Check if any tableaus need flipping. */
export function doTableausNeedFlipping(tableauPiles: TableauPileImpl[]) {
  /** If any piles need flipping, return true. */
  for (const tableauPile of tableauPiles) {
    if (tableauPile.needsFlipping) return true;
  }
  return false;
}

/** Check if all foundations are full. */
export function areAllFoundationsFull(foundationPiles: FoundationPileImpl[]) {
  for (const foundationPile of foundationPiles) {
    /** If any are not full, return false. */
    if (!foundationPile.isFull()) return false;
  }
  return true;
}
