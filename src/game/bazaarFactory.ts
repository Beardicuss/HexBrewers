import type { MarketItem } from "./bazaarTypes";

// Stock counts per chip — limited supply per the official game
// Colors: white=Voidshards, orange=Brimstone, green=Deathweave,
//         blue=Frostbile, red=Bloodthorn, yellow=Plaguedust,
//         purple=Wraithbloom, black=Shadowmoss

export function createMarket(): MarketItem[] {
  return [
    // White (Voidshards) — always available, cheap, risky
    { id: "m-white-1", token: { id: "w1-buy", color: "white", value: 1 }, cost: 3, stock: 10, available: true, unlockRound: 1 },
    { id: "m-white-2", token: { id: "w2-buy", color: "white", value: 2 }, cost: 5, stock: 8, available: true, unlockRound: 1 },
    { id: "m-white-3", token: { id: "w3-buy", color: "white", value: 3 }, cost: 9, stock: 4, available: true, unlockRound: 1 },

    // Orange (Brimstone) — no effect, pure position
    { id: "m-orange-1", token: { id: "o1-buy", color: "orange", value: 1 }, cost: 4, stock: 10, available: true, unlockRound: 1 },
    { id: "m-orange-2", token: { id: "o2-buy", color: "orange", value: 2 }, cost: 6, stock: 8, available: true, unlockRound: 1 },

    // Green (Deathweave) — end-of-round effect
    { id: "m-green-1", token: { id: "g1-buy", color: "green", value: 1 }, cost: 4, stock: 8, available: true, unlockRound: 1 },
    { id: "m-green-2", token: { id: "g2-buy", color: "green", value: 2 }, cost: 8, stock: 6, available: true, unlockRound: 1 },
    { id: "m-green-4", token: { id: "g4-buy", color: "green", value: 4 }, cost: 16, stock: 4, available: true, unlockRound: 1 },

    // Blue (Frostbile) — immediate: draw 2 extra, keep 1
    { id: "m-blue-1", token: { id: "b1-buy", color: "blue", value: 1 }, cost: 5, stock: 8, available: true, unlockRound: 1 },
    { id: "m-blue-2", token: { id: "b2-buy", color: "blue", value: 2 }, cost: 10, stock: 6, available: true, unlockRound: 1 },
    { id: "m-blue-4", token: { id: "b4-buy", color: "blue", value: 4 }, cost: 20, stock: 3, available: true, unlockRound: 1 },

    // Red (Bloodthorn) — immediate: move 1 extra per red in pot
    { id: "m-red-1", token: { id: "r1-buy", color: "red", value: 1 }, cost: 5, stock: 8, available: true, unlockRound: 1 },
    { id: "m-red-2", token: { id: "r2-buy", color: "red", value: 2 }, cost: 9, stock: 6, available: true, unlockRound: 1 },

    // Yellow (Plaguedust) — unlocks round 2; immediate: 1 ruby per pair
    { id: "m-yellow-1", token: { id: "y1-buy", color: "yellow", value: 1 }, cost: 4, stock: 8, available: false, unlockRound: 2 },
    { id: "m-yellow-2", token: { id: "y2-buy", color: "yellow", value: 2 }, cost: 7, stock: 6, available: false, unlockRound: 2 },

    // Purple (Wraithbloom) — unlocks round 3; end-of-round effect
    { id: "m-purple-1", token: { id: "p1-buy", color: "purple", value: 1 }, cost: 6, stock: 8, available: false, unlockRound: 3 },
    { id: "m-purple-2", token: { id: "p2-buy", color: "purple", value: 2 }, cost: 9, stock: 6, available: false, unlockRound: 3 },

    // Black (Shadowmoss) — end-of-round effect, expensive
    { id: "m-black-1", token: { id: "k1-buy", color: "black", value: 1 }, cost: 8, stock: 5, available: true, unlockRound: 1 },
  ];
}
