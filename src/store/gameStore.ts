import { create } from "zustand";
import type { GameState, GamePhase, GreenRewardChoice, OmenChoice } from "../game/gameState";
import type { Player } from "../game/playerTypes";
import type { Token, TokenColor } from "../game/tokenTypes";
import type { ExplodedChoice } from "../game/scoring";
import type { BuyPhaseState } from "../game/bazaarTypes";
import { soundManager } from "../SoundManager";

import { moveLastPlacedTokenExtra, placeToken } from "../game/crucible";
import { drawToken } from "../game/bag";
import { applyRoundReward, calculateRoundScore } from "../game/scoring";
import { canUseFlask, useFlask } from "../game/flask";
import { purchaseItem } from "../game/bazaar";
import { applyRatStones } from "../game/ratTail";
import { drawBlueBonus, applyEndOfRoundEffects, applyYellowSetOneBonus, greenSetFourSpendMax, applyGreenSetFourSpend, greenSetThreeMoveAmount, applyGreenSetThreeMove, greenSetTwoRewards, purpleChoices, applyPurpleChoice, applyBlackSetOneBonus, applyBlackMultiplayerBonus } from "../game/chipEffects";
import { applyBonusDieResult, rollBonusDie } from "../game/bonusDie";
import { spendRubiesForDroplet, spendRubiesForFlask, canAdvanceDroplet, canRefillFlask } from "../game/rubyActions";
import { decideAIRubyAction, decideExplodedChoice, decideGreenRewardChoice, decideMarketTurn, decidePurpleChoice } from "../game/ai";
import { getRecipeSetForColor } from "../game/recipeBooks";

import { updatePlayer, getPlayer, createInitialState, createInitialStateWithSetup } from "./gameStoreHelpers";
import { advanceToNextRound } from "./gameStoreRound";
import type { RecipeMode } from "../game/recipeBooks";
import type { AIDifficulty } from "../game/aiStrategy";
import type { GameSetup } from "../game/contentPacks";
import { placeTokenForActiveBooks } from "../game/brewingRules";
import { applyOmenScoringEffect, applyOmenStartEffect, rubyRewardForResult } from "../game/omenResolver";
import { restartBrew, shouldOfferSecondChance } from "../game/omenSecondChance";
import { applyPurpleChoiceStock, legalPurpleChoices } from "../game/purpleMarket";
import type { MarketItem } from "../game/bazaarTypes";
import { clearSavedGame, saveGameState } from "./gameSave";
import type { CovenantKind, CovenantSelection } from "../game/covenants";
import { canUseCovenant, covenantMarketCoinBonus, DEFAULT_COVENANTS, isValidCovenantSelection, prepareAICovenantForMarket, restoreAIFlaskWithCovenant, useCovenant } from "../game/covenants";
import type { AfflictionId } from "../game/distillation";
import { chooseAIAffliction, createAfflictionState, resolveDistillationRound } from "../game/distillation";

function makeFreeOrangeToken(playerId: string): Token {
  return makeFreeToken(playerId, "orange", 1, "bonus");
}

function makeFreeToken(playerId: string, color: TokenColor, value: number, source: string): Token {
  return {
    id: `${color}-${value}-${source}-${playerId}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    color,
    value,
  };
}

function scoringMarketState(player: Player): BuyPhaseState {
  return {
    purchases: [],
    coinsSpent: 0,
    coinsAvailable: player.coinsThisRound,
  };
}

function applyBonusDieReward(player: Player, rolls = 1): { player: Player; result: ReturnType<typeof rollBonusDie> } {
  let updated = player;
  let result = rollBonusDie();
  for (let roll = 0; roll < rolls; roll += 1) {
    if (roll > 0) result = rollBonusDie();
    updated = applyBonusDieResult(updated, result, makeFreeOrangeToken(player.id));
  }
  return { result, player: updated };
}

function spendAIRubies(player: Player, state: GameState): Player {
  let current = player;
  while (current.rubies >= 2) {
    const action = decideAIRubyAction(current, state);
    if (action === "flask") {
      current = spendRubiesForFlask(current);
    } else if (action === "droplet" && canAdvanceDroplet(current)) {
      current = spendRubiesForDroplet(current);
    } else {
      break;
    }
  }
  return current;
}

function playersInStartingOrder(state: GameState): Player[] {
  return state.players.map((_, offset) =>
    state.players[(state.activePlayerIndex + offset) % state.players.length]
  );
}

function resolveAIPurpleQueue(state: GameState, playerIds: string[]): GameState {
  let updated = state;
  for (const playerId of playerIds) {
    const player = getPlayer(updated, playerId);
    const choices = legalPurpleChoices(updated.market, purpleChoices(player, updated.recipeBooks));
    const choice = decidePurpleChoice(choices, player, updated);
    if (!choice) continue;
    updated = updatePlayer(updated, playerId, (current) => applyPurpleChoice(current, choice));
    updated = {
      ...updated,
      market: applyPurpleChoiceStock(updated.market, choice, updated.currentRound),
    };
  }
  return updated;
}

function availableGreenRewards(rewards: GreenRewardChoice[], market: MarketItem[]): GreenRewardChoice[] {
  return rewards
    .map((reward) => ({
      ...reward,
      options: reward.options.filter((option) => market.some((item) =>
        item.token.color === option.color && item.token.value === option.value && item.stock > 0
      )),
    }))
    .filter((reward) => reward.options.length > 0);
}

function takeGreenReward(
  player: Player,
  market: MarketItem[],
  choice: { color: TokenColor; value: number },
  currentRound: number,
): { player: Player; market: MarketItem[] } | null {
  const item = market.find((candidate) =>
    candidate.token.color === choice.color && candidate.token.value === choice.value && candidate.stock > 0
  );
  if (!item) return null;
  const token = makeFreeToken(player.id, choice.color, choice.value, "green-reward");
  return {
    player: { ...player, bag: { tokens: [...player.bag.tokens, token] } },
    market: market.map((candidate) => {
      if (candidate.id !== item.id) return candidate;
      const stock = candidate.stock - 1;
      return { ...candidate, stock, available: stock > 0 && candidate.unlockRound <= currentRound };
    }),
  };
}

function resolveAIGreenQueue(state: GameState, playerIds: string[]): GameState {
  let updated = state;
  for (const playerId of playerIds) {
    let player = getPlayer(updated, playerId);
    for (const reward of greenSetTwoRewards(player, updated.recipeBooks)) {
      const available = availableGreenRewards([reward], updated.market)[0];
      if (!available) continue;
      const choice = decideGreenRewardChoice(player, available.options, updated);
      if (!choice) continue;
      const result = takeGreenReward(player, updated.market, choice, updated.currentRound);
      if (!result) continue;
      player = result.player;
      updated = { ...updatePlayer(updated, playerId, () => player), market: result.market };
    }
  }
  return updated;
}

function offerSecondChance(state: GameState, player: Player): GameState | null {
  return shouldOfferSecondChance(state, player)
    ? { ...updatePlayer(state, player.id, () => player), phase: "omen_restart_choice" }
    : null;
}

function sampleBagValue(player: Player, count: number): number {
  let bag = player.bag;
  let total = 0;
  for (let draw = 0; draw < count; draw += 1) {
    const sampled = drawToken(bag);
    if (!sampled) break;
    total += sampled.token.value;
    bag = sampled.bag;
  }
  return total;
}

function drawSample(player: Player, count: number): { player: Player; tokens: Token[] } {
  let bag = player.bag;
  const tokens: Token[] = [];
  for (let draw = 0; draw < count; draw += 1) {
    const sampled = drawToken(bag);
    if (!sampled) break;
    tokens.push(sampled.token);
    bag = sampled.bag;
  }
  return { player: { ...player, bag }, tokens };
}

function prepareStrongIngredientChoice(state: GameState, player: Player): GameState {
  const sample = drawSample(player, 5);
  if (sample.tokens.length === 0) return { ...state, phase: "end_of_round" };
  return {
    ...updatePlayer(state, player.id, () => sample.player),
    phase: "omen_strong_choice",
    pendingOmenSampleTokens: sample.tokens,
  };
}

function resolveAIStrongIngredient(player: Player): Player {
  if (player.crucible.exploded) return player;
  const sample = drawSample(player, 5);
  if (sample.tokens.length === 0) return player;
  const candidates = sample.tokens.map((token) => ({
    token,
    crucible: placeToken(sample.player.crucible, token, token.value),
  }));
  const safe = candidates.filter((candidate) => !candidate.crucible.exploded);
  const selected = [...safe].sort((a, b) => b.crucible.filledUpTo - a.crucible.filledUpTo)[0];
  return {
    ...sample.player,
    crucible: selected?.crucible ?? sample.player.crucible,
    bag: {
      tokens: [
        ...sample.player.bag.tokens,
        ...sample.tokens.filter((token) => token.id !== selected?.token.id),
      ],
    },
  };
}

function resolveFiveChipSample(state: GameState): GameState {
  const totals = new Map(state.players.map((player) => [player.id, sampleBagValue(player, 5)]));
  const minimum = Math.min(...totals.values());
  const winnerIds = new Set(
    state.players.filter((player) => totals.get(player.id) === minimum).map((player) => player.id),
  );
  let updated = state;

  // Resolve rewards in starting-player order because the Frostbile supply is finite.
  for (const orderedPlayer of playersInStartingOrder(state)) {
    const player = getPlayer(updated, orderedPlayer.id);
    if (!winnerIds.has(player.id)) {
      updated = updatePlayer(updated, player.id, (current) => ({ ...current, rubies: current.rubies + 1 }));
      continue;
    }
    const item = updated.market.find((entry) => entry.token.color === "blue" && entry.token.value === 2);
    if (!item || item.stock <= 0) continue;
    updated = updatePlayer(updated, player.id, (current) => ({
      ...current,
      bag: {
        tokens: [...current.bag.tokens, makeFreeToken(current.id, "blue", 2, state.currentOmen?.id ?? "omen")],
      },
    }));
    updated = {
      ...updated,
      market: updated.market.map((entry) => entry.id === item.id
        ? { ...entry, stock: entry.stock - 1, available: entry.stock - 1 > 0 }
        : entry),
    };
  }
  return updated;
}

function omenChoicesForPlayer(state: GameState, player: Player): OmenChoice[] {
  const effect = state.currentOmen?.effect;
  if (!effect) return [];

  if (effect.type === "choice_beginner_boost") {
    const choices: OmenChoice[] = [{ id: "omen-vp-4", kind: "gain_vp", amount: 4 }];
    if (player.bag.tokens.some((token) => token.color === "white" && token.value === 1)) {
      choices.push({ id: "omen-remove-white-1", kind: "remove_white_one" });
    }
    return choices;
  }

  if (effect.type === "choice_bounty") {
    const chipChoices = state.market
      .filter((item) =>
        item.stock > 0 &&
        item.available &&
        item.unlockRound <= state.currentRound &&
        (item.token.color === "black" || item.token.value === 2)
      )
      .map<OmenChoice>((item) => ({
        id: `omen-chip-${item.id}`,
        kind: "gain_market_chip",
        itemId: item.id,
        color: item.token.color,
        value: item.token.value,
      }));
    return [...chipChoices, { id: "omen-rubies-3", kind: "gain_rubies", amount: 3 }];
  }

  if (effect.type === "choice_droplet_or_purple") {
    const choices: OmenChoice[] = [{ id: "omen-droplet-2", kind: "advance_droplet", amount: 2 }];
    const purple = state.market.find((item) =>
      item.token.color === "purple" && item.stock > 0 && item.available && item.unlockRound <= state.currentRound
    );
    if (purple) {
      choices.push({
        id: `omen-chip-${purple.id}`,
        kind: "gain_market_chip",
        itemId: purple.id,
        color: purple.token.color,
        value: purple.token.value,
      });
    }
    return choices;
  }

  if (effect.type === "choice_ruby_for_one") {
    const choices: OmenChoice[] = [{ id: "omen-keep-ruby", kind: "skip" }];
    if (player.rubies < 1) return choices;
    return [
      ...state.market
        .filter((item) =>
          item.stock > 0 && item.available && item.unlockRound <= state.currentRound &&
          item.token.value === 1 && item.token.color !== "purple" && item.token.color !== "black"
        )
        .map<OmenChoice>((item) => ({
          id: `omen-trade-${item.id}`,
          kind: "trade_ruby_for_market_chip",
          itemId: item.id,
          color: item.token.color,
          value: item.token.value,
        })),
      ...choices,
    ];
  }

  if (effect.type === "choice_rat_tails_for_rubies") {
    const maximum = Math.min(3, player.ratStoneOffset);
    if (maximum === 0) return [];
    const choices: OmenChoice[] = [{ id: "omen-keep-rat-tails", kind: "skip" }];
    for (let amount = 1; amount <= maximum; amount += 1) {
      choices.push({
        id: `omen-trade-rat-tails-${amount}`,
        kind: "trade_rat_tails_for_rubies",
        amount: amount as 1 | 2 | 3,
      });
    }
    return choices;
  }

  if (effect.type === "choice_rat_reward") {
    const chipChoices = state.market
      .filter((item) =>
        item.stock > 0 && item.available && item.unlockRound <= state.currentRound && item.token.value === 4
      )
      .map<OmenChoice>((item) => ({
        id: `omen-chip-${item.id}`,
        kind: "gain_market_chip",
        itemId: item.id,
        color: item.token.color,
        value: item.token.value,
      }));
    return [
      ...chipChoices,
      { id: "omen-rat-prestige", kind: "gain_vp", amount: player.ratStoneOffset },
    ];
  }

  return [];
}

function applyOmenChoice(state: GameState, playerId: string, choice: OmenChoice): GameState {
  const player = state.players.find((candidate) => candidate.id === playerId);
  if (!player) return state;
  let updatedPlayer = player;
  let market = state.market;

  if (choice.kind === "gain_vp") updatedPlayer = { ...player, score: player.score + choice.amount };
  if (choice.kind === "gain_rubies") updatedPlayer = { ...player, rubies: player.rubies + choice.amount };
  if (choice.kind === "advance_droplet") {
    updatedPlayer = {
      ...player,
      crucible: {
        ...player.crucible,
        dropletPosition: Math.min(32, player.crucible.dropletPosition + choice.amount),
        filledUpTo: Math.min(33, player.crucible.filledUpTo + choice.amount),
      },
    };
  }
  if (choice.kind === "remove_white_one") {
    const index = player.bag.tokens.findIndex((token) => token.color === "white" && token.value === 1);
    if (index >= 0) {
      updatedPlayer = {
        ...player,
        bag: { tokens: player.bag.tokens.filter((_, tokenIndex) => tokenIndex !== index) },
      };
    }
  }
  if (choice.kind === "skip") {
    // Choosing no reward is still a completed Omen decision.
  }
  if (choice.kind === "trade_rat_tails_for_rubies") {
    if (player.ratStoneOffset < choice.amount) return state;
    updatedPlayer = {
      ...player,
      rubies: player.rubies + choice.amount,
      ratStoneOffset: player.ratStoneOffset - choice.amount,
      crucible: {
        ...player.crucible,
        filledUpTo: Math.max(
          player.crucible.dropletPosition,
          player.crucible.filledUpTo - choice.amount,
        ),
      },
    };
  }
  if (choice.kind === "gain_market_chip" || choice.kind === "trade_ruby_for_market_chip") {
    const item = market.find((candidate) => candidate.id === choice.itemId);
    const rubyCost = choice.kind === "trade_ruby_for_market_chip" ? 1 : 0;
    if (!item || item.stock <= 0 || !item.available || player.rubies < rubyCost) return state;
    updatedPlayer = {
      ...player,
      rubies: player.rubies - rubyCost,
      bag: {
        tokens: [
          ...player.bag.tokens,
          makeFreeToken(player.id, choice.color, choice.value, state.currentOmen?.id ?? "omen"),
        ],
      },
    };
    market = market.map((candidate) => candidate.id === item.id
      ? { ...candidate, stock: candidate.stock - 1, available: candidate.stock - 1 > 0 }
      : candidate
    );
  }

  return {
    ...updatePlayer(state, playerId, () => updatedPlayer),
    market,
    omenCompletedPlayerIds: [...new Set([...state.omenCompletedPlayerIds, playerId])],
  };
}

function resolveAIChoice(state: GameState, player: Player): GameState {
  const choices = omenChoicesForPlayer(state, player);
  if (choices.length === 0) return { ...state, omenCompletedPlayerIds: [...new Set([...state.omenCompletedPlayerIds, player.id])] };
  let selected = choices[0];
  if (state.currentOmen?.effect.type === "choice_beginner_boost") {
    selected = state.currentRound <= 5
      ? choices.find((choice) => choice.kind === "remove_white_one") ?? choices[0]
      : choices.find((choice) => choice.kind === "gain_vp") ?? choices[0];
  } else if (state.currentOmen?.effect.type === "choice_bounty") {
    selected = [...choices].sort((a, b) => {
      const value = (choice: OmenChoice) => choice.kind === "gain_market_chip" ? choice.value * 4 : choice.kind === "gain_rubies" ? choice.amount : 0;
      return value(b) - value(a);
    })[0];
  } else if (state.currentOmen?.effect.type === "choice_droplet_or_purple" && state.currentRound >= 7) {
    selected = choices.find((choice) => choice.kind === "advance_droplet") ?? choices[0];
  } else if (state.currentOmen?.effect.type === "choice_ruby_for_one") {
    const preferredColors: TokenColor[] = ["blue", "red", "green", "yellow", "orange"];
    selected = preferredColors
      .map((color) => choices.find((choice) => choice.kind === "trade_ruby_for_market_chip" && choice.color === color))
      .find((choice): choice is OmenChoice => Boolean(choice))
      ?? choices.find((choice) => choice.kind === "skip")
      ?? choices[0];
  } else if (state.currentOmen?.effect.type === "choice_rat_tails_for_rubies") {
    // Preserve catch-up distance unless exchanging one tail immediately enables a
    // two-ruby action or the AI has a very large catch-up bonus to spare.
    const desired = (!player.flask && player.rubies === 1)
      ? 1
      : player.ratStoneOffset >= 5
        ? Math.min(3, player.ratStoneOffset - 3)
        : 0;
    selected = choices.find((choice) =>
      choice.kind === "trade_rat_tails_for_rubies" && choice.amount === desired
    ) ?? choices.find((choice) => choice.kind === "skip") ?? choices[0];
  } else if (state.currentOmen?.effect.type === "choice_rat_reward") {
    const prestige = choices.find((choice) => choice.kind === "gain_vp");
    const bestChip = choices.find((choice) => choice.kind === "gain_market_chip" && choice.color === "blue")
      ?? choices.find((choice) => choice.kind === "gain_market_chip" && choice.color === "red")
      ?? choices.find((choice) => choice.kind === "gain_market_chip");
    selected = prestige?.kind === "gain_vp" && prestige.amount >= 4
      ? prestige
      : bestChip ?? prestige ?? choices[0];
  }
  return applyOmenChoice(state, player.id, selected);
}

function valueTwoRewardChoices(state: GameState): OmenChoice[] {
  return state.market
    .filter((item) =>
      item.stock > 0 && item.available && item.unlockRound <= state.currentRound && item.token.value === 2
    )
    .map<OmenChoice>((item) => ({
      id: `omen-chip-${item.id}`,
      kind: "gain_market_chip",
      itemId: item.id,
      color: item.token.color,
      value: item.token.value,
    }));
}

function resolveOmenRewardQueue(
  state: GameState,
  playerIds: string[],
  phaseAfter: GamePhase,
): GameState {
  let updated = state;
  for (let index = 0; index < playerIds.length; index += 1) {
    const player = getPlayer(updated, playerIds[index]);
    const choices = valueTwoRewardChoices(updated);
    if (choices.length === 0) continue;
    if (player.kind === "human") {
      return {
        ...updated,
        phase: "omen_choice",
        pendingOmenChoices: choices,
        pendingOmenRewardPlayerIds: playerIds.slice(index + 1),
        phaseAfterOmenChoice: phaseAfter,
      };
    }
    const selected = choices.find((choice) => choice.kind === "gain_market_chip" && choice.color === "blue")
      ?? choices.find((choice) => choice.kind === "gain_market_chip" && choice.color === "red")
      ?? choices[0];
    updated = applyOmenChoice(updated, player.id, selected);
  }
  return {
    ...updated,
    phase: phaseAfter,
    pendingOmenChoices: undefined,
    pendingOmenRewardPlayerIds: undefined,
    phaseAfterOmenChoice: undefined,
  };
}

function sampledUpgradeChoices(state: GameState, sampled: Token[]): OmenChoice[] {
  return sampled.flatMap<OmenChoice>((token) => {
    const nextValue = token.value === 1 ? 2 : token.value === 2 ? 4 : null;
    if (!nextValue) return [];
    const item = state.market.find((entry) =>
      entry.token.color === token.color && entry.token.value === nextValue &&
      entry.stock > 0 && entry.available && entry.unlockRound <= state.currentRound
    );
    return item ? [{
      id: `omen-upgrade-${token.id}-${item.id}`,
      kind: "upgrade_sampled_chip",
      sourceTokenId: token.id,
      itemId: item.id,
      color: token.color,
      fromValue: token.value,
      value: nextValue,
    }] : [];
  });
}

function applySampledUpgrade(
  state: GameState,
  playerId: string,
  sampled: Token[],
  choice: Extract<OmenChoice, { kind: "upgrade_sampled_chip" }>,
): GameState {
  const player = getPlayer(state, playerId);
  const source = sampled.find((token) => token.id === choice.sourceTokenId);
  const target = state.market.find((item) => item.id === choice.itemId);
  if (!source || !target || target.stock <= 0) return state;
  const returned = sampled.filter((token) => token.id !== source.id);
  const updated = updatePlayer(state, player.id, (current) => ({
    ...current,
    bag: {
      tokens: [
        ...current.bag.tokens,
        ...returned,
        makeFreeToken(current.id, choice.color, choice.value, state.currentOmen?.id ?? "omen"),
      ],
    },
  }));
  return {
    ...updated,
    market: updated.market.map((item) => {
      if (item.id === target.id) return { ...item, stock: item.stock - 1, available: item.stock - 1 > 0 };
      if (item.token.color === source.color && item.token.value === source.value) {
        return { ...item, stock: item.stock + 1, available: item.unlockRound <= state.currentRound };
      }
      return item;
    }),
  };
}

function grantGreenFallback(state: GameState, playerId: string, sampled: Token[]): GameState {
  let updated = updatePlayer(state, playerId, (player) => ({
    ...player,
    bag: { tokens: [...player.bag.tokens, ...sampled] },
  }));
  const green = updated.market.find((item) => item.token.color === "green" && item.token.value === 1 && item.stock > 0);
  if (!green) return updated;
  updated = updatePlayer(updated, playerId, (player) => ({
    ...player,
    bag: { tokens: [...player.bag.tokens, makeFreeToken(player.id, "green", 1, state.currentOmen?.id ?? "omen")] },
  }));
  return {
    ...updated,
    market: updated.market.map((item) => item.id === green.id
      ? { ...item, stock: item.stock - 1, available: item.stock - 1 > 0 }
      : item),
  };
}

function resolveOmenUpgradeQueue(state: GameState, playerIds: string[]): GameState {
  let updated = state;
  for (let index = 0; index < playerIds.length; index += 1) {
    const player = getPlayer(updated, playerIds[index]);
    const sample = drawSample(player, 4);
    updated = updatePlayer(updated, player.id, () => sample.player);
    const choices = sampledUpgradeChoices(updated, sample.tokens);
    if (choices.length === 0) {
      updated = grantGreenFallback(updated, player.id, sample.tokens);
      continue;
    }
    if (player.kind === "human") {
      return {
        ...updated,
        phase: "omen_choice",
        pendingOmenChoices: choices,
        pendingOmenSampleTokens: sample.tokens,
        pendingOmenUpgradePlayerIds: playerIds.slice(index + 1),
      };
    }
    const selected = [...choices].sort((a, b) => {
      const rank = (choice: OmenChoice) => choice.kind === "upgrade_sampled_chip"
        ? choice.value * 10 + (["blue", "red", "yellow", "green"].indexOf(choice.color) >= 0 ? 2 : 0)
        : 0;
      return rank(b) - rank(a);
    })[0] as Extract<OmenChoice, { kind: "upgrade_sampled_chip" }>;
    updated = applySampledUpgrade(updated, player.id, sample.tokens, selected);
  }
  return {
    ...updated,
    phase: "brewing",
    pendingOmenChoices: undefined,
    pendingOmenSampleTokens: undefined,
    pendingOmenUpgradePlayerIds: undefined,
  };
}

function resolveAIMarketPlayers(state: GameState, playerIds: string[]): GameState {
  let updatedState = state;
  let market = state.market;

  for (const playerId of playerIds) {
    let ai = updatedState.players.find((player) => player.id === playerId && player.kind === "ai");
    if (!ai) continue;
    if (updatedState.setup.modules.patrons) {
      ai = prepareAICovenantForMarket(ai, updatedState.currentRound, updatedState.selectedCovenants ?? DEFAULT_COVENANTS);
    }
    const purchases = decideMarketTurn(ai, market, { ...updatedState, market });
    let buyState: BuyPhaseState = {
      purchases: [],
      coinsSpent: 0,
      coinsAvailable: ai.coinsThisRound,
    };

    for (const itemId of purchases) {
      try {
        const result = purchaseItem(ai, market, buyState, itemId, updatedState.currentRound);
        ai = {
          ...result.player,
          coinsThisRound: Math.max(0, result.state.coinsAvailable - result.state.coinsSpent),
        };
        market = result.market;
        buyState = result.state;
      } catch {
        break;
      }
    }

    ai = spendAIRubies(ai, updatedState);
    if (updatedState.setup.modules.patrons) {
      ai = restoreAIFlaskWithCovenant(ai, updatedState.selectedCovenants ?? DEFAULT_COVENANTS);
    }
    updatedState = updatePlayer(updatedState, ai.id, () => ai);
  }

  return {
    ...updatedState,
    market,
    marketCompletedPlayerIds: [
      ...new Set([...updatedState.marketCompletedPlayerIds, ...playerIds]),
    ],
  };
}

// ─── Store interface ──────────────────────────────────────────────────────────

interface GameStore {
  state: GameState;
  initGame: (recipeMode?: RecipeMode, aiCount?: number, aiDifficulty?: AIDifficulty) => void;
  initGameWithSetup: (setup: GameSetup, aiDifficulty?: AIDifficulty) => void;
  restoreGame: (state: GameState) => void;

  // Phase transitions
  selectCovenants: (selection: CovenantSelection) => void;
  selectHumanAffliction: (contractId: AfflictionId) => void;
  dismissOmen: () => void;

  // Brewing
  humanDraw: () => { token: Token; exploded: boolean } | null;
  humanStop: () => void;
  humanUseFlask: () => void;
  humanUseCovenant: (kind: CovenantKind) => void;

  // Blue chip choice: player picks which of 2 drawn tokens to keep (or neither)
  humanResolveBlue: (keepTokenId: string | null, extraTokens: Token[]) => void;
  humanResolveYellow: (returnPrevious: boolean) => void;
  humanResolveMovement: (apply: boolean) => void;
  humanResolveRed: (action: "place" | "save" | "bag") => void;
  humanResolvePurple: (choiceId: string) => void;
  humanResolveGreenReward: (color: TokenColor, value: number) => void;
  humanResolveGreenSpend: (steps: number) => void;
  humanResolveGreenMove: (move: boolean) => void;
  humanResolveOmenChoice: (choiceId: string) => void;
  humanResolveStrongIngredient: (tokenId: string | null) => void;
  humanResolveOmenRestart: (choice: "continue" | "restart" | "flask") => void;

  // Scoring
  humanExplodedChoice: (choice: ExplodedChoice) => void;

  // Ruby spending (end of round)
  humanSpendRubyDroplet: () => void;
  humanSpendRubyFlask: () => void;
  humanDoneRubySpend: () => void;

  // Market
  humanBuyItem: (itemId: string) => void;
  humanEndMarket: () => void;

  // AI brewing is animated externally, then both players are evaluated here
  commitAIBrewsAndResolve: (finalAIs: Player[]) => void;

  // Ruby spend helpers
  canAdvanceDroplet: () => boolean;
  canRefillFlask: () => boolean;

  // Internal
  _resolveEndOfRound: () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useGameStore = create<GameStore>((set, get) => ({
  state: createInitialState(),

  initGame: (recipeMode: RecipeMode = 1, aiCount: number = 1, aiDifficulty: AIDifficulty = "skilled") => {
    soundManager.play("omen_reveal");
    set({ state: createInitialState(recipeMode, aiCount, aiDifficulty) });
  },

  initGameWithSetup: (setup: GameSetup, aiDifficulty: AIDifficulty = "skilled") => {
    soundManager.play("omen_reveal");
    set({ state: createInitialStateWithSetup(setup, aiDifficulty) });
  },

  restoreGame: (state: GameState) => set({ state }),

  selectCovenants: (selection: CovenantSelection) => {
    set((s) => {
      const { state } = s;
      if (state.phase !== "setup" || !state.setup.modules.patrons || !state.covenantOffer) return s;
      if (!isValidCovenantSelection(selection, state.covenantOffer)) return s;
      return {
        state: {
          ...state,
          selectedCovenants: selection,
          phase: state.setup.modules.distillation ? "setup" : "omen",
        },
      };
    });
  },

  selectHumanAffliction: (contractId: AfflictionId) => {
    set((s) => {
      if (s.state.phase !== "setup" || !s.state.setup.modules.distillation) return s;
      if (s.state.setup.modules.patrons && !s.state.selectedCovenants) return s;
      const offer = s.state.afflictionOffer ?? [];
      if (!offer.includes(contractId)) return s;
      const players = s.state.players.map((player, index) => {
        const selected = player.kind === "human" ? contractId : chooseAIAffliction(player, index, offer);
        return { ...player, affliction: createAfflictionState(index, selected) };
      });
      soundManager.play("affliction_contract_bind");
      return { state: { ...s.state, players, phase: "omen" } };
    });
  },

  dismissOmen: () => {
    set((s) => {
      let state = s.state;
      if (state.phase !== "omen") return s;
      soundManager.play("round_start");

      // Apply rat tails (round 2+) then go to brewing
      if (state.currentRound >= 2) {
        const withRats = applyRatStones(state.players, state.currentRound);
        const ratMultiplier = state.currentOmen?.effect.type === "double_rat_tails" ? 2 : 1;
        // Apply rat stone offsets to crucibles
        const playersWithRats = withRats.map((p) => ({
          ...p,
          ratStoneOffset: p.ratStoneOffset * ratMultiplier +
            (state.currentOmen?.effect.type === "extra_rat_stone" && p.ratStoneOffset > 0
              ? state.currentOmen.effect.amount
              : 0) + (p.affliction?.pendingHeadStart ?? 0),
          crucible: {
            ...p.crucible,
            filledUpTo: p.crucible.dropletPosition + p.ratStoneOffset * ratMultiplier +
              (state.currentOmen?.effect.type === "extra_rat_stone" && p.ratStoneOffset > 0
                ? state.currentOmen.effect.amount
                : 0) + (p.affliction?.pendingHeadStart ?? 0),
          },
          affliction: p.affliction
            ? { ...p.affliction, pendingHeadStart: 0 }
            : undefined,
        }));
        state = { ...state, players: playersWithRats };
      }

      const playersWithOmen = state.players.map((player) =>
        applyOmenStartEffect(player, state.currentOmen, {
          createToken: (color, value, source) => makeFreeToken(player.id, color, value, source),
        })
      );
      state = { ...state, players: playersWithOmen, omenCompletedPlayerIds: [] };

      if (state.currentOmen?.effect.type === "fewest_vp_gain_chip") {
        const minimum = Math.min(...state.players.map((player) => player.score));
        const effect = state.currentOmen.effect;
        state = {
          ...state,
          players: state.players.map((player) => player.score === minimum
            ? {
              ...player,
              bag: {
                tokens: [...player.bag.tokens, makeFreeToken(player.id, effect.color, effect.value, state.currentOmen!.id)],
              },
            }
            : player),
        };
      }
      if (state.currentOmen?.effect.type === "fewest_rubies_gain_ruby") {
        const minimum = Math.min(...state.players.map((player) => player.rubies));
        const amount = state.currentOmen.effect.amount;
        state = {
          ...state,
          players: state.players.map((player) => player.rubies === minimum
            ? { ...player, rubies: player.rubies + amount }
            : player),
        };
      }
      if (state.currentOmen?.effect.type === "sample_five_lowest") {
        state = resolveFiveChipSample(state);
      }
      if (state.currentOmen?.effect.type === "sample_four_upgrade") {
        return { state: resolveOmenUpgradeQueue(state, playersInStartingOrder(state).map((player) => player.id)) };
      }

      // Resolve printed choices in starting-player order. AI players seated before the
      // human choose first, so limited market stock is consumed in the correct order.
      const orderedPlayers = playersInStartingOrder(state);
      const humanIndex = orderedPlayers.findIndex((player) => player.kind === "human");
      const beforeHuman = humanIndex >= 0 ? orderedPlayers.slice(0, humanIndex) : orderedPlayers;
      for (const player of beforeHuman) {
        if (player.kind === "ai") state = resolveAIChoice(state, getPlayer(state, player.id));
      }

      const human = state.players.find((player) => player.kind === "human");
      const choices = human ? omenChoicesForPlayer(state, human) : [];
      if (human && choices.length > 0) {
        return { state: { ...state, pendingOmenChoices: choices, phase: "omen_choice" } };
      }

      for (const player of orderedPlayers.slice(Math.max(0, humanIndex + 1))) {
        if (player.kind === "ai") state = resolveAIChoice(state, getPlayer(state, player.id));
      }
      return { state: { ...state, pendingOmenChoices: undefined, phase: "brewing" } };
    });
  },

  humanResolveOmenChoice: (choiceId: string) => {
    set((s) => {
      let state = s.state;
      if (state.phase !== "omen_choice") return s;
      const human = state.players.find((player) => player.kind === "human");
      if (!human) return s;

      if (state.pendingOmenRewardPlayerIds) {
        const remainingRewardPlayers = state.pendingOmenRewardPlayerIds;
        const legalChoice = valueTwoRewardChoices(state).find((choice) => choice.id === choiceId);
        if (!legalChoice) return s;
        state = applyOmenChoice(state, human.id, legalChoice);
        const nextPhase = state.phaseAfterOmenChoice ?? "market";
        state = resolveOmenRewardQueue(state, remainingRewardPlayers, nextPhase);
        if (state.phase === "omen_choice") return { state };

        const startingOrder = playersInStartingOrder(state);
        const humanSeat = startingOrder.findIndex((player) => player.id === "human");
        const aiBeforeHuman = startingOrder.slice(0, humanSeat)
          .filter((player) => player.kind === "ai")
          .map((player) => player.id);
        return { state: resolveAIMarketPlayers(state, aiBeforeHuman) };
      }

      if (state.pendingOmenUpgradePlayerIds && state.pendingOmenSampleTokens) {
        const choice = state.pendingOmenChoices?.find((candidate) =>
          candidate.id === choiceId && candidate.kind === "upgrade_sampled_chip"
        );
        if (!choice || choice.kind !== "upgrade_sampled_chip") return s;
        const remaining = state.pendingOmenUpgradePlayerIds;
        state = applySampledUpgrade(state, human.id, state.pendingOmenSampleTokens, choice);
        return { state: resolveOmenUpgradeQueue(state, remaining) };
      }

      // Recompute legality against the current shared market, rather than trusting a
      // stale UI payload or caller-provided chip details.
      const legalChoice = omenChoicesForPlayer(state, human).find((choice) => choice.id === choiceId);
      if (!legalChoice) return s;
      state = applyOmenChoice(state, human.id, legalChoice);

      for (const player of playersInStartingOrder(state)) {
        if (player.kind === "ai" && !state.omenCompletedPlayerIds.includes(player.id)) {
          state = resolveAIChoice(state, getPlayer(state, player.id));
        }
      }

      return { state: { ...state, pendingOmenChoices: undefined, phase: "brewing" } };
    });
  },

  humanResolveStrongIngredient: (tokenId: string | null) => {
    set((s) => {
      const state = s.state;
      const sampled = state.pendingOmenSampleTokens;
      if (state.phase !== "omen_strong_choice" || !sampled) return s;
      if (tokenId !== null && !sampled.some((token) => token.id === tokenId)) return s;
      const human = getPlayer(state, "human");
      const selected = tokenId ? sampled.find((token) => token.id === tokenId) : undefined;
      const updatedHuman: Player = {
        ...human,
        crucible: selected ? placeToken(human.crucible, selected, selected.value) : human.crucible,
        bag: {
          tokens: [...human.bag.tokens, ...sampled.filter((token) => token.id !== selected?.id)],
        },
      };
      return {
        state: {
          ...updatePlayer(state, human.id, () => updatedHuman),
          phase: "end_of_round",
          pendingOmenSampleTokens: undefined,
        },
      };
    });
  },

  humanResolveOmenRestart: (choice: "continue" | "restart" | "flask") => {
    set((s) => {
      const state = s.state;
      if (state.phase !== "omen_restart_choice") return s;
      const human = getPlayer(state, "human");
      if (choice === "flask") {
        if (!canUseFlask(human)) return s;
        return { state: { ...updatePlayer(state, human.id, () => useFlask(human)), phase: "brewing" } };
      }
      if (choice === "restart") {
        return { state: { ...updatePlayer(state, human.id, () => restartBrew(human)), phase: "brewing" } };
      }
      const continued = { ...human, omenSecondChanceUsed: true };
      return {
        state: {
          ...updatePlayer(state, human.id, () => continued),
          phase: continued.crucible.exploded ? "end_of_round" : "brewing",
        },
      };
    });
  },

  humanDraw: () => {
    let result: { token: Token; exploded: boolean } | null = null;

    set((s) => {
      const state = s.state;
      if (state.phase !== "brewing") return s;
      const human = getPlayer(state, "human");
      if (human.crucible.exploded || human.bag.tokens.length === 0) return s;
      if (!human.crucible.overflowEnabled && human.crucible.filledUpTo >= 33) return s;

      const drawn = drawToken(human.bag);
      if (!drawn) return s;

      soundManager.play("token_draw");

      const previousToken = human.crucible.lastDrawnToken;
      const enteringOverflow = human.crucible.overflowEnabled && human.crucible.filledUpTo >= 33;
      const shouldAskYellow =
        !enteringOverflow &&
        drawn.token.color === "yellow" &&
        getRecipeSetForColor(state.recipeBooks, "yellow") === 1 &&
        previousToken?.color === "white";
      const redMoveAmount = !enteringOverflow && drawn.token.color === "red" &&
        getRecipeSetForColor(state.recipeBooks, "red") === 3 &&
        previousToken?.color === "white"
          ? previousToken.value
          : 0;
      const yellowIndex = human.crucible.placements.filter((placement) => placement.token.color === "yellow").length + 1;
      const yellowMoveAmount = drawn.token.color === "yellow" &&
        getRecipeSetForColor(state.recipeBooks, "yellow") === 4 &&
        yellowIndex <= 3
          ? yellowIndex
          : 0;
      const movementChoice = redMoveAmount > 0
        ? { amount: redMoveAmount, source: "red" as const }
        : yellowMoveAmount > 0
          ? { amount: yellowMoveAmount, source: "yellow" as const }
          : undefined;
      let updatedHuman = placeTokenForActiveBooks(
        { ...human, bag: drawn.bag },
        drawn.token,
        state,
        {
          deferYellowChoice: shouldAskYellow,
          useRedSetThreeBonus: movementChoice?.source !== "red",
          useYellowSetFourBonus: movementChoice?.source !== "yellow",
        }
      );
      const updatedCrucible = updatedHuman.crucible;

      if (drawn.token.color === "white") {
        soundManager.play("token_place_white");
      } else {
        soundManager.play("token_place");
      }

      if (updatedCrucible.exploded) {
        soundManager.play("explosion");
      }
      result = { token: drawn.token, exploded: updatedCrucible.exploded };

      if (shouldAskYellow && previousToken) {
        return {
          state: {
            ...updatePlayer(state, "human", () => updatedHuman),
            phase: "yellow_choice" as GamePhase,
            pendingYellowPreviousToken: previousToken,
          },
        };
      }

      if (movementChoice) {
        return {
          state: {
            ...updatePlayer(state, "human", () => updatedHuman),
            phase: "movement_choice" as GamePhase,
            pendingMovementChoice: movementChoice,
          },
        };
      }

      // Blue chip: trigger draw-N-keep-1 phase based on its value
      if (drawn.token.color === "blue" && getRecipeSetForColor(state.recipeBooks, "blue") === 1 && !updatedCrucible.exploded) {
        // Perform the bonus draw immediately
        const blueBonusResult = drawBlueBonus(updatedHuman.bag, drawn.token.value);
        updatedHuman.bag = blueBonusResult.bag; // deduct them from bag temporarily

        return {
          state: {
            ...updatePlayer(state, "human", () => updatedHuman),
            phase: "blue_choice" as GamePhase,
            pendingBlueTokens: blueBonusResult.drawn,
          },
        };
      }

      const stateAfterDraw = updatePlayer(state, "human", () => updatedHuman);
      const secondChance = offerSecondChance(stateAfterDraw, updatedHuman);
      if (secondChance) return { state: secondChance };

      const phase = updatedHuman.crucible.exploded
        ? ((updatedHuman.redReserve?.length ?? 0) > 0 ? "red_choice" : "end_of_round")
        : state.phase;

      return {
        state: {
          ...stateAfterDraw,
          phase: phase as GamePhase,
          pendingRedTokens: phase === "red_choice" ? updatedHuman.redReserve : undefined,
        },
      };
    });

    return result;
  },

  humanStop: () => {
    set((s) => {
      if (s.state.phase !== "brewing") return s;
      soundManager.play("brew_stop");
      const human = getPlayer(s.state, "human");
      const pendingRedTokens = human.redReserve ?? [];
      if (pendingRedTokens.length > 0) {
        return { state: { ...s.state, phase: "red_choice", pendingRedTokens } };
      }
      if (s.state.currentOmen?.effect.type === "strong_ingredient") {
        return { state: prepareStrongIngredientChoice(s.state, human) };
      }
      const secondChance = offerSecondChance(s.state, human);
      if (secondChance) return { state: secondChance };
      return { state: { ...s.state, phase: "end_of_round" } };
    });
  },

  humanUseFlask: () => {
    set((s) => {
      const state = s.state;
      if (state.phase !== "brewing") return s;
      const human = getPlayer(state, "human");
      if (!canUseFlask(human)) return s;
      soundManager.play("flask_use");
      return { state: updatePlayer(state, "human", () => useFlask(human)) };
    });
  },

  humanUseCovenant: (kind: CovenantKind) => {
    set((s) => {
      const state = s.state;
      if (!state.setup.modules.patrons) return s;
      const human = getPlayer(state, "human");
      const selection = state.selectedCovenants ?? DEFAULT_COVENANTS;
      if (!canUseCovenant(human, kind, state.phase, selection)) return s;

      const updatedState = updatePlayer(state, human.id, () => useCovenant(human, kind, selection));
      soundManager.play(`covenant_activate_${kind}`);
      globalThis.setTimeout(() => soundManager.play("covenant_spent"), 420);
      if (kind !== "blood" || !updatedState.buyPhaseState) return { state: updatedState };
      return {
        state: {
          ...updatedState,
          buyPhaseState: {
            ...updatedState.buyPhaseState,
            coinsAvailable: updatedState.buyPhaseState.coinsAvailable + covenantMarketCoinBonus(selection.blood),
          },
        },
      };
    });
  },

  humanResolveBlue: (keepTokenId: string | null, _extraTokens: Token[]) => {
    set((s) => {
      const state = s.state;
      const pendingTokens = state.pendingBlueTokens;
      if (state.phase !== "blue_choice" || !pendingTokens) return s;
      if (keepTokenId !== null && !pendingTokens.some((token) => token.id === keepTokenId)) return s;
      const human = getPlayer(state, "human");

      let updatedHuman: Player = {
        ...human,
        bag: {
          tokens: [
            ...human.bag.tokens,
            ...pendingTokens.filter((t) => t.id !== keepTokenId),
          ],
        },
      };

      if (keepTokenId) {
        const kept = pendingTokens.find((t) => t.id === keepTokenId);
        if (kept) {
          updatedHuman = placeTokenForActiveBooks(updatedHuman, kept, state);
          const newCrucible = updatedHuman.crucible;
          if (kept.color === "white") {
            soundManager.play("token_place_white");
          } else {
            soundManager.play("token_place");
          }
          if (newCrucible.exploded) {
            soundManager.play("explosion");
          }

          if (kept.color === "blue" && getRecipeSetForColor(state.recipeBooks, "blue") === 1 && !newCrucible.exploded) {
            const blueBonusResult = drawBlueBonus(updatedHuman.bag, kept.value);
            updatedHuman = { ...updatedHuman, bag: blueBonusResult.bag };
            return {
              state: {
                ...updatePlayer(state, "human", () => updatedHuman),
                phase: "blue_choice" as GamePhase,
                pendingBlueTokens: blueBonusResult.drawn,
              },
            };
          }
        }
      }

      const stateAfterBlue = {
        ...updatePlayer(state, "human", () => updatedHuman),
        pendingBlueTokens: undefined,
      };
      const secondChance = offerSecondChance(stateAfterBlue, updatedHuman);
      if (secondChance) return { state: secondChance };

      return {
        state: {
          ...stateAfterBlue,
          phase: updatedHuman.crucible.exploded ? "end_of_round" as GamePhase : "brewing" as GamePhase,
        },
      };
    });
  },

  humanResolveYellow: (returnPrevious: boolean) => {
    set((s) => {
      const state = s.state;
      if (state.phase !== "yellow_choice" || !state.pendingYellowPreviousToken) return s;
      const human = getPlayer(state, "human");
      const previousToken = state.pendingYellowPreviousToken ?? null;
      const updatedHuman = returnPrevious
        ? applyYellowSetOneBonus(human, previousToken)
        : human;

      const stateAfterYellow = {
        ...updatePlayer(state, "human", () => updatedHuman),
        pendingYellowPreviousToken: undefined,
      };
      const secondChance = offerSecondChance(stateAfterYellow, updatedHuman);
      if (secondChance) return { state: secondChance };

      return {
        state: {
          ...stateAfterYellow,
          phase: updatedHuman.crucible.exploded
            ? ((updatedHuman.redReserve?.length ?? 0) > 0 ? "red_choice" as GamePhase : "end_of_round" as GamePhase)
            : "brewing" as GamePhase,
          pendingRedTokens: updatedHuman.crucible.exploded && (updatedHuman.redReserve?.length ?? 0) > 0
            ? updatedHuman.redReserve
            : undefined,
        },
      };
    });
  },

  humanResolveMovement: (apply: boolean) => {
    set((s) => {
      const state = s.state;
      if (state.phase !== "movement_choice" || !state.pendingMovementChoice) return s;
      const human = getPlayer(state, "human");
      const updatedHuman = apply
        ? { ...human, crucible: moveLastPlacedTokenExtra(human.crucible, state.pendingMovementChoice.amount) }
        : human;
      const updatedState: GameState = {
        ...updatePlayer(state, "human", () => updatedHuman),
        phase: "brewing",
        pendingMovementChoice: undefined,
      };
      const secondChance = offerSecondChance(updatedState, updatedHuman);
      return { state: secondChance ?? updatedState };
    });
  },

  humanResolveRed: (action: "place" | "save" | "bag") => {
    set((s) => {
      const state = s.state;
      if (state.phase !== "red_choice" || !state.pendingRedTokens?.length) return s;
      const human = getPlayer(state, "human");
      const pending = state.pendingRedTokens ?? [];
      const [token, ...rest] = pending;
      if (!token) {
        return { state: { ...state, phase: "end_of_round" as GamePhase, pendingRedTokens: undefined } };
      }

      const existingSaved = (human.redReserve ?? []).filter(
        (reserved) => !pending.some((pendingToken) => pendingToken.id === reserved.id)
      );

      let updatedHuman: Player = { ...human, redReserve: existingSaved };

      if (action === "place") {
        updatedHuman = {
          ...updatedHuman,
          crucible: placeToken(updatedHuman.crucible, token, token.value),
        };
      } else if (action === "save") {
        updatedHuman = {
          ...updatedHuman,
          redReserve: [...(updatedHuman.redReserve ?? []), token],
        };
      } else {
        updatedHuman = {
          ...updatedHuman,
          bag: { tokens: [...updatedHuman.bag.tokens, token] },
        };
      }

      const updatedState = {
        ...updatePlayer(state, "human", () => updatedHuman),
        phase: rest.length > 0 ? "red_choice" as GamePhase : "end_of_round" as GamePhase,
        pendingRedTokens: rest.length > 0 ? rest : undefined,
      };
      if (rest.length === 0 && state.currentOmen?.effect.type === "strong_ingredient" && !updatedHuman.crucible.exploded) {
        return { state: prepareStrongIngredientChoice(updatedState, updatedHuman) };
      }
      return { state: updatedState };
    });
  },

  humanResolveGreenSpend: (steps: number) => {
    set((s) => {
      const state = s.state;
      if (state.phase !== "green_choice" || state.pendingGreenSpendMax === undefined) return s;
      const human = getPlayer(state, "human");
      const max = state.pendingGreenSpendMax ?? 0;
      const spend = Math.max(0, Math.min(steps, max));
      const updatedHuman = applyGreenSetFourSpend(human, spend);
      const nextPhase = state.phaseAfterGreenChoice ?? (updatedHuman.crucible.exploded ? "scoring" : "market");

      return {
        state: {
          ...updatePlayer(state, "human", () => updatedHuman),
          phase: nextPhase as GamePhase,
          pendingGreenSpendMax: undefined,
          phaseAfterGreenChoice: undefined,
        },
      };
    });
  },

  humanResolveGreenMove: (move: boolean) => {
    set((s) => {
      const state = s.state;
      if (state.phase !== "green_move_choice" || state.pendingGreenMoveAmount === undefined) return s;
      const human = getPlayer(state, "human");
      const updatedHuman = move
        ? applyGreenSetThreeMove(human, state.pendingGreenMoveAmount)
        : human;
      const nextPhase = state.pendingGreenSpendMax !== undefined
        ? "green_choice" as GamePhase
        : state.phaseAfterGreenChoice ?? (updatedHuman.crucible.exploded ? "scoring" : "market");

      return {
        state: {
          ...updatePlayer(state, "human", () => updatedHuman),
          phase: nextPhase,
          pendingGreenMoveAmount: undefined,
          phaseAfterGreenChoice: state.pendingGreenSpendMax !== undefined ? state.phaseAfterGreenChoice : undefined,
        },
      };
    });
  },

  humanResolvePurple: (choiceId: string) => {
    set((s) => {
      const state = s.state;
      if (state.phase !== "purple_choice" || !state.pendingPurpleChoices?.length) return s;
      const human = getPlayer(state, "human");
      const choices = state.pendingPurpleChoices ?? [];
      const choice = legalPurpleChoices(state.market, choices).find((option) => option.id === choiceId);
      if (!choice) return s;

      const updatedHuman = applyPurpleChoice(human, choice);
      const updatedMarket = applyPurpleChoiceStock(state.market, choice, state.currentRound);
      let updatedState: GameState = {
          ...updatePlayer(state, "human", () => updatedHuman),
          market: updatedMarket,
          pendingPurpleChoices: undefined,
          pendingPurpleAIPlayerIds: undefined,
      };
      updatedState = resolveAIPurpleQueue(updatedState, state.pendingPurpleAIPlayerIds ?? []);
      const pendingGreenRewards = availableGreenRewards(state.pendingGreenRewards ?? [], updatedState.market);
      updatedState = {
        ...updatedState,
        phase: pendingGreenRewards.length > 0
          ? "green_reward_choice"
          : state.pendingGreenMoveAmount !== undefined
            ? "green_move_choice"
            : state.pendingGreenSpendMax !== undefined
              ? "green_choice"
              : state.phaseAfterGreenChoice ?? "market",
        pendingGreenRewards: pendingGreenRewards.length > 0 ? pendingGreenRewards : undefined,
        pendingGreenAIPlayerIds: pendingGreenRewards.length > 0 ? state.pendingGreenAIPlayerIds : undefined,
        phaseAfterGreenChoice: pendingGreenRewards.length > 0 || state.pendingGreenMoveAmount !== undefined || state.pendingGreenSpendMax !== undefined
          ? state.phaseAfterGreenChoice
          : undefined,
      };
      if (pendingGreenRewards.length === 0) {
        updatedState = resolveAIGreenQueue(updatedState, state.pendingGreenAIPlayerIds ?? []);
      }
      return { state: updatedState };
    });
  },

  humanResolveGreenReward: (color: TokenColor, value: number) => {
    set((s) => {
      const state = s.state;
      if (state.phase !== "green_reward_choice" || !state.pendingGreenRewards?.length) return s;
      const human = getPlayer(state, "human");
      const [reward, ...rest] = state.pendingGreenRewards ?? [];
      if (!reward) return s;

      const availableReward = availableGreenRewards([reward], state.market)[0];
      const selected = availableReward?.options.find((option) => option.color === color && option.value === value);
      if (!selected) return s;
      const claimed = takeGreenReward(human, state.market, selected, state.currentRound);
      if (!claimed) return s;
      const remainingRewards = availableGreenRewards(rest, claimed.market);
      const resolvedNextPhase = remainingRewards.length > 0
        ? "green_reward_choice" as GamePhase
        : state.pendingGreenMoveAmount !== undefined
          ? "green_move_choice" as GamePhase
        : state.pendingGreenSpendMax !== undefined
          ? "green_choice" as GamePhase
          : state.phaseAfterGreenChoice ?? "market" as GamePhase;

      let updatedState: GameState = {
          ...updatePlayer(state, "human", () => claimed.player),
          market: claimed.market,
          phase: resolvedNextPhase,
          pendingGreenRewards: remainingRewards.length > 0 ? remainingRewards : undefined,
          pendingGreenAIPlayerIds: remainingRewards.length > 0 ? state.pendingGreenAIPlayerIds : undefined,
          phaseAfterGreenChoice: remainingRewards.length > 0 || state.pendingGreenMoveAmount !== undefined || state.pendingGreenSpendMax !== undefined ? state.phaseAfterGreenChoice : undefined,
      };
      if (remainingRewards.length === 0) {
        updatedState = resolveAIGreenQueue(updatedState, state.pendingGreenAIPlayerIds ?? []);
      }
      return {
        state: updatedState,
      };
    });
  },

  humanExplodedChoice: (choice: ExplodedChoice) => {
    set((s) => {
      const state = s.state;
      const human = getPlayer(state, "human");
      if (state.phase !== "scoring" || !human.crucible.exploded) return s;
      const result = calculateRoundScore(human.crucible);

      const updatedHuman = applyRoundReward(human, result, choice);

      const nextPhase: GamePhase = choice === "coins" ? "market" : "ruby_spend";

      return {
        state: {
          ...updatePlayer(state, "human", () => updatedHuman),
          roundSummary: state.roundSummary ? {
            ...state.roundSummary,
            players: state.roundSummary.players.map((summary) => summary.playerId === "human"
              ? {
                  ...summary,
                  prestigeAwarded: choice === "vp" ? result.vp : 0,
                  coinsAwarded: choice === "coins" ? result.coins : 0,
                }
              : summary),
          } : null,
          phase: nextPhase,
          buyPhaseState: choice === "coins" ? scoringMarketState(updatedHuman) : null,
        },
      };
    });
  },

  humanSpendRubyDroplet: () => {
    set((s) => {
      if (s.state.phase !== "ruby_spend") return s;
      const human = getPlayer(s.state, "human");
      if (!canAdvanceDroplet(human)) return s;
      return { state: updatePlayer(s.state, "human", () => spendRubiesForDroplet(human)) };
    });
  },

  humanSpendRubyFlask: () => {
    set((s) => {
      if (s.state.phase !== "ruby_spend") return s;
      const human = getPlayer(s.state, "human");
      if (!canRefillFlask(human)) return s;
      return { state: updatePlayer(s.state, "human", () => spendRubiesForFlask(human)) };
    });
  },

  humanDoneRubySpend: () => {
    set((s) => {
      if (s.state.phase !== "ruby_spend") return s;
      const remainingAIs = playersInStartingOrder(s.state)
        .filter((player) => player.kind === "ai" && !s.state.marketCompletedPlayerIds.includes(player.id))
        .map((player) => player.id);
      const state = resolveAIMarketPlayers(s.state, remainingAIs);

      return { state: advanceToNextRound(state) };
    });
  },

  humanBuyItem: (itemId: string) => {
    set((s) => {
      const state = s.state;
      if (state.phase !== "market") return s;
      const human = getPlayer(state, "human");
      const buyState = state.buyPhaseState;
      if (!buyState) return s;

      const alreadyBoughtColor =
        buyState.purchases.length === 1
          ? state.market.find((i) => i.id === buyState.purchases[0])?.token.color
          : undefined;

      try {
        const { player, market, state: newBuyState } = purchaseItem(
          human, state.market, buyState, itemId, state.currentRound
        );
        soundManager.play("market_buy");
        // Check different-color rule
        if (alreadyBoughtColor && market.find(i => i.id === itemId)?.token.color === alreadyBoughtColor) {
          return s;
        }
        return {
          state: {
            ...updatePlayer(state, "human", () => player),
            market,
            buyPhaseState: newBuyState,
          },
        };
      } catch {
        return s;
      }
    });
  },

  humanEndMarket: () => {
    set((s) => s.state.phase !== "market" ? s : ({
      state: {
        ...updatePlayer(s.state, "human", (human) => {
          const buyState = s.state.buyPhaseState;
          if (!buyState) return human;
          return {
            ...human,
            coinsThisRound: Math.max(0, buyState.coinsAvailable - buyState.coinsSpent),
          };
        }),
        phase: "ruby_spend" as GamePhase,
        buyPhaseState: null,
      },
    }));
  },

  commitAIBrewsAndResolve: (finalAIs: Player[]) => {
    set((s) => {
      if (s.state.phase !== "end_of_round") return s;
      const omenAIs = s.state.currentOmen?.effect.type === "strong_ingredient"
        ? finalAIs.map(resolveAIStrongIngredient)
        : finalAIs;
      const finalAIById = new Map(omenAIs.map((player) => [player.id, player]));
      let stateWithAIs: GameState = {
        ...s.state,
        players: s.state.players.map((player) => finalAIById.get(player.id) ?? player),
      };
      if (stateWithAIs.setup.modules.distillation) {
        stateWithAIs = resolveDistillationRound({ ...stateWithAIs, phase: "distillation" });
        const progress = getPlayer(stateWithAIs, "human").affliction?.lastProgress ?? 0;
        if (progress >= 8) soundManager.play("remedy_complete");
        else if (progress > 0) {
          soundManager.play("distillation_gain");
          globalThis.setTimeout(() => soundManager.play("retort_bottle_fill"), 180);
        }
      }
      const results = new Map(stateWithAIs.players.map((player) => [player.id, calculateRoundScore(player.crucible)]));
      const bestSpace = Math.max(
        ...stateWithAIs.players.map((player) => {
          const result = results.get(player.id)!;
          return result.exploded ? -1 : result.space;
        })
      );
      const bonuses = new Map<string, ReturnType<typeof rollBonusDie>>();
      const bonusRolls = stateWithAIs.currentOmen?.effect.type === "bonus_die_rolls"
        ? stateWithAIs.currentOmen.effect.rolls
        : 1;
      const playersAfterBonus = stateWithAIs.players.map((player) => {
        const result = results.get(player.id)!;
        if (result.exploded || result.space !== bestSpace) return player;
        const bonus = applyBonusDieReward(player, bonusRolls);
        bonuses.set(player.id, bonus.result);
        return bonus.player;
      });
      const afterBonusById = new Map(playersAfterBonus.map((player) => [player.id, player]));
      const humanAfterBonus = afterBonusById.get("human")!;
      const humanResult = results.get("human")!;
      const applyOfficialBlackEffect = (player: Player): Player => {
        const seat = playersAfterBonus.findIndex((candidate) => candidate.id === player.id);
        if (playersAfterBonus.length === 2) {
          return applyBlackSetOneBonus(player, playersAfterBonus[(seat + 1) % 2]);
        }
        const left = playersAfterBonus[(seat - 1 + playersAfterBonus.length) % playersAfterBonus.length];
        const right = playersAfterBonus[(seat + 1) % playersAfterBonus.length];
        return applyBlackMultiplayerBonus(player, left, right);
      };

      const greenRewards = greenSetTwoRewards(humanAfterBonus, stateWithAIs.recipeBooks);
      const purpleSet = getRecipeSetForColor(stateWithAIs.recipeBooks, "purple");
      const autoPurple = purpleSet === 3 || purpleSet === 5 || purpleSet === 6;
      let humanFinal = applyEndOfRoundEffects(
        humanAfterBonus,
        undefined,
        stateWithAIs.recipeBooks,
        { autoGreenSetTwo: false, autoGreenSetThree: false, autoGreenSetFour: false, autoPurple }
      );
      humanFinal = applyOfficialBlackEffect(humanFinal);

      const rawHumanPurpleChoices = purpleChoices(humanAfterBonus, stateWithAIs.recipeBooks);
      const humanMayChoosePurple = rawHumanPurpleChoices.some((choice) => choice.kind !== "skip");
      const endRoundOrder = playersInStartingOrder({ ...stateWithAIs, players: playersAfterBonus });
      const humanOrderIndex = endRoundOrder.findIndex((player) => player.id === "human");
      const humanMayChooseGreen = greenRewards.length > 0;
      const aiBeforeGreen = new Set(
        (humanMayChooseGreen ? endRoundOrder.slice(0, humanOrderIndex) : endRoundOrder)
          .filter((player) => player.kind === "ai")
          .map((player) => player.id),
      );
      const aiAfterGreen = humanMayChooseGreen
        ? endRoundOrder.slice(humanOrderIndex + 1).filter((player) => player.kind === "ai").map((player) => player.id)
        : [];
      const aiBeforePurple = new Set(
        (humanMayChoosePurple ? endRoundOrder.slice(0, humanOrderIndex) : endRoundOrder)
          .filter((player) => player.kind === "ai")
          .map((player) => player.id),
      );
      const aiAfterPurple = humanMayChoosePurple
        ? endRoundOrder.slice(humanOrderIndex + 1).filter((player) => player.kind === "ai").map((player) => player.id)
        : [];
      let marketAfterPurple = stateWithAIs.market;
      const resolvedAIs = endRoundOrder.filter((player) => player.kind === "ai").map((orderedAI) => {
        const ai = afterBonusById.get(orderedAI.id)!;
        const result = results.get(ai.id)!;
        let resolved = applyEndOfRoundEffects(
          ai,
          undefined,
          stateWithAIs.recipeBooks,
          { autoGreenSetTwo: false, autoPurple }
        );
        resolved = applyOfficialBlackEffect(resolved);
        if (aiBeforeGreen.has(ai.id)) {
          for (const reward of greenSetTwoRewards(resolved, stateWithAIs.recipeBooks)) {
            const available = availableGreenRewards([reward], marketAfterPurple)[0];
            if (!available) continue;
            const choice = decideGreenRewardChoice(resolved, available.options, { ...stateWithAIs, market: marketAfterPurple });
            if (!choice) continue;
            const claimed = takeGreenReward(resolved, marketAfterPurple, choice, stateWithAIs.currentRound);
            if (!claimed) continue;
            resolved = claimed.player;
            marketAfterPurple = claimed.market;
          }
        }
        if (aiBeforePurple.has(ai.id)) {
          const availablePurpleChoices = legalPurpleChoices(
            marketAfterPurple,
            purpleChoices(resolved, stateWithAIs.recipeBooks),
          );
          const purpleChoice = decidePurpleChoice(availablePurpleChoices, resolved, { ...stateWithAIs, market: marketAfterPurple });
          if (purpleChoice) {
            resolved = applyPurpleChoice(resolved, purpleChoice);
            marketAfterPurple = applyPurpleChoiceStock(marketAfterPurple, purpleChoice, stateWithAIs.currentRound);
          }
        }
        resolved = applyOmenScoringEffect(resolved, stateWithAIs.currentOmen, result);
        resolved = {
          ...resolved,
          rubies: resolved.rubies + rubyRewardForResult(stateWithAIs.currentOmen, result),
        };
        if (result.exploded && !resolved.blueBonusExplosion) {
          return applyRoundReward(resolved, result, decideExplodedChoice(resolved, result, stateWithAIs));
        }
        return applyRoundReward(resolved, result);
      });
      const pendingPurpleChoices = legalPurpleChoices(
        marketAfterPurple,
        rawHumanPurpleChoices,
      );
      const humanHasPurpleChoice = pendingPurpleChoices.some((choice) => choice.kind !== "skip");
      const pendingGreenRewards = availableGreenRewards(greenRewards, marketAfterPurple);
      const humanHasGreenChoice = pendingGreenRewards.length > 0;

      humanFinal = applyOmenScoringEffect(humanFinal, stateWithAIs.currentOmen, humanResult);
      humanFinal = {
        ...humanFinal,
        rubies: humanFinal.rubies + rubyRewardForResult(stateWithAIs.currentOmen, humanResult),
      };
      if (!humanResult.exploded || humanFinal.blueBonusExplosion) {
        humanFinal = applyRoundReward(humanFinal, humanResult);
      }

      const greenSpendMax = greenSetFourSpendMax(humanFinal, stateWithAIs.recipeBooks);
      const greenMoveAmount = greenSetThreeMoveAmount(humanFinal, stateWithAIs.recipeBooks);
      const humanNeedsExplosionChoice = humanResult.exploded && !humanFinal.blueBonusExplosion;
      const finalDecisionPhase = humanNeedsExplosionChoice ? "scoring" as GamePhase : "market" as GamePhase;
      const phaseAfterGreenChoice = finalDecisionPhase;
      const bonusWinner = bonuses.has("human") ? "human" : bonuses.keys().next().value ?? null;
      const resolvedAIById = new Map(resolvedAIs.map((player) => [player.id, player]));
      const roundSummary = {
        round: stateWithAIs.currentRound,
        bonusDieWinner: bonusWinner,
        players: stateWithAIs.players.map((player) => {
          const result = results.get(player.id)!;
          const protectedExplosion = result.exploded && Boolean(player.blueBonusExplosion);
          const needsHumanChoice = player.id === "human" && result.exploded && !protectedExplosion;
          const resolvedAI = resolvedAIById.get(player.id);
          const choseCoins = Boolean(result.exploded && !protectedExplosion && resolvedAI && resolvedAI.coinsThisRound > 0);
          return {
            playerId: player.id,
            name: player.name,
            space: result.space,
            vp: result.vp,
            coins: result.coins,
            ruby: result.ruby,
            exploded: result.exploded,
            bonusDie: bonuses.get(player.id) ?? null,
            prestigeAwarded: needsHumanChoice ? null : result.exploded && !protectedExplosion && choseCoins ? 0 : result.vp,
            coinsAwarded: needsHumanChoice ? null : result.exploded && !protectedExplosion && !choseCoins ? 0 : result.coins,
            rubyAwarded: rubyRewardForResult(stateWithAIs.currentOmen, result),
            scoringRule: protectedExplosion ? "protected" as const : result.exploded ? "choice" as const : "both" as const,
            doubleRuby: result.ruby && stateWithAIs.currentOmen?.effect.type === "double_ruby_space",
            overflowValue: result.overflowValue ?? 0,
            overflowVp: result.overflowVp ?? 0,
            distillationProgress: player.affliction?.lastProgress,
            distillationPrestige: player.affliction?.lastPrestige,
            distillationDroplet: player.affliction?.lastDropletSteps,
            distillationHeadStart: player.affliction?.lastHeadStart,
          };
        }),
      };
      let resolvedState: GameState = {
        ...stateWithAIs,
        market: marketAfterPurple,
        players: stateWithAIs.players.map((p) => {
          if (p.id === "human") return humanFinal;
          return resolvedAIById.get(p.id) ?? p;
        }),
        phase: humanHasPurpleChoice
          ? "purple_choice" as GamePhase
          : humanHasGreenChoice
            ? "green_reward_choice" as GamePhase
            : greenMoveAmount > 0
              ? "green_move_choice" as GamePhase
            : greenSpendMax > 0
              ? "green_choice" as GamePhase
              : phaseAfterGreenChoice,
        buyPhaseState: humanNeedsExplosionChoice ? null : scoringMarketState(humanFinal),
        bonusDieResult: bonuses.get("human") ?? null,
        bonusDieWinner: bonusWinner,
        roundSummary,
        pendingPurpleChoices: humanHasPurpleChoice ? pendingPurpleChoices : undefined,
        pendingPurpleAIPlayerIds: humanHasPurpleChoice ? aiAfterPurple : undefined,
        pendingGreenRewards: humanHasGreenChoice ? pendingGreenRewards : undefined,
        pendingGreenAIPlayerIds: humanHasGreenChoice ? aiAfterGreen : undefined,
        pendingGreenSpendMax: greenSpendMax > 0 ? greenSpendMax : undefined,
        pendingGreenMoveAmount: greenMoveAmount > 0 ? greenMoveAmount : undefined,
        phaseAfterGreenChoice: humanHasPurpleChoice || humanHasGreenChoice || greenMoveAmount > 0 || greenSpendMax > 0 ? phaseAfterGreenChoice : undefined,
      };

      if (!humanHasPurpleChoice && aiAfterPurple.length > 0) {
        resolvedState = resolveAIPurpleQueue(resolvedState, aiAfterPurple);
      }
      if (!humanHasGreenChoice && aiAfterGreen.length > 0) {
        resolvedState = resolveAIGreenQueue(resolvedState, aiAfterGreen);
      }

      if (stateWithAIs.currentOmen?.effect.type === "explosion_left_neighbor_chip") {
        const rewardPlayerIds: string[] = [];
        for (const explodedPlayer of playersInStartingOrder(stateWithAIs)) {
          if (!results.get(explodedPlayer.id)?.exploded) continue;
          const seat = stateWithAIs.players.findIndex((player) => player.id === explodedPlayer.id);
          const leftNeighbor = stateWithAIs.players[(seat - 1 + stateWithAIs.players.length) % stateWithAIs.players.length];
          rewardPlayerIds.push(leftNeighbor.id);
        }
        resolvedState = resolveOmenRewardQueue(resolvedState, rewardPlayerIds, resolvedState.phase);
      }

      if (resolvedState.phase === "omen_choice") return { state: resolvedState };

      const startingOrder = playersInStartingOrder(resolvedState);
      const humanSeat = startingOrder.findIndex((player) => player.id === "human");
      const aiBeforeHuman = startingOrder
        .slice(0, humanSeat)
        .filter((player) => player.kind === "ai")
        .map((player) => player.id);
      resolvedState = resolveAIMarketPlayers(resolvedState, aiBeforeHuman);

      return { state: resolvedState };
    });
  },

  canAdvanceDroplet: () => {
    const human = getPlayer(get().state, "human");
    return canAdvanceDroplet(human);
  },

  canRefillFlask: () => {
    const human = getPlayer(get().state, "human");
    return canRefillFlask(human);
  },

  // Internal — retained for older callers; evaluation now waits for AI brewing.
  _resolveEndOfRound: () => {
    set((s) => ({ state: { ...s.state, phase: "end_of_round" as GamePhase } }));
  },
} as any));

useGameStore.subscribe(({ state }) => {
  if (state.phase === "game_over") clearSavedGame();
  else saveGameState(state);
});
