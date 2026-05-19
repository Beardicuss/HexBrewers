// Bonus die — rolled by the player with the highest non-exploded scoring space
// Results: ruby, coins, or a specific chip

export type BonusDieResult =
  | { type: "ruby"; amount: 1 }
  | { type: "coins"; amount: number }
  | { type: "chip_white_1" }
  | { type: "chip_orange_1" }
  | { type: "nothing" };

// Official die has 6 faces
const DIE_FACES: BonusDieResult[] = [
  { type: "ruby", amount: 1 },
  { type: "ruby", amount: 1 },
  { type: "coins", amount: 2 },
  { type: "coins", amount: 4 },
  { type: "chip_orange_1" },
  { type: "nothing" },
];

export function rollBonusDie(): BonusDieResult {
  const idx = Math.floor(Math.random() * DIE_FACES.length);
  return DIE_FACES[idx];
}

export function describeDieResult(result: BonusDieResult): string {
  switch (result.type) {
    case "ruby": return `+${result.amount} Ruby`;
    case "coins": return `+${result.amount} Coins`;
    case "chip_white_1": return "Free Voidshard (value 1) added to bag";
    case "chip_orange_1": return "Free Brimstone (value 1) added to bag";
    case "nothing": return "No bonus";
  }
}
