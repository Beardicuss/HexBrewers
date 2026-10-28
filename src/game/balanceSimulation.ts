import type { GameState } from "./gameState";
import type { Player } from "./playerTypes";
import type { Token, TokenColor } from "./tokenTypes";
import type { RecipeColor, RecipeMode } from "./recipeBooks";
import type { AIDifficulty } from "./aiStrategy";
import { getRecipeSetForColor, RECIPE_COLORS } from "./recipeBooks";
import { createInitialStateWithSetup } from "../store/gameStoreHelpers";
import { createGameSetup, type ContentPackId } from "./contentPacks";
import { canUseCovenant, covenantMarketCoinBonus, useCovenant, type CovenantSelection } from "./covenants";
import { decideAIRubyAction, decideBlueKeep, decideBrewingAction, decideExplodedChoice, decideFlaskUse, decideMarketTurn, decidePurpleChoice } from "./ai";
import { drawToken, refillBag } from "./bag";
import { addRound6WhiteChip } from "./bagFactory";
import { getPlacedTokens, placeToken, resetCrucible } from "./crucible";
import { applyRoundReward, calculateRoundScore, calculateRoundScoreForDifficulty } from "./scoring";
import { canUseFlask, useFlask } from "./flask";
import { createSeededRandom, resetGameplayRandomSource, setGameplayRandomSource } from "./random";
import { applyBlackMultiplayerBonus, applyBlackSetOneBonus, applyGreenEndEffect, applyPurpleChoice, applyPurpleEndEffect, drawBlueBonus, purpleChoices } from "./chipEffects";
import { applyRatStones } from "./ratTail";
import { drawOmen } from "./omen";
import { purchaseItem, refreshMarketAvailability } from "./bazaar";
import type { BuyPhaseState } from "./bazaarTypes";
import { applyBonusDieResult, rollBonusDie } from "./bonusDie";
import { canAdvanceDroplet, canRefillFlask, spendRubiesForDroplet, spendRubiesForFlask } from "./rubyActions";
import { movementForToken, placeTokenForActiveBooks } from "./brewingRules";
import { applyOmenScoringEffect, applyOmenStartEffect, rubyRewardForResult } from "./omenResolver";
import { chooseAIAffliction, createAfflictionState, resolveDistillationRound, type AfflictionId } from "./distillation";
import { decideStrategyPurchases, getBaseStrategy, BASE_SET_STRATEGIES, type BaseRecipeSet } from "./strategyBalance";

export interface SimulatedMatchResult {
  seed: number;
  scores: Record<string, number>;
  explosions: Record<string, number>;
  draws: Record<string, number>;
  purchases: Record<string, number>;
  bagQuality: Record<string, number>;
  comebackWinnerIds: string[];
  economyValid: boolean;
  tokenFlowValid: boolean;
  winnerId: string | null;
  winnerIds: string[];
  recipeEffects: Record<string, Record<RecipeColor, RecipeEffectTelemetry>>;
  distillation: Record<string, DistillationTelemetry>;
  bagComposition: Record<string, Partial<Record<TokenColor, number>>>;
}

export interface DistillationTelemetry {
  contractId: AfflictionId | null;
  progress: number;
  prestige: number;
  dropletSteps: number;
  headStart: number;
}

export interface RecipeEffectTelemetry {
  draws: number;
  activations: number;
  movement: number;
  score: number;
  rubies: number;
  dropletSteps: number;
}

function emptyRecipeTelemetry(): Record<RecipeColor, RecipeEffectTelemetry> {
  return Object.fromEntries(RECIPE_COLORS.map((color) => [color, {
    draws: 0,
    activations: 0,
    movement: 0,
    score: 0,
    rubies: 0,
    dropletSteps: 0,
  }])) as Record<RecipeColor, RecipeEffectTelemetry>;
}

function recordEffectDelta(
  telemetry: RecipeEffectTelemetry,
  before: Player,
  after: Player,
  movement = 0,
): void {
  const score = after.score - before.score;
  const rubies = after.rubies - before.rubies;
  const dropletSteps = after.crucible.dropletPosition - before.crucible.dropletPosition;
  telemetry.movement += movement;
  telemetry.score += score;
  telemetry.rubies += rubies;
  telemetry.dropletSteps += dropletSteps;
  if (movement !== 0 || score !== 0 || rubies !== 0 || dropletSteps !== 0 || after.bag.tokens.length !== before.bag.tokens.length) {
    telemetry.activations += 1;
  }
}

function replacePlayer(state: GameState, player: Player): GameState {
  return { ...state, players: state.players.map((current) => current.id === player.id ? player : current) };
}

function applyDie(player: Player, seed: number, round: number, source: "omen" | "bonus"): Player {
  const result = rollBonusDie();
  return applyBonusDieResult(player, result, {
    id: `sim-die-${source}-${seed}-${round}-${player.id}`,
    color: "orange",
    value: 1,
  });
}

function spendRubies(player: Player, state: GameState): Player {
  let current = player;
  if (state.selectedCovenants && canUseCovenant(current, "bone", "ruby_spend", state.selectedCovenants)) {
    current = useCovenant(current, "bone", state.selectedCovenants);
  }
  while (current.rubies >= 2) {
    const action = decideAIRubyAction(current, state);
    if (action === "flask" && canRefillFlask(current)) current = spendRubiesForFlask(current);
    else if (action === "droplet" && canAdvanceDroplet(current)) current = spendRubiesForDroplet(current);
    else break;
  }
  return current;
}

function resolveBlueChain(player: Player, source: Token, state: GameState): { player: Player; draws: number } {
  let current = player;
  let blueSource: Token | null = source;
  let draws = 0;
  while (blueSource && !current.crucible.exploded) {
    const bonus = drawBlueBonus(current.bag, blueSource.value);
    draws += bonus.drawn.length;
    // Every simulated seat uses the same AI resolver. Mixing the interactive
    // fallback into the human seat creates a false first-seat balance signal.
    const kept = decideBlueKeep(bonus.drawn, current, state);
    current = {
      ...current,
      bag: { tokens: [...bonus.bag.tokens, ...bonus.drawn.filter((token) => token.id !== kept?.id)] },
    };
    if (!kept) break;
    current = placeTokenForActiveBooks(current, kept, state);
    blueSource = kept.color === "blue" && getRecipeSetForColor(state.recipeBooks, "blue") === 1
      ? kept
      : null;
  }
  return { player: current, draws };
}

function brew(
  player: Player,
  state: GameState,
  telemetry: Record<RecipeColor, RecipeEffectTelemetry>,
): { player: Player; draws: number } {
  let current = player;
  let draws = 0;

  if (state.selectedCovenants && canUseCovenant(current, "moon", "brewing", state.selectedCovenants)) {
    current = useCovenant(current, "moon", state.selectedCovenants);
  }

  while (draws < 100) {
    const decisionState = {
      ...replacePlayer(state, current),
      aiDifficulty: current.kind === "human" ? "skilled" as const : state.aiDifficulty,
    };
    if (decideBrewingAction(current, decisionState) === "stop") break;
    const drawn = drawToken(current.bag);
    if (!drawn) break;

    const beforeEffect = { ...current, bag: drawn.bag };
    const recipeColor = RECIPE_COLORS.includes(drawn.token.color as RecipeColor)
      ? drawn.token.color as RecipeColor
      : null;
    if (recipeColor) telemetry[recipeColor].draws += 1;
    const redMovement = drawn.token.color === "red"
      ? movementForToken(beforeEffect, drawn.token, state) - drawn.token.value
      : 0;
    current = placeTokenForActiveBooks(beforeEffect, drawn.token, state);
    if (recipeColor) recordEffectDelta(telemetry[recipeColor], beforeEffect, current, redMovement);
    draws++;

    if (current.crucible.exploded) break;
    if (canUseFlask(current) && decideFlaskUse(current, {
      ...replacePlayer(state, current),
      aiDifficulty: current.kind === "human" ? "skilled" : state.aiDifficulty,
    })) {
      current = useFlask(current);
    }
    if (drawn.token.color === "blue" && getRecipeSetForColor(state.recipeBooks, "blue") === 1) {
      const bonus = resolveBlueChain(current, drawn.token, state);
      current = bonus.player;
      draws += bonus.draws;
      if (current.crucible.exploded) break;
    }
  }

  if ((current.redReserve?.length ?? 0) > 0) {
    current = (current.redReserve ?? []).reduce(
      (updated, token) => ({ ...updated, crucible: placeToken(updated.crucible, token, token.value) }),
      { ...current, redReserve: [] as Token[] }
    );
  }

  return { player: current, draws };
}

export function simulateMatch(
  seed: number,
  recipeMode: RecipeMode = 1,
  totalPlayers = 2,
  aiDifficulty: AIDifficulty = "skilled",
  enabledPacks: ContentPackId[] = ["base"],
  selectedCovenants?: CovenantSelection,
  selectedAffliction?: AfflictionId,
  humanStrategyId?: string,
): SimulatedMatchResult {
  setGameplayRandomSource(createSeededRandom(seed));
  try {
    const setup = createGameSetup({ recipeMode, totalPlayers, enabledPacks });
    let state = createInitialStateWithSetup(setup, aiDifficulty);
    if (state.covenantOffer) {
      state = {
        ...state,
        selectedCovenants: selectedCovenants ?? {
          bone: state.covenantOffer.bone[0],
          moon: state.covenantOffer.moon[0],
          blood: state.covenantOffer.blood[0],
        },
      };
    }
    if (state.setup.modules.distillation && state.afflictionOffer) {
      state = {
        ...state,
        players: state.players.map((player, index) => ({
          ...player,
          affliction: createAfflictionState(
            index,
            selectedAffliction ?? chooseAIAffliction(player, index, state.afflictionOffer),
          ),
        })),
      };
    }
    const emptyCounters = () => Object.fromEntries(state.players.map((player) => [player.id, 0]));
    const explosions: Record<string, number> = emptyCounters();
    const draws: Record<string, number> = emptyCounters();
    const purchases: Record<string, number> = emptyCounters();
    const recipeEffects = Object.fromEntries(state.players.map((player) => [player.id, emptyRecipeTelemetry()])) as
      Record<string, Record<RecipeColor, RecipeEffectTelemetry>>;
    const distillation = Object.fromEntries(state.players.map((player) => [player.id, {
      contractId: player.affliction?.contractId ?? null,
      progress: 0,
      prestige: 0,
      dropletSteps: 0,
      headStart: 0,
    }])) as Record<string, DistillationTelemetry>;
    let economyValid = true;
    let tokenFlowValid = true;
    const trailedByTen = new Set<string>();

    for (let round = 1; round <= state.totalRounds; round++) {
      let roundPlayers = applyRatStones(state.players, round).map((player) => {
        const ratMultiplier = state.currentOmen?.effect.type === "double_rat_tails" ? 2 : 1;
        const extraRatStone = state.currentOmen?.effect.type === "extra_rat_stone" && player.ratStoneOffset > 0
          ? state.currentOmen.effect.amount
          : 0;
        const remedyHeadStart = player.affliction?.pendingHeadStart ?? 0;
        const ratStoneOffset = player.ratStoneOffset * ratMultiplier + extraRatStone + remedyHeadStart;
        const prepared = {
          ...player,
          ratStoneOffset,
          crucible: {
            ...player.crucible,
            filledUpTo: Math.min(33, player.crucible.dropletPosition + ratStoneOffset),
          },
          affliction: player.affliction
            ? { ...player.affliction, pendingHeadStart: 0 }
            : undefined,
        };
        return applyOmenStartEffect(prepared, state.currentOmen, {
          createToken: (color, value, source) => ({
            id: `sim-${source}-${seed}-${round}-${player.id}`,
            color,
            value,
          }),
        });
      });
      state = { ...state, currentRound: round, players: roundPlayers };
      const brewedPlayers = state.players.map((player) => {
        const result = brew(player, state, recipeEffects[player.id]);
        draws[player.id] += result.draws;
        if (result.player.crucible.exploded) explosions[player.id]++;
        return result.player;
      });
      state = { ...state, players: brewedPlayers };

      if (state.setup.modules.distillation) {
        state = resolveDistillationRound({ ...state, phase: "distillation" });
        for (const player of state.players) {
          if (!player.affliction) continue;
          distillation[player.id].progress += player.affliction.lastProgress;
          distillation[player.id].prestige += player.affliction.lastPrestige;
          distillation[player.id].dropletSteps += player.affliction.lastDropletSteps;
          distillation[player.id].headStart += player.affliction.lastHeadStart;
        }
      }

      const results = new Map(state.players.map((player) => [
        player.id,
        calculateRoundScoreForDifficulty(player.crucible, state.aiDifficulty, player.kind),
      ]));
      const bestSafeSpace = Math.max(...state.players.map((player) => {
        const result = results.get(player.id)!;
        return result.exploded ? -1 : result.space;
      }));
      const afterDice = state.players.map((player) => {
        const result = results.get(player.id)!;
        return !result.exploded && result.space === bestSafeSpace ? applyDie(player, seed, round, "bonus") : player;
      });

      const afterEffects = afterDice.map((player, seat) => {
        const afterGreen = applyGreenEndEffect(player, state.recipeBooks, {
          autoSetTwo: true,
          autoSetThree: true,
          autoSetFour: true,
        });
        recordEffectDelta(recipeEffects[player.id].green, player, afterGreen);
        const purpleSet = getRecipeSetForColor(state.recipeBooks, "purple");
        let updated = purpleSet === 3 || purpleSet === 5 || purpleSet === 6
          ? applyPurpleEndEffect(afterGreen, state.recipeBooks)
          : afterGreen;
        recordEffectDelta(recipeEffects[player.id].purple, afterGreen, updated);
        if (afterDice.length === 2) {
          updated = applyBlackSetOneBonus(updated, afterDice[(seat + 1) % 2]);
        } else {
          const left = afterDice[(seat - 1 + afterDice.length) % afterDice.length];
          const right = afterDice[(seat + 1) % afterDice.length];
          updated = applyBlackMultiplayerBonus(updated, left, right);
        }
        const purpleChoice = decidePurpleChoice(purpleChoices(updated, state.recipeBooks), updated, state);
        if (purpleChoice) {
          const beforePurpleChoice = updated;
          updated = applyPurpleChoice(updated, purpleChoice);
          recordEffectDelta(recipeEffects[player.id].purple, beforePurpleChoice, updated);
        }
        return updated;
      });

      const scoredPlayers = afterEffects.map((player) => {
        const result = results.get(player.id)!;
        let updated = applyOmenScoringEffect(player, state.currentOmen, result);
        updated = { ...updated, rubies: updated.rubies + rubyRewardForResult(state.currentOmen, result) };
        const choice = result.exploded ? decideExplodedChoice(updated, result, { ...state, players: afterEffects }) : null;
        return applyRoundReward(updated, result, choice ?? undefined);
      });
      const roundLeaderScore = Math.max(...scoredPlayers.map((player) => player.score));
      for (const player of scoredPlayers) {
        if (roundLeaderScore - player.score >= 10) trailedByTen.add(player.id);
      }

      let market = state.market;
      const shoppedById = new Map<string, Player>();
      // Randomize the initial shopper per seeded match, then rotate normally.
      // A fixed seat 0 start grants that seat five first picks in a nine-round
      // game and can masquerade as a recipe-book balance problem.
      const startingSeat = (seed + round - 1) % scoredPlayers.length;
      const shoppingOrder = scoredPlayers.map((_, offset) => scoredPlayers[(startingSeat + offset) % scoredPlayers.length]);
      for (const player of shoppingOrder) {
        let current = player;
        if (
          round >= 6 && state.selectedCovenants &&
          canUseCovenant(current, "blood", "market", state.selectedCovenants)
        ) {
          current = useCovenant(current, "blood", state.selectedCovenants);
          current = {
            ...current,
            coinsThisRound: current.coinsThisRound + covenantMarketCoinBonus(state.selectedCovenants.blood),
          };
        }
        let buyState: BuyPhaseState = { purchases: [], coinsSpent: 0, coinsAvailable: player.coinsThisRound };
        buyState = { ...buyState, coinsAvailable: current.coinsThisRound };
        const marketState = {
          ...state,
          players: scoredPlayers,
          market,
          aiDifficulty: player.kind === "human" ? "skilled" as const : state.aiDifficulty,
        };
        const validationStrategy = player.id === "human" && humanStrategyId ? getBaseStrategy(humanStrategyId) : undefined;
        const plannedPurchases = validationStrategy
          ? decideStrategyPurchases(current, market, buyState, round, validationStrategy, marketState)
          : decideMarketTurn(current, market, marketState);
        for (const itemId of plannedPurchases) {
          try {
            const bought = purchaseItem(current, market, buyState, itemId, round);
            current = bought.player;
            market = bought.market;
            buyState = bought.state;
            purchases[player.id]++;
          } catch {
            break;
          }
        }
        current = { ...current, coinsThisRound: Math.max(0, buyState.coinsAvailable - buyState.coinsSpent) };
        shoppedById.set(player.id, spendRubies(current, marketState));
      }
      const shoppedPlayers = scoredPlayers.map((player) => shoppedById.get(player.id) ?? player);

      economyValid &&= shoppedPlayers.every((player) => player.rubies >= 0 && player.coinsThisRound >= 0);
      economyValid &&= market.every((item) => item.stock >= 0);

      if (round === state.totalRounds) {
        state = {
          ...state,
          market,
          players: shoppedPlayers.map((player) => ({
            ...player,
            score: player.score + Math.floor(player.coinsThisRound / 5) + Math.floor(player.rubies / 2),
          })),
        };
        break;
      }

      state = {
        ...state,
        market: refreshMarketAvailability(market, round + 1),
        players: shoppedPlayers.map((player) => {
          const placedTokens = getPlacedTokens(player.crucible);
          const refilled = refillBag(player.bag, placedTokens);
          tokenFlowValid &&= refilled.tokens.length === player.bag.tokens.length + placedTokens.length;
          tokenFlowValid &&= new Set(refilled.tokens.map((token) => token.id)).size === refilled.tokens.length;
          const nextBag = round === 5 ? addRound6WhiteChip(refilled, player.id) : refilled;
          return {
            ...player,
            bag: nextBag,
            crucible: resetCrucible(player.crucible),
            coinsThisRound: 0,
            ratStoneOffset: 0,
            blueProtectionDraws: 0,
            blueBonusExplosion: false,
            yellowDoubleNext: false,
          };
        }),
      };
      const nextOmen = drawOmen(state.omenDeck);
      state = {
        ...state,
        currentOmen: nextOmen?.card ?? null,
        omenDeck: nextOmen?.remaining ?? [],
      };
    }

    const ranked = [...state.players].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return calculateRoundScore(b.crucible).space - calculateRoundScore(a.crucible).space;
    });
    const first = ranked[0];
    const winningSpace = calculateRoundScore(first.crucible).space;
    const winnerIds = ranked
      .filter((player) => player.score === first.score && calculateRoundScore(player.crucible).space === winningSpace)
      .map((player) => player.id);
    const bagQuality = Object.fromEntries(state.players.map((player) => {
      const tokens = [...player.bag.tokens, ...getPlacedTokens(player.crucible)];
      const quality = tokens.reduce((sum, token) => sum + (token.color === "white" ? -token.value : token.value), 0)
        / Math.max(1, tokens.length);
      return [player.id, quality];
    }));
    const bagComposition = Object.fromEntries(state.players.map((player) => {
      const tokens = [...player.bag.tokens, ...getPlacedTokens(player.crucible)];
      const counts: Partial<Record<TokenColor, number>> = {};
      for (const token of tokens) counts[token.color] = (counts[token.color] ?? 0) + 1;
      return [player.id, counts];
    }));
    return {
      seed,
      scores: Object.fromEntries(state.players.map((player) => [player.id, player.score])),
      explosions,
      draws,
      purchases,
      bagQuality,
      comebackWinnerIds: winnerIds.filter((id) => trailedByTen.has(id)),
      economyValid,
      tokenFlowValid,
      winnerId: winnerIds.length === 1 ? winnerIds[0] : null,
      winnerIds,
      recipeEffects,
      distillation,
      bagComposition,
    };
  } finally {
    resetGameplayRandomSource();
  }
}

export function simulateMatches(
  count: number,
  baseSeed = 1,
  recipeMode: RecipeMode = 1,
  totalPlayers = 2,
  aiDifficulty: AIDifficulty = "skilled",
  enabledPacks: ContentPackId[] = ["base"],
  selectedCovenants?: CovenantSelection,
  selectedAffliction?: AfflictionId,
  humanStrategyId?: string,
): SimulatedMatchResult[] {
  return Array.from({ length: count }, (_, index) =>
    simulateMatch(baseSeed + index, recipeMode, totalPlayers, aiDifficulty, enabledPacks, selectedCovenants, selectedAffliction, humanStrategyId));
}

export interface BuildViabilityBenchmarkRow {
  recipeSet: BaseRecipeSet;
  strategyId: string;
  strategyName: string;
  matches: number;
  winRate: number;
  averageScore: number;
  averageOpponentScore: number;
  averageExplosions: number;
  averagePurchases: number;
  averagePreferredTokens: number;
  baselineWinRate: number;
  baselineAverageScore: number;
  baselinePreferredTokens: number;
  preferredTokenLift: number;
  scoreRetention: number;
  scoreParity: number;
  viable: boolean;
}

export function benchmarkBuildViability(matchesPerStrategy: number, baseSeed = 1_250_000): BuildViabilityBenchmarkRow[] {
  const rows: BuildViabilityBenchmarkRow[] = [];
  for (const recipeSet of [1, 2, 3, 4] as const) {
    for (const [strategyIndex, strategy] of BASE_SET_STRATEGIES[recipeSet].entries()) {
      const configurationSeed = baseSeed + recipeSet * 100_000 + strategyIndex * 10_000;
      const baseline = simulateMatches(matchesPerStrategy, configurationSeed, recipeSet, 2, "skilled");
      const results = simulateMatches(
        matchesPerStrategy,
        configurationSeed,
        recipeSet,
        2,
        "skilled",
        ["base"],
        undefined,
        undefined,
        strategy.id,
      );
      const matches = Math.max(1, results.length);
      const averageScore = results.reduce((sum, result) => sum + result.scores.human, 0) / matches;
      const averageOpponentScore = results.reduce((sum, result) => {
        const opponent = Object.keys(result.scores).find((id) => id !== "human")!;
        return sum + result.scores[opponent];
      }, 0) / matches;
      const averagePreferredTokens = results.reduce((sum, result) => {
        const composition = result.bagComposition.human;
        return sum + strategy.preferredColors.reduce((total, color) => total + (composition[color] ?? 0), 0);
      }, 0) / matches;
      const baselineWinRate = baseline.filter((result) => result.winnerIds.includes("human")).length / matches;
      const baselineAverageScore = baseline.reduce((sum, result) => sum + result.scores.human, 0) / matches;
      const baselinePreferredTokens = baseline.reduce((sum, result) => {
        const composition = result.bagComposition.human;
        return sum + strategy.preferredColors.reduce((total, color) => total + (composition[color] ?? 0), 0);
      }, 0) / matches;
      const winRate = results.filter((result) => result.winnerIds.includes("human")).length / matches;
      const scoreParity = averageScore / Math.max(1, averageOpponentScore);
      const scoreRetention = averageScore / Math.max(1, baselineAverageScore);
      const preferredTokenLift = averagePreferredTokens - baselinePreferredTokens;
      const averagePurchases = results.reduce((sum, result) => sum + result.purchases.human, 0) / matches;
      rows.push({
        recipeSet,
        strategyId: strategy.id,
        strategyName: strategy.name,
        matches: results.length,
        winRate,
        averageScore,
        averageOpponentScore,
        averageExplosions: results.reduce((sum, result) => sum + result.explosions.human, 0) / matches,
        averagePurchases,
        averagePreferredTokens,
        baselineWinRate,
        baselineAverageScore,
        baselinePreferredTokens,
        preferredTokenLift,
        scoreRetention,
        scoreParity,
        // Skilled difficulty intentionally trims the human economy, so viability
        // is measured against the same-seat generic planner, not a false 50% bar.
        viable: scoreRetention >= 0.9 && winRate >= baselineWinRate - 0.15 && averagePurchases >= 3 &&
          (preferredTokenLift >= 0.5 || baselinePreferredTokens >= 8),
      });
    }
  }
  return rows;
}

export interface DifficultyBenchmarkRow {
  difficulty: AIDifficulty;
  recipeSet: 1 | 2 | 3 | 4;
  playerCount: 2 | 3 | 4;
  matches: number;
  humanWinRate: number;
  aiWinRate: number;
  tieRate: number;
  averageHumanScore: number;
  averageAIScore: number;
  averageHumanExplosions: number;
  averageAIExplosions: number;
  averageHumanPurchases: number;
  averageAIPurchases: number;
  averageAIDraws: number;
  averageAIBagQuality: number;
  aiComebackRate: number;
}

export function benchmarkDifficulties(matchesPerConfiguration: number, baseSeed = 900_000): DifficultyBenchmarkRow[] {
  const rows: DifficultyBenchmarkRow[] = [];
  for (const difficulty of ["apprentice", "skilled", "master"] as const) {
    for (const recipeSet of [1, 2, 3, 4] as const) {
      for (const playerCount of [2, 3, 4] as const) {
        const seed = baseSeed + recipeSet * 10_000 + playerCount * 1_000;
        const results = simulateMatches(matchesPerConfiguration, seed, recipeSet, playerCount, difficulty);
        const aiIds = results[0] ? Object.keys(results[0].scores).filter((id) => id !== "human") : [];
        const matches = Math.max(1, results.length);
        const aiSeats = Math.max(1, aiIds.length);
        rows.push({
          difficulty,
          recipeSet,
          playerCount,
          matches: results.length,
          humanWinRate: results.filter((result) => result.winnerIds.includes("human")).length / matches,
          aiWinRate: results.filter((result) => result.winnerIds.some((id) => id !== "human")).length / matches,
          tieRate: results.filter((result) => result.winnerIds.length > 1).length / matches,
          averageHumanScore: results.reduce((sum, result) => sum + result.scores.human, 0) / matches,
          averageAIScore: results.reduce((sum, result) => sum + aiIds.reduce((seatSum, id) => seatSum + result.scores[id], 0) / aiSeats, 0) / matches,
          averageHumanExplosions: results.reduce((sum, result) => sum + result.explosions.human, 0) / matches,
          averageAIExplosions: results.reduce((sum, result) => sum + aiIds.reduce((seatSum, id) => seatSum + result.explosions[id], 0) / aiSeats, 0) / matches,
          averageHumanPurchases: results.reduce((sum, result) => sum + result.purchases.human, 0) / matches,
          averageAIPurchases: results.reduce((sum, result) => sum + aiIds.reduce((seatSum, id) => seatSum + result.purchases[id], 0) / aiSeats, 0) / matches,
          averageAIDraws: results.reduce((sum, result) => sum + aiIds.reduce((seatSum, id) => seatSum + result.draws[id], 0) / aiSeats, 0) / matches,
          averageAIBagQuality: results.reduce((sum, result) => sum + aiIds.reduce((seatSum, id) => seatSum + result.bagQuality[id], 0) / aiSeats, 0) / matches,
          aiComebackRate: results.filter((result) => result.comebackWinnerIds.some((id) => id !== "human")).length / matches,
        });
      }
    }
  }
  return rows;
}
