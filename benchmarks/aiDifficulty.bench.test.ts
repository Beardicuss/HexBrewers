import { describe, expect, it } from "vitest";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { benchmarkDifficulties } from "../src/game/balanceSimulation";

describe("AI difficulty population benchmark", () => {
  it("runs 3,600 seeded matches across every supported configuration", () => {
    const rows = benchmarkDifficulties(100, 1_500_000);
    const report = rows.map((row) => ({
      difficulty: row.difficulty,
      set: row.recipeSet,
      players: row.playerCount,
      matches: row.matches,
      humanWinPct: Number((row.humanWinRate * 100).toFixed(1)),
      aiWinPct: Number((row.aiWinRate * 100).toFixed(1)),
      tiePct: Number((row.tieRate * 100).toFixed(1)),
      humanScore: Number(row.averageHumanScore.toFixed(2)),
      aiScore: Number(row.averageAIScore.toFixed(2)),
      humanExplosions: Number(row.averageHumanExplosions.toFixed(2)),
      aiExplosions: Number(row.averageAIExplosions.toFixed(2)),
      humanPurchases: Number(row.averageHumanPurchases.toFixed(2)),
      aiPurchases: Number(row.averageAIPurchases.toFixed(2)),
      aiDraws: Number(row.averageAIDraws.toFixed(2)),
      aiBagQuality: Number(row.averageAIBagQuality.toFixed(3)),
      aiComebackPct: Number((row.aiComebackRate * 100).toFixed(1)),
    }));

    console.table(report);
    writeFileSync(
      resolve("benchmarks/latest-ai-benchmark.json"),
      `${JSON.stringify({ generatedAt: new Date().toISOString(), totalMatches: 3600, rows: report }, null, 2)}\n`,
      "utf8",
    );
    expect(rows).toHaveLength(36);
    expect(rows.every((row) => row.matches === 100)).toBe(true);
    expect(rows.every((row) => row.humanWinRate >= 0 && row.humanWinRate <= 1)).toBe(true);
    expect(rows.every((row) => row.aiWinRate >= 0 && row.aiWinRate <= 1)).toBe(true);
  }, 600_000);
});
