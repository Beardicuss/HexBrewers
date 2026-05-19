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

// VP earned per scoring space — from official scoring track
export const SPACE_VP: Record<number, number> = {
  0: 0,
  1: 0, 2: 0, 3: 0, 4: 1, 5: 1,
  6: 2, 7: 2, 8: 2, 9: 3, 10: 3,
  11: 4, 12: 4, 13: 4, 14: 5, 15: 5,
  16: 6, 17: 6, 18: 6, 19: 7, 20: 7,
  21: 8, 22: 8, 23: 9, 24: 9, 25: 10,
  26: 11, 27: 11, 28: 12, 29: 13, 30: 14,
  31: 15, 32: 16, 33: 17,
};

// Coins earned = scoring space number (official rule)
export function getCoinsForSpace(space: number): number {
  return Math.min(space, 33);
}

// Ruby spaces — landing on or passing these grants 1 ruby
export const RUBY_SPACES = new Set([3, 8, 14, 20, 27]);

// Rat tail icons appear after these spaces on the scoring track
export const RAT_TAIL_AFTER_SPACES = [4, 9, 14, 19, 24, 29];
