import type { GamePhase } from "./gameState";
import type { Player } from "./playerTypes";
import type { RecipeMode } from "./recipeBooks";
import { advanceDroplet } from "./crucible";

export type CovenantKind = "bone" | "moon" | "blood";
export type CovenantId =
  | "ossuary_mercy" | "marrow_exchange" | "graveward" | "pale_reckoning"
  | "moonstep" | "silver_ward" | "lunar_tithe" | "eclipse_stride"
  | "crimson_credit" | "sanguine_bargain" | "red_harvest" | "heartprice";
export type CovenantSeals = Record<CovenantKind, boolean>;
export type CovenantSelection = Record<CovenantKind, CovenantId>;
export type CovenantOffer = Record<CovenantKind, CovenantId[]>;

export interface CovenantDefinition { id: CovenantId; kind: CovenantKind; timing: GamePhase; }

export const COVENANTS: Record<CovenantId, CovenantDefinition> = {
  ossuary_mercy: { id: "ossuary_mercy", kind: "bone", timing: "ruby_spend" },
  marrow_exchange: { id: "marrow_exchange", kind: "bone", timing: "ruby_spend" },
  graveward: { id: "graveward", kind: "bone", timing: "ruby_spend" },
  pale_reckoning: { id: "pale_reckoning", kind: "bone", timing: "ruby_spend" },
  moonstep: { id: "moonstep", kind: "moon", timing: "brewing" },
  silver_ward: { id: "silver_ward", kind: "moon", timing: "brewing" },
  lunar_tithe: { id: "lunar_tithe", kind: "moon", timing: "brewing" },
  eclipse_stride: { id: "eclipse_stride", kind: "moon", timing: "brewing" },
  crimson_credit: { id: "crimson_credit", kind: "blood", timing: "market" },
  sanguine_bargain: { id: "sanguine_bargain", kind: "blood", timing: "market" },
  red_harvest: { id: "red_harvest", kind: "blood", timing: "market" },
  heartprice: { id: "heartprice", kind: "blood", timing: "market" },
};

export const DEFAULT_COVENANTS: CovenantSelection = { bone: "ossuary_mercy", moon: "moonstep", blood: "crimson_credit" };
const BY_KIND: Record<CovenantKind, CovenantId[]> = {
  bone: ["ossuary_mercy", "marrow_exchange", "graveward", "pale_reckoning"],
  moon: ["moonstep", "silver_ward", "lunar_tithe", "eclipse_stride"],
  blood: ["crimson_credit", "sanguine_bargain", "red_harvest", "heartprice"],
};

export function createCovenantOffer(recipeMode: RecipeMode, playerCount: number): CovenantOffer {
  const seed = (recipeMode === "random" ? 4 : recipeMode - 1) + playerCount;
  const offerFor = (kind: CovenantKind, offset: number) => {
    const pool = BY_KIND[kind];
    const start = (seed + offset) % pool.length;
    return [0, 1, 2].map((step) => pool[(start + step) % pool.length]);
  };
  return { bone: offerFor("bone", 0), moon: offerFor("moon", 1), blood: offerFor("blood", 2) };
}

export function isValidCovenantSelection(selection: CovenantSelection, offer: CovenantOffer): boolean {
  return (Object.keys(offer) as CovenantKind[]).every((kind) =>
    COVENANTS[selection[kind]]?.kind === kind && offer[kind].includes(selection[kind]),
  );
}

export function createCovenantSeals(): CovenantSeals { return { bone: true, moon: true, blood: true }; }

export function canUseCovenant(player: Player, kind: CovenantKind, phase: GamePhase, selection: CovenantSelection = DEFAULT_COVENANTS): boolean {
  const definition = COVENANTS[selection[kind]];
  if (!definition || !player.covenantSeals?.[kind] || definition.timing !== phase) return false;
  if (definition.id === "ossuary_mercy") return !player.flask;
  if (definition.kind === "moon") return player.crucible.placements.length === 0;
  return true;
}

function advancePlayerDroplet(player: Player, steps: number): Player {
  let crucible = player.crucible;
  for (let i = 0; i < steps; i += 1) crucible = advanceDroplet(crucible);
  return { ...player, crucible: { ...crucible, filledUpTo: Math.max(crucible.filledUpTo, crucible.dropletPosition) } };
}

export function useCovenant(player: Player, kind: CovenantKind, selection: CovenantSelection = DEFAULT_COVENANTS): Player {
  if (!player.covenantSeals?.[kind]) return player;
  const id = selection[kind];
  const updated = { ...player, covenantSeals: { ...player.covenantSeals, [kind]: false } };
  if (id === "ossuary_mercy") return { ...updated, flask: true };
  if (id === "marrow_exchange") return { ...updated, rubies: updated.rubies + 2 };
  if (id === "graveward") return advancePlayerDroplet(updated, 2);
  if (id === "pale_reckoning") return { ...updated, score: updated.score + 3 };
  if (id === "moonstep") return advancePlayerDroplet(updated, 1);
  if (id === "silver_ward") return { ...updated, blueProtectionDraws: Math.max(1, updated.blueProtectionDraws ?? 0) };
  if (id === "lunar_tithe") return { ...updated, rubies: updated.rubies + 2 };
  if (id === "eclipse_stride") return advancePlayerDroplet(updated, 2);
  if (id === "sanguine_bargain") return { ...updated, score: Math.max(0, updated.score - 2) };
  if (id === "red_harvest") return { ...updated, rubies: updated.rubies + 2 };
  if (id === "heartprice") return advancePlayerDroplet(updated, 2);
  return updated;
}

export function covenantMarketCoinBonus(id: CovenantId): number { return id === "crimson_credit" ? 5 : id === "sanguine_bargain" ? 8 : 0; }
export function prepareAICovenantForBrewing(player: Player, selection: CovenantSelection = DEFAULT_COVENANTS): Player {
  return player.kind === "ai" && canUseCovenant(player, "moon", "brewing", selection) ? useCovenant(player, "moon", selection) : player;
}
export function prepareAICovenantForMarket(player: Player, round: number, selection: CovenantSelection = DEFAULT_COVENANTS): Player {
  if (player.kind !== "ai" || round < 6 || !canUseCovenant(player, "blood", "market", selection)) return player;
  const credited = useCovenant(player, "blood", selection);
  return { ...credited, coinsThisRound: credited.coinsThisRound + covenantMarketCoinBonus(selection.blood) };
}
export function restoreAIFlaskWithCovenant(player: Player, selection: CovenantSelection = DEFAULT_COVENANTS): Player {
  return player.kind === "ai" && canUseCovenant(player, "bone", "ruby_spend", selection) ? useCovenant(player, "bone", selection) : player;
}
