import type { AIDifficulty } from "./aiStrategy";
import type { GameSetup } from "./contentPacks";
import { createGameSetup } from "./contentPacks";
import type { Player } from "./playerTypes";

export type RitualMode = "standard" | "daily" | "weekly" | "challenge";
export type ChallengeId = "shade_measure" | "council_four" | "wandering_grimoire";

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
  scoreMargin: number;
}

export interface ChallengeDefinition {
  id: ChallengeId;
  title: string;
  epitaph: string;
  description: string;
  players: 2 | 3 | 4;
  difficulty: AIDifficulty;
  recipeMode: 1 | 2 | 3 | 4 | "random";
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
  { id: "shade_measure", title: "The Shade’s Measure", epitaph: "One rival. No witness.", description: "Face the Shade alone under Recipe Set 2 and Master judgment.", players: 2, difficulty: "master", recipeMode: 2 },
  { id: "council_four", title: "Council of Four", epitaph: "Three rivals watch the same bag.", description: "Enter a four-brewer contest using Recipe Set 4 and Skilled rivals.", players: 4, difficulty: "skilled", recipeMode: 4 },
  { id: "wandering_grimoire", title: "The Wandering Grimoire", epitaph: "The formula refuses to remain written.", description: "Challenge three brewers with a seeded random base-game recipe under Master judgment.", players: 3, difficulty: "master", recipeMode: "random" },
];

export const ACHIEVEMENTS: AchievementDefinition[] = [
  { id: "first_ritual", title: "First Seal", description: "Complete one ritual.", titleReward: "Initiate of Ashenveil" },
  { id: "three_victories", title: "Crucible Proven", description: "Win three rituals.", titleReward: "Crucible-Proven" },
  { id: "prestige_25", title: "A Name in Gold", description: "Earn at least 25 Prestige in one match.", titleReward: "The Gilded Brewer" },
  { id: "daily_three", title: "Omen Listener", description: "Answer three Daily Omens.", titleReward: "Listener Beyond the Bell" },
  { id: "trial_trinity", title: "Three Forbidden Doors", description: "Complete every named Trial.", titleReward: "Keeper of the Three Doors" },
  { id: "weekly_three", title: "The Turning Seal", description: "Answer three different weekly Trials.", titleReward: "Marked by the Turning Week" },
];

export interface Chronicle {
  version: 3;
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
  unlockedAchievementIds: string[];
  selectedTitleId: string;
}

export const CHRONICLE_STORAGE_KEY = "hexbrewers-chronicle";

export const EMPTY_CHRONICLE: Chronicle = {
  version: 3,
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

export function localDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function createDailyChallenge(date = new Date()): { session: RitualSession; setup: GameSetup; difficulty: AIDifficulty } {
  const dateKey = localDateKey(date);
  const seed = hashText(`ashenveil:${dateKey}`);
  const recipeMode = ((seed % 4) + 1) as 1 | 2 | 3 | 4;
  return {
    session: { id: `daily-${dateKey}`, mode: "daily", label: "The Daily Omen", seed, dateKey },
    setup: createGameSetup({ totalPlayers: 2, recipeMode, enabledPacks: ["base"] }),
    difficulty: "skilled",
  };
}

export function isoWeekKey(date = new Date()): string {
  const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
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
    description: `A shared Trial for ${weekKey}. Its rivals, recipe, and draw sequence remain identical for every brewer until the seal turns.`,
  };
}

export function createStandardSession(): RitualSession {
  return { id: `standard-${Date.now()}`, mode: "standard", label: "Standard Ritual" };
}

export function createChallenge(id: ChallengeId): { session: RitualSession; setup: GameSetup; difficulty: AIDifficulty } {
  const definition = CHALLENGES.find((challenge) => challenge.id === id);
  if (!definition) throw new Error(`Unknown challenge: ${id}`);
  const seed = hashText(`ashenveil:trial:${id}`);
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
): MatchRecord {
  const human = players.find((player) => player.kind === "human");
  if (!human) throw new Error("A completed match must contain a human player.");
  const sortedScores = [...players].map((player) => player.score).sort((a, b) => b - a);
  const higherScores = new Set(sortedScores.filter((score) => score > human.score));
  return {
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
  };
}

function earnedAchievementIds(chronicle: Chronicle): string[] {
  const completedTrials = CHALLENGES.filter(challenge => (chronicle.challengeCompletions[challenge.id] ?? 0) > 0).length;
  return [
    chronicle.matchesPlayed >= 1 && "first_ritual",
    chronicle.victories >= 3 && "three_victories",
    chronicle.bestPrestige >= 25 && "prestige_25",
    chronicle.dailyChallengesCompleted >= 3 && "daily_three",
    chronicle.weeklyChallengesCompleted >= 3 && "weekly_three",
    completedTrials === CHALLENGES.length && "trial_trinity",
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
  if (record.challengeId) {
    challengeCompletions[record.challengeId] = (challengeCompletions[record.challengeId] ?? 0) + 1;
    if (record.won) challengeVictories[record.challengeId] = (challengeVictories[record.challengeId] ?? 0) + 1;
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
    if ((storedVersion !== 1 && storedVersion !== 2 && storedVersion !== 3) || !Array.isArray(parsed.recentMatches)) return { ...EMPTY_CHRONICLE };
    return { ...EMPTY_CHRONICLE, ...parsed, version: 3, recentMatches: parsed.recentMatches.slice(0, 12) as MatchRecord[] };
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
