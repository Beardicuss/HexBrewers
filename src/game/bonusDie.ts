// Bonus die — rolled by the player with the highest non-exploded scoring space
// Results: ruby, coins, or a specific chip

export type BonusDieResult =
  | { type: "ruby"; amount: 1 }
  | { type: "vp"; amount: 1 | 2 }
  | { type: "droplet"; amount: 1 }
  | { type: "chip_orange_1" };

// Official die has 6 faces
const DIE_FACES: BonusDieResult[] = [
  { type: "ruby", amount: 1 },
  { type: "vp", amount: 1 },
  { type: "vp", amount: 2 },
  { type: "droplet", amount: 1 },
  { type: "chip_orange_1" },
  { type: "chip_orange_1" },
];

export function rollBonusDie(): BonusDieResult {
  const idx = Math.floor(Math.random() * DIE_FACES.length);
  return DIE_FACES[idx];
}

export function describeDieResult(result: BonusDieResult): string {
  switch (result.type) {
    case "ruby": return `+${result.amount} Ruby`;
    case "vp": return `+${result.amount} Prestige`;
    case "droplet": return "Droplet advances 1 space";
    case "chip_orange_1": return "Free Brimstone (value 1) added to bag";
  }
}
