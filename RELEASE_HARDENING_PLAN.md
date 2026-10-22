# Hexbrewers Release Hardening Plan

## 1. Full-game QA pass

Test all player counts, recipe sets, both DLCs, combined DLC mode, saving/loading, pause/restart, and every supported resolution.

## 2. Loading architecture

Load DLC portraits, Omens, Remedy art, and effects only when their screen or phase needs them. This primarily reduces memory and network activity.

## 3. Long-session memory test

Play multiple matches without restarting, repeatedly open the Grimoire and settings, and verify that textures, videos, audio elements, and Pixi objects are released.

## 4. Windows build testing

Produce the packaged Electron build and test startup, fullscreen/windowed behavior, installation, save persistence, audio, and GPU compatibility.

## 5. Accessibility and input polish

Finish keyboard navigation, controller support, remappable controls, subtitles for narration, volume categories, and readable UI scaling.

## 6. Release presentation

Add credits, legal/licensing screens, version/build information, trailer subtitles, first-launch settings, and a graceful crash/error screen.

## 7. Final asset cleanup

The unused `distillation-vapor-atlas.webp` is currently redundant because the game uses the vapor video instead. Either implement the atlas as a low-quality fallback or remove it from the shipped build.
