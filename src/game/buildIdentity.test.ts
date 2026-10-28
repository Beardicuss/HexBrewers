import { describe, expect, it } from "vitest";
import { analyzeBuildIdentity, BASE_RECIPE_IDENTITIES, getIngredientBuildIdentity } from "./buildIdentity";
import { createCrucible } from "./crucible";
import type { Player } from "./playerTypes";
import { createRecipeBooks } from "./recipeBooks";
import type { TokenColor } from "./tokenTypes";

function playerWith(colors: TokenColor[]): Player {
  return {
    id: "human",
    name: "Hexbrewer",
    kind: "human",
    bag: { tokens: colors.map((color, index) => ({ id: `${color}-${index}`, color, value: color === "purple" ? 1 : 2 })) },
    crucible: createCrucible(),
    rubies: 1,
    coinsThisRound: 0,
    score: 0,
    flask: true,
    ratStoneOffset: 0,
  };
}

describe("strategic build identities", () => {
  it("audits every base recipe color in every base recipe set", () => {
    for (const identities of Object.values(BASE_RECIPE_IDENTITIES)) {
      expect(Object.keys(identities)).toEqual(["1", "2", "3", "4"]);
      for (const identity of Object.values(identities)) {
        expect(identity.primary).not.toBe(identity.secondary);
      }
    }
  });

  it("changes an ingredient's identity with its active recipe", () => {
    expect(getIngredientBuildIdentity("blue", 1)).toEqual({ primary: "control", secondary: "adaptation" });
    expect(getIngredientBuildIdentity("blue", 4)).toEqual({ primary: "rubyEngine", secondary: "aggression" });
  });

  it("derives an evolving identity from the player's actual bag", () => {
    const identity = analyzeBuildIdentity(playerWith(["white", "orange", "red", "red", "red"]), createRecipeBooks(1));
    expect(identity.primary).toBe("resonance");
    expect(identity.secondary).toBe("aggression");
    expect(identity.supportingColors.slice(0, 2)).toEqual(["red", "orange"]);
  });

  it("does not treat Voidshards as a chosen build identity", () => {
    const identity = analyzeBuildIdentity(playerWith(["white", "white", "white"]), createRecipeBooks(1));
    expect(identity.primaryScore).toBe(0);
    expect(identity.supportingColors).toEqual([]);
    expect(identity.recipeEnvironment.length).toBeGreaterThan(0);
  });
});
