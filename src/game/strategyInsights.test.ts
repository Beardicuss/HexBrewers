import { describe, expect, it } from "vitest";
import type { Token } from "./tokenTypes";
import { calculateNextDrawRisk, groupTokens } from "./strategyInsights";

const token = (id: string, color: Token["color"], value: number): Token => ({ id, color, value });

describe("strategy insights", () => {
  it("groups equal ingredient values without exposing draw order", () => {
    expect(groupTokens([
      token("g1", "green", 1),
      token("w2", "white", 2),
      token("w1", "white", 2),
      token("g2", "green", 2),
    ])).toEqual([
      { color: "white", value: 2, count: 2 },
      { color: "green", value: 1, count: 1 },
      { color: "green", value: 2, count: 1 },
    ]);
  });

  it("calculates only immediately shattering Voidshards as dangerous", () => {
    const risk = calculateNextDrawRisk({ tokens: [
      token("w1", "white", 1),
      token("w2", "white", 2),
      token("g1", "green", 3),
      token("o1", "orange", 1),
    ] }, 6);

    expect(risk.dangerousCount).toBe(1);
    expect(risk.probability).toBe(0.25);
    expect(risk.band).toBe("grave");
    expect(risk.minimumMovement).toBe(1);
    expect(risk.maximumMovement).toBe(3);
  });

  it("reports an empty bag as safe with no movement range", () => {
    expect(calculateNextDrawRisk({ tokens: [] }, 7)).toEqual({
      dangerousCount: 0,
      totalCount: 0,
      probability: 0,
      band: "safe",
      minimumMovement: 0,
      maximumMovement: 0,
    });
  });
});
