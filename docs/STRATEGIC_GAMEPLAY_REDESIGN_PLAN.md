# Strategic Gameplay Redesign Plan

## Status

**Priority:** Critical — this work takes precedence over further cosmetic expansion.

HexBrewers already has a strong atmosphere, a functional push-your-luck structure, and substantial content. Its present weakness is not a lack of rules. It is that the player cannot clearly see how their choices shape the match. Brewing often feels like repeatedly drawing until the Voidshard threshold becomes dangerous, then receiving an outcome whose causes are difficult to read.

This plan preserves the current base game while rebuilding the decision experience around it. It also defines a separate, more active digital ruleset that can use opportunities unavailable to a physical board game.

---

## 1. Design Objective

After every match, a player should be able to identify at least three decisions that materially affected the result:

- why they continued or stopped brewing;
- why they bought particular ingredients;
- how they built toward a strategy across several rounds;
- when they accepted danger for a specific reward;
- how they responded to an Omen, rival, or changing match state.

Randomness may determine what is drawn. Strategy must determine which risks are acceptable, how the bag is shaped, and how the player recovers or exploits the result.

### Core quality test

The game is not strategically clear enough if a reasonable player describes it as:

> “I press Draw until I am close to seven, stop, and then points happen.”

The redesign succeeds when the same player can instead say:

> “I stopped early to protect a ruby and reserve buying power, bought a safer control ingredient because my bag had too many dangerous draws, then used the Omen to attempt a high-value final pull.”

---

## 2. What Is Currently Missing

### 2.1 The draw decision lacks context

The player sees current pressure, but not the meaningful information surrounding the next choice:

- the dangerous tokens still remaining;
- the probability or qualitative likelihood of shattering;
- the possible reward range of another draw;
- exactly what is secured by stopping now;
- which ingredient effects could change the calculation.

The button therefore asks for a decision without presenting enough evidence to make it feel strategic.

### 2.2 Purchases lack visible causality

The market changes the bag, but the interface does not make the long-term consequences legible. A player may understand what an ingredient does in isolation without understanding:

- what role it plays in the current bag;
- which other ingredients it supports;
- whether it makes the bag safer, more volatile, faster, or more rewarding;
- how likely its effect is to matter in later rounds.

### 2.3 The game hides its build identities

There are ingredients, recipes, Covenants, Afflictions, Omens, and rival states, but they do not yet combine into clearly readable strategic identities. The player sees a collection of effects rather than a build taking shape.

### 2.4 Outcomes are explained after the fact, not decisions before the fact

The round summary reports results, but it does not reconstruct the decisive choices. This makes success feel fortunate and failure arbitrary even when the underlying rules were correct.

### 2.5 Digital interaction is underused

The current loop is faithful to a physical bag-building game. That is valuable, but a digital game can also offer controlled information, contextual previews, reactive opponents, authored challenges, and limited tactical interventions without turning the game into a different genre.

---

## 3. Two Clearly Separated Rituals

### Standard Ritual

The authoritative base rules remain mechanically unchanged.

This does **not** mean preserving the current experience in its present state. Standard Ritual receives the entire strategic-clarity redesign. It should become the polished, readable version of the existing game rather than a neglected “old mode.” Its rules remain faithful; its interface, explanations, previews, pacing, feedback, and presentation do not.

Standard Ritual receives:

- clearer information;
- consequence previews;
- bag and market analysis;
- better feedback;
- improved summaries;
- optional assistance settings.

It must remain suitable for players who want the original rules and for deterministic replays. Existing seeded outcomes must not change because of presentation improvements.

Standard Ritual earns its place by offering a purer form of strategy: the player controls bag construction, risk acceptance, resource use, and stopping decisions without direct manipulation of an individual random draw. If testing shows that this improved version still feels passive after the clarity work, it should become an optional **Classic Ritual** rather than remain the default experience.

### Ashenveil Ritual

Ashenveil Ritual is a separate, explicitly labelled digital ruleset. It introduces a small number of meaningful tactical decisions while preserving the central loop of bag building, pressure, stopping, shattering, scoring, and purchasing.

It must not silently replace Standard Ritual. Records, challenges, balance statistics, and saved games must identify which ruleset was used.

---

## 4. Phase 0 — Measure the Current Game

Before changing balance, instrument the existing experience.

Record locally for each match:

- bag composition at the beginning of each round;
- every draw and the state in which it was made;
- pressure and remaining danger before the draw;
- whether the player stopped or shattered;
- time spent on draw and market decisions;
- available purchases and selected purchases;
- ingredient activations and value generated;
- final score and decisive score sources;
- recipe, Omen, player count, rival identities, difficulty, and seed.

### Baseline metrics

- average stopping pressure;
- shatter rate by round and player skill;
- frequency of drawing while a shatter is possible;
- purchase diversity;
- ingredient and recipe win rates;
- unused currencies and powers;
- rate at which players repeat the same purchasing pattern;
- percentage of round outcomes dominated by luck versus accumulated bag decisions;
- abandonment and restart points.

Telemetry must contain gameplay events only and respect the project’s privacy model. No external analytics service is required for the first prototype.

---

## 5. Phase 1 — Make Standard Ritual Strategically Legible

This is the first implementation milestone. It improves decision quality without changing a single base rule.

### 5.1 The Brewer’s Ledger

Make the physical bag a clear interactive control. Selecting or clicking the bag opens the **Brewer’s Ledger**, a large readable inspection panel showing:

- total tokens remaining;
- tokens grouped by ingredient and value;
- remaining Voidshard values;
- known spent tokens;
- active synergies and relevant recipe effects.

It must not reveal hidden order. It only presents information the player could derive by manually counting.

The closed bag should communicate that it is interactive through restrained hover, focus, and controller-selection feedback. The panel must be available during brewing and market decisions, close without disrupting the round, and work with pointer, keyboard, and controller input.

The Ledger should distinguish:

- **Inside the bag:** tokens that may still be drawn this round;
- **Already drawn:** tokens currently placed in the crucible;
- **Spent or removed:** tokens temporarily outside the current draw pool;
- **Next-round total:** the projected bag after a proposed market purchase.

This is inspection, not cheating: token order remains secret, and no hidden future draw is exposed.

### 5.2 Risk at the moment of choice

Near the Draw button, present:

- current pressure;
- dangerous remaining draws;
- a qualitative risk state: **Safe**, **Unsettled**, **Grave**, or **Ruinous**;
- optional exact shatter probability in an assistance setting;
- the best and worst immediate movement outcomes still possible.

The default presentation should teach judgment rather than turn the game into a spreadsheet. Exact percentages remain available for accessibility and analytical play.

### 5.3 “Stop now” consequence preview

Before stopping, show the currently secured result:

- scoring space;
- Prestige;
- coins;
- ruby eligibility;
- special rewards;
- rewards that would be lost or altered by shattering.

When the player considers another draw, the interface should make the actual wager visible: what is safe now versus what another token could gain or endanger.

### 5.4 Market impact preview

Hovering, focusing, or selecting a market item should preview:

- resulting bag composition;
- change in dangerous-token ratio;
- expected role: control, economy, movement, ruby, combo, recovery, or volatility;
- currently owned ingredients that support it;
- important anti-synergies or timing limitations;
- effects relevant to the active recipe and Omen.

This must explain tradeoffs, not assign a universal “best choice.”

### 5.5 Contextual effect explanations

Ingredient text should answer both:

1. What does this effect do?
2. Why might it matter now?

Examples:

- “Two matching ingredients remain in your bag.”
- “This can secure the ruby space you currently occupy.”
- “Your nearest rival has stopped; extra movement can win the die.”
- “This purchase increases total bag size but does not reduce current Voidshard count.”

### 5.6 Decision-focused round summary

Replace purely numerical reporting with a concise causal account:

- the highest-risk draw;
- the ingredient that created the most value;
- whether stopping protected a reward;
- whether a previous purchase materially changed the round;
- what caused a shatter;
- one useful, factual observation for the next round.

The summary must never pretend there was a strategic cause when an outcome was simply unlucky.

### Phase 1 acceptance gate

In moderated testing, a new player must be able to explain:

- why another draw is dangerous;
- what they will receive by stopping;
- why their chosen purchase helps their bag;
- what caused the previous round’s result.

If they still describe the loop as “press until seven,” Phase 1 is not complete.

---

## 6. Phase 2 — Establish Real Build Identities

The goal is not to invent arbitrary classes. It is to make the strategic patterns already present in ingredients and recipes readable, distinct, and viable.

### Initial archetype vocabulary

- **Control:** manages danger, recovery, and reliable placement.
- **Ruby Engine:** converts positioning and recurring ruby access into long-term value.
- **Resonance:** builds around ingredient combinations and activation order.
- **Aggression:** accepts volatility for large movement or immediate scoring.
- **Adaptation:** responds to Omens, rival positions, and the current market.
- **Late Bloom:** sacrifices early strength for scaling in later rounds.

These are descriptive tags, not locked classes.

### Required work

- [x] Audit every base ingredient and recipe effect across recipe sets 1–4.
- [x] Assign primary and secondary strategic roles.
- [x] Identify effects with no meaningful choice or identity.
- [x] Document intended synergies and counterweights.
- [x] Add recipe-set summaries describing the strategic environment.
- [x] Add evolving build summaries to the Brewer’s Ledger and Chronicle.
- [x] Ensure at least three genuinely viable approaches exist in every supported base recipe set.

### Local implementation status

The Phase 2 foundation is complete locally. All twenty base recipe slots now carry explicit build identities, the current bag is evaluated from ingredients actually owned rather than from a chosen class, and Voidshards are excluded from defining the build. The Brewer’s Ledger presents the emerging primary and secondary strategy, strongest supporting ingredient families, and the active recipe environment. Completed matches preserve that build identity in the Chronicle while remaining compatible with older records.

Phase 2 validation is complete locally. `docs/BASE_RECIPE_BALANCE_AUDIT.md` records the twenty-effect audit, intended synergies, counterweights, and passive-effect watchlist. Twelve declared builds are exercised by a deterministic 2,880-match benchmark (strategy and seed-matched control runs). The first proposed Set 3 control plan failed and was replaced rather than excused; all final profiles now pass the published viability gate. No printed recipe value was changed without evidence.

### Balance rule

An ingredient must not be valuable only because its number is efficient. It should create or support a recognisable decision pattern.

---

## 7. Phase 3 — Ashenveil Ritual Vertical Slice

**Implementation status:** the separate Ashenveil ruleset, round-opening intention choice, deterministic rival choice, and the first functional promise/price rules are implemented locally. Human and AI Scry now share the same once-per-round ruby cost and two-candidate hidden-order rule. Nine authored optional round objectives are implemented with restrained tactical rewards and an in-brew reminder. Balance values remain provisional until simulation.

**Post-validation expansion:** retain three Intentions during vertical-slice testing so each role remains legible and measurable. After balance simulation and playtesting prove that all three create meaningful, comparably viable decisions, expand the Intention catalogue with additional authored vows. New vows must introduce a genuinely distinct strategic pattern, include an explicit price, remain available to AI, and must not replace or obsolete the original safety, Omen, and glory archetypes.

Prototype only three new systems. Do not expand the mode until this slice proves that the game becomes more thoughtful rather than merely busier.

### 7.1 Brewing Intention

At the beginning of each round, choose one temporary intention:

- **Temper the Crucible:** a safer route with reduced peak reward;
- **Court the Omen:** stronger Omen interaction with a defined obligation;
- **Brew for Glory:** greater reward potential with increased exposure.

Every intention must contain a benefit and a cost. None may be a disguised difficulty selector or an obvious best choice.

The exact effects require simulation and playtesting; these names describe roles, not final balance values.

### 7.2 One Scry decision per round

At a clearly defined trigger, the player may inspect two candidate tokens and choose one to resolve. The unchosen token returns to a rules-defined hidden location.

Constraints:

- usable at most once per round;
- gained through a fair shared rule or resource;
- fully supported by AI;
- deterministic under a saved seed;
- unable to remove danger permanently for free.

This creates agency over one crucial moment without turning every draw into manual deck selection.

### 7.3 A round objective with a tradeoff

Each round offers a small authored objective, such as:

- stop on a specified band of spaces;
- activate two different ingredient families;
- finish with an unused ruby;
- exceed a rival without crossing a danger condition.

Objectives should alter priorities, not merely reward normal play. The player may ignore them. Rewards should be tactical, cosmetic, or score-limited and must not create runaway permanent progression.

### Vertical-slice scope

- two brewers;
- one carefully selected recipe set;
- base-game content only;
- one rival difficulty;
- complete nine-round match;
- save/load and deterministic replay;
- keyboard, pointer, and reduced-motion support.

### Interaction budget

Ashenveil Ritual may add no more than two significant decisions during active brewing in a typical round. Extra agency must not destroy pace or tension.

---

## 8. Phase 4 — Make Stopping an Active Strategy

**Implementation status:** the first constrained Preparation prototype is implemented locally as **Bank the Ember**. An Ashenveil brewer who stops with no more than 3 pressure, no farther than scoring space 7, and at least two tokens still hidden prepares +1 movement for the first non-Voidshard ingredient drawn next round. The preparation cannot stack, expires when used, is unavailable in round nine, and follows the same rules for rivals.

Only begin this phase if the vertical slice validates the new ruleset.

Investigate a **Preparation** action for brewers who stop before reaching a defined pressure or track threshold. Possible actions include:

- mark one market ingredient for later consideration;
- gain limited information about the remaining bag;
- reinforce a spent defensive resource under a strict condition;
- prepare a small next-round positioning benefit.

The final system must satisfy all of the following:

- stopping early is useful sometimes, not always;
- the benefit cannot exceed the reward of a successful ambitious brew;
- it creates a forward-looking decision rather than passive compensation;
- opponents receive and use the same system;
- it cannot produce an infinite safety engine.

Do not implement several Preparation actions at once. Prototype the smallest version and measure whether stopping decisions become more varied.

---

## 9. Phase 5 — Twelve Named Trials as Strategic Teaching

The planned catalogue of twelve permanent Named Trials should demonstrate strategy, not merely increase AI difficulty.

### Trial structure

#### Initiation — 3 trials

Teach risk reading, stopping value, and basic market planning.

**Implemented locally (2026-10-26):** the first tier now contains `Read the Ashes`, `The Willing Stop`, and `Three Coins Ahead`. Each uses a versioned deterministic seed, an explicit lesson and objective, a separate mastery condition, base-game-only setup, and Chronicle attempt/seal/mastery tracking. Production-route and balance playtesting remain part of the Phase 5 completion gate.

#### Craft — 3 trials

Teach distinct ingredient synergies and recipe identities.

**Implemented locally (2026-10-26):** `The Gentle Chain` teaches Set 1 Frostbile–Plaguedust Control, `The Crimson Answer` teaches Set 3 Bloodthorn Resonance, and `Roots Beyond Nine` teaches a Set 4 Deathweave–Wraithbloom Late Bloom engine. Each has a versioned deterministic seed, a build-identity success gate, a stronger mastery condition, base-game-only configuration, Chronicle tracking, and a cosmetic tier honor. Production-route and balance playtesting remain part of the Phase 5 completion gate.

#### Peril — 3 trials

Teach recovery, volatile bags, rival pressure, and unusual Omens.

**Implemented locally (2026-10-26):** `The Vial Remembers` requires recovery after a real shatter and measured Cursed Vial use, `A Bag With Teeth` tests large-bag construction against final Voidshard density, and `Under Nine Eyes` demands an Adaptation build against three Master rivals under a fixed disruptive Omen sequence. Match records now retain shatter count, Vial uses, and final bag composition so these objectives are proven rather than inferred. Each trial has a versioned deterministic seed, a stronger mastery condition, Chronicle tracking, and a cosmetic tier honor. Production-route and balance playtesting remain part of the Phase 5 completion gate.

#### Mastery — 3 trials

Demand multi-round planning, adaptive purchases, and expert risk management.

**Implemented locally (2026-10-27):** `The Long Conjunction` proves sustained investment through purchases made across several different rounds, `The Changing Hand` uses a deterministic random recipe and contested four-player market to require purchases across several ingredient colors, and `At the Seventh Breath` records repeated safe finishes at six or more Voidshard pressure. Purchase count, distinct purchase rounds, distinct purchased colors, and safe high-pressure survivals are now retained as match evidence for both human and AI players. Each final trial uses a versioned deterministic seed, an explicit success gate, a stronger mastery condition, base-game-only configuration, Chronicle tracking, and the cosmetic `The Twelfth Seal` tier honor. Production-route and balance playtesting remain part of the Phase 5 completion gate.

Each trial requires:

- unique short horror lore;
- fixed or deliberately constrained seed behavior;
- defined recipe, player count, rivals, and difficulty;
- a strategic objective beyond simply winning;
- unusual but legal starting conditions where appropriate;
- clear success and optional mastery conditions;
- Chronicle records and cosmetic-only rewards;
- regression tests proving it reaches gameplay and can be completed.

Daily Omens and Weekly Rituals remain separate rotating systems.

---

## 10. Phase 6 — Rivals With Legible Strategy

**Implementation status:** the four rivals now have explicit, shared doctrines instead of scattered name checks. Shade pursues pressure and large movement, Wraith compounds ingredient-family synergies and favorable Omens, Seer protects stable rewards and contests scarce stock, and Hollow adapts while behind and values unusual ingredients. These doctrines affect legal risk tolerance, Master-market valuation, and Ashenveil Intention choice. Compact strategy labels and an atmospheric public tell expose their direction without revealing hidden token order. Match-state mode changes still let every rival abandon aggression to protect a commanding lead or accept greater risk when a late comeback is required.

AI personalities should differ through decisions, not hidden advantages.

Each rival needs:

- risk tolerance by match state;
- purchasing priorities and build preferences;
- response to Omens and round objectives;
- rules for abandoning a failing plan;
- use of the same Ashenveil tools available to the player;
- atmospheric reactions that communicate intent without exposing hidden information.

The player should learn that the Shade is pursuing a strategy, not merely watching numbers increase on another panel.

AI must never inspect hidden token order unless the same effect legally permits it for a human player.

---

## 11. Phase 7 — Advanced Tactical Systems

These systems represent the maximum useful depth for ordinary matches. They should be introduced individually, never as one large rules dump, and only after Ashenveil Ritual has passed its vertical-slice gate.

### 11.1 Controlled token manipulation

Create rare, costly ways to influence uncertainty without eliminating it:

- temporarily seal one known token outside the bag;
- return a drawn ingredient under a strict cost;
- place one revealed token into a delayed pool;
- exchange a weak ingredient for a volatile ingredient;
- cleanse or transform a token through a multi-round process.

No system should let a player permanently construct a perfectly safe bag. Every manipulation needs a resource, timing restriction, opportunity cost, or new risk.

### 11.2 Effect-order decisions

When multiple effects legally resolve together, selected recipes may allow the brewer to choose their order. The interface must preview the consequences of each valid order and prevent invalid combinations.

This should be reserved for meaningful combinations. Routine effects should continue resolving automatically.

### 11.3 Rival reactions

Introduce a small number of public reactions that respond to visible rival actions:

- answer an aggressive brew with a defensive commitment;
- contest a ruby or scoring threshold;
- react to a market reservation;
- spend a limited ward against a public hostile effect.

Reactions must use explicit windows, shared rules, and limited resources. They must not interrupt every token draw.

### 11.4 A contested market

Test deeper market interaction:

- limited shared stock;
- one temporary reservation per brewer;
- changing prices or availability based on public demand;
- rare ingredients revealed through round events;
- meaningful compensation when a reserved option is taken by an earlier seat.

The market should create planning and opponent awareness without becoming an auction game or punishing later seats unfairly.

### 11.5 Character disciplines

Player portraits may gain optional gameplay identities in Ashenveil Ritual and campaign modes:

- one carefully bounded active ability;
- one passive rule modifier with a corresponding drawback;
- a preferred strategic archetype;
- unique narrative presentation and reactions.

For Standard Ritual and competitive presets, characters remain cosmetic unless a symmetric character-enabled ruleset is selected. DLC characters must not be stronger than base characters.

### Phase 7 gate

An advanced system survives only if it creates a new decision, not merely another resource to remember. Any system that slows rounds without changing plans should be removed.

---

## 12. Phase 8 — Custom Ritual Laboratory

Build a controlled match creator after both official rulesets are stable.

Available options may include:

- Standard or Ashenveil foundation;
- player count and rival roster;
- recipe set or curated random recipe;
- Omen pool and frequency;
- starting-bag presets;
- pressure threshold variants;
- shared or abundant market stock;
- optional character disciplines;
- selected Covenants and Afflictions when owned;
- gameplay speed and presentation settings;
- fixed, entered, or generated seed.

### Rules integrity

- Official presets remain immutable and clearly labelled.
- Modified matches are marked **Custom Ritual** in saves and Chronicle records.
- Incompatible modifiers are blocked with an explanation.
- The setup screen summarizes all deviations before the match begins.
- Custom results never enter official leaderboards or competitive ratings.
- Players may copy and share a compact ritual code.

Curated presets should be offered so players can explore the system without constructing a ruleset from scratch.

---

## 13. Phase 9 — Ashenveil Cases Campaign

This is the strongest long-term single-player addition because it delivers something a physical adaptation cannot.

### Campaign structure

- named supernatural cases rather than a generic sequence of matches;
- illustrated introductions and conclusions;
- patients, witnesses, locations, and rival brewers;
- authored starting conditions and objectives;
- choices between cases and treatment approaches;
- consequences that alter later scenarios;
- optional investigations that reveal lore or tactical information;
- boss-like rival configurations and ritual finales;
- multiple endings based on decisions and performance.

### Case gameplay

A case may change the context of the standard systems without discarding them:

- cure a patient before a deadline;
- preserve a dangerous ingredient for analysis;
- brew under a recurring environmental curse;
- cooperate temporarily with a rival;
- choose between immediate public safety and long-term investigation;
- survive a deliberately damaged starting bag;
- manage consequences carried across a short chain of matches.

### Campaign progression

Progression unlocks:

- lore;
- portraits;
- titles and frames;
- cosmetic crucible treatments;
- additional cases and optional paths;
- new Custom Ritual presets.

It must not grant permanent statistical superiority in Standard Ritual, trials, or PvP.

### Narrative requirements

- Store case state separately from ordinary match state.
- Make choice consequences explicit enough to feel fair while preserving mystery.
- Support replaying completed cases without destroying the original record.
- Maintain a versioned canon reference for characters, locations, factions, and endings.
- Keep dialogue concise during active brewing and place longer lore between decisions.

---

## 14. Phase 10 — Living Challenge Cadence

Expand replayability only after the permanent twelve Named Trials are complete.

### Daily Omens

- one deterministic shared seed per day;
- use the universal UTC date boundary so every player receives the same rite simultaneously;
- short completion time;
- unchanged official rules;
- personal-best comparison and streaks;
- no exclusive power rewards.

### Weekly Rituals

- curated scenario rules and objectives;
- use the universal UTC ISO-week boundary and describe the guarantee precisely as a shared deterministic starting seed;
- a fixed rival configuration;
- Standard or Ashenveil designation;
- optional mastery condition;
- cosmetic or Chronicle reward;
- archived results after rotation.

### Seasonal casefiles

- small themed collections lasting several weeks;
- environmental presentation and lore fragments;
- community-wide statistics;
- no fear-of-missing-out gameplay power;
- eventual return or permanent archive access to narrative material.

Challenge definitions should be data-driven, versioned, validated before publication, and playable offline when already downloaded.

### Deterministic save continuity (future improvement)

Daily Omens, Weekly Rituals, and other seeded modes should eventually serialize the gameplay random generator's algorithm version and current state/cursor in every save. Continuing a saved rite must restore that state before the next gameplay-random operation, producing the same future outcomes as an uninterrupted session. Migration must retain a safe fallback for older saves that contain only the starting seed, and automated tests must compare uninterrupted and save/resume action logs. This belongs to Stage 2 because current saves remain playable, but it is required before seeded challenges can promise exact sequence continuity across save and continue.

---

## 15. Phase 11 — Expansion Integration

Expansions should deepen the strategic framework rather than sit beside it as disconnected feature packs.

### Mirewrought Pacts

- Covenants receive clear timing, cost, and impact previews.
- The Hollow gains a distinct strategic AI identity.
- Echo Reed and Embercore-6 receive build roles and Ledger analysis.
- The fifth seat is included in simulation and market-balance tests.
- Abyssal Runoff becomes a visible high-movement archetype rather than a hidden scoring exception.
- Add Covenant-focused trials, mastery records, cosmetics, and campaign cases.

### Veilglass Afflictions

- Remedy Paths appear as readable multi-round plans.
- Distillation previews show how the current brew advances treatment.
- Veil Retorts are included in stop, market, and summary decisions.
- Affliction-specific Omens communicate their strategic consequences.
- Add an Affliction Casebook, cure history, challenge scenarios, cosmetics, and campaign cases.

### Combined-expansion rules

- Explicit compatibility tables;
- AI support for every enabled system;
- deterministic save/replay behavior;
- simulations for interaction exploits;
- Custom Ritual warnings for unusually complex combinations;
- a recommended-complexity indicator during setup.

The complete base game must remain intact when both expansions are disabled.

---

## 16. Phase 12 — Environments and Match Presentation

Once strategic clarity is stable, presentation can reinforce gameplay instead of competing with it.

### Gameplay environments

- multiple randomized laboratory scenes;
- scene-specific HUD palettes with verified contrast;
- matching ambience, music, and restrained animation;
- environmental escalation across rounds;
- final-round and shatter states;
- no background motion that obscures tokens or decision panels.

### Match highlights

Record and present:

- the decisive draw;
- the largest successful risk;
- the most valuable purchase;
- a crucial Scry or Covenant use;
- a major cure or Affliction milestone;
- the turning point between leading rivals.

Highlights may use short re-presentations of stored game events, never prerecorded false outcomes.

### Rematch flow

- instant replay with the same setup and a new seed;
- exact-seed rematch for learning;
- change-one-setting rematch;
- direct access to the previous Ledger and match analysis;
- uninterrupted compatible music transitions.

---

## 17. Phase 13 — Accessibility and Learning Mastery

Accessibility must be developed with each phase rather than postponed.

### Assistance layers

- qualitative or exact probability display;
- colour-independent ingredient shapes and labels;
- high-contrast HUD themes;
- scalable text and interface density;
- reduced motion and animation-speed presets;
- pause/hold options for summaries and transitions;
- complete keyboard and controller navigation;
- screen-reader labels for critical controls and state;
- captions and independent audio buses;
- optional confirmation for catastrophic decisions;
- rules glossary accessible without leaving the match.

### Teaching structure

- interactive first brew explaining decisions, not merely buttons;
- contextual lessons that disappear once understood;
- short practice scenarios for stopping, bag building, and market synergy;
- strategy entries in the Grimoire;
- post-match suggestions grounded in actual events;
- an option to disable all advice for expert play.

Assistance can expose legal information but must never secretly alter odds unless an explicitly named accessibility modifier is enabled in a non-competitive mode.

---

## 18. Phase 14 — Online PvP

PvP is a separate major project and begins only after local rules, deterministic simulation, persistence, and balance are dependable.

### Foundation

- authoritative server-side match state;
- deterministic seeded simulation;
- action validation;
- reconnect and resume;
- turn/action clocks appropriate to each phase;
- version negotiation and migration handling;
- replayable action log;
- protection against hidden-information inspection and client manipulation.

### Modes

- private invitations;
- casual matchmaking;
- ranked Standard Ritual;
- ranked Ashenveil Ritual only after separate balance validation;
- asynchronous matches with generous response windows;
- spectator and replay support after privacy review;
- custom unranked rituals.

### Competitive integrity

- no gameplay power from DLC ownership or progression;
- shared legal information rules;
- symmetric character presets;
- disconnect and abandonment policy;
- matchmaking ratings separated by ruleset;
- seasonal ranks with cosmetic rewards;
- moderation, reporting, and account-safety requirements;
- server-generated official seeds and verified results.

### Social restraint

The game does not need an unrestricted chat system to support good PvP. Begin with invitations, curated reactions, and post-match rematch controls. Add broader communication only with adequate safety and moderation.

---

## 19. Phase 15 — Community and Long-Term Extensibility

Only after official content tooling is reliable:

- shareable Custom Ritual codes;
- curated community challenge submissions;
- official featured rituals;
- replay sharing;
- privacy-safe aggregate statistics;
- creator-facing validation tools for seeds and objectives;
- localization-ready data definitions;
- documented internal tools for adding Omens, trials, cases, and cosmetics.

Do not expose arbitrary executable modding in the browser build. Community-authored content should use constrained, validated data formats.

---

## 20. Chronicle and Progression

Chronicle records should describe how the player plays, not only whether they won.

Add records for:

- favourite and most successful build identities;
- average stopping pressure;
- shatter rate;
- decisive purchases;
- best recovery;
- most valuable ingredient families;
- rival matchup history;
- Standard versus Ashenveil records;
- completed Trial objectives and mastery conditions.

Progression remains cosmetic and expressive:

- portraits;
- profile frames;
- titles;
- menu and Chronicle embellishments;
- non-gameplay presentation variants.

No unlock may improve bag odds, starting resources, scoring, or competitive power.

---

## 21. Simulation and Human Testing

### Automated balance work

Run seeded simulations covering:

- all base recipe sets;
- every player count;
- each AI identity and difficulty;
- Standard and Ashenveil rulesets;
- major build archetypes;
- all intended expansion combinations when DLC integration begins.

Track:

- win rate and score distribution;
- shatter rate;
- first-seat advantage;
- ingredient purchase and activation rates;
- intention and objective selection rates;
- Scry value;
- build convergence;
- runaway-leader frequency.

Initial warning thresholds, to be refined after baseline data:

- a choice selected in more than 60% of comparable situations;
- a build materially outperforming alternatives across seeds;
- an option whose cost is ignored because its benefit dominates;
- player-count or seat-order win-rate gaps that remain consistently large.

### Human test questions

Do not ask only whether the game was fun. Ask:

- Why did you stop in that round?
- Which purchase changed your plan?
- What were you trying to build?
- When did you knowingly accept danger?
- What would you do differently next match?
- Did the game explain why you won or lost?

If players cannot answer, more content will not solve the problem.

---

## 22. Master Delivery Order

### Two-stage release boundary

**Stage 1 — Necessary strategic repair (Phases 0–6).** This is the minimum complete redesign required before the next public deployment: measurement, Standard Ritual clarity, viable build identities, the Ashenveil Ritual vertical slice, active stopping through Preparation, twelve strategic Named Trials, and rivals with legible strategies. Stage 1 is followed by a dedicated release-gate QA pass covering rules correctness, save migration, deterministic replay, all player counts, responsive/readable UI, accessibility, audio, and production-like asset loading. The project may be deployed after that gate passes.

**Stage 2 — Full long-term expansion (Phases 7–15).** Advanced tactical systems, Custom Ritual, Ashenveil Cases, living challenge cadence, exact seeded save continuity through serialized RNG state, expansion integration, additional environments and presentation, learning/accessibility mastery, online PvP, and community extensibility belong to later updates. Stage 2 is not required to deploy the repaired and strategically complete Stage 1 game.

### Milestone A — Baseline and decision specification

- Add local instrumentation.
- Audit ingredient roles and current decision points.
- Produce wireframes for the Ledger, draw choice, stop preview, and market preview.
- Define exact Standard information boundaries.

### Milestone B — Standard Ritual clarity prototype

- Implement the Brewer’s Ledger.
- Implement risk and stop previews.
- Implement market impact preview.
- Replace the round summary with a causal summary.
- Test without altering seeded game outcomes.

### Milestone C — Standard Ritual quality gate

- Conduct focused playtests.
- Fix comprehension failures.
- Verify responsive layouts and accessibility.
- Ship only when players can explain their decisions.

### Milestone D — Ashenveil Ritual vertical slice

- Implement Intention, Scry, and round objectives behind a feature flag.
- Support one complete base-game configuration.
- Add AI, save/load, replay, reduced motion, and automated tests.
- Evaluate whether it creates meaningful agency.

### Milestone E — Balance and expand

- Refine or remove weak systems.
- Expand to all base recipe sets and player counts.
- Add Preparation only if testing supports it.
- Complete strategic AI identities.

### Milestone F — Twelve Named Trials

- Build the full strategic catalogue.
- Add mastery goals, Chronicle records, and cosmetic rewards.
- Validate every launch and completion route in production-like builds.

### Milestone G — DLC integration

- Integrate Covenants, Afflictions, Distillation, fifth-seat play, and DLC ingredients only after the base strategic framework is stable.
- Preserve a clean base-game experience when expansions are disabled.

### Milestone H — Advanced tactical systems

- Prototype controlled token manipulation, effect ordering, rival reactions, and market contention separately.
- Retain only systems that materially change player planning.
- Evaluate optional character disciplines.

### Milestone I — Custom Ritual

- Build validated setup modifiers and shareable ritual codes.
- Separate official and custom records.
- Add curated presets and compatibility explanations.

### Milestone J — Ashenveil Cases

- Produce one complete three-case vertical slice.
- Validate narrative state, consequences, replay, and rewards.
- Expand only after the case structure proves sustainable.

### Milestone K — Living challenges and presentation

- Expand Daily and Weekly cadence.
- Add seasonal casefiles without power-based fear of missing out.
- Add environments, highlights, and improved rematch flow.

### Milestone L — Full expansion framework

- Integrate Mirewrought Pacts and Veilglass Afflictions into strategy analysis, AI, challenges, campaign, simulation, and Custom Ritual.
- Validate both expansions together and separately.

### Milestone M — Online foundation and PvP

- Build authoritative networking and deterministic action logs.
- Release private and casual play first.
- Add ranked play only after security, reconnect, moderation, and balance gates pass.

### Milestone N — Community longevity

- Add constrained sharing, featured community rituals, replay sharing, localization tooling, and internal content pipelines.
- Preserve official-rule integrity and browser security.

---

## 23. Release Gates

The strategic redesign is ready only when:

- Standard Ritual produces the same rules outcomes and seeded draws as before;
- players can explain the risk and secured reward of a draw/stop decision;
- market purchases show understandable long-term consequences;
- at least three viable build identities are observed in each supported recipe environment;
- summaries accurately identify decisive events without inventing causality;
- Ashenveil Ritual adds meaningful agency without excessive interruption;
- AI follows the same information rules as the human;
- all new systems survive save/load and deterministic replay;
- all player counts can complete nine rounds;
- keyboard, pointer, readable text, contrast, and reduced-motion behavior are verified;
- local and production-like asset loading tests pass for every entry route.

Each later phase also requires its own independent release gate. Completion of an earlier phase does not automatically authorize campaign, DLC, live-content, or multiplayer release.

---

## 24. Explicitly Out of Scope

Do not attempt to solve the strategy problem by:

- adding more visual effects before decision clarity is fixed;
- giving the player permanent statistical upgrades;
- hiding useful information and calling uncertainty “depth”;
- adding a new button or resource to every draw;
- silently changing Standard Ritual;
- increasing randomness without adding control or planning;
- relying on harder AI to create strategy;
- adding dozens of challenge cards before the core decisions are proven;
- integrating DLC mechanics into an unclear base loop.
- launching ranked PvP before authoritative validation and reconnection work;
- adding unrestricted user scripts or unsafe browser modding;
- using limited-time power rewards to force engagement;
- treating a large quantity of content as a substitute for meaningful decisions.

---

## 25. Immediate Next Step

The next work item is **Milestone A**, not another visual-content phase.

Create a concrete interaction specification for four connected moments:

1. the Brewer’s Ledger before drawing;
2. the informed Draw-or-Stop decision;
3. the market purchase impact preview;
4. the causal round summary.

Then implement that Standard Ritual clarity layer behind a development feature flag and test it with the existing base game before touching Ashenveil Ritual mechanics.

