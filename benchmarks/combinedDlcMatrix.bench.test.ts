import { describe, expect, it } from "vitest";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { simulateMatches } from "../src/game/balanceSimulation";
import { DEFAULT_COVENANTS } from "../src/game/covenants";
import { AFFLICTION_ORDER } from "../src/game/distillation";

describe("combined DLC interaction matrix", () => {
  it("runs every Affliction through Mirewrought sets, Covenants, overflow, and the fifth seat", () => {
    const matchesPerConfiguration = 100;
    const rows = ([2, 5] as const).flatMap((playerCount) =>
      ([5, 6] as const).flatMap((recipeSet) =>
        AFFLICTION_ORDER.map((contractId) => {
          const results = simulateMatches(
            matchesPerConfiguration,
            9_000_000 + playerCount * 100_000,
            recipeSet,
            playerCount,
            "skilled",
            ["covenants_of_the_mire", "distillers_of_the_veil"],
            DEFAULT_COVENANTS,
            contractId,
          );
          const playerIds = Object.keys(results[0].scores);
          const seatCount = playerIds.length;
          const averagePlayerField = (field: "scores" | "explosions" | "purchases") => results.reduce(
            (matchTotal, result) => matchTotal + playerIds.reduce(
              (seatTotal, id) => seatTotal + result[field][id],
              0,
            ) / seatCount,
            0,
          ) / results.length;
          const averageDistillationField = (field: "progress" | "prestige" | "dropletSteps" | "headStart") => results.reduce(
            (matchTotal, result) => matchTotal + playerIds.reduce(
              (seatTotal, id) => seatTotal + result.distillation[id][field],
              0,
            ) / seatCount,
            0,
          ) / results.length;

          return {
            playerCount,
            recipeSet,
            contractId,
            score: Number(averagePlayerField("scores").toFixed(3)),
            explosions: Number(averagePlayerField("explosions").toFixed(3)),
            purchases: Number(averagePlayerField("purchases").toFixed(3)),
            progress: Number(averageDistillationField("progress").toFixed(3)),
            prestige: Number(averageDistillationField("prestige").toFixed(3)),
            dropletSteps: Number(averageDistillationField("dropletSteps").toFixed(3)),
            headStart: Number(averageDistillationField("headStart").toFixed(3)),
            invalid: results.filter((result) => !result.economyValid || !result.tokenFlowValid).length,
          };
        }),
      ),
    );

    const summary = ([2, 5] as const).flatMap((playerCount) => ([5, 6] as const).map((recipeSet) => {
      const group = rows.filter((row) => row.playerCount === playerCount && row.recipeSet === recipeSet);
      const scores = group.map((row) => row.score);
      return {
        playerCount,
        recipeSet,
        averageScore: Number((scores.reduce((total, score) => total + score, 0) / scores.length).toFixed(2)),
        contractSpread: Number((Math.max(...scores) - Math.min(...scores)).toFixed(2)),
        highestContract: [...group].sort((a, b) => b.score - a.score)[0].contractId,
        lowestContract: [...group].sort((a, b) => a.score - b.score)[0].contractId,
      };
    }));

    writeFileSync(
      resolve("benchmarks/latest-combined-dlc-matrix.json"),
      `${JSON.stringify({
        generatedAt: new Date().toISOString(),
        totalMatches: rows.length * matchesPerConfiguration,
        matchesPerConfiguration,
        covenants: DEFAULT_COVENANTS,
        summary,
        rows,
      }, null, 2)}\n`,
      "utf8",
    );

    expect(rows).toHaveLength(32);
    expect(rows.every((row) => row.invalid === 0)).toBe(true);
    expect(rows.every((row) => row.progress > 0 && row.prestige > 0)).toBe(true);
    expect(summary.every((group) => group.contractSpread <= 3)).toBe(true);
    for (const playerCount of [2, 5] as const) {
      const set5 = summary.find((group) => group.playerCount === playerCount && group.recipeSet === 5)!;
      const set6 = summary.find((group) => group.playerCount === playerCount && group.recipeSet === 6)!;
      expect(Math.abs(set5.averageScore - set6.averageScore)).toBeLessThanOrEqual(3);
    }
  }, 600_000);
});
