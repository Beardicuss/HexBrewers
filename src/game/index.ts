// Types
export type { Token, TokenColor } from "./tokenTypes";
export { COLOR_UNLOCK_ROUND } from "./tokenTypes";
export type { Bag } from "./bagTypes";
export type { Crucible, CrucibleSlot } from "./crucibleTypes";
export { EXPLOSION_THRESHOLD, CRUCIBLE_SIZE, SPACE_VP, RUBY_SPACES, RAT_TAIL_AFTER_SPACES, getCoinsForSpace, getScoringSpace } from "./crucibleTypes";
export type { Player, PlayerKind } from "./playerTypes";
export type { OmenCard, OmenEffect } from "./omenTypes";
export type { MarketItem, BuyPhaseState } from "./bazaarTypes";
export type { GameState, GamePhase } from "./gameState";
export type { BonusDieResult } from "./bonusDie";
export type { ContentPackId, ContentPackDefinition, GameModules, GameSetup, PlayerCount } from "./contentPacks";
export { BASE_GAME_SETUP, BASE_MODULES, CONTENT_PACKS, createGameSetup, hasContentPack, normalizeContentPacks } from "./contentPacks";
export type { RuleHook, RuleHookPoint } from "./moduleHooks";
export { runRuleHooks } from "./moduleHooks";
export type { CovenantDefinition, CovenantKind, CovenantSeals } from "./covenants";
export { COVENANTS, canUseCovenant, createCovenantSeals, useCovenant } from "./covenants";

// Bag
export { drawToken, returnToken, isEmpty, countByColor, refillBag } from "./bag";
export { createStartingBag, addRound6WhiteChip } from "./bagFactory";

// Crucible
export { createCrucible, placeToken, hasExploded, getPlacedTokens, resetCrucible, advanceDroplet, getSpiralPosition, checkRubyEarned } from "./crucible";

// Scoring
export { calculateRoundScore, applyFullReward, applyExplodedReward, applyRoundReward } from "./scoring";
export { AFFLICTIONS, adjacentPlayerIndexes, calculateDistillationProgress, createAfflictionState, resolveDistillationRound } from "./distillation";
export type { AfflictionDefinition, AfflictionId, AfflictionState } from "./distillation";
export type { RoundScoreResult, ExplodedChoice } from "./scoring";

// Flask
export { canUseFlask, useFlask, restoreFlask, refillFlaskWithRubies } from "./flask";

// Market
export { canAfford, purchaseItem, refreshMarketAvailability, getAvailableItems } from "./bazaar";
export { createMarket } from "./bazaarFactory";

// Omen
export { OMEN_DECK, VEILGLASS_OMENS, omenDeckForPacks, createShuffledOmenDeck, drawOmen } from "./omen";

// Chip effects
export {
  redBonusValue,
  drawBlueBonus,
  applyYellowSetOneBonus,
  greenRubyBonus,
  countPlacedColor,
  applyPurpleSetOneBonus,
  applyBlackSetOneBonus,
  applyEndOfRoundEffects,
} from "./chipEffects";

// Rat tails
export { countRatTails, calculateRatStoneOffsets, applyRatStones } from "./ratTail";

// Ruby actions
export { canAdvanceDroplet, canRefillFlask, spendRubiesForDroplet, spendRubiesForFlask } from "./rubyActions";

// Bonus die
export { rollBonusDie, describeDieResult } from "./bonusDie";

// AI
export { AI_RIVAL_DOCTRINES, buildAIContext, getAIProfile, getAIRivalDoctrine, getAIRivalDoctrineByName, selectAIMode, getRiskTolerance } from "./aiStrategy";
export type { AIMode, AIDifficulty, AIContext, AIProfile } from "./aiStrategy";
export { decideAIRubyAction, decideBlueKeep, decideBrewingAction, decideFlaskUse, decideExplodedChoice, decideMarketTurn, decideGreenRewardChoice, evaluateMasterLookahead } from "./ai";
export type { BrewingDecision } from "./ai";
