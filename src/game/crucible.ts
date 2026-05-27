import type { Crucible, CrucibleSlot } from "./crucibleTypes";
import type { Token } from "./tokenTypes";
import { EXPLOSION_THRESHOLD, CRUCIBLE_SIZE, RUBY_SPACES, getScoringSpace } from "./crucibleTypes";

export function createCrucible(): Crucible {
  const slots: CrucibleSlot[] = Array.from({ length: CRUCIBLE_SIZE + 1 }, (_, i) => ({
    position: i,
    token: null,
  }));
  return {
    slots,
    dropletPosition: 0,
    filledUpTo: 0,
    exploded: false,
    whiteSum: 0,
    lastDrawnToken: null,
  };
}

// Place a token on the crucible.
// Token advances filledUpTo by token.value from current position.
// Returns updated crucible (immutable).
export function getExplosionThreshold(crucible: Crucible): number {
  const yellowCount = crucible.slots.filter((slot) => slot.token?.color === "yellow").length;
  if (yellowCount >= 3) return EXPLOSION_THRESHOLD + 2;
  if (yellowCount >= 1) return EXPLOSION_THRESHOLD + 1;
  return EXPLOSION_THRESHOLD;
}

export function placeToken(crucible: Crucible, token: Token, movement = token.value, explosionThreshold = EXPLOSION_THRESHOLD): Crucible {
  const nextPosition = Math.min(crucible.filledUpTo + movement, CRUCIBLE_SIZE);

  const updatedSlots = crucible.slots.map((slot) =>
    slot.position === nextPosition ? { ...slot, token } : slot
  );

  const newWhiteSum =
    token.color === "white" ? crucible.whiteSum + token.value : crucible.whiteSum;

  const exploded = newWhiteSum > explosionThreshold;

  return {
    ...crucible,
    slots: updatedSlots,
    filledUpTo: nextPosition,
    whiteSum: newWhiteSum,
    exploded,
    lastDrawnToken: token,
  };
}

// Check if the crucible's scoring space awards a ruby.
// Ruby is awarded for the scoring space = space directly after last chip.
export function checkRubyEarned(crucible: Crucible): boolean {
  return RUBY_SPACES.has(getScoringSpace(crucible.filledUpTo));
}

export function hasExploded(crucible: Crucible): boolean {
  return crucible.exploded;
}

export function getPlacedTokens(crucible: Crucible): Token[] {
  return crucible.slots
    .filter((s) => s.token !== null)
    .map((s) => s.token as Token);
}

// Reset crucible for a new round — keep dropletPosition (it persists)
export function resetCrucible(crucible: Crucible): Crucible {
  const slots: CrucibleSlot[] = Array.from({ length: CRUCIBLE_SIZE + 1 }, (_, i) => ({
    position: i,
    token: null,
  }));
  return {
    ...crucible,
    slots,
    filledUpTo: crucible.dropletPosition, // start from droplet position
    exploded: false,
    whiteSum: 0,
    lastDrawnToken: null,
  };
}

// Move droplet forward 1 space permanently (costs 2 rubies, called from store)
export function advanceDroplet(crucible: Crucible): Crucible {
  const newPos = Math.min(crucible.dropletPosition + 1, CRUCIBLE_SIZE - 1);
  return { ...crucible, dropletPosition: newPos };
}

export function getSpiralPosition(crucible: Crucible): number {
  return crucible.filledUpTo;
}
