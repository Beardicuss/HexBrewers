import React, { useEffect, useCallback, useRef } from "react";
import { useTranslation } from "../i18n/useTranslation";
import { useGameStore } from "../store/gameStore";
import {
  useHumanPlayer,
  useAIPlayer,
  useGamePhase,
  useCurrentRound,
  useTotalRounds,
  useCurrentOmen,
  useMarket,
  useWinner,
  useCanHumanDraw,
  useCanHumanUseFlask,
  useBuyPhaseState,
} from "../store/selectors";
import { usePixiCanvas } from "./usePixiCanvas";
import { useAITurn } from "./useAITurn";
import { AITurnOverlay } from "./AITurnOverlay";
import { OmenCardDisplay } from "./OmenCardDisplay";
import { PlayerPanel } from "./PlayerPanel";
import { BrewingControls } from "./BrewingControls";
import { BlackMarket } from "./BlackMarket";
import { GameOver } from "./GameOver";
import { BlueChoicePanel } from "./BlueChoicePanel";
import { RubySpendPanel } from "./RubySpendPanel";
import { ExplodedChoicePanel } from "./ExplodedChoicePanel";
import { AIStatusPanel } from "./AIStatusPanel";

// GameBoard rendering

export function GameBoard() {
  const t = useTranslation();
  const store = useGameStore();
  const human = useHumanPlayer();
  const ai = useAIPlayer();
  const phase = useGamePhase();
  const round = useCurrentRound();
  const totalRounds = useTotalRounds();
  const omen = useCurrentOmen();
  const market = useMarket();
  const winner = useWinner();
  const canDraw = useCanHumanDraw();
  const canUseFlask = useCanHumanUseFlask();
  const buyPhaseState = useBuyPhaseState();

  const {
    containerRef,
    updateCrucible,
    animateDraw,
    updateBagCount,
    playExplosion,
    resetRound,
  } = usePixiCanvas({});

  const { running: aiRunning, events: aiEvents, aiWhiteSum, aiSpiral, runAITurn } = useAITurn();
  const resolvingAI = useRef(false);

  // Sync crucible visuals whenever human player state changes
  useEffect(() => {
    updateCrucible(human.crucible);
    updateBagCount(human.bag.tokens.length);
  }, [human.crucible, human.bag.tokens.length, updateCrucible, updateBagCount]);

  // Play explosion overlay when crucible shatters
  useEffect(() => {
    if (human.crucible.exploded) {
      playExplosion();
    }
  }, [human.crucible.exploded, playExplosion]);

  // Reset pixi scene between rounds
  useEffect(() => {
    if (phase === "omen") {
      resetRound();
    }
  }, [phase, round, resetRound]);

  useEffect(() => {
    if (phase !== "end_of_round" || resolvingAI.current) return;

    resolvingAI.current = true;
    (async () => {
      try {
        const aiPlayer = useGameStore.getState().state.players.find((p) => p.kind === "ai")!;
        const state = useGameStore.getState().state;
        const finalAI = await runAITurn(aiPlayer, state);
        store.commitAIBrewAndResolve(finalAI);
      } catch (err) {
        console.error("AI brewing failed, resolving with current AI:", err);
        const aiPlayer = useGameStore.getState().state.players.find((p) => p.kind === "ai")!;
        store.commitAIBrewAndResolve(aiPlayer);
      } finally {
        resolvingAI.current = false;
      }
    })();
  }, [phase, runAITurn, store]);

  // Handle draw — animate then update store
  const handleDraw = useCallback(async () => {
    // Optimistically get the top draw to animate, then commit
    store.humanDraw();
  }, [store]);

  const handleStop = useCallback(() => {
    store.humanStop();
  }, [store]);

  const handleOmenDismiss = useCallback(() => {
    store.dismissOmen();
  }, [store]);

  const handleExplodedChoice = useCallback(
    (choice: "vp" | "coins") => {
      store.humanExplodedChoice(choice);
    },
    [store]
  );

  const handleBuyItem = useCallback(
    (itemId: string) => {
      store.humanBuyItem(itemId);
    },
    [store]
  );

  const handleEndMarket = useCallback(async () => {
    store.humanEndMarket();
  }, [store]);

  const handleRubyDone = useCallback(async () => {
    store.humanDoneRubySpend();
  }, [store]);

  const handleRestart = useCallback(() => {
    store.initGame();
  }, [store]);

  return (
    <div style={styles.root}>
      {/* Round header */}
      <div style={styles.header}>
        <div style={styles.gameTitle}>{t.game.title}</div>
        <div style={styles.roundInfo}>
          {t.game.round} {round} {t.game.of} {totalRounds}
          <span style={styles.phaseTag}>{phase.toUpperCase()}</span>
        </div>
      </div>

      {/* Main layout */}
      <div style={styles.layout}>
        {/* Left — human panel + controls */}
        <div style={styles.leftCol}>
          <PlayerPanel player={human} isActive={phase === "brewing"} label={t.game.you} />

          {phase === "brewing" && (
            <BrewingControls
              canDraw={canDraw}
              canUseFlask={canUseFlask}
              onDraw={handleDraw}
              onStop={handleStop}
              onUseFlask={() => store.humanUseFlask()}
              whiteSum={human.crucible.whiteSum}
              bagCount={human.bag.tokens.length}
            />
          )}

          {/* Exploded choice */}
          {phase === "scoring" && human.crucible.exploded && (
            <ExplodedChoicePanel onChoose={handleExplodedChoice} />
          )}

          {/* Blue chip choice (Frostbile) */}
          {phase === "blue_choice" && store.state.pendingBlueTokens && (
            <BlueChoicePanel
              tokens={store.state.pendingBlueTokens}
              onChoose={(keepId: string | null) => store.humanResolveBlue(keepId, store.state.pendingBlueTokens!)}
            />
          )}

          {/* Ruby spend phase */}
          {phase === "ruby_spend" && (
            <RubySpendPanel
              player={human}
              bonusDieResult={store.state.bonusDieResult}
              canDroplet={store.canAdvanceDroplet()}
              canFlask={store.canRefillFlask()}
              onDroplet={() => store.humanSpendRubyDroplet()}
              onFlask={() => store.humanSpendRubyFlask()}
              onDone={handleRubyDone}
            />
          )}
        </div>

        {/* Center — Pixi canvas */}
        <div style={styles.canvasWrapper}>
          <div ref={containerRef} style={styles.canvas} />
        </div>

        {/* Right — AI panel */}
        <div style={styles.rightCol}>
          <PlayerPanel player={ai} isActive={false} label={t.game.theShade} />
          <AIStatusPanel phase={phase} />
        </div>
      </div>

      {/* Overlays */}
      <OmenCardDisplay
        card={omen}
        visible={phase === "omen"}
        onDismiss={handleOmenDismiss}
      />

      {phase === "market" && (
        <BlackMarket
          market={market}
          player={human}
          buyPhaseState={buyPhaseState!}
          round={round}
          onBuy={handleBuyItem}
          onDone={handleEndMarket}
        />
      )}

      {phase === "game_over" && winner && (
        <GameOver
          players={[human, ai]}
          winner={winner}
          onRestart={handleRestart}
        />
      )}

      <AITurnOverlay
        visible={aiRunning}
        events={aiEvents}
        whiteSum={aiWhiteSum}
        spiral={aiSpiral}
      />
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  root: {
    height: "100vh",
    position: "relative",
    overflow: "hidden",
    backgroundImage: "url('/images/cauldron_bg.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    display: "flex",
    flexDirection: "column",
    color: "#cc99ff",
    fontFamily: "serif",
    userSelect: "none",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 28px",
    borderBottom: "1px solid #1a0a2e",
    background: "rgba(10, 4, 20, 0.8)",
  },
  gameTitle: {
    fontSize: 18,
    color: "#e8b84d",
    letterSpacing: 2,
    textShadow: "0 0 12px rgba(160, 80, 220, 0.3)",
  },
  roundInfo: {
    fontFamily: "monospace",
    fontSize: 13,
    color: "#c9a86c",
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  phaseTag: {
    background: "rgba(80, 20, 120, 0.3)",
    border: "1px solid #3a1a5a",
    borderRadius: 4,
    padding: "2px 8px",
    fontSize: 10,
    color: "#8a7656",
    letterSpacing: 2,
  },
  layout: {
    flex: 1,
    display: "flex",
    gap: 0,
    padding: "40px 60px",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  leftCol: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
    width: 220,
    flexShrink: 0,
    zIndex: 10,
  },
  canvasWrapper: {
    position: "absolute",
    inset: 0,
    zIndex: 0,
    pointerEvents: "none",
  },
  canvas: {
    width: "100%",
    height: "100%",
  },
  rightCol: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
    width: 220,
    flexShrink: 0,
    zIndex: 10,
  },
};
