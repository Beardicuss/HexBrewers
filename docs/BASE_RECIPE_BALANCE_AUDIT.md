# Base Recipe Balance Audit

## Scope and method

This document is the Phase 2 balance record for base recipe sets 1–4. It covers all twenty colored ingredient effects, their intended partners and counterweights, the effects that are mechanically passive, and deterministic evidence for three build plans per set.

The viability benchmark runs 120 seeded two-player Skilled matches for each declared strategy and 120 seed-matched control matches using the generic market planner. That is 2,880 complete nine-round matches across the twelve profiles. Brewing, scoring, Omens, market stock, purchase limits, turn order, and the Skilled human economy modifier all use production rules.

A strategy passes when it:

- retains at least 90% of the seed-matched generic planner's score;
- remains within fifteen percentage points of its seed-matched win rate;
- completes at least three purchases per match;
- produces a measurably distinct preferred-color build, unless the generic set environment already contains at least eight of those tokens.

This is a regression gate, not a claim of final competitive balance. It proves that following any listed plan is not a trap under the present AI and economy.

## Set 1 — visible combinations

| Ingredient | Decision pattern | Intended synergy | Counterweight |
|---|---|---|---|
| Frostbile | Select from bonus draws | Plaguedust recovery; Wraithbloom milestones | More draws still expose Voidshards; costly at high value |
| Bloodthorn | Gains movement from Brimstone | Brimstone density | Requires a second color and competing purchases |
| Plaguedust | Returns a preceding Voidshard | Frostbile draw chains; Bloodthorn risk | Unlocks in round 2 and needs exact draw order |
| Deathweave | Rewards ending among the last two chips | Wraithbloom and Shadowmoss long-term economy | Low movement; strict end-position trigger |
| Wraithbloom | Rewards collection thresholds | Deathweave ruby engine | Late unlock and individually weak movement |

Viable plans: **Controlled Chain** (blue/yellow/purple), **Ruby Bloom** (green/purple/black), and **Ember Resonance** (red/orange/yellow).

## Set 2 — delayed conversion

| Ingredient | Decision pattern | Intended synergy | Counterweight |
|---|---|---|---|
| Frostbile | Stores shatter protection | Plaguedust multiplier; Bloodthorn tempo | Protection is wasted in a safe brew |
| Bloodthorn | Reserves placement until brewing ends | Deathweave endings; Wraithbloom conversion | Delayed low values can underperform |
| Plaguedust | Doubles the next chip | Bloodthorn or Frostbile high values | Hidden draw order can waste the multiplier |
| Deathweave | Chooses an ingredient reward from its ending | Red/blue/purple adaptation | Trigger and reward depend on exact final position/value |
| Wraithbloom | Trades concentration into tailored ingredients | Deathweave and Shadowmoss economy | Expensive, late, and consumes its own engine |

Viable plans: **Protected Surge** (blue/yellow/red), **Adaptive Harvest** (green/red/blue), and **Mire Transmutation** (purple/green/black).

## Set 3 — pressure and position

| Ingredient | Decision pattern | Intended synergy | Counterweight |
|---|---|---|---|
| Frostbile | Rewards ruby-space landings | Deathweave and Wraithbloom economy | No payoff on ordinary spaces |
| Bloodthorn | Copies the value of a preceding Voidshard | Plaguedust pressure capacity | Encourages danger without preventing shatter |
| Plaguedust | Passively raises the pressure threshold | Red resonance and blue depth | High price; safety creates no score by itself |
| Deathweave | Bursts when pressure is exactly seven | Plaguedust capacity and Bloodthorn setup | Very narrow trigger window |
| Wraithbloom | Scores by reached position band | Reliable movement and pressure control | Late unlock; weak below scoring bands |

Viable plans: **Position Bloom** (purple/red/orange), **Sevenfold Resonance** (green/red/yellow), and **Ruby Lattice** (blue/green/black).

The initially proposed **Threshold Ward** (yellow/blue/purple) was rejected by the benchmark at 84% score retention. Position Bloom replaced it and reached 101% retention. Failed concepts remain evidence; they are not relabeled as viable.

## Set 4 — tempo and refinement

| Ingredient | Decision pattern | Intended synergy | Counterweight |
|---|---|---|---|
| Frostbile | Scores prestige on ruby spaces | Deathweave ruby conversion | Space variance and high purchase prices |
| Bloodthorn | Passively accelerates later white chips | Plaguedust tempo | Also accelerates dangerous Voidshards |
| Plaguedust | Scales repeated yellow draws | Bloodthorn and Wraithbloom refinement | Requires multiple copies to appear in time |
| Deathweave | Converts rubies into starting distance | Frostbile and Wraithbloom economy | Competes with flask refills for the same rubies |
| Wraithbloom | Upgrades owned colored chips | Yellow/blue scaling targets | Late purchase leaves fewer rounds for repayment |

Viable plans: **Whitefire** (red/yellow/purple), **Ruby Pilgrimage** (blue/green/black), and **Refined Tempo** (purple/yellow/blue).

## Passive and choice-light watchlist

Two effects have clear identities but resolve without a direct player decision after purchase:

1. **Set 3 Plaguedust — pressure capacity.** The strategic choice is whether to buy safety and how aggressively to exploit it. Once owned, the threshold increase is automatic. Watch for it becoming a mandatory efficiency purchase rather than an intentional control plan.
2. **Set 4 Bloodthorn — white-chip acceleration.** Buying it is a meaningful risk commitment, but individual triggers are automatic. Watch whether its upside overwhelms the added shatter exposure or makes draw order feel predetermined.

Conditional effects are not classified as choice-free: their purchase, timing, stopping decision, end position, target, or resource expenditure changes whether they succeed.

## Latest deterministic evidence

| Set | Strategy | Win rate | Matched baseline | Score retained | Preferred-token lift |
|---:|---|---:|---:|---:|---:|
| 1 | Controlled Chain | 41.7% | 36.7% | 95.0% | +3.10 |
| 1 | Ruby Bloom | 35.0% | 40.8% | 92.0% | +11.54 |
| 1 | Ember Resonance | 44.2% | 41.7% | 100.0% | +3.67 |
| 2 | Protected Surge | 36.7% | 42.5% | 93.4% | +0.10* |
| 2 | Adaptive Harvest | 41.7% | 38.3% | 96.6% | +0.07* |
| 2 | Mire Transmutation | 33.3% | 35.8% | 100.4% | +0.98 |
| 3 | Position Bloom | 35.8% | 32.5% | 101.1% | +1.72 |
| 3 | Sevenfold Resonance | 35.8% | 35.0% | 102.9% | +2.14 |
| 3 | Ruby Lattice | 33.3% | 35.8% | 95.9% | +2.18 |
| 4 | Whitefire | 56.7% | 46.7% | 124.0% | +5.92 |
| 4 | Ruby Pilgrimage | 62.5% | 46.7% | 116.9% | +6.21 |
| 4 | Refined Tempo | 40.8% | 40.8% | 103.1% | +1.95 |

\* Set 2's generic planner already averaged more than eight tokens from these broad three-color environments; viability therefore depends on competitive retention rather than an artificial composition delta.

Machine-readable evidence is written to `benchmarks/latest-build-viability.json`. Re-run it with `npm run test:build-viability` after any recipe, economy, AI-market, scoring, or bag-composition change.

## Current conclusion

Every base set supports three non-trap plans under deterministic validation. No production recipe value was changed in this phase. Set 4's targeted plans outperform its generic planner strongly enough to warrant continued observation, but that alone does not prove the recipes are overpowered because both seats use the same recipe set; it proves that deliberate purchasing matters. The next balance pass should compare these plans against one another in four-seat shared-market simulations before changing printed rules.
