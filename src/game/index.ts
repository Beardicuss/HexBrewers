// Types
export type { Token, TokenColor } from "./tokenTypes";
export { COLOR_UNLOCK_ROUND } from "./tokenTypes";
export type { Bag } from "./bagTypes";
export type { Crucible, CrucibleSlot } from "./crucibleTypes";
export { EXPLOSION_THRESHOLD, CRUCIBLE_SIZE, SPACE_VP, RUBY_SPACES, RAT_TAIL_AFTER_SPACES, getCoinsForSpace } from "./crucibleTypes";
export type { Player, PlayerKind } from "./playerTypes";
export type { OmenCard, OmenEffect } from "./omenTypes";
export type { MarketItem, BuyPhaseState } from "./bazaarTypes";
export type { GameState, GamePhase } from "./gameState";
export type { BonusDieResult } from "./bonusDie";

// Bag
export { drawToken, returnToken, isEmpty, countByColor, refillBag } from "./bag";
export { createStartingBag, addRound6WhiteChip } from "./bagFactory";

// Crucible
export { createCrucible, placeToken, hasExploded, getPlacedTokens, resetCrucible, advanceDroplet, getSpiralPosition, checkRubyEarned } from "./crucible";

// Scoring
export { calculateRoundScore, applyFullReward, applyExplodedReward } from "./scoring";
export type { RoundScoreResult, ExplodedChoice } from "./scoring";

// Flask
export { canUseFlask, useFlask, restoreFlask, refillFlaskWithRubies } from "./flask";

// Market
export { canAfford, purchaseItem, refreshMarketAvailability, getAvailableItems } from "./bazaar";
export { createMarket } from "./bazaarFactory";

// Omen
export { OMEN_DECK, createShuffledOmenDeck, drawOmen } from "./omen";

// Chip effects
export { redBonusValue, drawBlueBonus, yellowRubyBonus, greenRubyBonus, purpleVPBonus, blackDropletBonus, applyEndOfRoundEffects } from "./chipEffects";

// Rat tails
export { countRatTails, calculateRatStoneOffsets, applyRatStones } from "./ratTail";

// Ruby actions
export { canAdvanceDroplet, canRefillFlask, spendRubiesForDroplet, spendRubiesForFlask } from "./rubyActions";

// Bonus die
export { rollBonusDie, describeDieResult } from "./bonusDie";

// AI
export { buildAIContext, selectAIMode, getRiskTolerance } from "./aiStrategy";
export type { AIMode, AIContext } from "./aiStrategy";
export { decideBrewingAction, decideFlaskUse, decideExplodedChoice, decideMarketTurn } from "./ai";
export type { BrewingDecision } from "./ai";
