// Chip effects — applied when specific colored tokens are drawn or at end of round
// This implements the actual ingredient effects from the official game (Set 1 baseline)

import type { Token } from "./tokenTypes";
import type { Crucible } from "./crucibleTypes";
import type { Player } from "./playerTypes";
import type { Bag } from "./bagTypes";
import { drawToken } from "./bag";

export interface EffectResult {
  player: Player;
  pendingBlueDraw?: {           // blue: must resolve draw-2-keep-1
    drawn: [Token, Token | null]; // up to 2 drawn tokens
  };
}

// ── IMMEDIATE EFFECTS (triggered when chip is drawn) ─────────────────────────

// Red (Bloodthorn): official Set 1 behavior. It moves extra spaces based on
// how many orange chips are already in the pot.
export function redBonusValue(crucible: Crucible): number {
  const orangeCount = crucible.slots.filter(
    (s) => s.token?.color === "orange"
  ).length;
  if (orangeCount >= 3) return 2;
  if (orangeCount >= 1) return 1;
  return 0;
}

// Blue (Frostbile): draw extra chips equal to blue chip's value, place 1 (or 0) back into pot
// Returns drawn tokens for UI to present choice
export function drawBlueBonus(bag: Bag, chipValue: number): {
  bag: Bag;
  drawn: Token[];
} {
  const tokens: Token[] = [];
  let currentBag = bag;
  const drawCount = chipValue; // draw 1, 2, or 4 based on chip value

  for (let i = 0; i < drawCount; i++) {
    const result = drawToken(currentBag);
    if (!result) break;
    tokens.push(result.token);
    currentBag = result.bag;
  }

  return { bag: currentBag, drawn: tokens };
}

// Yellow (Plaguedust): official Set 1 behavior. If placed directly after a
// white chip, that white chip may be returned to the bag; the yellow stays put.
export function applyYellowSetOneBonus(player: Player, previousToken: Token | null): Player {
  if (!previousToken || previousToken.color !== "white") return player;

  return {
    ...player,
    bag: { tokens: [...player.bag.tokens, previousToken] },
    crucible: {
      ...player.crucible,
      whiteSum: Math.max(0, player.crucible.whiteSum - previousToken.value),
      slots: player.crucible.slots.map((slot) =>
        slot.token?.id === previousToken.id ? { ...slot, token: null } : slot
      ),
    },
  };
}

// ── END-OF-ROUND EFFECTS ─────────────────────────────────────────────────────

// Green (Deathweave): earn 1 ruby if green chip is on the last or second-to-last space
export function greenRubyBonus(crucible: Crucible): number {
  const placed = crucible.slots.filter((s) => s.token !== null);
  const lastTwo = placed.slice(-2);
  return lastTwo.filter((s) => s.token?.color === "green").length;
}

export function countPlacedColor(crucible: Crucible, color: Token["color"]): number {
  return crucible.slots.filter((s) => s.token?.color === color).length;
}

export function applyPurpleSetOneBonus(player: Player): Player {
  const purpleCount = countPlacedColor(player.crucible, "purple");
  if (purpleCount <= 0) return player;

  if (purpleCount === 1) {
    return { ...player, score: player.score + 1 };
  }

  if (purpleCount === 2) {
    return { ...player, score: player.score + 1, rubies: player.rubies + 1 };
  }

  return {
    ...player,
    score: player.score + 2,
    crucible: {
      ...player.crucible,
      dropletPosition: Math.min(player.crucible.dropletPosition + 1, 32),
    },
  };
}

export function applyBlackSetOneBonus(player: Player, opponent: Player): Player {
  const blackCount = countPlacedColor(player.crucible, "black");
  if (blackCount <= 0) return player;

  const opponentBlackCount = countPlacedColor(opponent.crucible, "black");
  if (blackCount < opponentBlackCount) return player;

  const moved = {
    ...player,
    crucible: {
      ...player.crucible,
      dropletPosition: Math.min(player.crucible.dropletPosition + 1, 32),
    },
  };

  return blackCount > opponentBlackCount
    ? { ...moved, rubies: moved.rubies + 1 }
    : moved;
}

// Apply all end-of-round chip effects to a player.
export function applyEndOfRoundEffects(player: Player, opponent?: Player): Player {
  const { crucible } = player;

  let updated = {
    ...player,
    rubies: player.rubies + greenRubyBonus(crucible),
  };

  updated = applyPurpleSetOneBonus(updated);

  if (opponent) {
    updated = applyBlackSetOneBonus(updated, opponent);
  }

  return updated;
}
