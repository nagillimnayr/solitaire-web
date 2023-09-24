import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { PlayingCardImpl } from '@/components/canvas/playing-card/PlayingCardImpl';
import { StockPileImpl } from '@/components/canvas/piles/stock-pile/StockPileImpl';
import { WastePileImpl } from '@/components/canvas/piles/waste-pile/WastePileImpl';
import { TableauPileImpl } from '@/components/canvas/piles/tableau-pile/TableauPileImpl';
import { FoundationPileImpl } from '@/components/canvas/piles/foundation-pile/FoundationPileImpl';
import {
  CARD_WIDTH_HALF_WITH_MARGIN,
  CARD_WIDTH_WITH_MARGIN,
  NUMBER_OF_CARDS,
  Y_OFFSET,
  Z_OFFSET,
} from '@/helpers/constants';
import { Vector3 } from 'three';
import { randInt } from 'three/src/math/MathUtils';
import { Stack } from '@datastructures-js/stack';
import { CarryPileImpl } from '@/components/canvas/piles/carry-pile/CarryPileImpl';
import { RootState } from '@react-three/fiber';
import { CameraControls } from 'three-stdlib';

type GameState = {
  getThree: () => RootState;
  stockPile: StockPileImpl;
  wastePile: WastePileImpl;
  foundationPiles: FoundationPileImpl[];
  tableauPiles: TableauPileImpl[];
  carryPile: CarryPileImpl;
};

const initialState: GameState = {
  getThree: null!,
  stockPile: null!,
  wastePile: null!,
  foundationPiles: new Array<FoundationPileImpl>(4),
  tableauPiles: new Array<TableauPileImpl>(7),
  carryPile: null!,
};

export const useGameStore = create<GameState>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    /** Actions. */
    setGetThree: (getThree: () => RootState) => set({ getThree }),
    setStockPile: (stockPile: StockPileImpl) => set({ stockPile }),
    setWastePile: (wastePile: WastePileImpl) => set({ wastePile }),
    setFoundationPile: (foundationPile: FoundationPileImpl) =>
      set((state) => {
        const foundationPiles = state.foundationPiles.slice();
        foundationPiles[foundationPile.suit] = foundationPile;
        return { foundationPiles };
      }),
    setTableauPile: (tableauPile: TableauPileImpl) =>
      set((state) => {
        const tableauPiles = state.tableauPiles.slice();
        tableauPiles[tableauPile.index] = tableauPile;
        return { tableauPiles };
      }),
    setCarryPile: (carryPile: CarryPileImpl) => set({ carryPile }),

    /** Selectors. */
    /** Check if all foundations are full. */
    areAllFoundationsFull: () => {
      const { foundationPiles } = get();
      for (const foundationPile of foundationPiles) {
        if (!foundationPile.isFull()) return false;
      }
      return true;
    },
    /** Check if all cards have been uncovered. */
    areAllCardsUncovered: () => {
      const { tableauPiles } = get();
      for (const tableauPile of tableauPiles) {
        if (!tableauPile.isAllFaceUp()) return false;
      }
      return true;
    },

    /** Check if all foundations are empty. */
    areFoundationsEmpty: () => {
      const { foundationPiles } = get();
      /** If any piles are not empty, return true. */
      for (const foundationPile of foundationPiles) {
        if (!foundationPile.isEmpty()) return true;
      }
      return false;
    },

    /** Check if all tableau piles are empty. */
    areTableausEmpty: () => {
      const { tableauPiles } = get();
      /** If any piles are not empty, return false. */
      for (const tableauPile of tableauPiles) {
        if (!tableauPile.isEmpty()) return false;
      }
      return true;
    },

    isStockFull: () => {
      const { stockPile } = get();
      return stockPile.isFull();
    },
    isWasteEmpty: () => {
      const { wastePile } = get();
      return wastePile.isEmpty();
    },
  })),
);
