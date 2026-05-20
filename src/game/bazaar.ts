import type { MarketItem, BuyPhaseState } from "./bazaarTypes";
import type { Player } from "./playerTypes";
import type { Token } from "./tokenTypes";

// Check if a player can buy a specific item given current buy phase state
export function canAfford(
  item: MarketItem,
  state: BuyPhaseState,
  currentRound: number,
  alreadyBoughtColor?: string
): boolean {
  if (!item.available || item.stock <= 0) return false;
  if (item.unlockRound > currentRound) return false;
  if (state.purchases.length >= 2) return false;
  if (state.coinsAvailable - state.coinsSpent < item.cost) return false;

  // Second purchase must be different color
  if (alreadyBoughtColor && item.token.color === alreadyBoughtColor) return false;

  return true;
}

// Purchase an item — updates market stock, player bag, coins spent
export function purchaseItem(
  player: Player,
  market: MarketItem[],
  state: BuyPhaseState,
  itemId: string,
  currentRound: number
): { player: Player; market: MarketItem[]; state: BuyPhaseState } {
  const item = market.find((i) => i.id === itemId);
  if (!item) throw new Error(`Market item not found: ${itemId}`);

  // Get color of first purchase if this is second
  const alreadyBoughtColor =
    state.purchases.length === 1
      ? market.find((i) => i.id === state.purchases[0])?.token.color
      : undefined;

  if (!canAfford(item, state, currentRound, alreadyBoughtColor)) {
    throw new Error(`Cannot buy item: ${itemId}`);
  }

  const updatedMarket = market.map((i) =>
    i.id === itemId
      ? { ...i, stock: i.stock - 1, available: i.stock - 1 > 0 }
      : i
  );

  const purchasedToken: Token = {
    ...item.token,
    id: `${item.token.color}-${item.token.value}-${player.id}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  };

  const updatedPlayer: Player = {
    ...player,
    bag: { tokens: [...player.bag.tokens, purchasedToken] },
  };

  const updatedState: BuyPhaseState = {
    ...state,
    purchases: [...state.purchases, itemId],
    coinsSpent: state.coinsSpent + item.cost,
  };

  return { player: updatedPlayer, market: updatedMarket, state: updatedState };
}

// Reset availability based on stock (called between rounds — stock persists)
export function refreshMarketAvailability(
  market: MarketItem[],
  currentRound: number
): MarketItem[] {
  return market.map((item) => ({
    ...item,
    available: item.stock > 0 && item.unlockRound <= currentRound,
  }));
}

export function getAvailableItems(
  market: MarketItem[],
  currentRound: number
): MarketItem[] {
  return market.filter((i) => i.available && i.unlockRound <= currentRound && i.stock > 0);
}
