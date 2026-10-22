import type { TokenColor } from "./tokenTypes";

// Each round begins with an Omen Card that applies a special rule.
export interface OmenCard {
  id: string;
  title: string;
  description: string;
  summary: string;
  effect: OmenEffect;
}

// Renamed Fortune-style card effects. These keep the game's theme original while
// replacing the old custom 9-card deck with a broader Quacks-like event deck.
export type OmenEffect =
  | { type: "gain_rubies"; amount: number }
  | { type: "gain_vp"; amount: number }
  | { type: "advance_droplet"; amount: number }
  | { type: "gain_chip"; color: TokenColor; value: number }
  | { type: "roll_bonus_die" }
  | { type: "bonus_if_survived"; vp?: number; rubies?: number }
  | { type: "bonus_if_exploded"; vp?: number; rubies?: number }
  | { type: "bonus_for_color"; color: TokenColor; vpPerChip?: number; rubiesPerChip?: number }
  | { type: "bonus_for_white_limit"; maxWhiteSum: number; vp: number }
  | { type: "double_ruby_space" }
  | { type: "extra_rat_stone"; amount: number }
  | { type: "double_rat_tails" }
  | { type: "return_first_white" }
  | { type: "exact_white_seven_droplet" }
  | { type: "round_explosion_threshold"; threshold: number }
  | { type: "refill_flask" }
  | { type: "orange_extra_movement"; amount: number }
  | { type: "ruby_space_bonus_vp"; amount: number }
  | { type: "bonus_die_rolls"; rolls: number }
  | { type: "choice_beginner_boost" }
  | { type: "choice_bounty" }
  | { type: "choice_droplet_or_purple" }
  | { type: "choice_ruby_for_one" }
  | { type: "choice_rat_tails_for_rubies" }
  | { type: "choice_rat_reward" }
  | { type: "sample_five_lowest" }
  | { type: "explosion_left_neighbor_chip" }
  | { type: "strong_ingredient" }
  | { type: "sample_four_upgrade" }
  | { type: "second_chance" }
  | { type: "fewest_vp_gain_chip"; color: TokenColor; value: number }
  | { type: "fewest_rubies_gain_ruby"; amount: number }
  | { type: "distillation_bonus"; amount: number }
  | { type: "distillation_exact_seven"; exactSevenValue: number }
  | { type: "distillation_neighbor_echo"; valuePerExplodedNeighbor: number }
  | { type: "distillation_minimum"; minimum: number }
  | { type: "no_effect" };
