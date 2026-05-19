import type { Bag } from "./bagTypes";
import type { Token } from "./tokenTypes";

// Official starting bag: 4×white-1, 2×white-2, 1×white-3, 1×orange-1, 1×green-1
export function createStartingBag(): Bag {
  const tokens: Token[] = [
    { id: "white-1a", color: "white",  value: 1 },
    { id: "white-1b", color: "white",  value: 1 },
    { id: "white-1c", color: "white",  value: 1 },
    { id: "white-1d", color: "white",  value: 1 },
    { id: "white-2a", color: "white",  value: 2 },
    { id: "white-2b", color: "white",  value: 2 },
    { id: "white-3a", color: "white",  value: 3 },
    { id: "orange-1a", color: "orange", value: 1 },
    { id: "green-1a",  color: "green",  value: 1 },
  ];
  return { tokens };
}

// Round 6 rule: add 1 extra white 1-chip to every player's bag
export function addRound6WhiteChip(bag: Bag, playerId: string): Bag {
  const extra: Token = { id: `white-1-r6-${playerId}`, color: "white", value: 1 };
  return { tokens: [...bag.tokens, extra] };
}
