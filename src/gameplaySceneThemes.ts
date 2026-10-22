import type React from "react";

export type GameplaySceneId = "sunken-apothecary" | "furnace-hollow-saints" | "observatory-veil";

interface GameplaySceneTheme {
  video: string;
  poster: string;
  panelTop: string;
  panelBottom: string;
  panelBorder: string;
  panelBorderMuted: string;
  panelGlow: string;
  panelInset: string;
  surface: string;
  divider: string;
  coolAccent: string;
}

export const GAMEPLAY_SCENES: Record<GameplaySceneId, GameplaySceneTheme> = {
  "sunken-apothecary": {
    video: "/videos/sunken-apothecary.mp4?v=4",
    poster: "/images/cauldron_bg.jpg",
    panelTop: "rgba(4, 24, 30, 0.94)",
    panelBottom: "rgba(2, 9, 15, 0.97)",
    panelBorder: "rgba(51, 151, 168, 0.72)",
    panelBorderMuted: "rgba(36, 91, 105, 0.62)",
    panelGlow: "rgba(20, 139, 165, 0.25)",
    panelInset: "#58c4cf",
    surface: "rgba(3, 24, 31, 0.66)",
    divider: "#275e69",
    coolAccent: "#71d4dc",
  },
  "furnace-hollow-saints": {
    video: "/videos/furnace-hollow-saints.mp4",
    poster: "/images/cauldron_bg.jpg",
    panelTop: "rgba(34, 13, 7, 0.94)",
    panelBottom: "rgba(12, 5, 3, 0.97)",
    panelBorder: "rgba(155, 72, 38, 0.74)",
    panelBorderMuted: "rgba(91, 48, 32, 0.64)",
    panelGlow: "rgba(187, 61, 18, 0.24)",
    panelInset: "#d0713c",
    surface: "rgba(35, 13, 7, 0.66)",
    divider: "#6f3524",
    coolAccent: "#dc8a51",
  },
  "observatory-veil": {
    video: "/videos/observatory-beyond-the-veil.mp4",
    poster: "/images/cauldron_bg.jpg",
    panelTop: "rgba(15, 14, 34, 0.94)",
    panelBottom: "rgba(5, 5, 16, 0.97)",
    panelBorder: "rgba(79, 91, 171, 0.72)",
    panelBorderMuted: "rgba(49, 55, 101, 0.64)",
    panelGlow: "rgba(65, 76, 191, 0.24)",
    panelInset: "#8390df",
    surface: "rgba(11, 12, 35, 0.66)",
    divider: "#414b89",
    coolAccent: "#a3abf0",
  },
};

export const ACTIVE_GAMEPLAY_SCENE_ID: GameplaySceneId = "sunken-apothecary";

export function getGameplaySceneCssVariables(scene: GameplaySceneTheme): React.CSSProperties {
  return {
    "--scene-panel-top": scene.panelTop,
    "--scene-panel-bottom": scene.panelBottom,
    "--scene-panel-border": scene.panelBorder,
    "--scene-panel-border-muted": scene.panelBorderMuted,
    "--scene-panel-glow": scene.panelGlow,
    "--scene-panel-inset": scene.panelInset,
    "--scene-surface": scene.surface,
    "--scene-divider": scene.divider,
    "--scene-cool-accent": scene.coolAccent,
  } as React.CSSProperties;
}
