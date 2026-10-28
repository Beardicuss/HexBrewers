import { describe, expect, it } from "vitest";
import { RECIPE_GUIDANCE } from "./recipeGuidance";

describe("recipe guidance", () => {
  it("documents every variable recipe in all six sets", () => {
    for (const color of ["blue", "red", "yellow", "green", "purple"] as const) {
      expect(Object.keys(RECIPE_GUIDANCE[color])).toHaveLength(6);
      for (let set = 1; set <= 6; set += 1) {
        const ruling = RECIPE_GUIDANCE[color][set as 1 | 2 | 3 | 4 | 5 | 6];
        expect(ruling.trigger.length).toBeGreaterThan(8);
        expect(ruling.resolution.length).toBeGreaterThan(8);
        expect(ruling.multiple.length).toBeGreaterThan(15);
        expect(ruling.example.length).toBeGreaterThan(15);
        expect(ruling.worksWellWith.length).toBeGreaterThan(8);
        expect(ruling.tradeoff.length).toBeGreaterThan(8);
      }
    }
  });
});
