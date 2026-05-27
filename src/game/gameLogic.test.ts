import { describe, expect, it } from "vitest";
import type { Player } from "./playerTypes";
import type { Token } from "./tokenTypes";
import { createStartingBag } from "./bagFactory";
import { createCrucible, placeToken } from "./crucible";
import { calculateRoundScore } from "./scoring";
import { canUseFlask, useFlask } from "./flask";
import { createMarket } from "./bazaarFactory";
import { purchaseItem } from "./bazaar";
import { applyBlueImmediate, applyEndOfRoundEffects, applyYellowImmediate, applyYellowSetOneBonus, redBonusValue } from "./chipEffects";
import { rollBonusDie } from "./bonusDie";
import { advanceToNextRound } from "../store/gameStoreRound";
import { createInitialState } from "../store/gameStoreHelpers";
import { createRecipeBooks } from "./recipeBooks";

function token(id: string, color: Token["color"], value: number): Token {
  return { id, color, value };
}

function player(id: string): Player {
  return {
    id,
    name: id,
    kind: id === "ai" ? "ai" : "human",
    bag: createStartingBag(),
    crucible: createCrucible(),
    rubies: 0,
    coinsThisRound: 0,
    score: 0,
    flask: true,
    ratStoneOffset: 0,
  };
}

describe("official renamed rules", () => {
  it("scores the empty space after the last placed token", () => {
    const crucible = placeToken(createCrucible(), token("o", "orange", 1));
    const result = calculateRoundScore(crucible);

    expect(crucible.filledUpTo).toBe(1);
    expect(result.space).toBe(2);
    expect(result.coins).toBe(2);
    expect(result.vp).toBe(0);
  });

  it("explodes only when Voidshard value exceeds 7", () => {
    let crucible = createCrucible();
    crucible = placeToken(crucible, token("w3a", "white", 3));
    crucible = placeToken(crucible, token("w2a", "white", 2));
    crucible = placeToken(crucible, token("w2b", "white", 2));

    expect(crucible.whiteSum).toBe(7);
    expect(crucible.exploded).toBe(false);

    crucible = placeToken(crucible, token("w1a", "white", 1));

    expect(crucible.whiteSum).toBe(8);
    expect(crucible.exploded).toBe(true);
  });

  it("flask returns the last safe white chip and cannot be used after explosion", () => {
    const base = player("human");
    const safe = { ...base, crucible: placeToken(base.crucible, token("w1", "white", 1)) };

    expect(canUseFlask(safe)).toBe(true);
    const afterFlask = useFlask(safe);
    expect(afterFlask.flask).toBe(false);
    expect(afterFlask.crucible.whiteSum).toBe(0);
    expect(afterFlask.bag.tokens.some((t) => t.id === "w1")).toBe(true);

    let blown = base;
    blown = { ...blown, crucible: placeToken(blown.crucible, token("w3", "white", 3)) };
    blown = { ...blown, crucible: placeToken(blown.crucible, token("w3b", "white", 3)) };
    blown = { ...blown, crucible: placeToken(blown.crucible, token("w2", "white", 2)) };
    expect(canUseFlask(blown)).toBe(false);
  });

  it("red advances extra based on Brimstone already in the pot", () => {
    let crucible = createCrucible();
    expect(redBonusValue(crucible)).toBe(0);
    crucible = placeToken(crucible, token("o1", "orange", 1));
    expect(redBonusValue(crucible)).toBe(1);
    crucible = placeToken(crucible, token("o2", "orange", 1));
    crucible = placeToken(crucible, token("o3", "orange", 1));
    expect(redBonusValue(crucible)).toBe(2);
  });

  it("yellow can return the directly previous Voidshard", () => {
    const white = token("w1", "white", 1);
    const yellow = token("y1", "yellow", 1);
    let p = player("human");
    p = { ...p, bag: { tokens: [] }, crucible: placeToken(p.crucible, white) };
    p = { ...p, crucible: placeToken(p.crucible, yellow) };

    const updated = applyYellowSetOneBonus(p, white);
    expect(updated.crucible.whiteSum).toBe(0);
    expect(updated.bag.tokens.some((t) => t.id === white.id)).toBe(true);
  });

  it("green, purple, and black end-round effects resolve from final pots", () => {
    let human = player("human");
    let shade = player("ai");
    human = { ...human, crucible: placeToken(human.crucible, token("g", "green", 1)) };
    human = { ...human, crucible: placeToken(human.crucible, token("p", "purple", 1)) };
    human = { ...human, crucible: placeToken(human.crucible, token("k", "black", 1)) };
    shade = { ...shade, crucible: placeToken(shade.crucible, token("o", "orange", 1)) };

    const updated = applyEndOfRoundEffects(human, shade);

    expect(updated.rubies).toBe(1);
    expect(updated.score).toBe(1);
    expect(updated.crucible.dropletPosition).toBe(1);
  });

  it("market allows at most two purchases and they must be different colors", () => {
    const market = createMarket();
    const p = { ...player("human"), coinsThisRound: 99 };
    const buyState = { purchases: [], coinsSpent: 0, coinsAvailable: 99 };
    const first = purchaseItem(p, market, buyState, "m-green-1", 1);

    expect(() =>
      purchaseItem(first.player, first.market, first.state, "m-green-2", 1)
    ).toThrow();

    const second = purchaseItem(first.player, first.market, first.state, "m-blue-1", 1);
    expect(second.state.purchases).toHaveLength(2);
    expect(() =>
      purchaseItem(second.player, second.market, second.state, "m-orange-1", 1)
    ).toThrow();
  });

  it("bonus die only returns supported renamed rewards", () => {
    const result = rollBonusDie();
    expect(["ruby", "vp", "droplet", "chip_orange_1"]).toContain(result.type);
  });

  it("endgame converts leftover coins and rubies into prestige", () => {
    let state = createInitialState();
    state = {
      ...state,
      currentRound: 9,
      players: state.players.map((p) => ({
        ...p,
        score: p.id === "human" ? 10 : 9,
        coinsThisRound: p.id === "human" ? 10 : 0,
        rubies: p.id === "human" ? 2 : 0,
      })),
    };

    const final = advanceToNextRound(state);
    const human = final.players.find((p) => p.id === "human")!;

    expect(final.phase).toBe("game_over");
    expect(human.score).toBe(13);
    expect(final.winner?.id).toBe("human");
  });

  it("market costs follow selected recipe books", () => {
    const set1 = createMarket(createRecipeBooks(1));
    const set3 = createMarket(createRecipeBooks(3));

    expect(set1.find((item) => item.id === "m-blue-4")?.cost).toBe(19);
    expect(set3.find((item) => item.id === "m-blue-4")?.cost).toBe(14);
  });

  it("alternate recipe books change immediate effects", () => {
    const books2 = createRecipeBooks(2);
    const books4 = createRecipeBooks(4);
    const blue = token("b2", "blue", 2);
    const yellow = token("y1", "yellow", 1);

    const protectedPlayer = applyBlueImmediate(player("human"), blue, books2);
    expect(protectedPlayer.blueProtectionDraws).toBe(2);

    let yellowPlayer = player("human");
    yellowPlayer = { ...yellowPlayer, crucible: placeToken(yellowPlayer.crucible, yellow) };
    yellowPlayer = applyYellowImmediate(yellowPlayer, null, books4);
    expect(redBonusValue(yellowPlayer.crucible, books4)).toBe(0);
  });
});
