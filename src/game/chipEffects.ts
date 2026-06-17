// Chip effects — applied when specific colored tokens are drawn or at end of round
// This implements the actual ingredient effects from the official game (Set 1 baseline)

import type { Token } from "./tokenTypes";
import type { TokenColor } from "./tokenTypes";
import type { Crucible } from "./crucibleTypes";
import type { Player } from "./playerTypes";
import type { Bag } from "./bagTypes";
import type { PurpleChoice } from "./gameState";
import { drawToken } from "./bag";
import type { RecipeBooks } from "./recipeBooks";
import { DEFAULT_RECIPE_BOOKS, getRecipeSetForColor } from "./recipeBooks";
import { placeToken } from "./crucible";

export interface GreenSetTwoReward {
  sourceTokenId: string;
  sourceValue: number;
  options: Array<{ color: TokenColor; value: number }>;
}

const TOKEN_LABELS: Record<TokenColor, string> = {
  white: "Voidshard",
  orange: "Brimstone",
  green: "Deathweave",
  purple: "Wraithbloom",
  blue: "Frostbile",
  red: "Bloodthorn",
  yellow: "Plaguedust",
  black: "Shadowmoss",
};

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
  const whiteSum = Math.max(0, player.crucible.whiteSum - previousToken.value);

  return {
    ...player,
    bag: { tokens: [...player.bag.tokens, previousToken] },
    crucible: {
      ...player.crucible,
      whiteSum,
      exploded: whiteSum > 7,
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
export function applyEndOfRoundEffects(
  player: Player,
  opponent?: Player,
  books: RecipeBooks = DEFAULT_RECIPE_BOOKS,
  options: { autoGreenSetTwo?: boolean; autoGreenSetFour?: boolean; autoPurple?: boolean } = {}
): Player {
  let updated = {
    ...player,
  };

  updated = applyGreenEndEffect(updated, books, {
    autoSetTwo: options.autoGreenSetTwo ?? true,
    autoSetFour: options.autoGreenSetFour ?? true,
  });
  if (options.autoPurple ?? true) {
    updated = applyPurpleEndEffect(updated, books);
  }

  if (opponent) {
    updated = applyBlackSetOneBonus(updated, opponent);
  }

  return updated;
}

function applyGreenEndEffect(
  player: Player,
  books: RecipeBooks,
  options: { autoSetTwo: boolean; autoSetFour: boolean }
): Player {
  const set = getRecipeSetForColor(books, "green");
  const placed = player.crucible.slots.filter((slot) => slot.token !== null);
  const lastTwo = placed.slice(-2);
  const greenTokens = lastTwo.map((slot) => slot.token).filter((token): token is Token => token?.color === "green");

  if (set === 1) {
    return { ...player, rubies: player.rubies + greenTokens.length };
  }

  if (set === 2 && options.autoSetTwo) {
    const gained = greenSetTwoRewards(player, books).map((reward) => reward.options[0]).map((reward) => ({
      id: `green-bonus-${reward.color}-${reward.value}-${player.id}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      color: reward.color,
      value: reward.value,
    }));
    return { ...player, bag: { tokens: [...player.bag.tokens, ...gained] } };
  }

  if (set === 3 && player.crucible.whiteSum === 7) {
    const totalGreen = player.crucible.slots.reduce(
      (sum, slot) => sum + (slot.token?.color === "green" ? slot.token.value : 0),
      0
    );
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

  if (set === 4 && options.autoSetFour) {
    const spendable = Math.min(greenTokens.length, player.rubies);
    return {
      ...player,
      rubies: player.rubies - spendable,
      crucible: {
        ...player.crucible,
        dropletPosition: Math.min(player.crucible.dropletPosition + spendable, 32),
      },
    };
  }

  return player;
}

export function greenSetTwoRewards(player: Player, books: RecipeBooks): GreenSetTwoReward[] {
  if (getRecipeSetForColor(books, "green") !== 2) return [];
  const placed = player.crucible.slots.filter((slot) => slot.token !== null);
  return placed.slice(-2)
    .map((slot) => slot.token)
    .filter((token): token is Token => token?.color === "green")
    .map((token) => {
      if (token.value === 1) {
        return {
          sourceTokenId: token.id,
          sourceValue: token.value,
          options: [{ color: "orange" as TokenColor, value: 1 }],
        };
      }
      if (token.value === 2) {
        return {
          sourceTokenId: token.id,
          sourceValue: token.value,
          options: [
            { color: "blue" as TokenColor, value: 1 },
            { color: "red" as TokenColor, value: 1 },
          ],
        };
      }
      return {
        sourceTokenId: token.id,
        sourceValue: token.value,
        options: [
          { color: "yellow" as TokenColor, value: 1 },
          { color: "purple" as TokenColor, value: 1 },
        ],
      };
    });
}

export function greenSetFourSpendMax(player: Player, books: RecipeBooks): number {
  if (getRecipeSetForColor(books, "green") !== 4) return 0;
  const placed = player.crucible.slots.filter((slot) => slot.token !== null);
  const greenTokens = placed.slice(-2).filter((slot) => slot.token?.color === "green").length;
  return Math.min(greenTokens, player.rubies);
}

export function applyGreenSetFourSpend(player: Player, steps: number): Player {
  const spend = Math.max(0, Math.min(steps, player.rubies));
  return {
    ...player,
    rubies: player.rubies - spend,
    crucible: {
      ...player.crucible,
      dropletPosition: Math.min(player.crucible.dropletPosition + spend, 32),
    },
  };
}

function makeEffectToken(playerId: string, color: TokenColor, value: number, source: string): Token {
  return {
    id: `${color}-${value}-${source}-${playerId}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    color,
    value,
  };
}

function placedTokens(player: Player): Token[] {
  return player.crucible.slots
    .map((slot) => slot.token)
    .filter((token): token is Token => token !== null);
}

export function purpleChoices(player: Player, books: RecipeBooks): PurpleChoice[] {
  const set = getRecipeSetForColor(books, "purple");
  const purples = placedTokens(player).filter((token) => token.color === "purple");
  const purpleCount = purples.length;
  if (purpleCount <= 0 || set === 3) return [];

  const choices: PurpleChoice[] = [{ id: "skip", label: "Skip Wraithbloom", kind: "skip" }];

  if (set === 1) {
    choices.push({ id: "p1-1", label: "+1 prestige", kind: "set1", level: 1 });
    if (purpleCount >= 2) choices.push({ id: "p1-2", label: "+1 prestige and +1 ruby", kind: "set1", level: 2 });
    if (purpleCount >= 3) choices.push({ id: "p1-3", label: "+2 prestige and advance droplet", kind: "set1", level: 3 });
    return choices;
  }

  if (set === 2) {
    choices.push({ id: "p2-1", label: "Trade 1 for Shadowmoss, +1 prestige, +1 ruby", kind: "set2", tradeCount: 1 });
    if (purpleCount >= 2) choices.push({ id: "p2-2", label: "Trade 2 for Deathweave + Frostbile, +3 prestige, droplet", kind: "set2", tradeCount: 2 });
    if (purpleCount >= 3) choices.push({ id: "p2-3", label: "Trade 3 for Plaguedust 4, +6 prestige, +1 ruby, droplet +2", kind: "set2", tradeCount: 3 });
    return choices;
  }

  const tokens = placedTokens(player).filter((token) => token.color !== "white" && token.color !== "purple" && token.color !== "black");
  const canUpgradeOne = purpleCount >= 1;
  const canUpgradeTwo = purpleCount >= 2;
  const canUpgradeOneToFour = purpleCount >= 3;

  for (const token of tokens) {
    if (canUpgradeOne && token.value === 1) {
      choices.push({
        id: `p4-${token.id}-1-2`,
        label: `${TOKEN_LABELS[token.color]} 1 to 2`,
        kind: "set4",
        tokenId: token.id,
        color: token.color,
        fromValue: 1,
        toValue: 2,
      });
    }
    if (canUpgradeTwo && token.value === 2) {
      choices.push({
        id: `p4-${token.id}-2-4`,
        label: `${TOKEN_LABELS[token.color]} 2 to 4`,
        kind: "set4",
        tokenId: token.id,
        color: token.color,
        fromValue: 2,
        toValue: 4,
      });
    }
    if (canUpgradeOneToFour && token.value === 1) {
      choices.push({
        id: `p4-${token.id}-1-4`,
        label: `${TOKEN_LABELS[token.color]} 1 to 4`,
        kind: "set4",
        tokenId: token.id,
        color: token.color,
        fromValue: 1,
        toValue: 4,
      });
    }
  }

  return choices;
}

export function applyPurpleChoice(player: Player, choice: PurpleChoice): Player {
  if (choice.kind === "skip") return player;

  if (choice.kind === "set1") {
    if (choice.level === 1) return { ...player, score: player.score + 1 };
    if (choice.level === 2) return { ...player, score: player.score + 1, rubies: player.rubies + 1 };
    return {
      ...player,
      score: player.score + 2,
      crucible: {
        ...player.crucible,
        dropletPosition: Math.min(player.crucible.dropletPosition + 1, 32),
      },
    };
  }

  if (choice.kind === "set2") {
    const purpleIds = player.crucible.slots
      .filter((slot) => slot.token?.color === "purple")
      .slice(0, choice.tradeCount)
      .map((slot) => slot.token!.id);
    const withoutTraded = {
      ...player.crucible,
      slots: player.crucible.slots.map((slot) =>
        slot.token && purpleIds.includes(slot.token.id) ? { ...slot, token: null } : slot
      ),
    };
    const rewards =
      choice.tradeCount === 1
        ? [makeEffectToken(player.id, "black", 1, "purple-trade")]
        : choice.tradeCount === 2
          ? [
              makeEffectToken(player.id, "green", 1, "purple-trade"),
              makeEffectToken(player.id, "blue", 2, "purple-trade"),
            ]
          : [makeEffectToken(player.id, "yellow", 4, "purple-trade")];

    return {
      ...player,
      crucible: {
        ...withoutTraded,
        dropletPosition: Math.min(
          withoutTraded.dropletPosition + (choice.tradeCount === 2 ? 1 : choice.tradeCount === 3 ? 2 : 0),
          32
        ),
      },
      score: player.score + (choice.tradeCount === 1 ? 1 : choice.tradeCount === 2 ? 3 : 6),
      rubies: player.rubies + (choice.tradeCount === 1 || choice.tradeCount === 3 ? 1 : 0),
      bag: { tokens: [...player.bag.tokens, ...rewards] },
    };
  }

  const hasToken = player.crucible.slots.some(
    (slot) => slot.token?.id === choice.tokenId && slot.token.value === choice.fromValue
  );
  if (!hasToken) return player;

  return {
    ...player,
    crucible: {
      ...player.crucible,
      slots: player.crucible.slots.map((slot) =>
        slot.token?.id === choice.tokenId ? { ...slot, token: null } : slot
      ),
    },
    bag: {
      tokens: [
        ...player.bag.tokens,
        makeEffectToken(player.id, choice.color, choice.toValue, "purple-upgrade"),
      ],
    },
  };
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
    const score = player.crucible.slots.reduce(
      (sum, slot) => {
        if (slot.token?.color !== "purple") return sum;
        if (slot.position >= 30) return sum + 3;
        if (slot.position >= 20) return sum + 2;
        if (slot.position >= 10) return sum + 1;
        return sum;
      },
      0
    );
    return { ...player, score: player.score + score };
  }

  const upgraded = player.bag.tokens.map((token) => {
    if (token.color !== "white") return token;
    if (token.value === 1) return { ...token, value: 2 };
    if (token.value === 2) return { ...token, value: 3 };
    return token;
  });
  return { ...player, bag: { tokens: upgraded } };
}
