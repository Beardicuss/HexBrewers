# Stage 1 Release-Gate QA — 2026-10-27

## Verdict

**CODE AND ASSET GATES PASSED — ready for the final commit/deployment operation.** Recipe Set 1, nine-round browser certification, opening audio, all three loading stages, and the active release's R2 asset coverage were corrected and reverified. No Worker deployment or Git commit was performed during this audit.

## Loading-stage and R2 resolution — 2026-10-28

- Entry stage remains intentionally small: the Ashenveil portal and original Softcurse ident are prepared before entry.
- The fixed post-ident bell stage now preloads all menu/room media, all random loading posters, pre-game UI, and all 26 Chronicle illustrations used before gameplay.
- The New Game and Continue Game setup-aware stage preloads the active gameplay scene, tokens, bag/hand presentation, gameplay audio, all three Intention illustrations, and the Black Market loop. Expansion-specific manifests were also audited for future activation.
- Uploaded the 30 missing original files (26 Chronicle illustrations, 3 Intention illustrations, and 1 Black Market loop) without recompression to `hexbrewers-assets/releases/20261024-complete`.
- Production-origin manifest audit: **222/222 unique entry, opening, base-game, and expansion-aware asset URLs return successfully**. One transient request was retried three times and returned HTTP 200 each time.
- Loading-flow browser certification passed for both New Game and Continue Game.
- Updated measured asset budget: 239 files, 123.89 MiB total; complete opening stage 48.27/52 MiB.

## Phase 3 resolution

- **RG-01 resolved:** Set 1 Wraithbloom cost changed from 9 to 8. The unchanged build-viability benchmark now passes all 12 strategy profiles; Ruby Bloom reaches 90.9996% score retention and is viable.
- **RG-02 pending release operation:** the Black Market loop and three Intention images exist locally. The Intention images are now included in the mandatory gameplay preload manifest. No Cloudflare/R2 mutation was performed during this fix phase.
- **RG-03 resolved:** the redesigned Market selector was updated; cold-cache readiness waits were made explicit; all 12 base combinations (2/3/4 players × Sets 1–4) completed nine rounds. The remaining 23 browser checks pass, including all current Named Trial entry routes, localization, responsive screens, reduced motion, loading, persistence migration, and accessibility smoke coverage.
- **RG-04 resolved:** the opening video fade now clamps volume to the valid `[0, 1]` range. Browser runs completed without the prior `IndexSizeError`.
- Browser QA now mirrors the actual DLC-sealed public release instead of forcibly enabling unreleased activation controls.

## Verified passes

- TypeScript: `npm run typecheck`
- Asset budget/manifest check: `npm run check:assets`
  - 213 files, 121.01 MiB total
  - Opening sequence 19.82/30 MiB
  - Gameplay presentation 1.02/5 MiB
  - Base Pixi textures 1.38/4 MiB
  - Menu rooms 10.52/16 MiB
- Production build: `npm run build` (855 modules)
- Unit and deterministic rules suite: `npm test` — 14 files, 252 tests passed
- AI benchmark: `npm run test:ai-benchmark`
- Browser smoke/accessibility subset: 17 tests passed
  - Tutorial and pause keyboard operation
  - New/continue loading screens
  - Gameplay/video viewport fit
  - Narrow opponent cards
  - Grimoire and rules responsive behavior
  - Chronicle, Weekly Rituals, Honors, and existing Named Trial launch routes
  - Chronicle v2 migration
  - Reduced motion
  - Settings on short/narrow screens
  - Russian and Georgian UI fallback checks
- DLC library localization: EN/RU/KA passed
- Manual release-state check: DLC chronicles/details remain accessible while activation controls are sealed and disabled
- Existing R2 objects allow production-origin GET requests (`Access-Control-Allow-Origin: *`)
- `git diff --check`: no whitespace errors (line-ending warnings only)

## Original findings (resolved unless noted)

### RG-01 — Recipe Set 1 failed the three-strategy viability requirement — RESOLVED

The initial `npm run test:build-viability` run failed consistently before the Set 1 adjustment.

- Controlled Chain: viable
- Ember Resonance: viable
- Ruby Bloom: nonviable
  - Win rate: 33.33% (baseline 41.67%)
  - Average score: 18.65 (baseline 20.925)
  - Score retention: 89.13%
  - Score parity: 82.31%

This violates the Stage 1 requirement that every base recipe set support at least three viable strategies.

### RG-02 — Production gameplay preload fails — RESOLVED

The production build was served locally with its release R2 URLs. Starting a new game ends at:

> ASSET RITUAL INTERRUPTED — Unable to prepare 1 gameplay asset.

The current mandatory failure is:

- `videos/market/black-market-idle-loop.mp4`

It exists locally but is absent from the active R2 release and is included in `BASE_GAMEPLAY_ASSETS`.

Three additional current-game assets exist locally and are used by the Intentions screen, but are absent from R2 and are not included in the gameplay preload manifest:

- `images/core/ui/intentions/intention-court-the-omen.webp`
- `images/core/ui/intentions/intention-brew-for-glory.webp`
- `images/core/ui/intentions/intention-temper-the-crucible.webp`

They would fail later as broken/lazy-loaded imagery even if the mandatory preloader were allowed to continue.

### RG-03 — Nine-round browser certification was blocked by stale automation — RESOLVED

The initial all-player/all-recipe E2E matrix waited for the former Black Market button name `✦ Leave Market ✦`. The redesigned screen uses `LEAVE MARKET`, so those tests timed out in the market rather than completing the match. The selector and readiness handling are now corrected.

Affected coverage is the intended 2/3/4-player × Set 1–4 nine-round matrix. This is a test defect, not proof of a gameplay defect, but the release cannot be certified until the selector is updated and the full matrix passes.

The E2E suite also contained old DLC-activation expectations. They were replaced with tests asserting that DLC details open while activation remains disabled.

### RG-04 — Intro video volume could be set below zero — RESOLVED

Browser execution logged:

> IndexSizeError: Failed to set the 'volume' property on 'HTMLMediaElement': The volume provided (...) is outside the range [0, 1].

The intro fade calculation needs to clamp its lower bound as well as its upper bound. This can interrupt or destabilize the opening audio transition on some timing paths.

## Non-blocking release hygiene

Two future gameplay scene paths are referenced but have no local or R2 video:

- `videos/furnace-hollow-saints.mp4`
- `videos/observatory-beyond-the-veil.mp4`

Only Sunken Apothecary is active. These are not blockers for the current release, but inactive future scenes should not enter current preload/randomization paths until their videos exist.

## Release-phase requirements completed

1. Uploaded the market loop, three Intention images, and all Chronicle artwork without recompression.
2. Verified every asset in all three loading-stage manifests, including expansion-aware paths, from the production R2 origin.
3. Re-ran typecheck, production build, asset-budget validation, and the New/Continue loading-flow browser test.

