import { describe, expect, it } from "vitest";
import { analyzeMarketPurchase } from "./marketInsights";
import type { Player } from "./playerTypes";
import type { MarketItem } from "./bazaarTypes";
import { createCrucible } from "./crucible";

function playerWith(colors: Array<"white" | "orange" | "red">): Player {
  return {
    id: "human", name: "Hexbrewer", kind: "human",
    bag: { tokens: colors.map((color, index) => ({ id: `${color}-${index}`, color, value: 1 })) },
    crucible: createCrucible(), rubies: 1, coinsThisRound: 0, score: 0, flask: true, ratStoneOffset: 0,
  };
}

function item(color: "white" | "red"): MarketItem {
  return { id: `market-${color}`, token: { id: `buy-${color}`, color, value: 1 }, cost: 4, stock: 3, available: true, unlockRound: 1 };
}

describe("market purchase insights", () => {
  it("shows that a safe ingredient dilutes the Voidshard share", () => {
    const insight = analyzeMarketPurchase(playerWith(["white", "white", "orange", "orange"]), item("red"));
    expect(insight.voidshardShareBefore).toBe(0.5);
    expect(insight.voidshardShareAfter).toBe(0.4);
    expect(insight.voidshardShareChange).toBeLessThan(0);
    expect(insight.synergy).toBe("brimstone");
  });

  it("shows that buying another Voidshard increases volatility", () => {
    const insight = analyzeMarketPurchase(playerWith(["white", "orange", "orange"]), item("white"));
    expect(insight.voidshardShareAfter).toBe(0.5);
    expect(insight.voidshardShareChange).toBeGreaterThan(0);
    expect(insight.role).toBe("volatility");
  });
});
