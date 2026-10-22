# HexBrewers Gameplay Audit and Improvement Plan

## Design target

HexBrewers is a renamed digital adaptation of *The Quacks of Quedlinburg*. The target for the base mode is mechanical compatibility with the original base-game rules for 2–4 players, while names, fiction, presentation, audio, and visual identity remain original to HexBrewers.

## Current verdict

The core loop is implemented and playable, but the game is **not yet rules-exact**.

What is already substantially correct:

- Nine-round structure.
- Official starting bag composition.
- Draw-and-place movement based on chip value.
- Explosion when the total white value exceeds seven.
- Flask restriction after an explosion.
- Rat-tail catch-up system.
- Bonus die for the furthest non-exploded player, including tied winners.
- Exploded players choose prestige or buying power while retaining ruby rewards.
- One or two purchases of different colors.
- Yellow and purple book unlock rounds.
- Extra white value-1 chip at the beginning of round six.
- End-game conversion of five coins or two rubies into one prestige.
- Most ingredient-book effects across sets 1–4.

## Confirmed rules differences

### Release-blocking correctness

1. **Resolved: starting ruby.** Every player now receives one ruby during setup.
2. **Resolved: three/four-player Shadowmoss.** The multiplayer black-chip rule now compares the player with the seated neighbors to their left and right.
3. **Mostly resolved: starting-player rotation.** The starting seat passes clockwise and shared-stock shopping follows that order. Ordered interactive end-of-round choices still need a final fidelity pass.
4. **Resolved: player-count-aware starting supply.** Starting orange and green chips are removed from shared supply and the blue value-1 supply count is corrected.
5. **Resolved: exact co-winners.** Players tied on both prestige and final-round pot position now share victory.
6. **Resolved: rules-faithful Omen deck.** All 24 original mechanics are implemented at their correct card positions under HexBrewers names, with localized direct-choice phases and finite shared-stock handling.

### Important fidelity differences

7. **Round-nine simultaneous brewing is not represented.** In a single-player digital game this may be intentionally abstracted, but it differs from the tabletop rule.
8. **Resolved: meaningful optional ingredient actions.** Players can decline movement, return, placement, spending, reward, trade, and upgrade actions wherever that decision can change their outcome.
9. **Resolved: trade and upgrade supply restoration.** Exchanged chips return to their matching finite pile and replacements cannot be taken from empty stock.
10. **Resolved: multiplayer seating.** Three- and four-player Shadowmoss compares the seated left and right neighbors.
11. **Resolved: multiplayer simulation coverage.** Deterministic nine-round simulations now cover 2–4 players and all four recipe sets.

## Rules-correction order

1. ~~Add the initial ruby and player-count-aware shared supply.~~
2. ~~Complete the remaining ordered end-of-round decisions using the implemented seating and rotating start player.~~ Wraithbloom finite-stock exchanges and Deathweave Set 2 rewards now consume shared stock and pause/resume in exact starting-seat order.
3. ~~Implement the official 3–4 player Shadowmoss neighbor comparison.~~
4. ~~Represent exact ties as joint winners.~~
5. ~~Complete all 24 mechanically faithful Omen cards while retaining HexBrewers names and fiction.~~ All 24 cards now have their base-game mechanical behavior; the remaining work is full localization/documentation synchronization and broader interaction-matrix testing.
6. ~~Audit every optional ingredient action and expose decisions where declining can matter.~~ Frostbile Set 1; Bloodthorn Sets 2 and 3; Plaguedust Sets 1 and 4; Deathweave Sets 2, 3, and 4; and Wraithbloom reward/trade/upgrade choices are now interactive. Automatic effects remain automatic only where declining cannot alter a meaningful outcome.
7. ~~Return discarded/traded chips to shared stock.~~ Wraithbloom trades and upgrades now validate finite reward stock, consume replacements, and return surrendered chips to their matching supply piles.
8. Add authoritative tests for every setup rule, evaluation phase, ingredient book, event card, and 2/3/4-player interaction. The full 2/3/4-player × four-recipe-set match matrix now runs with shared-state invariants; round advancement clears every transient decision queue; all 24 Omen positions and exact parameters are locked; passive Omen boundaries are covered. Ingredient coverage locks Bloodthorn Sets 1 and 4, Frostbile Sets 1–4, Plaguedust Sets 2–4, Deathweave last-two eligibility, and Wraithbloom Set 3 scoring plus Sets 1/2/4 choice thresholds. Cross-effect coverage verifies Frostbile protection across safe/burst draws, non-stacking pressure limits, exact market unlock rounds, unique round-six additions, complete starting-seat rotation, and idempotent final scoring. Remaining integration boundaries are still being expanded.
9. ~~Add full-match simulations for 3 and 4 players.~~ Seeded nine-round simulations now support 2–4 players, rotating shopping order, seated Shadowmoss neighbors, exact shared winners, dynamic per-player metrics, and all four recipe sets.

## AI improvement roadmap

The current AI is a competent one-step heuristic opponent, not an expert opponent.

1. ~~Add difficulty levels: Apprentice, Skilled, and Master.~~ Match setup now exposes all three localized difficulty policies and restart preserves the selection.
2. ~~Replace one-draw evaluation on Master with bounded expectimax or Monte Carlo rollouts over the known bag contents.~~ Master now uses a grouped, depth-three expectimax over the known bag with optimal stopping at each branch.
3. **Mostly complete:** Master evaluates several future draws, optimal explosion reward value, Frostbile-protected explosions, bonus-die position, and projected Deathweave/Wraithbloom/Shadowmoss end-of-round utility. A later refinement can add exact shared-stock contention to projected ingredient rewards.
4. **Partially complete:** AI now compares its score with the actual table leader rather than only the human. Ingredient-specific decisions still need deeper seated-neighbor utility.
5. ~~Add multi-round market planning using ingredient synergy, remaining rounds, shared stock, and denial value.~~ Master now values remaining-round longevity, active recipe synergies, low-stock urgency, opponent demand/denial, and seated Shadowmoss competition when comparing legal bundles.
6. ~~Improve blue, green, purple, ruby-spending, and flask decisions with full utility estimates.~~ Master compares flask/no-flask futures, evaluates Frostbile candidates (including keeping none) against the resulting bag and future draws, values Deathweave rewards by synergy/stock, ranks Wraithbloom choices by combined utility, and preserves final-round ruby conversion while spending earlier pairs deliberately.
7. ~~Give The Shade, The Wraith, and The Seer distinct strategic profiles without making lower difficulty intentionally irrational.~~ On Master, The Shade applies bold pressure and favors high-value chips, The Wraith builds ingredient engines, and The Seer protects position and values scarcity/denial. All retain shared legal resolution and adaptive comeback/lead behavior.
8. ~~Benchmark each difficulty against fixed baselines across thousands of seeded games.~~ `npm run test:ai-benchmark` now runs 3,600 deterministic matches across every difficulty × recipe-set × 2/3/4-player configuration against a fixed Skilled human baseline and saves an auditable JSON report.
9. ~~Track win rate, score distribution, explosions, purchases, bag quality, and comeback frequency by recipe set and player count.~~ The benchmark report includes win/tie participation, average human/AI score, explosions, purchases, draws, final bag quality, and comeback victories for all 36 configurations.

## Additional release needs

### Display-resolution and animated-board correction

1. ~~Use **1920×1080 as the default desktop resolution**, with a responsive browser canvas that occupies the complete available viewport.~~
2. ~~Make the 1280×720, 1600×900, 1920×1080, and 2560×1440 choices control the Electron content window and persist the user preference.~~
3. ~~Keep UI, Pixi coordinates, hit targets, and full-screen phase overlays responsive to the actual viewport without a clipped or letterboxed parent transform.~~
4. ~~Display the animated cauldron-room video proportionally with `cover`: never stretch or blur it, and use minimal edge cropping only when the viewport is not 16:9.~~
5. ~~Browser builds fill their complete viewport; fullscreen remains available for monitor-sized presentation.~~
6. ~~In the Electron build, apply the selected window/output resolution when the platform permits it.~~
7. ~~Automated viewport checks cover 16:9, taller, and wider windows, full-screen background coverage, accessible resolution switching, and complete nine-round progression.~~

- ~~Save and resume an active match.~~ Active matches now auto-save as versioned JSON after every store transition, validate and migrate on load, clear after game over, and expose a localized Continue Game action. Serialization has an exact round-trip regression test.
- ~~A compact and readable 3-opponent layout.~~ Multi-opponent games use reusable condensed status cards with responsive grid reflow on narrow screens; desktop and 700px viewport browser tests protect visibility and clipping.
- ~~Fast-forward the complete AI phase with one action.~~ One localized action now skips presentation delays for the current and every remaining opponent, then resets automatically before the next AI phase without changing any decisions or outcomes.
- ~~Detailed round-summary explanations for every reward and effect.~~ Round summaries now separate available scoring-space rewards from amounts actually awarded, explain stable/shattered/protected scoring, show exact ruby and doubled-Omen rewards, identify bonus-die qualification, and update immediately after the human's explosion choice in all three languages.
- ~~A formal rules reference inside the Grimoire that matches the implemented rules.~~ The searchable Rules tab now includes authoritative quick-reference values sourced from shared gameplay constants, complete phase/effect timing, multiplayer seating and shared-stock rules, and localized expandable sections in English, Russian, and Georgian.
- ~~Accessibility pass for keyboard flow, reduced motion, scalable text, and color-independent chip identification.~~ Interactive controls now have persistent high-contrast focus indicators; pause/tutorial dialogs contain keyboard focus; CSS and Pixi animations honor reduced motion; browser text scaling is preserved; and every ingredient uses a unique symbol, icon, localized name, and numeric value rather than color alone.
- ~~Regression tests for localization and every full nine-round configuration.~~ Deterministic simulations and real-browser smoke tests now cover all 12 recipe-set × 2/3/4-player nine-round combinations; localization tests require identical dictionary structure, non-empty leaves, full Omen/recipe/rules coverage, and meaningful Russian/Georgian translation of core UI namespaces.
- Future PvP architecture should preserve seating, simultaneous brewing, hidden bag state, deterministic server-owned randomness, and reconnect support.

## Grimoire correction pass

The Grimoire is not release-ready yet. Its Ashenveil names and lore stay unchanged, but all mechanical text must be generated from or checked against the same rules implemented by the game.

1. **Ingredients — complete:** all four recipe-book sets and their costs are documented in English, Russian, and Georgian. Each ingredient also shows its unlock round, live shared-stock remainder, and the active recipe set resolved for the current or most recent match.
2. **Omen cards — mechanics complete:** the obsolete eight-category summary has been replaced by all 24 individual cards in deck order. Titles and exact rule summaries use live two-digit effect IDs and are localized in English, Russian, and Georgian. A later editorial pass may add localized flavor prose and strategy notes without changing rules.
3. **Rules summary — complete:** corrected setup and round order, rotating starting seat, tied bonus-die resolution, explosion rewards, shared market stock, round-six bag addition, final-round conversions, shared victories, 2–4 player seating, and the digital single-player adaptation of round-nine simultaneous brewing in English, Russian, and Georgian.
4. **Localization coverage — complete:** automated tests now require every ingredient set, every live Omen ID, and every visible rules section to exist with non-empty text in all three languages.
5. Perform the final Grimoire wording pass only after its corresponding gameplay rule is implemented, so documentation never promises unfinished behavior.

## Release criterion

Do not label the base mode rules-faithful until every release-blocking difference above is resolved and the rules matrix passes for 2, 3, and 4 players across all four ingredient-book sets.
