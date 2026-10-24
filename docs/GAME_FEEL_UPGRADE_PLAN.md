# Hexbrewers of Ashenveil — Game-Feel Upgrade Plan

## Objective

Preserve the clarity and strategic depth of the board-game foundation while making every action feel physical, reactive, and native to a dark-fantasy video game.

> Do not add complexity until the existing mechanics feel alive.

## Rules-fidelity boundary

The default game remains mechanically compatible with the established board-game foundation. Presentation may reveal, clarify, animate, and celebrate an outcome, but it must never change that outcome.

- Base-mode rules, bag contents, draw odds, pressure, shattering, scoring, market costs, rat-tail catch-up, and round count remain authoritative in the game-state layer.
- Random results are selected once by the rules layer. Animation reads the prepared result; it never rerolls, substitutes, or delays computation in a way that changes play.
- Fast presentation and reduced motion must resolve to exactly the same state as normal presentation.
- Mechanical state becomes visible at the established impact beat, keeping audiovisual cause and result synchronized without moving authority into the renderer.
- New ingredients, balance changes, permanent upgrades, or other outcome-changing systems belong in clearly labeled expansion or alternate modes and require dedicated balance simulation.
- The current sequential presentation of multiplayer brewing, including round nine, remains a known digital adaptation. True simultaneous multiplayer is a future networking feature, not a presentation-layer shortcut.
- Hexbrewers-specific Covenants, afflictions, and other expansion systems remain isolated from the faithful base rules so players can understand which ruleset they are entering.

This boundary is an implementation rule, not only a design preference: game logic determines **what happened**; presentation determines **how it feels**.

## Presentation language

Every meaningful action should use an appropriate combination of:

1. **Anticipation** — signal that something is about to happen.
2. **Motion** — show the action's source and destination.
3. **Impact** — confirm when the result becomes mechanically official.
4. **Reaction** — make the crucible, environment, and characters respond.
5. **Recovery** — let the scene settle before the next decision.

Use three intensity levels:

- **Minor:** hover, selection, ordinary token, small reward.
- **Major:** rare ingredient, Covenant, market purchase, scoring.
- **Critical:** Voidshard, shattering, Omen, affliction, victory.

This hierarchy prevents every event from becoming equally loud or exhausting.

---

## Phase 1 — Make token drawing satisfying

Token drawing is the most repeated action and therefore the highest-priority improvement.

### Draw sequence

1. Player presses **Draw Token**.
2. The button temporarily locks.
3. The brew bag tightens or shakes.
4. A short rising sound begins.
5. The selected token physically emerges.
6. It travels toward the crucible.
7. It lands on the correct spiral position.
8. The crucible reacts according to token type.
9. Values and pressure update on impact, not before.
10. Controls become available again.

Target duration: **0.8–1.3 seconds**.

### Ingredient reactions

- **Voidshard:** brief desaturation, glass-like ringing, pressure flash, pale crack or ripple. At dangerous pressure, sharpen the sound and add restrained UI instability.
- **Brimstone:** orange flare, outward embers, heated metallic impact.
- **Deathweave:** green threads across the surface, organic whisper or root-creak.
- **Wraithbloom:** violet spectral petals and a reversed chime.
- **Frostbile:** blue frost along the rim and a crystalline impact.
- **Bloodthorn:** dark-red pulse and a brief vein-like pattern.
- **Plaguedust:** sickly golden dust and granular hiss.
- **Shadowmoss:** temporary light suppression and spreading shadow.

### Presentation speed

- Clicking may accelerate an animation after it begins.
- Add **Normal/Fast** presentation speed.
- Critical draws retain a minimum dramatic duration.
- Reduced-motion mode replaces travel with restrained fades and pulses.

### Acceptance criteria

- State never visibly changes before impact.
- Rapid clicking cannot overlap draws.
- Ingredients are recognizable through shape, motion, sound, and color.
- The system remains readable without color alone.
- Reduced-motion behavior is complete.

---

## Phase 2 — Make the crucible part of gameplay

### Persistent pressure states

- **0–2:** calm liquid and stable light.
- **3–4:** subtle instability and pale ripples.
- **5–6:** stronger movement, cracks, whispers, apparatus flicker.
- **7:** critical rim light, unstable motion, and a low warning tone.
- **Shattering threshold:** violent collapse or implosion presentation.

### Spiral visualization

- Preview the next destination.
- Animate movement along the spiral.
- Leave a subtle trail behind placed tokens.
- Clearly distinguish the scoring space.
- Give ruby-bearing spaces restrained environmental glints.

### Shattering sequence

1. Controls lock.
2. Sound drops or compresses.
3. Cracks spread from the final Voidshard.
4. Liquid pulls inward.
5. Crucible bursts or collapses.
6. Player panel enters a shattered state.
7. Consequences appear after the visual event.
8. Opponents react.

Target duration: **2–3 seconds**, skippable after its first viewing.

---

## Phase 3 — Turn AI players into rivals

### Rival action presentation

- Focus the acting rival's panel.
- Animate or illuminate its portrait.
- Play a signature sound.
- State the chosen action plainly.
- Animate values from old state to new state.
- Let the central scene react when appropriate.
- Emphasize only one rival at a time.

### Rival identities

- **The Shade:** controlled timing, violet smoke, denial and pressure manipulation.
- **The Wraith:** pale-blue flicker, unpredictability, aggression.
- **The Seer:** eyes, mirrors, anticipatory prophecy motifs.
- **The Hollow:** drained sound and imagery, patient consumption.

### Contextual reactions

Use brief, infrequent reactions for dangerous Voidshards, contested purchases, shattering, large prestige gains, the final round, and narrow victory or defeat.

---

## Phase 4 — Give rounds a dramatic structure

### Round opening

1. Previous round clears.
2. Environment settles.
3. Round number appears in-world.
4. Omen is revealed.
5. Omen lore appears first.
6. Mechanical effect follows.
7. Scene reflects the Omen.
8. Starting player is identified.
9. Controls unlock.

### Match escalation

- **Rounds 1–2:** controlled mystery.
- **Rounds 3–4:** visible instability begins.
- **Rounds 5–6:** stronger supernatural presence.
- **Rounds 7–8:** severe deterioration.
- **Round 9:** unmistakable final-round state.

Drive liquid motion, reflections, lighting, cracks, apparatus, whispers, bells, and spectral manifestations from the current round.

### Round closing

1. Final action resolves.
2. Scene settles.
3. Rewards move toward their player panels.
4. Prestige, coins, and rubies count upward.
5. Round summary appears.
6. Unlocks and changes are highlighted.
7. Continue advances to the next round.

---

## Phase 5 — Make Omens supernatural events

### Reveal sequence

1. Lighting dims.
2. Card back enters the center.
3. Card turns or opens.
4. Artwork is revealed.
5. Horror lore appears.
6. Mechanical effect is presented separately.
7. Affected targets illuminate.
8. Omen moves to a persistent round slot.

### Persistent presence

- Keep a readable miniature card during the round.
- Expand mechanical text on hover or focus.
- Connect Omen-driven choices visually back to the card.
- Let the Omen subtly alter the environment.

Use consistent visual families for reward, pressure, ingredient, rivalry, and horror Omens.

---

## Phase 6 — Turn purchases and Covenants into rituals

### Black Market

1. Selected item rises or illuminates.
2. Cost leaves the player's resources.
3. Item crosses into the player's possession.
4. Bag reacts as the ingredient enters.
5. Shared stock visibly decreases.
6. Rivals react when strategically appropriate.

### Covenant families

- **Bone:** ivory seal, dry fracture, pale geometry.
- **Moon:** silver reflection, water distortion, lunar chime.
- **Blood:** filling red seal, heartbeat, crimson illumination.

After activation, visibly spend the seal, route its power to the result, and explain the effect in one concise sentence.

---

## Phase 7 — Make afflictions persistent and dangerous

### Binding

- Present the afflicted character prominently.
- Play a binding animation and signature sound.
- Attach a persistent symptom marker.
- Alter small environmental details.

### Gameplay reactions

When an affliction matters, pulse its icon, distort the portrait, play a short cue, show the relevant rule near the event, and animate remedy progress.

### Remedy completion

- Fill the retort or vessel.
- Reverse symptom effects.
- Clear the portrait.
- Present rewards.
- Seal, break, or burn the contract.

---

## Phase 8 — Add causal UI movement

Show resources traveling between causes and destinations:

- Ruby: spiral space → player panel.
- Ingredient: market → bag.
- Prestige: scoring area → prestige count.
- Pressure: Voidshard → pressure meter.
- Omen effect: card → affected players.
- Covenant power: seal → result.

Use floating numbers only when the source and destination would otherwise be unclear.

---

## Phase 9 — Improve audio architecture

Create separately controllable buses for:

- Music
- Ambience
- Gameplay SFX
- UI SFX
- Voice/narration

Eventually expose **Voice Volume** and **Ambience Volume** in Settings.

### Dynamic mixing

- Duck music beneath narration.
- Duck ambience during critical impacts.
- Increase tension with Voidshard pressure.
- Briefly suppress high frequencies during shattering.
- Crossfade gameplay-scene ambience.
- Preserve music position while navigating related screens.

Create recognizable signatures for drawing, placement, pressure, rewards, refills, Covenants, Omens, the market, shattering, the final round, victory, and defeat.

---

## Phase 10 — Add match-level environmental progression

Use current round, pressure, shattered players, active Omen, DLC systems, leader, and final-round state to drive:

- Lighting intensity
- Fog density
- Liquid agitation
- Apparatus activity
- Environmental damage
- Spectral manifestations
- Background audio layers
- HUD ornament deterioration

The randomized gameplay videos remain the foundation; real-time overlays make each scene respond to the match.

---

## Phase 11 — Improve victory and defeat

### Final round

- Announce round nine clearly.
- Change music and environmental behavior.
- Increase draw tension.
- Show projected standings without prematurely resolving uncertainty.

### Final scoring

1. Remove gameplay controls.
2. Resolve final tokens and resources.
3. Convert coins and rubies visibly.
4. Count scores upward in stages.
5. Show temporary lead changes.
6. Reveal the winner after a deliberate pause.

### Outcome presentation

- Give the winner unique scene treatment.
- Give rivals short performance-based epilogues.
- Highlight decisive moments: pressure survived, most valuable brew, Voidshards drawn, Covenants invoked, remedies completed, and closest rival.

---

## Phase 12 — Add long-term video-game identity

Begin only after moment-to-moment play feels strong.

Potential progression:

- Unlockable brewers
- Alternative crucibles
- New laboratories
- Additional narrated Omens
- Challenge modes
- Difficulty modifiers
- Lore archive
- Match history
- Cosmetic bags and card backs
- Achievement-driven visual changes
- Short campaign chapters

Prefer cosmetic, narrative, and strategic unlocks. Avoid permanent stat inflation unless the game intentionally becomes a roguelite.

---

## Implementation roadmap

### Milestone 1 — One exceptional Voidshard draw

Implement bag anticipation, emergence, travel, spiral movement, impact, pressure, crucible reaction, sound, input locking, fast mode, and reduced-motion support. Do not expand the system until this interaction establishes the quality bar.

**Local status:** complete. The draw is input-locked, may be accelerated, commits at impact, has a dedicated Voidshard response, and respects reduced motion.

### Milestone 2 — Complete ingredient language

Apply the presentation system to every ingredient and reward.

**Active scope:** give each colored ingredient a restrained, deterministic impact signature while preserving the Milestone 1 draw timing. Ingredient identity comes from motion and shape as well as color. The first audio pass uses restrained pitch and level variations of the shared placement sound through the existing SFX bus; dedicated recordings can replace these voices later without changing gameplay code.

**Local status:** complete. Colored impact silhouettes, per-color shared-SFX voices, and impact-time recipe responses report movement, bonus movement, immediate ruby gain, or a required decision. The response survives reduced-motion and canvas-initialization fallback paths. Ruby and prestige rewards travel into their matching counters, successful market purchases carry the acquired ingredient into the bag, Voidshards feed the pressure meter, Omen effects propagate to affected players, and Covenant energy travels from its seal to the state it changed. Destination counters acknowledge arrival, presentation speed is respected, and reduced motion replaces travel with a brief destination reveal.

**Next:** begin Milestone 3 with the round-opening sequence, then unify Omen reveal, human brewing, AI turns, scoring, summary, and the transition into the next round.

### Milestone 3 — One polished round

Upgrade the round opening, Omen reveal, player turn, AI turns, scoring, summary, and transition.

**Local status:** complete. Each new round receives a short localized chapter beat before the Omen reveal, with dedicated final-round treatment, fast-mode timing, reduced-motion behavior, and click shielding during the transition. The Omen hands off through a localized “your brew begins” beat rather than dropping abruptly into controls. AI turns preserve more of the gameplay scene, identify the active opponent with their portrait, spotlight the current ingredient and movement, count draws, retain detailed event history, and keep fast-forward available. Scoring now resolves through a cinematic, staggered multiplayer accounting before the market or reward decision becomes available; finishing the economy phase seals the round before handing control to the next opener or final outcome.

**Next:** Milestone 4 is complete locally. Continue with Milestone 5 after reviewing the escalation pass in live gameplay.

### Milestone 4 — Full-match escalation

Add round-driven scene evolution, critical pressure, shattering, and final-round treatment.

**Local status:** complete. The gameplay scene now escalates continuously with round progress and the human brewer's Voidshard pressure: later rounds tighten the grade and vignette, rising pressure accelerates a restrained spectral pulse, critical pressure energizes the header, and late-game panels settle more heavily into the scene. The final round receives a distinct amber ritual field and rotating sigil without replacing the selected environment. Shattering now leaves a timed full-screen desaturated fracture afterimage, with reduced-motion fallbacks and no additional media assets.

**Next:** Milestone 5 — give the DLC mechanics the same audiovisual clarity and consequence established by the core loop.

### Milestone 5 — DLC mechanics

Upgrade Covenants, afflictions, and distillation through the same audiovisual framework.

**Local status:** complete. Covenant use now expands from its HUD seal into a short, color-specific invocation with the selected pact's localized name and mechanical effect, while the existing Bone, Moon, and Blood sounds remain routed through the SFX bus. Distillation now resolves as a readable multiplayer sequence inside the scoring cinematic: each brewer's bound Affliction, animated eight-step retort gain, marker, and earned amount are shown before the ordinary reward accounting. Existing retort-fill, remedy-complete, and contract-binding audio remain state-change driven. Reduced-motion paths remove travel and fill animation without hiding results, and the compact persistent HUD remains available after the cinematic.

**Next:** Milestone 6 — broaden replayability through presentation-safe challenges, statistics, and mode framing without altering base-mode outcomes.

### Milestone 6 — Ending and progression

Build final scoring, outcome presentation, and persistent unlocks.

**Local status:** complete locally. Replayability now includes a configurable Standard Ritual, deterministic Daily Omen, three seeded Named Trials, and a shared Turning Trial that rotates by ISO week; every variant is built entirely from legal base-game setup combinations. The versioned Brewer's Chronicle records placement, score margin, challenge attempts and victories, Daily and weekly participation, prestige records, recent results, and both cadence streaks. Six persistent Honors unlock equippable Chronicle titles only; they grant no power, alter no ingredient, and do not affect multiplayer fairness. The old game-over modal has been replaced by a staged final reckoning that reveals standings, personal records, completed Trials, cadence participation, and newly unsealed Honors before offering replay, Chronicle, Trials, and hall routes.

---

## Technical architecture

Keep game rules independent from presentation timing.

### `PresentationQueue`

- Runs audiovisual events sequentially.
- Prevents animation overlap.
- Supports normal and fast playback.
- Allows critical sequences to enforce minimum durations.

### `GameEvent`

Typed events should include:

- Token drawn
- Token placed
- Pressure changed
- Resource gained
- Omen revealed
- Covenant activated
- Player shattered
- Round completed

### `SceneDirector`

- Controls environmental intensity.
- Applies scene-specific palettes.
- Responds to pressure, round, Omens, and match state.

### `AudioDirector`

- Owns buses, ducking, ambience, and music transitions.
- Prevents accidental restart of persistent music.

### `MotionPreferences`

- Normal
- Fast
- Reduced motion

The game state determines **what happened**. The presentation layer determines **how it is shown**.

---

## Definition of success

The upgrade succeeds when:

- An ordinary token remains satisfying after the fiftieth draw.
- A dangerous Voidshard creates immediate tension.
- AI actions are understandable without studying changing numbers.
- The environment visibly destabilizes across a match.
- Omens and Covenants feel like events rather than modal dialogs.
- Experienced players are never trapped by slow presentation.
- Presentation never changes mechanical outcomes.
- The game remains readable at a glance.
- A recorded gameplay clip looks active and dramatic to someone who does not know the rules.

## First production task

Build **Milestone 1: one polished Voidshard draw**. It establishes the interaction, animation, audio, state synchronization, accessibility, and performance patterns needed by every later phase.
