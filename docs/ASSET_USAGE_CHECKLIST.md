# Hexbrewers asset usage checklist

Audit date: 2026-10-24

Scope: media used by the compiled game application, including lazy screens, localized
settings, disabled DLC content, and runtime-generated asset paths. The separate HTML
rulebook is not treated as the game bundle.

Method:

- Built the complete application and inspected its compiled media references.
- Cross-checked the source asset manifests and direct JSX/CSS paths.
- Expanded runtime-generated families (Veil Retort fills and menu icons).
- Checked the external original Softcurse ident used by development and deployment.

## Used by the game

- [x] `public/images/base/characters/` — 2 active rival portraits.
- [x] `public/images/base/omens/` — all 24 base Omen illustrations.
- [x] `public/images/black_market_bg.jpg` — Black Market background.
- [x] `public/images/cauldron_bg.jpg` — gameplay fallback poster.
- [x] `public/images/core/characters/` — all 9 player/rival/Grimoire portraits.
- [x] `public/images/core/economy/` — all 7 current bag/economy assets.
- [x] `public/images/core/ingredients/` — all 8 current base ingredient assets.
- [x] `public/images/core/omens/` — card back and blank front.
- [x] `public/images/core/rooms/` — all 5 menu-room posters.
- [x] `public/images/core/ui/dlc-reliquary/skull-toggle.png` — DLC seal control.
- [x] `public/images/core/ui/new-game-silhouettes/` — all 7 setup silhouettes.
- [x] `public/images/core/ui/settings-apparatus/` — all 3 settings illustrations.
- [x] `public/images/dlc/mirewrought-pacts/` — 34 active/conditionally active DLC assets, excluding the two obsolete portal overlays listed below.
- [x] `public/images/dlc/veilglass-afflictions/` — all 43 assets, including all 8 dynamically addressed Retort fill stages.
- [x] `public/images/flags/` — English, Georgian, and Russian flags.
- [x] `public/images/intro/ashenveil-poster.webp` — title poster.
- [x] `public/images/loading/` — all 7 loading illustrations.
- [x] `public/images/parchment_dark.jpg` — player-panel texture.
- [x] `public/images/title/title-en.webp` — active title logo.
- [x] `public/images/ui/menu/` — all 5 computed menu icons.
- [x] `public/images/ui/softcurse-mark.webp` — studio mark.
- [x] `public/videos/dlc/distillation-vapor.webm` — Veilglass Distillation effect.
- [x] `public/videos/hand-place-alpha.webm` — token placement hand.
- [x] `public/videos/intro/ashenveil-trailer-original.webm` — opening trailer.
- [x] `public/videos/menu/` — all 5 menu-room loops.
- [x] `public/videos/sunken-apothecary.mp4` — active gameplay environment.
- [x] `public/music/` — all 5 music tracks.
- [x] `public/sounds/` — all 14 base SFX and all 8 DLC SFX.
- [x] `public/audio/intro/` — narration and choir tail.
- [x] `D:/Dev/Assets/videos/Videos Intro/softcurse-systems.mp4` — original-quality Softcurse opening ident, explicitly served locally and uploaded during deployment.

Totals: 204 used files under `public/` (111.86 MiB), plus the 15.45 MiB external
Softcurse ident: 205 used media assets in all.

## Proven unused and archived

Stage 2 status: complete. All entries below were moved to
`D:/Dev/Assets/hexbrew/not used assets/public/` with their relative paths intact.

- [ ] `public/images/avatar_hexbrewer.jpg`
- [ ] `public/images/avatar_shade.jpg`
- [ ] `public/images/base/characters/the-wraith-portrait-alt.webp`
- [ ] `public/images/bloodthorn.png`
- [ ] `public/images/brew_bag.png`
- [ ] `public/images/coin.png`
- [ ] `public/images/core/ui/dlc-reliquary/mirewrought-portal.png`
- [ ] `public/images/core/ui/dlc-reliquary/veilglass-portal.png`
- [ ] `public/images/deathweave.png`
- [ ] `public/images/empty.png`
- [ ] `public/images/flask_empty.png`
- [ ] `public/images/flask_full.png`
- [ ] `public/images/frostbile.png`
- [ ] `public/images/game_board_bg.jpg`
- [ ] `public/images/main_menu_bg.jpg`
- [ ] `public/images/omen_card_back.jpg`
- [ ] `public/images/omen_card_front_blank.jpg`
- [ ] `public/images/plaguedust.png`
- [ ] `public/images/rat_stone.png`
- [ ] `public/images/ruby.png`
- [ ] `public/images/score_marker.png`
- [ ] `public/images/settings_bg.jpg`
- [ ] `public/images/shadowmoss.png`
- [ ] `public/images/spider.png`
- [ ] `public/images/title/title-ka.webp`
- [ ] `public/images/title/title-ru.webp`
- [ ] `public/images/wraithbloom.png`
- [ ] `public/videos/cauldron-room-loop.webm`
- [ ] `public/videos/intro/softcurse-ident.webm`

Totals: 29 unused files, 16.90 MiB. These are legacy duplicates, replaced artwork,
unused localized title variants, or superseded videos. They are archived rather than
destroyed during Stage 2.

## Cloudflare verification

- [x] Compared all 205 required assets with `releases/20261024-complete`.
- [x] Confirmed exact byte length, successful availability, and CORS for all 205 assets.
- [x] Removed the 29 archived unused keys from `releases/20261024-complete`.
- [x] Removed the same 29 obsolete keys from legacy media release `releases/b9d0faa`.
- [x] Confirmed all 58 deleted keys now return 404.
- [x] Re-ran the full required-asset audit: 205 checked, 0 failures.
- [x] Rebuilt the application after local archival: typecheck and production build pass.
