import { describe, expect, it } from "vitest";
import type { Player } from "./playerTypes";
import type { Token } from "./tokenTypes";
import { createStartingBag } from "./bagFactory";
import { createCrucible, placeToken } from "./crucible";
import { calculateRoundScore } from "./scoring";
import { canUseFlask, useFlask } from "./flask";
import { createMarket } from "./bazaarFactory";
import { purchaseItem } from "./bazaar";
import { applyBlueImmediate, applyEndOfRoundEffects, applyGreenSetFourSpend, applyPurpleChoice, applyYellowImmediate, applyYellowSetOneBonus, greenSetFourSpendMax, greenSetTwoRewards, purpleChoices, redBonusValue } from "./chipEffects";
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
    blueProtectionDraws: 0,
    blueBonusExplosion: false,
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

  it("yellow can rescue a burst pot by returning the previous Voidshard", () => {
    const previousWhite = token("w3", "white", 3);
    let p = player("human");
    p = { ...p, crucible: placeToken(p.crucible, token("w5", "white", 5)) };
    p = { ...p, crucible: placeToken(p.crucible, previousWhite) };
    p = { ...p, crucible: placeToken(p.crucible, token("y1", "yellow", 1)) };

    expect(p.crucible.whiteSum).toBe(8);
    expect(p.crucible.exploded).toBe(true);

    const updated = applyYellowSetOneBonus(p, previousWhite);
    expect(updated.crucible.whiteSum).toBe(5);
    expect(updated.crucible.exploded).toBe(false);
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

  it("blue set two keeps a burst pot shattered but marks both-reward protection", () => {
    const books2 = createRecipeBooks(2);
    const blue = token("b1", "blue", 1);
    const white = token("w3", "white", 3);

    let p = player("human");
    p = { ...p, crucible: placeToken(p.crucible, token("w5", "white", 5)) };
    p = applyBlueImmediate({ ...p, crucible: placeToken(p.crucible, blue) }, blue, books2);
    p = { ...p, crucible: placeToken(p.crucible, white) };

    if (p.crucible.exploded && (p.blueProtectionDraws ?? 0) > 0) {
      p = { ...p, blueProtectionDraws: 0, blueBonusExplosion: true };
    }

    expect(p.crucible.exploded).toBe(true);
    expect(p.blueBonusExplosion).toBe(true);
  });

  it("green set four ruby spend is optional and bounded", () => {
    const books4 = createRecipeBooks(4);
    let p = player("human");
    p = { ...p, rubies: 2, crucible: placeToken(p.crucible, token("g1", "green", 1)) };
    p = { ...p, crucible: placeToken(p.crucible, token("g2", "green", 1)) };

    expect(greenSetFourSpendMax(p, books4)).toBe(2);

    const updated = applyGreenSetFourSpend(p, 1);
    expect(updated.rubies).toBe(1);
    expect(updated.crucible.dropletPosition).toBe(1);
  });

  it("green set two rewards depend on qualifying chip values", () => {
    const books2 = createRecipeBooks(2);
    let p = player("human");
    p = { ...p, crucible: placeToken(p.crucible, token("g2", "green", 2)) };
    p = { ...p, crucible: placeToken(p.crucible, token("g4", "green", 4)) };

    const rewards = greenSetTwoRewards(p, books2);

    expect(rewards).toHaveLength(2);
    expect(rewards[0].options).toEqual([
      { color: "blue", value: 1 },
      { color: "red", value: 1 },
    ]);
    expect(rewards[1].options).toEqual([
      { color: "yellow", value: 1 },
      { color: "purple", value: 1 },
    ]);
  });

  it("red set two reserve can persist beside the pot into later rounds", () => {
    let state = createInitialState(2);
    const reserved = token("r1", "red", 1);
    state = {
      ...state,
      players: state.players.map((p) =>
        p.id === "human" ? { ...p, redReserve: [reserved] } : p
      ),
    };

    const next = advanceToNextRound(state);
    const human = next.players.find((p) => p.id === "human")!;

    expect(human.redReserve?.map((t) => t.id)).toEqual([reserved.id]);
  });

  it("purple set one can take lower rewards", () => {
    let p = player("human");
    p = { ...p, crucible: placeToken(p.crucible, token("p1", "purple", 1)) };
    p = { ...p, crucible: placeToken(p.crucible, token("p2", "purple", 1)) };
    p = { ...p, crucible: placeToken(p.crucible, token("p3", "purple", 1)) };

    const choices = purpleChoices(p, createRecipeBooks(1));
    const lower = choices.find((choice) => choice.kind === "set1" && choice.level === 2)!;
    const updated = applyPurpleChoice(p, lower);

    expect(updated.score).toBe(1);
    expect(updated.rubies).toBe(1);
    expect(updated.crucible.dropletPosition).toBe(0);
  });

  it("purple set two trades drawn purple chips for rewards", () => {
    let p = player("human");
    p = { ...p, crucible: placeToken(p.crucible, token("p1", "purple", 1)) };
    p = { ...p, crucible: placeToken(p.crucible, token("p2", "purple", 1)) };

    const choices = purpleChoices(p, createRecipeBooks(2));
    const trade = choices.find((choice) => choice.kind === "set2" && choice.tradeCount === 2)!;
    const updated = applyPurpleChoice(p, trade);

    expect(updated.score).toBe(3);
    expect(updated.crucible.dropletPosition).toBe(1);
    expect(updated.bag.tokens.some((t) => t.color === "green" && t.value === 1)).toBe(true);
    expect(updated.bag.tokens.some((t) => t.color === "blue" && t.value === 2)).toBe(true);
    expect(updated.crucible.slots.some((slot) => slot.token?.color === "purple")).toBe(false);
  });

  it("purple set four upgrades an eligible placed chip into the bag", () => {
    let p = player("human");
    const orange = token("o1", "orange", 1);
    p = { ...p, crucible: placeToken(p.crucible, orange) };
    p = { ...p, crucible: placeToken(p.crucible, token("p1", "purple", 1)) };
    p = { ...p, crucible: placeToken(p.crucible, token("p2", "purple", 1)) };
    p = { ...p, crucible: placeToken(p.crucible, token("p3", "purple", 1)) };

    const choices = purpleChoices(p, createRecipeBooks(4));
    const upgrade = choices.find((choice) => choice.kind === "set4" && choice.toValue === 4)!;
    const updated = applyPurpleChoice(p, upgrade);

    expect(updated.crucible.slots.some((slot) => slot.token?.id === orange.id)).toBe(false);
    expect(updated.bag.tokens.some((t) => t.color === "orange" && t.value === 4)).toBe(true);
  });
});
