// Rat tail catchup mechanic — official Quacks rule from round 2 onward
// Each player counts rat tails between their score and the leader's score.
// Their rat stone is placed that many spaces AHEAD of their droplet.
// This gives trailing players a head start in the brewing phase.

import { RAT_TAIL_AFTER_SPACES } from "./crucibleTypes";
import type { Player } from "./playerTypes";

// Count rat tail icons between two score positions on the scoring track.
// Rat tails appear after specific spaces (see crucibleTypes).
export function countRatTails(fromScore: number, toScore: number): number {
  if (fromScore >= toScore) return 0;
  return RAT_TAIL_AFTER_SPACES.filter(
    (space) => space >= fromScore && space < toScore
  ).length;
}

// Calculate rat stone offset for each player vs the leader.
// Leader gets 0. All others get N = rat tails between them and leader.
export function calculateRatStoneOffsets(
  players: Player[]
): Map<string, number> {
  const leaderScore = Math.max(...players.map((p) => p.score));
  const offsets = new Map<string, number>();

  for (const player of players) {
    if (player.score >= leaderScore) {
      offsets.set(player.id, 0); // leader gets no bonus
    } else {
      offsets.set(player.id, countRatTails(player.score, leaderScore));
    }
  }

  return offsets;
}

// Apply rat stone offsets to players at the start of each round (round 2+)
export function applyRatStones(players: Player[], currentRound: number): Player[] {
  if (currentRound < 2) {
    // Round 1: no rat tails
    return players.map((p) => ({ ...p, ratStoneOffset: 0 }));
  }

  const offsets = calculateRatStoneOffsets(players);

  return players.map((p) => ({
    ...p,
    ratStoneOffset: offsets.get(p.id) ?? 0,
  }));
}
