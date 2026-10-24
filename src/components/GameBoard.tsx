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
import { DEFAULT_COVENANTS, prepareAICovenantForBrewing } from "../game/covenants";
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
import { drawToken } from "../game/bag";
import { soundManager } from "../SoundManager";
import { getTokenVisual } from "../pixi/tokenVisuals";
import type { TokenColor } from "../game/tokenTypes";
import { CORE_ECONOMY_ASSETS, CORE_INGREDIENT_ASSETS, CORE_OMEN_ASSETS } from "../assets/coreAssets";
import { COVENANT_ACTIVATION_ASSETS, MIREWROUGHT_ASSETS } from "../assets/mirewroughtAssets";
import type { RitualSession } from "../game/replayability";
import type { ChroniclePage } from "./ChronicleScreen";

// GameBoard rendering

interface GameBoardProps {
  onReturnToMenu: () => void;
  onRestart: () => void;
  onOpenChronicle: (page: ChroniclePage) => void;
  session: RitualSession;
}

interface IngredientReaction {
  id: number;
  color: TokenColor;
  name: string;
  detail: string;
  accent: string;
  symbol: string;
}

interface RewardFlight {
  id: number;
  image: string;
  label: string;
  accent: string;
  startX: number;
  startY: number;
  deltaX: number;
  deltaY: number;
  duration: number;
  reduced: boolean;
}

export function GameBoard({ onReturnToMenu, onRestart, onOpenChronicle, session }: GameBoardProps) {
  const gameplayScene = GAMEPLAY_SCENES[ACTIVE_GAMEPLAY_SCENE_ID];
  const t = useTranslation();
  const quality = useSettingsStore((state) => state.quality);
  const masterVolume = useSettingsStore((state) => state.masterVolume);
  const sfxVolume = useSettingsStore((state) => state.sfxVolume);
  const presentationSpeed = useSettingsStore((state) => state.presentationSpeed);
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
  const drawSpeedMultiplier = useRef(1);
  const handVideoRef = useRef<HTMLVideoElement>(null);
  const backgroundVideoRef = useRef<HTMLVideoElement>(null);
  const [drawAnimating, setDrawAnimating] = useState(false);
  const drawSettledAt = useRef(0);
  const [voidshardImpact, setVoidshardImpact] = useState<"safe" | "danger" | "critical" | "burst" | null>(null);
  const [ingredientReaction, setIngredientReaction] = useState<IngredientReaction | null>(null);
  const ingredientReactionTimer = useRef<number | null>(null);
  const [rewardFlights, setRewardFlights] = useState<RewardFlight[]>([]);
  const rewardFlightTimers = useRef<Set<number>>(new Set());
  const previousRewards = useRef({ prestige: human.score, rubies: human.rubies });
  const rewardSourceOverride = useRef<DOMRect | undefined>(undefined);
  const [roundOpening, setRoundOpening] = useState<number | null>(null);
  const announcedRound = useRef(0);
  const roundOpeningTimer = useRef<number | null>(null);
  const [brewingHandoff, setBrewingHandoff] = useState(false);
  const previousPhase = useRef(phase);
  const brewingHandoffTimer = useRef<number | null>(null);
  const [scoringPresentation, setScoringPresentation] = useState(false);
  const presentedSummaryRound = useRef(0);
  const [roundClosing, setRoundClosing] = useState(false);
  const [shatterAftermath, setShatterAftermath] = useState(false);
  const shatterAftermathTimer = useRef<number | null>(null);
  const [covenantInvocation, setCovenantInvocation] = useState<"bone" | "moon" | "blood" | null>(null);
  const covenantInvocationTimer = useRef<number | null>(null);
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

  const launchRewardFlight = useCallback((
    targetKind: "prestige" | "rubies" | "bag" | "pressure" | "vial" | "panel" | "crucible",
    image: string,
    label: string,
    accent: string,
    sourceRect?: DOMRect,
    targetPlayerId = human.id,
  ) => {
    const target = targetKind === "crucible"
      ? document.querySelector<HTMLElement>(".game-canvas")
      : targetKind === "panel"
        ? document.querySelector<HTMLElement>(`[data-player-id="${targetPlayerId}"]`)
        : document.querySelector<HTMLElement>(`[data-player-id="${targetPlayerId}"] [data-player-stat="${targetKind}"]`);
    if (!target) return;
    const targetRect = target.getBoundingClientRect();
    const canvasRect = document.querySelector<HTMLElement>(".game-canvas")?.getBoundingClientRect();
    const fallback = canvasRect ?? new DOMRect(window.innerWidth / 2, window.innerHeight / 2, 0, 0);
    const source = sourceRect ?? fallback;
    const startX = source.left + source.width / 2;
    const startY = source.top + source.height / 2;
    const endX = targetRect.left + targetRect.width / 2;
    const endY = targetRect.top + targetRect.height / 2;
    const reduced = prefersReducedMotion();
    const duration = reduced ? 260 : presentationSpeed === "fast" ? 470 : 760;
    const id = performance.now() + Math.random();

    setRewardFlights((current) => [...current, {
      id, image, label, accent, startX, startY,
      deltaX: endX - startX,
      deltaY: endY - startY,
      duration,
      reduced,
    }]);

    const timer = window.setTimeout(() => {
      setRewardFlights((current) => current.filter((flight) => flight.id !== id));
      rewardFlightTimers.current.delete(timer);
      if (!reduced && typeof target.animate === "function") {
        target.animate(
          [
            { filter: "brightness(1)", transform: "scale(1)" },
            { filter: `brightness(1.65) drop-shadow(0 0 9px ${accent})`, transform: "scale(1.08)" },
            { filter: "brightness(1)", transform: "scale(1)" },
          ],
          { duration: 360, easing: "ease-out" },
        );
      }
    }, duration + 40);
    rewardFlightTimers.current.add(timer);
  }, [human.id, presentationSpeed]);

  useEffect(() => () => {
    rewardFlightTimers.current.forEach((timer) => window.clearTimeout(timer));
    rewardFlightTimers.current.clear();
  }, []);

  useEffect(() => {
    if (phase !== "omen" || tutorialOpen || announcedRound.current === round) return;
    announcedRound.current = round;
    setRoundOpening(round);
  }, [phase, round, tutorialOpen]);

  useEffect(() => {
    if (roundOpening === null) return;
    if (roundOpeningTimer.current !== null) window.clearTimeout(roundOpeningTimer.current);
    const duration = prefersReducedMotion() ? 520 : presentationSpeed === "fast" ? 920 : 1650;
    roundOpeningTimer.current = window.setTimeout(() => {
      setRoundOpening(null);
      roundOpeningTimer.current = null;
    }, duration);
    return () => {
      if (roundOpeningTimer.current !== null) {
        window.clearTimeout(roundOpeningTimer.current);
        roundOpeningTimer.current = null;
      }
    };
  }, [presentationSpeed, roundOpening]);

  useEffect(() => {
    const priorPhase = previousPhase.current;
    previousPhase.current = phase;
    if (phase !== "brewing" || priorPhase === "brewing" || human.crucible.placements.length > 0) return;
    setBrewingHandoff(true);
    if (brewingHandoffTimer.current !== null) window.clearTimeout(brewingHandoffTimer.current);
    const duration = prefersReducedMotion() ? 420 : presentationSpeed === "fast" ? 650 : 1050;
    brewingHandoffTimer.current = window.setTimeout(() => {
      setBrewingHandoff(false);
      brewingHandoffTimer.current = null;
    }, duration);
  }, [human.crucible.placements.length, phase, presentationSpeed]);

  useEffect(() => () => {
    if (brewingHandoffTimer.current !== null) window.clearTimeout(brewingHandoffTimer.current);
  }, []);

  useEffect(() => {
    const summaryRound = store.state.roundSummary?.round;
    if (!summaryRound || presentedSummaryRound.current === summaryRound) return;
    presentedSummaryRound.current = summaryRound;
    setScoringPresentation(true);
  }, [store.state.roundSummary]);

  useEffect(() => {
    const previous = previousRewards.current;
    const prestigeGain = human.score - previous.prestige;
    const rubyGain = human.rubies - previous.rubies;
    previousRewards.current = { prestige: human.score, rubies: human.rubies };
    if (prestigeGain > 0) {
      launchRewardFlight("prestige", CORE_ECONOMY_ASSETS.scoreMarker, `+${prestigeGain}`, "#e7c46b", rewardSourceOverride.current);
    }
    if (rubyGain > 0) {
      launchRewardFlight("rubies", CORE_ECONOMY_ASSETS.ruby, `+${rubyGain}`, "#d16c72", rewardSourceOverride.current);
    }
    if (prestigeGain > 0 || rubyGain > 0) rewardSourceOverride.current = undefined;
  }, [human.rubies, human.score, launchRewardFlight]);

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

  useEffect(() => () => {
    if (ingredientReactionTimer.current !== null) window.clearTimeout(ingredientReactionTimer.current);
  }, []);

  const ingredientName = useCallback((color: TokenColor): string => ({
    white: t.grimoire.voidshard,
    orange: t.grimoire.brimstone,
    green: t.grimoire.deathweave,
    purple: t.grimoire.wraithbloom,
    blue: t.grimoire.frostbile,
    red: t.grimoire.bloodthorn,
    yellow: t.grimoire.plaguedust,
    black: t.grimoire.shadowmoss,
    echo: t.grimoire.echoReed,
  })[color], [t]);

  const showIngredientReaction = useCallback((color: TokenColor, detail: string) => {
    const visual = getTokenVisual(color);
    if (ingredientReactionTimer.current !== null) window.clearTimeout(ingredientReactionTimer.current);
    setIngredientReaction({
      id: performance.now(),
      color,
      name: ingredientName(color),
      detail,
      accent: `#${visual.glow.toString(16).padStart(6, "0")}`,
      symbol: visual.symbol,
    });
    ingredientReactionTimer.current = window.setTimeout(
      () => setIngredientReaction(null),
      presentationSpeed === "fast" ? 900 : 1450,
    );
  }, [ingredientName, presentationSpeed]);

  // Sync crucible visuals whenever human player state changes
  useEffect(() => {
    updateCrucible(human.crucible);
    updateBagCount(human.bag.tokens.length);
  }, [human.crucible, human.bag.tokens.length, updateCrucible, updateBagCount]);

  // Play explosion overlay when crucible shatters
  useEffect(() => {
    if (human.crucible.exploded) {
      playExplosion();
      setShatterAftermath(true);
      if (shatterAftermathTimer.current !== null) window.clearTimeout(shatterAftermathTimer.current);
      shatterAftermathTimer.current = window.setTimeout(() => {
        setShatterAftermath(false);
        shatterAftermathTimer.current = null;
      }, prefersReducedMotion() ? 520 : presentationSpeed === "fast" ? 1050 : 1750);
    }
  }, [human.crucible.exploded, playExplosion, presentationSpeed]);

  useEffect(() => () => {
    if (shatterAftermathTimer.current !== null) window.clearTimeout(shatterAftermathTimer.current);
  }, []);

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
    if (drawingToken.current) {
      drawSpeedMultiplier.current = 0.28;
      const activeHand = handVideoRef.current;
      if (activeHand && !activeHand.paused) activeHand.playbackRate = 3.25;
      return;
    }
    // React may need one paint to replace the final "Accelerate" frame with
    // "Draw Token" after the animation settles. Ignore a click caught in that
    // tiny stale-label window so one gesture can never consume two tokens.
    if (performance.now() - drawSettledAt.current < 220) return;
    drawingToken.current = true;
    drawSpeedMultiplier.current = presentationSpeed === "fast" ? 0.62 : 1;
    setDrawAnimating(true);
    try {
      // Select the result without publishing any game-state changes. The exact
      // token is committed only on the visual impact frame below.
      const prepared = drawToken(useGameStore.getState().state.players.find((player) => player.id === "human")!.bag);
      if (!prepared) return;
      soundManager.play("token_draw_anticipation");

      const handVideo = handVideoRef.current;
      let handFinished: Promise<void> | null = null;
      if (handVideo && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        handVideo.currentTime = 0;
        handFinished = new Promise((resolve) => {
          handVideo.addEventListener("ended", () => resolve(), { once: true });
        });
        try {
          handVideo.playbackRate = presentationSpeed === "fast" ? 2.15 : 1.65;
          void handVideo.play().catch(() => undefined);
        } catch {
          handFinished = null;
        }
      }
      let committed = false;
      const commitPreparedDraw = () => {
        if (committed) return;
        committed = true;
        const stateBeforeImpact = useGameStore.getState().state;
        const playerBeforeImpact = stateBeforeImpact.players.find((player) => player.id === "human")!;
        store.humanDraw(prepared.token.id);
        if (prepared.token.color === "white") {
          const pressure = human.crucible.whiteSum + prepared.token.value;
          const tier = pressure >= 8 ? "burst" : pressure >= 7 ? "critical" : pressure >= 5 ? "danger" : "safe";
          setVoidshardImpact(tier);
          launchRewardFlight("pressure", CORE_INGREDIENT_ASSETS.white, `+${prepared.token.value}`, tier === "safe" ? "#8ca6e8" : "#d7dfff");
          window.setTimeout(() => setVoidshardImpact(null), tier === "burst" ? 900 : tier === "critical" ? 720 : 560);
        } else {
          const stateAfterImpact = useGameStore.getState().state;
          const playerAfterImpact = stateAfterImpact.players.find((player) => player.id === "human")!;
          const movement = Math.max(0, playerAfterImpact.crucible.filledUpTo - playerBeforeImpact.crucible.filledUpTo);
          const movementBonus = Math.max(0, movement - prepared.token.value);
          const rubyGain = Math.max(0, playerAfterImpact.rubies - playerBeforeImpact.rubies);
          const requiresChoice = stateAfterImpact.phase !== "brewing" && stateAfterImpact.phase !== "end_of_round";
          const detail = requiresChoice
            ? t.game.decisionRequired
            : rubyGain > 0
              ? t.game.rubyGained.replace("{count}", String(rubyGain))
              : movementBonus > 0
                ? t.game.bonusMovement.replace("{count}", String(movementBonus))
                : t.game.advancesSpaces.replace("{count}", String(movement));
          showIngredientReaction(prepared.token.color, detail);
        }
      };
      await animateDraw(prepared.token, commitPreparedDraw, () => drawSpeedMultiplier.current);
      // Reduced motion commits synchronously in animateDraw; this is a safe
      // fallback if the canvas is still initializing.
      if (!committed) commitPreparedDraw();
      // Keep the input locked until the hand has visibly completed its release.
      // The timeout protects gameplay if a browser fails to dispatch `ended`.
      if (handFinished) {
        await Promise.race([
          handFinished,
          new Promise<void>((resolve) => window.setTimeout(resolve, 1400)),
        ]);
      }
    } finally {
      drawingToken.current = false;
      drawSettledAt.current = performance.now();
      setDrawAnimating(false);
    }
  }, [animateDraw, human.crucible.whiteSum, launchRewardFlight, presentationSpeed, showIngredientReaction, store, t]);

  const handleStop = useCallback(() => {
    if (drawingToken.current) return;
    store.humanStop();
  }, [store]);

  const handleOmenDismiss = useCallback(() => {
    store.dismissOmen();
  }, [store]);

  const handleOmenPropagate = useCallback((source: DOMRect) => {
    [human, ...aiPlayers].forEach((player, index) => {
      window.setTimeout(() => {
        launchRewardFlight("panel", CORE_OMEN_ASSETS.back, "OMEN", "#76d7c4", source, player.id);
      }, index * 85);
    });
  }, [aiPlayers, human, launchRewardFlight]);

  const handleUseCovenant = useCallback((kind: "bone" | "moon" | "blood", source: DOMRect) => {
    const before = useGameStore.getState().state.players.find((player) => player.id === human.id);
    rewardSourceOverride.current = source;
    store.humanUseCovenant(kind);
    const after = useGameStore.getState().state.players.find((player) => player.id === human.id);
    if (!before || !after) return;
    if (before.covenantSeals?.[kind] && !after.covenantSeals?.[kind]) {
      setCovenantInvocation(kind);
      if (covenantInvocationTimer.current !== null) window.clearTimeout(covenantInvocationTimer.current);
      const duration = prefersReducedMotion() ? 520 : presentationSpeed === "fast" ? 760 : 1250;
      covenantInvocationTimer.current = window.setTimeout(() => {
        setCovenantInvocation(null);
        covenantInvocationTimer.current = null;
      }, duration);
    }

    const image = COVENANT_ACTIVATION_ASSETS[kind];
    const accent = kind === "bone" ? "#d8d4bd" : kind === "moon" ? "#8fc8df" : "#c6534f";
    if (!before.flask && after.flask) {
      launchRewardFlight("vial", image, "RESTORED", accent, source);
      rewardSourceOverride.current = undefined;
    } else if (after.crucible.dropletPosition > before.crucible.dropletPosition) {
      launchRewardFlight("crucible", image, `+${after.crucible.dropletPosition - before.crucible.dropletPosition}`, accent, source);
      rewardSourceOverride.current = undefined;
    } else if (after.score === before.score && after.rubies === before.rubies) {
      launchRewardFlight("panel", image, (store.state.selectedCovenants ?? DEFAULT_COVENANTS)[kind].replace(/_/g, " ").toUpperCase(), accent, source);
      rewardSourceOverride.current = undefined;
    }
  }, [human.id, launchRewardFlight, presentationSpeed, store]);

  useEffect(() => () => {
    if (covenantInvocationTimer.current !== null) window.clearTimeout(covenantInvocationTimer.current);
  }, []);

  const handleExplodedChoice = useCallback(
    (choice: "vp" | "coins") => {
      store.humanExplodedChoice(choice);
    },
    [store]
  );

  const handleBuyItem = useCallback(
    (itemId: string) => {
      const item = market.find((candidate) => candidate.id === itemId);
      const sourceRect = document.querySelector<HTMLElement>(`[data-market-item-id="${CSS.escape(itemId)}"]`)?.getBoundingClientRect();
      const previousBagCount = useGameStore.getState().state.players.find((player) => player.id === human.id)?.bag.tokens.length ?? human.bag.tokens.length;
      store.humanBuyItem(itemId);
      const nextBagCount = useGameStore.getState().state.players.find((player) => player.id === human.id)?.bag.tokens.length ?? previousBagCount;
      if (item && nextBagCount > previousBagCount) {
        const image = item.token.color === "echo"
          ? MIREWROUGHT_ASSETS.echoReed
          : CORE_INGREDIENT_ASSETS[item.token.color] ?? CORE_INGREDIENT_ASSETS.white;
        const visual = getTokenVisual(item.token.color);
        launchRewardFlight(
          "bag",
          image,
          item.token.color === "echo" ? "?" : String(item.token.value),
          `#${visual.glow.toString(16).padStart(6, "0")}`,
          sourceRect,
        );
      }
    },
    [human.bag.tokens.length, launchRewardFlight, market, store]
  );

  const handleEndMarket = useCallback(async () => {
    if (roundClosing) return;
    setRoundClosing(true);
    await new Promise<void>((resolve) => window.setTimeout(resolve, prefersReducedMotion() ? 360 : presentationSpeed === "fast" ? 620 : 1050));
    store.humanEndMarket();
    setRoundClosing(false);
  }, [presentationSpeed, roundClosing, store]);

  const handleRubyDone = useCallback(async () => {
    if (roundClosing) return;
    setRoundClosing(true);
    await new Promise<void>((resolve) => window.setTimeout(resolve, prefersReducedMotion() ? 360 : presentationSpeed === "fast" ? 620 : 1050));
    store.humanDoneRubySpend();
    setRoundClosing(false);
  }, [presentationSpeed, roundClosing, store]);

  const handleRestart = useCallback(() => {
    if (!window.confirm(t.pause.confirmRestart)) return;
    onRestart();
    setPaused(false);
  }, [onRestart, t.pause.confirmRestart]);

  const handleReturnToMenu = useCallback(() => {
    if (!window.confirm(t.pause.confirmMenu)) return;
    onReturnToMenu();
  }, [onReturnToMenu, t.pause.confirmMenu]);

  const matchProgress = totalRounds > 1 ? (round - 1) / (totalRounds - 1) : 0;
  const pressureRatio = Math.min(1, human.crucible.whiteSum / 7);
  const isFinalRound = round === totalRounds;
  const matchStage = isFinalRound ? "final" : matchProgress >= 0.7 ? "late" : matchProgress >= 0.35 ? "mid" : "early";
  const atmosphereOpacity = Math.min(0.62, 0.08 + matchProgress * 0.28 + pressureRatio * 0.24);

  return (
    <div
      className="game-viewport"
      data-gameplay-scene={ACTIVE_GAMEPLAY_SCENE_ID}
      data-match-stage={matchStage}
      data-pressure-tier={human.crucible.whiteSum >= 7 ? "critical" : human.crucible.whiteSum >= 5 ? "danger" : human.crucible.whiteSum >= 3 ? "rising" : "calm"}
      style={{
        ...styles.viewport,
        ...getGameplaySceneCssVariables(gameplayScene),
        "--match-progress": matchProgress,
        "--pressure-ratio": pressureRatio,
        "--atmosphere-opacity": atmosphereOpacity,
      } as React.CSSProperties}
    >
    <style>{`.round-opening{position:fixed;inset:0;z-index:130;display:grid;place-items:center;overflow:hidden;background:radial-gradient(circle at 50% 48%,rgba(7,35,39,.86),rgba(1,5,10,.97) 68%);animation:round-opening-veil var(--round-opening-duration) ease-in-out forwards}.round-opening::before,.round-opening::after{content:"";position:absolute;left:50%;width:min(760px,72vw);height:1px;background:linear-gradient(90deg,transparent,rgba(111,210,203,.78),#e0b85f,rgba(111,210,203,.78),transparent);transform:translateX(-50%) scaleX(0);animation:round-opening-line var(--round-opening-duration) ease-in-out forwards}.round-opening::before{top:calc(50% - 96px)}.round-opening::after{top:calc(50% + 102px)}.round-opening__copy{text-align:center;text-shadow:0 3px 18px #000}.round-opening__kicker{color:#79c9bd;font:600 12px/1.2 monospace;letter-spacing:.42em;text-transform:uppercase}.round-opening__number{margin:15px 0 11px;color:#efd07d;font:600 clamp(48px,7vw,92px)/1 Georgia,serif;letter-spacing:.08em;text-transform:uppercase}.round-opening__number.is-final{color:#f2c061;text-shadow:0 0 24px rgba(194,58,34,.42),0 3px 18px #000}.round-opening__omen{color:#c8c4bd;font:italic 18px/1.4 Georgia,serif;letter-spacing:.05em}@keyframes round-opening-veil{0%{opacity:0}14%,72%{opacity:1}100%{opacity:0}}@keyframes round-opening-line{0%,100%{opacity:0;transform:translateX(-50%) scaleX(0)}22%,70%{opacity:1;transform:translateX(-50%) scaleX(1)}}@media(prefers-reduced-motion:reduce){.round-opening{animation:round-opening-veil var(--round-opening-duration) linear forwards}.round-opening::before,.round-opening::after{animation:none;opacity:.65;transform:translateX(-50%) scaleX(1)}}`}</style>
    <style>{`.brewing-handoff{position:fixed;inset:0;z-index:80;display:grid;place-items:center;pointer-events:none;background:radial-gradient(circle at 50% 53%,rgba(13,62,67,.2),transparent 48%);animation:brewing-handoff var(--brewing-handoff-duration) ease-in-out forwards}.brewing-handoff__copy{min-width:min(620px,74vw);padding:20px 42px;text-align:center;background:linear-gradient(90deg,transparent,rgba(1,12,17,.88) 20%,rgba(1,12,17,.88) 80%,transparent);border-top:1px solid rgba(118,215,196,.55);border-bottom:1px solid rgba(232,198,117,.38);box-shadow:0 0 40px rgba(34,143,155,.15)}.brewing-handoff__title{color:#efd07d;font:600 clamp(28px,3.2vw,48px)/1.1 Georgia,serif;letter-spacing:.13em;text-shadow:0 2px 12px #000}.brewing-handoff__hint{margin-top:9px;color:#bfcac6;font:italic 15px/1.4 Georgia,serif;letter-spacing:.03em}@keyframes brewing-handoff{0%{opacity:0;transform:scale(.98)}18%,72%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(1.01)}}@media(prefers-reduced-motion:reduce){.brewing-handoff{animation:brewing-handoff var(--brewing-handoff-duration) linear forwards}}`}</style>
    <style>{`.scoring-presentation{position:fixed;inset:0;z-index:112;display:grid;place-items:center;padding:4vh 4vw;background:radial-gradient(circle at 50% 48%,rgba(3,28,34,.72),rgba(1,4,9,.94) 76%);backdrop-filter:blur(5px);animation:scoring-presentation-in .35s ease-out both}.round-closing{position:fixed;inset:0;z-index:135;display:grid;place-items:center;background:radial-gradient(circle at 50% 50%,rgba(4,31,35,.9),rgba(1,4,9,.98) 70%);animation:round-closing var(--round-closing-duration) ease-in-out forwards}.round-closing__copy{text-align:center}.round-closing__title{color:#efd07d;font:600 clamp(38px,5vw,70px)/1 Georgia,serif;letter-spacing:.16em;text-shadow:0 0 22px rgba(222,178,75,.26)}.round-closing__subtitle{margin-top:15px;color:#87c9c4;font:italic 17px/1.4 Georgia,serif;letter-spacing:.06em}@keyframes scoring-presentation-in{from{opacity:0}to{opacity:1}}@keyframes round-closing{0%{opacity:0}20%,72%{opacity:1}100%{opacity:0}}@media(prefers-reduced-motion:reduce){.scoring-presentation{animation:none}.round-closing{animation:round-closing var(--round-closing-duration) linear forwards}}`}</style>
    <style>{`.match-atmosphere{position:fixed;inset:0;z-index:0;pointer-events:none;opacity:var(--atmosphere-opacity);background:radial-gradient(circle at 50% 48%,transparent 28%,rgba(0,10,14,.2) 57%,rgba(0,2,7,.92) 100%),linear-gradient(180deg,rgba(12,66,72,.08),rgba(1,8,13,.28));transition:opacity .8s ease,background 1s ease}.match-atmosphere::after{content:"";position:absolute;inset:-12%;background:repeating-radial-gradient(ellipse at 50% 50%,transparent 0 34px,rgba(92,201,207,.025) 36px,transparent 39px);opacity:calc(.15 + var(--pressure-ratio));mix-blend-mode:screen;animation:atmosphere-breathe 5.5s ease-in-out infinite}.game-viewport[data-match-stage="late"] .match-atmosphere{background:radial-gradient(circle at 50% 48%,transparent 24%,rgba(8,24,27,.28) 55%,rgba(0,2,7,.96) 100%),linear-gradient(180deg,rgba(61,43,21,.11),rgba(2,9,14,.34))}.game-viewport[data-match-stage="final"] .match-atmosphere{opacity:max(var(--atmosphere-opacity),.48);background:radial-gradient(circle at 50% 48%,rgba(129,80,19,.07),transparent 31%,rgba(43,20,12,.3) 58%,rgba(2,1,5,.97) 100%),linear-gradient(180deg,rgba(112,49,21,.12),rgba(7,4,11,.4));animation:final-atmosphere 3.8s ease-in-out infinite}.game-viewport[data-pressure-tier="danger"] .match-atmosphere::after,.game-viewport[data-pressure-tier="critical"] .match-atmosphere::after{background:repeating-radial-gradient(ellipse at 50% 50%,transparent 0 29px,rgba(155,181,255,.055) 32px,transparent 37px);animation-duration:2.6s}.game-viewport[data-pressure-tier="critical"] .game-header{box-shadow:0 8px 24px rgba(0,0,0,.5),0 2px 22px rgba(159,178,255,.22),inset 0 -1px rgba(225,231,255,.15)}.game-viewport[data-match-stage="late"] .player-panel{box-shadow:0 14px 38px rgba(0,0,0,.52),inset 0 1px rgba(220,180,255,.04)}.final-round-sigil{position:fixed;left:50%;top:52%;z-index:0;width:min(46vw,680px);aspect-ratio:1;transform:translate(-50%,-50%);border:1px solid rgba(218,166,70,.13);border-radius:50%;pointer-events:none;box-shadow:inset 0 0 90px rgba(168,56,26,.07),0 0 90px rgba(197,112,35,.05);animation:final-sigil 7s linear infinite}.final-round-sigil::before,.final-round-sigil::after{content:"✦";position:absolute;left:50%;color:rgba(231,181,79,.24);font-size:20px;text-shadow:0 0 16px rgba(220,96,36,.35)}.final-round-sigil::before{top:-11px}.final-round-sigil::after{bottom:-11px;transform:rotate(180deg)}.shatter-aftermath{position:fixed;inset:0;z-index:75;pointer-events:none;background:radial-gradient(circle at 50% 52%,rgba(238,244,255,.18),transparent 32%),radial-gradient(circle at 50% 52%,transparent 34%,rgba(6,7,19,.55) 75%);animation:shatter-aftermath var(--shatter-duration) ease-out forwards}.shatter-aftermath::before,.shatter-aftermath::after{content:"";position:absolute;left:50%;top:50%;width:min(86vw,1200px);height:2px;transform-origin:center;background:linear-gradient(90deg,transparent 5%,rgba(214,225,255,.7) 35%,rgba(255,255,255,.9) 50%,rgba(149,166,234,.48) 72%,transparent 96%);filter:drop-shadow(0 0 7px rgba(189,203,255,.55))}.shatter-aftermath::before{transform:translate(-50%,-50%) rotate(17deg)}.shatter-aftermath::after{transform:translate(-50%,-50%) rotate(-31deg)}@keyframes atmosphere-breathe{0%,100%{transform:scale(1);opacity:.35}50%{transform:scale(1.025);opacity:.75}}@keyframes final-atmosphere{0%,100%{filter:saturate(1)}50%{filter:saturate(1.22) brightness(1.05)}}@keyframes final-sigil{to{transform:translate(-50%,-50%) rotate(360deg)}}@keyframes shatter-aftermath{0%{opacity:0;filter:saturate(.15) brightness(1.7)}8%{opacity:1}34%{filter:saturate(.35) brightness(.82)}100%{opacity:0;filter:none}}@media(prefers-reduced-motion:reduce){.match-atmosphere::after,.game-viewport[data-match-stage="final"] .match-atmosphere,.final-round-sigil{animation:none}.shatter-aftermath{animation:shatter-aftermath var(--shatter-duration) linear forwards}}`}</style>
    <style>{`.covenant-invocation{--covenant-accent:#d8d4bd;position:fixed;inset:0;z-index:118;display:grid;place-items:center;pointer-events:none;overflow:hidden;animation:covenant-invocation-out 1.25s ease-in forwards}.covenant-invocation.is-moon{--covenant-accent:#8fc8df}.covenant-invocation.is-blood{--covenant-accent:#d85b56}.covenant-invocation__veil{position:absolute;inset:0;background:radial-gradient(circle at center,color-mix(in srgb,var(--covenant-accent) 13%,transparent),rgba(1,5,9,.74) 48%,rgba(0,2,5,.88));backdrop-filter:blur(2px);animation:covenant-veil-in .22s ease-out both}.covenant-invocation__art{position:absolute;width:min(540px,44vw);height:min(540px,66vh);object-fit:contain;mix-blend-mode:screen;filter:drop-shadow(0 0 30px color-mix(in srgb,var(--covenant-accent) 55%,transparent));animation:covenant-art-in .72s cubic-bezier(.18,.8,.2,1) both}.covenant-invocation__copy{position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;width:min(680px,72vw);margin-top:min(430px,49vh);padding:12px 28px 15px;text-align:center;background:linear-gradient(90deg,transparent,rgba(1,9,13,.9) 18%,rgba(1,9,13,.9) 82%,transparent);border-top:1px solid color-mix(in srgb,var(--covenant-accent) 58%,transparent);border-bottom:1px solid color-mix(in srgb,var(--covenant-accent) 35%,transparent);animation:covenant-copy-in .35s ease-out .18s both}.covenant-invocation__copy span{color:var(--covenant-accent);font:700 10px/1.2 monospace;letter-spacing:.28em;text-transform:uppercase}.covenant-invocation__copy strong{margin-top:5px;color:#f2eadb;font:600 clamp(23px,2.3vw,34px)/1.1 Georgia,serif;text-shadow:0 0 22px color-mix(in srgb,var(--covenant-accent) 45%,transparent)}.covenant-invocation__copy small{max-width:570px;margin-top:6px;color:#d2cbc0;font:500 14px/1.4 Georgia,serif}@keyframes covenant-veil-in{from{opacity:0}to{opacity:1}}@keyframes covenant-art-in{0%{opacity:0;transform:scale(.7) rotate(-4deg);filter:blur(7px)}38%{opacity:1}100%{opacity:.82;transform:scale(1);filter:blur(0) drop-shadow(0 0 30px color-mix(in srgb,var(--covenant-accent) 55%,transparent))}}@keyframes covenant-copy-in{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}@keyframes covenant-invocation-out{0%,70%{opacity:1}100%{opacity:0}}@media(prefers-reduced-motion:reduce){.covenant-invocation,.covenant-invocation__veil,.covenant-invocation__art,.covenant-invocation__copy{animation:none}.covenant-invocation__art{opacity:.75}.covenant-invocation{opacity:1}}`}</style>
    <style>{`.tutorial-nav{transition:color .18s,border-color .18s,text-shadow .18s,transform .18s}.tutorial-nav:hover,.tutorial-nav:focus-visible{color:#f4d88c!important;border-color:#d4a74c!important;text-shadow:0 0 14px rgba(224,175,79,.5);transform:translateY(-2px);outline:none}.reward-flight{position:fixed;z-index:160;display:flex;align-items:center;gap:5px;pointer-events:none;will-change:transform,opacity;filter:drop-shadow(0 0 9px var(--reward-accent));animation:reward-flight var(--reward-duration) cubic-bezier(.18,.78,.24,1) forwards}.reward-flight img{width:48px;height:48px;object-fit:contain}.reward-flight span{padding:3px 6px;color:#fff4d4;background:rgba(2,10,14,.78);border:1px solid var(--reward-accent);border-radius:10px;font:700 15px/1 Georgia,serif;text-shadow:0 1px 2px #000}.reward-flight.is-reduced{animation-name:reward-flight-reduced}.voidshard-impact{animation:voidshard-impact-jolt .42s ease-out}.voidshard-impact.is-danger{animation-duration:.52s}.voidshard-impact.is-critical,.voidshard-impact.is-burst{animation-name:voidshard-impact-critical;animation-duration:.66s}.voidshard-impact-flash{position:absolute;inset:0;z-index:2;pointer-events:none;background:radial-gradient(circle at 50% 52%,rgba(224,232,255,.2),rgba(103,111,177,.08) 28%,transparent 62%);mix-blend-mode:screen;animation:voidshard-impact-flash .56s ease-out forwards}.voidshard-impact-flash.is-danger{background:radial-gradient(circle at 50% 52%,rgba(239,244,255,.34),rgba(91,105,190,.14) 34%,transparent 68%)}.voidshard-impact-flash.is-critical,.voidshard-impact-flash.is-burst{background:radial-gradient(circle at 50% 52%,rgba(255,255,255,.48),rgba(120,132,224,.2) 38%,rgba(34,12,57,.12) 65%,transparent 78%);animation-duration:.74s}.ingredient-reaction{position:absolute;z-index:8;left:50%;bottom:14%;min-width:250px;max-width:min(440px,44vw);padding:10px 18px 11px;transform:translateX(-50%);text-align:center;pointer-events:none;color:#eee8dc;background:linear-gradient(90deg,transparent,rgba(3,12,17,.92) 16%,rgba(3,12,17,.92) 84%,transparent);border-top:1px solid color-mix(in srgb,var(--ingredient-accent) 66%,transparent);border-bottom:1px solid color-mix(in srgb,var(--ingredient-accent) 38%,transparent);box-shadow:0 0 28px color-mix(in srgb,var(--ingredient-accent) 18%,transparent);animation:ingredient-reaction-in .25s ease-out,ingredient-reaction-out .32s ease-in 1.08s forwards}.ingredient-reaction__eyebrow{font:600 10px/1.2 monospace;letter-spacing:.22em;color:var(--ingredient-accent);text-transform:uppercase}.ingredient-reaction__name{margin-top:4px;font:600 20px/1.15 Georgia,serif;color:#f4ead6;text-shadow:0 0 15px color-mix(in srgb,var(--ingredient-accent) 42%,transparent)}.ingredient-reaction__detail{margin-top:4px;font:500 13px/1.35 Georgia,serif;color:#cfc8bd}@keyframes reward-flight{0%{opacity:0;transform:translate(-50%,-50%) scale(.5) rotate(-8deg)}14%{opacity:1;transform:translate(-50%,-58%) scale(1.14) rotate(3deg)}78%{opacity:1}100%{opacity:0;transform:translate(calc(-50% + var(--reward-dx)),calc(-50% + var(--reward-dy))) scale(.68) rotate(8deg)}}@keyframes reward-flight-reduced{0%{opacity:0;transform:translate(calc(-50% + var(--reward-dx)),calc(-50% + var(--reward-dy))) scale(.88)}35%{opacity:1}100%{opacity:0;transform:translate(calc(-50% + var(--reward-dx)),calc(-50% + var(--reward-dy))) scale(1)}}@keyframes ingredient-reaction-in{from{opacity:0;transform:translate(-50%,8px) scale(.96)}to{opacity:1;transform:translate(-50%,0) scale(1)}}@keyframes ingredient-reaction-out{to{opacity:0;transform:translate(-50%,-5px) scale(.985)}}@keyframes voidshard-impact-jolt{0%,100%{transform:translate(0);filter:none}12%{transform:translate(-2px,1px);filter:saturate(.25) brightness(1.1)}28%{transform:translate(2px,-1px);filter:saturate(.55)}50%{transform:translate(-1px,0);filter:none}}@keyframes voidshard-impact-critical{0%,100%{transform:translate(0);filter:none}9%{transform:translate(-4px,2px);filter:saturate(.08) brightness(1.18) contrast(1.08)}22%{transform:translate(4px,-2px);filter:saturate(.32)}38%{transform:translate(-2px,1px);filter:saturate(.72)}62%{transform:translate(1px,0);filter:none}}@keyframes voidshard-impact-flash{0%{opacity:0}14%{opacity:1}100%{opacity:0}}@media(prefers-reduced-motion:reduce){.voidshard-impact{animation:none}.voidshard-impact-flash{animation:none;opacity:.12}.ingredient-reaction{animation:none}}`}</style>
    {roundOpening !== null && (
      <div
        className="round-opening"
        role="status"
        aria-live="polite"
        onAnimationEnd={(event) => {
          if (event.animationName === "round-opening-veil") setRoundOpening(null);
        }}
        style={{ "--round-opening-duration": `${prefersReducedMotion() ? 520 : presentationSpeed === "fast" ? 920 : 1650}ms`, pointerEvents: "none" } as React.CSSProperties}
      >
        <div className="round-opening__copy">
          <div className="round-opening__kicker">✦ {t.game.title.replace(/✦/g, "").trim()} ✦</div>
          <div className={`round-opening__number${roundOpening === totalRounds ? " is-final" : ""}`}>
            {roundOpening === totalRounds
              ? t.game.finalRound
              : t.game.roundOpening.replace("{round}", String(roundOpening))}
          </div>
          <div className="round-opening__omen">{t.game.omenAwaits}</div>
        </div>
      </div>
    )}
    {brewingHandoff && (
      <div
        className="brewing-handoff"
        role="status"
        aria-live="polite"
        style={{ "--brewing-handoff-duration": `${prefersReducedMotion() ? 420 : presentationSpeed === "fast" ? 650 : 1050}ms` } as React.CSSProperties}
      >
        <div className="brewing-handoff__copy">
          <div className="brewing-handoff__title">✦ {t.game.yourBrewBegins} ✦</div>
          <div className="brewing-handoff__hint">{t.game.brewDecision}</div>
        </div>
      </div>
    )}
    {scoringPresentation && store.state.roundSummary && (
      <div className="scoring-presentation" role="dialog" aria-modal="true" aria-label={t.roundSummary.title.replace("{round}", String(store.state.roundSummary.round))}>
        <RoundSummaryPanel
          summary={store.state.roundSummary}
          cinematic
          afflictions={Object.fromEntries(store.state.players.map((player) => [player.id, player.affliction]))}
          onContinue={() => setScoringPresentation(false)}
        />
      </div>
    )}
    {covenantInvocation && (
      <div className={`covenant-invocation is-${covenantInvocation}`} role="status" aria-live="polite">
        <div className="covenant-invocation__veil" />
        <img
          className="covenant-invocation__art"
          src={COVENANT_ACTIVATION_ASSETS[covenantInvocation]}
          alt=""
          aria-hidden="true"
        />
        <div className="covenant-invocation__copy">
          <span>{t.covenants.kindNames[covenantInvocation]}</span>
          <strong>{t.covenants.names[(store.state.selectedCovenants ?? DEFAULT_COVENANTS)[covenantInvocation]]}</strong>
          <small>{t.covenants.effects[(store.state.selectedCovenants ?? DEFAULT_COVENANTS)[covenantInvocation]]}</small>
        </div>
      </div>
    )}
    {roundClosing && (
      <div
        className="round-closing"
        role="status"
        aria-live="polite"
        style={{ "--round-closing-duration": `${prefersReducedMotion() ? 360 : presentationSpeed === "fast" ? 620 : 1050}ms` } as React.CSSProperties}
      >
        <div className="round-closing__copy">
          <div className="round-closing__title">✦ {t.roundSummary.sealed} ✦</div>
          <div className="round-closing__subtitle">{round < totalRounds ? t.roundSummary.nextRound : t.game.gameOver}</div>
        </div>
      </div>
    )}
    <video
      ref={backgroundVideoRef}
      className="game-background-video"
      style={{
        ...styles.backgroundVideo,
        filter: `brightness(${1 - matchProgress * 0.06}) saturate(${1 + matchProgress * 0.1 + pressureRatio * 0.08}) contrast(${1 + pressureRatio * 0.045})`,
      }}
      autoPlay={!prefersReducedMotion()}
      loop
      playsInline
      preload="auto"
      poster={gameplayScene.poster}
      aria-hidden="true"
    >
      <source src={gameplayScene.video} type="video/mp4" />
    </video>
    <div className="match-atmosphere" aria-hidden="true" />
    {isFinalRound && <div className="final-round-sigil" aria-hidden="true" />}
    {shatterAftermath && (
      <div
        className="shatter-aftermath"
        aria-hidden="true"
        style={{ "--shatter-duration": `${prefersReducedMotion() ? 520 : presentationSpeed === "fast" ? 1050 : 1750}ms` } as React.CSSProperties}
      />
    )}
    {voidshardImpact && <div className={`voidshard-impact-flash is-${voidshardImpact}`} aria-hidden="true" />}
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
        className={voidshardImpact ? `voidshard-impact is-${voidshardImpact}` : undefined}
        style={styles.gameContent}
        aria-hidden={modalOpen ? true : undefined}
      >
      {ingredientReaction && (
        <div
          key={ingredientReaction.id}
          className="ingredient-reaction"
          style={{ "--ingredient-accent": ingredientReaction.accent } as React.CSSProperties}
          role="status"
          aria-live="polite"
        >
          <div className="ingredient-reaction__eyebrow">{ingredientReaction.symbol} {t.game.ingredientReaction} {ingredientReaction.symbol}</div>
          <div className="ingredient-reaction__name">{ingredientReaction.name}</div>
          <div className="ingredient-reaction__detail">{ingredientReaction.detail}</div>
        </div>
      )}
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
              onUse={handleUseCovenant}
            />
          )}

          {phase === "brewing" && (
            <BrewingControls
              canDraw={canDraw && !drawAnimating}
              canUseFlask={canUseFlask && !drawAnimating}
              isDrawing={drawAnimating}
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
            <RoundSummaryPanel
              summary={store.state.roundSummary}
              afflictions={Object.fromEntries(store.state.players.map((player) => [player.id, player.affliction]))}
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
        onPropagate={handleOmenPropagate}
      />

      {phase === "market" && !scoringPresentation && (
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
          onReturnToMenu={onReturnToMenu}
          onOpenChronicle={onOpenChronicle}
          session={session}
          setup={store.state.setup}
          difficulty={store.state.aiDifficulty}
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
      {rewardFlights.map((flight) => (
        <div
          key={flight.id}
          className={`reward-flight${flight.reduced ? " is-reduced" : ""}`}
          aria-hidden="true"
          style={{
            left: flight.startX,
            top: flight.startY,
            "--reward-dx": `${flight.deltaX}px`,
            "--reward-dy": `${flight.deltaY}px`,
            "--reward-duration": `${flight.duration}ms`,
            "--reward-accent": flight.accent,
          } as React.CSSProperties}
        >
          <img src={flight.image} alt="" />
          <span>{flight.label}</span>
        </div>
      ))}
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
    maxHeight: "64cqh",
    objectFit: "contain",
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
