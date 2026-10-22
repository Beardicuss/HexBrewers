# DLC Asset Manifest

This is the production checklist. No reference-game artwork is licensed for use.

## Shared expansion UI

| ID | Deliverable | Target | Notes |
|---|---|---|---|
| `dlc_badge_mire` | Store/setup badge | 1024×1024 master PNG; 256×256 WebP | Transparent, readable at 32 px |
| `dlc_badge_veil` | Store/setup badge | 1024×1024 master PNG; 256×256 WebP | Visually distinct from Mire |
| `module_lock` | Locked module emblem | SVG | Code-native vector preferred |
| `module_check` | Enabled module emblem | SVG | Color + shape, not color alone |
| `expansion_panel` | Setup panel frame | 1600×900 master PNG/WebP | Nine-slice-safe corners |

## Mirewrought Pacts

| Quantity | Deliverable | Target |
|---:|---|---|
| 1 | DLC key art without text | 2560×1440 layered master + WebP |
| 1 | Fifth AI portrait, The Hollow | 1024×1024 JPG/WebP |
| 12 | Covenant portraits (4 Bone, 4 Moon, 4 Blood) | 768×1024 master each |
| 3 | Covenant Seal icons | SVG + 256×256 PNG |
| 3 | Spent-seal states | SVG or shader tint mask |
| 1 | Echo Reed ingredient icon | 1024×1024 transparent master + 256×256 PNG |
| 1 | Embercore-6 ingredient icon | 1024×1024 transparent master + 256×256 PNG |
| 1 | Overflow/Abyssal Runoff frame | 1200×360 transparent PNG/WebP |
| 2 | Recipe-set separators (5 and 6) | SVG |
| 6 | Covenant activation VFX sprites | 512×512 transparent sequence/atlas |
| 5 | Fifth-seat layout accent colors/patterns | SVG masks/tokens |
| 8–12 | New Omen illustrations if included | 1024×1400 master each |

Audio:

- Three seal activation stingers: Bone, Moon, Blood (1.0–1.8 s WAV masters).
- Echo Reed placement chime and value-resolve swell.
- Overflow tick loop plus final overflow impact.
- Fifth AI turn cue variant.

## Veilglass Afflictions

| Quantity | Deliverable | Target |
|---:|---|---|
| 1 | DLC key art without text | 2560×1440 layered master + WebP |
| 8 | Original Affliction Contract portraits | 1024×1024 master each |
| 8 | Affliction emblems | SVG + 256×256 PNG |
| 1 | Veil Retort track frame | 1600×420 transparent PNG/WebP |
| 1 | Distillate marker | 512×512 transparent PNG |
| 8 | Remedy Path frames/backgrounds | 768×1024 master each |
| 6 | Reward symbols | SVG: VP, catch-up, bag, shield, movement, transmute |
| 1 | Distillation phase banner | 1600×415 transparent PNG/WebP |
| 6–10 | New Omen illustrations | 1024×1400 master each |
| 2 | Echo Reed recipe emblems | SVG |
| 1 | Distillation vapor atlas | 2048×2048 sprite atlas or shader masks |

Audio:

- Retort fill loop with 6 intensity steps.
- Distillation resolve, reward unlock, contract selection, and final-round conversion cues.
- One subtle ambient laboratory layer; it must loop cleanly and respect ambient volume.

## Text and localization assets

Every content ID requires English, Russian, and Georgian entries for:

- Display name, one-line summary, full rules text, tooltip, accessibility label.
- Grimoire entry and setup/module description.
- AI action explanation and Round Summary text.
- Storefront description is separate from in-game strings.

Use layout stress strings during development. No text should be baked into art.

## Intake and naming

```text
art/source/dlc/<pack>/<category>/<stable_id>_master.ext
public/images/dlc/<pack>/<category>/<stable_id>.webp
public/images/dlc/<pack>/<category>/<stable_id>_thumb.webp
public/sounds/dlc/<pack>/<stable_id>.mp3
```

- Keep masters outside `public/`; ship optimized derivatives only.
- Record generator/model, prompt version, seed, edit history, and commercial-use status.
- Use premultiplied-alpha checks for Pixi sprites.
- Inspect at actual game size, not only full resolution.
- Budget: individual web images below 300 KB where practical; atlases below 2 MB; audio
  below 500 KB per short cue after compression.
