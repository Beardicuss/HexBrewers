import type { Player } from "./playerTypes";
import type { MarketItem } from "./bazaarTypes";
import type { BuyPhaseState } from "./bazaarTypes";
import type { AIMode } from "./aiStrategy";
import type { GameState } from "./gameState";
import type { TokenColor } from "./tokenTypes";
import { canAfford } from "./bazaar";
import { countByColor } from "./bag";

function colorCount(player: Player, color: TokenColor): number {
  return (
    countByColor(player.bag, color) +
    player.crucible.slots.filter((slot) => slot.token?.color === color).length
  );
}

function omenScore(item: MarketItem, state?: GameState): number {
  const omen = state?.currentOmen;
  if (!omen) return 0;

  if (omen.effect.type === "bonus_for_color" && item.token.color === omen.effect.color) {
    return 6;
  }

  if (omen.effect.type === "bonus_for_white_limit" && item.token.color !== "white") {
    return 2;
  }

  if (omen.effect.type === "double_ruby_space" && ["blue", "red", "yellow"].includes(item.token.color)) {
    return 1.5;
  }

  return 0;
}

function synergyScore(player: Player, item: MarketItem): number {
  const { color, value } = item.token;

  if (color === "red") {
    return Math.min(4, colorCount(player, "orange") * 1.5);
  }

  if (color === "yellow") {
    return Math.min(3, colorCount(player, "white") * 0.35);
  }

  if (color === "blue") {
    return value >= 2 ? 2 : 1;
  }

  if (color === "purple") {
    return Math.min(4, 1 + colorCount(player, "purple"));
  }

  if (color === "black") {
    return Math.min(3, 1 + colorCount(player, "black"));
  }

  return 0;
}

function scoreItem(player: Player, item: MarketItem, mode: AIMode, state?: GameState): number {
  const { color, value } = item.token;
  if (color === "white") return mode === "reckless" ? 2 - item.cost * 0.2 : -10;
  const valueScore = value * 2.6;
  const costScore = -item.cost * 0.4;
  const rarityBonus = color === "black" ? 3 : color === "purple" ? 2.5 : color === "blue" ? 1.5 : 0;
  const modeBias =
    mode === "reckless" && value >= 4 ? 2 :
      mode === "conservative" && item.cost <= 8 ? 1.5 :
        0;
  return valueScore + costScore + rarityBonus + modeBias + synergyScore(player, item) + omenScore(item, state);
}

export function decideMarketPurchases(
  player: Player,
  market: MarketItem[],
  mode: AIMode,
  buyState: BuyPhaseState,
  currentRound: number,
  gameState?: GameState
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
      .map((item) => ({ item, score: scoreItem(player, item, mode, gameState) }))
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
