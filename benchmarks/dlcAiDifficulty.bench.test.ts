import { describe, expect, it } from "vitest";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { simulateMatches } from "../src/game/balanceSimulation";
import type { AIDifficulty } from "../src/game/aiStrategy";
import type { ContentPackId } from "../src/game/contentPacks";
import type { RecipeMode } from "../src/game/recipeBooks";

interface Configuration {
  id: string;
  packs: ContentPackId[];
  recipeSets: RecipeMode[];
  playerCounts: Array<2 | 4 | 5>;
}

const CONFIGURATIONS: Configuration[] = [
  {
    id: "mirewrought",
    packs: ["covenants_of_the_mire"],
    recipeSets: [5, 6],
    playerCounts: [2, 5],
  },
  {
    id: "veilglass",
    packs: ["distillers_of_the_veil"],
    recipeSets: [1, 4],
    playerCounts: [2, 4],
  },
  {
    id: "combined",
    packs: ["covenants_of_the_mire", "distillers_of_the_veil"],
    recipeSets: [5, 6],
    playerCounts: [2, 5],
  },
];

describe("DLC AI difficulty benchmark", () => {
  it("completes standalone and combined expansion matches at every difficulty", () => {
    const matchesPerConfiguration = 100;
    const rows = (["apprentice", "skilled", "master"] as AIDifficulty[]).flatMap((difficulty, difficultyIndex) =>
      CONFIGURATIONS.flatMap((configuration, configurationIndex) =>
        configuration.recipeSets.flatMap((recipeSet) => configuration.playerCounts.map((playerCount) => {
          const results = simulateMatches(
            matchesPerConfiguration,
            11_000_000 + difficultyIndex * 1_000_000 + configurationIndex * 100_000 + playerCount * 1_000 + Number(recipeSet) * 100,
            recipeSet,
            playerCount,
            difficulty,
            configuration.packs,
          );
          const aiIds = Object.keys(results[0].scores).filter((id) => id !== "human");
          const aiSeats = aiIds.length;
          const averageHumanScore = results.reduce((sum, result) => sum + result.scores.human, 0) / results.length;
          const averageAIScore = results.reduce((sum, result) => sum + aiIds.reduce(
            (seatSum, id) => seatSum + result.scores[id],
            0,
          ) / aiSeats, 0) / results.length;

          return {
            difficulty,
            configuration: configuration.id,
            recipeSet,
            playerCount,
            humanWinRate: Number((results.filter((result) => result.winnerIds.includes("human")).length / results.length).toFixed(3)),
            aiWinRate: Number((results.filter((result) => result.winnerIds.some((id) => id !== "human")).length / results.length).toFixed(3)),
            averageHumanScore: Number(averageHumanScore.toFixed(3)),
            averageAIScore: Number(averageAIScore.toFixed(3)),
            aiScoreMargin: Number((averageAIScore - averageHumanScore).toFixed(3)),
            invalid: results.filter((result) => !result.economyValid || !result.tokenFlowValid).length,
          };
        })),
      ),
    );

    const difficultySummary = (["apprentice", "skilled", "master"] as AIDifficulty[]).map((difficulty) => {
      const difficultyRows = rows.filter((row) => row.difficulty === difficulty);
      const average = (field: "humanWinRate" | "aiWinRate" | "averageHumanScore" | "averageAIScore" | "aiScoreMargin") =>
        difficultyRows.reduce((total, row) => total + row[field], 0) / difficultyRows.length;
      return {
        difficulty,
        humanWinRate: Number(average("humanWinRate").toFixed(3)),
        aiWinRate: Number(average("aiWinRate").toFixed(3)),
        averageHumanScore: Number(average("averageHumanScore").toFixed(2)),
        averageAIScore: Number(average("averageAIScore").toFixed(2)),
        aiScoreMargin: Number(average("aiScoreMargin").toFixed(2)),
      };
    });

    writeFileSync(
      resolve("benchmarks/latest-dlc-ai-difficulty.json"),
      `${JSON.stringify({
        generatedAt: new Date().toISOString(),
        totalMatches: rows.length * matchesPerConfiguration,
        matchesPerConfiguration,
        difficultySummary,
        rows,
      }, null, 2)}\n`,
      "utf8",
    );

    expect(rows).toHaveLength(36);
    expect(rows.every((row) => row.invalid === 0)).toBe(true);
    const apprentice = difficultySummary.find((entry) => entry.difficulty === "apprentice")!;
    const skilled = difficultySummary.find((entry) => entry.difficulty === "skilled")!;
    const master = difficultySummary.find((entry) => entry.difficulty === "master")!;
    expect(apprentice.aiScoreMargin).toBeLessThan(skilled.aiScoreMargin);
    expect(skilled.aiScoreMargin).toBeLessThan(master.aiScoreMargin);
    expect(apprentice.humanWinRate).toBeGreaterThan(skilled.humanWinRate);
    expect(skilled.humanWinRate).toBeGreaterThan(master.humanWinRate);
    expect(Math.abs(skilled.aiScoreMargin)).toBeLessThanOrEqual(3);
  }, 600_000);
});
