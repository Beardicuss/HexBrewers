import { describe, expect, it } from "vitest";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { simulateMatches } from "../src/game/balanceSimulation";
import { AFFLICTION_ORDER } from "../src/game/distillation";

describe("Veilglass Affliction Contract matrix benchmark", () => {
  it("isolates every Contract across base recipe sets and table sizes", () => {
    const matchesPerConfiguration = 100;
    const rows = ([2, 4] as const).flatMap((playerCount) =>
      ([1, 2, 3, 4] as const).flatMap((recipeSet) =>
        AFFLICTION_ORDER.map((contractId) => {
          const results = simulateMatches(
            matchesPerConfiguration,
            7_000_000 + playerCount * 100_000 + recipeSet * 10_000,
            recipeSet,
            playerCount,
            "skilled",
            ["distillers_of_the_veil"],
            undefined,
            contractId,
          );
          const playerIds = Object.keys(results[0].scores);
          const seatCount = playerIds.length;
          const averagePlayerField = (field: "scores" | "explosions") => results.reduce(
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
            progress: Number(averageDistillationField("progress").toFixed(3)),
            prestige: Number(averageDistillationField("prestige").toFixed(3)),
            dropletSteps: Number(averageDistillationField("dropletSteps").toFixed(3)),
            headStart: Number(averageDistillationField("headStart").toFixed(3)),
            invalid: results.filter((result) => !result.economyValid || !result.tokenFlowValid).length,
          };
        }),
      ),
    );

    const contractSummary = AFFLICTION_ORDER.map((contractId) => {
      const contractRows = rows.filter((row) => row.contractId === contractId);
      const average = (field: "score" | "explosions" | "progress" | "prestige" | "dropletSteps" | "headStart") =>
        contractRows.reduce((total, row) => total + row[field], 0) / contractRows.length;
      return {
        contractId,
        score: Number(average("score").toFixed(2)),
        explosions: Number(average("explosions").toFixed(2)),
        progress: Number(average("progress").toFixed(2)),
        prestige: Number(average("prestige").toFixed(2)),
        dropletSteps: Number(average("dropletSteps").toFixed(2)),
        headStart: Number(average("headStart").toFixed(2)),
      };
    });

    writeFileSync(
      resolve("benchmarks/latest-veilglass-affliction-matrix.json"),
      `${JSON.stringify({
        generatedAt: new Date().toISOString(),
        totalMatches: rows.length * matchesPerConfiguration,
        matchesPerConfiguration,
        contractSummary,
        rows,
      }, null, 2)}\n`,
      "utf8",
    );

    expect(rows).toHaveLength(64);
    expect(rows.every((row) => row.invalid === 0)).toBe(true);
    expect(rows.every((row) => row.progress > 0 && row.prestige > 0)).toBe(true);
    const contractScores = contractSummary.map((contract) => contract.score);
    expect(Math.max(...contractScores) - Math.min(...contractScores)).toBeLessThanOrEqual(2);
  }, 600_000);
});
