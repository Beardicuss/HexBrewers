import React, { Suspense, lazy, useState, useEffect } from "react";
import { MainMenu } from "./components/MainMenu";
import { useSoundManager, soundManager } from "./SoundManager";
import { useGameStore } from "./store/gameStore";
import type { AIDifficulty } from "./game/aiStrategy";
import { hasSavedGame, loadSavedGame } from "./store/gameSave";
import type { GameSetup } from "./game/contentPacks";
import { createGameSetup } from "./game/contentPacks";
import { normalizeContentPacks, type ContentPackId } from "./game/contentPacks";
import { useSettingsStore } from "./store/settingsStore";
import type { MusicSoundId } from "./SoundManager";
import { IntroSequence } from "./components/IntroSequence";
import { LoadingScreen, preloadGamePresentation } from "./components/LoadingScreen";

const GameBoard = lazy(() => import("./components/GameBoard").then((module) => ({ default: module.GameBoard })));
const Grimoire = lazy(() => import("./components/Grimoire").then((module) => ({ default: module.Grimoire })));
const SettingsScreen = lazy(() => import("./components/settings/SettingsScreen").then((module) => ({ default: module.SettingsScreen })));
const DlcScreen = lazy(() => import("./components/DlcScreen").then((module) => ({ default: module.DlcScreen })));

// Global dark fantasy styles injected once
const globalStyle = `
  * { box-sizing: border-box; margin: 0; padding: 0; }

  html { font-size: 100%; -webkit-text-size-adjust: 100%; text-size-adjust: 100%; }

  body {
    background: #060210;
    color: #e8d5b5;
    font-family: serif;
    overflow-x: hidden;
  }

  ::-webkit-scrollbar {
    width: 6px;
  }
  ::-webkit-scrollbar-track {
    background: #0a0418;
  }
  ::-webkit-scrollbar-thumb {
    background: #3a1a5a;
    border-radius: 3px;
  }

  button:hover {
    filter: brightness(1.15);
  }

  :where(button, a, input, select, textarea, [tabindex]):focus-visible {
    outline: 3px solid #f2c75c !important;
    outline-offset: 3px !important;
    box-shadow: 0 0 0 2px #10051c, 0 0 18px rgba(242, 199, 92, 0.6) !important;
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      scroll-behavior: auto !important;
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }

    .game-background-video, .ingredient-hand-video { display: none !important; }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes covenantBurst {
    0% { opacity: 0; transform: scale(.72); }
    28% { opacity: 1; }
    100% { opacity: 0; transform: scale(1.18); }
  }

  @keyframes loadingSweep {
    from { transform: translateX(-130%); }
    to { transform: translateX(340%); }
  }

`;

type Screen = "intro" | "menu" | "loading" | "game" | "grimoire" | "dlcs" | "settings";

export default function App() {
  const [screen, setScreen] = useState<Screen>("intro");
  const [aiDifficulty, setAIDifficulty] = useState<AIDifficulty>("skilled");
  const [gameSetup, setGameSetup] = useState<GameSetup>(() => createGameSetup());
  const [canContinue, setCanContinue] = useState(() => hasSavedGame());
  const enabledPacks = useSettingsStore((state) => state.enabledPacks);
  const setEnabledPacks = useSettingsStore((state) => state.setEnabledPacks);
  const { ready } = useSoundManager(); // Initializes audio on first click
  const currentRound = useGameStore((store) => store.state.currentRound);

  const enterGame = async (setup: GameSetup, initialise: () => void) => {
    setScreen("loading");
    initialise();
    await Promise.all([preloadGamePresentation(setup), import("./components/GameBoard")]);
    setScreen("game");
  };

  useEffect(() => {
    if (!ready || screen === "intro" || screen === "loading") return;
    let track: MusicSoundId = "music_ashenveil";
    if (screen === "game") {
      if (currentRound >= 7) track = "music_ninth_bell";
      else if (gameSetup.modules.distillation && currentRound % 3 === 0) track = "music_veilglass";
      else if (gameSetup.modules.patrons && currentRound % 2 === 0) track = "music_mirewrought";
      else track = "music_crucible";
    }
    soundManager.switchMusic(track, 1800);
  }, [screen, ready, currentRound, gameSetup.modules.distillation, gameSetup.modules.patrons]);

  return (
    <>
      <style>{globalStyle}</style>

      {screen === "intro" && <IntroSequence onComplete={() => setScreen("menu")} />}
      {screen === "loading" && <LoadingScreen />}

      {screen === "menu" && (
        <MainMenu
          canContinue={canContinue}
          onContinue={() => {
            const saved = loadSavedGame();
            if (!saved) {
              setCanContinue(false);
              return;
            }
            setAIDifficulty(saved.aiDifficulty);
            setGameSetup(saved.setup);
            void enterGame(saved.setup, () => useGameStore.getState().restoreGame(saved));
          }}
          onNewGame={(setup: GameSetup, selectedDifficulty: AIDifficulty = "skilled") => {
            setAIDifficulty(selectedDifficulty);
            setGameSetup(setup);
            setCanContinue(true);
            void enterGame(setup, () => useGameStore.getState().initGameWithSetup(setup, selectedDifficulty));
          }}
          onGrimoire={() => setScreen("grimoire")}
          onDlcs={() => setScreen("dlcs")}
          onSettings={() => setScreen("settings")}
          enabledPacks={enabledPacks}
        />
      )}

      <Suspense fallback={<div style={{ minHeight: "100vh", background: "#060210" }} />}>
        {screen === "game" && (
          <GameBoard
            onReturnToMenu={() => {
              setCanContinue(hasSavedGame());
              setScreen("menu");
            }}
            onRestart={() => useGameStore.getState().initGameWithSetup(gameSetup, aiDifficulty)}
          />
        )}

        {screen === "grimoire" && (
          <Grimoire onBack={() => setScreen("menu")} enabledPacks={enabledPacks} />
        )}

        {screen === "settings" && (
          <SettingsScreen onBack={() => setScreen("menu")} />
        )}

        {screen === "dlcs" && (
          <DlcScreen
            enabledPacks={enabledPacks}
            onToggle={(id: Exclude<ContentPackId, "base">) => {
              setEnabledPacks(normalizeContentPacks(
                enabledPacks.includes(id)
                  ? enabledPacks.filter((pack) => pack !== id)
                  : [...enabledPacks, id],
              ));
            }}
            onBack={() => setScreen("menu")}
          />
        )}
      </Suspense>
    </>
  );
}
