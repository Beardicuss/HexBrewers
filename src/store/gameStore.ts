import { create } from "zustand";
import type { GameState, GamePhase } from "../game/gameState";
import type { Player } from "../game/playerTypes";
import type { Token } from "../game/tokenTypes";
import type { ExplodedChoice } from "../game/scoring";
import type { BuyPhaseState } from "../game/bazaarTypes";
import { soundManager } from "../SoundManager";

import { placeToken, hasExploded, getPlacedTokens, checkRubyEarned } from "../game/crucible";
import { drawToken } from "../game/bag";
import { calculateRoundScore, applyFullReward, applyExplodedReward } from "../game/scoring";
import { canUseFlask, useFlask, restoreFlask } from "../game/flask";
import { purchaseItem } from "../game/bazaar";
import { drawOmen } from "../game/omen";
import { applyRatStones } from "../game/ratTail";
import { drawBlueBonus, applyEndOfRoundEffects, yellowRubyBonus } from "../game/chipEffects";
import { rollBonusDie } from "../game/bonusDie";
import { spendRubiesForDroplet, spendRubiesForFlask, canAdvanceDroplet, canRefillFlask } from "../game/rubyActions";
import { getCoinsForSpace } from "../game/crucibleTypes";

import { updatePlayer, getPlayer, createInitialState } from "./gameStoreHelpers";
import { advanceToNextRound } from "./gameStoreRound";

// ─── Store interface ──────────────────────────────────────────────────────────

interface GameStore {
  state: GameState;
  initGame: () => void;

  // Phase transitions
  dismissOmen: () => void;

  // Brewing
  humanDraw: () => { token: Token; exploded: boolean } | null;
  humanStop: () => void;
  humanUseFlask: () => void;

  // Blue chip choice: player picks which of 2 drawn tokens to keep (or neither)
  humanResolveBlue: (keepTokenId: string | null, extraTokens: Token[]) => void;

  // Scoring
  humanExplodedChoice: (choice: ExplodedChoice) => void;

  // Ruby spending (end of round)
  humanSpendRubyDroplet: () => void;
  humanSpendRubyFlask: () => void;
  humanDoneRubySpend: () => void;

  // Market
  humanBuyItem: (itemId: string) => void;
  humanEndMarket: () => void;

  // AI full turn (run by AITurnAnimator, result committed here)
  commitAITurn: (finalAI: Player) => void;

  // Ruby spend helpers
  canAdvanceDroplet: () => boolean;
  canRefillFlask: () => boolean;

  // Internal
  _resolveEndOfRound: () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useGameStore = create<GameStore>((set, get) => ({
  state: createInitialState(),

  initGame: () => {
    soundManager.play("omen_reveal");
    set({ state: createInitialState() });
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
          crucible: {
            ...p.crucible,
            filledUpTo: p.crucible.dropletPosition + p.ratStoneOffset,
          },
        }));
        state = { ...state, players: playersWithRats };
      }

      return { state: { ...state, phase: "brewing" } };
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

      const updatedCrucible = placeToken(human.crucible, drawn.token);

      if (drawn.token.color === "white") {
        soundManager.play("token_place_white");
      } else {
        soundManager.play("token_place");
      }

      if (updatedCrucible.exploded) {
        soundManager.play("explosion");
      }
      const updatedHuman: Player = {
        ...human,
        bag: drawn.bag,
        crucible: updatedCrucible,
      };

      result = { token: drawn.token, exploded: updatedCrucible.exploded };

      // Blue chip: trigger draw-N-keep-1 phase based on its value
      if (drawn.token.color === "blue" && !updatedCrucible.exploded) {
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

      // Yellow chip: immediately earn rubies
      let finalHuman = updatedHuman;
      if (drawn.token.color === "yellow") {
        const bonus = yellowRubyBonus(updatedCrucible);
        finalHuman = { ...updatedHuman, rubies: updatedHuman.rubies + bonus };
      }

      return { state: updatePlayer(state, "human", () => finalHuman) };
    });

    return result;
  },

  humanStop: () => {
    soundManager.play("brew_stop");
    set((s) => ({ state: { ...s.state, phase: "end_of_round" } }));
    get()._resolveEndOfRound();
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

      let updatedHuman = human;

      if (keepTokenId) {
        const kept = extraTokens.find((t) => t.id === keepTokenId);
        if (kept) {
          const newCrucible = placeToken(human.crucible, kept);
          updatedHuman = {
            ...human,
            crucible: newCrucible,
          };
          if (kept.color === "white") {
            soundManager.play("token_place_white");
          } else {
            soundManager.play("token_place");
          }
          if (newCrucible.exploded) {
            soundManager.play("explosion");
          }
        }
      }

      // Put unkept tokens back in bag
      const unkept = extraTokens.filter((t) => t.id !== keepTokenId);
      const newBagTokens = [...updatedHuman.bag.tokens, ...unkept];
      updatedHuman = { ...updatedHuman, bag: { tokens: newBagTokens } };

      return {
        state: {
          ...updatePlayer(state, "human", () => updatedHuman),
          phase: "brewing" as GamePhase,
          pendingBlueTokens: undefined,
        },
      };
    });
  },

  humanExplodedChoice: (choice: ExplodedChoice) => {
    set((s) => {
      const state = s.state;
      const human = getPlayer(state, "human");
      const result = calculateRoundScore(human.crucible);
      const reward = applyExplodedReward(result, choice);

      const updatedHuman: Player = {
        ...human,
        score: human.score + reward.vp,
        coinsThisRound: reward.coins,
        rubies: human.rubies + reward.rubies,
      };

      return {
        state: {
          ...updatePlayer(state, "human", () => updatedHuman),
          phase: "ruby_spend" as GamePhase,
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
    soundManager.play("market_open");
    set((s) => {
      const state = s.state;
      const human = getPlayer(state, "human");
      const buyState: BuyPhaseState = {
        purchases: [],
        coinsSpent: 0,
        coinsAvailable: human.coinsThisRound,
      };
      return {
        state: {
          ...state,
          phase: "market" as GamePhase,
          buyPhaseState: buyState,
        },
      };
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
    // Market done — AI turn is handled externally by AITurnAnimator
    // After AI commits, we advance the round
  },

  commitAITurn: (finalAI: Player) => {
    set((s) => {
      const state = { ...s.state, players: s.state.players.map((p) => p.kind === "ai" ? finalAI : p) };
      return { state: advanceToNextRound(state) };
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

  // Internal — called after human stops or explodes
  _resolveEndOfRound: () => {
    set((s) => {
      const state = s.state;
      const human = getPlayer(state, "human");
      const result = calculateRoundScore(human.crucible);

      if (result.exploded) {
        // Human must choose — go to scoring phase for choice
        return { state: { ...state, phase: "scoring" as GamePhase } };
      }

      // Survived: apply chip effects + full reward
      const withEffects = applyEndOfRoundEffects(human);
      const reward = applyFullReward(result);

      // Bonus die: human earns it if they reached highest non-exploded space
      const aiPlayer = getPlayer(state, "ai");
      const humanWinsDie = !result.exploded &&
        (aiPlayer.crucible.exploded || human.crucible.filledUpTo >= aiPlayer.crucible.filledUpTo);

      let bonusDieResult = null;
      let bonusDieWinner = null;
      let humanAfterDie = withEffects;

      if (humanWinsDie) {
        bonusDieResult = rollBonusDie();
        bonusDieWinner = human.id;
        if (bonusDieResult.type === "ruby") {
          humanAfterDie = { ...humanAfterDie, rubies: humanAfterDie.rubies + bonusDieResult.amount };
        } else if (bonusDieResult.type === "coins") {
          humanAfterDie = { ...humanAfterDie, coinsThisRound: humanAfterDie.coinsThisRound + bonusDieResult.amount };
        }
      }

      const finalHuman: Player = {
        ...humanAfterDie,
        score: humanAfterDie.score + reward.vp,
        coinsThisRound: (humanAfterDie.coinsThisRound || 0) + reward.coins,
        rubies: humanAfterDie.rubies + reward.rubies,
      };

      return {
        state: {
          ...updatePlayer(state, "human", () => finalHuman),
          phase: "ruby_spend" as GamePhase,
          bonusDieResult,
          bonusDieWinner,
        },
      };
    });
  },
} as any));
