import type { Player } from "./playerTypes";
import type { OmenCard } from "./omenTypes";
import type { Token } from "./tokenTypes";
import type { TokenColor } from "./tokenTypes";
import type { MarketItem, BuyPhaseState } from "./bazaarTypes";
import type { BonusDieResult } from "./bonusDie";
import type { RecipeBooks } from "./recipeBooks";

export interface PlayerRoundSummary {
  playerId: string;
  name: string;
  space: number;
  vp: number;
  coins: number;
  ruby: boolean;
  exploded: boolean;
  bonusDie: BonusDieResult | null;
}

export interface RoundSummary {
  round: number;
  players: PlayerRoundSummary[];
  bonusDieWinner: string | null;
}

export interface GreenRewardChoice {
  sourceTokenId: string;
  sourceValue: number;
  options: Array<{ color: TokenColor; value: number }>;
}

export type PurpleChoice =
  | { id: string; label: string; kind: "skip" }
  | { id: string; label: string; kind: "set1"; level: 1 | 2 | 3 }
  | { id: string; label: string; kind: "set2"; tradeCount: 1 | 2 | 3 }
  | { id: string; label: string; kind: "set4"; tokenId: string; color: TokenColor; fromValue: 1 | 2; toValue: 2 | 4 };

export type GamePhase =
  | "setup"
  | "rat_tails"     // round 2+: apply rat stones before brewing
  | "omen"          // reveal fortune teller card
  | "brewing"       // drawing tokens
  | "blue_choice"   // human must resolve blue chip draw-2-keep-1
  | "yellow_choice" // human may return the previous white chip after a yellow chip
  | "red_choice"    // human resolves reserved red chips before evaluation
  | "green_choice"  // human may spend green end-round ruby pairs
  | "green_reward_choice" // human chooses green set 2 reward chips
  | "purple_choice" // human resolves Wraithbloom end-round options
  | "end_of_round"  // chip effects (green, purple, black) + bonus die
  | "scoring"       // award VP/coins/rubies
  | "ruby_spend"    // optional: spend rubies on droplet/flask
  | "market"        // buy phase (max 2 chips, different colors)
  | "game_over";

export interface GameState {
  players: Player[];
  currentRound: number;      // 1–9
  totalRounds: number;       // always 9
  phase: GamePhase;
  activePlayerIndex: number;

  currentOmen: OmenCard | null;
  omenDeck: OmenCard[];

  market: MarketItem[];
  buyPhaseState: BuyPhaseState | null; // tracks purchases this round
  recipeBooks: RecipeBooks;

  bonusDieResult: BonusDieResult | null; // result of this round's die roll
  bonusDieWinner: string | null;         // player id who rolled
  roundSummary: RoundSummary | null;

  pendingBlueTokens?: Token[];           // tokens drawn exclusively during blue_choice phase
  pendingYellowPreviousToken?: Token;     // previous white token that may be returned
  pendingRedTokens?: Token[];
  pendingPurpleChoices?: PurpleChoice[];
  pendingGreenRewards?: GreenRewardChoice[];
  pendingGreenSpendMax?: number;          // max droplet steps from green set 4
  phaseAfterGreenChoice?: GamePhase;

  winner: Player | null;
}
