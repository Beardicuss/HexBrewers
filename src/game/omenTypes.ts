// Each round begins with an Omen Card that applies a special rule
export interface OmenCard {
  id: string;
  title: string;
  description: string;
  effect: OmenEffect;
}

// What the omen card actually does mechanically
export type OmenEffect =
  | { type: "double_soulstones" }           // earn 2x soulstones from spiral position
  | { type: "extra_draw" }                  // draw one extra token before deciding to stop
  | { type: "poison"; penalty: number }     // lose N soulstones if crucible explodes
  | { type: "bonus_score"; points: number } // gain N bonus points if crucible does NOT explode
  | { type: "no_effect" };                  // placeholder / blank card
