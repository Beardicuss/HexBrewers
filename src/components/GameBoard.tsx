import React, { useEffect, useCallback, useRef, useState } from "react";
import { useTranslation } from "../i18n/useTranslation";
import { useGameStore } from "../store/gameStore";
import {
  useHumanPlayer,
  useAIPlayers,
  useGamePhase,
  useCurrentRound,
  useTotalRounds,
  useCurrentOmen,
  useMarket,
  useWinner,
  useWinners,
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
import { YellowChoicePanel } from "./YellowChoicePanel";
import { MovementChoicePanel } from "./MovementChoicePanel";
import { GreenSpendChoicePanel } from "./GreenSpendChoicePanel";
import { GreenMoveChoicePanel } from "./GreenMoveChoicePanel";
import { RoundSummaryPanel } from "./RoundSummaryPanel";
import { CovenantPanel } from "./CovenantPanel";
import { prepareAICovenantForBrewing } from "../game/covenants";
import { RedReserveChoicePanel } from "./RedReserveChoicePanel";
import { GreenRewardChoicePanel } from "./GreenRewardChoicePanel";
import { PurpleChoicePanel } from "./PurpleChoicePanel";
import { OmenChoicePanel } from "./OmenChoicePanel";
import { OmenStrongChoicePanel } from "./OmenStrongChoicePanel";
import { OmenRestartChoicePanel } from "./OmenRestartChoicePanel";
import { SettingsScreen } from "./settings/SettingsScreen";
import { calculateRoundScore } from "../game/scoring";
import { useSettingsStore } from "../store/settingsStore";
import { useFocusTrap } from "./useFocusTrap";
import { AfflictionSelection } from "./AfflictionSelection";
import { CovenantSelectionScreen } from "./CovenantSelection";
import { prefersReducedMotion } from "../accessibility";
import { ACTIVE_GAMEPLAY_SCENE_ID, GAMEPLAY_SCENES, getGameplaySceneCssVariables } from "../gameplaySceneThemes";

// GameBoard rendering

interface GameBoardProps {
  onReturnToMenu: () => void;
  onRestart: () => void;
}

export function GameBoard({ onReturnToMenu, onRestart }: GameBoardProps) {
  const gameplayScene = GAMEPLAY_SCENES[ACTIVE_GAMEPLAY_SCENE_ID];
  const t = useTranslation();
  const quality = useSettingsStore((state) => state.quality);
  const masterVolume = useSettingsStore((state) => state.masterVolume);
  const sfxVolume = useSettingsStore((state) => state.sfxVolume);
  const store = useGameStore();
  const human = useHumanPlayer();
  const aiPlayers = useAIPlayers();
  const phase = useGamePhase();
  const round = useCurrentRound();
  const totalRounds = useTotalRounds();
  const omen = useCurrentOmen();
  const market = useMarket();
  const winner = useWinner();
  const winners = useWinners();
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
    setPaused: setCanvasPaused,
  } = usePixiCanvas({
    explosionLabel: t.player.shattered,
    renderScale: quality === "high" ? 1 : quality === "medium" ? 0.75 : 0.5,
    mirewroughtEnabled: store.state.setup.modules.patrons,
  });

  const { running: aiRunning, events: aiEvents, aiWhiteSum, aiSpiral, runAITurn, fastForward, resetFastForward } = useAITurn();
  const resolvingAI = useRef(false);
  const drawingToken = useRef(false);
  const handVideoRef = useRef<HTMLVideoElement>(null);
  const backgroundVideoRef = useRef<HTMLVideoElement>(null);
  const [drawAnimating, setDrawAnimating] = useState(false);
  const [activeAIName, setActiveAIName] = useState(aiPlayers[0]?.name ?? t.game.theShade);
  const [paused, setPaused] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const tutorialSeen = useSettingsStore((state) => state.tutorialSeen);
  const setTutorialSeen = useSettingsStore((state) => state.setTutorialSeen);
  const [tutorialOpen, setTutorialOpen] = useState(!tutorialSeen && phase !== "setup");
  const [tutorialStep, setTutorialStep] = useState(0);
  const pauseButtonRef = useRef<HTMLButtonElement>(null);
  const gameContentRef = useRef<HTMLDivElement>(null);
  const pausePanelRef = useRef<HTMLDivElement>(null);
  const tutorialPanelRef = useRef<HTMLDivElement>(null);
  const afflictionPanelRef = useRef<HTMLDivElement>(null);
  const covenantSetupPanelRef = useRef<HTMLDivElement>(null);
  const needsCovenantSetup = phase === "setup" && store.state.setup.modules.patrons && !store.state.selectedCovenants;
  const needsAfflictionSetup = phase === "setup" && store.state.setup.modules.distillation && !needsCovenantSetup;
  const modalOpen = paused || settingsOpen || tutorialOpen || phase === "setup";

  useEffect(() => {
    const backgroundVideo = backgroundVideoRef.current;
    if (!backgroundVideo) return;

    // The scene's native ambience is environmental SFX. Keep it quiet beneath
    // gameplay while respecting both the master and SFX volume sliders.
    const ambienceBaseVolume = 0.15;
    backgroundVideo.volume = ambienceBaseVolume * (masterVolume / 100) * (sfxVolume / 100);
    backgroundVideo.muted = false;
  }, [masterVolume, sfxVolume]);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncActivity = () => {
      const inactive = modalOpen || document.hidden;
      setCanvasPaused(inactive);
      const backgroundVideo = backgroundVideoRef.current;
      if (!backgroundVideo) return;
      if (inactive || motionQuery.matches) backgroundVideo.pause();
      else void backgroundVideo.play().catch(() => undefined);
    };
    const unlockBackgroundAudio = async () => {
      if (!modalOpen && !document.hidden && !motionQuery.matches) {
        try {
          await backgroundVideoRef.current?.play();
          document.removeEventListener("pointerdown", unlockBackgroundAudio);
        } catch {
          // Keep listening until a valid user gesture successfully unlocks audio.
        }
      }
    };
    syncActivity();
    document.addEventListener("visibilitychange", syncActivity);
    document.addEventListener("pointerdown", unlockBackgroundAudio);
    motionQuery.addEventListener("change", syncActivity);
    return () => {
      document.removeEventListener("visibilitychange", syncActivity);
      document.removeEventListener("pointerdown", unlockBackgroundAudio);
      motionQuery.removeEventListener("change", syncActivity);
    };
  }, [modalOpen, setCanvasPaused]);
  useFocusTrap(paused && !settingsOpen, pausePanelRef);
  useFocusTrap(tutorialOpen, tutorialPanelRef);
  useFocusTrap(needsAfflictionSetup, afflictionPanelRef);
  useFocusTrap(needsCovenantSetup, covenantSetupPanelRef);
  useEffect(() => {
    if (phase !== "setup" && !tutorialSeen) setTutorialOpen(true);
  }, [phase, tutorialSeen]);
  const resumeGame = useCallback(() => {
    setPaused(false);
    window.requestAnimationFrame(() => pauseButtonRef.current?.focus());
  }, []);

  useEffect(() => {
    const content = gameContentRef.current;
    if (!content) return;
    if (modalOpen) content.setAttribute("inert", "");
    else content.removeAttribute("inert");
  }, [modalOpen]);

  const phaseLabel = {
    setup: t.game.setup,
    rat_tails: t.game.ratTails,
    omen: t.game.omen,
    omen_choice: t.game.omenChoice,
    omen_strong_choice: t.game.omenStrongChoice,
    omen_restart_choice: t.game.omenRestartChoice,
    brewing: t.game.brewing,
    blue_choice: t.game.blueChoice,
    yellow_choice: t.game.yellowChoice,
    movement_choice: t.game.movementChoice,
    red_choice: t.game.redChoice,
    green_choice: t.game.greenChoice,
    green_move_choice: t.game.greenMoveChoice,
    green_reward_choice: t.game.greenRewardChoice,
    purple_choice: t.game.purpleChoice,
    end_of_round: t.game.endOfRound,
    distillation: t.game.distillation,
    scoring: t.game.scoring,
    ruby_spend: t.game.rubySpend,
    market: t.game.market,
    game_over: t.game.gameOver,
  }[phase];

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (tutorialOpen) return;
      if (settingsOpen) {
        setSettingsOpen(false);
        return;
      }
      if (paused) {
        resumeGame();
      } else if (!aiRunning && phase !== "game_over") {
        setPaused(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [aiRunning, paused, phase, resumeGame, settingsOpen, tutorialOpen]);

  const closeTutorial = useCallback(() => {
    setTutorialSeen(true);
    setTutorialOpen(false);
  }, [setTutorialSeen]);

  const replayTutorial = useCallback(() => {
    setTutorialStep(0);
    setTutorialOpen(true);
    setPaused(false);
  }, []);

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
    resetFastForward();
    (async () => {
      const initialState = useGameStore.getState().state;
      const opponents = initialState.players.filter((p) => p.kind === "ai");
      const finalAIs: typeof opponents = [];
      let workingState = initialState;
      try {
        for (const aiPlayer of opponents) {
          setActiveAIName(aiPlayer.name);
          try {
            const brewingAI = workingState.setup.modules.patrons
              ? prepareAICovenantForBrewing(aiPlayer, workingState.selectedCovenants)
              : aiPlayer;
            const finalAI = await runAITurn(brewingAI, workingState);
            finalAIs.push(finalAI);
            workingState = {
              ...workingState,
              players: workingState.players.map((player) => player.id === finalAI.id ? finalAI : player),
            };
          } catch (err) {
            console.error(`AI brewing failed for ${aiPlayer.name}:`, err);
            finalAIs.push(aiPlayer);
          }
        }
        store.commitAIBrewsAndResolve(finalAIs);
      } finally {
        resolvingAI.current = false;
        resetFastForward();
      }
    })();
  }, [phase, resetFastForward, runAITurn, store]);

  // Handle draw — animate then update store
  const handleDraw = useCallback(async () => {
    if (drawingToken.current) return;
    drawingToken.current = true;
    setDrawAnimating(true);
    try {
      const handVideo = handVideoRef.current;
      let handFinished: Promise<void> | null = null;
      if (handVideo && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        handVideo.currentTime = 0;
        handFinished = new Promise((resolve) => {
          handVideo.addEventListener("ended", () => resolve(), { once: true });
        });
        try {
          await handVideo.play();
          // The generated fingers open 1.1 seconds into the accelerated clip.
          await new Promise((resolve) => window.setTimeout(resolve, 1080));
        } catch {
          handFinished = null;
        }
      }
      const result = store.humanDraw();
      if (result) await animateDraw(result.token);
      if (handFinished) await handFinished;
    } finally {
      drawingToken.current = false;
      setDrawAnimating(false);
    }
  }, [animateDraw, store]);

  const handleStop = useCallback(() => {
    if (drawingToken.current) return;
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
    if (!window.confirm(t.pause.confirmRestart)) return;
    onRestart();
    setPaused(false);
  }, [onRestart, t.pause.confirmRestart]);

  const handleReturnToMenu = useCallback(() => {
    if (!window.confirm(t.pause.confirmMenu)) return;
    onReturnToMenu();
  }, [onReturnToMenu, t.pause.confirmMenu]);

  return (
    <div
      className="game-viewport"
      data-gameplay-scene={ACTIVE_GAMEPLAY_SCENE_ID}
      style={{ ...styles.viewport, ...getGameplaySceneCssVariables(gameplayScene) }}
    >
    <video
      ref={backgroundVideoRef}
      className="game-background-video"
      style={styles.backgroundVideo}
      autoPlay={!prefersReducedMotion()}
      loop
      playsInline
      preload="auto"
      poster={gameplayScene.poster}
      aria-hidden="true"
    >
      <source src={gameplayScene.video} type="video/mp4" />
    </video>
    <div
      className="game-stage"
      style={styles.stage}
    >
    <div className="game-root" style={styles.root}>
      <video
        ref={handVideoRef}
        className="ingredient-hand-video"
        style={styles.handVideo}
        src="/videos/hand-place-alpha.webm"
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
      />
      <div
        ref={gameContentRef}
        style={styles.gameContent}
        aria-hidden={modalOpen ? true : undefined}
      >
      {/* Round header */}
      <div className="game-header" style={styles.header}>
        <div className="game-title" style={styles.gameTitle}>{t.game.title}</div>
        <div style={styles.roundInfo}>
          {t.game.round} {round} {t.game.of} {totalRounds}
          <span style={styles.phaseTag}>{phaseLabel}</span>
          <button
            ref={pauseButtonRef}
            style={styles.pauseButton}
            onClick={() => setPaused(true)}
            disabled={aiRunning}
            aria-label={t.pause.open}
          >
            Ⅱ
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div className="game-layout" style={styles.layout}>
        {/* Left — human panel + controls */}
        <div className="game-side" style={styles.leftCol}>
          <PlayerPanel player={human} isActive={phase === "brewing" && !aiRunning} label={t.game.you} />

          {store.state.setup.modules.patrons && (
            <CovenantPanel
              player={human}
              phase={phase}
              selection={store.state.selectedCovenants}
              onUse={(kind) => store.humanUseCovenant(kind)}
            />
          )}

          {phase === "brewing" && (
            <BrewingControls
              canDraw={canDraw && !drawAnimating}
              canUseFlask={canUseFlask && !drawAnimating}
              onDraw={handleDraw}
              onStop={handleStop}
              onUseFlask={() => {
                if (!drawingToken.current) store.humanUseFlask();
              }}
              whiteSum={human.crucible.whiteSum}
              bagCount={human.bag.tokens.length}
            />
          )}

          {/* Exploded choice */}
          {phase === "scoring" && human.crucible.exploded && (
            <ExplodedChoicePanel
              onChoose={handleExplodedChoice}
              prestige={calculateRoundScore(human.crucible).vp}
              coins={calculateRoundScore(human.crucible).coins}
            />
          )}

          {/* Blue chip choice (Frostbile) */}
          {phase === "blue_choice" && store.state.pendingBlueTokens && (
            <BlueChoicePanel
              tokens={store.state.pendingBlueTokens}
              onChoose={(keepId: string | null) => store.humanResolveBlue(keepId, store.state.pendingBlueTokens!)}
            />
          )}

          {phase === "yellow_choice" && store.state.pendingYellowPreviousToken && (
            <YellowChoicePanel
              token={store.state.pendingYellowPreviousToken}
              onChoose={(returnPrevious) => store.humanResolveYellow(returnPrevious)}
            />
          )}

          {phase === "movement_choice" && store.state.pendingMovementChoice && (
            <MovementChoicePanel
              amount={store.state.pendingMovementChoice.amount}
              source={store.state.pendingMovementChoice.source}
              onChoose={(apply) => store.humanResolveMovement(apply)}
            />
          )}

          {phase === "red_choice" && store.state.pendingRedTokens?.[0] && (
            <RedReserveChoicePanel
              token={store.state.pendingRedTokens[0]}
              remaining={store.state.pendingRedTokens.length}
              onChoose={(action) => store.humanResolveRed(action)}
            />
          )}

          {phase === "green_choice" && store.state.pendingGreenSpendMax !== undefined && (
            <GreenSpendChoicePanel
              maxSteps={store.state.pendingGreenSpendMax}
              onChoose={(steps) => store.humanResolveGreenSpend(steps)}
            />
          )}

          {phase === "green_move_choice" && store.state.pendingGreenMoveAmount !== undefined && (
            <GreenMoveChoicePanel
              amount={store.state.pendingGreenMoveAmount}
              onChoose={(move) => store.humanResolveGreenMove(move)}
            />
          )}

          {phase === "green_reward_choice" && store.state.pendingGreenRewards?.[0] && (
            <GreenRewardChoicePanel
              reward={store.state.pendingGreenRewards[0]}
              remaining={store.state.pendingGreenRewards.length}
              onChoose={(color, value) => store.humanResolveGreenReward(color, value)}
            />
          )}

          {phase === "purple_choice" && store.state.pendingPurpleChoices && (
            <PurpleChoicePanel
              choices={store.state.pendingPurpleChoices}
              onChoose={(choiceId) => store.humanResolvePurple(choiceId)}
            />
          )}

          {phase === "omen_choice" && store.state.pendingOmenChoices && (
            <OmenChoicePanel
              choices={store.state.pendingOmenChoices}
              onChoose={(choiceId) => store.humanResolveOmenChoice(choiceId)}
            />
          )}

          {phase === "omen_strong_choice" && store.state.pendingOmenSampleTokens && (
            <OmenStrongChoicePanel
              tokens={store.state.pendingOmenSampleTokens}
              onChoose={(tokenId) => store.humanResolveStrongIngredient(tokenId)}
            />
          )}

          {phase === "omen_restart_choice" && (
            <OmenRestartChoicePanel
              canUseFlask={Boolean(
                human.flask &&
                human.crucible.lastDrawnToken?.color === "white" &&
                !human.crucible.exploded
              )}
              onChoose={(choice) => store.humanResolveOmenRestart(choice)}
            />
          )}

          {store.state.roundSummary && ["scoring", "green_choice", "market"].includes(phase) && (
            <RoundSummaryPanel summary={store.state.roundSummary} />
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
        <div className="game-canvas" style={styles.canvasWrapper}>
          <div ref={containerRef} style={styles.canvas} />
        </div>

        {/* Right — AI panel */}
        <div className="game-side opponent-stack" style={styles.rightCol}>
          {aiPlayers.map((ai) => {
            const status = ai.crucible.exploded
              ? undefined
              : aiRunning && ai.name === activeAIName
                ? "brewing" as const
                : aiRunning && ai.crucible.placements.length > 0
                  ? "stopped" as const
                  : aiRunning || phase === "brewing"
                    ? "queued" as const
                    : ["scoring", "green_choice", "market", "ruby_spend", "game_over"].includes(phase)
                      ? "complete" as const
                      : "queued" as const;
            return (
              <PlayerPanel
                key={ai.id}
                player={ai}
                isActive={status === "brewing"}
                label={ai.name}
                compact={aiPlayers.length > 1}
                status={status}
              />
            );
          })}
          <div className="opponent-status"><AIStatusPanel phase={phase} /></div>
        </div>
      </div>

      {/* In-game overlays */}
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
          players={[human, ...aiPlayers]}
          winners={winners}
          onRestart={handleRestart}
        />
      )}

      <AITurnOverlay
        visible={aiRunning}
        events={aiEvents}
        whiteSum={aiWhiteSum}
        spiral={aiSpiral}
        onFastForward={fastForward}
        opponentName={activeAIName}
      />
      </div>

      {needsCovenantSetup && store.state.covenantOffer && (
        <CovenantSelectionScreen
          offer={store.state.covenantOffer}
          panelRef={covenantSetupPanelRef}
          onConfirm={(selection) => store.selectCovenants(selection)}
        />
      )}

      {needsAfflictionSetup && (
        <AfflictionSelection
          ids={store.state.afflictionOffer ?? []}
          panelRef={afflictionPanelRef}
          onSelect={(id) => store.selectHumanAffliction(id)}
        />
      )}

      {paused && !settingsOpen && (
        <div style={styles.pauseOverlay} role="dialog" aria-modal="true" aria-label={t.pause.title}>
          <div ref={pausePanelRef} style={styles.pausePanel}>
            <h2 style={styles.pauseTitle}>{t.pause.title}</h2>
            <button style={styles.pauseAction} autoFocus onClick={resumeGame}>{t.pause.resume}</button>
            <button style={styles.pauseAction} onClick={() => setSettingsOpen(true)}>{t.pause.settings}</button>
            <button style={styles.pauseAction} onClick={replayTutorial}>{t.pause.tutorial}</button>
            <button style={styles.pauseAction} onClick={handleRestart}>{t.pause.restart}</button>
            <button className="ashen-route-button" style={{ ...styles.pauseAction, ...styles.pauseMenuAction }} onClick={handleReturnToMenu}>{t.pause.mainMenu}</button>
          </div>
        </div>
      )}

      {settingsOpen && (
        <SettingsScreen
          onBack={() => setSettingsOpen(false)}
          backLabel={t.pause.backToPause}
        />
      )}

      {tutorialOpen && (
        <div style={styles.tutorialOverlay} role="dialog" aria-modal="true" aria-labelledby="tutorial-title">
          <div ref={tutorialPanelRef} style={styles.tutorialPanel}>
            <div style={styles.tutorialOrnament}>✦　◇　✦</div>
            <div style={styles.tutorialProgress}>
              {t.tutorial.steps.map((_, index) => <span key={index} style={{ ...styles.tutorialProgressMark, ...(index === tutorialStep ? styles.tutorialProgressMarkActive : {}) }}>◆</span>)}
            </div>
            <div style={styles.tutorialChapter}>LESSON {String(tutorialStep + 1).padStart(2, "0")} · {String(t.tutorial.steps.length).padStart(2, "0")}</div>
            <h2 id="tutorial-title" style={styles.tutorialTitle}>{t.tutorial.title}</h2>
            <p style={styles.tutorialText}>{t.tutorial.steps[tutorialStep]}</p>
            <div style={styles.tutorialActions}>
              <button className="tutorial-nav tutorial-skip" style={styles.tutorialSkip} onClick={closeTutorial}>{t.tutorial.skip}</button>
              <button
                className="tutorial-nav tutorial-next"
                style={styles.tutorialNext}
                autoFocus
                onClick={() => {
                  if (tutorialStep >= t.tutorial.steps.length - 1) closeTutorial();
                  else setTutorialStep((step) => step + 1);
                }}
              >
                {tutorialStep >= t.tutorial.steps.length - 1 ? t.tutorial.start : t.tutorial.next}
              </button>
            </div>
          </div>
          <style>{`.tutorial-nav{transition:color .18s,border-color .18s,text-shadow .18s,transform .18s}.tutorial-nav:hover,.tutorial-nav:focus-visible{color:#f4d88c!important;border-color:#d4a74c!important;text-shadow:0 0 14px rgba(224,175,79,.5);transform:translateY(-2px);outline:none}`}</style>
        </div>
      )}
    </div>
    </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  viewport: {
    position: "fixed",
    inset: 0,
    overflow: "hidden",
    backgroundColor: "#020107",
    backgroundImage: "url('/images/cauldron_bg.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  },
  stage: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    overflow: "hidden",
    containerType: "size",
    zIndex: 1,
  },
  root: {
    width: "100%",
    height: "100%",
    position: "relative",
    overflow: "hidden",
    background: "transparent",
    display: "flex",
    flexDirection: "column",
    color: "#cc99ff",
    fontFamily: "serif",
    userSelect: "none",
  },
  gameContent: {
    position: "relative",
    zIndex: 1,
    minHeight: 0,
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  backgroundVideo: {
    position: "fixed",
    inset: 0,
    zIndex: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: "center",
    pointerEvents: "none",
  },
  handVideo: {
    position: "absolute",
    left: "50%",
    top: "50%",
    zIndex: 8,
    width: "min(460px, 34cqw)",
    height: "auto",
    transform: "translate(-50%, -50%)",
    WebkitMaskImage: "linear-gradient(135deg, #000 0%, #000 52%, rgba(0,0,0,.92) 60%, rgba(0,0,0,.48) 72%, transparent 88%)",
    maskImage: "linear-gradient(135deg, #000 0%, #000 52%, rgba(0,0,0,.92) 60%, rgba(0,0,0,.48) 72%, transparent 88%)",
    pointerEvents: "none",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px clamp(18px, 2cqw, 32px)",
    borderBottom: "1px solid var(--scene-panel-border, rgba(111, 58, 145, 0.55))",
    background: "linear-gradient(90deg, var(--scene-panel-bottom, rgba(9, 3, 17, 0.96)), var(--scene-panel-top, rgba(18, 6, 30, 0.88)), var(--scene-panel-bottom, rgba(9, 3, 17, 0.96)))",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.35), 0 2px 16px var(--scene-panel-glow, transparent)",
    zIndex: 20,
  },
  gameTitle: {
    fontSize: 18,
    color: "#e8b84d",
    letterSpacing: 2,
    textShadow: "0 0 12px var(--scene-panel-glow, rgba(160, 80, 220, 0.3))",
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
    background: "var(--scene-surface, rgba(80, 20, 120, 0.3))",
    border: "1px solid var(--scene-panel-border-muted, #3a1a5a)",
    borderRadius: 4,
    padding: "2px 8px",
    fontSize: 10,
    color: "#8a7656",
    letterSpacing: 2,
  },
  pauseButton: {
    width: 30,
    height: 28,
    border: "1px solid var(--scene-panel-border, #5a347a)",
    borderRadius: 5,
    background: "var(--scene-surface, rgba(40, 14, 66, 0.75))",
    color: "var(--scene-cool-accent, #d8b5ef)",
    cursor: "pointer",
  },
  pauseOverlay: {
    position: "fixed",
    inset: 0,
    zIndex: 100,
    display: "grid",
    placeItems: "center",
    background: "rgba(3, 1, 8, 0.82)",
    backdropFilter: "blur(8px)",
  },
  pausePanel: {
    width: "min(380px, 88cqw)",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    padding: 28,
    border: "1px solid #6d3a91",
    borderRadius: 12,
    background: "linear-gradient(160deg, #120720, #090311)",
    boxShadow: "0 20px 70px rgba(0,0,0,0.65)",
  },
  pauseTitle: {
    marginBottom: 10,
    color: "#e8b84d",
    textAlign: "center",
    letterSpacing: 2,
  },
  pauseAction: {
    padding: "12px 16px",
    border: "1px solid #5a347a",
    borderRadius: 7,
    background: "rgba(74, 30, 105, 0.35)",
    color: "#ead9f3",
    fontFamily: "Georgia, serif",
    fontSize: 15,
    cursor: "pointer",
  },
  pauseMenuAction: {
    marginTop: 8,
    color: "#dfc17d",
    borderColor: "var(--scene-panel-border, rgba(202,165,91,.62))",
  },
  tutorialOverlay: {
    position: "fixed",
    inset: 0,
    zIndex: 120,
    display: "grid",
    placeItems: "center",
    padding: 20,
    background: "radial-gradient(ellipse at center,rgba(7,24,27,.68),rgba(2,1,7,.88) 72%)",
    backdropFilter: "blur(6px)",
  },
  tutorialPanel: {
    width: "min(1000px, 90cqw)",
    minHeight: 480,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    padding: "52px clamp(32px,6cqw,90px)",
    borderTop: "1px solid rgba(203,157,74,.58)",
    borderBottom: "1px solid rgba(203,157,74,.38)",
    background: "radial-gradient(ellipse at center,rgba(8,20,23,.72),rgba(5,5,12,.22) 72%,transparent)",
    boxShadow: "0 -28px 55px -55px rgba(224,177,86,.7),0 28px 55px -55px rgba(224,177,86,.55)",
  },
  tutorialOrnament: { color: "#c89a4c", fontSize: 20, letterSpacing: 8, textShadow: "0 0 18px rgba(212,167,76,.5)" },
  tutorialProgress: {
    display: "flex",
    gap: 16,
    justifyContent: "center",
  },
  tutorialProgressMark: { color: "#4d5260", fontSize: 11, transition: "color .2s,text-shadow .2s" },
  tutorialProgressMarkActive: { color: "#73c8bd", textShadow: "0 0 12px rgba(102,216,201,.8)" },
  tutorialChapter: { color: "#82bdb5", fontFamily: "monospace", fontSize: 13, letterSpacing: 4 },
  tutorialTitle: { margin: "2px 0 4px", color: "#ebc773", fontFamily: "Georgia,serif", fontSize: "clamp(34px,3.2cqw,50px)", fontWeight: 400, textAlign: "center", letterSpacing: 2, textShadow: "0 3px 14px #000,0 0 24px rgba(220,170,73,.25)" },
  tutorialText: {
    maxWidth: 800,
    margin: "4px auto 12px",
    color: "#eadfcd",
    fontSize: "clamp(21px,1.7cqw,27px)",
    lineHeight: 1.7,
    textAlign: "center",
    textShadow: "0 2px 7px #000",
  },
  tutorialActions: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 34,
    width: "min(640px,100%)",
    marginTop: 12,
  },
  tutorialSkip: {
    padding: "14px 24px",
    border: 0,
    borderBottom: "1px solid rgba(132,125,118,.45)",
    background: "transparent",
    color: "#aaa097",
    fontFamily: "Georgia,serif",
    fontSize: 18,
    cursor: "pointer",
  },
  tutorialNext: { padding: "14px 24px", border: 0, borderBottom: "1px solid #b88a3c", background: "linear-gradient(90deg,transparent,rgba(123,78,18,.22),transparent)", color: "#e6c36e", fontFamily: "Georgia,serif", fontSize: 20, cursor: "pointer" },
  layout: {
    flex: 1,
    display: "flex",
    gap: 0,
    padding: "clamp(24px, 3.5cqh, 40px) clamp(28px, 3.4cqw, 64px)",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  leftCol: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    width: "clamp(260px, 17cqw, 306px)",
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
    gap: 10,
    width: "clamp(270px, 18cqw, 318px)",
    flexShrink: 0,
    zIndex: 10,
  },
};
