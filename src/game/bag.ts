import type { Bag } from "./bagTypes";
import type { Token } from "./tokenTypes";

// Draw a random token from the bag.
// Returns the token and the updated bag (immutable).
// Returns null if the bag is empty.
export function drawToken(bag: Bag): { token: Token; bag: Bag } | null {
  if (bag.tokens.length === 0) return null;

  const index = Math.floor(Math.random() * bag.tokens.length);
  const token = bag.tokens[index];
  const remaining = bag.tokens.filter((_, i) => i !== index);

  return {
    token,
    bag: { tokens: remaining },
  };
}

// Return a token back into the bag (used when flask is activated).
export function returnToken(bag: Bag, token: Token): Bag {
  return { tokens: [...bag.tokens, token] };
}

// Check if the bag has any tokens left to draw.
export function isEmpty(bag: Bag): boolean {
  return bag.tokens.length === 0;
}

// Count how many tokens of a specific color are in the bag.
export function countByColor(bag: Bag, color: Token["color"]): number {
  return bag.tokens.filter((t) => t.color === color).length;
}

// Reset the bag at the start of a new round —
// all tokens that were placed on the crucible go back in.
export function refillBag(bag: Bag, drawnTokens: Token[]): Bag {
  return { tokens: [...bag.tokens, ...drawnTokens] };
}
