import { describe, expect, it } from "vitest";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { simulateMatches } from "../src/game/balanceSimulation";

describe("Mirewrought population balance benchmark", () => {
  it("runs 4,000 seeded matches across both recipe sets and table sizes", () => {
    const matchesPerConfiguration = 1_000;
    const rows = ([5, 6] as const).flatMap((recipeSet) =>
      ([2, 5] as const).map((playerCount) => {
        const results = simulateMatches(
          matchesPerConfiguration,
          2_000_000 + recipeSet * 100_000 + playerCount * 10_000,
          recipeSet,
          playerCount,
          "skilled",
          ["covenants_of_the_mire"],
        );
        const aiIds = Object.keys(results[0].scores).filter((id) => id !== "human");
        const averageFor = (field: "scores" | "explosions" | "draws" | "purchases", ids: string[]) =>
          results.reduce(
            (total, result) => total + ids.reduce((sum, id) => sum + result[field][id], 0) / ids.length,
            0,
          ) / results.length;
        const humanScore = averageFor("scores", ["human"]);
        const aiScore = averageFor("scores", aiIds);

        return {
          recipeSet,
          playerCount,
          matches: results.length,
          humanWinPct: Number((results.filter((result) => result.winnerIds.includes("human")).length / results.length * 100).toFixed(1)),
          anyAIWinPct: Number((results.filter((result) => result.winnerIds.some((id) => id !== "human")).length / results.length * 100).toFixed(1)),
          tiePct: Number((results.filter((result) => result.winnerIds.length > 1).length / results.length * 100).toFixed(1)),
          humanScore: Number(humanScore.toFixed(2)),
          aiScore: Number(aiScore.toFixed(2)),
          seatScoreDelta: Number(Math.abs(humanScore - aiScore).toFixed(2)),
          humanExplosions: Number(averageFor("explosions", ["human"]).toFixed(2)),
          aiExplosions: Number(averageFor("explosions", aiIds).toFixed(2)),
          humanDraws: Number(averageFor("draws", ["human"]).toFixed(2)),
          aiDraws: Number(averageFor("draws", aiIds).toFixed(2)),
          humanPurchases: Number(averageFor("purchases", ["human"]).toFixed(2)),
          aiPurchases: Number(averageFor("purchases", aiIds).toFixed(2)),
          invalidEconomies: results.filter((result) => !result.economyValid).length,
          invalidTokenFlows: results.filter((result) => !result.tokenFlowValid).length,
        };
      }),
    );

    console.table(rows);
    writeFileSync(
      resolve("benchmarks/latest-mirewrought-benchmark.json"),
      `${JSON.stringify({ generatedAt: new Date().toISOString(), totalMatches: 4_000, rows }, null, 2)}\n`,
      "utf8",
    );

    expect(rows).toHaveLength(4);
    expect(rows.every((row) => row.matches === matchesPerConfiguration)).toBe(true);
    expect(rows.every((row) => row.invalidEconomies === 0 && row.invalidTokenFlows === 0)).toBe(true);
    expect(rows.every((row) => row.seatScoreDelta < 1.5)).toBe(true);
    expect(rows.every((row) => row.humanExplosions > 0.4 && row.humanExplosions < 2)).toBe(true);
    expect(rows.every((row) => row.aiExplosions > 0.4 && row.aiExplosions < 2)).toBe(true);
  }, 600_000);
});
