import type { Player } from "./playerTypes";
import type { OmenCard } from "./omenTypes";
import type { Token } from "./tokenTypes";
import type { TokenColor } from "./tokenTypes";
import type { MarketItem, BuyPhaseState } from "./bazaarTypes";
import type { BonusDieResult } from "./bonusDie";
import type { RecipeBooks } from "./recipeBooks";
import type { AIDifficulty } from "./aiStrategy";
import type { GameSetup } from "./contentPacks";
import type { AfflictionId } from "./distillation";
import type { CovenantOffer, CovenantSelection } from "./covenants";
import type { BrewingIntentionId } from "./brewingIntentions";

export type RitualRuleset = "standard" | "ashenveil";

export interface PlayerRoundSummary {
  playerId: string;
  name: string;
  space: number;
  vp: number;
  coins: number;
  baseCoins?: number;
  ruby: boolean;
  exploded: boolean;
  bonusDie: BonusDieResult | null;
  prestigeAwarded: number | null;
  coinsAwarded: number | null;
  rubyAwarded: number;
  scoringRule: "both" | "choice" | "protected";
  doubleRuby: boolean;
  overflowValue: number;
  overflowVp: number;
  distillationProgress?: number;
  distillationPrestige?: number;
  distillationDroplet?: number;
  distillationHeadStart?: number;
  causal?: RoundCausalInsight;
}

export interface RoundCausalDraw {
  color: TokenColor;
  value: number;
  movement: number;
}

export interface RoundCausalInsight {
  riskDraw?: RoundCausalDraw & { pressureBefore: number; pressureAfter: number };
  valueDraw?: RoundCausalDraw;
  shatterCause?: RoundCausalDraw & { pressureBefore: number; pressureAfter: number };
  stoppedWithTokens: number;
  emptiedBag: boolean;
  purchaseContribution?: RoundCausalDraw & { acquiredRound: number };
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

export type OmenChoice =
  | { id: string; kind: "gain_vp"; amount: number }
  | { id: string; kind: "gain_rubies"; amount: number }
  | { id: string; kind: "advance_droplet"; amount: number }
  | { id: string; kind: "remove_white_one" }
  | { id: string; kind: "skip" }
  | { id: string; kind: "trade_ruby_for_market_chip"; itemId: string; color: TokenColor; value: number }
  | { id: string; kind: "trade_rat_tails_for_rubies"; amount: 1 | 2 | 3 }
  | { id: string; kind: "upgrade_sampled_chip"; sourceTokenId: string; itemId: string; color: TokenColor; fromValue: number; value: number }
  | { id: string; kind: "gain_market_chip"; itemId: string; color: TokenColor; value: number };

export type PurpleChoice =
  | { id: string; label: string; kind: "skip" }
  | { id: string; label: string; kind: "set1"; level: 1 | 2 | 3 }
  | { id: string; label: string; kind: "set2"; tradeCount: 1 | 2 | 3 }
  | { id: string; label: string; kind: "set4"; tokenId: string; color: TokenColor; fromValue: 1 | 2; toValue: 2 | 4 };

export type GamePhase =
  | "setup"
  | "rat_tails"     // round 2+: apply rat stones before brewing
  | "omen"          // reveal fortune teller card
  | "omen_choice"   // human resolves a choice printed on the current omen
  | "omen_strong_choice" // human may place one of five sampled chips after stopping
  | "omen_restart_choice" // continue or restart after the fifth placed chip
  | "intention"     // Ashenveil Ritual: choose this round's benefit and obligation
  | "scry_choice"    // Ashenveil Ritual: choose one of two candidates
  | "brewing"       // drawing tokens
  | "blue_choice"   // human must resolve blue chip draw-2-keep-1
  | "yellow_choice" // human may return the previous white chip after a yellow chip
  | "movement_choice" // human may apply an immediate ingredient movement bonus
  | "red_choice"    // human resolves reserved red chips before evaluation
  | "green_choice"  // human may spend green end-round ruby pairs
  | "green_move_choice" // human may move the final chip with green set 3
  | "green_reward_choice" // human chooses green set 2 reward chips
  | "purple_choice" // human resolves Wraithbloom end-round options
  | "end_of_round"  // chip effects (green, purple, black) + bonus die
  | "distillation"  // Veilglass Afflictions progress and Remedy Path reward
  | "scoring"       // award VP/coins/rubies
  | "ruby_spend"    // optional: spend rubies on droplet/flask
  | "market"        // buy phase (max 2 chips, different colors)
  | "game_over";

export interface GameState {
  ritualRuleset?: RitualRuleset;
  roundIntentions?: Record<string, BrewingIntentionId>;
  intentionRound?: number;
  setup: GameSetup;
  afflictionOffer?: AfflictionId[];
  covenantOffer?: CovenantOffer;
  selectedCovenants?: CovenantSelection;
  players: Player[];
  currentRound: number;      // 1–9
  totalRounds: number;       // always 9
  phase: GamePhase;
  activePlayerIndex: number;

  currentOmen: OmenCard | null;
  omenDeck: OmenCard[];

  market: MarketItem[];
  buyPhaseState: BuyPhaseState | null; // tracks purchases this round
  marketCompletedPlayerIds: string[];
  omenCompletedPlayerIds: string[];
  recipeBooks: RecipeBooks;
  aiDifficulty: AIDifficulty;

  bonusDieResult: BonusDieResult | null; // result of this round's die roll
  bonusDieWinner: string | null;         // player id who rolled
  roundSummary: RoundSummary | null;

  pendingBlueTokens?: Token[];           // tokens drawn exclusively during blue_choice phase
  pendingScryTokens?: Token[];
  scryPreparedTokenId?: string;
  pendingYellowPreviousToken?: Token;     // previous white token that may be returned
  pendingMovementChoice?: { amount: number; source: "red" | "yellow" };
  pendingRedTokens?: Token[];
  pendingPurpleChoices?: PurpleChoice[];
  pendingPurpleAIPlayerIds?: string[];
  pendingGreenRewards?: GreenRewardChoice[];
  pendingGreenAIPlayerIds?: string[];
  pendingGreenSpendMax?: number;          // max droplet steps from green set 4
  pendingGreenMoveAmount?: number;        // optional final-chip movement from green set 3
  pendingOmenChoices?: OmenChoice[];
  pendingOmenSampleTokens?: Token[];
  pendingOmenRewardPlayerIds?: string[];
  pendingOmenUpgradePlayerIds?: string[];
  phaseAfterOmenChoice?: GamePhase;
  phaseAfterGreenChoice?: GamePhase;

  winner: Player | null;
  winners: Player[];
}
