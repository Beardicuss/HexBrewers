import type { GamePhase, GameState } from "../game/gameState";
import type { ContentPackId } from "../game/contentPacks";
import { CONTENT_PACKS, createGameSetup } from "../game/contentPacks";
import type { RecipeMode, RecipeSet } from "../game/recipeBooks";
import { AFFLICTION_ORDER, createAfflictionOffer } from "../game/distillation";
import { COVENANTS, createCovenantOffer, DEFAULT_COVENANTS, isValidCovenantSelection, type CovenantOffer, type CovenantSelection } from "../game/covenants";

export const GAME_SAVE_KEY = "hexbrewers-active-game";
export const GAME_SAVE_VERSION = 2;

interface SavedGameEnvelope {
  version: number;
  savedAt: string;
  state: GameState;
}

const GAME_PHASES = new Set<GamePhase>([
  "setup", "rat_tails", "omen", "omen_choice", "omen_strong_choice",
  "omen_restart_choice", "brewing", "blue_choice", "yellow_choice",
  "movement_choice", "red_choice", "green_choice", "green_move_choice",
  "green_reward_choice", "purple_choice", "end_of_round", "scoring",
  "distillation",
  "ruby_spend", "market", "game_over",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function inferRecipeMode(value: Record<string, unknown>): RecipeMode {
  if (!isRecord(value.recipeBooks)) return 1;
  const sets = Object.values(value.recipeBooks).filter((set): set is RecipeSet =>
    set === 1 || set === 2 || set === 3 || set === 4 || set === 5 || set === 6,
  );
  return sets.length > 0 && sets.every((set) => set === sets[0]) ? sets[0] : "random";
}

function migrateState(value: unknown, version: number): GameState | null {
  if (!isRecord(value)) return null;
  if (!Array.isArray(value.players) || value.players.length < 2 || value.players.length > 5) return null;
  if (!Number.isInteger(value.currentRound) || (value.currentRound as number) < 1 || (value.currentRound as number) > 9) return null;
  if (!Number.isInteger(value.totalRounds) || value.totalRounds !== 9) return null;
  if (typeof value.phase !== "string" || !GAME_PHASES.has(value.phase as GamePhase)) return null;
  if (!isRecord(value.recipeBooks) || !Array.isArray(value.market) || !Array.isArray(value.omenDeck)) return null;

  const storedSetup = isRecord(value.setup) ? value.setup : null;
  const requestedPacks = storedSetup && Array.isArray(storedSetup.enabledPacks)
    ? storedSetup.enabledPacks.filter((id): id is ContentPackId =>
      typeof id === "string" && Object.prototype.hasOwnProperty.call(CONTENT_PACKS, id),
    )
    : ["base" as const];
  value.setup = createGameSetup({
    totalPlayers: value.players.length,
    recipeMode: version >= 2 && storedSetup && (
      storedSetup.recipeMode === "random" ||
      storedSetup.recipeMode === 1 || storedSetup.recipeMode === 2 ||
      storedSetup.recipeMode === 3 || storedSetup.recipeMode === 4 ||
      storedSetup.recipeMode === 5 || storedSetup.recipeMode === 6
    ) ? storedSetup.recipeMode : inferRecipeMode(value),
    enabledPacks: requestedPacks,
    echoRecipe: storedSetup && (
      storedSetup.echoRecipe === "retort_resonance" || storedSetup.echoRecipe === "deep_resonance"
    ) ? storedSetup.echoRecipe : "catchup",
  });

  if ((value.setup as ReturnType<typeof createGameSetup>).totalPlayers !== value.players.length) return null;

  const normalizedSetup = value.setup as ReturnType<typeof createGameSetup>;
  if (normalizedSetup.modules.distillation) {
    const validOffer = Array.isArray(value.afflictionOffer)
      && value.afflictionOffer.length === 3
      && new Set(value.afflictionOffer).size === 3
      && value.afflictionOffer.every((id) => AFFLICTION_ORDER.includes(id as typeof AFFLICTION_ORDER[number]));
    if (!validOffer) {
      value.afflictionOffer = createAfflictionOffer(normalizedSetup.recipeMode, normalizedSetup.totalPlayers);
    }
  } else {
    delete value.afflictionOffer;
  }
  if (normalizedSetup.modules.patrons) {
    const offer = value.covenantOffer as CovenantOffer | undefined;
    const validCovenantOffer = offer && (["bone", "moon", "blood"] as const).every((kind) =>
      Array.isArray(offer[kind]) && offer[kind].length === 3 && new Set(offer[kind]).size === 3
      && offer[kind].every((id) => COVENANTS[id]?.kind === kind),
    );
    if (!validCovenantOffer) value.covenantOffer = createCovenantOffer(normalizedSetup.recipeMode, normalizedSetup.totalPlayers);
    const selected = value.selectedCovenants as CovenantSelection | undefined;
    const validSelection = selected && isValidCovenantSelection(selected, value.covenantOffer as CovenantOffer);
    if (!validSelection && value.phase !== "setup") value.selectedCovenants = DEFAULT_COVENANTS;
    if (!validSelection && value.phase === "setup") delete value.selectedCovenants;
  } else {
    delete value.covenantOffer;
    delete value.selectedCovenants;
  }

  const overflowEnabled = normalizedSetup.modules.overflow;
  value.players = value.players.map((player) => {
    if (!isRecord(player) || !isRecord(player.crucible)) return player;
    const affliction = isRecord(player.affliction)
      ? {
          ...player.affliction,
          lastHeadStart: typeof player.affliction.lastHeadStart === "number" ? player.affliction.lastHeadStart : 0,
          pendingHeadStart: typeof player.affliction.pendingHeadStart === "number" ? player.affliction.pendingHeadStart : 0,
        }
      : player.affliction;
    return {
      ...player,
      affliction,
      crucible: {
        ...player.crucible,
        overflowEnabled,
        overflowTokens: Array.isArray(player.crucible.overflowTokens) ? player.crucible.overflowTokens : [],
      },
    };
  });

  const aiDifficulty = value.aiDifficulty;
  if (aiDifficulty !== "apprentice" && aiDifficulty !== "skilled" && aiDifficulty !== "master") {
    value.aiDifficulty = "skilled";
  }
  return value as unknown as GameState;
}

export function serializeGameState(state: GameState): string {
  const envelope: SavedGameEnvelope = {
    version: GAME_SAVE_VERSION,
    savedAt: new Date().toISOString(),
    state,
  };
  return JSON.stringify(envelope);
}

export function deserializeGameState(raw: string): GameState | null {
  try {
    const envelope: unknown = JSON.parse(raw);
    if (!isRecord(envelope) || (envelope.version !== 1 && envelope.version !== GAME_SAVE_VERSION)) return null;
    return migrateState(envelope.state, envelope.version);
  } catch {
    return null;
  }
}

function storage(): Storage | null {
  try {
    return typeof window !== "undefined" && window.localStorage ? window.localStorage : null;
  } catch {
    return null;
  }
}

export function saveGameState(state: GameState): void {
  const target = storage();
  if (!target) return;
  try {
    target.setItem(GAME_SAVE_KEY, serializeGameState(state));
  } catch {
    // A full or disabled storage area must never interrupt gameplay.
  }
}

export function loadSavedGame(): GameState | null {
  const target = storage();
  if (!target) return null;
  try {
    const raw = target.getItem(GAME_SAVE_KEY);
    if (!raw) return null;
    const state = deserializeGameState(raw);
    if (!state) target.removeItem(GAME_SAVE_KEY);
    return state;
  } catch {
    return null;
  }
}

export function clearSavedGame(): void {
  try {
    storage()?.removeItem(GAME_SAVE_KEY);
  } catch {
    // Storage may be blocked by browser privacy settings.
  }
}

export function hasSavedGame(): boolean {
  return loadSavedGame() !== null;
}
