import { describe, expect, it } from "vitest";
import { createGameSetup, normalizeContentPacks } from "./contentPacks";
import { runRuleHooks, type RuleHook } from "./moduleHooks";
import { createInitialState, createInitialStateWithSetup } from "../store/gameStoreHelpers";
import { useGameStore } from "../store/gameStore";
import { canUseCovenant, createCovenantOffer, prepareAICovenantForBrewing, prepareAICovenantForMarket, restoreAIFlaskWithCovenant, useCovenant, type CovenantSelection } from "./covenants";
import { placeTokenForActiveBooks } from "./brewingRules";
import { calculateRoundScore } from "./scoring";
import { AFFLICTION_ORDER, adjacentPlayerIndexes, calculateDistillationProgress, createAfflictionOffer, getRemedyReward, resolveDistillationRound } from "./distillation";
import { OMEN_DECK, VEILGLASS_OMENS, omenDeckForPacks } from "./omen";
import { simulateMatches } from "./balanceSimulation";

describe("content-pack setup", () => {
  it("keeps expansion systems disabled for base games", () => {
    const setup = createGameSetup({ totalPlayers: 5 });

    expect(setup.totalPlayers).toBe(4);
    expect(setup.enabledPacks).toEqual(["base"]);
    expect(setup.modules).toEqual({
      fifthSeat: false,
      patrons: false,
      overflow: false,
      distillation: false,
    });
  });

  it("enables a fifth seat only with Mirewrought Pacts", () => {
    const setup = createGameSetup({
      totalPlayers: 5,
      enabledPacks: ["covenants_of_the_mire"],
    });
    const state = createInitialStateWithSetup(setup, "master");

    expect(setup.enabledPacks).toEqual(["base", "covenants_of_the_mire"]);
    expect(setup.modules.fifthSeat).toBe(true);
    expect(state.players).toHaveLength(5);
    expect(state.players[4].name).toBe("The Hollow");
    expect(state.market.find((item) => item.id === "m-orange-1")?.stock).toBe(17);
    expect(state.players.every((player) => player.covenantSeals?.bone && player.covenantSeals.moon && player.covenantSeals.blood)).toBe(true);
  });

  it("keeps Mirewrought recipe sets exclusive to Mirewrought Pacts", () => {
    expect(createGameSetup({ recipeMode: 5 }).recipeMode).toBe(1);
    expect(createGameSetup({ recipeMode: 6 }).recipeMode).toBe(1);
    expect(createGameSetup({ recipeMode: 5, enabledPacks: ["covenants_of_the_mire"] }).recipeMode).toBe(5);
    expect(createGameSetup({ recipeMode: 6, enabledPacks: ["covenants_of_the_mire"] }).recipeMode).toBe(6);
  });

  it("normalizes dependencies and pack order", () => {
    expect(normalizeContentPacks([
      "distillers_of_the_veil",
      "covenants_of_the_mire",
      "distillers_of_the_veil",
    ])).toEqual(["base", "covenants_of_the_mire", "distillers_of_the_veil"]);
  });

  it("preserves legacy base-game initialization", () => {
    const state = createInitialState(1, 99);
    expect(state.players).toHaveLength(4);
    expect(state.setup.enabledPacks).toEqual(["base"]);
    expect(state.players.every((player) => player.covenantSeals === undefined)).toBe(true);
    expect(state.players.every((player) => !player.crucible.overflowEnabled)).toBe(true);
    expect(state.market.some((item) => item.token.color === "echo" || item.token.value === 6)).toBe(false);
  });

  it("adds Echo Reed and Embercore only to the Covenants market", () => {
    const state = createInitialStateWithSetup(createGameSetup({ enabledPacks: ["covenants_of_the_mire"] }));
    expect(state.market.find((item) => item.id === "m-echo-0")).toMatchObject({ cost: 8, unlockRound: 2 });
    expect(state.market.find((item) => item.id === "m-orange-6")).toMatchObject({ cost: 12, unlockRound: 2 });
    expect(state.players.every((player) => player.crucible.overflowEnabled)).toBe(true);
  });

  it("adds Echo Reed but not Embercore to a Veilglass-only market", () => {
    const state = createInitialStateWithSetup(createGameSetup({ enabledPacks: ["distillers_of_the_veil"] }));
    expect(state.market.find((item) => item.id === "m-echo-0")).toMatchObject({ cost: 8, unlockRound: 2 });
    expect(state.market.find((item) => item.id === "m-orange-6")).toBeUndefined();
    expect(state.setup.echoRecipe).toBe("retort_resonance");
  });
});

describe("Mirewrought Pacts seals", () => {
  const makeState = () => createInitialStateWithSetup(createGameSetup({
    totalPlayers: 2,
    enabledPacks: ["covenants_of_the_mire"],
  }));

  it("uses Moonstep only before the first draw and advances the droplet once", () => {
    const player = makeState().players[0];
    expect(canUseCovenant(player, "moon", "brewing")).toBe(true);

    const updated = useCovenant(player, "moon");
    expect(updated.crucible.dropletPosition).toBe(player.crucible.dropletPosition + 1);
    expect(updated.covenantSeals?.moon).toBe(false);
    expect(canUseCovenant(updated, "moon", "brewing")).toBe(false);
  });

  it("uses Ossuary Mercy to restore an empty flask during ruby spending", () => {
    const player = { ...makeState().players[0], flask: false };
    expect(canUseCovenant(player, "bone", "ruby_spend")).toBe(true);

    const updated = useCovenant(player, "bone");
    expect(updated.flask).toBe(true);
    expect(updated.covenantSeals?.bone).toBe(false);
    expect(canUseCovenant(updated, "bone", "ruby_spend")).toBe(false);
  });

  it("uses Crimson Credit once to add five market coins", () => {
    const state = makeState();
    useGameStore.setState({
      state: {
        ...state,
        phase: "market",
        buyPhaseState: { purchases: [], coinsSpent: 0, coinsAvailable: 7 },
      },
    });

    useGameStore.getState().humanUseCovenant("blood");
    let updated = useGameStore.getState().state;
    expect(updated.buyPhaseState?.coinsAvailable).toBe(12);
    expect(updated.players[0].covenantSeals?.blood).toBe(false);

    useGameStore.getState().humanUseCovenant("blood");
    updated = useGameStore.getState().state;
    expect(updated.buyPhaseState?.coinsAvailable).toBe(12);
  });

  it("gives AI deterministic timing for all three seals", () => {
    const ai = makeState().players[1];
    const brewing = prepareAICovenantForBrewing(ai);
    expect(brewing.crucible.dropletPosition).toBe(ai.crucible.dropletPosition + 1);
    expect(brewing.covenantSeals?.moon).toBe(false);

    expect(prepareAICovenantForMarket(brewing, 5).covenantSeals?.blood).toBe(true);
    const market = prepareAICovenantForMarket(brewing, 6);
    expect(market.coinsThisRound).toBe(brewing.coinsThisRound + 5);
    expect(market.covenantSeals?.blood).toBe(false);

    const restored = restoreAIFlaskWithCovenant({ ...market, flask: false });
    expect(restored.flask).toBe(true);
    expect(restored.covenantSeals?.bone).toBe(false);
  });

  it("reveals three valid choices in every Covenant category and persists the selection", () => {
    const state = makeState();
    const offer = state.covenantOffer!;
    expect(offer).toEqual(createCovenantOffer(state.setup.recipeMode, state.setup.totalPlayers));
    expect(Object.values(offer).every((ids) => ids.length === 3 && new Set(ids).size === 3)).toBe(true);
    const selection: CovenantSelection = { bone: offer.bone[1], moon: offer.moon[1], blood: offer.blood[1] };
    useGameStore.setState({ state });
    useGameStore.getState().selectCovenants(selection);
    expect(useGameStore.getState().state.selectedCovenants).toEqual(selection);
    expect(useGameStore.getState().state.phase).toBe("omen");
  });

  it("runs Covenant setup before Affliction setup when both DLCs are enabled", () => {
    const state = createInitialStateWithSetup(createGameSetup({
      enabledPacks: ["covenants_of_the_mire", "distillers_of_the_veil"],
    }));
    const offer = state.covenantOffer!;
    useGameStore.setState({ state });
    useGameStore.getState().selectCovenants({ bone: offer.bone[0], moon: offer.moon[0], blood: offer.blood[0] });
    expect(useGameStore.getState().state.phase).toBe("setup");
    useGameStore.getState().selectHumanAffliction(state.afflictionOffer![0]);
    expect(useGameStore.getState().state.phase).toBe("omen");
  });

  it("implements all twelve one-use Covenant powers", () => {
    const base = makeState().players[0];
    const selection = (bone: CovenantSelection["bone"], moon: CovenantSelection["moon"], blood: CovenantSelection["blood"]): CovenantSelection => ({ bone, moon, blood });
    expect(useCovenant({ ...base, flask: false }, "bone", selection("ossuary_mercy", "moonstep", "crimson_credit")).flask).toBe(true);
    expect(useCovenant(base, "bone", selection("marrow_exchange", "moonstep", "crimson_credit")).rubies).toBe(base.rubies + 2);
    expect(useCovenant(base, "bone", selection("graveward", "moonstep", "crimson_credit")).crucible.dropletPosition).toBe(base.crucible.dropletPosition + 2);
    expect(useCovenant(base, "bone", selection("pale_reckoning", "moonstep", "crimson_credit")).score).toBe(base.score + 3);
    expect(useCovenant(base, "moon", selection("ossuary_mercy", "moonstep", "crimson_credit")).crucible.dropletPosition).toBe(base.crucible.dropletPosition + 1);
    expect(useCovenant(base, "moon", selection("ossuary_mercy", "silver_ward", "crimson_credit")).blueProtectionDraws).toBe(1);
    expect(useCovenant(base, "moon", selection("ossuary_mercy", "lunar_tithe", "crimson_credit")).rubies).toBe(base.rubies + 2);
    expect(useCovenant(base, "moon", selection("ossuary_mercy", "eclipse_stride", "crimson_credit")).crucible.dropletPosition).toBe(base.crucible.dropletPosition + 2);
    expect(useCovenant({ ...base, score: 5 }, "blood", selection("ossuary_mercy", "moonstep", "sanguine_bargain")).score).toBe(3);
    expect(useCovenant(base, "blood", selection("ossuary_mercy", "moonstep", "red_harvest")).rubies).toBe(base.rubies + 2);
    expect(useCovenant(base, "blood", selection("ossuary_mercy", "moonstep", "heartprice")).crucible.dropletPosition).toBe(base.crucible.dropletPosition + 2);
    expect(useCovenant(base, "blood", selection("ossuary_mercy", "moonstep", "crimson_credit")).covenantSeals?.blood).toBe(false);
  });
});

describe("Mirewrought Pacts ingredients", () => {
  const makeState = () => createInitialStateWithSetup(createGameSetup({ enabledPacks: ["covenants_of_the_mire"] }));

  it("resolves and persists Echo Reed movement from draw-time catch-up", () => {
    const state = makeState();
    const player = { ...state.players[0], ratStoneOffset: 4 };
    const placed = placeTokenForActiveBooks(player, { id: "echo-test", color: "echo", value: 0 }, state);
    const result = placed.crucible.placements[placed.crucible.placements.length - 1];

    expect(result.movement).toBe(4);
    expect(result.token.value).toBe(0);
    expect(result.token.resolvedMovement).toBe(4);

    const replayed = placeTokenForActiveBooks(
      { ...state.players[0], ratStoneOffset: 1 },
      result.token,
      state,
    );
    expect(replayed.crucible.placements[replayed.crucible.placements.length - 1]?.movement).toBe(4);
  });

  it("gives Echo Reed a minimum movement of one and Embercore movement of six", () => {
    const state = makeState();
    const echo = placeTokenForActiveBooks(state.players[0], { id: "echo-min", color: "echo", value: 0 }, state);
    expect(echo.crucible.placements[echo.crucible.placements.length - 1]?.movement).toBe(1);

    const embercore = placeTokenForActiveBooks(state.players[0], { id: "embercore", color: "orange", value: 6 }, state);
    expect(embercore.crucible.placements[embercore.crucible.placements.length - 1]?.movement).toBe(6);
    expect(embercore.crucible.whiteSum).toBe(0);
  });

  it("caps Echo Reed at four movement even with a larger catch-up offset", () => {
    const state = makeState();
    const player = { ...state.players[0], ratStoneOffset: 7 };
    const echo = placeTokenForActiveBooks(player, { id: "echo-cap", color: "echo", value: 0 }, state);
    expect(echo.crucible.placements[0]?.movement).toBe(4);
  });
});

describe("Abyssal Runoff", () => {
  it("places the spoon-reaching chip at 33 and only later chips in runoff", () => {
    const state = createInitialStateWithSetup(createGameSetup({ enabledPacks: ["covenants_of_the_mire"] }));
    const player = {
      ...state.players[0],
      crucible: { ...state.players[0].crucible, filledUpTo: 32 },
    };
    const reached = placeTokenForActiveBooks(player, { id: "ember-six", color: "orange", value: 6 }, state);
    expect(reached.crucible.filledUpTo).toBe(33);
    expect(reached.crucible.overflowTokens).toEqual([]);

    const overflowed = placeTokenForActiveBooks(reached, { id: "green-four", color: "green", value: 4 }, state);
    expect(overflowed.crucible.filledUpTo).toBe(33);
    expect(overflowed.crucible.overflowTokens.map((token) => token.id)).toEqual(["green-four"]);
  });

  it("adds half the runoff chip value, rounded down, to prestige", () => {
    const state = createInitialStateWithSetup(createGameSetup({ enabledPacks: ["covenants_of_the_mire"] }));
    const full = { ...state.players[0], crucible: { ...state.players[0].crucible, filledUpTo: 33 } };
    const first = placeTokenForActiveBooks(full, { id: "runoff-4", color: "green", value: 4 }, state);
    const second = placeTokenForActiveBooks(first, { id: "runoff-1", color: "orange", value: 1 }, state);
    const result = calculateRoundScore(second.crucible);

    expect(result).toMatchObject({ space: 33, coins: 35, overflowValue: 5, overflowVp: 2, vp: 17 });
  });

  it("does not activate colored ingredient actions from runoff", () => {
    const state = createInitialStateWithSetup(createGameSetup({ enabledPacks: ["covenants_of_the_mire"] }));
    const full = { ...state.players[0], crucible: { ...state.players[0].crucible, filledUpTo: 33 } };
    const overflowed = placeTokenForActiveBooks(full, { id: "runoff-blue", color: "blue", value: 4 }, state);
    expect(overflowed.blueProtectionDraws).toBe(0);
    expect(overflowed.crucible.overflowTokens).toHaveLength(1);
  });
});

describe("Veilglass Afflictions distillation", () => {
  function preparedState() {
    let state = createInitialStateWithSetup(createGameSetup({ enabledPacks: ["distillers_of_the_veil"] }));
    let human = state.players[0];
    for (const token of [
      { id: "distill-green", color: "green" as const, value: 1 },
      { id: "distill-red", color: "red" as const, value: 1 },
      { id: "distill-white-3", color: "white" as const, value: 3 },
      { id: "distill-white-2a", color: "white" as const, value: 2 },
      { id: "distill-white-2b", color: "white" as const, value: 2 },
    ]) human = placeTokenForActiveBooks(human, token, state);
    state = {
      ...state,
      phase: "distillation",
      currentOmen: null,
      players: [
        human,
        { ...state.players[1], crucible: { ...state.players[1].crucible, exploded: true } },
      ],
    };
    return state;
  }

  it("assigns prototype Affliction Contracts only when the module is enabled", () => {
    expect(createInitialState().players.every((player) => player.affliction === undefined)).toBe(true);
    const state = preparedState();
    expect(state.players.map((player) => player.affliction?.contractId)).toEqual(["ashen_breath", "glassvein_chill"]);
  });

  it("offers three unique contracts from the complete eight-contract pool", () => {
    expect(AFFLICTION_ORDER).toHaveLength(8);
    expect(new Set(AFFLICTION_ORDER).size).toBe(8);
    const offer = createAfflictionOffer(1, 2);
    expect(offer).toEqual(["hollow_bloom", "thorn_memory", "ashen_breath"]);
    expect(new Set(offer).size).toBe(3);
  });

  it("binds the human choice and restricts AI choices to the same offer", () => {
    const initial = createInitialStateWithSetup(createGameSetup({
      totalPlayers: 4,
      enabledPacks: ["distillers_of_the_veil"],
    }));
    useGameStore.setState({ state: initial });
    const chosen = initial.afflictionOffer![1];
    useGameStore.getState().selectHumanAffliction(chosen);
    const selected = useGameStore.getState().state;
    expect(selected.phase).toBe("omen");
    expect(selected.players[0].affliction?.contractId).toBe(chosen);
    expect(selected.players.slice(1).every((player) =>
      initial.afflictionOffer!.includes(player.affliction!.contractId),
    )).toBe(true);
  });

  it("ignores a contract that was not offered", () => {
    const initial = createInitialStateWithSetup(createGameSetup({ enabledPacks: ["distillers_of_the_veil"] }));
    useGameStore.setState({ state: initial });
    const unavailable = AFFLICTION_ORDER.find((id) => !initial.afflictionOffer!.includes(id))!;
    useGameStore.getState().selectHumanAffliction(unavailable);
    expect(useGameStore.getState().state.phase).toBe("setup");
  });

  it("counts colors, exact-seven pressure, and a two-player neighbor once", () => {
    const state = preparedState();
    expect(calculateDistillationProgress(state, 0)).toBe(4);
    expect(adjacentPlayerIndexes(0, 2)).toEqual([1]);
    expect(adjacentPlayerIndexes(1, 5)).toEqual([0, 2]);
  });

  it("handles Distillation neighbors exactly once across two to five seats", () => {
    const cases = [
      { playerCount: 2, neighbors: [1] },
      { playerCount: 3, neighbors: [2, 1] },
      { playerCount: 4, neighbors: [3, 1] },
      { playerCount: 5, neighbors: [4, 1] },
    ] as const;

    for (const { playerCount, neighbors } of cases) {
      const enabledPacks = playerCount === 5
        ? ["covenants_of_the_mire", "distillers_of_the_veil"] as const
        : ["distillers_of_the_veil"] as const;
      const initial = createInitialStateWithSetup(createGameSetup({ totalPlayers: playerCount, enabledPacks: [...enabledPacks] }));
      const state = {
        ...initial,
        currentOmen: null,
        players: initial.players.map((player, index) => ({
          ...player,
          crucible: { ...player.crucible, placements: [], whiteSum: 0, exploded: neighbors.includes(index as never) },
        })),
      };

      expect(adjacentPlayerIndexes(0, playerCount)).toEqual(neighbors);
      expect(calculateDistillationProgress(state, 0)).toBe(neighbors.length);
    }
  });

  it("awards the exact-seven Distillation bonus at seven pressure only", () => {
    const initial = createInitialStateWithSetup(createGameSetup({ enabledPacks: ["distillers_of_the_veil"] }));
    const progressAt = (whiteSum: number) => calculateDistillationProgress({
      ...initial,
      currentOmen: null,
      players: initial.players.map((player) => ({
        ...player,
        crucible: { ...player.crucible, placements: [], whiteSum, exploded: false },
      })),
    }, 0);

    expect(progressAt(6)).toBe(0);
    expect(progressAt(7)).toBe(1);
    expect(progressAt(8)).toBe(0);
  });

  it("adds only Veilglass Omens to matches with the expansion enabled", () => {
    expect(omenDeckForPacks(["base"])).toEqual(OMEN_DECK);
    const expanded = omenDeckForPacks(["base", "distillers_of_the_veil"]);
    expect(expanded).toHaveLength(OMEN_DECK.length + VEILGLASS_OMENS.length);
    expect(expanded.slice(-VEILGLASS_OMENS.length)).toEqual(VEILGLASS_OMENS);
    expect(new Set(expanded.map((omen) => omen.id)).size).toBe(expanded.length);
  });

  it("applies each Veilglass Omen to Distillation progress", () => {
    const state = preparedState();
    const withOmen = (index: number) => ({ ...state, currentOmen: VEILGLASS_OMENS[index] });
    expect(calculateDistillationProgress(withOmen(0), 0)).toBe(5);
    expect(calculateDistillationProgress(withOmen(1), 0)).toBe(5);
    expect(calculateDistillationProgress(withOmen(2), 0)).toBe(5);
    const weak = {
      ...state,
      players: state.players.map((player, index) => index === 0
        ? { ...player, crucible: { ...player.crucible, placements: [], whiteSum: 0 } }
        : { ...player, crucible: { ...player.crucible, exploded: false } }),
      currentOmen: VEILGLASS_OMENS[3],
    };
    expect(calculateDistillationProgress(weak, 0)).toBe(3);
  });

  it("applies the selected Remedy Path and records its persistent result", () => {
    const state = preparedState();
    const resolved = resolveDistillationRound(state);
    expect(resolved.phase).toBe("end_of_round");
    expect(resolved.players[0].score).toBe(state.players[0].score + 2);
    expect(resolved.players[0].affliction).toMatchObject({
      totalDistillate: 4,
      lastProgress: 4,
      lastPrestige: 2,
      lastDropletSteps: 0,
    });
  });

  it("converts final-round progress directly into prestige", () => {
    const state = { ...preparedState(), currentRound: 9 };
    const resolved = resolveDistillationRound(state);
    expect(resolved.players[0].score).toBe(state.players[0].score + 4);
    expect(resolved.players[0].affliction?.lastPrestige).toBe(4);
  });

  it("stores delayed Remedy Path movement until the following brew", () => {
    expect(getRemedyReward("embersleep", 5, false)).toEqual({
      prestige: 3,
      droplet: 0,
      nextRoundHeadStart: 2,
    });
    const initial = createInitialStateWithSetup(createGameSetup({ enabledPacks: ["distillers_of_the_veil"] }));
    useGameStore.setState({
      state: {
        ...initial,
        currentRound: 2,
        phase: "omen",
        currentOmen: null,
        players: initial.players.map((player) => ({
          ...player,
          affliction: { ...player.affliction!, pendingHeadStart: 2 },
        })),
      },
    });
    useGameStore.getState().dismissOmen();
    const human = useGameStore.getState().state.players[0];
    expect(human.ratStoneOffset).toBe(2);
    expect(human.crucible.filledUpTo).toBe(human.crucible.dropletPosition + 2);
    expect(human.affliction?.pendingHeadStart).toBe(0);
  });

  it("keeps Ashen Breath and Moonwater Fever on their balanced Remedy curves", () => {
    expect(getRemedyReward("ashen_breath", 1, false).prestige).toBe(0);
    expect(getRemedyReward("ashen_breath", 2, false).prestige).toBe(1);
    expect(getRemedyReward("ashen_breath", 4, false).prestige).toBe(2);
    expect(getRemedyReward("moonwater_fever", 3, false)).toMatchObject({ prestige: 1, nextRoundHeadStart: 1 });
    expect(getRemedyReward("moonwater_fever", 5, false)).toMatchObject({ prestige: 3, nextRoundHeadStart: 1 });
  });

  it("resolves both Veilglass Echo Reed recipes and fixes the result on the token", () => {
    const retortState = createInitialStateWithSetup(createGameSetup({
      enabledPacks: ["distillers_of_the_veil"],
      echoRecipe: "retort_resonance",
    }));
    const retortPlayer = {
      ...retortState.players[0],
      affliction: { ...retortState.players[0].affliction!, lastProgress: 3 },
    };
    const retortPlaced = placeTokenForActiveBooks(retortPlayer, { id: "retort-echo", color: "echo", value: 0 }, retortState);
    const retortResult = retortPlaced.crucible.placements[retortPlaced.crucible.placements.length - 1];
    expect(retortResult?.movement).toBe(3);
    expect(retortResult?.token.resolvedMovement).toBe(3);

    const deepState = createInitialStateWithSetup(createGameSetup({
      enabledPacks: ["distillers_of_the_veil"],
      echoRecipe: "deep_resonance",
    }));
    const deepPlayer = {
      ...deepState.players[0],
      affliction: { ...deepState.players[0].affliction!, totalDistillate: 12 },
    };
    const deepPlaced = placeTokenForActiveBooks(deepPlayer, { id: "deep-echo", color: "echo", value: 0 }, deepState);
    const deepResult = deepPlaced.crucible.placements[deepPlaced.crucible.placements.length - 1];
    expect(deepResult?.movement).toBe(3);
    expect(deepResult?.token.resolvedMovement).toBe(3);
  });

  it("includes Distillation and delayed Remedy rewards in deterministic simulations", () => {
    const results = simulateMatches(4, 8_800_000, 1, 2, "skilled", ["distillers_of_the_veil"]);
    const telemetry = results.flatMap((result) => Object.values(result.distillation));

    expect(telemetry.every((entry) => entry.contractId !== null)).toBe(true);
    expect(telemetry.every((entry) => entry.progress > 0)).toBe(true);
    expect(telemetry.some((entry) => entry.prestige > 0)).toBe(true);
    expect(telemetry.every((entry) => [entry.progress, entry.prestige, entry.dropletSteps, entry.headStart].every(Number.isFinite))).toBe(true);
  });
});

describe("expansion rule hooks", () => {
  it("runs applicable hooks in stable priority and id order", () => {
    const state = createInitialState();
    const order: string[] = [];
    const hook = (id: string, priority: number, applies = true): RuleHook => ({
      id,
      point: "before_scoring",
      priority,
      applies: () => applies,
      run: (current) => {
        order.push(id);
        return current;
      },
    });

    expect(runRuleHooks(state, "before_scoring", [
      hook("late", 20),
      hook("beta", 10),
      hook("alpha", 10),
      hook("disabled", 0, false),
      { ...hook("wrong-point", 0), point: "after_scoring" },
    ])).toBe(state);
    expect(order).toEqual(["alpha", "beta", "late"]);
  });
});
