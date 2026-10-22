import type { Player } from "./playerTypes";
import type { GameState } from "./gameState";

export type AIMode = "reckless" | "calculated" | "conservative";
export type AIDifficulty = "apprentice" | "skilled" | "master";
export type AIProfile = "shade" | "wraith" | "seer";

export const AI_RISK_TUNING: Record<AIMode, {
  tolerance: number;
  riskPenalty: number;
  improvementRequired: number;
}> = {
  reckless: { tolerance: 0.65, riskPenalty: 0, improvementRequired: 0.01 },
  calculated: { tolerance: 0.4, riskPenalty: 1, improvementRequired: 0 },
  conservative: { tolerance: 0.2, riskPenalty: 2.5, improvementRequired: 0.15 },
};

export interface AIContext {
  round: number;
  totalRounds: number;
  aiScore: number;
  humanScore: number;
  leaderScore: number;
  scoreDelta: number;    // AI score minus strongest opponent (negative = AI is losing)
  difficulty: AIDifficulty;
  profile: AIProfile;
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
  const leaderScore = Math.max(...state.players.map((player) => player.score));
  const strongestOpponentScore = Math.max(
    ...state.players.filter((player) => player.id !== aiPlayer.id).map((player) => player.score),
  );

  return {
    round: state.currentRound,
    totalRounds: state.totalRounds,
    aiScore: aiPlayer.score,
    humanScore,
    leaderScore,
    scoreDelta: aiPlayer.score - strongestOpponentScore,
    difficulty: state.aiDifficulty,
    profile: getAIProfile(aiPlayer),
    isLastThreeRounds: state.currentRound >= state.totalRounds - 2,
    isFirstThreeRounds: state.currentRound <= 3,
  };
}

// Determine which AI mode to use this round.
// The AI adapts its personality based on game situation.
export function selectAIMode(context: AIContext): AIMode {
  const { scoreDelta, isLastThreeRounds, isFirstThreeRounds, difficulty, profile } = context;

  if (difficulty === "apprentice") {
    return isLastThreeRounds && scoreDelta < -15 ? "calculated" : "conservative";
  }

  // Desperate comeback — losing badly with little time left
  if (isLastThreeRounds && scoreDelta < -15) {
    return "reckless";
  }

  // Safe lead — winning comfortably, protect the advantage
  if (scoreDelta > 20) {
    return "conservative";
  }

  if (difficulty === "master" && !isLastThreeRounds) {
    if (profile === "shade" && scoreDelta < 10) return "reckless";
    if (profile === "seer" && scoreDelta >= -5) return "conservative";
    return "calculated";
  }

  // Early game — explore aggressively to build score fast
  if (isFirstThreeRounds && difficulty === "skilled") {
    return "reckless";
  }

  // Late game close race — calculate every risk carefully
  if (isLastThreeRounds && Math.abs(scoreDelta) <= 15) {
    return "calculated";
  }

  // Default mid-game: calculated play
  return "calculated";
}

export function getAIProfile(player: Player): AIProfile {
  if (player.id === "ai-2") return "wraith";
  if (player.id === "ai-3") return "seer";
  return "shade";
}

// Per-mode explosion risk tolerance.
// If actual explosion probability exceeds this threshold, AI stops drawing.
export function getRiskTolerance(mode: AIMode): number {
  return AI_RISK_TUNING[mode].tolerance;
}
