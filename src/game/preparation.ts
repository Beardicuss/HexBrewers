import type { GameState } from "./gameState";
import type { Player } from "./playerTypes";
import { calculateRoundScore } from "./scoring";

export const PREPARATION_MAX_PRESSURE = 3;
export const PREPARATION_MAX_SPACE = 7;

export function canBankEmber(player: Player, state: GameState): boolean {
  if (state.ritualRuleset !== "ashenveil" || state.currentRound >= state.totalRounds) return false;
  if (player.crucible.exploded || player.preparedEmberForRound !== undefined) return false;
  if (player.bag.tokens.length < 2) return false;
  const result = calculateRoundScore(player.crucible);
  return player.crucible.whiteSum <= PREPARATION_MAX_PRESSURE && result.space <= PREPARATION_MAX_SPACE;
}

export function bankEmber(player: Player, state: GameState): Player {
  return canBankEmber(player, state)
    ? { ...player, preparedEmberForRound: state.currentRound + 1 }
    : player;
}

export function hasPreparedEmber(player: Player, state: GameState): boolean {
  return state.ritualRuleset === "ashenveil" && player.preparedEmberForRound === state.currentRound;
}
