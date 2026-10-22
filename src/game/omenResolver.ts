import type { OmenCard } from "./omenTypes";
import type { Player } from "./playerTypes";
import type { RoundScoreResult } from "./scoring";
import { countPlacedColor } from "./chipEffects";
import type { Token, TokenColor } from "./tokenTypes";
import { applyBonusDieResult, rollBonusDie, type BonusDieResult } from "./bonusDie";

export interface OmenApplication {
  bonusPoints: number;
  bonusRubies: number;
}

export interface OmenStartOptions {
  createToken: (color: TokenColor, value: number, source: string) => Token;
  rollDie?: () => BonusDieResult;
}

export function applyOmenStartEffect(
  player: Player,
  omen: OmenCard | null,
  options: OmenStartOptions
): Player {
  if (!omen) return player;
  const effect = omen.effect;
  if (effect.type === "gain_rubies") return { ...player, rubies: player.rubies + effect.amount };
  if (effect.type === "gain_vp") return { ...player, score: player.score + effect.amount };
  if (effect.type === "advance_droplet") {
    return {
      ...player,
      crucible: {
        ...player.crucible,
        dropletPosition: Math.min(32, player.crucible.dropletPosition + effect.amount),
        filledUpTo: Math.min(33, player.crucible.filledUpTo + effect.amount),
      },
    };
  }
  if (effect.type === "gain_chip") {
    return {
      ...player,
      bag: { tokens: [...player.bag.tokens, options.createToken(effect.color, effect.value, omen.id)] },
    };
  }
  if (effect.type === "roll_bonus_die") {
    const result = (options.rollDie ?? rollBonusDie)();
    return applyBonusDieResult(player, result, options.createToken("orange", 1, `${omen.id}-die`));
  }
  return player;
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
    case "exact_white_seven_droplet":
      return base;
    case "ruby_space_bonus_vp":
      return result.ruby
        ? { bonusPoints: omen.effect.amount, bonusRubies: 0 }
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

export function applyOmenScoringEffect(
  player: Player,
  omen: OmenCard | null,
  result: RoundScoreResult
): Player {
  if (!omen) return player;
  let updated = applyOmenToPlayer(player, resolveOmen(omen, result, player));
  if (omen.effect.type === "exact_white_seven_droplet" && player.crucible.whiteSum === 7) {
    updated = {
      ...updated,
      crucible: {
        ...updated.crucible,
        dropletPosition: Math.min(32, updated.crucible.dropletPosition + 1),
      },
    };
  }
  if (omen.effect.type === "refill_flask") {
    updated = { ...updated, flask: true };
  }
  return updated;
}

export function rubyRewardForResult(omen: OmenCard | null, result: RoundScoreResult): number {
  if (!result.ruby) return 0;
  return omen?.effect.type === "double_ruby_space" ? 2 : 1;
}
