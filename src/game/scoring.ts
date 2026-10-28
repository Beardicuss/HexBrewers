import type { Crucible } from "./crucibleTypes";
import type { Player } from "./playerTypes";
import type { PlayerKind } from "./playerTypes";
import type { AIDifficulty } from "./aiStrategy";
import { SPACE_VP, getCoinsForSpace, RUBY_SPACES, getScoringSpace } from "./crucibleTypes";

export interface RoundScoreResult {
  space: number;       // the scoring space (filledUpTo)
  vp: number;          // victory points from that space
  coins: number;       // coins available to spend in buy phase
  baseCoins?: number;  // printed track value before a human difficulty adjustment
  ruby: boolean;       // whether a ruby is earned (all players, even exploded)
  exploded: boolean;
  overflowValue?: number;
  overflowVp?: number;
}

// Calculate end-of-round results from crucible state.
// Ruby is earned by ALL players regardless of explosion.
// If exploded: player chooses VP or coins (not both).
// If survived: player earns both VP and coins.
export function calculateRoundScore(crucible: Crucible): RoundScoreResult {
  const space = getScoringSpace(crucible.filledUpTo);
  const overflowValue = crucible.overflowTokens.reduce(
    (total, token) => total + (token.resolvedMovement ?? token.value),
    0,
  );
  const overflowVp = Math.floor(overflowValue / 2);
  const vp = (SPACE_VP[space] ?? 0) + overflowVp;
  const coins = getCoinsForSpace(space);
  const ruby = RUBY_SPACES.has(space);

  return { space, vp, coins, ruby, exploded: crucible.exploded, overflowValue, overflowVp };
}

/**
 * Difficulty changes the human market economy, not the physical scoring track.
 * Rivals keep the printed coin value so their purchasing logic and board-game rules
 * remain stable; the selected difficulty already governs their brewing decisions.
 */
export function adjustCoinRewardForDifficulty(coins: number, difficulty: AIDifficulty): number {
  if (coins <= 0 || difficulty === "apprentice") return Math.max(0, coins);
  if (difficulty === "skilled") {
    // Preserve ordinary opening brews, then trim one coin from stronger results.
    // A percentage tax compounded too aggressively across nine markets.
    return coins <= 7 ? coins : coins - 1;
  }
  // Master demands meaningful sacrifices while always leaving earned purchasing power.
  return Math.max(1, Math.floor(coins * 0.7));
}

export function calculateRoundScoreForDifficulty(
  crucible: Crucible,
  difficulty: AIDifficulty,
  playerKind: PlayerKind,
): RoundScoreResult {
  const result = calculateRoundScore(crucible);
  if (playerKind !== "human") return result;
  const adjustedCoins = adjustCoinRewardForDifficulty(result.coins, difficulty);
  return adjustedCoins === result.coins
    ? result
    : { ...result, baseCoins: result.coins, coins: adjustedCoins };
}

export type ExplodedChoice = "vp" | "coins";

export function applyRoundReward(
  player: Player,
  result: RoundScoreResult,
  choice?: ExplodedChoice
): Player {
  const awardsBoth = !result.exploded || Boolean(player.blueBonusExplosion);
  if (result.exploded && !awardsBoth && !choice) {
    throw new Error("An exploded player must choose prestige or coins.");
  }
  const reward = awardsBoth
    ? applyFullReward(result)
    : applyExplodedReward(result, choice!);
  return {
    ...player,
    score: player.score + reward.vp,
    coinsThisRound: reward.coins,
  };
}

// Survived — earn both
export function applyFullReward(result: RoundScoreResult): {
  vp: number;
  coins: number;
  rubies: number;
} {
  return {
    vp: result.vp,
    coins: result.coins,
    rubies: result.ruby ? 1 : 0,
  };
}

// Exploded — choose one
export function applyExplodedReward(
  result: RoundScoreResult,
  choice: ExplodedChoice
): { vp: number; coins: number; rubies: number } {
  return {
    vp: choice === "vp" ? result.vp : 0,
    coins: choice === "coins" ? result.coins : 0,
    rubies: result.ruby ? 1 : 0, // ruby always awarded
  };
}
