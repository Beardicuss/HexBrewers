// Bonus die — rolled by the player with the highest non-exploded scoring space
// Results: ruby, coins, or a specific chip
import { gameplayRandom } from "./random";
import type { Player } from "./playerTypes";
import type { Token } from "./tokenTypes";

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
  const idx = Math.floor(gameplayRandom() * DIE_FACES.length);
  return DIE_FACES[idx];
}

export function applyBonusDieResult(
  player: Player,
  result: BonusDieResult,
  orangeToken: Token
): Player {
  if (result.type === "ruby") return { ...player, rubies: player.rubies + result.amount };
  if (result.type === "vp") return { ...player, score: player.score + result.amount };
  if (result.type === "droplet") {
    return {
      ...player,
      crucible: {
        ...player.crucible,
        dropletPosition: Math.min(32, player.crucible.dropletPosition + result.amount),
      },
    };
  }
  return { ...player, bag: { tokens: [...player.bag.tokens, orangeToken] } };
}

export function describeDieResult(result: BonusDieResult): string {
  switch (result.type) {
    case "ruby": return `+${result.amount} Ruby`;
    case "vp": return `+${result.amount} Prestige`;
    case "droplet": return "Droplet advances 1 space";
    case "chip_orange_1": return "Free Brimstone (value 1) added to bag";
  }
}
