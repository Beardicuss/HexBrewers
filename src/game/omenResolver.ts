import type { OmenCard } from "./omenTypes";
import type { Player } from "./playerTypes";
import type { RoundScoreResult } from "./scoring";

// Apply an omen's effect to a player's round result.
// Called during the scoring phase after brewing ends.

export interface OmenApplication {
  bonusPoints: number;
  bonusRubies: number;
  rubyPenalty: number;
  allowExtraDraw: boolean;
}

// Resolve what the omen gives/takes based on the player's result this round.
export function resolveOmen(
  omen: OmenCard,
  result: RoundScoreResult
): OmenApplication {
  const base: OmenApplication = {
    bonusPoints: 0,
    bonusRubies: 0,
    rubyPenalty: 0,
    allowExtraDraw: false,
  };

  switch (omen.effect.type) {
    case "double_soulstones":
      return { ...base, bonusRubies: result.coins };

    case "extra_draw":
      return { ...base, allowExtraDraw: true };

    case "poison":
      return {
        ...base,
        rubyPenalty: result.exploded ? omen.effect.penalty : 0,
      };

    case "bonus_score":
      return {
        ...base,
        bonusPoints: result.exploded ? 0 : omen.effect.points,
      };

    case "no_effect":
      return base;

    default:
      return base;
  }
}

// Apply the resolved omen bonuses/penalties to a player.
export function applyOmenToPlayer(
  player: Player,
  application: OmenApplication
): Player {
  const newRubies = Math.max(
    0,
    player.rubies +
    application.bonusRubies -
    application.rubyPenalty
  );

  return {
    ...player,
    score: player.score + application.bonusPoints,
    rubies: newRubies,
  };
}
