import type { Player } from "./playerTypes";
import type { RecipeBooks, RecipeColor, RecipeSet } from "./recipeBooks";
import type { TokenColor } from "./tokenTypes";

export type BuildRole = "control" | "rubyEngine" | "resonance" | "aggression" | "adaptation" | "lateBloom";

export interface IngredientBuildIdentity {
  primary: BuildRole;
  secondary: BuildRole;
}

export interface BuildIdentity {
  primary: BuildRole;
  secondary: BuildRole | null;
  primaryScore: number;
  secondaryScore: number;
  supportingColors: TokenColor[];
  recipeEnvironment: BuildRole[];
}

// This table is the Phase-2 audit of every base recipe effect. Roles describe
// the decision pattern an ingredient supports; they do not change its rules.
export const BASE_RECIPE_IDENTITIES: Record<RecipeColor, Record<1 | 2 | 3 | 4, IngredientBuildIdentity>> = {
  blue: {
    1: { primary: "control", secondary: "adaptation" },
    2: { primary: "control", secondary: "aggression" },
    3: { primary: "rubyEngine", secondary: "control" },
    4: { primary: "rubyEngine", secondary: "aggression" },
  },
  red: {
    1: { primary: "resonance", secondary: "aggression" },
    2: { primary: "adaptation", secondary: "control" },
    3: { primary: "resonance", secondary: "aggression" },
    4: { primary: "aggression", secondary: "resonance" },
  },
  yellow: {
    1: { primary: "control", secondary: "adaptation" },
    2: { primary: "aggression", secondary: "adaptation" },
    3: { primary: "control", secondary: "lateBloom" },
    4: { primary: "aggression", secondary: "resonance" },
  },
  green: {
    1: { primary: "rubyEngine", secondary: "lateBloom" },
    2: { primary: "adaptation", secondary: "lateBloom" },
    3: { primary: "aggression", secondary: "resonance" },
    4: { primary: "lateBloom", secondary: "rubyEngine" },
  },
  purple: {
    1: { primary: "resonance", secondary: "rubyEngine" },
    2: { primary: "lateBloom", secondary: "adaptation" },
    3: { primary: "aggression", secondary: "lateBloom" },
    4: { primary: "lateBloom", secondary: "resonance" },
  },
};

const FIXED_IDENTITIES: Partial<Record<TokenColor, IngredientBuildIdentity>> = {
  orange: { primary: "aggression", secondary: "resonance" },
  black: { primary: "adaptation", secondary: "rubyEngine" },
  echo: { primary: "adaptation", secondary: "resonance" },
};

function recipeIdentity(color: TokenColor, books: RecipeBooks): IngredientBuildIdentity | null {
  if (color in BASE_RECIPE_IDENTITIES) {
    const recipeColor = color as RecipeColor;
    const set = Math.min(4, books[recipeColor]) as 1 | 2 | 3 | 4;
    return BASE_RECIPE_IDENTITIES[recipeColor][set];
  }
  return FIXED_IDENTITIES[color] ?? null;
}

function addScore(scores: Record<BuildRole, number>, role: BuildRole, amount: number): void {
  scores[role] += amount;
}

export function analyzeBuildIdentity(player: Player, books: RecipeBooks): BuildIdentity {
  const scores: Record<BuildRole, number> = {
    control: 0,
    rubyEngine: 0,
    resonance: 0,
    aggression: 0,
    adaptation: 0,
    lateBloom: 0,
  };
  const colorStrength = new Map<TokenColor, number>();
  const owned = [...player.bag.tokens, ...player.crucible.placements.map((placement) => placement.token)];

  for (const token of owned) {
    if (token.color === "white") continue;
    const identity = recipeIdentity(token.color, books);
    if (!identity) continue;
    const weight = Math.max(1, token.value);
    addScore(scores, identity.primary, weight);
    addScore(scores, identity.secondary, weight * 0.45);
    colorStrength.set(token.color, (colorStrength.get(token.color) ?? 0) + weight);
  }

  const recipeEnvironment = [...new Set((Object.keys(BASE_RECIPE_IDENTITIES) as RecipeColor[])
    .flatMap((color) => {
      const set = Math.min(4, books[color]) as 1 | 2 | 3 | 4;
      const identity = BASE_RECIPE_IDENTITIES[color][set];
      return [identity.primary, identity.secondary];
    }))].sort((a, b) => scores[b] - scores[a]);

  const ranked = (Object.entries(scores) as Array<[BuildRole, number]>).sort((a, b) => b[1] - a[1]);
  const supportingColors = [...colorStrength.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([color]) => color);
  return {
    primary: ranked[0][1] > 0 ? ranked[0][0] : recipeEnvironment[0] ?? "adaptation",
    secondary: ranked[1][1] > 0 ? ranked[1][0] : null,
    primaryScore: ranked[0][1],
    secondaryScore: ranked[1][1],
    supportingColors,
    recipeEnvironment: recipeEnvironment.slice(0, 3),
  };
}

export function getIngredientBuildIdentity(color: TokenColor, set: RecipeSet): IngredientBuildIdentity | null {
  if (color in BASE_RECIPE_IDENTITIES) {
    const recipeColor = color as RecipeColor;
    return BASE_RECIPE_IDENTITIES[recipeColor][Math.min(4, set) as 1 | 2 | 3 | 4];
  }
  return FIXED_IDENTITIES[color] ?? null;
}
