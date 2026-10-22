import type { Crucible, CruciblePlacement, CrucibleSlot } from "./crucibleTypes";
import type { Token } from "./tokenTypes";
import { EXPLOSION_THRESHOLD, CRUCIBLE_SIZE, RUBY_SPACES, getScoringSpace } from "./crucibleTypes";

export function createCrucible(): Crucible {
  const slots: CrucibleSlot[] = Array.from({ length: CRUCIBLE_SIZE + 1 }, (_, i) => ({
    position: i,
    token: null,
  }));
  return {
    slots,
    placements: [],
    dropletPosition: 0,
    filledUpTo: 0,
    exploded: false,
    whiteSum: 0,
    lastDrawnToken: null,
    overflowEnabled: false,
    overflowTokens: [],
  };
}

// Place a token on the crucible.
// Token advances filledUpTo by token.value from current position.
// Returns updated crucible (immutable).
export function getExplosionThreshold(crucible: Crucible): number {
  const yellowCount = crucible.placements.filter((placement) => placement.token.color === "yellow").length;
  if (yellowCount >= 3) return EXPLOSION_THRESHOLD + 2;
  if (yellowCount >= 1) return EXPLOSION_THRESHOLD + 1;
  return EXPLOSION_THRESHOLD;
}

export function placeToken(crucible: Crucible, token: Token, movement = token.value, explosionThreshold = EXPLOSION_THRESHOLD): Crucible {
  const startPosition = crucible.filledUpTo;
  const entersOverflow = crucible.overflowEnabled && startPosition >= CRUCIBLE_SIZE;
  const nextPosition = Math.min(startPosition + movement, CRUCIBLE_SIZE);

  const updatedSlots = crucible.slots.map((slot) =>
    slot.position === nextPosition ? { ...slot, token } : slot
  );

  const newWhiteSum =
    token.color === "white" ? crucible.whiteSum + token.value : crucible.whiteSum;

  const exploded = newWhiteSum > explosionThreshold;

  return {
    ...crucible,
    slots: entersOverflow ? crucible.slots : updatedSlots,
    placements: [
      ...crucible.placements,
      { token, startPosition, position: nextPosition, movement },
    ],
    filledUpTo: nextPosition,
    whiteSum: newWhiteSum,
    exploded,
    lastDrawnToken: token,
    overflowTokens: entersOverflow ? [...crucible.overflowTokens, token] : crucible.overflowTokens,
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
  return crucible.placements.map((placement) => placement.token);
}

export function getPlacements(crucible: Crucible): CruciblePlacement[] {
  return crucible.placements;
}

function slotsFromPlacements(placements: CruciblePlacement[]): CrucibleSlot[] {
  const slots: CrucibleSlot[] = Array.from({ length: CRUCIBLE_SIZE + 1 }, (_, i) => ({
    position: i,
    token: null,
  }));
  for (const placement of placements) {
    slots[placement.position] = { position: placement.position, token: placement.token };
  }
  return slots;
}

// Remove a placed token without changing track progress. Used by effects that
// trade or return earlier chips; the remaining placement history stays intact.
export function removePlacedToken(crucible: Crucible, tokenId: string): Crucible {
  const placements = crucible.placements.filter((placement) => placement.token.id !== tokenId);
  const removed = crucible.placements.find((placement) => placement.token.id === tokenId)?.token;
  return {
    ...crucible,
    placements,
    slots: slotsFromPlacements(placements),
    whiteSum: removed?.color === "white"
      ? Math.max(0, crucible.whiteSum - removed.value)
      : crucible.whiteSum,
    lastDrawnToken: placements[placements.length - 1]?.token ?? null,
    overflowTokens: crucible.overflowTokens.filter((token) => token.id !== tokenId),
  };
}

export function moveLastPlacedTokenExtra(crucible: Crucible, extraMovement: number): Crucible {
  const last = crucible.placements[crucible.placements.length - 1];
  if (!last || extraMovement <= 0) return crucible;
  const earlier = crucible.placements.slice(0, -1);
  const rewound: Crucible = {
    ...crucible,
    placements: earlier,
    slots: slotsFromPlacements(earlier),
    filledUpTo: last.startPosition,
    lastDrawnToken: earlier[earlier.length - 1]?.token ?? null,
  };
  return placeToken(rewound, last.token, last.movement + extraMovement, Number.POSITIVE_INFINITY);
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
    placements: [],
    filledUpTo: crucible.dropletPosition, // start from droplet position
    exploded: false,
    whiteSum: 0,
    lastDrawnToken: null,
    overflowTokens: [],
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
