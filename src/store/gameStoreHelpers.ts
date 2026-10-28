import type { GameState, RitualRuleset } from "../game/gameState";
import type { Player } from "../game/playerTypes";
import { createStartingBag } from "../game/bagFactory";
import { createCrucible } from "../game/crucible";
import { createMarket } from "../game/bazaarFactory";
import { createShuffledOmenDeck, drawOmen } from "../game/omen";
import type { RecipeMode } from "../game/recipeBooks";
import { createRecipeBooks } from "../game/recipeBooks";
import type { AIDifficulty } from "../game/aiStrategy";
import { GAME_RULES } from "../game/ruleConstants";
import type { GameSetup } from "../game/contentPacks";
import { createGameSetup } from "../game/contentPacks";
import { createCovenantOffer, createCovenantSeals } from "../game/covenants";
import { createAfflictionOffer, createAfflictionState } from "../game/distillation";

// ─── Pure helpers ─────────────────────────────────────────────────────────────

export function updatePlayer(state: GameState, playerId: string, updater: (p: Player) => Player): GameState {
    return {
        ...state,
        players: state.players.map((p) => p.id === playerId ? updater(p) : p),
    };
}

export function getPlayer(state: GameState, id: string): Player {
    const p = state.players.find((p) => p.id === id);
    if (!p) throw new Error(`Player not found: ${id}`);
    return p;
}

export function createPlayer(id: string, name: string, kind: "human" | "ai"): Player {
    return {
        id, name, kind,
        bag: createStartingBag(),
        crucible: createCrucible(),
        rubies: 1,
        coinsThisRound: 0,
        score: 0,
        flask: true,
        ratStoneOffset: 0,
        blueProtectionDraws: 0,
        blueBonusExplosion: false,
        yellowDoubleNext: false,
        redReserve: [],
    };
}

const AI_NAMES = ["The Shade", "The Wraith", "The Seer", "The Hollow"];

export function createInitialState(recipeMode: RecipeMode = 1, aiCount: number = 1, aiDifficulty: AIDifficulty = "skilled"): GameState {
    return createInitialStateWithSetup(
        createGameSetup({ recipeMode, totalPlayers: Math.max(2, Math.min(GAME_RULES.maxPlayers, aiCount + 1)) }),
        aiDifficulty,
    );
}

export function createInitialStateWithSetup(setup: GameSetup, aiDifficulty: AIDifficulty = "skilled", ritualRuleset: RitualRuleset = "standard"): GameState {
    const normalizedSetup = createGameSetup(setup);
    const omenDeck = createShuffledOmenDeck(normalizedSetup.enabledPacks);
    const firstOmen = drawOmen(omenDeck);
    const recipeBooks = createRecipeBooks(normalizedSetup.recipeMode, normalizedSetup.modules.patrons);
    const aiCount = normalizedSetup.totalPlayers - 1;

    return {
        ritualRuleset,
        roundIntentions: {},
        setup: normalizedSetup,
        afflictionOffer: normalizedSetup.modules.distillation
          ? createAfflictionOffer(normalizedSetup.recipeMode, normalizedSetup.totalPlayers)
          : undefined,
        covenantOffer: normalizedSetup.modules.patrons
          ? createCovenantOffer(normalizedSetup.recipeMode, normalizedSetup.totalPlayers)
          : undefined,
        selectedCovenants: undefined,
        players: [
            createPlayer("human", "Hexbrewer", "human"),
            ...Array.from({ length: aiCount }, (_, index) =>
                createPlayer(index === 0 ? "ai" : `ai-${index + 1}`, AI_NAMES[index], "ai")
            ),
        ].map((player, index) => {
          const withPatrons = normalizedSetup.modules.patrons
            ? {
                ...player,
                covenantSeals: createCovenantSeals(),
                crucible: { ...player.crucible, overflowEnabled: true },
              }
            : player;
          return normalizedSetup.modules.distillation
            ? { ...withPatrons, affliction: createAfflictionState(index) }
            : withPatrons;
        }),
        currentRound: 1,
        totalRounds: GAME_RULES.totalRounds,
        phase: normalizedSetup.modules.distillation || normalizedSetup.modules.patrons ? "setup" : "omen",
        activePlayerIndex: 0,
        currentOmen: firstOmen?.card ?? null,
        omenDeck: firstOmen?.remaining ?? [],
        market: createMarket(
          recipeBooks,
          normalizedSetup.totalPlayers,
          normalizedSetup.modules.patrons,
          normalizedSetup.modules.distillation,
        ),
        recipeBooks,
        aiDifficulty,
        buyPhaseState: null,
        marketCompletedPlayerIds: [],
        omenCompletedPlayerIds: [],
        bonusDieResult: null,
        bonusDieWinner: null,
        roundSummary: null,
        winner: null,
        winners: [],
    };
}
