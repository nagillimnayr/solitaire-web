import { Pile } from '@/components/canvas/piles/Pile';
import { PlayingCardImpl } from '@/components/canvas/playing-card/PlayingCardImpl';

export class StockPileImpl extends Pile {
  constructor() {
    super();
    this.name = `stock-pile`;
  }

  addToPile(card: PlayingCardImpl) {
    //
  }

  shuffleDeck() {
    //
  }
  dealCards() {
    //
  }
  drawCard() {
    //
  }
  returnAllCardsToDeck() {
    this.dispatchEvent({ type: 'RETURN_ALL_CARDS' });
  }
}
