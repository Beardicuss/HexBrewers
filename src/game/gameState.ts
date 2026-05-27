import type { Player } from "./playerTypes";
import type { OmenCard } from "./omenTypes";
import type { Token } from "./tokenTypes";
import type { MarketItem, BuyPhaseState } from "./bazaarTypes";
import type { BonusDieResult } from "./bonusDie";
import type { RecipeBooks } from "./recipeBooks";

export type GamePhase =
  | "setup"
  | "rat_tails"     // round 2+: apply rat stones before brewing
  | "omen"          // reveal fortune teller card
  | "brewing"       // drawing tokens
  | "blue_choice"   // human must resolve blue chip draw-2-keep-1
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

  pendingBlueTokens?: Token[];           // tokens drawn exclusively during blue_choice phase

  winner: Player | null;
}
