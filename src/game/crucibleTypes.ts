import type { Token } from "./tokenTypes";

export interface CrucibleSlot {
  position: number;   // 1–33 (position 0 = start, not a slot)
  token: Token | null;
}

export interface Crucible {
  slots: CrucibleSlot[];
  dropletPosition: number; // permanent start offset (advanced by rubies)
  filledUpTo: number;      // current furthest filled position (1–33)
  exploded: boolean;
  whiteSum: number;
  lastDrawnToken: Token | null; // needed for flask rule
}

export const EXPLOSION_THRESHOLD = 7;
export const CRUCIBLE_SIZE = 33;

// VP earned per official scoring space. The scoring space is the empty field
// directly after the last placed chip, not the chip's own field.
export const SPACE_VP: Record<number, number> = {
  0: 0,
  1: 0, 2: 0, 3: 0, 4: 0,
  5: 1, 6: 1, 7: 1, 8: 1, 9: 1,
  10: 2, 11: 2, 12: 2, 13: 2,
  14: 3, 15: 3, 16: 3,
  17: 4, 18: 4,
  19: 5, 20: 5,
  21: 6, 22: 6,
  23: 7, 24: 7,
  25: 8, 26: 9, 27: 10, 28: 11,
  29: 11, 30: 12, 31: 13, 32: 14, 33: 15,
};

export function getScoringSpace(lastFilledSpace: number): number {
  return Math.min(lastFilledSpace + 1, CRUCIBLE_SIZE);
}

// Coins earned = scoring space number, except the spoon at the end of the pot.
export function getCoinsForSpace(space: number): number {
  return space >= CRUCIBLE_SIZE ? 35 : Math.min(space, CRUCIBLE_SIZE);
}

// Ruby is checked on the scoring space.
export const RUBY_SPACES = new Set([4, 9, 15, 21, 28]);

// Rat tail icons appear after these spaces on the scoring track
export const RAT_TAIL_AFTER_SPACES = [4, 9, 14, 19, 24, 29];
