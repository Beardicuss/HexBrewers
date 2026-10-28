import { describe, expect, it } from "vitest";
import { createCrucible } from "./crucible";
import {
  adjustCoinRewardForDifficulty,
  calculateRoundScoreForDifficulty,
} from "./scoring";

describe("difficulty-scaled human coin economy", () => {
  it("keeps Apprentice at the printed scoring-space income", () => {
    expect(adjustCoinRewardForDifficulty(3, "apprentice")).toBe(3);
    expect(adjustCoinRewardForDifficulty(15, "apprentice")).toBe(15);
    expect(adjustCoinRewardForDifficulty(35, "apprentice")).toBe(35);
  });

  it("makes Skilled slightly harder without choking the opening market", () => {
    expect(adjustCoinRewardForDifficulty(3, "skilled")).toBe(3);
    expect(adjustCoinRewardForDifficulty(5, "skilled")).toBe(5);
    expect(adjustCoinRewardForDifficulty(10, "skilled")).toBe(9);
    expect(adjustCoinRewardForDifficulty(20, "skilled")).toBe(19);
  });

  it("makes Master substantially leaner while preserving earned buying power", () => {
    expect(adjustCoinRewardForDifficulty(0, "master")).toBe(0);
    expect(adjustCoinRewardForDifficulty(1, "master")).toBe(1);
    expect(adjustCoinRewardForDifficulty(5, "master")).toBe(3);
    expect(adjustCoinRewardForDifficulty(10, "master")).toBe(7);
    expect(adjustCoinRewardForDifficulty(20, "master")).toBe(14);
    expect(adjustCoinRewardForDifficulty(35, "master")).toBe(24);
  });

  it("does not tax AI market income a second time", () => {
    const crucible = { ...createCrucible(), filledUpTo: 9 };
    const human = calculateRoundScoreForDifficulty(crucible, "master", "human");
    const rival = calculateRoundScoreForDifficulty(crucible, "master", "ai");

    expect(human.space).toBe(10);
    expect(human.coins).toBe(7);
    expect(rival.coins).toBe(10);
  });
});
