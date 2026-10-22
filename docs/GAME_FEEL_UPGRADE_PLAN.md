# Hexbrewers of Ashenveil — Game-Feel Upgrade Plan

## Objective

Preserve the clarity and strategic depth of the board-game foundation while making every action feel physical, reactive, and native to a dark-fantasy video game.

> Do not add complexity until the existing mechanics feel alive.

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

### Milestone 2 — Complete ingredient language

Apply the presentation system to every ingredient and reward.

### Milestone 3 — One polished round

Upgrade the round opening, Omen reveal, player turn, AI turns, scoring, summary, and transition.

### Milestone 4 — Full-match escalation

Add round-driven scene evolution, critical pressure, shattering, and final-round treatment.

### Milestone 5 — DLC mechanics

Upgrade Covenants, afflictions, and distillation through the same audiovisual framework.

### Milestone 6 — Ending and progression

Build final scoring, outcome presentation, and persistent unlocks.

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
