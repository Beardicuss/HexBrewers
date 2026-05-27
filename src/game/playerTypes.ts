import type { Bag } from "./bagTypes";
import type { Crucible } from "./crucibleTypes";

export type PlayerKind = "human" | "ai";

export interface Player {
  id: string;
  name: string;
  kind: PlayerKind;

  bag: Bag;
  crucible: Crucible;

  // Rubies — separate currency, earned by landing on ruby spaces
  // Spent end-of-round: 2 rubies → move droplet +1, or 2 rubies → refill flask
  rubies: number;

  // Coins — earned each round equal to scoring space number, fully spent
  // Not persistent: they're calculated at start of buy phase, spent, then gone
  coinsThisRound: number;

  score: number;      // total VP accumulated on scoring track
  flask: boolean;     // true = flask available this round
  ratStoneOffset: number; // spaces ahead of droplet the rat stone sits (catchup)

  // Recipe-book temporary effects. They reset between rounds.
  blueProtectionDraws?: number;
  yellowDoubleNext?: boolean;
  redReserve?: import("./tokenTypes").Token[];
}
