import type { Token } from "./tokenTypes";

export interface MarketItem {
  id: string;
  token: Token;
  cost: number;       // coin cost
  stock: number;      // how many left (limited supply)
  available: boolean; // false if stock = 0 or unlockRound not reached yet
  unlockRound: number;// round when this color becomes purchasable
}

// Buy phase rules:
// - Max 2 chips per round
// - If buying 2, they must be DIFFERENT colors
// - Coins are the scoring space number — not accumulated
// - Leftover coins are lost
export interface BuyPhaseState {
  purchases: string[];         // item IDs bought so far this round
  coinsSpent: number;
  coinsAvailable: number;
}

export function canBuyItem(
  item: MarketItem,
  state: BuyPhaseState,
  currentRound: number
): boolean {
  if (!item.available || item.stock <= 0) return false;
  if (item.unlockRound > currentRound) return false;
  if (state.purchases.length >= 2) return false;
  if (state.coinsAvailable - state.coinsSpent < item.cost) return false;

  // If already bought 1, second must be a different color
  if (state.purchases.length === 1) {
    // We'd need to check color of first purchase against this item
    // Handled in market.ts
  }

  return true;
}
