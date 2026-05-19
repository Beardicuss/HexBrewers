import React, { useEffect, useCallback } from "react";
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

  // Handle draw — animate then update store
  const handleDraw = useCallback(async () => {
    // Optimistically get the top draw to animate, then commit
    store.humanDraw();
  }, [store]);

  const handleStop = useCallback(() => {
    store.humanStop();
  }, [store]);

  const handleOmenDismiss = useCallback(() => {
    // Advance phase from omen → brewing
    useGameStore.setState((s) => ({
      state: { ...s.state, phase: "brewing" },
    }));
  }, []);

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
    // Immediately close the market overlay by switching phase
    useGameStore.setState((s) => ({
      state: { ...s.state, phase: "brewing" as any },
    }));

    try {
      const aiPlayer = useGameStore.getState().state.players.find((p) => p.kind === "ai")!;
      const state = useGameStore.getState().state;
      const finalAI = await runAITurn(aiPlayer, state);
      store.commitAITurn(finalAI);
    } catch (err) {
      console.error("AI turn failed, advancing round anyway:", err);
      const aiPlayer = useGameStore.getState().state.players.find((p) => p.kind === "ai")!;
      store.commitAITurn(aiPlayer);
    }
  }, [store, runAITurn]);

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
              canUseFlask={human.flask}
              onDraw={handleDraw}
              onStop={handleStop}
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
              onDone={() => store.humanDoneRubySpend()}
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

// ── Exploded choice panel ──────────────────────────────────────────────────────

function ExplodedChoicePanel({
  onChoose,
}: {
  onChoose: (c: "vp" | "coins") => void;
}) {
  const t = useTranslation();
  return (
    <div style={choiceStyles.panel}>
      <div style={choiceStyles.label}>{t.exploded.title}</div>
      <div style={choiceStyles.buttons}>
        <button style={choiceStyles.btn} onClick={() => onChoose("vp")}>
          {t.exploded.oneVP}
        </button>
        <button style={choiceStyles.btn} onClick={() => onChoose("coins")}>
          {t.exploded.lastIngredient}
        </button>
      </div>
    </div>
  );
}

// ── AI status panel ───────────────────────────────────────────────────────────

function AIStatusPanel({ phase }: { phase: string }) {
  const t = useTranslation();
  const messages: Record<string, string> = {
    omen: "...",
    brewing: t.game.shadeBrewing,
    scoring: "...",
    market: "...",
    setup: "",
    game_over: "",
  };

  const msg = messages[phase] ?? "";
  if (!msg) return null;

  return (
    <div style={aiStyles.panel}>
      <span style={aiStyles.dot}>◈</span>
      <span style={aiStyles.text}>{msg}</span>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    height: "100vh",
    position: "relative", // Needed so the absolute canvasWrapper aligns properly
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
    justifyContent: "space-between", // Spread left and right panels completely to the edges
  },
  leftCol: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
    width: 220,
    flexShrink: 0,
    zIndex: 10, // Float above absolute webGL canvas
  },
  canvasWrapper: {
    position: "absolute",
    inset: 0, // Fill screen
    zIndex: 0, // Behind UI layers
    pointerEvents: "none", // Let user click UI completely transparently
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

const choiceStyles: Record<string, React.CSSProperties> = {
  panel: {
    background: "rgba(30, 10, 50, 0.6)",
    border: "1px solid #5a1a8a",
    borderRadius: 8,
    padding: "14px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  label: {
    fontFamily: "serif",
    fontSize: 12,
    color: "#e8b84d",
    textAlign: "center",
    fontStyle: "italic",
  },
  buttons: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  btn: {
    background: "transparent",
    border: "1px solid #5a1a8a",
    borderRadius: 6,
    padding: "9px",
    color: "#e8d5b5",
    fontFamily: "serif",
    fontSize: 13,
    letterSpacing: 1,
    cursor: "pointer",
  },
};

const aiStyles: Record<string, React.CSSProperties> = {
  panel: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 14px",
    background: "rgba(10, 4, 20, 0.5)",
    border: "1px solid #1a0a2e",
    borderRadius: 7,
  },
  dot: {
    color: "#553377",
    fontSize: 12,
  },
  text: {
    fontFamily: "monospace",
    fontSize: 11,
    color: "#8a7656",
    fontStyle: "italic",
  },
};
