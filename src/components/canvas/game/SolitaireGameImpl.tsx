import { RootState } from '@react-three/fiber';
import { StockPileImpl } from '../piles/stock-pile/StockPileImpl';
import { WastePileImpl } from '../piles/waste-pile/WastePileImpl';
import { FoundationPileImpl } from '../piles/foundation-pile/FoundationPileImpl';
import { TableauPileImpl } from '../piles/tableau-pile/TableauPileImpl';
import { CarryPileImpl } from '../piles/carry-pile/CarryPileImpl';

export class SolitaireGameImpl {
  private _getThree: () => RootState;
  private _stockPile: StockPileImpl;
  private _wastePile: WastePileImpl;
  private _tableauPiles: TableauPileImpl[] = new Array<TableauPileImpl>(7);
  private _foundationPiles: FoundationPileImpl[] =
    new Array<FoundationPileImpl>(4);
  private _carryPile: CarryPileImpl;

  constructor() {
    /**  */
  }

  set getThree(getThree: () => RootState) {
    this._getThree = getThree;
  }

  get stockPile() {
    return this._stockPile;
  }
  setStockPile(stockPile: StockPileImpl) {
    this._stockPile = stockPile;
  }

  get wastePile() {
    return this._wastePile;
  }

  get carryPile() {
    return this._carryPile;
  }
  setCarryPile(carryPile: CarryPileImpl) {
    this._carryPile = carryPile;
  }

  get tableauPiles() {
    return this._tableauPiles;
  }
  setTableauPile(tableauPile: TableauPileImpl) {
    this._tableauPiles[tableauPile.index] = tableauPile;
  }

  get foundationPiles() {
    return this._foundationPiles;
  }
  setFoundationPile(foundationPile: FoundationPileImpl) {
    this._foundationPiles[foundationPile.suit] = foundationPile;
  }

  getPiles() {
    return {
      stockPile: this.stockPile,
      wastePile: this.wastePile,
      tableauPiles: this.tableauPiles,
      foundationPiles: this.foundationPiles,
      carryPile: this.carryPile,
    };
  }

  /** Actions. */

  returnTableau() {
    /** Return card from first non-empty pile. */
    for (const tableauPile of this._tableauPiles) {
      if (!tableauPile.isEmpty()) {
        const card = tableauPile.drawCard();
        card.addToPile(this._stockPile, false);
      }
    }
  }

  returnFoundation() {
    /** Return card from first non-empty pile. */
    for (const foundationPile of this._foundationPiles) {
      if (!foundationPile.isEmpty()) {
        const card = foundationPile.drawCard();
        card.addToPile(this._stockPile, false);
      }
    }
  }

  returnWaste() {
    const card = this._wastePile.drawCard();
    card?.addToPile(this._stockPile, false);
  }
}
