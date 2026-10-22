import type { Player } from "./playerTypes";
import type { MarketItem } from "./bazaarTypes";
import type { BuyPhaseState } from "./bazaarTypes";
import { getAIProfile, type AIMode } from "./aiStrategy";
import type { GameState } from "./gameState";
import type { TokenColor } from "./tokenTypes";
import { canAfford } from "./bazaar";
import { countByColor } from "./bag";
import { getPlacedTokens } from "./crucible";
import { getRecipeSetForColor } from "./recipeBooks";
import { echoMovementValue } from "./brewingRules";

function colorCount(player: Player, color: TokenColor): number {
  return (
    countByColor(player.bag, color) +
    getPlacedTokens(player.crucible).filter((token) => token.color === color).length
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

function masterStrategicScore(player: Player, item: MarketItem, state: GameState): number {
  const { color, value } = item.token;
  const movementValue = color === "echo" ? echoMovementValue(player, state) : value;
  const remainingRounds = state.totalRounds - state.currentRound + 1;
  const longevity = remainingRounds / state.totalRounds;
  let score = movementValue * longevity * 1.1;
  const profile = getAIProfile(player);
  if (profile === "shade" && value >= 4) score += 1.2;
  if (profile === "wraith" && color !== "orange" && color !== "white") score += 0.8 + colorCount(player, color) * 0.2;
  if (profile === "seer" && item.stock <= 3) score += 0.9;

  if (item.stock <= 2) {
    const opponentDemand = Math.max(
      0,
      ...state.players
        .filter((candidate) => candidate.id !== player.id)
        .map((candidate) => colorCount(candidate, color)),
    );
    score += (item.stock === 1 ? 1.4 : 0.7) + Math.min(2, opponentDemand * 0.3);
  }

  const set = getRecipeSetForColor(state.recipeBooks, color);
  if (color === "blue") score += set === 1 ? value * 0.45 : set === 2 ? value * 0.35 : 0.5;
  if (color === "blue" && set === 5) score += 1.2;
  if (color === "blue" && set === 6) score += value * 0.4;
  if (color === "red" && set === 1) score += Math.min(2.5, colorCount(player, "orange") * 0.6);
  if (color === "red" && set === 4) score += Math.min(2, colorCount(player, "white") * 0.2);
  if (color === "red" && set === 5) score += Math.min(2.4, new Set(player.bag.tokens.map((token) => token.color)).size * 0.3);
  if (color === "red" && set === 6) score += Math.min(2.5, colorCount(player, "echo") * 0.8);
  if (color === "yellow" && set === 3) score += Math.min(2.5, colorCount(player, "white") * 0.25);
  if (color === "yellow" && (set === 5 || set === 6)) score += Math.min(2.5, colorCount(player, "white") * 0.3);
  if (color === "green") score += Math.min(2, colorCount(player, "green") * 0.35);
  if (color === "green" && (set === 5 || set === 6)) score += 1.1;
  if (color === "purple") score += Math.min(3, colorCount(player, "purple") * 0.8);
  if (color === "purple" && (set === 5 || set === 6)) score += Math.min(2.5, colorCount(player, color) * 0.6 + 0.8);

  if (color === "black") {
    const seat = state.players.findIndex((candidate) => candidate.id === player.id);
    if (seat >= 0) {
      const neighborIds = state.players.length === 2
        ? [(seat + 1) % 2]
        : [(seat - 1 + state.players.length) % state.players.length, (seat + 1) % state.players.length];
      const neighborMaximum = Math.max(...neighborIds.map((index) => colorCount(state.players[index], "black")));
      score += colorCount(player, "black") <= neighborMaximum ? 2.2 : 0.6;
    }
  }

  return score;
}

function scoreItem(player: Player, item: MarketItem, mode: AIMode, state?: GameState): number {
  const { color, value } = item.token;
  if (color === "white") return mode === "reckless" ? 2 - item.cost * 0.2 : -10;
  const movementValue = color === "echo" && state ? echoMovementValue(player, state) : color === "echo" ? 1 : value;
  const valueScore = movementValue * 2.6;
  const costScore = -item.cost * 0.4;
  const rarityBonus = color === "black" ? 3 : color === "purple" ? 2.5 : color === "blue" ? 1.5 : 0;
  const modeBias =
    mode === "reckless" && movementValue >= 4 ? 2 :
      mode === "conservative" && item.cost <= 8 ? 1.5 :
        0;
  const strategic = state?.aiDifficulty === "master" ? masterStrategicScore(player, item, state) : 0;
  const activeSet = state ? getRecipeSetForColor(state.recipeBooks, color) : 1;
  const remainingRounds = state ? state.totalRounds - state.currentRound + 1 : 1;
  const expansionSynergy =
    color === "echo" && state && getRecipeSetForColor(state.recipeBooks, "red") === 6
      ? 3 + Math.min(2, colorCount(player, "red") * 0.5)
      : color === "yellow" && (activeSet === 5 || activeSet === 6)
        ? 1.5 + remainingRounds * 0.2
        : color === "purple" && activeSet === 5
          ? 2 + remainingRounds * 0.45
          : color === "purple" && activeSet === 6
            ? 2.5 + remainingRounds * 0.4 + colorCount(player, "purple") * 1.5
          : color === "blue" && activeSet === 6
            ? 1
            : 0;
  return valueScore + costScore + rarityBonus + modeBias + synergyScore(player, item) + omenScore(item, state) + strategic + expansionSynergy;
}

export function decideMarketPurchases(
  player: Player,
  market: MarketItem[],
  mode: AIMode,
  buyState: BuyPhaseState,
  currentRound: number,
  gameState?: GameState
): string[] {
  const candidates = market.filter((item) => canAfford(item, buyState, currentRound));
  const bundles: Array<{ ids: string[]; score: number }> = [{ ids: [], score: 0 }];

  for (const item of candidates) {
    bundles.push({ ids: [item.id], score: scoreItem(player, item, mode, gameState) });
  }

  for (let firstIndex = 0; firstIndex < candidates.length; firstIndex++) {
    for (let secondIndex = firstIndex + 1; secondIndex < candidates.length; secondIndex++) {
      const first = candidates[firstIndex];
      const second = candidates[secondIndex];
      if (first.token.color === second.token.color) continue;
      if (first.cost + second.cost > buyState.coinsAvailable - buyState.coinsSpent) continue;
      const diversityBonus = 0.75;
      bundles.push({
        ids: [first.id, second.id],
        score: scoreItem(player, first, mode, gameState) + scoreItem(player, second, mode, gameState) + diversityBonus,
      });
    }
  }

  const best = bundles.sort((a, b) => b.score - a.score)[0];
  return best.score > 0 ? best.ids : [];
}
