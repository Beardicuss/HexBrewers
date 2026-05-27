// Chip effects — applied when specific colored tokens are drawn or at end of round
// This implements the actual ingredient effects from the official game (Set 1 baseline)

import type { Token } from "./tokenTypes";
import type { Crucible } from "./crucibleTypes";
import type { Player } from "./playerTypes";
import type { Bag } from "./bagTypes";
import { drawToken } from "./bag";
import type { RecipeBooks } from "./recipeBooks";
import { DEFAULT_RECIPE_BOOKS, getRecipeSetForColor } from "./recipeBooks";
import { placeToken } from "./crucible";

export interface EffectResult {
  player: Player;
  pendingBlueDraw?: {           // blue: must resolve draw-2-keep-1
    drawn: [Token, Token | null]; // up to 2 drawn tokens
  };
}

// ── IMMEDIATE EFFECTS (triggered when chip is drawn) ─────────────────────────

// Red (Bloodthorn): official Set 1 behavior. It moves extra spaces based on
// how many orange chips are already in the pot.
export function redBonusValue(crucible: Crucible, books: RecipeBooks = DEFAULT_RECIPE_BOOKS): number {
  const set = getRecipeSetForColor(books, "red");
  if (set === 2) return 0;
  if (set === 3) {
    const previous = crucible.lastDrawnToken;
    return previous?.color === "white" ? previous.value : 0;
  }
  if (set === 4) return 0;

  const orangeCount = crucible.slots.filter(
    (s) => s.token?.color === "orange"
  ).length;
  if (orangeCount >= 3) return 2;
  if (orangeCount >= 1) return 1;
  return 0;
}

// Blue (Frostbile): draw extra chips equal to blue chip's value, place 1 (or 0) back into pot
// Returns drawn tokens for UI to present choice
export function drawBlueBonus(bag: Bag, chipValue: number): {
  bag: Bag;
  drawn: Token[];
} {
  const tokens: Token[] = [];
  let currentBag = bag;
  const drawCount = chipValue; // draw 1, 2, or 4 based on chip value

  for (let i = 0; i < drawCount; i++) {
    const result = drawToken(currentBag);
    if (!result) break;
    tokens.push(result.token);
    currentBag = result.bag;
  }

  return { bag: currentBag, drawn: tokens };
}

export function applyBlueImmediate(player: Player, token: Token, books: RecipeBooks): Player {
  const set = getRecipeSetForColor(books, "blue");
  if (set === 2) {
    return {
      ...player,
      blueProtectionDraws: Math.max(player.blueProtectionDraws ?? 0, token.value),
    };
  }

  if (set === 3 || set === 4) {
    const landedOnRuby = [4, 9, 15, 21, 28].includes(player.crucible.filledUpTo + 1);
    if (!landedOnRuby) return player;
    return set === 3
      ? { ...player, rubies: player.rubies + 1 }
      : { ...player, score: player.score + token.value };
  }

  return player;
}

// Yellow (Plaguedust): official Set 1 behavior. If placed directly after a
// white chip, that white chip may be returned to the bag; the yellow stays put.
export function applyYellowSetOneBonus(player: Player, previousToken: Token | null): Player {
  if (!previousToken || previousToken.color !== "white") return player;

  return {
    ...player,
    bag: { tokens: [...player.bag.tokens, previousToken] },
    crucible: {
      ...player.crucible,
      whiteSum: Math.max(0, player.crucible.whiteSum - previousToken.value),
      slots: player.crucible.slots.map((slot) =>
        slot.token?.id === previousToken.id ? { ...slot, token: null } : slot
      ),
    },
  };
}

export function applyYellowImmediate(player: Player, previousToken: Token | null, books: RecipeBooks): Player {
  const set = getRecipeSetForColor(books, "yellow");
  if (set === 1) return applyYellowSetOneBonus(player, previousToken);
  if (set === 2) return { ...player, yellowDoubleNext: true };
  return player;
}

// ── END-OF-ROUND EFFECTS ─────────────────────────────────────────────────────

// Green (Deathweave): earn 1 ruby if green chip is on the last or second-to-last space
export function greenRubyBonus(crucible: Crucible, books: RecipeBooks = DEFAULT_RECIPE_BOOKS): number {
  const set = getRecipeSetForColor(books, "green");
  if (set !== 1) return 0;
  const placed = crucible.slots.filter((s) => s.token !== null);
  const lastTwo = placed.slice(-2);
  return lastTwo.filter((s) => s.token?.color === "green").length;
}

export function countPlacedColor(crucible: Crucible, color: Token["color"]): number {
  return crucible.slots.filter((s) => s.token?.color === color).length;
}

export function applyPurpleSetOneBonus(player: Player): Player {
  const purpleCount = countPlacedColor(player.crucible, "purple");
  if (purpleCount <= 0) return player;

  if (purpleCount === 1) {
    return { ...player, score: player.score + 1 };
  }

  if (purpleCount === 2) {
    return { ...player, score: player.score + 1, rubies: player.rubies + 1 };
  }

  return {
    ...player,
    score: player.score + 2,
    crucible: {
      ...player.crucible,
      dropletPosition: Math.min(player.crucible.dropletPosition + 1, 32),
    },
  };
}

export function applyBlackSetOneBonus(player: Player, opponent: Player): Player {
  const blackCount = countPlacedColor(player.crucible, "black");
  if (blackCount <= 0) return player;

  const opponentBlackCount = countPlacedColor(opponent.crucible, "black");
  if (blackCount < opponentBlackCount) return player;

  const moved = {
    ...player,
    crucible: {
      ...player.crucible,
      dropletPosition: Math.min(player.crucible.dropletPosition + 1, 32),
    },
  };

  return blackCount > opponentBlackCount
    ? { ...moved, rubies: moved.rubies + 1 }
    : moved;
}

// Apply all end-of-round chip effects to a player.
export function applyEndOfRoundEffects(player: Player, opponent?: Player, books: RecipeBooks = DEFAULT_RECIPE_BOOKS): Player {
  const { crucible } = player;

  let updated = {
    ...player,
  };

  updated = applyGreenEndEffect(updated, books);
  updated = applyPurpleEndEffect(updated, books);

  if (opponent) {
    updated = applyBlackSetOneBonus(updated, opponent);
  }

  return updated;
}

function applyGreenEndEffect(player: Player, books: RecipeBooks): Player {
  const set = getRecipeSetForColor(books, "green");
  const placed = player.crucible.slots.filter((slot) => slot.token !== null);
  const lastTwo = placed.slice(-2);
  const greenTokens = lastTwo.map((slot) => slot.token).filter((token): token is Token => token?.color === "green");

  if (set === 1) {
    return { ...player, rubies: player.rubies + greenTokens.length };
  }

  if (set === 2) {
    const gained = greenTokens.map((token) => ({
      id: `green-bonus-${token.value}-${player.id}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      color: "green" as const,
      value: token.value === 4 ? 2 : 1,
    }));
    return { ...player, bag: { tokens: [...player.bag.tokens, ...gained] } };
  }

  if (set === 3 && player.crucible.whiteSum === 7) {
    const totalGreen = countPlacedColor(player.crucible, "green");
    if (totalGreen <= 0) return player;
    const last = placed[placed.length - 1];
    if (!last?.token) return player;
    const movedCrucible = {
      ...player.crucible,
      slots: player.crucible.slots.map((slot) =>
        slot.position === last.position ? { ...slot, token: null } : slot
      ),
      filledUpTo: Math.min(player.crucible.filledUpTo + totalGreen, 33),
    };
    return { ...player, crucible: placeToken(movedCrucible, last.token, 0) };
  }

  if (set === 4) {
    const spendable = Math.min(greenTokens.length, Math.floor(player.rubies / 2));
    return {
      ...player,
      rubies: player.rubies - spendable * 2,
      crucible: {
        ...player.crucible,
        dropletPosition: Math.min(player.crucible.dropletPosition + spendable, 32),
      },
    };
  }

  return player;
}

function applyPurpleEndEffect(player: Player, books: RecipeBooks): Player {
  const set = getRecipeSetForColor(books, "purple");
  const purpleCount = countPlacedColor(player.crucible, "purple");
  if (purpleCount <= 0) return player;

  if (set === 1) return applyPurpleSetOneBonus(player);

  if (set === 2) {
    return {
      ...player,
      score: player.score + Math.min(3, purpleCount),
      rubies: player.rubies + (purpleCount >= 2 ? 1 : 0),
    };
  }

  if (set === 3) {
    const highestPurple = Math.max(
      ...player.crucible.slots
        .filter((slot) => slot.token?.color === "purple")
        .map((slot) => slot.position),
      0
    );
    return { ...player, score: player.score + Math.floor(highestPurple / 10) };
  }

  const upgraded = player.bag.tokens.map((token) => {
    if (token.color !== "white") return token;
    if (token.value === 1) return { ...token, value: 2 };
    if (token.value === 2) return { ...token, value: 3 };
    return token;
  });
  return { ...player, bag: { tokens: upgraded } };
}
