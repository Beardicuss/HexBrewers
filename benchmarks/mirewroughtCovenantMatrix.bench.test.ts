import { describe, expect, it } from "vitest";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { simulateMatches } from "../src/game/balanceSimulation";
import type { CovenantId, CovenantSelection } from "../src/game/covenants";
import { RECIPE_COLORS } from "../src/game/recipeBooks";

const COVENANTS = {
  bone: ["ossuary_mercy", "marrow_exchange", "graveward", "pale_reckoning"],
  moon: ["moonstep", "silver_ward", "lunar_tithe", "eclipse_stride"],
  blood: ["crimson_credit", "sanguine_bargain", "red_harvest", "heartprice"],
} satisfies Record<keyof CovenantSelection, CovenantId[]>;

describe("Mirewrought Covenant matrix benchmark", () => {
  it("isolates both recipe sets across all 64 Covenant combinations", () => {
    const matchesPerSet = 200;
    const selections: CovenantSelection[] = COVENANTS.bone.flatMap((bone) =>
      COVENANTS.moon.flatMap((moon) => COVENANTS.blood.map((blood) => ({ bone, moon, blood }))),
    );
    const rows = ([2, 5] as const).flatMap((playerCount) => selections.map((selection, selectionIndex) => {
      const bySet = ([5, 6] as const).map((recipeSet) => {
        const results = simulateMatches(
          matchesPerSet,
          3_000_000 + playerCount * 100_000 + selectionIndex * 1_000,
          recipeSet,
          playerCount,
          "skilled",
          ["covenants_of_the_mire"],
          selection,
        );
        const playerIds = Object.keys(results[0].scores);
        const seatCount = playerIds.length;
        const scoreSamples = results.map((result) => playerIds.reduce(
          (total, id) => total + result.scores[id],
          0,
        ) / seatCount);
        const average = (field: "scores" | "explosions" | "draws" | "purchases") => results.reduce(
          (matchTotal, result) => matchTotal + playerIds.reduce((total, id) => total + result[field][id], 0) / seatCount,
          0,
        ) / results.length;
        const effects = Object.fromEntries(RECIPE_COLORS.map((color) => [color, Object.fromEntries(
          (["draws", "activations", "movement", "score", "rubies", "dropletSteps"] as const).map((field) => [
            field,
            Number((results.reduce(
              (matchTotal, result) => matchTotal + playerIds.reduce(
                (total, id) => total + result.recipeEffects[id][color][field],
                0,
              ) / seatCount,
              0,
            ) / results.length).toFixed(3)),
          ]),
        )]));
        return {
          recipeSet,
          score: average("scores"),
          explosions: average("explosions"),
          draws: average("draws"),
          purchases: average("purchases"),
          invalid: results.filter((result) => !result.economyValid || !result.tokenFlowValid).length,
          effects,
          scoreSamples,
        };
      });

      const scoreDifferences = bySet[0].scoreSamples.map((score, index) => score - bySet[1].scoreSamples[index]);
      const meanDifference = scoreDifferences.reduce((total, value) => total + value, 0) / scoreDifferences.length;
      const differenceVariance = scoreDifferences.reduce(
        (total, value) => total + (value - meanDifference) ** 2,
        0,
      ) / Math.max(1, scoreDifferences.length - 1);
      const scoreDeltaStandardError = Math.sqrt(differenceVariance / scoreDifferences.length);

      return {
        playerCount,
        selection,
        set5: { recipeSet: bySet[0].recipeSet, score: Number(bySet[0].score.toFixed(3)), explosions: Number(bySet[0].explosions.toFixed(3)), draws: Number(bySet[0].draws.toFixed(3)), purchases: Number(bySet[0].purchases.toFixed(3)), invalid: bySet[0].invalid, effects: bySet[0].effects },
        set6: { recipeSet: bySet[1].recipeSet, score: Number(bySet[1].score.toFixed(3)), explosions: Number(bySet[1].explosions.toFixed(3)), draws: Number(bySet[1].draws.toFixed(3)), purchases: Number(bySet[1].purchases.toFixed(3)), invalid: bySet[1].invalid, effects: bySet[1].effects },
        scoreDelta: Number(meanDifference.toFixed(3)),
        scoreDeltaStandardError: Number(scoreDeltaStandardError.toFixed(3)),
        scoreDelta95: Number((scoreDeltaStandardError * 1.96).toFixed(3)),
      };
    }));

    const summary = ([2, 5] as const).map((playerCount) => {
      const tableRows = rows.filter((row) => row.playerCount === playerCount);
      const average = (set: "set5" | "set6", field: "score" | "explosions" | "draws" | "purchases") =>
        tableRows.reduce((total, row) => total + Number(row[set][field]), 0) / tableRows.length;
      const largestGap = [...tableRows].sort((a, b) => Math.abs(b.scoreDelta) - Math.abs(a.scoreDelta))[0];
      return {
        playerCount,
        set5Score: Number(average("set5", "score").toFixed(2)),
        set6Score: Number(average("set6", "score").toFixed(2)),
        set5Explosions: Number(average("set5", "explosions").toFixed(2)),
        set6Explosions: Number(average("set6", "explosions").toFixed(2)),
        averageScoreDelta: Number((tableRows.reduce((total, row) => total + row.scoreDelta, 0) / tableRows.length).toFixed(2)),
        largestAbsoluteGap: Math.abs(largestGap.scoreDelta),
        largestGapSelection: largestGap.selection,
        averageEffects: Object.fromEntries(RECIPE_COLORS.map((color) => [color, {
          set5: Object.fromEntries((["draws", "activations", "movement", "score", "rubies", "dropletSteps"] as const).map((field) => [
            field,
            Number((tableRows.reduce((total, row) => total + Number(row.set5.effects[color][field]), 0) / tableRows.length).toFixed(3)),
          ])),
          set6: Object.fromEntries((["draws", "activations", "movement", "score", "rubies", "dropletSteps"] as const).map((field) => [
            field,
            Number((tableRows.reduce((total, row) => total + Number(row.set6.effects[color][field]), 0) / tableRows.length).toFixed(3)),
          ])),
        }])),
      };
    });

    console.table(summary);
    writeFileSync(
      resolve("benchmarks/latest-mirewrought-covenant-matrix.json"),
      `${JSON.stringify({
        generatedAt: new Date().toISOString(),
        totalMatches: rows.length * matchesPerSet * 2,
        matchesPerSet,
        summary,
        rows,
      }, null, 2)}\n`,
      "utf8",
    );

    expect(selections).toHaveLength(64);
    expect(rows).toHaveLength(128);
    expect(rows.every((row) => Number(row.set5.invalid) === 0 && Number(row.set6.invalid) === 0)).toBe(true);
    expect(summary.every((table) => Math.abs(table.averageScoreDelta) <= 1)).toBe(true);
    expect(summary.every((table) => table.largestAbsoluteGap <= 3)).toBe(true);
  }, 600_000);
});
