import type { GameState } from "./gameState";
import type { Player } from "./playerTypes";
import type { RecipeMode } from "./recipeBooks";
import { advanceDroplet, getPlacedTokens } from "./crucible";

export type AfflictionId =
  | "ashen_breath"
  | "glassvein_chill"
  | "hollow_bloom"
  | "embersleep"
  | "moonwater_fever"
  | "thorn_memory"
  | "mirror_hunger"
  | "silent_chorus";

export interface AfflictionState {
  contractId: AfflictionId;
  totalDistillate: number;
  lastProgress: number;
  lastPrestige: number;
  lastDropletSteps: number;
  lastHeadStart: number;
  pendingHeadStart: number;
}

export interface AfflictionDefinition {
  id: AfflictionId;
  title: string;
  symptom: string;
}

export const AFFLICTIONS: Record<AfflictionId, AfflictionDefinition> = {
  ashen_breath: { id: "ashen_breath", title: "Ashen Breath", symptom: "Each breath sheds warm grey cinders." },
  glassvein_chill: { id: "glassvein_chill", title: "Glassvein Chill", symptom: "Veins ring like frozen crystal beneath the skin." },
  hollow_bloom: { id: "hollow_bloom", title: "Hollow Bloom", symptom: "Pale flowers open wherever a memory has faded." },
  embersleep: { id: "embersleep", title: "Embersleep", symptom: "The afflicted dreams beneath a skin of cooling ash." },
  moonwater_fever: { id: "moonwater_fever", title: "Moonwater Fever", symptom: "Silver heat rises whenever moonlight touches glass." },
  thorn_memory: { id: "thorn_memory", title: "Thorn Memory", symptom: "Forgotten names return as barbs beneath the tongue." },
  mirror_hunger: { id: "mirror_hunger", title: "Mirror Hunger", symptom: "Reflections consume details their owner can no longer recall." },
  silent_chorus: { id: "silent_chorus", title: "Silent Chorus", symptom: "Unheard voices gather wherever the afflicted stands still." },
};

export const AFFLICTION_ORDER: AfflictionId[] = [
  "ashen_breath", "glassvein_chill", "hollow_bloom", "embersleep",
  "moonwater_fever", "thorn_memory", "mirror_hunger", "silent_chorus",
];

export function createAfflictionOffer(recipeMode: RecipeMode, playerCount: number): AfflictionId[] {
  const recipeSeed = recipeMode === "random" ? 4 : recipeMode - 1;
  const start = (recipeSeed * 3 + playerCount) % AFFLICTION_ORDER.length;
  return [0, 3, 6].map((offset) => AFFLICTION_ORDER[(start + offset) % AFFLICTION_ORDER.length]);
}

export function createAfflictionState(seatIndex: number, contractId = AFFLICTION_ORDER[seatIndex % AFFLICTION_ORDER.length]): AfflictionState {
  return {
    contractId,
    totalDistillate: 0,
    lastProgress: 0,
    lastPrestige: 0,
    lastDropletSteps: 0,
    lastHeadStart: 0,
    pendingHeadStart: 0,
  };
}

export function adjacentPlayerIndexes(playerIndex: number, playerCount: number): number[] {
  if (playerCount <= 1) return [];
  if (playerCount === 2) return [(playerIndex + 1) % 2];
  return [
    (playerIndex - 1 + playerCount) % playerCount,
    (playerIndex + 1) % playerCount,
  ];
}

export function calculateDistillationProgress(state: GameState, playerIndex: number): number {
  const player = state.players[playerIndex];
  if (!player) return 0;
  const distinctColors = new Set(
    getPlacedTokens(player.crucible)
      .filter((token) => token.color !== "white")
      .map((token) => token.color),
  ).size;
  const effect = state.currentOmen?.effect;
  const exactSevenValue = effect?.type === "distillation_exact_seven" ? effect.exactSevenValue : 1;
  const exactSevenBonus = player.crucible.whiteSum === 7 ? exactSevenValue : 0;
  const neighborValue = effect?.type === "distillation_neighbor_echo" ? effect.valuePerExplodedNeighbor : 1;
  const explodedNeighborBonus = adjacentPlayerIndexes(playerIndex, state.players.length)
    .filter((index) => state.players[index]?.crucible.exploded)
    .length * neighborValue;
  const bonus = effect?.type === "distillation_bonus" ? effect.amount : 0;
  const progress = distinctColors + exactSevenBonus + explodedNeighborBonus + bonus;
  return effect?.type === "distillation_minimum" ? Math.max(effect.minimum, progress) : progress;
}

export interface RemedyReward {
  prestige: number;
  droplet: number;
  nextRoundHeadStart: number;
}

export const REMEDY_TRACK_MAX = 8;

export function getRemedyReward(contractId: AfflictionId, progress: number, finalRound: boolean): RemedyReward {
  if (finalRound) return { prestige: progress, droplet: 0, nextRoundHeadStart: 0 };
  if (contractId === "ashen_breath") {
    return { prestige: progress >= 4 ? 2 : progress >= 2 ? 1 : 0, droplet: 0, nextRoundHeadStart: 0 };
  }
  if (contractId === "glassvein_chill") {
    return { prestige: progress >= 5 ? 2 : progress >= 2 ? 1 : 0, droplet: 0, nextRoundHeadStart: progress >= 4 ? 1 : 0 };
  }
  if (contractId === "hollow_bloom") return { prestige: Math.floor(progress / 2), droplet: progress >= 6 ? 1 : 0, nextRoundHeadStart: 0 };
  if (contractId === "embersleep") return { prestige: progress >= 5 ? 3 : progress >= 3 ? 1 : 0, droplet: 0, nextRoundHeadStart: progress >= 5 ? 2 : progress >= 3 ? 1 : 0 };
  if (contractId === "moonwater_fever") return { prestige: progress >= 5 ? 3 : progress >= 3 ? 1 : 0, droplet: 0, nextRoundHeadStart: progress >= 3 ? 1 : 0 };
  if (contractId === "thorn_memory") return { prestige: progress >= 6 ? 4 : progress >= 4 ? 2 : progress >= 2 ? 1 : 0, droplet: 0, nextRoundHeadStart: 0 };
  if (contractId === "mirror_hunger") return { prestige: Math.max(0, Math.min(4, progress - 2)), droplet: 0, nextRoundHeadStart: progress >= 7 ? 2 : 0 };
  return { prestige: progress % 2 === 0 ? Math.floor(progress / 2) : Math.floor(progress / 3), droplet: 0, nextRoundHeadStart: progress >= 5 ? 1 : 0 };
}

export function chooseAIAffliction(
  player: Player,
  seatIndex: number,
  offeredIds: AfflictionId[] = AFFLICTION_ORDER,
): AfflictionId {
  const distinctBagColors = new Set(player.bag.tokens.filter((token) => token.color !== "white").map((token) => token.color)).size;
  if (distinctBagColors >= 4 && offeredIds.includes("mirror_hunger")) return "mirror_hunger";
  const preferredBySeat: AfflictionId[] = ["glassvein_chill", "embersleep", "thorn_memory", "moonwater_fever"];
  const preferenceStart = Math.max(0, seatIndex - 1) % preferredBySeat.length;
  for (let offset = 0; offset < preferredBySeat.length; offset += 1) {
    const candidate = preferredBySeat[(preferenceStart + offset) % preferredBySeat.length];
    if (offeredIds.includes(candidate)) return candidate;
  }
  return offeredIds[seatIndex % offeredIds.length] ?? AFFLICTION_ORDER[0];
}

function advancePlayerDroplet(player: Player, steps: number): Player {
  let crucible = player.crucible;
  for (let step = 0; step < steps; step += 1) crucible = advanceDroplet(crucible);
  return { ...player, crucible };
}

export function resolveDistillationRound(state: GameState): GameState {
  if (!state.setup.modules.distillation) return state;
  const progressByPlayer = state.players.map((_, index) => calculateDistillationProgress(state, index));
  const players = state.players.map((player, index) => {
    const affliction = player.affliction ?? createAfflictionState(index);
    const progress = progressByPlayer[index];
    const reward = getRemedyReward(affliction.contractId, progress, state.currentRound === state.totalRounds);
    const rewarded = advancePlayerDroplet({ ...player, score: player.score + reward.prestige }, reward.droplet);
    return {
      ...rewarded,
      affliction: {
        ...affliction,
        totalDistillate: affliction.totalDistillate + progress,
        lastProgress: progress,
        lastPrestige: reward.prestige,
        lastDropletSteps: reward.droplet,
        lastHeadStart: reward.nextRoundHeadStart,
        pendingHeadStart: reward.nextRoundHeadStart,
      },
    };
  });
  return { ...state, players, phase: "end_of_round" };
}
