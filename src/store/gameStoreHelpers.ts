import type { GameState } from "../game/gameState";
import type { Player } from "../game/playerTypes";
import { createStartingBag } from "../game/bagFactory";
import { createCrucible } from "../game/crucible";
import { createMarket } from "../game/bazaarFactory";
import { createShuffledOmenDeck, drawOmen } from "../game/omen";
import type { RecipeMode } from "../game/recipeBooks";
import { createRecipeBooks } from "../game/recipeBooks";

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
        rubies: 0,
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

export function createInitialState(recipeMode: RecipeMode = 1): GameState {
    const omenDeck = createShuffledOmenDeck();
    const firstOmen = drawOmen(omenDeck);
    const recipeBooks = createRecipeBooks(recipeMode);

    return {
        players: [
            createPlayer("human", "Hexbrewer", "human"),
            createPlayer("ai", "The Shade", "ai"),
        ],
        currentRound: 1,
        totalRounds: 9,
        phase: "omen",
        activePlayerIndex: 0,
        currentOmen: firstOmen?.card ?? null,
        omenDeck: firstOmen?.remaining ?? [],
        market: createMarket(recipeBooks),
        recipeBooks,
        buyPhaseState: null,
        bonusDieResult: null,
        bonusDieWinner: null,
        roundSummary: null,
        winner: null,
    };
}
