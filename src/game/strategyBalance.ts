import { countByColor } from "./bag";
import { canAfford } from "./bazaar";
import type { BuyPhaseState, MarketItem } from "./bazaarTypes";
import type { Player } from "./playerTypes";
import type { GameState } from "./gameState";
import { scoreMarketItem } from "./aiMarket";
import type { RecipeColor } from "./recipeBooks";
import type { TokenColor } from "./tokenTypes";

export type BaseRecipeSet = 1 | 2 | 3 | 4;
export type EffectChoiceDepth = "active" | "conditional" | "passive";

export interface RecipeEffectAudit {
  color: RecipeColor;
  set: BaseRecipeSet;
  choiceDepth: EffectChoiceDepth;
  identity: string;
  synergies: TokenColor[];
  counterweights: string[];
  watchpoint: string | null;
}

export interface BaseStrategyProfile {
  id: string;
  set: BaseRecipeSet;
  name: string;
  preferredColors: TokenColor[];
  thesis: string;
  counterweight: string;
}

const audit = (
  color: RecipeColor,
  set: BaseRecipeSet,
  choiceDepth: EffectChoiceDepth,
  identity: string,
  synergies: TokenColor[],
  counterweights: string[],
  watchpoint: string | null = null,
): RecipeEffectAudit => ({ color, set, choiceDepth, identity, synergies, counterweights, watchpoint });

/** Canonical Phase-2 audit. Passive effects are not automatically weak: the
 * watchpoint records where a passive payoff risks becoming choice-free. */
export const BASE_EFFECT_AUDIT: RecipeEffectAudit[] = [
  audit("blue", 1, "active", "Selective draw control", ["yellow", "purple"], ["Adds draws and can expose more Voidshards", "High-value chips are expensive"]),
  audit("red", 1, "conditional", "Brimstone resonance", ["orange"], ["Requires orange setup", "Red and orange compete for purchases"]),
  audit("yellow", 1, "active", "Voidshard recovery", ["blue", "red"], ["Unlocks in round 2", "Only matters after a Voidshard"]),
  audit("green", 1, "conditional", "End-position ruby engine", ["purple", "black"], ["Must finish among the last two chips", "Low movement can reduce scoring"]),
  audit("purple", 1, "conditional", "Collection milestones", ["green", "black"], ["Unlocks in round 3", "Copies are individually low movement"]),

  audit("blue", 2, "conditional", "Shatter insurance", ["yellow", "red"], ["Protection has no value in a safe brew", "Extra draw pressure remains"]),
  audit("red", 2, "active", "Deferred placement", ["green", "purple"], ["Reserved movement arrives late", "Low-value reserves can underperform"]),
  audit("yellow", 2, "conditional", "Next-chip multiplier", ["red", "blue"], ["Draw order is hidden", "Can multiply a low-value chip"]),
  audit("green", 2, "active", "Ingredient conversion", ["red", "blue", "purple"], ["Requires end-position timing", "Reward choice is constrained by chip value"]),
  audit("purple", 2, "active", "Late transmutation", ["green", "black"], ["Slow and costly setup", "Trading copies reduces future purple count"]),

  audit("blue", 3, "conditional", "Ruby-space harvesting", ["green", "purple"], ["Requires landing on ruby spaces", "No payoff on ordinary spaces"]),
  audit("red", 3, "conditional", "Previous-Voidshard resonance", ["yellow"], ["Needs a preceding Voidshard", "Encourages risk without preventing shatter"]),
  audit("yellow", 3, "passive", "Pressure capacity", ["red", "blue"], ["High purchase cost", "Extra safety does not score by itself"], "Threshold growth is reliable but offers little moment-to-moment choice once bought."),
  audit("green", 3, "conditional", "Exact-seven burst", ["yellow", "red"], ["Requires exactly seven pressure", "Missing the window yields no effect"]),
  audit("purple", 3, "conditional", "Position-band prestige", ["yellow", "blue"], ["Late unlock", "Weak if movement stalls below its scoring bands"]),

  audit("blue", 4, "conditional", "Ruby-space prestige", ["green", "yellow"], ["Requires ruby-space landing", "High blue values are costly"]),
  audit("red", 4, "passive", "White-chip acceleration", ["yellow"], ["Also accelerates dangerous Voidshards", "Requires drawing red before white"], "Strong identity, but its trigger resolves automatically and can amplify unavoidable danger."),
  audit("yellow", 4, "conditional", "Sequential yellow scaling", ["red", "purple"], ["Needs repeated yellow draws", "Late copies may not appear in time"]),
  audit("green", 4, "active", "Ruby-to-droplet conversion", ["blue", "purple"], ["Consumes rubies", "Competes directly with flask refills"]),
  audit("purple", 4, "active", "Bag refinement", ["yellow", "blue"], ["Unlocks late", "Upgrade targets depend on current bag"]),
];

export const BASE_SET_STRATEGIES: Record<BaseRecipeSet, BaseStrategyProfile[]> = {
  1: [
    { id: "set1-control-chain", set: 1, name: "Controlled Chain", preferredColors: ["blue", "yellow", "purple"], thesis: "Filter draws, recover Voidshards, then convert safe depth into milestone value.", counterweight: "More draws still increase exposure and the engine is expensive." },
    { id: "set1-ruby-bloom", set: 1, name: "Ruby Bloom", preferredColors: ["green", "purple", "black"], thesis: "Turn deliberate end positions and collection milestones into recurring rubies and droplet growth.", counterweight: "Low early movement and strict end-position requirements." },
    { id: "set1-ember-resonance", set: 1, name: "Ember Resonance", preferredColors: ["red", "orange", "yellow"], thesis: "Build Brimstone density so Bloodthorn produces immediate movement spikes.", counterweight: "Needs two ingredient families and sacrifices defensive purchases." },
  ],
  2: [
    { id: "set2-protected-surge", set: 2, name: "Protected Surge", preferredColors: ["blue", "yellow", "red"], thesis: "Use protection and multiplication to support volatile high-value draws.", counterweight: "Draw order can waste the multiplier or the protection." },
    { id: "set2-adaptive-harvest", set: 2, name: "Adaptive Harvest", preferredColors: ["green", "red", "blue"], thesis: "Convert precise green endings into ingredients while deferred red placement preserves flexibility.", counterweight: "Several payoffs arrive only after brewing ends." },
    { id: "set2-transmutation", set: 2, name: "Mire Transmutation", preferredColors: ["purple", "green", "black"], thesis: "Invest in a slow purple engine that exchanges concentration for tailored bag growth.", counterweight: "Late unlock, high cost, and weaker early rounds." },
  ],
  3: [
    { id: "set3-position-bloom", set: 3, name: "Position Bloom", preferredColors: ["purple", "red", "orange"], thesis: "Use reliable movement and Voidshard resonance to reach purple's higher scoring bands.", counterweight: "It forgoes pressure protection and must judge the stopping point carefully." },
    { id: "set3-exact-seven", set: 3, name: "Sevenfold Resonance", preferredColors: ["green", "red", "yellow"], thesis: "Use pressure capacity and Voidshard adjacency to engineer an exact-seven movement burst.", counterweight: "Its highest payoff depends on a narrow pressure window." },
    { id: "set3-ruby-lattice", set: 3, name: "Ruby Lattice", preferredColors: ["blue", "green", "black"], thesis: "Stack ruby-space rewards while Shadowmoss contests rival engines.", counterweight: "Board-space variance and opponent black-chip investment can suppress value." },
  ],
  4: [
    { id: "set4-whitefire", set: 4, name: "Whitefire", preferredColors: ["red", "yellow", "purple"], thesis: "Accelerate white chips, scale repeated yellow draws, then refine weak chips.", counterweight: "The same acceleration can push pressure over the shatter line." },
    { id: "set4-ruby-pilgrimage", set: 4, name: "Ruby Pilgrimage", preferredColors: ["blue", "green", "black"], thesis: "Earn prestige on ruby spaces and convert spare rubies into permanent starting distance.", counterweight: "Rubies are contested between progress, flask recovery, and scoring setup." },
    { id: "set4-refined-tempo", set: 4, name: "Refined Tempo", preferredColors: ["purple", "yellow", "blue"], thesis: "Use yellow tempo for current rounds while purple upgrades improve every later draw.", counterweight: "Late purple access leaves little time for upgrades to repay their cost." },
  ],
};

export function getBaseStrategy(id: string): BaseStrategyProfile | undefined {
  return Object.values(BASE_SET_STRATEGIES).flat().find((strategy) => strategy.id === id);
}

function itemScore(player: Player, item: MarketItem, strategy: BaseStrategyProfile, state?: GameState): number {
  const preferenceIndex = strategy.preferredColors.indexOf(item.token.color);
  const preference = preferenceIndex < 0 ? 0 : [5, 3, 1.75][preferenceIndex] ?? 0.5;
  const owned = countByColor(player.bag, item.token.color);
  const concentration = preferenceIndex === 0 ? Math.min(1.5, owned * 0.3) : Math.min(0.75, owned * 0.12);
  return scoreMarketItem(player, item, "calculated", state) + preference + concentration;
}

/** Market planner used only by deterministic balance validation. It follows a
 * declared build thesis while retaining the real affordability and bundle rules. */
export function decideStrategyPurchases(
  player: Player,
  market: MarketItem[],
  buyState: BuyPhaseState,
  currentRound: number,
  strategy: BaseStrategyProfile,
  state?: GameState,
): string[] {
  const candidates = market.filter((item) => canAfford(item, buyState, currentRound));
  const bundles: Array<{ ids: string[]; score: number }> = [{ ids: [], score: 0 }];
  for (const item of candidates) bundles.push({ ids: [item.id], score: itemScore(player, item, strategy, state) });
  for (let first = 0; first < candidates.length; first++) {
    for (let second = first + 1; second < candidates.length; second++) {
      const a = candidates[first];
      const b = candidates[second];
      if (a.token.color === b.token.color) continue;
      if (a.cost + b.cost > buyState.coinsAvailable - buyState.coinsSpent) continue;
      bundles.push({ ids: [a.id, b.id], score: itemScore(player, a, strategy, state) + itemScore(player, b, strategy, state) + 0.75 });
    }
  }
  const best = bundles.sort((a, b) => b.score - a.score)[0];
  return best.score > 0 ? best.ids : [];
}
