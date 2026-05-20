import type { MarketItem } from "./bazaarTypes";

// Stock counts per chip — limited supply per the official game
// Colors: white=Voidshards, orange=Brimstone, green=Deathweave,
//         blue=Frostbile, red=Bloodthorn, yellow=Plaguedust,
//         purple=Wraithbloom, black=Shadowmoss

export function createMarket(): MarketItem[] {
  return [
    // Orange (Brimstone) — no effect, pure position
    { id: "m-orange-1", token: { id: "o1-buy", color: "orange", value: 1 }, cost: 3, stock: 20, available: true, unlockRound: 1 },

    // Green (Deathweave) — end-of-round effect
    { id: "m-green-1", token: { id: "g1-buy", color: "green", value: 1 }, cost: 4, stock: 13, available: true, unlockRound: 1 },
    { id: "m-green-2", token: { id: "g2-buy", color: "green", value: 2 }, cost: 8, stock: 8, available: true, unlockRound: 1 },
    { id: "m-green-4", token: { id: "g4-buy", color: "green", value: 4 }, cost: 14, stock: 13, available: true, unlockRound: 1 },

    // Blue (Frostbile) — immediate: draw 2 extra, keep 1
    { id: "m-blue-1", token: { id: "b1-buy", color: "blue", value: 1 }, cost: 5, stock: 8, available: true, unlockRound: 1 },
    { id: "m-blue-2", token: { id: "b2-buy", color: "blue", value: 2 }, cost: 10, stock: 8, available: true, unlockRound: 1 },
    { id: "m-blue-4", token: { id: "b4-buy", color: "blue", value: 4 }, cost: 19, stock: 10, available: true, unlockRound: 1 },

    // Red (Bloodthorn) — immediate: extra movement based on orange chips in pot
    { id: "m-red-1", token: { id: "r1-buy", color: "red", value: 1 }, cost: 6, stock: 12, available: true, unlockRound: 1 },
    { id: "m-red-2", token: { id: "r2-buy", color: "red", value: 2 }, cost: 10, stock: 8, available: true, unlockRound: 1 },
    { id: "m-red-4", token: { id: "r4-buy", color: "red", value: 4 }, cost: 16, stock: 10, available: true, unlockRound: 1 },

    // Yellow (Plaguedust) — unlocks round 2; immediate: may return previous white chip
    { id: "m-yellow-1", token: { id: "y1-buy", color: "yellow", value: 1 }, cost: 8, stock: 13, available: false, unlockRound: 2 },
    { id: "m-yellow-2", token: { id: "y2-buy", color: "yellow", value: 2 }, cost: 12, stock: 8, available: false, unlockRound: 2 },
    { id: "m-yellow-4", token: { id: "y4-buy", color: "yellow", value: 4 }, cost: 18, stock: 10, available: false, unlockRound: 2 },

    // Purple (Wraithbloom) — unlocks round 3; end-of-round effect
    { id: "m-purple-1", token: { id: "p1-buy", color: "purple", value: 1 }, cost: 9, stock: 17, available: false, unlockRound: 3 },

    // Black (Shadowmoss) — end-of-round effect, expensive
    { id: "m-black-1", token: { id: "k1-buy", color: "black", value: 1 }, cost: 10, stock: 17, available: true, unlockRound: 1 },
  ];
}
