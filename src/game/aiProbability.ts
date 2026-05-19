import type { Bag } from "./bagTypes";
import type { Crucible } from "./crucibleTypes";
import { EXPLOSION_THRESHOLD } from "./crucibleTypes";

// How much white value is still needed to trigger an explosion.
export function remainingWhiteCapacity(crucible: Crucible): number {
  return EXPLOSION_THRESHOLD - crucible.whiteSum;
}

// Total white value sitting in the bag right now.
export function totalWhiteValueInBag(bag: Bag): number {
  return bag.tokens
    .filter((t) => t.color === "white")
    .reduce((sum, t) => sum + t.value, 0);
}

// Probability that the NEXT draw causes an explosion.
// = sum of values of white tokens that would push over threshold / total tokens
export function explosionProbabilityOnNextDraw(
  bag: Bag,
  crucible: Crucible
): number {
  if (bag.tokens.length === 0) return 0;

  const capacity = remainingWhiteCapacity(crucible);
  const dangerousTokens = bag.tokens.filter(
    (t) => t.color === "white" && t.value > capacity
  );

  return dangerousTokens.length / bag.tokens.length;
}

// Expected white value of the next draw (used to judge future risk).
export function expectedWhiteValueOnNextDraw(bag: Bag): number {
  if (bag.tokens.length === 0) return 0;

  const totalWhite = bag.tokens
    .filter((t) => t.color === "white")
    .reduce((sum, t) => sum + t.value, 0);

  return totalWhite / bag.tokens.length;
}

// Probability of surviving N more draws without exploding.
// Uses recursive multiplication of survival probability per draw.
export function survivalProbabilityForNDraws(
  bag: Bag,
  crucible: Crucible,
  draws: number
): number {
  if (draws === 0) return 1;
  if (bag.tokens.length === 0) return 1;

  const capacity = remainingWhiteCapacity(crucible);
  const safeTokens = bag.tokens.filter(
    (t) => t.color !== "white" || t.value <= capacity
  );
  const surviveThisDraw = safeTokens.length / bag.tokens.length;

  // Rough approximation: assume average safe token drawn next
  // (full simulation would be too expensive)
  const avgWhiteIfSafe =
    safeTokens
      .filter((t) => t.color === "white")
      .reduce((s, t) => s + t.value, 0) / Math.max(safeTokens.length, 1);

  const simulatedCrucible: Crucible = {
    ...crucible,
    whiteSum: crucible.whiteSum + avgWhiteIfSafe * (safeTokens.filter(t => t.color === "white").length / Math.max(safeTokens.length, 1)),
    filledUpTo: crucible.filledUpTo + 1,
    exploded: false,
    slots: crucible.slots,
  };

  const simulatedBag = {
    tokens: bag.tokens.slice(1), // rough: remove one token
  };

  return (
    surviveThisDraw *
    survivalProbabilityForNDraws(simulatedBag, simulatedCrucible, draws - 1)
  );
}
