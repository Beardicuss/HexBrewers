import type { AIDifficulty } from "./aiStrategy";
import type { GameSetup } from "./contentPacks";
import { createGameSetup } from "./contentPacks";
import type { Player } from "./playerTypes";
import type { RecipeBooks } from "./recipeBooks";
import { analyzeBuildIdentity, type BuildRole } from "./buildIdentity";

export type RitualMode = "standard" | "ashenveil" | "daily" | "weekly" | "challenge";
export type ChallengeId =
  | "read_the_ashes"
  | "the_willing_stop"
  | "three_coins_ahead"
  | "the_gentle_chain"
  | "the_crimson_answer"
  | "roots_beyond_nine"
  | "the_vial_remembers"
  | "a_bag_with_teeth"
  | "under_nine_eyes"
  | "the_long_conjunction"
  | "the_changing_hand"
  | "at_the_seventh_breath";
export type TrialTier = "initiation" | "craft" | "peril" | "mastery";

export interface RitualSession {
  id: string;
  mode: RitualMode;
  label: string;
  seed?: number;
  dateKey?: string;
  weekKey?: string;
  challengeId?: ChallengeId;
}

export interface MatchRecord {
  id: string;
  completedAt: string;
  mode: RitualMode;
  challengeDate?: string;
  weeklyKey?: string;
  won: boolean;
  tied: boolean;
  prestige: number;
  winningPrestige: number;
  placement: number;
  players: number;
  difficulty: AIDifficulty;
  recipe: string;
  packs: string[];
  challengeId?: ChallengeId;
  trialSucceeded?: boolean;
  trialMastered?: boolean;
  scoreMargin: number;
  buildPrimary?: BuildRole;
  buildSecondary?: BuildRole;
  shatters?: number;
  flaskUses?: number;
  finalBagSize?: number;
  finalVoidshardCount?: number;
  finalVoidshardShare?: number;
  marketPurchases?: number;
  marketPurchaseRounds?: number;
  marketPurchaseColors?: number;
  highPressureSurvivals?: number;
}

export interface ChallengeDefinition {
  id: ChallengeId;
  title: string;
  epitaph: string;
  description: string;
  players: 2 | 3 | 4;
  difficulty: AIDifficulty;
  recipeMode: 1 | 2 | 3 | 4 | "random";
  tier: TrialTier;
  lesson: string;
  objective: string;
  mastery: string;
  seedKey: string;
  evaluate(record: MatchRecord): { succeeded: boolean; mastered: boolean };
}

export interface WeeklyChallenge {
  session: RitualSession;
  setup: GameSetup;
  difficulty: AIDifficulty;
  title: string;
  epitaph: string;
  description: string;
}

export interface AchievementDefinition { id: string; title: string; description: string; titleReward: string; }

export interface MatchProgression {
  chronicle: Chronicle;
  newlyUnlockedAchievementIds: string[];
  previousBestPrestige: number;
}

export const CHALLENGES: ChallengeDefinition[] = [
  {
    id: "read_the_ashes", tier: "initiation", title: "Read the Ashes", epitaph: "The bag is hidden. Its danger is not.",
    description: "A fixed duel that teaches bag inspection, remaining-risk calculation, and the difference between a possible draw and a dangerous one.",
    lesson: "Risk reading", objective: "Defeat the Shade with at least 14 Prestige.", mastery: "Win with at least 18 Prestige and a margin of 3 or more.",
    players: 2, difficulty: "apprentice", recipeMode: 1, seedKey: "initiation:risk-reading:v1",
    evaluate: (record) => ({ succeeded: record.won && record.prestige >= 14, mastered: record.won && record.prestige >= 18 && record.scoreMargin >= 3 }),
  },
  {
    id: "the_willing_stop", tier: "initiation", title: "The Willing Stop", epitaph: "Greed draws again. Judgment keeps what was earned.",
    description: "A controlled contest built around preserving secured rewards instead of treating every safe draw as permission to continue.",
    lesson: "Meaningful stopping", objective: "Win the ritual with a positive margin.", mastery: "Win by 5 or more Prestige.",
    players: 2, difficulty: "skilled", recipeMode: 3, seedKey: "initiation:meaningful-stopping:v1",
    evaluate: (record) => ({ succeeded: record.won && record.scoreMargin > 0, mastered: record.won && record.scoreMargin >= 5 }),
  },
  {
    id: "three_coins_ahead", tier: "initiation", title: "Three Coins Ahead", epitaph: "The purchase is made now. Its victory arrives later.",
    description: "A fixed three-brewer market lesson: read recipe synergies, dilute pressure deliberately, and buy for later rounds rather than the current score.",
    lesson: "Basic market planning", objective: "Place first with at least 19 Prestige.", mastery: "Win with at least 23 Prestige.",
    players: 3, difficulty: "skilled", recipeMode: 2, seedKey: "initiation:market-planning:v1",
    evaluate: (record) => ({ succeeded: record.won && record.prestige >= 19, mastered: record.won && record.prestige >= 23 }),
  },
  {
    id: "the_gentle_chain", tier: "craft", title: "The Gentle Chain", epitaph: "The frost does not spare the hand. It teaches the hand where to close.",
    description: "Recipe Set 1 rewards a deliberate Control build: Frostbile reveals choices, Plaguedust repairs dangerous draws, and restraint turns both into secured value.",
    lesson: "Frostbile–Plaguedust control", objective: "Win with Control as your dominant build identity.", mastery: "Win with a Control build, at least 20 Prestige, and a margin of 3 or more.",
    players: 2, difficulty: "skilled", recipeMode: 1, seedKey: "craft:control-chain:v1",
    evaluate: (record) => ({
      succeeded: record.won && record.buildPrimary === "control",
      mastered: record.won && record.buildPrimary === "control" && record.prestige >= 20 && record.scoreMargin >= 3,
    }),
  },
  {
    id: "the_crimson_answer", tier: "craft", title: "The Crimson Answer", epitaph: "One thorn called across the crucibles. The others answered in blood.",
    description: "Recipe Set 3 teaches Resonance: Bloodthorn converts a preceding Voidshard's pressure into movement, Plaguedust raises the safe limit, and Deathweave rewards finishing on exactly seven.",
    lesson: "Bloodthorn–Voidshard resonance", objective: "Place first with Resonance as your dominant build identity.", mastery: "Win with a Resonance build and at least 22 Prestige.",
    players: 3, difficulty: "skilled", recipeMode: 3, seedKey: "craft:crimson-resonance:v1",
    evaluate: (record) => ({
      succeeded: record.won && record.buildPrimary === "resonance",
      mastered: record.won && record.buildPrimary === "resonance" && record.prestige >= 22,
    }),
  },
  {
    id: "roots_beyond_nine", tier: "craft", title: "Roots Beyond Nine", epitaph: "What blooms after the bell was planted before the first draw.",
    description: "Recipe Set 4 teaches a Late Bloom engine: Deathweave and Wraithbloom ask you to invest across rounds, then convert the mature bag into a decisive finish.",
    lesson: "Deathweave–Wraithbloom late bloom", objective: "Win with Late Bloom as your dominant build identity.", mastery: "Win with a Late Bloom build, at least 24 Prestige, and a margin of 4 or more.",
    players: 4, difficulty: "master", recipeMode: 4, seedKey: "craft:roots-beyond-nine:v1",
    evaluate: (record) => ({
      succeeded: record.won && record.buildPrimary === "lateBloom",
      mastered: record.won && record.buildPrimary === "lateBloom" && record.prestige >= 24 && record.scoreMargin >= 4,
    }),
  },
  {
    id: "the_vial_remembers", tier: "peril", title: "The Vial Remembers", epitaph: "Glass forgets the hand that broke it. The blood beneath does not.",
    description: "A fixed duel in Recipe Set 2 where protected risk and the Cursed Vial must become recovery rather than panic. A flawless brew cannot seal this lesson.",
    lesson: "Recovery after shattering", objective: "Win after shattering at least once and using the Cursed Vial at least once.", mastery: "Win with exactly one shatter, use the Vial twice, and earn at least 20 Prestige.",
    players: 2, difficulty: "master", recipeMode: 2, seedKey: "peril:vial-remembers:v1",
    evaluate: (record) => ({
      succeeded: record.won && (record.shatters ?? 0) >= 1 && (record.flaskUses ?? 0) >= 1,
      mastered: record.won && record.shatters === 1 && (record.flaskUses ?? 0) >= 2 && record.prestige >= 20,
    }),
  },
  {
    id: "a_bag_with_teeth", tier: "peril", title: "A Bag With Teeth", epitaph: "It grew heavier each night, though nothing new had been placed inside.",
    description: "Recipe Set 4 and a crowded table reward ambitious purchases, but every added ingredient changes the danger ratio. Build breadth without surrendering control.",
    lesson: "Volatile-bag management", objective: "Win with at least 15 ingredients and Voidshards at no more than half of the final bag.", mastery: "Meet the bag objective, suffer no more than one shatter, and win by 3 or more Prestige.",
    players: 3, difficulty: "master", recipeMode: 4, seedKey: "peril:bag-with-teeth:v1",
    evaluate: (record) => {
      const managedBag = (record.finalBagSize ?? 0) >= 15 && (record.finalVoidshardShare ?? 1) <= 0.5;
      return {
        succeeded: record.won && managedBag,
        mastered: record.won && managedBag && (record.shatters ?? 0) <= 1 && record.scoreMargin >= 3,
      };
    },
  },
  {
    id: "under_nine_eyes", tier: "peril", title: "Under Nine Eyes", epitaph: "Every omen watched a different rival. None of them blinked for you.",
    description: "Four brewers face a fixed sequence of disruptive Omens. Recipe Set 2 favors flexible answers; the lesson is to adapt while Master rivals contest every reward.",
    lesson: "Omen adaptation under rival pressure", objective: "Defeat three Master rivals with Adaptation as your dominant build identity.", mastery: "Win with an Adaptation build, at least 23 Prestige, and a margin of 4 or more.",
    players: 4, difficulty: "master", recipeMode: 2, seedKey: "peril:nine-eyes:v1",
    evaluate: (record) => ({
      succeeded: record.won && record.buildPrimary === "adaptation",
      mastered: record.won && record.buildPrimary === "adaptation" && record.prestige >= 23 && record.scoreMargin >= 4,
    }),
  },
  {
    id: "the_long_conjunction", tier: "mastery", title: "The Long Conjunction", epitaph: "Nine bells apart, the same purchase finally revealed its purpose.",
    description: "A three-brewer Set 4 rite where victory must be assembled over time. Spend across the match, preserve the engine between rounds, and let no single market visit carry the plan.",
    lesson: "Multi-round investment", objective: "Win after making at least 5 purchases across 4 different rounds.", mastery: "Win after making at least 7 purchases across 5 rounds and earn 25 Prestige.",
    players: 3, difficulty: "master", recipeMode: 4, seedKey: "mastery:long-conjunction:v1",
    evaluate: (record) => ({
      succeeded: record.won && (record.marketPurchases ?? 0) >= 5 && (record.marketPurchaseRounds ?? 0) >= 4,
      mastered: record.won && (record.marketPurchases ?? 0) >= 7 && (record.marketPurchaseRounds ?? 0) >= 5 && record.prestige >= 25,
    }),
  },
  {
    id: "the_changing_hand", tier: "mastery", title: "The Changing Hand", epitaph: "The market offered no second copy of the future you had planned.",
    description: "A four-brewer rite with a seeded random recipe. Read the rules actually dealt, change priorities as rivals exhaust stock, and build breadth without losing a coherent answer.",
    lesson: "Adaptive purchasing", objective: "Defeat three Master rivals after purchasing at least 4 different ingredient colors.", mastery: "Win after purchasing 5 different colors with a margin of 3 or more.",
    players: 4, difficulty: "master", recipeMode: "random", seedKey: "mastery:changing-hand:v1",
    evaluate: (record) => ({
      succeeded: record.won && (record.marketPurchaseColors ?? 0) >= 4,
      mastered: record.won && (record.marketPurchaseColors ?? 0) >= 5 && record.scoreMargin >= 3,
    }),
  },
  {
    id: "at_the_seventh_breath", tier: "mastery", title: "At the Seventh Breath", epitaph: "The vessel learned the sound of breaking. You taught it silence instead.",
    description: "A final duel in Recipe Set 3. Repeatedly bring the crucible to dangerous pressure, decide when the secured reward is enough, and survive without confusing luck for mastery.",
    lesson: "Expert risk management", objective: "Win after safely ending at 6 or more pressure in at least 3 rounds, with no more than one shatter.", mastery: "Survive high pressure in 4 rounds, never shatter, and finish with at least 25 Prestige.",
    players: 2, difficulty: "master", recipeMode: 3, seedKey: "mastery:seventh-breath:v1",
    evaluate: (record) => ({
      succeeded: record.won && (record.highPressureSurvivals ?? 0) >= 3 && (record.shatters ?? 0) <= 1,
      mastered: record.won && (record.highPressureSurvivals ?? 0) >= 4 && (record.shatters ?? 0) === 0 && record.prestige >= 25,
    }),
  },
];

export const ACHIEVEMENTS: AchievementDefinition[] = [
  { id: "first_ritual", title: "First Seal", description: "Complete one ritual.", titleReward: "Initiate of Ashenveil" },
  { id: "three_victories", title: "Crucible Proven", description: "Win three rituals.", titleReward: "Crucible-Proven" },
  { id: "prestige_25", title: "A Name in Gold", description: "Earn at least 25 Prestige in one match.", titleReward: "The Gilded Brewer" },
  { id: "daily_three", title: "Omen Listener", description: "Answer three Daily Omens.", titleReward: "Listener Beyond the Bell" },
  { id: "trial_trinity", title: "The First Three Seals", description: "Conquer every Initiation Trial.", titleReward: "Initiate of the Crucible" },
  { id: "craft_trinity", title: "Three Arts Bound", description: "Conquer every Craft Trial.", titleReward: "Artificer of the Crucible" },
  { id: "peril_trinity", title: "The Unbroken Vessel", description: "Conquer every Peril Trial.", titleReward: "Survivor of Nine Eyes" },
  { id: "mastery_trinity", title: "The Twelfth Seal", description: "Conquer every Mastery Trial.", titleReward: "Master of the Ninth Omen" },
  { id: "weekly_three", title: "The Turning Seal", description: "Answer three different weekly Trials.", titleReward: "Marked by the Turning Week" },
];

export interface Chronicle {
  version: 4;
  matchesPlayed: number;
  victories: number;
  totalPrestige: number;
  bestPrestige: number;
  dailyChallengesCompleted: number;
  dailyVictories: number;
  currentDailyStreak: number;
  bestDailyStreak: number;
  lastDailyDate?: string;
  weeklyChallengesCompleted: number;
  weeklyVictories: number;
  currentWeeklyStreak: number;
  bestWeeklyStreak: number;
  lastWeeklyKey?: string;
  recentMatches: MatchRecord[];
  challengeCompletions: Partial<Record<ChallengeId, number>>;
  challengeVictories: Partial<Record<ChallengeId, number>>;
  challengeMasteries: Partial<Record<ChallengeId, number>>;
  unlockedAchievementIds: string[];
  selectedTitleId: string;
}

export const CHRONICLE_STORAGE_KEY = "hexbrewers-chronicle";

export const EMPTY_CHRONICLE: Chronicle = {
  version: 4,
  matchesPlayed: 0,
  victories: 0,
  totalPrestige: 0,
  bestPrestige: 0,
  dailyChallengesCompleted: 0,
  dailyVictories: 0,
  currentDailyStreak: 0,
  bestDailyStreak: 0,
  weeklyChallengesCompleted: 0,
  weeklyVictories: 0,
  currentWeeklyStreak: 0,
  bestWeeklyStreak: 0,
  recentMatches: [],
  challengeCompletions: {},
  challengeVictories: {},
  challengeMasteries: {},
  unlockedAchievementIds: [],
  selectedTitleId: "",
};

function hashText(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function utcDateKey(date = new Date()): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** @deprecated Use utcDateKey. Retained for save/test compatibility. */
export const localDateKey = utcDateKey;

export function createDailyChallenge(date = new Date()): { session: RitualSession; setup: GameSetup; difficulty: AIDifficulty } {
  const dateKey = utcDateKey(date);
  const seed = hashText(`ashenveil:${dateKey}`);
  const recipeMode = ((seed % 4) + 1) as 1 | 2 | 3 | 4;
  return {
    session: { id: `daily-${dateKey}`, mode: "daily", label: "The Daily Omen", seed, dateKey },
    setup: createGameSetup({ totalPlayers: 2, recipeMode, enabledPacks: ["base"] }),
    difficulty: "skilled",
  };
}

export function isoWeekKey(date = new Date()): string {
  const utc = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((utc.getTime() - yearStart.getTime()) / 86_400_000) + 1) / 7);
  return `${utc.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export function createWeeklyChallenge(date = new Date()): WeeklyChallenge {
  const weekKey = isoWeekKey(date);
  const seed = hashText(`ashenveil:weekly:${weekKey}`);
  const names = [
    ["The Bell Beneath the Mire", "It rings only for those already expected."],
    ["The Unblinking Crucible", "Something below the mixture counts every draw."],
    ["A Bargain Written in Soot", "The signature remains warm after seven nights."],
    ["The Procession of Empty Vials", "At midnight, the shelves rearrange themselves."],
  ] as const;
  const [title, epitaph] = names[seed % names.length];
  const players = ([2, 3, 4] as const)[(seed >>> 3) % 3];
  const difficulty: AIDifficulty = (seed >>> 6) % 3 === 0 ? "master" : "skilled";
  const recipeMode = (((seed >>> 9) % 4) + 1) as 1 | 2 | 3 | 4;
  return {
    session: { id: `weekly-${weekKey}`, mode: "weekly", label: title, seed, weekKey },
    setup: createGameSetup({ totalPlayers: players, recipeMode, enabledPacks: ["base"] }),
    difficulty,
    title,
    epitaph,
    description: `A shared Trial for ${weekKey}. Its rivals, recipe, and deterministic starting seed remain identical for every brewer until the seal turns.`,
  };
}

export function createStandardSession(): RitualSession {
  return { id: `standard-${Date.now()}`, mode: "standard", label: "Standard Ritual" };
}

export function createAshenveilSession(): RitualSession {
  return { id: `ashenveil-${Date.now()}`, mode: "ashenveil", label: "Ashenveil Ritual" };
}

export function createChallenge(id: ChallengeId): { session: RitualSession; setup: GameSetup; difficulty: AIDifficulty } {
  const definition = CHALLENGES.find((challenge) => challenge.id === id);
  if (!definition) throw new Error(`Unknown challenge: ${id}`);
  const seed = hashText(`ashenveil:trial:${definition.seedKey}`);
  return {
    session: { id: `challenge-${id}-${Date.now()}`, mode: "challenge", label: definition.title, seed, challengeId: id },
    setup: createGameSetup({ totalPlayers: definition.players, recipeMode: definition.recipeMode, enabledPacks: ["base"] }),
    difficulty: definition.difficulty,
  };
}

function dayDistance(previous: string, current: string): number {
  const from = Date.parse(`${previous}T00:00:00Z`);
  const to = Date.parse(`${current}T00:00:00Z`);
  return Number.isFinite(from) && Number.isFinite(to) ? Math.round((to - from) / 86_400_000) : 0;
}

function weekDistance(previous: string, current: string): number {
  const start = (key: string) => {
    const [yearText, weekText] = key.split("-W");
    const year = Number(yearText), week = Number(weekText);
    const januaryFourth = new Date(Date.UTC(year, 0, 4));
    const monday = new Date(januaryFourth);
    monday.setUTCDate(januaryFourth.getUTCDate() - ((januaryFourth.getUTCDay() || 7) - 1) + (week - 1) * 7);
    return monday.getTime();
  };
  const from = start(previous), to = start(current);
  return Number.isFinite(from) && Number.isFinite(to) ? Math.round((to - from) / (7 * 86_400_000)) : 0;
}

export function createMatchRecord(
  session: RitualSession,
  setup: GameSetup,
  difficulty: AIDifficulty,
  players: Player[],
  winnerIds: string[],
  completedAt = new Date(),
  recipeBooks?: RecipeBooks,
): MatchRecord {
  const human = players.find((player) => player.kind === "human");
  if (!human) throw new Error("A completed match must contain a human player.");
  const sortedScores = [...players].map((player) => player.score).sort((a, b) => b - a);
  const higherScores = new Set(sortedScores.filter((score) => score > human.score));
  const build = recipeBooks ? analyzeBuildIdentity(human, recipeBooks) : null;
  const finalInventory = [
    ...human.bag.tokens,
    ...human.crucible.placements.map((placement) => placement.token),
    ...(human.redReserve ?? []),
  ];
  const finalVoidshardCount = finalInventory.filter((token) => token.color === "white").length;
  const baseRecord: MatchRecord = {
    id: `${session.id}-${completedAt.getTime()}`,
    completedAt: completedAt.toISOString(),
    mode: session.mode,
    challengeDate: session.dateKey,
    weeklyKey: session.weekKey,
    won: winnerIds.includes(human.id),
    tied: winnerIds.length > 1 && winnerIds.includes(human.id),
    prestige: human.score,
    winningPrestige: sortedScores[0] ?? human.score,
    placement: higherScores.size + 1,
    players: setup.totalPlayers,
    difficulty,
    recipe: setup.recipeMode === "random" ? "Random" : `Set ${setup.recipeMode}`,
    packs: [...setup.enabledPacks],
    challengeId: session.challengeId,
    scoreMargin: human.score - (players.filter(player => player.kind === "ai").sort((a, b) => b.score - a.score)[0]?.score ?? 0),
    buildPrimary: build?.primary,
    buildSecondary: build?.secondary ?? undefined,
    shatters: human.shatterCount ?? 0,
    flaskUses: human.flaskUses ?? 0,
    finalBagSize: finalInventory.length,
    finalVoidshardCount,
    finalVoidshardShare: finalInventory.length > 0 ? finalVoidshardCount / finalInventory.length : 0,
    marketPurchases: human.marketPurchaseCount ?? 0,
    marketPurchaseRounds: new Set(human.marketPurchaseRounds ?? []).size,
    marketPurchaseColors: new Set(human.marketPurchasedColors ?? []).size,
    highPressureSurvivals: human.highPressureSurvivals ?? 0,
  };
  if (session.challengeId) {
    const definition = CHALLENGES.find((challenge) => challenge.id === session.challengeId);
    if (definition) {
      const result = definition.evaluate(baseRecord);
      baseRecord.trialSucceeded = result.succeeded;
      baseRecord.trialMastered = result.mastered;
    }
  }
  return baseRecord;
}

function earnedAchievementIds(chronicle: Chronicle): string[] {
  const conqueredTier = (tier: TrialTier) => CHALLENGES
    .filter((challenge) => challenge.tier === tier)
    .every((challenge) => (chronicle.challengeVictories[challenge.id] ?? 0) > 0);
  return [
    chronicle.matchesPlayed >= 1 && "first_ritual",
    chronicle.victories >= 3 && "three_victories",
    chronicle.bestPrestige >= 25 && "prestige_25",
    chronicle.dailyChallengesCompleted >= 3 && "daily_three",
    chronicle.weeklyChallengesCompleted >= 3 && "weekly_three",
    conqueredTier("initiation") && "trial_trinity",
    conqueredTier("craft") && "craft_trinity",
    conqueredTier("peril") && "peril_trinity",
    conqueredTier("mastery") && "mastery_trinity",
  ].filter((id): id is string => Boolean(id));
}

export function addMatchRecord(chronicle: Chronicle, record: MatchRecord): Chronicle {
  if (chronicle.recentMatches.some((match) => match.id === record.id)) return chronicle;
  let currentDailyStreak = chronicle.currentDailyStreak;
  let bestDailyStreak = chronicle.bestDailyStreak;
  let lastDailyDate = chronicle.lastDailyDate;
  let dailyChallengesCompleted = chronicle.dailyChallengesCompleted;
  let dailyVictories = chronicle.dailyVictories;
  let currentWeeklyStreak = chronicle.currentWeeklyStreak;
  let bestWeeklyStreak = chronicle.bestWeeklyStreak;
  let lastWeeklyKey = chronicle.lastWeeklyKey;
  let weeklyChallengesCompleted = chronicle.weeklyChallengesCompleted;
  let weeklyVictories = chronicle.weeklyVictories;

  if (record.mode === "daily" && record.challengeDate && record.challengeDate !== lastDailyDate) {
    const distance = lastDailyDate ? dayDistance(lastDailyDate, record.challengeDate) : 0;
    currentDailyStreak = !lastDailyDate || distance === 1 ? currentDailyStreak + 1 : distance === 0 ? currentDailyStreak : 1;
    bestDailyStreak = Math.max(bestDailyStreak, currentDailyStreak);
    lastDailyDate = record.challengeDate;
    dailyChallengesCompleted += 1;
    if (record.won) dailyVictories += 1;
  }

  if (record.mode === "weekly" && record.weeklyKey && record.weeklyKey !== lastWeeklyKey) {
    const distance = lastWeeklyKey ? weekDistance(lastWeeklyKey, record.weeklyKey) : 0;
    currentWeeklyStreak = !lastWeeklyKey || distance === 1 ? currentWeeklyStreak + 1 : distance === 0 ? currentWeeklyStreak : 1;
    bestWeeklyStreak = Math.max(bestWeeklyStreak, currentWeeklyStreak);
    lastWeeklyKey = record.weeklyKey;
    weeklyChallengesCompleted += 1;
    if (record.won) weeklyVictories += 1;
  }

  const challengeCompletions = { ...chronicle.challengeCompletions };
  const challengeVictories = { ...chronicle.challengeVictories };
  const challengeMasteries = { ...chronicle.challengeMasteries };
  if (record.challengeId) {
    challengeCompletions[record.challengeId] = (challengeCompletions[record.challengeId] ?? 0) + 1;
    if (record.trialSucceeded ?? record.won) challengeVictories[record.challengeId] = (challengeVictories[record.challengeId] ?? 0) + 1;
    if (record.trialMastered) challengeMasteries[record.challengeId] = (challengeMasteries[record.challengeId] ?? 0) + 1;
  }
  const next: Chronicle = {
    ...chronicle,
    matchesPlayed: chronicle.matchesPlayed + 1,
    victories: chronicle.victories + (record.won ? 1 : 0),
    totalPrestige: chronicle.totalPrestige + record.prestige,
    bestPrestige: Math.max(chronicle.bestPrestige, record.prestige),
    dailyChallengesCompleted,
    dailyVictories,
    currentDailyStreak,
    bestDailyStreak,
    lastDailyDate,
    weeklyChallengesCompleted,
    weeklyVictories,
    currentWeeklyStreak,
    bestWeeklyStreak,
    lastWeeklyKey,
    recentMatches: [record, ...chronicle.recentMatches].slice(0, 12),
    challengeCompletions,
    challengeVictories,
    challengeMasteries,
    unlockedAchievementIds: chronicle.unlockedAchievementIds,
  };
  next.unlockedAchievementIds = [...new Set([...next.unlockedAchievementIds, ...earnedAchievementIds(next)])];
  return next;
}

export function loadChronicle(): Chronicle {
  try {
    if (typeof window === "undefined") return { ...EMPTY_CHRONICLE };
    const raw = window.localStorage.getItem(CHRONICLE_STORAGE_KEY);
    if (!raw) return { ...EMPTY_CHRONICLE };
    const parsed = JSON.parse(raw) as Partial<Chronicle> & { version?: unknown };
    const storedVersion = parsed.version as unknown;
    if ((storedVersion !== 1 && storedVersion !== 2 && storedVersion !== 3 && storedVersion !== 4) || !Array.isArray(parsed.recentMatches)) return { ...EMPTY_CHRONICLE };
    return { ...EMPTY_CHRONICLE, ...parsed, version: 4, recentMatches: parsed.recentMatches.slice(0, 12) as MatchRecord[] };
  } catch {
    return { ...EMPTY_CHRONICLE };
  }
}

export function selectChronicleTitle(achievementId: string): Chronicle {
  const chronicle = loadChronicle();
  if (achievementId && !chronicle.unlockedAchievementIds.includes(achievementId)) return chronicle;
  const next = { ...chronicle, selectedTitleId: achievementId };
  saveChronicle(next);
  return next;
}

export function saveChronicle(chronicle: Chronicle): void {
  try {
    window.localStorage.setItem(CHRONICLE_STORAGE_KEY, JSON.stringify(chronicle));
  } catch {
    // Statistics are optional and must never interrupt the ritual.
  }
}

export function recordCompletedMatch(record: MatchRecord): Chronicle {
  const next = addMatchRecord(loadChronicle(), record);
  saveChronicle(next);
  return next;
}

export function recordCompletedMatchProgression(record: MatchRecord): MatchProgression {
  const previous = loadChronicle();
  const chronicle = addMatchRecord(previous, record);
  saveChronicle(chronicle);
  return {
    chronicle,
    newlyUnlockedAchievementIds: chronicle.unlockedAchievementIds.filter(
      (id) => !previous.unlockedAchievementIds.includes(id),
    ),
    previousBestPrestige: previous.bestPrestige,
  };
}
