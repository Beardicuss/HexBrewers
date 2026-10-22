# Hexbrewers Performance Budgets

These budgets are release gates for the web and Windows builds. Run `npm run check:assets` whenever visual or audio assets are integrated.

## Runtime targets

| Area | Desktop target | Lower-power target |
| --- | ---: | ---: |
| Frame rate | 60 FPS | 30 FPS |
| Main-thread frame work | under 12 ms | under 25 ms |
| JavaScript heap during a match | under 100 MiB | under 75 MiB |
| Pixi render resolution | 1.0× | 0.5–0.75× |
| Menu atmosphere | 30 FPS | reduced/disabled |
| Layout shift | below 0.1 CLS | below 0.1 CLS |

Pixi rendering and particle emission must pause while the document is hidden or a full-screen setup, pause, settings, or tutorial layer is open.

## Download budgets

| Asset group | Budget |
| --- | ---: |
| Opening sequence | 30 MiB |
| Gameplay presentation video/poster | 5 MiB |
| Base Pixi textures | 4 MiB |
| Complete `public` directory | 96 MiB |
| Lazy-loaded menu room media | 16 MiB |
| Single image | 1.2 MiB |
| Single music track | 6 MiB |
| Single sound effect | 1 MiB |
| Single video | 12 MiB |
| Single intro cinematic | 24 MiB |

Music must use streamed media elements. Long tracks must not be decoded and retained as Web Audio buffers.

## Asset handoff contract

- Shipping raster art should normally be WebP. Keep PNG only when alpha quality or Pixi compatibility requires it.
- Use lowercase kebab-case names and place DLC content below its own DLC directory.
- Do not ship source/master duplicates beside converted runtime assets.
- Decorative DLC textures must load only when their gameplay module is active.
- Loading posters should remain below 850 KiB each; title logos below 150 KiB.
- Background video should be WebM and must include a static poster fallback.
- Intro cinematics may use the larger 24 MiB allowance only when encoded from the original master at VP9 CRF 16 or an equivalently verified perceptual-quality target. Do not upscale a previously compressed runtime file.
- Every new asset must have a code reference or be documented as intentionally reserved.

## Verification

Before release:

1. Run `npm run check:assets`.
2. Run `npm run typecheck` and `npm run test`.
3. Profile a cold launch and a live match with browser cache disabled.
4. Check high and low quality settings plus a hidden/restored window cycle.
