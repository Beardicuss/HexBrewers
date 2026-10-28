import { describe, expect, it } from "vitest";
import { createPlayer } from "../store/gameStoreHelpers";
import { placeToken } from "./crucible";
import { applyRoundObjectiveReward, objectiveCompleted, objectiveForRound, ROUND_OBJECTIVES } from "./roundObjectives";
import type { Token } from "./tokenTypes";

const result = { space: 10, vp: 2, coins: 8, ruby: false, exploded: false };
const token = (id: string, color: Token["color"], value = 1): Token => ({ id, color, value });

describe("Ashenveil Ritual round objectives", () => {
  it("authors one distinct optional contract for every round", () => {
    expect(ROUND_OBJECTIVES).toHaveLength(9);
    expect(new Set(ROUND_OBJECTIVES.map((entry) => entry.id)).size).toBe(9);
    expect(objectiveForRound(1).id).toBe("steady_hand");
    expect(objectiveForRound(9).id).toBe("ninth_witness");
  });

  it("requires three distinct non-Voidshard families for Three Voices", () => {
    let player = createPlayer("human", "Hexbrewer", "human");
    player = { ...player, crucible: placeToken(player.crucible, token("a", "orange")) };
    player = { ...player, crucible: placeToken(player.crucible, token("b", "green")) };
    expect(objectiveCompleted("three_voices", player, result)).toBe(false);
    player = { ...player, crucible: placeToken(player.crucible, token("c", "blue")) };
    expect(objectiveCompleted("three_voices", player, result)).toBe(true);
  });

  it("never rewards a shattered brew and caps rewards to the authored amount", () => {
    const player = { ...createPlayer("human", "Hexbrewer", "human"), rubies: 2, score: 4 };
    expect(applyRoundObjectiveReward(player, { ...result, exploded: true }, 8)).toEqual(player);
    expect(applyRoundObjectiveReward(player, result, 8).score).toBe(5);
  });

  it("awards the final contract only for an ambitious controlled brew", () => {
    const base = createPlayer("human", "Hexbrewer", "human");
    const player = { ...base, crucible: { ...base.crucible, whiteSum: 6 }, score: 3, rubies: 0 };
    const rewarded = applyRoundObjectiveReward(player, { ...result, space: 12 }, 9);
    expect(rewarded).toMatchObject({ score: 4, rubies: 1 });
    expect(applyRoundObjectiveReward(player, { ...result, space: 11 }, 9)).toEqual(player);
  });
});
