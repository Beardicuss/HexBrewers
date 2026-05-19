import type { Player } from "./playerTypes";
import type { GameState } from "./gameState";

export type AIMode = "reckless" | "calculated" | "conservative";

export interface AIContext {
  round: number;
  totalRounds: number;
  aiScore: number;
  humanScore: number;
  scoreDelta: number;    // aiScore - humanScore (negative = AI is losing)
  isLastThreeRounds: boolean;
  isFirstThreeRounds: boolean;
}

// Build context snapshot for AI decision-making.
export function buildAIContext(
  state: GameState,
  aiPlayer: Player
): AIContext {
  const humanPlayer = state.players.find((p) => p.kind === "human");
  const humanScore = humanPlayer?.score ?? 0;

  return {
    round: state.currentRound,
    totalRounds: state.totalRounds,
    aiScore: aiPlayer.score,
    humanScore,
    scoreDelta: aiPlayer.score - humanScore,
    isLastThreeRounds: state.currentRound >= state.totalRounds - 2,
    isFirstThreeRounds: state.currentRound <= 3,
  };
}

// Determine which AI mode to use this round.
// The AI adapts its personality based on game situation.
export function selectAIMode(context: AIContext): AIMode {
  const { scoreDelta, isLastThreeRounds, isFirstThreeRounds } = context;

  // Desperate comeback — losing badly with little time left
  if (isLastThreeRounds && scoreDelta < -15) {
    return "reckless";
  }

  // Safe lead — winning comfortably, protect the advantage
  if (scoreDelta > 20) {
    return "conservative";
  }

  // Early game — explore aggressively to build score fast
  if (isFirstThreeRounds) {
    return "reckless";
  }

  // Late game close race — calculate every risk carefully
  if (isLastThreeRounds && Math.abs(scoreDelta) <= 15) {
    return "calculated";
  }

  // Default mid-game: calculated play
  return "calculated";
}

// Per-mode explosion risk tolerance.
// If actual explosion probability exceeds this threshold, AI stops drawing.
export function getRiskTolerance(mode: AIMode): number {
  switch (mode) {
    case "reckless":     return 0.55; // tolerates up to 55% explosion chance
    case "calculated":  return 0.28; // stops above 28%
    case "conservative": return 0.12; // very cautious, stops above 12%
  }
}
