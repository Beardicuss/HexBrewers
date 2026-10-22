// Ruby spending actions — performed at end of each round
// 2 rubies → move droplet forward 1 space
// 2 rubies → refill flask (can do multiple times if you have enough rubies)

import type { Player } from "./playerTypes";
import { advanceDroplet } from "./crucible";
import { CRUCIBLE_SIZE } from "./crucibleTypes";
import { GAME_RULES } from "./ruleConstants";

export function canAdvanceDroplet(player: Player): boolean {
  return player.rubies >= GAME_RULES.rubyActionCost && player.crucible.dropletPosition < CRUCIBLE_SIZE - 1;
}

export function canRefillFlask(player: Player): boolean {
  return player.rubies >= GAME_RULES.rubyActionCost && !player.flask;
}

export function spendRubiesForDroplet(player: Player): Player {
  if (!canAdvanceDroplet(player)) throw new Error("Cannot advance droplet.");
  return {
    ...player,
    rubies: player.rubies - GAME_RULES.rubyActionCost,
    crucible: advanceDroplet(player.crucible),
  };
}

export function spendRubiesForFlask(player: Player): Player {
  if (!canRefillFlask(player)) throw new Error("Cannot refill flask.");
  return {
    ...player,
    rubies: player.rubies - GAME_RULES.rubyActionCost,
    flask: true,
  };
}
