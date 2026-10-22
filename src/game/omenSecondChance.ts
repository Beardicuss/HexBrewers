import { createCrucible, getPlacedTokens } from "./crucible";
import type { GameState } from "./gameState";
import type { Player } from "./playerTypes";

export function shouldOfferSecondChance(state: GameState, player: Player): boolean {
  return state.currentOmen?.effect.type === "second_chance" &&
    !player.omenSecondChanceUsed &&
    player.crucible.placements.length >= 5;
}

export function restartBrew(player: Player): Player {
  const reset = createCrucible();
  const start = Math.min(32, player.crucible.dropletPosition + player.ratStoneOffset);
  return {
    ...player,
    bag: { tokens: [...player.bag.tokens, ...getPlacedTokens(player.crucible)] },
    crucible: {
      ...reset,
      dropletPosition: player.crucible.dropletPosition,
      filledUpTo: start,
    },
    omenSecondChanceUsed: true,
  };
}
