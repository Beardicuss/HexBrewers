import { create } from "zustand";
import type { GameState, GamePhase } from "../game/gameState";
import type { Player } from "../game/playerTypes";
import type { Token, TokenColor } from "../game/tokenTypes";
import type { ExplodedChoice } from "../game/scoring";
import type { BuyPhaseState } from "../game/bazaarTypes";
import { soundManager } from "../SoundManager";

import { getExplosionThreshold, placeToken } from "../game/crucible";
import { drawToken } from "../game/bag";
import { calculateRoundScore } from "../game/scoring";
import { canUseFlask, useFlask } from "../game/flask";
import { purchaseItem } from "../game/bazaar";
import { applyRatStones } from "../game/ratTail";
import { drawBlueBonus, applyBlueImmediate, applyEndOfRoundEffects, redBonusValue, applyYellowImmediate, applyYellowSetOneBonus, countPlacedColor, greenSetFourSpendMax, applyGreenSetFourSpend, greenSetTwoRewards, purpleChoices, applyPurpleChoice } from "../game/chipEffects";
import { rollBonusDie } from "../game/bonusDie";
import { spendRubiesForDroplet, spendRubiesForFlask, canAdvanceDroplet, canRefillFlask } from "../game/rubyActions";
import { decideExplodedChoice, decideMarketTurn } from "../game/ai";
import type { OmenCard } from "../game/omenTypes";
import { getRecipeSetForColor } from "../game/recipeBooks";

import { updatePlayer, getPlayer, createInitialState } from "./gameStoreHelpers";
import { advanceToNextRound } from "./gameStoreRound";
import type { RecipeMode } from "../game/recipeBooks";

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

function applyBonusDieReward(player: Player): { player: Player; result: ReturnType<typeof rollBonusDie> } {
  const result = rollBonusDie();

  if (result.type === "ruby") {
    return { result, player: { ...player, rubies: player.rubies + result.amount } };
  }

  if (result.type === "vp") {
    return { result, player: { ...player, score: player.score + result.amount } };
  }

  if (result.type === "droplet") {
    return {
      result,
      player: {
        ...player,
        crucible: {
          ...player.crucible,
          dropletPosition: Math.min(player.crucible.dropletPosition + result.amount, 32),
        },
      },
    };
  }

  return {
    result,
    player: {
      ...player,
      bag: { tokens: [...player.bag.tokens, makeFreeOrangeToken(player.id)] },
    },
  };
}

function spendAIRubies(player: Player): Player {
  let current = player;
  while (current.rubies >= 2) {
    if (!current.flask && canRefillFlask(current)) {
      current = spendRubiesForFlask(current);
    } else if (canAdvanceDroplet(current)) {
      current = spendRubiesForDroplet(current);
    } else {
      break;
    }
  }
  return current;
}

function applyOmenStartEffect(player: Player, omen: OmenCard | null): Player {
  if (!omen) return player;

  switch (omen.effect.type) {
    case "gain_rubies":
      return { ...player, rubies: player.rubies + omen.effect.amount };
    case "gain_vp":
      return { ...player, score: player.score + omen.effect.amount };
    case "advance_droplet":
      return {
        ...player,
        crucible: {
          ...player.crucible,
          dropletPosition: Math.min(player.crucible.dropletPosition + omen.effect.amount, 32),
          filledUpTo: Math.min(player.crucible.filledUpTo + omen.effect.amount, 33),
        },
      };
    case "gain_chip":
      return {
        ...player,
        bag: {
          tokens: [
            ...player.bag.tokens,
            makeFreeToken(player.id, omen.effect.color, omen.effect.value, omen.id),
          ],
        },
      };
    case "roll_bonus_die": {
      return applyBonusDieReward(player).player;
    }
    default:
      return player;
  }
}

function applyOmenScoringEffect(player: Player, omen: OmenCard | null, result: ReturnType<typeof calculateRoundScore>): Player {
  if (!omen) return player;

  switch (omen.effect.type) {
    case "bonus_if_survived":
      if (result.exploded) return player;
      return {
        ...player,
        score: player.score + (omen.effect.vp ?? 0),
        rubies: player.rubies + (omen.effect.rubies ?? 0),
      };
    case "bonus_if_exploded":
      if (!result.exploded) return player;
      return {
        ...player,
        score: player.score + (omen.effect.vp ?? 0),
        rubies: player.rubies + (omen.effect.rubies ?? 0),
      };
    case "bonus_for_color": {
      const count = countPlacedColor(player.crucible, omen.effect.color);
      return {
        ...player,
        score: player.score + count * (omen.effect.vpPerChip ?? 0),
        rubies: player.rubies + count * (omen.effect.rubiesPerChip ?? 0),
      };
    }
    case "bonus_for_white_limit":
      if (result.exploded || player.crucible.whiteSum > omen.effect.maxWhiteSum) return player;
      return { ...player, score: player.score + omen.effect.vp };
    default:
      return player;
  }
}

function rubyRewardForResult(omen: OmenCard | null, result: ReturnType<typeof calculateRoundScore>): number {
  if (!result.ruby) return 0;
  return omen?.effect.type === "double_ruby_space" ? 2 : 1;
}

function hasPlacedColor(player: Player, color: TokenColor): boolean {
  return player.crucible.slots.some((slot) => slot.token?.color === color);
}

function movementForToken(player: Player, token: Token, state: GameState): number {
  let movement = token.value;

  if (token.color === "red") {
    movement += redBonusValue(player.crucible, state.recipeBooks);
  }

  if (
    token.color === "white" &&
    token.value === 1 &&
    getRecipeSetForColor(state.recipeBooks, "red") === 4 &&
    hasPlacedColor(player, "red")
  ) {
    movement += 1;
  }

  if (player.yellowDoubleNext) {
    movement *= 2;
  }

  if (token.color === "yellow" && getRecipeSetForColor(state.recipeBooks, "yellow") === 4) {
    const yellowIndex = countPlacedColor(player.crucible, "yellow") + 1;
    movement += yellowIndex <= 3 ? yellowIndex : 0;
  }

  return movement;
}

function placeTokenForActiveBooks(
  player: Player,
  token: Token,
  bagTokens: Token[],
  state: GameState,
  options: { deferHumanYellowChoice?: boolean } = {}
): Player {
  if (token.color === "red" && getRecipeSetForColor(state.recipeBooks, "red") === 2) {
    return {
      ...player,
      bag: { tokens: bagTokens },
      redReserve: [...(player.redReserve ?? []), token],
    };
  }

  const previousToken = player.crucible.lastDrawnToken;
  const movement = movementForToken(player, token, state);
  const explosionThreshold =
    getRecipeSetForColor(state.recipeBooks, "yellow") === 3
      ? getExplosionThreshold(player.crucible)
      : 7;

  let updated: Player = {
    ...player,
    bag: { tokens: bagTokens },
    yellowDoubleNext: player.yellowDoubleNext ? false : player.yellowDoubleNext,
    crucible: placeToken(player.crucible, token, movement, explosionThreshold),
  };

  if (updated.crucible.exploded && (updated.blueProtectionDraws ?? 0) > 0) {
    updated = {
      ...updated,
      blueProtectionDraws: 0,
      blueBonusExplosion: true,
    };
  } else if ((updated.blueProtectionDraws ?? 0) > 0) {
    updated = { ...updated, blueProtectionDraws: Math.max(0, (updated.blueProtectionDraws ?? 0) - 1) };
  }

  if (token.color === "yellow" && !options.deferHumanYellowChoice) {
    updated = applyYellowImmediate(updated, previousToken, state.recipeBooks);
  }

  if (token.color === "blue") {
    updated = applyBlueImmediate(updated, token, state.recipeBooks);
  }

  return updated;
}

// ─── Store interface ──────────────────────────────────────────────────────────

interface GameStore {
  state: GameState;
  initGame: (recipeMode?: RecipeMode) => void;

  // Phase transitions
  dismissOmen: () => void;

  // Brewing
  humanDraw: () => { token: Token; exploded: boolean } | null;
  humanStop: () => void;
  humanUseFlask: () => void;

  // Blue chip choice: player picks which of 2 drawn tokens to keep (or neither)
  humanResolveBlue: (keepTokenId: string | null, extraTokens: Token[]) => void;
  humanResolveYellow: (returnPrevious: boolean) => void;
  humanResolveRed: (action: "place" | "save" | "bag") => void;
  humanResolvePurple: (choiceId: string) => void;
  humanResolveGreenReward: (color: TokenColor, value: number) => void;
  humanResolveGreenSpend: (steps: number) => void;

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
  commitAIBrewAndResolve: (finalAI: Player) => void;

  // Ruby spend helpers
  canAdvanceDroplet: () => boolean;
  canRefillFlask: () => boolean;

  // Internal
  _resolveEndOfRound: () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useGameStore = create<GameStore>((set, get) => ({
  state: createInitialState(),

  initGame: (recipeMode: RecipeMode = 1) => {
    soundManager.play("omen_reveal");
    set({ state: createInitialState(recipeMode) });
  },

  dismissOmen: () => {
    soundManager.play("round_start");
    set((s) => {
      let state = s.state;

      // Apply rat tails (round 2+) then go to brewing
      if (state.currentRound >= 2) {
        const withRats = applyRatStones(state.players, state.currentRound);
        // Apply rat stone offsets to crucibles
        const playersWithRats = withRats.map((p) => ({
          ...p,
          ratStoneOffset: p.ratStoneOffset +
            (state.currentOmen?.effect.type === "extra_rat_stone" && p.ratStoneOffset > 0
              ? state.currentOmen.effect.amount
              : 0),
          crucible: {
            ...p.crucible,
            filledUpTo: p.crucible.dropletPosition + p.ratStoneOffset +
              (state.currentOmen?.effect.type === "extra_rat_stone" && p.ratStoneOffset > 0
                ? state.currentOmen.effect.amount
                : 0),
          },
        }));
        state = { ...state, players: playersWithRats };
      }

      const playersWithOmen = state.players.map((player) =>
        applyOmenStartEffect(player, state.currentOmen)
      );

      return { state: { ...state, players: playersWithOmen, phase: "brewing" } };
    });
  },

  humanDraw: () => {
    let result: { token: Token; exploded: boolean } | null = null;

    set((s) => {
      const state = s.state;
      const human = getPlayer(state, "human");
      if (human.crucible.exploded || human.bag.tokens.length === 0) return s;

      const drawn = drawToken(human.bag);
      if (!drawn) return s;

      soundManager.play("token_draw");

      const previousToken = human.crucible.lastDrawnToken;
      const shouldAskYellow =
        drawn.token.color === "yellow" &&
        getRecipeSetForColor(state.recipeBooks, "yellow") === 1 &&
        previousToken?.color === "white";
      let updatedHuman = placeTokenForActiveBooks(
        human,
        drawn.token,
        drawn.bag.tokens,
        state,
        { deferHumanYellowChoice: shouldAskYellow }
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

      const phase = updatedHuman.crucible.exploded
        ? ((updatedHuman.redReserve?.length ?? 0) > 0 ? "red_choice" : "end_of_round")
        : state.phase;

      return {
        state: {
          ...updatePlayer(state, "human", () => updatedHuman),
          phase: phase as GamePhase,
          pendingRedTokens: phase === "red_choice" ? updatedHuman.redReserve : undefined,
        },
      };
    });

    return result;
  },

  humanStop: () => {
    soundManager.play("brew_stop");
    set((s) => {
      const human = getPlayer(s.state, "human");
      const pendingRedTokens = human.redReserve ?? [];
      return {
        state: {
          ...s.state,
          phase: pendingRedTokens.length > 0 ? "red_choice" as GamePhase : "end_of_round" as GamePhase,
          pendingRedTokens: pendingRedTokens.length > 0 ? pendingRedTokens : undefined,
        },
      };
    });
  },

  humanUseFlask: () => {
    set((s) => {
      const state = s.state;
      const human = getPlayer(state, "human");
      if (!canUseFlask(human)) return s;
      soundManager.play("flask_use");
      return { state: updatePlayer(state, "human", () => useFlask(human)) };
    });
  },

  humanResolveBlue: (keepTokenId: string | null, extraTokens: Token[]) => {
    set((s) => {
      const state = s.state;
      const human = getPlayer(state, "human");

      let updatedHuman: Player = {
        ...human,
        bag: {
          tokens: [
            ...human.bag.tokens,
            ...extraTokens.filter((t) => t.id !== keepTokenId),
          ],
        },
      };

      if (keepTokenId) {
        const kept = extraTokens.find((t) => t.id === keepTokenId);
        if (kept) {
          updatedHuman = placeTokenForActiveBooks(updatedHuman, kept, updatedHuman.bag.tokens, state);
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

      return {
        state: {
          ...updatePlayer(state, "human", () => updatedHuman),
          phase: updatedHuman.crucible.exploded ? "end_of_round" as GamePhase : "brewing" as GamePhase,
          pendingBlueTokens: undefined,
        },
      };
    });
  },

  humanResolveYellow: (returnPrevious: boolean) => {
    set((s) => {
      const state = s.state;
      const human = getPlayer(state, "human");
      const previousToken = state.pendingYellowPreviousToken ?? null;
      const updatedHuman = returnPrevious
        ? applyYellowSetOneBonus(human, previousToken)
        : human;

      return {
        state: {
          ...updatePlayer(state, "human", () => updatedHuman),
          phase: updatedHuman.crucible.exploded
            ? ((updatedHuman.redReserve?.length ?? 0) > 0 ? "red_choice" as GamePhase : "end_of_round" as GamePhase)
            : "brewing" as GamePhase,
          pendingYellowPreviousToken: undefined,
          pendingRedTokens: updatedHuman.crucible.exploded && (updatedHuman.redReserve?.length ?? 0) > 0
            ? updatedHuman.redReserve
            : undefined,
        },
      };
    });
  },

  humanResolveRed: (action: "place" | "save" | "bag") => {
    set((s) => {
      const state = s.state;
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

      return {
        state: {
          ...updatePlayer(state, "human", () => updatedHuman),
          phase: rest.length > 0 ? "red_choice" as GamePhase : "end_of_round" as GamePhase,
          pendingRedTokens: rest.length > 0 ? rest : undefined,
        },
      };
    });
  },

  humanResolveGreenSpend: (steps: number) => {
    set((s) => {
      const state = s.state;
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

  humanResolvePurple: (choiceId: string) => {
    set((s) => {
      const state = s.state;
      const human = getPlayer(state, "human");
      const choices = state.pendingPurpleChoices ?? [];
      const choice = choices.find((option) => option.id === choiceId) ?? choices[0];
      if (!choice) {
        return { state: { ...state, phase: state.pendingGreenRewards?.length ? "green_reward_choice" : state.pendingGreenSpendMax !== undefined ? "green_choice" : state.phaseAfterGreenChoice ?? "market", pendingPurpleChoices: undefined } };
      }

      const updatedHuman = applyPurpleChoice(human, choice);
      const nextPhase = state.pendingGreenRewards?.length
        ? "green_reward_choice" as GamePhase
        : state.pendingGreenSpendMax !== undefined
          ? "green_choice" as GamePhase
          : state.phaseAfterGreenChoice ?? "market" as GamePhase;

      return {
        state: {
          ...updatePlayer(state, "human", () => updatedHuman),
          phase: nextPhase,
          pendingPurpleChoices: undefined,
          phaseAfterGreenChoice: state.pendingGreenRewards?.length || state.pendingGreenSpendMax !== undefined
            ? state.phaseAfterGreenChoice
            : undefined,
        },
      };
    });
  },

  humanResolveGreenReward: (color: TokenColor, value: number) => {
    set((s) => {
      const state = s.state;
      const human = getPlayer(state, "human");
      const [reward, ...rest] = state.pendingGreenRewards ?? [];
      if (!reward) {
        return { state: { ...state, phase: state.phaseAfterGreenChoice ?? "market", pendingGreenRewards: undefined } };
      }

      const selected = reward.options.some((option) => option.color === color && option.value === value)
        ? { color, value }
        : reward.options[0];
      const token = makeFreeToken(human.id, selected.color, selected.value, "green-reward");
      const updatedHuman: Player = {
        ...human,
        bag: { tokens: [...human.bag.tokens, token] },
      };
      const resolvedNextPhase = rest.length > 0
        ? "green_reward_choice" as GamePhase
        : state.pendingGreenSpendMax !== undefined
          ? "green_choice" as GamePhase
          : state.phaseAfterGreenChoice ?? "market" as GamePhase;

      return {
        state: {
          ...updatePlayer(state, "human", () => updatedHuman),
          phase: resolvedNextPhase,
          pendingGreenRewards: rest.length > 0 ? rest : undefined,
          phaseAfterGreenChoice: rest.length > 0 || state.pendingGreenSpendMax !== undefined ? state.phaseAfterGreenChoice : undefined,
        },
      };
    });
  },

  humanExplodedChoice: (choice: ExplodedChoice) => {
    set((s) => {
      const state = s.state;
      const human = getPlayer(state, "human");
      const result = calculateRoundScore(human.crucible);

      const updatedHuman: Player = {
        ...human,
        score: human.score + (choice === "vp" ? result.vp : 0),
        coinsThisRound: choice === "coins" ? result.coins : 0,
      };

      const nextPhase: GamePhase = choice === "coins" ? "market" : "ruby_spend";

      return {
        state: {
          ...updatePlayer(state, "human", () => updatedHuman),
          phase: nextPhase,
          buyPhaseState: choice === "coins" ? scoringMarketState(updatedHuman) : null,
        },
      };
    });
  },

  humanSpendRubyDroplet: () => {
    set((s) => {
      const human = getPlayer(s.state, "human");
      if (!canAdvanceDroplet(human)) return s;
      return { state: updatePlayer(s.state, "human", () => spendRubiesForDroplet(human)) };
    });
  },

  humanSpendRubyFlask: () => {
    set((s) => {
      const human = getPlayer(s.state, "human");
      if (!canRefillFlask(human)) return s;
      return { state: updatePlayer(s.state, "human", () => spendRubiesForFlask(human)) };
    });
  },

  humanDoneRubySpend: () => {
    set((s) => {
      let state = s.state;
      let ai = getPlayer(state, "ai");
      let market = state.market;
      const purchases = decideMarketTurn(ai, market, state);
      let buyState: BuyPhaseState = {
        purchases: [],
        coinsSpent: 0,
        coinsAvailable: ai.coinsThisRound,
      };

      for (const itemId of purchases) {
        try {
          const result = purchaseItem(ai, market, buyState, itemId, state.currentRound);
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

      ai = spendAIRubies(ai);
      state = {
        ...updatePlayer(state, "ai", () => ai),
        market,
      };

      return { state: advanceToNextRound(state) };
    });
  },

  humanBuyItem: (itemId: string) => {
    set((s) => {
      const state = s.state;
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
    set((s) => ({
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

  commitAIBrewAndResolve: (finalAI: Player) => {
    set((s) => {
      const stateWithAI = {
        ...s.state,
        players: s.state.players.map((p) => p.kind === "ai" ? finalAI : p),
      };

      const human = getPlayer(stateWithAI, "human");
      const ai = getPlayer(stateWithAI, "ai");
      const humanResult = calculateRoundScore(human.crucible);
      const aiResult = calculateRoundScore(ai.crucible);

      let humanAfterBonus = human;
      let aiAfterBonus = ai;
      let humanBonus = null as ReturnType<typeof rollBonusDie> | null;
      let aiBonus = null as ReturnType<typeof rollBonusDie> | null;

      const humanCanRoll = !humanResult.exploded;
      const aiCanRoll = !aiResult.exploded;
      const bestSpace = Math.max(
        humanCanRoll ? humanResult.space : -1,
        aiCanRoll ? aiResult.space : -1
      );

      if (humanCanRoll && humanResult.space === bestSpace) {
        const bonus = applyBonusDieReward(humanAfterBonus);
        humanAfterBonus = bonus.player;
        humanBonus = bonus.result;
      }

      if (aiCanRoll && aiResult.space === bestSpace) {
        const bonus = applyBonusDieReward(aiAfterBonus);
        aiAfterBonus = bonus.player;
        aiBonus = bonus.result;
      }

      const greenRewards = greenSetTwoRewards(humanAfterBonus, stateWithAI.recipeBooks);
      const pendingPurpleChoices = purpleChoices(humanAfterBonus, stateWithAI.recipeBooks);
      let humanFinal = applyEndOfRoundEffects(
        humanAfterBonus,
        aiAfterBonus,
        stateWithAI.recipeBooks,
        { autoGreenSetTwo: false, autoGreenSetFour: false, autoPurple: false }
      );
      let aiFinal = applyEndOfRoundEffects(aiAfterBonus, humanAfterBonus, stateWithAI.recipeBooks);

      humanFinal = applyOmenScoringEffect(humanFinal, stateWithAI.currentOmen, humanResult);
      aiFinal = applyOmenScoringEffect(aiFinal, stateWithAI.currentOmen, aiResult);

      humanFinal = {
        ...humanFinal,
        rubies: humanFinal.rubies + rubyRewardForResult(stateWithAI.currentOmen, humanResult),
      };
      aiFinal = {
        ...aiFinal,
        rubies: aiFinal.rubies + rubyRewardForResult(stateWithAI.currentOmen, aiResult),
      };

      if (aiResult.exploded && aiFinal.blueBonusExplosion) {
        aiFinal = {
          ...aiFinal,
          score: aiFinal.score + aiResult.vp,
          coinsThisRound: aiResult.coins,
        };
      } else if (aiResult.exploded) {
        const choice = decideExplodedChoice(aiFinal, aiResult, stateWithAI);
        aiFinal = {
          ...aiFinal,
          score: aiFinal.score + (choice === "vp" ? aiResult.vp : 0),
          coinsThisRound: choice === "coins" ? aiResult.coins : 0,
        };
      } else {
        aiFinal = {
          ...aiFinal,
          score: aiFinal.score + aiResult.vp,
          coinsThisRound: aiResult.coins,
        };
      }

      if (humanResult.exploded && humanFinal.blueBonusExplosion) {
        humanFinal = {
          ...humanFinal,
          score: humanFinal.score + humanResult.vp,
          coinsThisRound: humanResult.coins,
        };
      } else if (!humanResult.exploded) {
        humanFinal = {
          ...humanFinal,
          score: humanFinal.score + humanResult.vp,
          coinsThisRound: humanResult.coins,
        };
      }

      const greenSpendMax = greenSetFourSpendMax(humanFinal, stateWithAI.recipeBooks);
      const humanNeedsExplosionChoice = humanResult.exploded && !humanFinal.blueBonusExplosion;
      const finalDecisionPhase = humanNeedsExplosionChoice ? "scoring" as GamePhase : "market" as GamePhase;
      const phaseAfterGreenChoice = finalDecisionPhase;
      const roundSummary = {
        round: stateWithAI.currentRound,
        bonusDieWinner: humanBonus ? human.id : aiBonus ? ai.id : null,
        players: [
          {
            playerId: human.id,
            name: human.name,
            space: humanResult.space,
            vp: humanResult.vp,
            coins: humanResult.coins,
            ruby: humanResult.ruby,
            exploded: humanResult.exploded,
            bonusDie: humanBonus,
          },
          {
            playerId: ai.id,
            name: ai.name,
            space: aiResult.space,
            vp: aiResult.vp,
            coins: aiResult.coins,
            ruby: aiResult.ruby,
            exploded: aiResult.exploded,
            bonusDie: aiBonus,
          },
        ],
      };
      const resolvedState = {
        ...stateWithAI,
        players: stateWithAI.players.map((p) => {
          if (p.id === "human") return humanFinal;
          if (p.id === "ai") return aiFinal;
          return p;
        }),
        phase: pendingPurpleChoices.length > 0
          ? "purple_choice" as GamePhase
          : greenRewards.length > 0
            ? "green_reward_choice" as GamePhase
            : greenSpendMax > 0
              ? "green_choice" as GamePhase
              : phaseAfterGreenChoice,
        buyPhaseState: humanNeedsExplosionChoice ? null : scoringMarketState(humanFinal),
        bonusDieResult: humanBonus,
        bonusDieWinner: humanBonus ? human.id : aiBonus ? ai.id : null,
        roundSummary,
        pendingPurpleChoices: pendingPurpleChoices.length > 0 ? pendingPurpleChoices : undefined,
        pendingGreenRewards: greenRewards.length > 0 ? greenRewards : undefined,
        pendingGreenSpendMax: greenSpendMax > 0 ? greenSpendMax : undefined,
        phaseAfterGreenChoice: pendingPurpleChoices.length > 0 || greenRewards.length > 0 || greenSpendMax > 0 ? phaseAfterGreenChoice : undefined,
      };

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
