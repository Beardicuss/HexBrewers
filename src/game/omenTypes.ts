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
  | { type: "no_effect" };
