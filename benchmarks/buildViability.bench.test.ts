import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { benchmarkBuildViability } from "../src/game/balanceSimulation";

describe("base recipe build viability benchmark", () => {
  it("supports at least three viable strategic approaches in every base recipe set", () => {
    const rows = benchmarkBuildViability(120);
    const outputPath = resolve(process.cwd(), "benchmarks/latest-build-viability.json");
    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), matchesPerStrategy: 120, rows }, null, 2)}\n`);

    for (const set of [1, 2, 3, 4] as const) {
      const setRows = rows.filter((row) => row.recipeSet === set);
      expect(setRows).toHaveLength(3);
      expect(setRows.filter((row) => row.viable), JSON.stringify(setRows, null, 2)).toHaveLength(3);
    }
  }, 60_000);
});
