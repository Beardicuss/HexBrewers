import type { Player } from "./playerTypes";
import type { RoundScoreResult } from "./scoring";

export type RoundObjectiveId =
  | "steady_hand" | "three_voices" | "ruby_in_reserve"
  | "edge_of_ruin" | "clean_crucible" | "long_stride"
  | "many_hands" | "sealed_purse" | "ninth_witness";

export interface RoundObjectiveDefinition {
  id: RoundObjectiveId;
  title: string;
  instruction: string;
  reward: string;
  accent: string;
}

export const ROUND_OBJECTIVES: RoundObjectiveDefinition[] = [
  { id: "steady_hand", title: "The Steady Hand", instruction: "Survive with 4–6 Voidshard pressure.", reward: "+1 ruby", accent: "#73d7d2" },
  { id: "three_voices", title: "Three Voices in the Steam", instruction: "Place ingredients from at least three non-Voidshard families.", reward: "+1 Prestige", accent: "#ad8be8" },
  { id: "ruby_in_reserve", title: "The Unspent Eye", instruction: "Survive while keeping at least 1 ruby unspent.", reward: "+1 market coin", accent: "#e2bd70" },
  { id: "edge_of_ruin", title: "At Ruin’s Lip", instruction: "Survive with exactly 6 or 7 Voidshard pressure.", reward: "+1 Prestige", accent: "#d87a67" },
  { id: "clean_crucible", title: "A Quiet Mixture", instruction: "Survive with no more than 3 Voidshard pressure.", reward: "+1 ruby", accent: "#75c8b3" },
  { id: "long_stride", title: "The Long Measure", instruction: "Survive at scoring space 10 or farther.", reward: "+1 Prestige", accent: "#d4a854" },
  { id: "many_hands", title: "The Motley Brew", instruction: "Place at least five non-Voidshard ingredients.", reward: "+1 market coin", accent: "#7fb3d8" },
  { id: "sealed_purse", title: "Coin Beneath the Tongue", instruction: "Survive with at least 2 rubies unspent.", reward: "+1 Prestige", accent: "#c594d8" },
  { id: "ninth_witness", title: "The Ninth Witness", instruction: "Survive at scoring space 12 or farther with pressure below 7.", reward: "+1 Prestige and +1 ruby", accent: "#e2b75d" },
];

export function objectiveForRound(round: number): RoundObjectiveDefinition {
  return ROUND_OBJECTIVES[Math.max(0, Math.min(ROUND_OBJECTIVES.length - 1, round - 1))];
}

export function objectiveCompleted(objective: RoundObjectiveId, player: Player, result: RoundScoreResult): boolean {
  if (result.exploded) return false;
  const placements = player.crucible.placements;
  const colored = placements.filter(({ token }) => token.color !== "white");
  const families = new Set(colored.map(({ token }) => token.color));
  switch (objective) {
    case "steady_hand": return player.crucible.whiteSum >= 4 && player.crucible.whiteSum <= 6;
    case "three_voices": return families.size >= 3;
    case "ruby_in_reserve": return player.rubies >= 1;
    case "edge_of_ruin": return player.crucible.whiteSum === 6 || player.crucible.whiteSum === 7;
    case "clean_crucible": return player.crucible.whiteSum <= 3;
    case "long_stride": return result.space >= 10;
    case "many_hands": return colored.length >= 5;
    case "sealed_purse": return player.rubies >= 2;
    case "ninth_witness": return result.space >= 12 && player.crucible.whiteSum < 7;
  }
}

export function applyRoundObjectiveReward(player: Player, result: RoundScoreResult, round: number): Player {
  const objective = objectiveForRound(round);
  if (!objectiveCompleted(objective.id, player, result)) return player;
  switch (objective.id) {
    case "steady_hand":
    case "clean_crucible": return { ...player, rubies: player.rubies + 1 };
    case "ruby_in_reserve":
    case "many_hands": return { ...player, coinsThisRound: player.coinsThisRound + 1 };
    case "ninth_witness": return { ...player, score: player.score + 1, rubies: player.rubies + 1 };
    default: return { ...player, score: player.score + 1 };
  }
}
