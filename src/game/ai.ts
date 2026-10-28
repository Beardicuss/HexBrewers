import type { Player } from "./playerTypes";
import type { GameState } from "./gameState";
import type { MarketItem } from "./bazaarTypes";
import type { BuyPhaseState } from "./bazaarTypes";
import { AI_RISK_TUNING, buildAIContext, selectAIMode, getRiskTolerance, type AIMode } from "./aiStrategy";
import { remainingWhiteCapacity } from "./aiProbability";
import { decideMarketPurchases } from "./aiMarket";
import { getPlacedTokens, hasExploded, placeToken } from "./crucible";
import { canUseFlask, useFlask } from "./flask";
import type { ExplodedChoice } from "./scoring";
import type { RoundScoreResult } from "./scoring";
import { getExplosionThreshold } from "./crucible";
import { getRecipeSetForColor } from "./recipeBooks";
import type { PurpleChoice } from "./gameState";
import type { Token, TokenColor } from "./tokenTypes";
import { calculateRoundScore } from "./scoring";
import type { Crucible } from "./crucibleTypes";
import { chooseBlueKeep, placeTokenForActiveBooks } from "./brewingRules";
import { applyBlackMultiplayerBonus, applyBlackSetOneBonus, applyEndOfRoundEffects, applyPurpleChoice, purpleChoices } from "./chipEffects";
import { canRefillFlask } from "./rubyActions";

function activeExplosionThreshold(player: Player, state: GameState): number {
  const bookThreshold = getRecipeSetForColor(state.recipeBooks, "yellow") === 3
    ? getExplosionThreshold(player.crucible)
    : 7;
  return state.currentOmen?.effect.type === "round_explosion_threshold"
    ? Math.max(bookThreshold, state.currentOmen.effect.threshold)
    : bookThreshold;
}

export type BrewingDecision = "draw" | "stop";

function resolvedScoringCrucible(player: Player): Crucible {
  return (player.redReserve ?? []).reduce(
    (crucible, token) => placeToken(crucible, token, token.value),
    player.crucible
  );
}

function roundValue(crucible: Crucible, coinWeight: number, awardsBoth = false): number {
  const result = calculateRoundScore(crucible);
  const rubyValue = result.ruby ? 1.5 : 0;
  if (result.exploded && awardsBoth) return result.vp + result.coins * coinWeight + rubyValue;
  return result.exploded
    ? Math.max(result.vp, result.coins * coinWeight) + rubyValue
    : result.vp + result.coins * coinWeight + rubyValue;
}

function bagQuality(player: Player): number {
  return player.bag.tokens.reduce((total, token) =>
    total + (token.color === "white" ? -token.value * 0.12 : token.value * 0.2), 0);
}

function projectedEndEffectPlayer(player: Player, state: GameState): Player {
  const purpleSet = getRecipeSetForColor(state.recipeBooks, "purple");
  let projected = applyEndOfRoundEffects(player, undefined, state.recipeBooks, {
    autoPurple: purpleSet === 3 || purpleSet === 5 || purpleSet === 6,
  });
  const purpleChoice = decidePurpleChoice(purpleChoices(projected, state.recipeBooks), projected, state);
  if (purpleChoice) projected = applyPurpleChoice(projected, purpleChoice);

  const seat = state.players.findIndex((candidate) => candidate.id === player.id);
  if (seat < 0 || state.players.length < 2) return projected;
  if (state.players.length === 2) {
    return applyBlackSetOneBonus(projected, state.players[(seat + 1) % 2]);
  }
  const left = state.players[(seat - 1 + state.players.length) % state.players.length];
  const right = state.players[(seat + 1) % state.players.length];
  return applyBlackMultiplayerBonus(projected, left, right);
}

function stoppingValue(player: Player, state: GameState, coinWeight: number, awardsBoth = false): number {
  const scoringPlayer = { ...player, crucible: resolvedScoringCrucible(player) };
  const result = calculateRoundScore(scoringPlayer.crucible);
  let value = roundValue(scoringPlayer.crucible, coinWeight, awardsBoth);

  const afterEffects = projectedEndEffectPlayer(scoringPlayer, state);
  value += afterEffects.score - scoringPlayer.score;
  value += (afterEffects.rubies - scoringPlayer.rubies) * 1.5;
  value += (afterEffects.crucible.dropletPosition - scoringPlayer.crucible.dropletPosition) * 1.1;
  value += bagQuality(afterEffects) - bagQuality(scoringPlayer);

  if (!result.exploded) {
    const bestOpponentSpace = Math.max(
      -1,
      ...state.players
        .filter((candidate) => candidate.id !== player.id)
        .map((candidate) => {
          const opponentResult = calculateRoundScore(resolvedScoringCrucible(candidate));
          return opponentResult.exploded ? -1 : opponentResult.space;
        }),
    );
    if (result.space >= bestOpponentSpace) value += 1.25;
  }
  return value;
}

function withoutBagToken(player: Player, tokenId: string): Player {
  let removed = false;
  return {
    ...player,
    bag: {
      tokens: player.bag.tokens.filter((token) => {
        if (!removed && token.id === tokenId) {
          removed = true;
          return false;
        }
        return true;
      }),
    },
  };
}

function groupedBagTokens(player: Player): Array<{ token: Player["bag"]["tokens"][number]; count: number }> {
  const groups = new Map<string, { token: Player["bag"]["tokens"][number]; count: number }>();
  for (const token of player.bag.tokens) {
    const key = `${token.color}:${token.value}`;
    const current = groups.get(key);
    if (current) current.count += 1;
    else groups.set(key, { token, count: 1 });
  }
  return [...groups.values()];
}

function masterBranchValue(player: Player, state: GameState, depth: number, coinWeight: number): number {
  const stop = stoppingValue(player, state, coinWeight, player.blueBonusExplosion);
  if (depth <= 0 || player.bag.tokens.length === 0 || player.crucible.exploded) return stop;

  const totalTokens = player.bag.tokens.length;
  const expectedDraw = groupedBagTokens(player).reduce((expected, group) => {
    const drawnFromBag = withoutBagToken(player, group.token.id);
    const projected = placeTokenForActiveBooks(drawnFromBag, group.token, state);
    const protectedExplosion = projected.crucible.exploded && projected.blueBonusExplosion;
    const terminal = projected.crucible.exploded
      ? stoppingValue(projected, state, coinWeight, protectedExplosion)
      : masterBranchValue(projected, state, depth - 1, coinWeight);
    const ingredientValue = group.token.color === "white" || group.token.color === "orange" ? 0 : 0.2;
    return expected + (group.count / totalTokens) * (terminal + ingredientValue);
  }, 0);

  return Math.max(stop, expectedDraw);
}

export function evaluateMasterLookahead(player: Player, state: GameState, depth = 3): number {
  const context = buildAIContext(state, player);
  const coinWeight = context.isLastThreeRounds ? 0.18 : 0.34;
  if (player.bag.tokens.length === 0) return stoppingValue(player, state, coinWeight);

  const totalTokens = player.bag.tokens.length;
  return groupedBagTokens(player).reduce((expected, group) => {
    const drawnFromBag = withoutBagToken(player, group.token.id);
    const projected = placeTokenForActiveBooks(drawnFromBag, group.token, state);
    const protectedExplosion = projected.crucible.exploded && projected.blueBonusExplosion;
    const outcome = projected.crucible.exploded
      ? stoppingValue(projected, state, coinWeight, protectedExplosion)
      : masterBranchValue(projected, state, Math.max(0, depth - 1), coinWeight);
    const ingredientValue = group.token.color === "white" || group.token.color === "orange" ? 0 : 0.2;
    return expected + (group.count / totalTokens) * (outcome + ingredientValue);
  }, 0);
}

export function decideBlueKeep(tokens: Token[], player: Player, state: GameState): Token | null {
  if (state.aiDifficulty !== "master") return chooseBlueKeep(tokens, player, state);
  if (tokens.length === 0) return null;
  const context = buildAIContext(state, player);
  const coinWeight = context.isLastThreeRounds ? 0.18 : 0.34;
  const sampledIds = new Set(tokens.map((token) => token.id));
  const unsampled = player.bag.tokens.filter((token) => !sampledIds.has(token.id));
  const returnedAll = { ...player, bag: { tokens: [...unsampled, ...tokens] } };
  const noneValue = masterBranchValue(returnedAll, state, 2, coinWeight);

  const candidates = tokens.map((token) => {
    const returned = tokens.filter((candidate) => candidate.id !== token.id);
    const prepared = { ...player, bag: { tokens: [...unsampled, ...returned] } };
    const projected = placeTokenForActiveBooks(prepared, token, state);
    return { token, value: masterBranchValue(projected, state, 2, coinWeight) };
  }).sort((a, b) => b.value - a.value);

  return candidates[0]?.value > noneValue + 0.05 ? candidates[0].token : null;
}

export function evaluateBrewingDecision(player: Player, state: GameState): { stop: number; draw: number; risk: number } {
  const context = buildAIContext(state, player);
  const mode = selectAIMode(context);
  const coinWeight = context.isLastThreeRounds ? 0.18 : 0.34;
  const stop = context.difficulty === "master"
    ? stoppingValue(player, state, coinWeight)
    : roundValue(resolvedScoringCrucible(player), coinWeight);

  const projections = player.bag.tokens.map((token) => {
    const projected = placeTokenForActiveBooks(player, token, state);
    return {
      token,
      crucible: resolvedScoringCrucible(projected),
      unprotectedExplosion: projected.crucible.exploded && !projected.blueBonusExplosion,
      protectedExplosion: projected.crucible.exploded && projected.blueBonusExplosion,
    };
  });
  const risk = projections.filter((projection) => projection.unprotectedExplosion).length /
    Math.max(1, projections.length);

  const outcomeTotal = projections.reduce((total, { token, crucible, protectedExplosion }) => {
    const ingredientValue = token.color === "white" || token.color === "orange" ? 0 : 0.2;
    const blueValue = token.color === "blue" && getRecipeSetForColor(state.recipeBooks, "blue") === 1
      ? token.value * 0.15
      : 0;
    const projectedValue = context.difficulty === "master"
      ? stoppingValue({ ...player, crucible }, state, coinWeight, protectedExplosion)
      : roundValue(crucible, coinWeight, protectedExplosion);
    return total + projectedValue + ingredientValue + blueValue;
  }, 0);

  const averageOutcome = outcomeTotal / Math.max(1, player.bag.tokens.length);
  const riskPenalty = risk * AI_RISK_TUNING[mode].riskPenalty;
  const comebackBias = context.scoreDelta < -10 ? 0.35 : context.scoreDelta > 20 ? -0.25 : 0;
  const draw = context.difficulty === "master"
    ? evaluateMasterLookahead(player, state) - risk * 0.6 + comebackBias
    : averageOutcome - riskPenalty + comebackBias;
  return { stop, draw, risk };
}

export function decideBrewingAction(player: Player, state: GameState): BrewingDecision {
  const { crucible, bag } = player;
  if (hasExploded(crucible)) return "stop";
  if (bag.tokens.length === 0) return "stop";
  if (!crucible.overflowEnabled && crucible.filledUpTo >= 33) return "stop";
  const wouldCertainlyExplode = bag.tokens.every((token) => {
    const projected = placeTokenForActiveBooks(player, token, state);
    return projected.crucible.exploded && !projected.blueBonusExplosion;
  });
  if (wouldCertainlyExplode) return "stop";

  const context = buildAIContext(state, player);
  const mode = selectAIMode(context);
  const tolerance = getRiskTolerance(mode, context.profile);
  const utility = evaluateBrewingDecision(player, state);
  if (utility.risk > tolerance) return "stop";
  const improvementRequired = AI_RISK_TUNING[mode].improvementRequired;
  return utility.draw >= utility.stop + improvementRequired ? "draw" : "stop";
}

// Flask: AI can only use on last drawn white token (same rule as human)
export function decideFlaskUse(player: Player, state: GameState): boolean {
  if (!canUseFlask(player)) return false;

  const token = player.crucible.lastDrawnToken;
  if (!token || token.color !== "white") return false;

  const context = buildAIContext(state, player);
  const mode = selectAIMode(context);
  const capacityAfterDraw = remainingWhiteCapacity(
    player.crucible,
    activeExplosionThreshold(player, state)
  );

  if (player.crucible.exploded) return false; // can't use if it caused explosion

  if (context.difficulty === "master") {
    const coinWeight = context.isLastThreeRounds ? 0.18 : 0.34;
    const keepValue = masterBranchValue(player, state, 2, coinWeight);
    const flaskValue = masterBranchValue(useFlask(player), state, 2, coinWeight);
    return flaskValue > keepValue + 0.15;
  }

  if (mode === "calculated" && capacityAfterDraw <= 1 && context.round <= 6) return true;
  if (mode === "conservative" && capacityAfterDraw <= 2) return true;

  return false;
}

export type AIRubyAction = "hold" | "flask" | "droplet";

export function decideAIRubyAction(player: Player, state: GameState): AIRubyAction {
  if (player.rubies < 2) return "hold";
  if (state.aiDifficulty === "master" && state.currentRound === state.totalRounds) return "hold";
  const whiteCount = player.bag.tokens.filter((token) => token.color === "white").length;
  if (!player.flask && canRefillFlask(player) && (state.aiDifficulty !== "master" || whiteCount >= 3 || state.currentRound >= state.totalRounds - 1)) {
    return "flask";
  }
  if (player.crucible.dropletPosition < 32) return "droplet";
  if (!player.flask && canRefillFlask(player)) return "flask";
  return "hold";
}

// Selects from the exact same legal Purple choices presented to the human.
// The policy is intentionally simple; rule resolution remains shared.
export function decidePurpleChoice(choices: PurpleChoice[], player?: Player, state?: GameState): PurpleChoice | null {
  const legal = choices.filter((choice) => choice.kind !== "skip");
  if (legal.length === 0) return choices.find((choice) => choice.kind === "skip") ?? null;

  if (player && state?.aiDifficulty === "master") {
    const value = (choice: PurpleChoice): number => {
      const resolved = applyPurpleChoice(player, choice);
      const addedBagValue = bagQuality(resolved) - bagQuality(player);
      return (resolved.score - player.score) * 2
        + (resolved.rubies - player.rubies) * 1.5
        + (resolved.crucible.dropletPosition - player.crucible.dropletPosition) * 1.1
        + addedBagValue;
    };
    return [...legal].sort((a, b) => value(b) - value(a))[0];
  }

  return [...legal].sort((a, b) => {
    const value = (choice: PurpleChoice): number => {
      if (choice.kind === "set1") return choice.level;
      if (choice.kind === "set2") return choice.tradeCount * 10;
      if (choice.kind === "set4") return choice.toValue - choice.fromValue;
      return 0;
    };
    return value(b) - value(a);
  })[0];
}

export function decideGreenRewardChoice(
  player: Player,
  options: Array<{ color: TokenColor; value: number }>,
  state: GameState,
): { color: TokenColor; value: number } | null {
  if (options.length === 0) return null;
  if (state.aiDifficulty !== "master") return options[0];
  const count = (color: TokenColor) => player.bag.tokens.filter((token) => token.color === color).length
    + getPlacedTokens(player.crucible).filter((token) => token.color === color).length;
  const value = (option: { color: TokenColor; value: number }) => {
    let score = option.value * 1.4;
    if (option.color === "blue") score += option.value >= 2 ? 1.6 : 0.8;
    if (option.color === "red") score += Math.min(2, count("orange") * 0.5);
    if (option.color === "yellow") score += Math.min(1.5, count("white") * 0.15);
    if (option.color === "purple") score += 1 + Math.min(2, count("purple") * 0.6);
    const stock = state.market.find((item) => item.token.color === option.color && item.token.value === option.value)?.stock ?? 0;
    if (stock <= 2) score += 0.5;
    return score;
  };
  return [...options].sort((a, b) => value(b) - value(a))[0];
}

export function decideExplodedChoice(
  player: Player,
  result: RoundScoreResult,
  state: GameState
): ExplodedChoice {
  const context = buildAIContext(state, player);
  if (context.scoreDelta < -5) return "vp";
  if (player.rubies < 2 && player.coinsThisRound < 4) return "coins";
  if (context.isLastThreeRounds) return "vp";
  return "coins";
}

export function decideMarketTurn(
  player: Player,
  market: MarketItem[],
  state: GameState
): string[] {
  const context = buildAIContext(state, player);
  const mode = selectAIMode(context);
  const buyState: BuyPhaseState = {
    purchases: [],
    coinsSpent: 0,
    coinsAvailable: player.coinsThisRound,
  };
  return decideMarketPurchases(player, market, mode, buyState, state.currentRound, state);
}
