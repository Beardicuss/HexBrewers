import { EXPLOSION_THRESHOLD } from "./crucibleTypes";

export const GAME_RULES = {
  minPlayers: 2,
  maxPlayers: 4,
  totalRounds: 9,
  safeVoidshardPressure: EXPLOSION_THRESHOLD,
  explosionPressure: EXPLOSION_THRESHOLD + 1,
  marketPurchaseLimit: 2,
  rubyActionCost: 2,
  finalCoinConversion: 5,
  finalRubyConversion: 2,
} as const;
