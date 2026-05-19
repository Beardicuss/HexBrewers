import type { Player } from "./playerTypes";
import type { MarketItem } from "./bazaarTypes";
import type { BuyPhaseState } from "./bazaarTypes";
import type { AIMode } from "./aiStrategy";
import { canAfford } from "./bazaar";

function scoreItem(item: MarketItem, mode: AIMode): number {
  const { color, value } = item.token;
  if (color === "white") return mode === "reckless" ? 2 - item.cost * 0.2 : -10;
  const valueScore = value * 3;
  const costScore = -item.cost * 0.4;
  const rarityBonus = color === "black" ? 3 : color === "purple" ? 2 : color === "blue" ? 1.5 : 0;
  return valueScore + costScore + rarityBonus;
}

export function decideMarketPurchases(
  player: Player,
  market: MarketItem[],
  mode: AIMode,
  buyState: BuyPhaseState,
  currentRound: number
): string[] {
  const purchases: string[] = [];
  let state = { ...buyState };
  let lastColor: string | undefined;

  for (let i = 0; i < 2; i++) {
    const affordable = market.filter((item) =>
      canAfford(item, state, currentRound, lastColor)
    );

    if (affordable.length === 0) break;

    const ranked = affordable
      .map((item) => ({ item, score: scoreItem(item, mode) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score);

    if (ranked.length === 0) break;

    const best = ranked[0].item;
    purchases.push(best.id);
    state = { ...state, purchases: [...state.purchases, best.id], coinsSpent: state.coinsSpent + best.cost };
    lastColor = best.token.color;

    if (mode === "conservative") break;
    if (mode === "calculated" && state.coinsAvailable - state.coinsSpent < 3) break;
  }

  return purchases;
}
