import React, { useState, useEffect } from "react";
import { MainMenu } from "./components/MainMenu";
import { useSoundManager, soundManager } from "./SoundManager";
import { GameBoard } from "./components/GameBoard";
import { Grimoire } from "./components/Grimoire";
import { SettingsScreen } from "./components/settings/SettingsScreen";
import type { RecipeMode } from "./game/recipeBooks";
import { useGameStore } from "./store/gameStore";

// Global dark fantasy styles injected once
const globalStyle = `
  * { box-sizing: border-box; margin: 0; padding: 0; }

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

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

type Screen = "menu" | "game" | "grimoire" | "settings";

export default function App() {
  const [screen, setScreen] = useState<Screen>("menu");
  const { ready } = useSoundManager(); // Initializes audio on first click

  // Ambient loop: play on menu/grimoire/settings, stop during gameplay
  // Only runs after audio system is ready (first user click)
  useEffect(() => {
    if (!ready) return;
    if (screen === "game") {
      soundManager.fadeOut("ambient_loop", 800);
    } else {
      soundManager.play("ambient_loop");
    }
  }, [screen, ready]);

  return (
    <>
      <style>{globalStyle}</style>

      {screen === "menu" && (
        <MainMenu
          onNewGame={(recipeMode?: RecipeMode) => {
            useGameStore.getState().initGame(recipeMode);
            setScreen("game");
          }}
          onGrimoire={() => setScreen("grimoire")}
          onSettings={() => setScreen("settings")}
        />
      )}

      {screen === "game" && (
        <GameBoard />
      )}

      {screen === "grimoire" && (
        <Grimoire onBack={() => setScreen("menu")} />
      )}

      {screen === "settings" && (
        <SettingsScreen onBack={() => setScreen("menu")} />
      )}
    </>
  );
}
