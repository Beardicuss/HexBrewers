import { describe, expect, it } from "vitest";
import { BASE_EFFECT_AUDIT, BASE_SET_STRATEGIES } from "./strategyBalance";

describe("Phase 2 strategy balance catalogue", () => {
  it("audits every base recipe effect exactly once", () => {
    expect(BASE_EFFECT_AUDIT).toHaveLength(20);
    expect(new Set(BASE_EFFECT_AUDIT.map((entry) => `${entry.set}:${entry.color}`)).size).toBe(20);
    expect(BASE_EFFECT_AUDIT.every((entry) => entry.synergies.length > 0 && entry.counterweights.length > 0)).toBe(true);
  });

  it("defines three distinct approaches for every base set", () => {
    for (const set of [1, 2, 3, 4] as const) {
      const strategies = BASE_SET_STRATEGIES[set];
      expect(strategies).toHaveLength(3);
      expect(new Set(strategies.map((strategy) => strategy.id)).size).toBe(3);
      expect(strategies.every((strategy) => strategy.preferredColors.length >= 3)).toBe(true);
    }
  });

  it("flags the genuinely passive base effects for observation", () => {
    const passive = BASE_EFFECT_AUDIT.filter((entry) => entry.choiceDepth === "passive");
    expect(passive.map((entry) => `${entry.set}:${entry.color}`).sort()).toEqual(["3:yellow", "4:red"]);
    expect(passive.every((entry) => entry.watchpoint)).toBe(true);
  });
});
