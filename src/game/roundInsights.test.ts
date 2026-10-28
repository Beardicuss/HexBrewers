import { describe, expect, it } from "vitest";
import { createStartingBag } from "./bagFactory";
import { createCrucible, placeToken } from "./crucible";
import type { Player } from "./playerTypes";
import { analyzeRoundCausality } from "./roundInsights";
import type { Token } from "./tokenTypes";

function makePlayer(): Player {
  return {
    id: "human",
    name: "Hexbrewer",
    kind: "human",
    bag: createStartingBag(),
    crucible: createCrucible(),
    rubies: 1,
    coinsThisRound: 0,
    score: 0,
    flask: true,
    ratStoneOffset: 0,
  };
}

function token(id: string, color: Token["color"], value: number, acquiredRound?: number): Token {
  return {
    id,
    color,
    value,
    ...(acquiredRound === undefined ? {} : { acquiredFrom: "market" as const, acquiredRound }),
  };
}

describe("round causality", () => {
  it("identifies the exact draw that shattered the crucible", () => {
    let player = makePlayer();
    player = { ...player, crucible: placeToken(player.crucible, token("white-3a", "white", 3)) };
    player = { ...player, crucible: placeToken(player.crucible, token("orange-4", "orange", 4)) };
    player = { ...player, crucible: placeToken(player.crucible, token("white-3b", "white", 3)) };
    player = { ...player, crucible: placeToken(player.crucible, token("white-2", "white", 2)) };

    const result = analyzeRoundCausality(player, 4);

    expect(result.shatterCause).toMatchObject({ value: 2, pressureBefore: 6, pressureAfter: 8 });
    expect(result.valueDraw).toMatchObject({ color: "orange", movement: 4 });
    expect(result.stoppedWithTokens).toBe(0);
  });

  it("records protected rewards and a prior market purchase that paid off", () => {
    let player = makePlayer();
    const purchased = token("market-blue", "blue", 2, 2);
    player = { ...player, crucible: placeToken(player.crucible, purchased, 4) };
    player = { ...player, crucible: placeToken(player.crucible, token("white-2", "white", 2)) };

    const result = analyzeRoundCausality(player, 3);

    expect(result.stoppedWithTokens).toBe(player.bag.tokens.length);
    expect(result.emptiedBag).toBe(false);
    expect(result.purchaseContribution).toMatchObject({ color: "blue", movement: 4, acquiredRound: 2 });
  });

  it("distinguishes exhausting the bag from stopping with ingredients remaining", () => {
    const player = { ...makePlayer(), bag: { tokens: [] } };
    const result = analyzeRoundCausality(player, 2);

    expect(result.emptiedBag).toBe(true);
    expect(result.stoppedWithTokens).toBe(0);
  });
});
