export type TokenColor =
  | "white"    // Voidshards — explosive, no special effect
  | "orange"   // Brimstone — no special effect
  | "green"    // Deathweave — end-of-round effect
  | "purple"   // Wraithbloom — end-of-round effect
  | "blue"     // Frostbile — immediate: draw 2 extra, keep 1
  | "red"      // Bloodthorn — immediate: move forward 1 extra per red in pot
  | "yellow"   // Plaguedust — immediate: take 1 ruby per yellow pair
  | "black";   // Shadowmoss — end-of-round effect

export interface Token {
  id: string;
  color: TokenColor;
  value: number; // 1, 2, 3, or 4 — spaces advanced on spiral
}

// Which colors unlock at which round
export const COLOR_UNLOCK_ROUND: Record<TokenColor, number> = {
  white:  1,
  orange: 1,
  green:  1,
  blue:   1,
  red:    1,
  yellow: 2, // yellow book unlocks before round 2
  purple: 3, // purple book unlocks before round 3
  black:  1,
};
