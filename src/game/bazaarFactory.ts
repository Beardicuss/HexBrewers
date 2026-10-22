import type { MarketItem } from "./bazaarTypes";
import type { RecipeBooks } from "./recipeBooks";
import { DEFAULT_RECIPE_BOOKS, getRecipeCost } from "./recipeBooks";

// Stock counts per chip — limited supply per the official game
// Colors: white=Voidshards, orange=Brimstone, green=Deathweave,
//         blue=Frostbile, red=Bloodthorn, yellow=Plaguedust,
//         purple=Wraithbloom, black=Shadowmoss

export function createMarket(
  recipeBooks: RecipeBooks = DEFAULT_RECIPE_BOOKS,
  playerCount = 2,
  includeCovenants = false,
  includeVeilglass = false,
): MarketItem[] {
  const seatedPlayers = Math.max(2, Math.min(5, playerCount));
  const market: MarketItem[] = [
    // Orange (Brimstone) — no effect, pure position
    { id: "m-orange-1", token: { id: "o1-buy", color: "orange", value: 1 }, cost: 3, stock: 22 - seatedPlayers, available: true, unlockRound: 1 },

    // Green (Deathweave) — end-of-round effect
    { id: "m-green-1", token: { id: "g1-buy", color: "green", value: 1 }, cost: getRecipeCost("green", 1, recipeBooks), stock: 15 - seatedPlayers, available: true, unlockRound: 1 },
    { id: "m-green-2", token: { id: "g2-buy", color: "green", value: 2 }, cost: getRecipeCost("green", 2, recipeBooks), stock: 8, available: true, unlockRound: 1 },
    { id: "m-green-4", token: { id: "g4-buy", color: "green", value: 4 }, cost: getRecipeCost("green", 4, recipeBooks), stock: 13, available: true, unlockRound: 1 },

    // Blue (Frostbile) — immediate: draw 2 extra, keep 1
    { id: "m-blue-1", token: { id: "b1-buy", color: "blue", value: 1 }, cost: getRecipeCost("blue", 1, recipeBooks), stock: 12, available: true, unlockRound: 1 },
    { id: "m-blue-2", token: { id: "b2-buy", color: "blue", value: 2 }, cost: getRecipeCost("blue", 2, recipeBooks), stock: 8, available: true, unlockRound: 1 },
    { id: "m-blue-4", token: { id: "b4-buy", color: "blue", value: 4 }, cost: getRecipeCost("blue", 4, recipeBooks), stock: 10, available: true, unlockRound: 1 },

    // Red (Bloodthorn) — immediate: extra movement based on orange chips in pot
    { id: "m-red-1", token: { id: "r1-buy", color: "red", value: 1 }, cost: getRecipeCost("red", 1, recipeBooks), stock: 12, available: true, unlockRound: 1 },
    { id: "m-red-2", token: { id: "r2-buy", color: "red", value: 2 }, cost: getRecipeCost("red", 2, recipeBooks), stock: 8, available: true, unlockRound: 1 },
    { id: "m-red-4", token: { id: "r4-buy", color: "red", value: 4 }, cost: getRecipeCost("red", 4, recipeBooks), stock: 10, available: true, unlockRound: 1 },

    // Yellow (Plaguedust) — unlocks round 2; immediate: may return previous white chip
    { id: "m-yellow-1", token: { id: "y1-buy", color: "yellow", value: 1 }, cost: getRecipeCost("yellow", 1, recipeBooks), stock: 13, available: false, unlockRound: 2 },
    { id: "m-yellow-2", token: { id: "y2-buy", color: "yellow", value: 2 }, cost: getRecipeCost("yellow", 2, recipeBooks), stock: 8, available: false, unlockRound: 2 },
    { id: "m-yellow-4", token: { id: "y4-buy", color: "yellow", value: 4 }, cost: getRecipeCost("yellow", 4, recipeBooks), stock: 10, available: false, unlockRound: 2 },

    // Purple (Wraithbloom) — unlocks round 3; end-of-round effect
    { id: "m-purple-1", token: { id: "p1-buy", color: "purple", value: 1 }, cost: getRecipeCost("purple", 1, recipeBooks), stock: 17, available: false, unlockRound: 3 },

    // Black (Shadowmoss) — end-of-round effect, expensive
    { id: "m-black-1", token: { id: "k1-buy", color: "black", value: 1 }, cost: 10, stock: 17, available: true, unlockRound: 1 },
  ];

  if (includeCovenants || includeVeilglass) market.push(
    { id: "m-echo-0", token: { id: "e0-buy", color: "echo", value: 0 }, cost: 8, stock: seatedPlayers, available: false, unlockRound: 2 },
  );
  if (includeCovenants) market.push(
    { id: "m-orange-6", token: { id: "o6-buy", color: "orange", value: 6 }, cost: 12, stock: seatedPlayers, available: false, unlockRound: 2 },
  );
  return market;
}
