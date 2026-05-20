import { create } from "zustand";
import type { GameState, GamePhase } from "../game/gameState";
import type { Player } from "../game/playerTypes";
import type { Token } from "../game/tokenTypes";
import type { ExplodedChoice } from "../game/scoring";
import type { BuyPhaseState } from "../game/bazaarTypes";
import { soundManager } from "../SoundManager";

import { placeToken } from "../game/crucible";
import { drawToken } from "../game/bag";
import { calculateRoundScore } from "../game/scoring";
import { canUseFlask, useFlask } from "../game/flask";
import { purchaseItem } from "../game/bazaar";
import { applyRatStones } from "../game/ratTail";
import { drawBlueBonus, applyEndOfRoundEffects, redBonusValue, applyYellowSetOneBonus } from "../game/chipEffects";
import { rollBonusDie } from "../game/bonusDie";
import { spendRubiesForDroplet, spendRubiesForFlask, canAdvanceDroplet, canRefillFlask } from "../game/rubyActions";
import { decideExplodedChoice, decideMarketTurn } from "../game/ai";

import { updatePlayer, getPlayer, createInitialState } from "./gameStoreHelpers";
import { advanceToNextRound } from "./gameStoreRound";

function makeFreeOrangeToken(playerId: string): Token {
  return {
    id: `orange-1-bonus-${playerId}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    color: "orange",
    value: 1,
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

      const previousToken = human.crucible.lastDrawnToken;
      const movement = drawn.token.value +
        (drawn.token.color === "red" ? redBonusValue(human.crucible) : 0);
      const updatedCrucible = placeToken(human.crucible, drawn.token, movement);

      if (drawn.token.color === "white") {
        soundManager.play("token_place_white");
      } else {
        soundManager.play("token_place");
      }

      if (updatedCrucible.exploded) {
        soundManager.play("explosion");
      }
      let updatedHuman: Player = {
        ...human,
        bag: drawn.bag,
        crucible: updatedCrucible,
      };

      result = { token: drawn.token, exploded: updatedCrucible.exploded };

      if (drawn.token.color === "yellow") {
        updatedHuman = applyYellowSetOneBonus(updatedHuman, previousToken);
      }

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

      return {
        state: {
          ...updatePlayer(state, "human", () => updatedHuman),
          phase: updatedHuman.crucible.exploded ? "end_of_round" as GamePhase : state.phase,
        },
      };
    });

    return result;
  },

  humanStop: () => {
    soundManager.play("brew_stop");
    set((s) => ({ state: { ...s.state, phase: "end_of_round" } }));
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
          const previousToken = human.crucible.lastDrawnToken;
          const movement = kept.value +
            (kept.color === "red" ? redBonusValue(human.crucible) : 0);
          const newCrucible = placeToken(human.crucible, kept, movement);
          updatedHuman = {
            ...updatedHuman,
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

          if (kept.color === "yellow") {
            updatedHuman = applyYellowSetOneBonus(updatedHuman, previousToken);
          }

          if (kept.color === "blue" && !newCrucible.exploded) {
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

      let humanFinal = applyEndOfRoundEffects(humanAfterBonus, aiAfterBonus);
      let aiFinal = applyEndOfRoundEffects(aiAfterBonus, humanAfterBonus);

      humanFinal = {
        ...humanFinal,
        rubies: humanFinal.rubies + (humanResult.ruby ? 1 : 0),
      };
      aiFinal = {
        ...aiFinal,
        rubies: aiFinal.rubies + (aiResult.ruby ? 1 : 0),
      };

      if (aiResult.exploded) {
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

      if (!humanResult.exploded) {
        humanFinal = {
          ...humanFinal,
          score: humanFinal.score + humanResult.vp,
          coinsThisRound: humanResult.coins,
        };
      }

      const resolvedState = {
        ...stateWithAI,
        players: stateWithAI.players.map((p) => {
          if (p.id === "human") return humanFinal;
          if (p.id === "ai") return aiFinal;
          return p;
        }),
        phase: humanResult.exploded ? "scoring" as GamePhase : "market" as GamePhase,
        buyPhaseState: humanResult.exploded ? null : scoringMarketState(humanFinal),
        bonusDieResult: humanBonus,
        bonusDieWinner: humanBonus ? human.id : aiBonus ? ai.id : null,
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
