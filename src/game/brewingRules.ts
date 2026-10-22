import type { GameState } from "./gameState";
import type { Player } from "./playerTypes";
import type { Token } from "./tokenTypes";
import { applyBlueImmediate, applyYellowImmediate, countPlacedColor, redBonusValue } from "./chipEffects";
import { getExplosionThreshold, placeToken } from "./crucible";
import { getRecipeSetForColor } from "./recipeBooks";

export interface PlaceTokenOptions {
  deferYellowChoice?: boolean;
  useRedSetThreeBonus?: boolean;
  useYellowSetFourBonus?: boolean;
}

export function echoMovementValue(player: Player, state: GameState): number {
  if (state.setup.echoRecipe === "retort_resonance") {
    return Math.max(1, Math.min(4, player.affliction?.lastProgress ?? 0));
  }
  if (state.setup.echoRecipe === "deep_resonance") {
    return Math.max(1, Math.min(4, 1 + Math.floor((player.affliction?.totalDistillate ?? 0) / 5)));
  }
  return Math.max(1, Math.min(4, player.ratStoneOffset + 1));
}

export function movementForToken(player: Player, token: Token, state: GameState, options: PlaceTokenOptions = {}): number {
  let movement = token.color === "echo"
    ? (token.resolvedMovement ?? echoMovementValue(player, state))
    : token.value;
  if (token.color === "red" && options.useRedSetThreeBonus !== false) movement += redBonusValue(player.crucible, state.recipeBooks);
  if (token.color === "orange" && state.currentOmen?.effect.type === "orange_extra_movement") {
    movement += state.currentOmen.effect.amount;
  }
  if (
    token.color === "white" &&
    token.value === 1 &&
    getRecipeSetForColor(state.recipeBooks, "red") === 4 &&
    countPlacedColor(player.crucible, "red") > 0
  ) movement += 1;
  if (player.yellowDoubleNext) movement *= 2;
  if (token.color === "yellow" && getRecipeSetForColor(state.recipeBooks, "yellow") === 4 && options.useYellowSetFourBonus !== false) {
    const yellowIndex = countPlacedColor(player.crucible, "yellow") + 1;
    movement += yellowIndex <= 3 ? yellowIndex : 0;
  }
  return movement;
}

// The caller removes the drawn token from the bag before invoking this resolver.
// Keeping bag mutation outside makes the rule usable by normal and blue-bonus draws.
export function placeTokenForActiveBooks(
  player: Player,
  token: Token,
  state: GameState,
  options: PlaceTokenOptions = {}
): Player {
  if (
    token.color === "white" &&
    state.currentOmen?.effect.type === "return_first_white" &&
    !player.omenFirstWhiteReturned
  ) {
    return {
      ...player,
      omenFirstWhiteReturned: true,
      bag: { tokens: [...player.bag.tokens, token] },
    };
  }

  if (token.color === "red" && getRecipeSetForColor(state.recipeBooks, "red") === 2) {
    return { ...player, redReserve: [...(player.redReserve ?? []), token] };
  }

  const previousToken = player.crucible.lastDrawnToken;
  const entersOverflow = player.crucible.overflowEnabled && player.crucible.filledUpTo >= 33;
  const bookThreshold = getRecipeSetForColor(state.recipeBooks, "yellow") === 3
    ? getExplosionThreshold(player.crucible)
    : 7;
  const threshold = state.currentOmen?.effect.type === "round_explosion_threshold"
    ? Math.max(bookThreshold, state.currentOmen.effect.threshold)
    : bookThreshold;
  const movement = movementForToken(player, token, state, options);
  const placedToken = token.color === "echo" ? { ...token, resolvedMovement: movement } : token;
  let updated: Player = {
    ...player,
    yellowDoubleNext: false,
    crucible: placeToken(player.crucible, placedToken, movement, threshold),
  };

  if (updated.crucible.exploded && (updated.blueProtectionDraws ?? 0) > 0) {
    updated = { ...updated, blueProtectionDraws: 0, blueBonusExplosion: true };
  } else if ((updated.blueProtectionDraws ?? 0) > 0) {
    updated = { ...updated, blueProtectionDraws: Math.max(0, (updated.blueProtectionDraws ?? 0) - 1) };
  }
  if (token.color === "yellow" && !options.deferYellowChoice && !entersOverflow) {
    updated = applyYellowImmediate(updated, previousToken, state.recipeBooks);
  }
  if (token.color === "blue" && !entersOverflow && updated.crucible.filledUpTo < 33) {
    updated = applyBlueImmediate(updated, token, state.recipeBooks);
  }
  return updated;
}

export function chooseBlueKeep(tokens: Token[], player: Player, state: GameState): Token | null {
  const bookThreshold = getRecipeSetForColor(state.recipeBooks, "yellow") === 3
    ? getExplosionThreshold(player.crucible)
    : 7;
  const threshold = state.currentOmen?.effect.type === "round_explosion_threshold"
    ? Math.max(bookThreshold, state.currentOmen.effect.threshold)
    : bookThreshold;
  const capacity = threshold - player.crucible.whiteSum;
  const colorValue = { white: -2, orange: 1, green: 2, red: 2.5, yellow: 2.25, purple: 3, black: 3, blue: 2, echo: 2.5 };
  return tokens
    .map((token) => ({
      token,
      score: token.color === "white" && token.value > capacity
        ? -100
        : movementForToken(player, token, state) + colorValue[token.color],
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)[0]?.token ?? null;
}
