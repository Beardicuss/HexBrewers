import { describe, expect, it } from "vitest";
import { addMatchRecord, createChallenge, createDailyChallenge, createWeeklyChallenge, EMPTY_CHRONICLE, isoWeekKey, localDateKey, recordCompletedMatchProgression, type MatchRecord } from "./replayability";

function record(overrides: Partial<MatchRecord> = {}): MatchRecord {
  return {
    id: "match-1", completedAt: "2026-10-23T12:00:00.000Z", mode: "standard",
    won: true, tied: false, prestige: 18, winningPrestige: 18, placement: 1,
    players: 2, difficulty: "skilled", recipe: "Set 1", packs: ["base"], scoreMargin: 4, ...overrides,
  };
}

describe("replayability", () => {
  it("generates an identical daily ritual for the same local date", () => {
    const first = createDailyChallenge(new Date(2026, 9, 23, 8));
    const second = createDailyChallenge(new Date(2026, 9, 23, 22));
    expect(first).toEqual(second);
    expect(first.session.dateKey).toBe("2026-10-23");
  });

  it("records aggregate results and ignores duplicate records", () => {
    const once = addMatchRecord(EMPTY_CHRONICLE, record());
    const twice = addMatchRecord(once, record());
    expect(once.matchesPlayed).toBe(1);
    expect(once.victories).toBe(1);
    expect(once.bestPrestige).toBe(18);
    expect(twice).toEqual(once);
  });

  it("advances a daily participation streak on consecutive dates", () => {
    const first = addMatchRecord(EMPTY_CHRONICLE, record({ id: "d1", mode: "daily", challengeDate: "2026-10-22" }));
    const second = addMatchRecord(first, record({ id: "d2", mode: "daily", challengeDate: "2026-10-23" }));
    expect(second.currentDailyStreak).toBe(2);
    expect(second.bestDailyStreak).toBe(2);
    expect(second.dailyChallengesCompleted).toBe(2);
  });

  it("formats a stable local calendar key", () => {
    expect(localDateKey(new Date(2026, 0, 2, 12))).toBe("2026-01-02");
  });

  it("builds named trials from ordinary base-game configuration", () => {
    const trial = createChallenge("council_four");
    expect(trial.setup.totalPlayers).toBe(4);
    expect(trial.setup.enabledPacks).toEqual(["base"]);
    expect(trial.session.mode).toBe("challenge");
  });

  it("unlocks cosmetic honors without adding gameplay state", () => {
    const next = addMatchRecord(EMPTY_CHRONICLE, record({ prestige: 25 }));
    expect(next.unlockedAchievementIds).toEqual(expect.arrayContaining(["first_ritual", "prestige_25"]));
    expect(next).not.toHaveProperty("bonuses");
  });

  it("returns newly unlocked honors for the end-of-match reveal", () => {
    const result = recordCompletedMatchProgression(record());
    expect(result.newlyUnlockedAchievementIds).toContain("first_ritual");
    expect(result.chronicle.matchesPlayed).toBe(1);
    expect(result.previousBestPrestige).toBe(0);
  });

  it("rotates one deterministic base-game Trial per ISO week", () => {
    const first = createWeeklyChallenge(new Date(2026, 9, 20));
    const second = createWeeklyChallenge(new Date(2026, 9, 25));
    expect(first).toEqual(second);
    expect(first.session.weekKey).toBe("2026-W43");
    expect(first.setup.enabledPacks).toEqual(["base"]);
  });

  it("tracks weekly participation once per seal and advances consecutive streaks", () => {
    const first = addMatchRecord(EMPTY_CHRONICLE, record({ id: "w1", mode: "weekly", weeklyKey: "2026-W42" }));
    const duplicateWeek = addMatchRecord(first, record({ id: "w1b", mode: "weekly", weeklyKey: "2026-W42" }));
    const second = addMatchRecord(duplicateWeek, record({ id: "w2", mode: "weekly", weeklyKey: "2026-W43" }));
    expect(isoWeekKey(new Date(2026, 9, 23))).toBe("2026-W43");
    expect(second.weeklyChallengesCompleted).toBe(2);
    expect(second.currentWeeklyStreak).toBe(2);
  });
});
