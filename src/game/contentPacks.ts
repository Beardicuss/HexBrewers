import type { EchoRecipe, RecipeMode } from "./recipeBooks";

export type ContentPackId = "base" | "covenants_of_the_mire" | "distillers_of_the_veil";
export type PlayerCount = 2 | 3 | 4 | 5;

export interface GameModules {
  fifthSeat: boolean;
  patrons: boolean;
  overflow: boolean;
  distillation: boolean;
}

export interface GameSetup {
  totalPlayers: PlayerCount;
  recipeMode: RecipeMode;
  enabledPacks: ContentPackId[];
  modules: GameModules;
  echoRecipe: EchoRecipe;
}

export interface ContentPackDefinition {
  id: ContentPackId;
  title: string;
  requires: ContentPackId[];
  modules: Partial<GameModules>;
}

export const CONTENT_PACKS: Record<ContentPackId, ContentPackDefinition> = {
  base: { id: "base", title: "Hexbrewers of Ashenveil", requires: [], modules: {} },
  covenants_of_the_mire: {
    id: "covenants_of_the_mire",
    title: "Mirewrought Pacts",
    requires: ["base"],
    modules: { fifthSeat: true, patrons: true, overflow: true },
  },
  distillers_of_the_veil: {
    id: "distillers_of_the_veil",
    title: "Veilglass Afflictions",
    requires: ["base"],
    modules: { distillation: true },
  },
};

export const BASE_MODULES: GameModules = {
  fifthSeat: false,
  patrons: false,
  overflow: false,
  distillation: false,
};

export const BASE_GAME_SETUP: GameSetup = {
  totalPlayers: 2,
  recipeMode: 1,
  enabledPacks: ["base"],
  modules: BASE_MODULES,
  echoRecipe: "catchup",
};

export function normalizeContentPacks(packs: ContentPackId[]): ContentPackId[] {
  const result = new Set<ContentPackId>(["base"]);
  for (const id of packs) {
    const definition = CONTENT_PACKS[id];
    if (!definition) continue;
    result.add(id);
    for (const required of definition.requires) result.add(required);
  }
  return (["base", "covenants_of_the_mire", "distillers_of_the_veil"] as ContentPackId[])
    .filter((id) => result.has(id));
}

export function createGameSetup(options: {
  totalPlayers?: number;
  recipeMode?: RecipeMode;
  enabledPacks?: ContentPackId[];
  echoRecipe?: EchoRecipe;
} = {}): GameSetup {
  const enabledPacks = normalizeContentPacks(options.enabledPacks ?? ["base"]);
  const modules = enabledPacks.reduce<GameModules>(
    (result, id) => ({ ...result, ...CONTENT_PACKS[id].modules }),
    { ...BASE_MODULES },
  );
  const maximumPlayers = modules.fifthSeat ? 5 : 4;
  const requestedPlayers = Math.trunc(options.totalPlayers ?? 2);
  return {
    totalPlayers: Math.max(2, Math.min(maximumPlayers, requestedPlayers)) as PlayerCount,
    recipeMode: !modules.patrons && (options.recipeMode === 5 || options.recipeMode === 6)
      ? 1
      : options.recipeMode ?? 1,
    enabledPacks,
    modules,
    echoRecipe: modules.distillation
      ? options.echoRecipe === "deep_resonance" ? "deep_resonance" : "retort_resonance"
      : "catchup",
  };
}

export function hasContentPack(setup: GameSetup, id: ContentPackId): boolean {
  return setup.enabledPacks.includes(id);
}
