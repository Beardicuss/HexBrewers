import type { TokenColor } from "./tokenTypes";

export type RecipeSet = 1 | 2 | 3 | 4;
export type RecipeMode = RecipeSet | "random";

export type RecipeColor = Exclude<TokenColor, "white" | "orange" | "black">;

export interface RecipeBooks {
  blue: RecipeSet;
  red: RecipeSet;
  yellow: RecipeSet;
  green: RecipeSet;
  purple: RecipeSet;
}

export const RECIPE_COLORS: RecipeColor[] = ["blue", "red", "yellow", "green", "purple"];

export const DEFAULT_RECIPE_BOOKS: RecipeBooks = {
  blue: 1,
  red: 1,
  yellow: 1,
  green: 1,
  purple: 1,
};

export function createRecipeBooks(mode: RecipeMode = 1): RecipeBooks {
  if (mode === "random") {
    return {
      blue: randomSet(),
      red: randomSet(),
      yellow: randomSet(),
      green: randomSet(),
      purple: randomSet(),
    };
  }

  return {
    blue: mode,
    red: mode,
    yellow: mode,
    green: mode,
    purple: mode,
  };
}

function randomSet(): RecipeSet {
  return (Math.floor(Math.random() * 4) + 1) as RecipeSet;
}

export function getRecipeSetForColor(books: RecipeBooks, color: TokenColor): RecipeSet {
  if (color === "blue" || color === "red" || color === "yellow" || color === "green" || color === "purple") {
    return books[color];
  }
  return 1;
}

export function getRecipeCost(color: TokenColor, value: number, books: RecipeBooks): number {
  if (color === "orange") return 3;
  if (color === "black") return 10;

  const set = getRecipeSetForColor(books, color);
  const costs = RECIPE_COSTS[color]?.[set];
  const cost = costs?.[value];
  if (cost === undefined) {
    throw new Error(`No recipe cost for ${color} ${value} in set ${set}`);
  }
  return cost;
}

const RECIPE_COSTS: Partial<Record<TokenColor, Record<RecipeSet, Record<number, number>>>> = {
  blue: {
    1: { 1: 5, 2: 10, 4: 19 },
    2: { 1: 5, 2: 10, 4: 19 },
    3: { 1: 4, 2: 8, 4: 14 },
    4: { 1: 5, 2: 10, 4: 20 },
  },
  red: {
    1: { 1: 6, 2: 10, 4: 16 },
    2: { 1: 4, 2: 8, 4: 14 },
    3: { 1: 5, 2: 9, 4: 15 },
    4: { 1: 7, 2: 11, 4: 17 },
  },
  yellow: {
    1: { 1: 8, 2: 12, 4: 18 },
    2: { 1: 9, 2: 13, 4: 19 },
    3: { 1: 8, 2: 12, 4: 18 },
    4: { 1: 8, 2: 12, 4: 18 },
  },
  green: {
    1: { 1: 4, 2: 8, 4: 14 },
    2: { 1: 6, 2: 11, 4: 18 },
    3: { 1: 6, 2: 11, 4: 18 },
    4: { 1: 4, 2: 8, 4: 14 },
  },
  purple: {
    1: { 1: 9 },
    2: { 1: 12 },
    3: { 1: 10 },
    4: { 1: 11 },
  },
};

