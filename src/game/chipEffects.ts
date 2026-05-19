// Chip effects — applied when specific colored tokens are drawn or at end of round
// This implements the actual ingredient effects from the official game (Set 1 baseline)

import type { Token } from "./tokenTypes";
import type { Crucible } from "./crucibleTypes";
import type { Player } from "./playerTypes";
import type { Bag } from "./bagTypes";
import { drawToken } from "./bag";
import { placeToken } from "./crucible";

export interface EffectResult {
  player: Player;
  pendingBlueDraw?: {           // blue: must resolve draw-2-keep-1
    drawn: [Token, Token | null]; // up to 2 drawn tokens
  };
}

// ── IMMEDIATE EFFECTS (triggered when chip is drawn) ─────────────────────────

// Red (Bloodthorn): move forward 1 extra space per red chip already in pot
// Applied by increasing the effective value of the draw
export function redBonusValue(crucible: Crucible): number {
  const redCount = crucible.slots.filter(
    (s) => s.token?.color === "red"
  ).length;
  // +1 per red chip already placed (not counting the current one)
  return Math.max(0, redCount - 1);
}

// Blue (Frostbile): draw extra chips equal to blue chip's value, place 1 (or 0) back into pot
// Returns drawn tokens for UI to present choice
export function drawBlueBonus(bag: Bag, chipValue: number): {
  bag: Bag;
  drawn: Token[];
} {
  const tokens: Token[] = [];
  let currentBag = bag;
  const drawCount = chipValue; // draw 1, 2, or 4 based on chip value

  for (let i = 0; i < drawCount; i++) {
    const result = drawToken(currentBag);
    if (!result) break;
    tokens.push(result.token);
    currentBag = result.bag;
  }

  return { bag: currentBag, drawn: tokens };
}

// Yellow (Plaguedust): earn 1 ruby for every pair of yellow chips in pot
export function yellowRubyBonus(crucible: Crucible): number {
  const yellowCount = crucible.slots.filter(
    (s) => s.token?.color === "yellow"
  ).length;
  return Math.floor(yellowCount / 2);
}

// ── END-OF-ROUND EFFECTS ─────────────────────────────────────────────────────

// Green (Deathweave): earn 1 ruby if green chip is on the last or second-to-last space
export function greenRubyBonus(crucible: Crucible): number {
  const lastPos = crucible.filledUpTo;
  const greenOnEdge = crucible.slots.some(
    (s) =>
      s.token?.color === "green" &&
      (s.position === lastPos || s.position === lastPos - 1)
  );
  return greenOnEdge ? 1 : 0;
}

// Purple (Wraithbloom): earn 1 VP per purple chip in pot (end of round, if not exploded)
export function purpleVPBonus(crucible: Crucible, exploded: boolean): number {
  if (exploded) return 0;
  return crucible.slots.filter((s) => s.token?.color === "purple").length;
}

// Black (Shadowmoss): if pot didn't explode and black chip is in pot,
// move droplet forward 1 space for free
export function blackDropletBonus(crucible: Crucible, exploded: boolean): boolean {
  if (exploded) return false;
  return crucible.slots.some((s) => s.token?.color === "black");
}

// Apply all end-of-round chip effects to a player
export function applyEndOfRoundEffects(player: Player): Player {
  const { crucible } = player;
  const exploded = crucible.exploded;

  let rubies = player.rubies;
  let score = player.score;
  let dropletPosition = crucible.dropletPosition;

  rubies += greenRubyBonus(crucible);
  score += purpleVPBonus(crucible, exploded);

  if (blackDropletBonus(crucible, exploded)) {
    dropletPosition = Math.min(dropletPosition + 1, 32);
  }

  return {
    ...player,
    rubies,
    score,
    crucible: { ...crucible, dropletPosition },
  };
}
