import type { Crucible } from "./crucibleTypes";
import { SPACE_VP, getCoinsForSpace, RUBY_SPACES, getScoringSpace } from "./crucibleTypes";

export interface RoundScoreResult {
  space: number;       // the scoring space (filledUpTo)
  vp: number;          // victory points from that space
  coins: number;       // coins available to spend in buy phase
  ruby: boolean;       // whether a ruby is earned (all players, even exploded)
  exploded: boolean;
}

// Calculate end-of-round results from crucible state.
// Ruby is earned by ALL players regardless of explosion.
// If exploded: player chooses VP or coins (not both).
// If survived: player earns both VP and coins.
export function calculateRoundScore(crucible: Crucible): RoundScoreResult {
  const space = getScoringSpace(crucible.filledUpTo);
  const vp = SPACE_VP[space] ?? 0;
  const coins = getCoinsForSpace(space);
  const ruby = RUBY_SPACES.has(space);

  return { space, vp, coins, ruby, exploded: crucible.exploded };
}

export type ExplodedChoice = "vp" | "coins";

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
