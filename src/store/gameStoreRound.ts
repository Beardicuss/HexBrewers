import type { GameState } from "../game/gameState";
import type { Player } from "../game/playerTypes";
import { soundManager } from "../SoundManager";
import { getPlacedTokens, resetCrucible } from "../game/crucible";
import { refillBag } from "../game/bag";
import { addRound6WhiteChip } from "../game/bagFactory";
import { drawOmen } from "../game/omen";
import { refreshMarketAvailability } from "../game/bazaar";
import { calculateRoundScore } from "../game/scoring";
import { updatePlayer } from "./gameStoreHelpers";

// ─── Round advancement ────────────────────────────────────────────────────────

export function advanceToNextRound(state: GameState): GameState {
    const nextRound = state.currentRound + 1;

    if (nextRound > state.totalRounds) {
        const finalPlayers = state.players.map((player) => ({
            ...player,
            score: player.score + Math.floor(player.coinsThisRound / 5) + Math.floor(player.rubies / 2),
        }));
        const winner = [...finalPlayers].sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return calculateRoundScore(b.crucible).space - calculateRoundScore(a.crucible).space;
        })[0];
        const human = finalPlayers.find(p => p.id === "human");
        if (human && winner.id === "human") {
            soundManager.play("game_win");
        } else {
            soundManager.play("game_lose");
        }
        return { ...state, players: finalPlayers, phase: "game_over", winner };
    }

    // Reset all players for new round
    let newState = state;
    for (const player of state.players) {
        const drawnTokens = getPlacedTokens(player.crucible);
        const refilled = refillBag(player.bag, drawnTokens);

        let freshCrucible = resetCrucible(player.crucible);
        let updatedPlayer: Player = {
            ...player,
            bag: refilled,
            crucible: freshCrucible,
            coinsThisRound: 0,
            ratStoneOffset: 0,
        };

        // Round 6: add extra white 1-chip to every bag
        if (nextRound === 6) {
            updatedPlayer = { ...updatedPlayer, bag: addRound6WhiteChip(updatedPlayer.bag, player.id) };
        }

        newState = updatePlayer(newState, player.id, () => updatedPlayer);
    }

    // Draw next omen card
    const omenResult = drawOmen(newState.omenDeck);
    soundManager.play("omen_reveal");

    return {
        ...newState,
        currentRound: nextRound,
        phase: "omen",
        currentOmen: omenResult?.card ?? null,
        omenDeck: omenResult?.remaining ?? [],
        market: refreshMarketAvailability(newState.market, nextRound),
        buyPhaseState: null,
        bonusDieResult: null,
        bonusDieWinner: null,
    };
}
