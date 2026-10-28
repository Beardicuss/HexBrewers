import { describe, expect, it } from "vitest";
import { addMatchRecord, CHALLENGES, createChallenge, createDailyChallenge, createWeeklyChallenge, EMPTY_CHRONICLE, isoWeekKey, localDateKey, recordCompletedMatchProgression, utcDateKey, type MatchRecord } from "./replayability";

function record(overrides: Partial<MatchRecord> = {}): MatchRecord {
  return {
    id: "match-1", completedAt: "2026-10-23T12:00:00.000Z", mode: "standard",
    won: true, tied: false, prestige: 18, winningPrestige: 18, placement: 1,
    players: 2, difficulty: "skilled", recipe: "Set 1", packs: ["base"], scoreMargin: 4, ...overrides,
  };
}

describe("replayability", () => {
  it("generates an identical daily ritual for the same UTC date", () => {
    const first = createDailyChallenge(new Date("2026-10-23T00:01:00.000Z"));
    const second = createDailyChallenge(new Date("2026-10-23T23:59:00.000Z"));
    expect(first).toEqual(second);
    expect(first.session.dateKey).toBe("2026-10-23");
  });

  it("uses one universal UTC daily boundary across device offsets", () => {
    const westernDevice = createDailyChallenge(new Date("2026-10-28T23:30:00-07:00"));
    const utcDevice = createDailyChallenge(new Date("2026-10-29T06:30:00Z"));
    expect(westernDevice).toEqual(utcDevice);
    expect(westernDevice.session.dateKey).toBe("2026-10-29");
    expect(utcDateKey(new Date("2026-10-28T23:59:59.999Z"))).toBe("2026-10-28");
    expect(utcDateKey(new Date("2026-10-29T00:00:00.000Z"))).toBe("2026-10-29");
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

  it("keeps the legacy date-key export aligned with UTC", () => {
    const instant = new Date("2026-01-02T12:00:00.000Z");
    expect(localDateKey(instant)).toBe("2026-01-02");
    expect(localDateKey(instant)).toBe(utcDateKey(instant));
  });

  it("builds deterministic Initiation trials from ordinary base-game configuration", () => {
    const trial = createChallenge("three_coins_ahead");
    const repeated = createChallenge("three_coins_ahead");
    expect(trial.setup.totalPlayers).toBe(3);
    expect(trial.setup.enabledPacks).toEqual(["base"]);
    expect(trial.session.mode).toBe("challenge");
    expect(trial.session.seed).toBe(repeated.session.seed);
  });

  it("distinguishes trial completion from mastery", () => {
    const trial = createChallenge("read_the_ashes");
    const definitionRecord = record({
      mode: "challenge", challengeId: "read_the_ashes", won: true,
      prestige: 16, scoreMargin: 2,
    });
    const masteredRecord = record({
      id: "mastered", mode: "challenge", challengeId: "read_the_ashes", won: true,
      prestige: 19, scoreMargin: 4, trialSucceeded: true, trialMastered: true,
    });
    expect(trial.session.challengeId).toBe("read_the_ashes");
    const progressed = addMatchRecord(EMPTY_CHRONICLE, masteredRecord);
    expect(progressed.challengeVictories.read_the_ashes).toBe(1);
    expect(progressed.challengeMasteries.read_the_ashes).toBe(1);
    expect(definitionRecord.trialMastered).toBeUndefined();
  });

  it("defines three deterministic Craft trials with distinct recipes and build lessons", () => {
    const craft = CHALLENGES.filter((challenge) => challenge.tier === "craft");
    expect(craft).toHaveLength(3);
    expect(craft.map((challenge) => challenge.recipeMode)).toEqual([1, 3, 4]);
    expect(new Set(craft.map((challenge) => challenge.lesson)).size).toBe(3);
    for (const definition of craft) {
      const first = createChallenge(definition.id);
      const second = createChallenge(definition.id);
      expect(first.session.seed).toBe(second.session.seed);
      expect(first.setup.enabledPacks).toEqual(["base"]);
    }
  });

  it("requires the taught build identity to seal each Craft trial", () => {
    const control = CHALLENGES.find((challenge) => challenge.id === "the_gentle_chain")!;
    const resonance = CHALLENGES.find((challenge) => challenge.id === "the_crimson_answer")!;
    const lateBloom = CHALLENGES.find((challenge) => challenge.id === "roots_beyond_nine")!;

    expect(control.evaluate(record({ buildPrimary: "control", prestige: 20, scoreMargin: 3 }))).toEqual({ succeeded: true, mastered: true });
    expect(control.evaluate(record({ buildPrimary: "aggression", prestige: 25, scoreMargin: 8 }))).toEqual({ succeeded: false, mastered: false });
    expect(resonance.evaluate(record({ buildPrimary: "resonance", prestige: 21 }))).toEqual({ succeeded: true, mastered: false });
    expect(lateBloom.evaluate(record({ buildPrimary: "lateBloom", prestige: 24, scoreMargin: 4 }))).toEqual({ succeeded: true, mastered: true });
  });

  it("keeps Initiation and Craft tier honors independent", () => {
    let chronicle = EMPTY_CHRONICLE;
    for (const challenge of CHALLENGES.filter((entry) => entry.tier === "initiation")) {
      chronicle = addMatchRecord(chronicle, record({
        id: `win-${challenge.id}`, mode: "challenge", challengeId: challenge.id,
        trialSucceeded: true,
      }));
    }
    expect(chronicle.unlockedAchievementIds).toContain("trial_trinity");
    expect(chronicle.unlockedAchievementIds).not.toContain("craft_trinity");
  });

  it("defines three deterministic Peril trials with distinct pressure lessons", () => {
    const peril = CHALLENGES.filter((challenge) => challenge.tier === "peril");
    expect(peril).toHaveLength(3);
    expect(peril.map((challenge) => challenge.players)).toEqual([2, 3, 4]);
    expect(peril.every((challenge) => challenge.difficulty === "master")).toBe(true);
    expect(new Set(peril.map((challenge) => challenge.lesson)).size).toBe(3);
    for (const definition of peril) {
      expect(createChallenge(definition.id).session.seed).toBe(createChallenge(definition.id).session.seed);
    }
  });

  it("proves Peril recovery and volatile-bag objectives from recorded evidence", () => {
    const recovery = CHALLENGES.find((challenge) => challenge.id === "the_vial_remembers")!;
    const volatile = CHALLENGES.find((challenge) => challenge.id === "a_bag_with_teeth")!;

    expect(recovery.evaluate(record({ shatters: 1, flaskUses: 2, prestige: 20 }))).toEqual({ succeeded: true, mastered: true });
    expect(recovery.evaluate(record({ shatters: 0, flaskUses: 3, prestige: 25 }))).toEqual({ succeeded: false, mastered: false });
    expect(volatile.evaluate(record({ finalBagSize: 15, finalVoidshardCount: 7, finalVoidshardShare: 7 / 15, shatters: 1, scoreMargin: 3 }))).toEqual({ succeeded: true, mastered: true });
    expect(volatile.evaluate(record({ finalBagSize: 15, finalVoidshardCount: 8, finalVoidshardShare: 8 / 15, shatters: 0, scoreMargin: 8 }))).toEqual({ succeeded: false, mastered: false });
  });

  it("requires an adaptive build under four-player pressure", () => {
    const omenTrial = CHALLENGES.find((challenge) => challenge.id === "under_nine_eyes")!;
    expect(omenTrial.players).toBe(4);
    expect(omenTrial.evaluate(record({ buildPrimary: "adaptation", prestige: 23, scoreMargin: 4 }))).toEqual({ succeeded: true, mastered: true });
    expect(omenTrial.evaluate(record({ buildPrimary: "control", prestige: 30, scoreMargin: 10 }))).toEqual({ succeeded: false, mastered: false });
  });

  it("defines three deterministic Mastery trials with expert strategic demands", () => {
    const mastery = CHALLENGES.filter((challenge) => challenge.tier === "mastery");
    expect(mastery).toHaveLength(3);
    expect(mastery.map((challenge) => challenge.players)).toEqual([3, 4, 2]);
    expect(mastery.every((challenge) => challenge.difficulty === "master")).toBe(true);
    expect(new Set(mastery.map((challenge) => challenge.lesson)).size).toBe(3);
    for (const definition of mastery) {
      expect(createChallenge(definition.id).session.seed).toBe(createChallenge(definition.id).session.seed);
      expect(createChallenge(definition.id).setup.enabledPacks).toEqual(["base"]);
    }
  });

  it("proves multi-round planning and adaptive purchases from recorded market evidence", () => {
    const planning = CHALLENGES.find((challenge) => challenge.id === "the_long_conjunction")!;
    const adaptation = CHALLENGES.find((challenge) => challenge.id === "the_changing_hand")!;
    expect(planning.evaluate(record({ marketPurchases: 7, marketPurchaseRounds: 5, prestige: 25 }))).toEqual({ succeeded: true, mastered: true });
    expect(planning.evaluate(record({ marketPurchases: 7, marketPurchaseRounds: 3, prestige: 30 }))).toEqual({ succeeded: false, mastered: false });
    expect(adaptation.evaluate(record({ marketPurchaseColors: 5, scoreMargin: 3 }))).toEqual({ succeeded: true, mastered: true });
    expect(adaptation.evaluate(record({ marketPurchaseColors: 3, scoreMargin: 8 }))).toEqual({ succeeded: false, mastered: false });
  });

  it("requires repeated safe high-pressure rounds for the final Mastery seal", () => {
    const risk = CHALLENGES.find((challenge) => challenge.id === "at_the_seventh_breath")!;
    expect(risk.evaluate(record({ highPressureSurvivals: 4, shatters: 0, prestige: 25 }))).toEqual({ succeeded: true, mastered: true });
    expect(risk.evaluate(record({ highPressureSurvivals: 3, shatters: 1, prestige: 20 }))).toEqual({ succeeded: true, mastered: false });
    expect(risk.evaluate(record({ highPressureSurvivals: 2, shatters: 0, prestige: 30 }))).toEqual({ succeeded: false, mastered: false });
  });

  it("keeps the Mastery honor locked until all three final seals are conquered", () => {
    let chronicle = EMPTY_CHRONICLE;
    const mastery = CHALLENGES.filter((challenge) => challenge.tier === "mastery");
    for (const challenge of mastery.slice(0, 2)) {
      chronicle = addMatchRecord(chronicle, record({
        id: `win-${challenge.id}`, mode: "challenge", challengeId: challenge.id, trialSucceeded: true,
      }));
    }
    expect(chronicle.unlockedAchievementIds).not.toContain("mastery_trinity");
    chronicle = addMatchRecord(chronicle, record({
      id: `win-${mastery[2].id}`, mode: "challenge", challengeId: mastery[2].id, trialSucceeded: true,
    }));
    expect(chronicle.unlockedAchievementIds).toContain("mastery_trinity");
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
    const first = createWeeklyChallenge(new Date("2026-10-20T00:00:00.000Z"));
    const second = createWeeklyChallenge(new Date("2026-10-25T23:59:59.999Z"));
    expect(first).toEqual(second);
    expect(first.session.weekKey).toBe("2026-W43");
    expect(first.setup.enabledPacks).toEqual(["base"]);
    expect(first.description).toContain("deterministic starting seed");
    expect(first.description).not.toContain("draw sequence");
  });

  it("uses the same UTC ISO week across device offsets", () => {
    const easternDevice = createWeeklyChallenge(new Date("2026-10-26T03:30:00+04:00"));
    const westernDevice = createWeeklyChallenge(new Date("2026-10-25T16:30:00-07:00"));
    expect(easternDevice).toEqual(westernDevice);
    expect(easternDevice.session.weekKey).toBe("2026-W43");
    expect(isoWeekKey(new Date("2026-10-26T00:00:00.000Z"))).toBe("2026-W44");
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
