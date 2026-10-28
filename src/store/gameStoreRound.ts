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
import { GAME_RULES } from "../game/ruleConstants";

// ─── Round advancement ────────────────────────────────────────────────────────

export function advanceToNextRound(state: GameState): GameState {
    if (state.phase === "game_over") return state;
    const nextRound = state.currentRound + 1;

    if (nextRound > state.totalRounds) {
        const finalPlayers = state.players.map((player) => ({
            ...player,
            score: player.score
                + Math.floor(player.coinsThisRound / GAME_RULES.finalCoinConversion)
                + Math.floor(player.rubies / GAME_RULES.finalRubyConversion),
        }));
        const ranked = [...finalPlayers].sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return calculateRoundScore(b.crucible).space - calculateRoundScore(a.crucible).space;
        });
        const winner = ranked[0];
        const winningSpace = calculateRoundScore(winner.crucible).space;
        const winners = ranked.filter((player) =>
            player.score === winner.score &&
            calculateRoundScore(player.crucible).space === winningSpace
        );
        const human = finalPlayers.find(p => p.id === "human");
        if (human && winners.some((player) => player.id === human.id)) {
            soundManager.play("game_win");
        } else {
            soundManager.play("game_lose");
        }
        return { ...state, players: finalPlayers, phase: "game_over", winner, winners };
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
            blueProtectionDraws: 0,
            blueBonusExplosion: false,
            yellowDoubleNext: false,
            omenFirstWhiteReturned: false,
            omenSecondChanceUsed: false,
            preparedEmberForRound: player.preparedEmberForRound === nextRound ? nextRound : undefined,
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
        activePlayerIndex: (state.activePlayerIndex + 1) % state.players.length,
        phase: "omen",
        currentOmen: omenResult?.card ?? null,
        omenDeck: omenResult?.remaining ?? [],
        market: refreshMarketAvailability(newState.market, nextRound),
        buyPhaseState: null,
        marketCompletedPlayerIds: [],
        omenCompletedPlayerIds: [],
        pendingBlueTokens: undefined,
        pendingScryTokens: undefined,
        scryPreparedTokenId: undefined,
        pendingYellowPreviousToken: undefined,
        pendingRedTokens: undefined,
        pendingPurpleChoices: undefined,
        pendingOmenChoices: undefined,
        pendingGreenRewards: undefined,
        pendingGreenSpendMax: undefined,
        pendingGreenMoveAmount: undefined,
        pendingMovementChoice: undefined,
        pendingPurpleAIPlayerIds: undefined,
        pendingGreenAIPlayerIds: undefined,
        pendingOmenSampleTokens: undefined,
        pendingOmenRewardPlayerIds: undefined,
        pendingOmenUpgradePlayerIds: undefined,
        phaseAfterOmenChoice: undefined,
        phaseAfterGreenChoice: undefined,
        bonusDieResult: null,
        bonusDieWinner: null,
        roundSummary: null,
    };
}
