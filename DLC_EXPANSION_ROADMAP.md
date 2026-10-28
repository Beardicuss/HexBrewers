# Hexbrewers of Ashenveil — Expansion Roadmap

Status: implementation started locally; no expansion code has been deployed or published.

## Major DLC update plan

The public DLC release should feel like a substantial game update rather than two isolated
content switches. Package it in three layers while keeping the Standard Ritual mechanically
pure and ensuring that progression rewards remain cosmetic or narrative-only.

### Free update for every player

- **Chronicle 2.0:** detailed match history, ingredient statistics, rival records, shatter
  rate, recipe performance, and personal bests.
- **Twelve permanent Named Trials:** expand the initial three-Trial catalogue to twelve
  authored base-game challenges. Each Trial should have its own title, horror-lore premise,
  fixed or deterministic seed, recipe configuration, brewer count, rival lineup and AI
  difficulty, plus a distinctive objective or unusual legal starting condition. Named
  Trials remain separate from the Daily Omen and the rotating Weekly Ritual, preserve the
  authoritative base-game rules, record attempts and victories in the Chronicle, and award
  cosmetic titles or profile ornaments rather than mechanical advantages.
- **Weekly Rituals:** curated fixed seeds with cosmetic rewards.
- **Expanded AI personalities:** distinct risk tolerance, market priorities, tactical
  identities, and atmospheric reactions for every rival.
- **Match highlights:** preserve the decisive draws, shatters, purchases, cures, and
  Covenant invocations from each completed ritual.
- **Custom Ritual mode:** optional modifiers that do not alter the authoritative Standard
  Ritual rules.
- **Improved accessibility:** animation-speed presets, stronger contrast options, optional
  probability assistance, and faster rematches.
- **Additional gameplay environments:** randomized scenes with matching HUD palettes,
  music, and ambient-sound profiles.
- **Expanded brewer profile:** selectable portrait, titles, borders, and cosmetic unlocks.

### Mirewrought Pacts release features

- Covenant-focused challenge scenarios.
- Hollow story encounters.
- Covenant mastery records and themed achievements.
- Mire cosmetics, profile frames, and titles.
- Specialized Weekly Rituals using the fifth seat and recipe sets 5–6.

### Veilglass Afflictions release features

- An **Affliction Casebook** recording completed treatments.
- Remedy Path challenge scenarios.
- Distillation statistics and cure-history tracking.
- Veilglass-themed cosmetics and titles.
- Weekly Rituals built around unusual Affliction and Omen combinations.

### Ashenveil Cases — the flagship video-game feature

Build a dedicated single-player campaign that uses systems a physical board game cannot:

- Curated matches with unusual starting conditions.
- Short narrative introductions and conclusions.
- Named patients, investigations, and supernatural incidents.
- Branching choices that alter later scenarios.
- Boss-like rival configurations.
- Cosmetic and lore rewards without permanent gameplay advantages.

### Separate PvP update

PvP remains its own major release. Networking, matchmaking, reconnection, ranking, and
anti-cheat make it a substantially larger production and QA commitment than either DLC.
It should not delay the free update, Ashenveil Cases, or the two expansion launches.

## Implementation status — 2026-10-18

- [x] Content-pack IDs, dependencies, module flags, and base-safe defaults.
- [x] DLC-aware `GameSetup` persisted in save format v2.
- [x] Automatic migration of existing v1 saves to base-only setup.
- [x] Stable ordered rule-hook foundation.
- [x] Local expansion selector with EN/RU/KA text.
- [x] Covenants-gated fifth seat and fourth AI identity, The Hollow.
- [x] Unit, save round-trip, browser opt-in, five-seat smoke, and base-match regression tests.
- [x] First three playable Covenant powers, player controls, AI timing, and EN/RU/KA text.
- [x] Covenant setup selection and all twelve original Covenant powers with deterministic offers, localized UI, and AI timing.
- [x] Echo Reed and Embercore-6 ingredient vertical slice, AI valuation, saves, and EN/RU/KA text.
- [x] Abyssal Runoff placement, action suppression, scoring, saves, AI parity, and EN/RU/KA summary UI.
- [x] Distillation phase, eight original Affliction Contracts, deterministic three-contract setup offer, human/AI selection, persistent Retorts, AI resolution, and round-nine conversion.
- [x] Responsive Veil Retort tracks and persisted next-brew Remedy Path head-start rewards.
- [x] Distillation edge coverage for 2–5-seat neighbor wraparound, the exact 6/7/8 white-pressure boundary, and deferred Remedy save/resume round trips.
- [x] Live/simulator Distillation parity and an eight-Contract balance matrix across recipe sets 1–4 at two- and four-player tables (6,400 games). Contract average scores now span 30.90–32.20, with a deterministic maximum-spread gate of 2 points.
- [x] Combined-DLC interaction matrix across all eight Contracts, Mirewrought sets 5–6, Covenants, overflow, and two-/five-player tables (3,200 games). Contract means remain within 1.20 points; every table/set cell stays within 2.47, with deterministic three-point gates for Contract spread and set-to-set score difference.
- [x] Standalone/combined DLC AI matrix across Apprentice, Skilled, and Master (3,600 games). Apprentice remains approachable (80% human win participation), Skilled stays near even (+0.46 AI score margin), and Master remains intentionally severe (98% AI win participation); deterministic gates preserve ordering and keep Skilled within three points.
- [x] Pack-gated Grimoire rules for Covenants, Abyssal Runoff, Mire ingredients, Distillation, Afflictions, Remedy Paths, final-round conversion, and Echo Reed variants in EN/RU/KA, with localization completeness and browser visibility coverage.
- [x] Four original, pack-filtered Veilglass Omens with localized Grimoire entries and Distillation rule effects.
- [x] Selectable Retort Resonance and Deep Resonance Echo Reed recipes with deterministic draw values, save support, and AI valuation parity.
- [x] Mirewrought recipe sets 5–6 for every variable ingredient, expansion-gated random selection, AI valuation, EN/RU/KA Grimoire text, and direct rules tests.
- [x] DLC-aware deterministic balance simulator with five seats, Covenant timing, randomized starting shopper, and a reproducible 4,000-match Mirewrought benchmark report.
- [x] Isolated sets 5–6 across all 64 Bone × Moon × Blood Covenant combinations at two- and five-player tables (51,200 matched-seed games), with paired standard errors and 95% uncertainty ranges.
- [x] Tune sets 5–6 against a shared score target using per-effect telemetry for Bloodthorn, Frostbile, Plaguedust, Deathweave, and Wraithbloom. In the higher-confidence matrix, Set 5 leads by 0.44 points at two players and 0.35 at five players; the largest individual Covenant-combination gap is 2.78. Deterministic regression gates require an average gap of at most 1 and a maximum cell gap of at most 3.

## Product direction

Build two optional, combinable content packs. Keep the base game complete and preserve
all existing Hexbrewers terminology. The reference games inform mechanical parity only;
do not reuse their names, rules prose, character concepts, iconography, layouts, or art.

Working names:

1. **DLC I — Mirewrought Pacts**: fifth seat, one-use patrons, overflow scoring,
   wildcard ingredient, high-value orange ingredient, recipe sets 5–6.
2. **DLC II — Veilglass Afflictions**: patient-like contracts, a new distillation
   phase, progress rewards, additional Omens, and wildcard recipes.

The working names must receive a trademark/storefront review before announcement.

## Research baseline

- The first reference expansion supports five players and adds three categories of
  once-per-game powers, overflow boards, a variable-value ingredient, a value-6 orange
  ingredient, and additional ingredient books. See the
  [official Herb Witches rules](https://www.schmidtspiele.de/files/Produkte/4/49358%20-%20Die%20Quacksalber%20von%20Quedlinburg%20Die%20Kr%C3%A4uterhexen/49358_Kr%C3%A4uterhexen_DE.pdf)
  and [publisher instructions page](https://www.schmidtspiele.de/game-instructions.html).
- The second reference expansion adds a phase after brewing and before scoring. Progress
  is derived from distinct non-white colors, exactly seven white value, and neighboring
  explosions; selected cases then convert progress into immediate or next-round rewards.
  See the [official Alchemists rules](https://www.schmidtspiele.de/files/Retail/300dpi_JPG/88319_Alchemisten_GB_web.pdf).
- The publisher recommends learning the second module with the base game before combining
  both expansions. Hexbrewers should use the same onboarding principle.

## Foundation milestone — content packs before DLC

Implement this once so both DLCs remain modular.

### Data model

```ts
type ContentPackId = "base" | "covenants_of_the_mire" | "distillers_of_the_veil";

interface GameModules {
  enabledPacks: ContentPackId[];
  fifthSeat: boolean;
  patrons: boolean;
  overflow: boolean;
  distillation: boolean;
}

interface GameSetup {
  totalPlayers: 2 | 3 | 4 | 5;
  recipeMode: 1 | 2 | 3 | 4 | 5 | 6 | "random";
  modules: GameModules;
  seed: number;
}
```

- Store `GameSetup` in `GameState`; do not infer enabled rules from owned DLC.
- Ownership controls what may be selected. Saved matches explicitly preserve what was
  selected, allowing entitlement checks to be separated from deterministic rules.
- Increase the save format version and add a migration that maps current saves to a
  base-only `GameSetup`.
- Use stable IDs for every patron, contract, reward track, Omen, recipe, and asset.
- Replace phase-specific optional fields over time with a tagged `pendingDecision` union.
  This prevents the existing state from accumulating another dozen unrelated fields.
- Introduce rule hooks (`beforeBrew`, `afterBrew`, `beforeScoring`, `afterScoring`) so
  modules do not create circular conditionals throughout `gameStore.ts`.

### Content registry

Create registries that merge enabled packs:

- `contentPacks.ts`: pack metadata and dependencies.
- `recipeRegistry.ts`: recipe sets and costs.
- `omenRegistry.ts`: base and pack-filtered decks.
- `tokenRegistry.ts`: token visuals, value rules, market stock, and localization IDs.
- `moduleHooks.ts`: ordered phase/rule hooks.

All gameplay definitions remain plain TypeScript data; UI consumes the registry rather
than owning rules.

## DLC I — Mirewrought Pacts

### Original Hexbrewers vocabulary

| Mechanical role | Hexbrewers concept | Working asset prefix |
|---|---|---|
| Three once-per-game power categories | Mire Covenants: Bone, Moon, Blood | `covenant_` |
| Power token/currency | Covenant Seal | `seal_` |
| Variable-value ingredient | Echo Reed | `echo_reed_` |
| Overflow scoring extension | Abyssal Runoff | `runoff_` |
| Value-6 orange chip | Embercore 6 | `embercore_6` |
| Fifth opponent | The Hollow | `avatar_hollow` |

These are original working concepts, not translations of the reference expansion.

### Rules scope

1. Add a fifth player slot and a fourth AI identity.
2. At setup, select one Covenant from each of three categories. Every player receives
   one matching seal and may activate each selected Covenant once per match.
3. Add a bounded overflow track beyond the current crucible maximum. Overflow must still
   provide scoring/coins but must never index past the rendered base path.
4. Add Echo Reed, whose movement value is computed when drawn from explicit context.
   Store its printed value separately from its resolved movement value for replays/saves.
5. Add Embercore value 6, including stock, cost, drawing, rendering, scoring, AI valuation,
   Grimoire text, and localization.
6. Add recipe sets 5 and 6 for all supported colors. Random mode must include them only
   when this DLC is enabled.

### Engineering impact

- `src/game/recipeBooks.ts`: widen `RecipeSet`; move costs/effects into registries.
- `src/game/tokenTypes.ts`, `chipEffects.ts`, `crucible.ts`: variable resolved movement.
- `src/game/crucibleTypes.ts`: overflow result independent of path array length.
- `src/game/playerTypes.ts`: module state (`covenantSeals`, activations) under a DLC field.
- `src/game/aiStrategy.ts` and `aiProbability.ts`: value power timing and wildcard draws.
- `src/store/gameStoreHelpers.ts`: fifth player and stable AI profile.
- `src/store/gameStore.ts`: patron decisions through rule hooks, not inline branches.
- `src/components/MainMenu.tsx`: pack/module controls and five-player selection.
- `src/components/GameBoard.tsx`: five-player responsive layout and overflow presentation.
- Grimoire/i18n: new ingredient, recipe, patron, setup, and rule entries in EN/RU/KA.

### Acceptance tests

- 2–5 players × sets 1–6 × all three AI difficulties complete nine rounds.
- Every Covenant can be used exactly once and only in its legal timing window.
- Echo Reed resolves deterministically after save/load and in AI simulation.
- Overflow scoring agrees between displayed result, coins, VP, and AI valuation.
- Five-player UI passes 1366×768, 1920×1080, and narrow responsive checks.
- Base-only seeded simulations remain unchanged when the DLC is disabled.

## DLC II — Veilglass Afflictions

### Original Hexbrewers vocabulary

| Mechanical role | Hexbrewers concept | Working asset prefix |
|---|---|---|
| Patient/case | Affliction Contract | `affliction_` |
| Laboratory flask track | Veil Retort | `retort_` |
| Essence marker | Distillate Marker | `distillate_marker` |
| Essence/reward card | Remedy Path | `remedy_` |
| New phase | Distillation Phase | `distillation_` |

### Rules scope

1. At setup, deterministically reveal three Affliction Contracts. Each player chooses one;
   duplicate choices are allowed.
2. After all players stop brewing and before ordinary end-round scoring, run Distillation.
3. Default progress calculation mirrors the reference structure while using original UI:
   one step per distinct non-white ingredient color, +1 for exactly seven white value,
   and +1 per adjacent exploded rival (maximum one neighbor bonus in a two-player game).
4. Resolve the selected Remedy Path at the reached space: immediate VP/catch-up movement
   or a clearly marked effect carried into the next brewing phase.
5. In round nine, convert progress to final VP instead of granting ordinary track rewards.
6. Add a pack-filtered group of Omens and two Echo Reed recipe variants.

Before implementation, design eight original Affliction Contracts with reward curves that
are mechanically comparable but not one-to-one copies of the reference patients.

### Engineering impact

- Add `distillation` and `distillation_choice` phase nodes through the module hook system.
- Add `AfflictionDefinition`, `RemedyTrack`, `DistillationResult`, and per-player DLC state.
- Add adjacency helpers based on seating order; never assume player array index without
  handling wraparound and the two-player duplicate-neighbor rule.
- AI chooses contracts by expected value from recipe set, bag composition, and difficulty.
- UI needs a setup selection overlay, compact Retort track, result animation, tooltip, and
  Round Summary line items.
- Save data must preserve selected contract, reward state, marker result, and any deferred
  next-round power.

### Acceptance tests

- Exhaustive progress tests for 2–5 seats, neighbor wraparound, explosions, distinct colors,
  exactly-six/seven/eight white value, and round-nine conversion.
- Every original contract completes nine seeded rounds under all recipe packs.
- Deferred rewards survive save/load and expire at the correct boundary.
- Combined-DLC runs validate Covenant timing during Distillation and overflow interaction.
- Base-only and DLC-I-only behavior does not change when DLC II is disabled.

## Delivery sequence

1. **Expansion foundation** — registries, `GameSetup`, save vNext migration, module hooks,
   feature flags, setup UI shell, seeded regression baselines.
2. **DLC I vertical slice** — one Covenant per category, Echo Reed recipe, one overflow
   state, and five-player layout; test before authoring the full content set.
3. **DLC I content complete** — 12 Covenants, sets 5–6, localization, Grimoire, balance.
4. **DLC II vertical slice** — three prototype contracts and one reward-track family.
5. **DLC II content complete** — eight original contracts, extra Omens/recipes, combined mode.
6. **Commerce later** — storefront entitlement and restore-purchase flow only after the
   modules are stable. Never make core rules depend directly on a payment SDK.

## Release and balance gates

- Add Monte Carlo reports per pack combination, recipe set, player count, and difficulty.
- Record win rate, explosion rate, mean score, first-player advantage, Covenant use round,
  contract selection rate, and reward-space distribution.
- Target no AI seat advantage outside normal sampling error; flag any contract/power with
  selection or win contribution far above its peers.
- Run localization completeness and text-overflow tests for EN/RU/KA.
- Ship DLCs separately. Do not launch both at once: DLC I exercises the extensibility layer
  and provides evidence before the more invasive new phase arrives.

## Legal/art guardrails

- Mechanics may inspire the design, but all names, rules prose, card layouts, illustrations,
  icons, characters, ailments, flavor text, and visual presentation must be newly authored.
- Do not place reference rulebook images in `public/` or distribute them with builds.
- Every reference image folder must include source and license notes. Search images are
  inspiration-only unless a commercial license is documented.
- Run trademark and trade-dress review before storefront publication. This document is a
  production precaution, not legal advice.
