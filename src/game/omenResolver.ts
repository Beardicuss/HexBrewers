import type { OmenCard } from "./omenTypes";
import type { Player } from "./playerTypes";
import type { RoundScoreResult } from "./scoring";
import { countPlacedColor } from "./chipEffects";

export interface OmenApplication {
  bonusPoints: number;
  bonusRubies: number;
}

export function resolveOmen(
  omen: OmenCard,
  result: RoundScoreResult,
  player?: Player
): OmenApplication {
  const base: OmenApplication = {
    bonusPoints: 0,
    bonusRubies: 0,
  };

  switch (omen.effect.type) {
    case "bonus_if_survived":
      return result.exploded
        ? base
        : {
          bonusPoints: omen.effect.vp ?? 0,
          bonusRubies: omen.effect.rubies ?? 0,
        };
    case "bonus_if_exploded":
      return result.exploded
        ? {
          bonusPoints: omen.effect.vp ?? 0,
          bonusRubies: omen.effect.rubies ?? 0,
        }
        : base;
    case "bonus_for_color": {
      const count = player ? countPlacedColor(player.crucible, omen.effect.color) : 0;
      return {
        bonusPoints: count * (omen.effect.vpPerChip ?? 0),
        bonusRubies: count * (omen.effect.rubiesPerChip ?? 0),
      };
    }
    case "bonus_for_white_limit":
      return !result.exploded && player && player.crucible.whiteSum <= omen.effect.maxWhiteSum
        ? { bonusPoints: omen.effect.vp, bonusRubies: 0 }
        : base;
    default:
      return base;
  }
}

export function applyOmenToPlayer(
  player: Player,
  application: OmenApplication
): Player {
  return {
    ...player,
    score: player.score + application.bonusPoints,
    rubies: player.rubies + application.bonusRubies,
  };
}
