import type { Player } from "./playerTypes";
import type { GameState } from "./gameState";
import type { MarketItem } from "./bazaarTypes";
import type { BuyPhaseState } from "./bazaarTypes";
import { buildAIContext, selectAIMode, getRiskTolerance, type AIMode } from "./aiStrategy";
import { explosionProbabilityOnNextDraw, remainingWhiteCapacity } from "./aiProbability";
import { decideMarketPurchases } from "./aiMarket";
import { hasExploded } from "./crucible";
import { canUseFlask } from "./flask";
import type { ExplodedChoice } from "./scoring";
import type { RoundScoreResult } from "./scoring";

export type BrewingDecision = "draw" | "stop";

export function decideBrewingAction(player: Player, state: GameState): BrewingDecision {
  const { crucible, bag } = player;
  if (hasExploded(crucible)) return "stop";
  if (bag.tokens.length === 0) return "stop";

  const wouldCertainlyExplode = bag.tokens.every(
    (t) => t.color === "white" && t.value > remainingWhiteCapacity(crucible)
  );
  if (wouldCertainlyExplode) return "stop";

  const context = buildAIContext(state, player);
  const mode = selectAIMode(context);
  const tolerance = getRiskTolerance(mode);
  const risk = explosionProbabilityOnNextDraw(bag, crucible);

  return risk <= tolerance ? "draw" : "stop";
}

// Flask: AI can only use on last drawn white token (same rule as human)
export function decideFlaskUse(player: Player, state: GameState): boolean {
  if (!canUseFlask(player)) return false;

  const token = player.crucible.lastDrawnToken;
  if (!token || token.color !== "white") return false;

  const context = buildAIContext(state, player);
  const mode = selectAIMode(context);
  const capacityAfterDraw = remainingWhiteCapacity(player.crucible);

  if (player.crucible.exploded) return false; // can't use if it caused explosion

  if (mode === "calculated" && capacityAfterDraw <= 1 && context.round <= 6) return true;
  if (mode === "conservative" && capacityAfterDraw <= 2) return true;

  return false;
}

export function decideExplodedChoice(
  player: Player,
  result: RoundScoreResult,
  state: GameState
): ExplodedChoice {
  const context = buildAIContext(state, player);
  if (context.scoreDelta < -5) return "vp";
  if (player.rubies < 2 && player.coinsThisRound < 4) return "coins";
  if (context.isLastThreeRounds) return "vp";
  return "coins";
}

export function decideMarketTurn(
  player: Player,
  market: MarketItem[],
  state: GameState
): string[] {
  const context = buildAIContext(state, player);
  const mode = selectAIMode(context);
  const buyState: BuyPhaseState = {
    purchases: [],
    coinsSpent: 0,
    coinsAvailable: player.coinsThisRound,
  };
  return decideMarketPurchases(player, market, mode, buyState, state.currentRound, state);
}
