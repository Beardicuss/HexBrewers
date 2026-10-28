import type { Player } from "./playerTypes";
import type { GameState } from "./gameState";
import type { RoundScoreResult } from "./scoring";
import { getAIProfile } from "./aiStrategy";
import { objectiveForRound } from "./roundObjectives";

export type BrewingIntentionId = "temper" | "court" | "glory";

export interface BrewingIntentionDefinition {
  id: BrewingIntentionId;
  title: string;
  vow: string;
  benefit: string;
  cost: string;
  accent: string;
}

export const BREWING_INTENTIONS: BrewingIntentionDefinition[] = [
  {
    id: "temper",
    title: "Temper the Crucible",
    vow: "Restrain the brew before it learns your hunger.",
    benefit: "The first draw that would shatter your crucible is warded once.",
    cost: "A surviving brew earns 1 less Prestige from its scoring space.",
    accent: "#73d7d2",
  },
  {
    id: "court",
    title: "Court the Omen",
    vow: "Answer the card that has already answered you.",
    benefit: "Any positive scoring reward granted by this round’s Omen is repeated once.",
    cost: "If the Omen grants no scoring reward, lose 1 market coin this round.",
    accent: "#b68ae8",
  },
  {
    id: "glory",
    title: "Brew for Glory",
    vow: "Let every witness remember how close you stood to ruin.",
    benefit: "Survive at scoring space 10 or farther to gain 2 additional Prestige.",
    cost: "Seven Voidshard pressure shatters your crucible instead of remaining safe.",
    accent: "#e0ad55",
  },
];

function omenCanRewardScoring(state?: GameState): boolean {
  const type = state?.currentOmen?.effect.type;
  return type === "gain_rubies"
    || type === "gain_vp"
    || type === "bonus_if_survived"
    || type === "bonus_if_exploded"
    || type === "bonus_for_color"
    || type === "bonus_for_white_limit"
    || type === "double_ruby_space"
    || type === "ruby_space_bonus_vp";
}

export function chooseAIIntention(player: Player, round: number, state?: GameState): BrewingIntentionId {
  const profile = getAIProfile(player);
  const objective = objectiveForRound(round).id;
  const leader = state ? Math.max(...state.players.map((candidate) => candidate.score)) : player.score;
  const trailing = player.score < leader - 4;

  if (profile === "seer" && ["steady_hand", "clean_crucible", "ruby_in_reserve", "sealed_purse"].includes(objective)) {
    return "temper";
  }
  if (profile === "wraith" && omenCanRewardScoring(state)) return "court";
  if (profile === "shade" && ["edge_of_ruin", "long_stride", "ninth_witness"].includes(objective)) return "glory";
  if (profile === "hollow") {
    if (omenCanRewardScoring(state)) return "court";
    return trailing ? "glory" : "temper";
  }
  if (trailing || player.score <= Math.max(0, round - 2) * 2) return "glory";
  if ((round + player.id.length) % 3 === 0) return "court";
  return profile === "shade" ? "glory" : "temper";
}

export function applyIntentionAfterPlacement(player: Player, state: GameState): Player {
  if (state.ritualRuleset !== "ashenveil") return player;
  const intention = state.roundIntentions?.[player.id];
  if (intention === "temper" && player.crucible.exploded && player.intentionWardUsedRound !== state.currentRound) {
    return {
      ...player,
      intentionWardUsedRound: state.currentRound,
      crucible: { ...player.crucible, exploded: false },
    };
  }
  if (intention === "glory" && player.crucible.whiteSum >= 7) {
    return { ...player, crucible: { ...player.crucible, exploded: true } };
  }
  return player;
}

export function applyIntentionRoundReward(
  player: Player,
  result: RoundScoreResult,
  state: GameState,
  omenReward: { bonusPoints: number; bonusRubies: number },
): Player {
  if (state.ritualRuleset !== "ashenveil") return player;
  const intention = state.roundIntentions?.[player.id];
  if (intention === "temper" && !result.exploded && result.vp > 0) {
    return { ...player, score: Math.max(0, player.score - 1) };
  }
  if (intention === "court") {
    const answered = omenReward.bonusPoints > 0 || omenReward.bonusRubies > 0;
    return answered
      ? {
          ...player,
          score: player.score + omenReward.bonusPoints,
          rubies: player.rubies + omenReward.bonusRubies,
        }
      : { ...player, coinsThisRound: Math.max(0, player.coinsThisRound - 1) };
  }
  if (intention === "glory" && !result.exploded && result.space >= 10) {
    return { ...player, score: player.score + 2 };
  }
  return player;
}

