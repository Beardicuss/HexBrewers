import type { Player } from "./playerTypes";
import type { Token } from "./tokenTypes";
import { returnToken } from "./bag";
import { removePlacedToken } from "./crucible";

// Flask rules (official):
// 1. Can only be used on the LAST chip drawn (lastDrawnToken)
// 2. CANNOT be used if that chip caused an explosion
// 3. Only works on white chips
// 4. One use per round — costs 2 rubies to refill between rounds

export function canUseFlask(player: Player): boolean {
  const token = player.crucible.lastDrawnToken;
  if (!token) return false;
  if (!player.flask) return false;
  if (token.color !== "white") return false;
  if (player.crucible.exploded) return false; // cannot use if it caused explosion
  return true;
}

// Use flask: return last white token to bag, reverse its whiteSum contribution,
// mark flask as spent.
export function useFlask(player: Player): Player {
  if (!canUseFlask(player)) {
    throw new Error("Flask cannot be used right now.");
  }

  const token = player.crucible.lastDrawnToken!;
  const lastPlacement = player.crucible.placements[player.crucible.placements.length - 1];
  if (!lastPlacement || lastPlacement.token.id !== token.id) {
    throw new Error("Flask placement history is inconsistent.");
  }
  const remainingPlacements = player.crucible.placements.slice(0, -1);

  // Reverse the token placement
  const withoutToken = removePlacedToken(player.crucible, token.id);
  const revertedCrucible = {
    ...withoutToken,
    filledUpTo: lastPlacement.startPosition,
    whiteSum: player.crucible.whiteSum - token.value,
    exploded: false,
    lastDrawnToken: remainingPlacements[remainingPlacements.length - 1]?.token ?? null,
    placements: remainingPlacements,
    overflowTokens: withoutToken.overflowTokens,
  };

  return {
    ...player,
    bag: returnToken(player.bag, token),
    crucible: revertedCrucible,
    flask: false,
    flaskUses: (player.flaskUses ?? 0) + 1,
  };
}

export function restoreFlask(player: Player): Player {
  return { ...player, flask: true };
}

// Refill flask via rubies (costs 2 rubies, called end-of-round)
export function refillFlaskWithRubies(player: Player): Player {
  if (player.rubies < 2) throw new Error("Not enough rubies to refill flask.");
  return { ...player, rubies: player.rubies - 2, flask: true };
}
