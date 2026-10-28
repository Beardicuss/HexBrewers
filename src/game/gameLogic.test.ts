import { describe, expect, it } from "vitest";
import type { Player } from "./playerTypes";
import type { Token } from "./tokenTypes";
import { createStartingBag } from "./bagFactory";
import { createCrucible, getPlacedTokens, placeToken } from "./crucible";
import { applyRoundReward, calculateRoundScore } from "./scoring";
import { canUseFlask, useFlask } from "./flask";
import { createMarket } from "./bazaarFactory";
import { purchaseItem } from "./bazaar";
import { applyBlackMultiplayerBonus, applyBlueImmediate, applyEndOfRoundEffects, applyGreenSetFourSpend, applyGreenSetThreeMove, applyPurpleChoice, applyYellowImmediate, applyYellowSetOneBonus, drawBlueBonus, greenSetFourSpendMax, greenSetThreeMoveAmount, greenSetTwoRewards, purpleChoices, redBonusValue } from "./chipEffects";
import { applyBonusDieResult, rollBonusDie } from "./bonusDie";
import { advanceToNextRound } from "../store/gameStoreRound";
import { createInitialState } from "../store/gameStoreHelpers";
import { createRecipeBooks, getRecipeCost, type RecipeColor, type RecipeSet } from "./recipeBooks";
import { decideAIRubyAction, decideBlueKeep, decideBrewingAction, decideGreenRewardChoice, decidePurpleChoice, evaluateBrewingDecision, evaluateMasterLookahead } from "./ai";
import { decideMarketPurchases } from "./aiMarket";
import { buildAIContext, getAIRivalDoctrine, getAIProfile, getRiskTolerance, selectAIMode } from "./aiStrategy";
import { useGameStore } from "../store/gameStore";
import { buildEntry } from "../components/aiOverlayHelpers";
import { formatBonusDieResult } from "../components/bonusDieText";
import { en } from "../i18n/en";
import { ru } from "../i18n/ru";
import { ka } from "../i18n/ka";
import { getLocalizedTokenName } from "../i18n/tokenNames";
import { benchmarkDifficulties, simulateMatch, simulateMatches } from "./balanceSimulation";
import { placeTokenForActiveBooks } from "./brewingRules";
import { applyOmenScoringEffect, applyOmenStartEffect, rubyRewardForResult } from "./omenResolver";
import type { OmenCard } from "./omenTypes";
import { OMEN_DECK } from "./omen";
import { MIREWROUGHT_RULES, RULES, VEILGLASS_RULES } from "../components/grimoire/grimoireData";
import { applyPurpleChoiceStock, legalPurpleChoices } from "./purpleMarket";
import { TOKEN_VISUALS } from "../pixi/tokenVisuals";

function token(id: string, color: Token["color"], value: number): Token {
  return { id, color, value };
}

function player(id: string): Player {
  return {
    id,
    name: id,
    kind: id === "ai" ? "ai" : "human",
    bag: createStartingBag(),
    crucible: createCrucible(),
    rubies: 0,
    coinsThisRound: 0,
    score: 0,
    flask: true,
    ratStoneOffset: 0,
    blueProtectionDraws: 0,
    blueBonusExplosion: false,
  };
}

describe("official renamed rules", () => {
  it("creates a four-player game with one human and three unique AI opponents", () => {
    const state = createInitialState(1, 3);

    expect(state.players).toHaveLength(4);
    expect(state.players.filter((current) => current.kind === "human")).toHaveLength(1);
    expect(state.players.filter((current) => current.kind === "ai")).toHaveLength(3);
    expect(new Set(state.players.map((current) => current.id)).size).toBe(4);
    expect(state.players.map((current) => current.name)).toEqual([
      "Hexbrewer",
      "The Shade",
      "The Wraith",
      "The Seer",
    ]);
    expect(state.players.every((current) => current.rubies === 1)).toBe(true);
  });

  it("clamps games to the supported range of two through four total players", () => {
    expect(createInitialState(1, 0).players).toHaveLength(2);
    expect(createInitialState(1, 99).players).toHaveLength(4);
  });

  it("rejects player actions outside their legal phase", () => {
    useGameStore.setState({ state: createInitialState() });
    const store = useGameStore.getState();
    const before = store.state;
    const ai = before.players.find((current) => current.id === "ai")!;

    expect(store.humanDraw()).toBeNull();
    store.humanStop();
    store.humanUseFlask();
    store.humanBuyItem("m-orange-1");
    store.humanEndMarket();
    store.humanDoneRubySpend();
    store.commitAIBrewsAndResolve([ai]);

    expect(useGameStore.getState().state).toBe(before);
  });

  it("pauses for the human's official Omen choice and removes a value-1 Voidshard", () => {
    const state = createInitialState();
    const omen = OMEN_DECK.find((card) => card.id === "omen-07")!;
    const beforeWhites = state.players[0].bag.tokens.filter((item) => item.color === "white" && item.value === 1).length;
    useGameStore.setState({ state: { ...state, phase: "omen", currentOmen: omen } });

    useGameStore.getState().dismissOmen();
    expect(useGameStore.getState().state.phase).toBe("omen_choice");
    expect(useGameStore.getState().state.pendingOmenChoices?.map((choice) => choice.id)).toContain("omen-remove-white-1");

    useGameStore.getState().humanResolveOmenChoice("omen-remove-white-1");
    const resolved = useGameStore.getState().state;
    const human = resolved.players.find((current) => current.id === "human")!;
    expect(resolved.phase).toBe("brewing");
    expect(human.bag.tokens.filter((item) => item.color === "white" && item.value === 1)).toHaveLength(beforeWhites - 1);
    expect(resolved.omenCompletedPlayerIds).toEqual(expect.arrayContaining(resolved.players.map((current) => current.id)));
  });

  it("resolves the bounty Omen through shared limited market stock", () => {
    const state = createInitialState();
    const omen = OMEN_DECK.find((card) => card.id === "omen-09")!;
    const item = state.market.find((entry) => entry.id === "m-blue-2")!;
    useGameStore.setState({ state: { ...state, phase: "omen", currentOmen: omen } });

    useGameStore.getState().dismissOmen();
    useGameStore.getState().humanResolveOmenChoice(`omen-chip-${item.id}`);
    const resolved = useGameStore.getState().state;
    const human = resolved.players.find((current) => current.id === "human")!;

    expect(human.bag.tokens.some((entry) => entry.color === "blue" && entry.value === 2)).toBe(true);
    expect(resolved.market.find((entry) => entry.id === item.id)?.stock).toBe(item.stock - 1);
  });

  it("trades exactly one ruby for a legal value-1 ingredient on Omen 4", () => {
    const state = createInitialState();
    const omen = OMEN_DECK.find((card) => card.id === "omen-04")!;
    const item = state.market.find((entry) => entry.id === "m-blue-1")!;
    useGameStore.setState({ state: { ...state, phase: "omen", currentOmen: omen } });

    useGameStore.getState().dismissOmen();
    const choiceIds = useGameStore.getState().state.pendingOmenChoices?.map((choice) => choice.id);
    expect(choiceIds).toContain(`omen-trade-${item.id}`);
    expect(choiceIds?.some((id) => id.includes("purple") || id.includes("black"))).toBe(false);
    useGameStore.getState().humanResolveOmenChoice(`omen-trade-${item.id}`);

    const resolved = useGameStore.getState().state;
    const human = resolved.players.find((current) => current.id === "human")!;
    expect(human.rubies).toBe(0);
    expect(human.bag.tokens.some((entry) => entry.color === "blue" && entry.value === 1)).toBe(true);
    expect(resolved.market.find((entry) => entry.id === item.id)?.stock).toBe(item.stock - resolved.players.length);
  });

  it("allows a player to keep their ruby on Omen 4", () => {
    const state = createInitialState();
    const omen = OMEN_DECK.find((card) => card.id === "omen-04")!;
    useGameStore.setState({ state: { ...state, phase: "omen", currentOmen: omen } });

    useGameStore.getState().dismissOmen();
    useGameStore.getState().humanResolveOmenChoice("omen-keep-ruby");

    expect(useGameStore.getState().state.players[0].rubies).toBe(1);
    expect(useGameStore.getState().state.phase).toBe("brewing");
  });

  it("exchanges one to three rat tails for the same number of rubies on Omen 2", () => {
    const state = createInitialState();
    const omen = OMEN_DECK.find((card) => card.id === "omen-02")!;
    const players = state.players.map((current) => ({
      ...current,
      score: current.id === "human" ? 0 : 50,
    }));
    useGameStore.setState({ state: { ...state, players, currentRound: 2, phase: "omen", currentOmen: omen } });

    useGameStore.getState().dismissOmen();
    const before = useGameStore.getState().state.players.find((current) => current.id === "human")!;
    expect(before.ratStoneOffset).toBeGreaterThanOrEqual(3);
    expect(useGameStore.getState().state.pendingOmenChoices?.map((choice) => choice.id)).toEqual([
      "omen-keep-rat-tails",
      "omen-trade-rat-tails-1",
      "omen-trade-rat-tails-2",
      "omen-trade-rat-tails-3",
    ]);

    useGameStore.getState().humanResolveOmenChoice("omen-trade-rat-tails-2");
    const human = useGameStore.getState().state.players.find((current) => current.id === "human")!;
    expect(human.rubies).toBe(before.rubies + 2);
    expect(human.ratStoneOffset).toBe(before.ratStoneOffset - 2);
    expect(human.crucible.filledUpTo).toBe(before.crucible.filledUpTo - 2);
  });

  it("does not pause Omen 2 for a leader with no rat tails", () => {
    const state = createInitialState();
    const omen = OMEN_DECK.find((card) => card.id === "omen-02")!;
    useGameStore.setState({ state: { ...state, currentRound: 2, phase: "omen", currentOmen: omen } });

    useGameStore.getState().dismissOmen();
    expect(useGameStore.getState().state.phase).toBe("brewing");
  });

  it("offers a value-4 ingredient or prestige equal to rat tails on Omen 11", () => {
    const state = createInitialState();
    const omen = OMEN_DECK.find((card) => card.id === "omen-11")!;
    const players = state.players.map((current) => ({
      ...current,
      score: current.id === "human" ? 0 : 50,
    }));
    useGameStore.setState({ state: { ...state, players, currentRound: 2, phase: "omen", currentOmen: omen } });

    useGameStore.getState().dismissOmen();
    const pending = useGameStore.getState().state.pendingOmenChoices!;
    const humanBefore = useGameStore.getState().state.players.find((current) => current.id === "human")!;
    const prestige = pending.find((choice) => choice.id === "omen-rat-prestige");
    expect(prestige).toEqual({ id: "omen-rat-prestige", kind: "gain_vp", amount: humanBefore.ratStoneOffset });
    expect(pending.some((choice) => choice.kind === "gain_market_chip" && choice.value === 4)).toBe(true);

    useGameStore.getState().humanResolveOmenChoice("omen-rat-prestige");
    const human = useGameStore.getState().state.players.find((current) => current.id === "human")!;
    expect(human.score).toBe(humanBefore.score + humanBefore.ratStoneOffset);
    expect(human.ratStoneOffset).toBe(humanBefore.ratStoneOffset);
  });

  it("samples five chips without removing them and rewards the lowest total on Omen 5", () => {
    const state = createInitialState(1, 2);
    const omen = OMEN_DECK.find((card) => card.id === "omen-05")!;
    const players = state.players.map((current, playerIndex) => ({
      ...current,
      bag: {
        tokens: Array.from({ length: 5 }, (_, index) =>
          token(`sample-${playerIndex}-${index}`, playerIndex === 0 ? "orange" : "white", playerIndex === 0 ? 1 : 3)
        ),
      },
    }));
    const blueBefore = state.market.find((entry) => entry.id === "m-blue-2")!.stock;
    useGameStore.setState({ state: { ...state, players, phase: "omen", currentOmen: omen } });

    useGameStore.getState().dismissOmen();
    const resolved = useGameStore.getState().state;
    const human = resolved.players[0];

    expect(resolved.phase).toBe("brewing");
    expect(human.bag.tokens).toHaveLength(6);
    expect(human.bag.tokens.some((entry) => entry.color === "blue" && entry.value === 2)).toBe(true);
    expect(resolved.players.slice(1).map((current) => current.rubies)).toEqual([2, 2]);
    expect(resolved.market.find((entry) => entry.id === "m-blue-2")?.stock).toBe(blueBefore - 1);
  });

  it("awards Frostbile 2 to every tied lowest sampler while stock remains", () => {
    const state = createInitialState(1, 2);
    const omen = OMEN_DECK.find((card) => card.id === "omen-05")!;
    const players = state.players.map((current, playerIndex) => ({
      ...current,
      bag: {
        tokens: Array.from({ length: 5 }, (_, index) => token(`tie-${playerIndex}-${index}`, "orange", 1)),
      },
    }));
    const blueBefore = state.market.find((entry) => entry.id === "m-blue-2")!.stock;
    useGameStore.setState({ state: { ...state, players, phase: "omen", currentOmen: omen } });

    useGameStore.getState().dismissOmen();
    const resolved = useGameStore.getState().state;
    expect(resolved.players.every((current) => current.bag.tokens.some((entry) => entry.color === "blue" && entry.value === 2))).toBe(true);
    expect(resolved.market.find((entry) => entry.id === "m-blue-2")?.stock).toBe(blueBefore - 3);
  });

  it("awards the left neighbor a chosen value-2 ingredient when a brewer explodes on Omen 21", () => {
    const state = createInitialState();
    const omen = OMEN_DECK.find((card) => card.id === "omen-21")!;
    let ai = state.players.find((current) => current.id === "ai")!;
    ai = { ...ai, crucible: placeToken(ai.crucible, token("malice-white-5", "white", 5)) };
    ai = { ...ai, crucible: placeToken(ai.crucible, token("malice-white-3", "white", 3)) };
    const blueBefore = state.market.find((entry) => entry.id === "m-blue-2")!.stock;
    useGameStore.setState({
      state: {
        ...state,
        phase: "end_of_round",
        currentOmen: omen,
        players: state.players.map((current) => current.id === ai.id ? ai : current),
      },
    });

    useGameStore.getState().commitAIBrewsAndResolve([ai]);
    expect(useGameStore.getState().state.phase).toBe("omen_choice");
    expect(useGameStore.getState().state.pendingOmenChoices?.some((choice) => choice.id === "omen-chip-m-blue-2")).toBe(true);
    useGameStore.getState().humanResolveOmenChoice("omen-chip-m-blue-2");

    const resolved = useGameStore.getState().state;
    const human = resolved.players.find((current) => current.id === "human")!;
    expect(human.bag.tokens.some((entry) => entry.color === "blue" && entry.value === 2)).toBe(true);
    expect(resolved.market.find((entry) => entry.id === "m-blue-2")?.stock).toBe(blueBefore - 1);
    expect(resolved.phase).toBe("market");
  });

  it("samples up to five chips after stopping and places one without its ingredient action on Omen 16", () => {
    const state = createInitialState();
    const omen = OMEN_DECK.find((card) => card.id === "omen-16")!;
    const sample = [
      token("strong-blue", "blue", 2),
      token("strong-orange", "orange", 1),
      token("strong-white", "white", 1),
      token("strong-green", "green", 1),
      token("strong-red", "red", 1),
    ];
    useGameStore.setState({
      state: {
        ...state,
        phase: "brewing",
        currentOmen: omen,
        players: state.players.map((current) => current.id === "human"
          ? { ...current, bag: { tokens: sample } }
          : current),
      },
    });

    useGameStore.getState().humanStop();
    expect(useGameStore.getState().state.phase).toBe("omen_strong_choice");
    expect(useGameStore.getState().state.pendingOmenSampleTokens).toHaveLength(5);
    useGameStore.getState().humanResolveStrongIngredient("strong-blue");

    const resolved = useGameStore.getState().state;
    const human = resolved.players.find((current) => current.id === "human")!;
    expect(resolved.phase).toBe("end_of_round");
    expect(human.bag.tokens).toHaveLength(4);
    expect(getPlacedTokens(human.crucible).map((placed) => placed.id)).toEqual(["strong-blue"]);
    expect(resolved.pendingBlueTokens).toBeUndefined();
  });

  it("lets a player return every sampled chip on Omen 16", () => {
    const state = createInitialState();
    const omen = OMEN_DECK.find((card) => card.id === "omen-16")!;
    const originalBag = state.players[0].bag.tokens;
    useGameStore.setState({ state: { ...state, phase: "brewing", currentOmen: omen } });

    useGameStore.getState().humanStop();
    useGameStore.getState().humanResolveStrongIngredient(null);
    const human = useGameStore.getState().state.players[0];

    expect(human.bag.tokens).toHaveLength(originalBag.length);
    expect(getPlacedTokens(human.crucible)).toHaveLength(0);
  });

  it("upgrades one of four sampled chips and returns the traded chip to supply on Omen 6", () => {
    const state = createInitialState();
    const omen = OMEN_DECK.find((card) => card.id === "omen-06")!;
    const players = state.players.map((current) => ({
      ...current,
      bag: {
        tokens: Array.from({ length: 4 }, (_, index) => current.id === "human"
          ? token(`upgrade-green-${index}`, "green", 1)
          : token(`fallback-orange-${index}`, "orange", 1)),
      },
    }));
    const greenTwoBefore = state.market.find((entry) => entry.id === "m-green-2")!.stock;
    useGameStore.setState({ state: { ...state, players, phase: "omen", currentOmen: omen } });

    useGameStore.getState().dismissOmen();
    const pending = useGameStore.getState().state.pendingOmenChoices!;
    const upgrade = pending.find((choice) => choice.kind === "upgrade_sampled_chip")!;
    expect(useGameStore.getState().state.phase).toBe("omen_choice");
    useGameStore.getState().humanResolveOmenChoice(upgrade.id);

    const resolved = useGameStore.getState().state;
    const human = resolved.players.find((current) => current.id === "human")!;
    expect(resolved.phase).toBe("brewing");
    expect(human.bag.tokens.filter((entry) => entry.color === "green" && entry.value === 1)).toHaveLength(3);
    expect(human.bag.tokens.filter((entry) => entry.color === "green" && entry.value === 2)).toHaveLength(1);
    expect(resolved.market.find((entry) => entry.id === "m-green-2")?.stock).toBe(greenTwoBefore - 1);
  });

  it("grants Deathweave 1 when no sampled chip can be upgraded on Omen 6", () => {
    const state = createInitialState();
    const omen = OMEN_DECK.find((card) => card.id === "omen-06")!;
    const players = state.players.map((current, playerIndex) => ({
      ...current,
      bag: { tokens: Array.from({ length: 4 }, (_, index) => token(`no-upgrade-${playerIndex}-${index}`, "orange", 1)) },
    }));
    useGameStore.setState({ state: { ...state, players, phase: "omen", currentOmen: omen } });

    useGameStore.getState().dismissOmen();
    const human = useGameStore.getState().state.players.find((current) => current.id === "human")!;
    expect(useGameStore.getState().state.phase).toBe("brewing");
    expect(human.bag.tokens).toHaveLength(5);
    expect(human.bag.tokens.some((entry) => entry.color === "green" && entry.value === 1)).toBe(true);
  });

  it("offers one restart after the fifth placed chip and preserves the spent flask on Omen 17", () => {
    const state = createInitialState();
    const omen = OMEN_DECK.find((card) => card.id === "omen-17")!;
    const crucible = { ...createCrucible(), dropletPosition: 1, filledUpTo: 3 };
    const bag = { tokens: Array.from({ length: 5 }, (_, index) => token(`restart-${index}`, "orange", 1)) };
    useGameStore.setState({
      state: {
        ...state,
        phase: "brewing",
        currentOmen: omen,
        players: state.players.map((current) => current.id === "human"
          ? { ...current, bag, crucible, ratStoneOffset: 2, flask: false }
          : current),
      },
    });

    for (let draw = 0; draw < 5; draw += 1) useGameStore.getState().humanDraw();
    expect(useGameStore.getState().state.phase).toBe("omen_restart_choice");
    useGameStore.getState().humanResolveOmenRestart("restart");

    const human = useGameStore.getState().state.players.find((current) => current.id === "human")!;
    expect(useGameStore.getState().state.phase).toBe("brewing");
    expect(human.bag.tokens).toHaveLength(5);
    expect(getPlacedTokens(human.crucible)).toHaveLength(0);
    expect(human.crucible.filledUpTo).toBe(3);
    expect(human.flask).toBe(false);
    expect(human.omenSecondChanceUsed).toBe(true);
  });

  it("offers the Omen 17 decision only once when the player continues", () => {
    const state = createInitialState();
    const omen = OMEN_DECK.find((card) => card.id === "omen-17")!;
    const bag = { tokens: Array.from({ length: 6 }, (_, index) => token(`continue-${index}`, "orange", 1)) };
    useGameStore.setState({
      state: {
        ...state,
        phase: "brewing",
        currentOmen: omen,
        players: state.players.map((current) => current.id === "human" ? { ...current, bag } : current),
      },
    });

    for (let draw = 0; draw < 5; draw += 1) useGameStore.getState().humanDraw();
    useGameStore.getState().humanResolveOmenRestart("continue");
    useGameStore.getState().humanDraw();

    const resolved = useGameStore.getState().state;
    expect(resolved.phase).toBe("brewing");
    expect(getPlacedTokens(resolved.players[0].crucible)).toHaveLength(6);
    expect(resolved.players[0].omenSecondChanceUsed).toBe(true);
  });

  it("offers droplet movement when Wraithbloom is not yet unlocked", () => {
    const state = createInitialState();
    const omen = OMEN_DECK.find((card) => card.id === "omen-13")!;
    useGameStore.setState({ state: { ...state, phase: "omen", currentOmen: omen } });

    useGameStore.getState().dismissOmen();
    expect(useGameStore.getState().state.pendingOmenChoices?.map((choice) => choice.id)).toEqual(["omen-droplet-2"]);
    useGameStore.getState().humanResolveOmenChoice("omen-droplet-2");

    expect(useGameStore.getState().state.players[0].crucible.dropletPosition).toBe(2);
  });

  it("awards all tied lowest-prestige players for Omen 8", () => {
    const state = createInitialState(1, 2);
    const omen = OMEN_DECK.find((card) => card.id === "omen-08")!;
    const players = state.players.map((current, index) => ({ ...current, score: index < 2 ? 3 : 7 }));
    const greenCounts = players.map((current) => current.bag.tokens.filter((item) => item.color === "green" && item.value === 1).length);
    useGameStore.setState({ state: { ...state, players, phase: "omen", currentOmen: omen } });

    useGameStore.getState().dismissOmen();
    const resolved = useGameStore.getState().state;
    expect(resolved.players.slice(0, 2).every((current, index) => current.bag.tokens.filter((item) => item.color === "green" && item.value === 1).length === greenCounts[index] + 1)).toBe(true);
    expect(resolved.players[2].bag.tokens.filter((item) => item.color === "green" && item.value === 1)).toHaveLength(greenCounts[2]);
  });

  it("awards every player tied for fewest rubies for Omen 12", () => {
    const state = createInitialState(1, 2);
    const omen = OMEN_DECK.find((card) => card.id === "omen-12")!;
    const players = state.players.map((current, index) => ({ ...current, rubies: index < 2 ? 0 : 2 }));
    useGameStore.setState({ state: { ...state, players, phase: "omen", currentOmen: omen } });

    useGameStore.getState().dismissOmen();
    expect(useGameStore.getState().state.players.map((current) => current.rubies)).toEqual([1, 1, 2]);
  });

  it("maps implemented passive Omens to their official card positions", () => {
    const typeAt = (id: string) => OMEN_DECK.find((card) => card.id === id)?.effect.type;
    expect(typeAt("omen-10")).toBe("double_rat_tails");
    expect(typeAt("omen-14")).toBe("double_ruby_space");
    expect(typeAt("omen-15")).toBe("return_first_white");
    expect(typeAt("omen-20")).toBe("refill_flask");
    expect(typeAt("omen-22")).toBe("orange_extra_movement");
    expect(typeAt("omen-23")).toBe("ruby_space_bonus_vp");
    expect(typeAt("omen-24")).toBe("bonus_die_rolls");
  });

  it("locks all 24 Omen positions to the authoritative mechanical deck", () => {
    const expectedEffects: OmenCard["effect"][] = [
      { type: "roll_bonus_die" },
      { type: "choice_rat_tails_for_rubies" },
      { type: "advance_droplet", amount: 1 },
      { type: "choice_ruby_for_one" },
      { type: "sample_five_lowest" },
      { type: "sample_four_upgrade" },
      { type: "choice_beginner_boost" },
      { type: "fewest_vp_gain_chip", color: "green", value: 1 },
      { type: "choice_bounty" },
      { type: "double_rat_tails" },
      { type: "choice_rat_reward" },
      { type: "fewest_rubies_gain_ruby", amount: 1 },
      { type: "choice_droplet_or_purple" },
      { type: "double_ruby_space" },
      { type: "return_first_white" },
      { type: "strong_ingredient" },
      { type: "second_chance" },
      { type: "exact_white_seven_droplet" },
      { type: "round_explosion_threshold", threshold: 9 },
      { type: "refill_flask" },
      { type: "explosion_left_neighbor_chip" },
      { type: "orange_extra_movement", amount: 1 },
      { type: "ruby_space_bonus_vp", amount: 2 },
      { type: "bonus_die_rolls", rolls: 2 },
    ];

    expect(OMEN_DECK).toHaveLength(24);
    expect(OMEN_DECK.map((card) => card.id)).toEqual(
      Array.from({ length: 24 }, (_, index) => `omen-${String(index + 1).padStart(2, "0")}`),
    );
    expect(OMEN_DECK.map((card) => card.effect)).toEqual(expectedEffects);
  });

  it("renders AI narration from translation keys", () => {
    const entry = buildEntry({ type: "thinking", messageKey: "start1" }, en.aiOverlay);
    expect(entry?.message).toBe(en.aiOverlay.messages.start1);
  });

  it("renders bonus-die rewards from translations", () => {
    expect(formatBonusDieResult({ type: "vp", amount: 2 }, en.bonusDieRewards)).toBe("+2 Prestige");
  });

  it("localizes ingredient names used by gameplay overlays", () => {
    expect(getLocalizedTokenName("blue", en)).toBe("Frostbile");
    expect(getLocalizedTokenName("blue", ru)).toBe("Морозная Желчь");
    expect(getLocalizedTokenName("blue", ka)).toBe("ყინვის ნაღველი");
  });

  it("documents every live Omen card in all three languages using exact deck IDs", () => {
    for (const locale of [en, ru, ka]) {
      for (const omen of OMEN_DECK) {
        const localized = locale.omenCards[omen.id];
        expect(localized?.title).toBeTruthy();
        expect(localized?.summary).toBeTruthy();
      }
    }
    expect(Object.keys(en.omenCards).filter((id) => /^omen-\d{2}$/.test(id))).toHaveLength(24);
  });

  it("documents all six recipe sets for every variable ingredient in all languages", () => {
    const variableIngredients = ["Frostbile", "Bloodthorn", "Plaguedust", "Deathweave", "Wraithbloom"];

    for (const locale of [en, ru, ka]) {
      for (const ingredient of variableIngredients) {
        const recipes = locale.grimoireRecipeSets[ingredient];
        expect(recipes).toHaveLength(6);
        expect(recipes.every((recipe) => recipe.effect.trim() && recipe.costs.trim())).toBe(true);
      }
    }
  });

  it("matches the complete official ingredient-book cost matrix", () => {
    const expected: Record<RecipeColor, Record<RecipeSet, Record<number, number>>> = {
      blue: { 1: { 1: 5, 2: 10, 4: 19 }, 2: { 1: 5, 2: 10, 4: 19 }, 3: { 1: 4, 2: 8, 4: 14 }, 4: { 1: 5, 2: 10, 4: 20 }, 5: { 1: 5, 2: 9, 4: 17 }, 6: { 1: 6, 2: 11, 4: 18 } },
      red: { 1: { 1: 6, 2: 10, 4: 16 }, 2: { 1: 4, 2: 8, 4: 14 }, 3: { 1: 5, 2: 9, 4: 15 }, 4: { 1: 7, 2: 11, 4: 17 }, 5: { 1: 6, 2: 10, 4: 16 }, 6: { 1: 5, 2: 9, 4: 15 } },
      yellow: { 1: { 1: 8, 2: 12, 4: 18 }, 2: { 1: 9, 2: 13, 4: 19 }, 3: { 1: 8, 2: 12, 4: 18 }, 4: { 1: 8, 2: 12, 4: 18 }, 5: { 1: 8, 2: 12, 4: 18 }, 6: { 1: 9, 2: 13, 4: 19 } },
      green: { 1: { 1: 4, 2: 8, 4: 14 }, 2: { 1: 6, 2: 11, 4: 18 }, 3: { 1: 6, 2: 11, 4: 21 }, 4: { 1: 4, 2: 8, 4: 14 }, 5: { 1: 5, 2: 9, 4: 15 }, 6: { 1: 6, 2: 10, 4: 16 } },
      purple: { 1: { 1: 8 }, 2: { 1: 12 }, 3: { 1: 10 }, 4: { 1: 11 }, 5: { 1: 10 }, 6: { 1: 12 } },
    };

    for (const color of Object.keys(expected) as RecipeColor[]) {
      for (const set of [1, 2, 3, 4, 5, 6] as RecipeSet[]) {
        const books = createRecipeBooks(set);
        for (const [value, cost] of Object.entries(expected[color][set])) {
          expect(getRecipeCost(color, Number(value), books)).toBe(cost);
        }
      }
    }
  });

  describe("Mirewrought recipe books", () => {
    const withPlaced = (tokens: Token[]): Player => ({
      ...player("human"),
      crucible: tokens.reduce(
        (crucible, current) => placeToken(crucible, current, Math.max(1, current.value), 99),
        createCrucible(),
      ),
    });

    it("gives Bloodthorn set 5 a capped diversity bonus and set 6 an Echo Reed bonus", () => {
      const diverse = withPlaced([
        token("orange", "orange", 1), token("green", "green", 1),
        token("blue", "blue", 1), token("purple", "purple", 1),
      ]);
      const echoes = withPlaced([
        token("echo-1", "echo", 0), token("echo-2", "echo", 0), token("echo-3", "echo", 0),
      ]);

      expect(redBonusValue(diverse.crucible, createRecipeBooks(5))).toBe(1);
      expect(redBonusValue(echoes.crucible, createRecipeBooks(6))).toBe(3);
    });

    it("rewards Frostbile set 5 at low pressure and set 6 at exactly seven pressure", () => {
      const lowPressure = { ...withPlaced([token("white-2", "white", 2)]), rubies: 0 };
      const exactSeven = withPlaced([
        token("white-3a", "white", 3), token("white-3b", "white", 3), token("white-1", "white", 1),
      ]);

      expect(applyBlueImmediate(lowPressure, token("blue-5", "blue", 2), createRecipeBooks(5)).rubies).toBe(1);
      expect(applyBlueImmediate(exactSeven, token("blue-6", "blue", 4), createRecipeBooks(6)).score).toBe(4);
      const pressureSix = withPlaced([token("white-six-a", "white", 3), token("white-six-b", "white", 3)]);
      expect(applyBlueImmediate(pressureSix, token("blue-6-at-six", "blue", 2), createRecipeBooks(6)).score).toBe(2);
    });

    it("rewards Plaguedust set 5 and set 6 only when following a Voidshard", () => {
      const base = player("human");
      const previous = token("previous-white", "white", 2);

      expect(applyYellowImmediate(base, previous, createRecipeBooks(5)).rubies).toBe(1);
      expect(applyYellowImmediate(base, previous, createRecipeBooks(6)).crucible.dropletPosition).toBe(1);
      expect(applyYellowImmediate(base, token("previous-orange", "orange", 1), createRecipeBooks(6)).crucible.dropletPosition).toBe(0);
    });

    it("scores Deathweave set 5 and advances the droplet with set 6 for final green tokens", () => {
      const pot = withPlaced([
        token("orange-first", "orange", 1), token("green-one", "green", 1), token("green-two", "green", 2),
      ]);

      expect(applyEndOfRoundEffects(pot, undefined, createRecipeBooks(5)).score).toBe(2);
      expect(applyEndOfRoundEffects(pot, undefined, createRecipeBooks(6)).crucible.dropletPosition).toBe(2);
    });

    it("scores Wraithbloom set 5 for diversity and set 6 for paired blooms plus rubies", () => {
      const diverse = withPlaced([
        token("purple-diverse", "purple", 1), token("orange-diverse", "orange", 1),
        token("green-diverse", "green", 1), token("blue-diverse", "blue", 1), token("red-diverse", "red", 1),
      ]);
      const paired = withPlaced([token("purple-one", "purple", 1), token("purple-two", "purple", 1)]);
      const single = withPlaced([token("purple-single", "purple", 1)]);

      expect(applyEndOfRoundEffects(diverse, undefined, createRecipeBooks(5)).score).toBe(4);
      expect(applyEndOfRoundEffects(single, undefined, createRecipeBooks(6))).toMatchObject({ score: 1, rubies: 1 });
      expect(applyEndOfRoundEffects(paired, undefined, createRecipeBooks(6))).toMatchObject({ score: 2, rubies: 2 });
      expect(purpleChoices(diverse, createRecipeBooks(5))).toEqual([]);
      expect(purpleChoices(paired, createRecipeBooks(6))).toEqual([]);
    });

    it("reports effect-level telemetry from deterministic Mirewrought matches", () => {
      const results = simulateMatches(20, 6_600_000, 5, 2, "skilled", ["covenants_of_the_mire"]);
      const effects = results.flatMap((result) => Object.values(result.recipeEffects).flatMap((byColor) => Object.values(byColor)));

      expect(effects.reduce((sum, effect) => sum + effect.draws, 0)).toBeGreaterThan(0);
      expect(effects.reduce((sum, effect) => sum + effect.activations, 0)).toBeGreaterThan(0);
      expect(effects.every((effect) => [effect.movement, effect.score, effect.rubies, effect.dropletSteps].every(Number.isFinite))).toBe(true);
    });
  });

  it("documents Shadowmoss multiplayer neighbor scoring", () => {
    expect(en.grimoireIngredientsData.Shadowmoss.effect).toContain("3–4 players");
    expect(en.grimoireIngredientsData.Shadowmoss.effect).not.toContain("The Shade");
  });

  it("localizes every visible Grimoire rules section without empty fallback text", () => {
    const allRules = [...RULES, ...MIREWROUGHT_RULES, ...VEILGLASS_RULES];
    expect(new Set(allRules.map((rule) => rule.title)).size).toBe(allRules.length);
    for (const locale of [en, ru, ka]) {
      for (const rule of allRules) {
        const localized = locale.grimoireRulesData[rule.title];
        expect(localized?.title.trim()).toBeTruthy();
        expect(localized?.content.length).toBe(rule.content.length);
        expect(localized?.content.every((line) => line.trim())).toBe(true);
      }
    }
  });

  it("gives every ingredient a unique color-independent symbol", () => {
    const symbols = Object.values(TOKEN_VISUALS).map((visual) => visual.symbol);
    expect(new Set(symbols).size).toBe(symbols.length);
    expect(symbols.every((symbol) => symbol.trim().length > 0)).toBe(true);
  });

  it("keeps every localized dictionary structurally complete and non-empty", () => {
    const leafPaths = (value: unknown, prefix = ""): Array<[string, string]> => {
      if (typeof value === "string") return [[prefix, value]];
      if (Array.isArray(value)) return value.flatMap((entry, index) => leafPaths(entry, `${prefix}[${index}]`));
      if (value && typeof value === "object") {
        return Object.entries(value).flatMap(([key, entry]) => leafPaths(entry, prefix ? `${prefix}.${key}` : key));
      }
      return [];
    };
    const dictionaries = [en, ru, ka];
    // Locale-specific chronicle arrays may intentionally have different lengths,
    // and Omen lore is optional so untranslated locales can omit it cleanly.
    const isRequiredPath = (path: string) =>
      !/^dlc\.(mire|veil)\.(features|story)\[\d+\]$/.test(path)
      && !/^omenCards\.[^.]+\.description$/.test(path);
    const englishPaths = leafPaths(en).map(([path]) => path).filter(isRequiredPath).sort();

    for (const dictionary of dictionaries) {
      const leaves = leafPaths(dictionary);
      expect(leaves.map(([path]) => path).filter(isRequiredPath).sort()).toEqual(englishPaths);
      expect(leaves.every(([, value]) => value.trim().length > 0)).toBe(true);
    }

    for (const dictionary of [ru, ka]) {
      const localized = new Map(leafPaths(dictionary));
      const coreEnglish = leafPaths(en).filter(([path]) => /^(menu|game|player|brewing|choices|roundSummary)\./.test(path));
      const translatedCount = coreEnglish.filter(([path, value]) => localized.get(path) !== value).length;
      expect(translatedCount / coreEnglish.length).toBeGreaterThan(0.9);
    }
  });

  it("replays a nine-round simulation exactly from the same seed", () => {
    expect(simulateMatch(424242, 1)).toEqual(simulateMatch(424242, 1));
  });

  it.each([3, 4] as const)("replays a seeded %s-player match deterministically", (playerCount) => {
    expect(simulateMatch(525252, 2, playerCount)).toEqual(simulateMatch(525252, 2, playerCount));
  });

  it("replays a five-player Mirewrought match deterministically", () => {
    const packs = ["covenants_of_the_mire"] as const;
    expect(simulateMatch(535353, 5, 5, "skilled", [...packs]))
      .toEqual(simulateMatch(535353, 5, 5, "skilled", [...packs]));
  });

  it.each([2, 3, 4] as const)("completes all recipe sets with %s players and valid shared state", (playerCount) => {
    for (const set of [1, 2, 3, 4] as const) {
      const result = simulateMatch(playerCount * 10_000 + set, set, playerCount);
      const playerIds = ["human", "ai", ...(playerCount >= 3 ? ["ai-2"] : []), ...(playerCount >= 4 ? ["ai-3"] : [])];

      expect(Object.keys(result.scores).sort()).toEqual([...playerIds].sort());
      expect(Object.keys(result.explosions).sort()).toEqual([...playerIds].sort());
      expect(Object.keys(result.purchases).sort()).toEqual([...playerIds].sort());
      expect(result.economyValid).toBe(true);
      expect(result.tokenFlowValid).toBe(true);
      expect(result.winnerIds.length).toBeGreaterThan(0);
      expect(result.winnerIds.every((id) => playerIds.includes(id))).toBe(true);
    }
  });

  it.each([5, 6] as const)("completes Mirewrought recipe set %s at two and five players", (set) => {
    for (const playerCount of [2, 5] as const) {
      const result = simulateMatch(60_000 + set * 10 + playerCount, set, playerCount, "skilled", ["covenants_of_the_mire"]);
      const playerIds = ["human", "ai", ...(playerCount === 5 ? ["ai-2", "ai-3", "ai-4"] : [])];

      expect(Object.keys(result.scores).sort()).toEqual([...playerIds].sort());
      expect(result.economyValid).toBe(true);
      expect(result.tokenFlowValid).toBe(true);
      expect(result.winnerIds.length).toBeGreaterThan(0);
      expect(result.winnerIds.every((id) => playerIds.includes(id))).toBe(true);
    }
  });

  it.each([2, 3, 4] as const)("resets every transient decision queue when a %s-player round advances", (playerCount) => {
    const state = createInitialState(4, playerCount - 1);
    const pending = token("stale-pending", "orange", 1);
    const advanced = advanceToNextRound({
      ...state,
      phase: "ruby_spend",
      pendingBlueTokens: [pending],
      pendingYellowPreviousToken: pending,
      pendingMovementChoice: { amount: 1, source: "yellow" },
      pendingRedTokens: [pending],
      pendingPurpleChoices: [{ id: "skip", label: "skip", kind: "skip" }],
      pendingPurpleAIPlayerIds: state.players.filter((p) => p.kind === "ai").map((p) => p.id),
      pendingGreenRewards: [{ sourceTokenId: "green", sourceValue: 1, options: [{ color: "orange", value: 1 }] }],
      pendingGreenAIPlayerIds: state.players.filter((p) => p.kind === "ai").map((p) => p.id),
      pendingGreenSpendMax: 3,
      pendingGreenMoveAmount: 2,
      pendingOmenChoices: [{ id: "omen-skip", kind: "skip" }],
      pendingOmenSampleTokens: [pending],
      pendingOmenRewardPlayerIds: ["human"],
      pendingOmenUpgradePlayerIds: ["human"],
      phaseAfterOmenChoice: "market",
      phaseAfterGreenChoice: "market",
    });

    expect(advanced.currentRound).toBe(2);
    expect(advanced.phase).toBe("omen");
    expect(advanced.activePlayerIndex).toBe(1);
    expect({
      pendingBlueTokens: advanced.pendingBlueTokens,
      pendingYellowPreviousToken: advanced.pendingYellowPreviousToken,
      pendingMovementChoice: advanced.pendingMovementChoice,
      pendingRedTokens: advanced.pendingRedTokens,
      pendingPurpleChoices: advanced.pendingPurpleChoices,
      pendingPurpleAIPlayerIds: advanced.pendingPurpleAIPlayerIds,
      pendingGreenRewards: advanced.pendingGreenRewards,
      pendingGreenAIPlayerIds: advanced.pendingGreenAIPlayerIds,
      pendingGreenSpendMax: advanced.pendingGreenSpendMax,
      pendingGreenMoveAmount: advanced.pendingGreenMoveAmount,
      pendingOmenChoices: advanced.pendingOmenChoices,
      pendingOmenSampleTokens: advanced.pendingOmenSampleTokens,
      pendingOmenRewardPlayerIds: advanced.pendingOmenRewardPlayerIds,
      pendingOmenUpgradePlayerIds: advanced.pendingOmenUpgradePlayerIds,
      phaseAfterOmenChoice: advanced.phaseAfterOmenChoice,
      phaseAfterGreenChoice: advanced.phaseAfterGreenChoice,
    }).toEqual({
      pendingBlueTokens: undefined,
      pendingYellowPreviousToken: undefined,
      pendingMovementChoice: undefined,
      pendingRedTokens: undefined,
      pendingPurpleChoices: undefined,
      pendingPurpleAIPlayerIds: undefined,
      pendingGreenRewards: undefined,
      pendingGreenAIPlayerIds: undefined,
      pendingGreenSpendMax: undefined,
      pendingGreenMoveAmount: undefined,
      pendingOmenChoices: undefined,
      pendingOmenSampleTokens: undefined,
      pendingOmenRewardPlayerIds: undefined,
      pendingOmenUpgradePlayerIds: undefined,
      phaseAfterOmenChoice: undefined,
      phaseAfterGreenChoice: undefined,
    });
  });

  it("uses one brewing resolver for deferred and automatic yellow recovery", () => {
    const state = createInitialState(1);
    const white = token("shared-white", "white", 2);
    const yellow = token("shared-yellow", "yellow", 1);
    const withWhite = { ...player("human"), crucible: placeToken(player("human").crucible, white) };

    const deferred = placeTokenForActiveBooks(withWhite, yellow, state, { deferYellowChoice: true });
    const automatic = placeTokenForActiveBooks(withWhite, yellow, state);

    expect(getPlacedTokens(deferred.crucible).map((placed) => placed.id)).toContain(white.id);
    expect(getPlacedTokens(automatic.crucible).map((placed) => placed.id)).not.toContain(white.id);
    expect(automatic.bag.tokens.map((bagToken) => bagToken.id)).toContain(white.id);
  });

  it("routes recipe-set two red chips into the shared reserve", () => {
    const state = createInitialState(2);
    const red = token("shared-red", "red", 2);
    const resolved = placeTokenForActiveBooks(player("human"), red, state);

    expect(resolved.redReserve?.map((reserved) => reserved.id)).toEqual([red.id]);
    expect(getPlacedTokens(resolved.crucible)).toHaveLength(0);
  });

  it("does not count a blue-protected next draw as AI explosion risk", () => {
    const state = createInitialState(2);
    let ai = player("ai");
    ai = {
      ...ai,
      bag: { tokens: [token("only-danger", "white", 2)] },
      blueProtectionDraws: 1,
      crucible: placeToken(ai.crucible, token("existing-white-a", "white", 3)),
    };
    ai = { ...ai, crucible: placeToken(ai.crucible, token("existing-white-b", "white", 3)) };

    expect(evaluateBrewingDecision(ai, { ...state, currentRound: 4, players: [player("human"), ai] }).risk).toBe(0);
  });

  it("includes deferred red chips when AI evaluates stopping", () => {
    const state = createInitialState(2);
    const base = { ...player("ai"), bag: { tokens: [token("safe-orange", "orange", 1)] } };
    const reserved = { ...base, redReserve: [token("reserved-red", "red", 4)] };
    const stateFor = (ai: Player) => ({ ...state, currentRound: 4, players: [player("human"), ai] });

    expect(evaluateBrewingDecision(reserved, stateFor(reserved)).stop)
      .toBeGreaterThan(evaluateBrewingDecision(base, stateFor(base)).stop);
  });

  it.each([1, 2, 3, 4] as const)("keeps seeded recipe-set %s simulations within core invariants", (set) => {
    const results = simulateMatches(20, set * 1000, set);
    for (const result of results) {
      expect(result.scores.human).toBeGreaterThanOrEqual(0);
      expect(result.scores.ai).toBeGreaterThanOrEqual(0);
      expect(result.explosions.human).toBeLessThanOrEqual(9);
      expect(result.explosions.ai).toBeLessThanOrEqual(9);
      expect(result.draws.human).toBeGreaterThan(0);
      expect(result.draws.ai).toBeGreaterThan(0);
      expect(result.purchases.human).toBeGreaterThanOrEqual(0);
      expect(result.purchases.ai).toBeGreaterThanOrEqual(0);
      expect(result.purchases.human).toBeLessThanOrEqual(18);
      expect(result.purchases.ai).toBeLessThanOrEqual(18);
      expect(result.economyValid).toBe(true);
      expect(result.tokenFlowValid).toBe(true);
    }
  });

  it.each([1, 2, 3, 4] as const)("exercises the market across recipe-set %s simulations", (set) => {
    const results = simulateMatches(20, set * 2000, set);
    const purchaseCount = results.reduce(
      (total, result) => total + result.purchases.human + result.purchases.ai,
      0
    );

    expect(purchaseCount).toBeGreaterThan(0);
  });

  it.each([1, 2, 3, 4] as const)("keeps recipe-set %s competitive on skilled difficulty", (set) => {
    const results = simulateMatches(500, set * 100_000, set, 2, "skilled");
    const humanAverage = results.reduce((total, result) => total + result.scores.human, 0) / results.length;
    const aiAverage = results.reduce((total, result) => total + result.scores.ai, 0) / results.length;
    const humanWins = results.filter((result) => result.winnerId === "human").length;
    const aiWins = results.filter((result) => result.winnerId === "ai").length;

    // Skilled intentionally trims the human's stronger coin rewards, so exact
    // mirror symmetry is no longer the rule; the match must remain competitive.
    expect(Math.abs(humanAverage - aiAverage)).toBeLessThan(5);
    expect(Math.abs(humanWins - aiWins) / results.length).toBeLessThan(0.4);
  });

  it.each([1, 2, 3, 4] as const)("keeps recipe-set %s in a tense but controlled risk band", (set) => {
    const results = simulateMatches(500, set * 300_000, set);
    const explosions = results.reduce(
      (total, result) => total + result.explosions.human + result.explosions.ai,
      0
    ) / (results.length * 2);

    expect(explosions).toBeGreaterThan(0.4);
    expect(explosions).toBeLessThan(2);
  });

  it.each([5, 6] as const)("keeps Mirewrought recipe-set %s competitive and within the core risk band", (set) => {
    const results = simulateMatches(250, set * 400_000, set, 2, "skilled", ["covenants_of_the_mire"]);
    const humanAverage = results.reduce((total, result) => total + result.scores.human, 0) / results.length;
    const aiAverage = results.reduce((total, result) => total + result.scores.ai, 0) / results.length;
    const explosions = results.reduce(
      (total, result) => total + result.explosions.human + result.explosions.ai,
      0,
    ) / (results.length * 2);

    expect(Math.abs(humanAverage - aiAverage)).toBeLessThan(5);
    expect(explosions).toBeGreaterThan(0.4);
    expect(explosions).toBeLessThan(2);
    expect(results.every((result) => result.economyValid && result.tokenFlowValid)).toBe(true);
  });

  it("benchmarks every difficulty, recipe set, and supported player count", () => {
    const rows = benchmarkDifficulties(1, 880_000);
    expect(rows).toHaveLength(3 * 4 * 3);
    expect(new Set(rows.map((row) => row.difficulty))).toEqual(new Set(["apprentice", "skilled", "master"]));
    expect(rows.every((row) => row.matches === 1)).toBe(true);
    expect(rows.every((row) => row.humanWinRate >= 0 && row.humanWinRate <= 1)).toBe(true);
    expect(rows.every((row) => row.aiWinRate >= 0 && row.aiWinRate <= 1)).toBe(true);
    expect(rows.every((row) => Number.isFinite(row.averageHumanScore) && Number.isFinite(row.averageAIScore))).toBe(true);
    expect(rows.every((row) => Number.isFinite(row.averageAIExplosions) && Number.isFinite(row.averageAIPurchases))).toBe(true);
    expect(rows.every((row) => Number.isFinite(row.averageHumanPurchases) && row.averageHumanPurchases > 0)).toBe(true);
    expect(rows.every((row) => Number.isFinite(row.averageAIDraws) && Number.isFinite(row.averageAIBagQuality))).toBe(true);
    expect(rows.every((row) => row.aiComebackRate >= 0 && row.aiComebackRate <= 1)).toBe(true);
  });

  it("resolves blue choices only from the store's pending tokens", () => {
    const pending = token("pending-blue-choice", "orange", 1);
    const injected = token("injected-stale-token", "purple", 4);
    const state = createInitialState();
    useGameStore.setState({
      state: {
        ...state,
        phase: "blue_choice",
        pendingBlueTokens: [pending],
        players: state.players.map((current) =>
          current.id === "human" ? { ...current, bag: { tokens: [] } } : current
        ),
      },
    });

    useGameStore.getState().humanResolveBlue(null, [injected]);
    const human = useGameStore.getState().state.players.find((current) => current.id === "human")!;

    expect(human.bag.tokens.map((placed) => placed.id)).toEqual([pending.id]);
    expect(useGameStore.getState().state.phase).toBe("brewing");
  });

  it("scores the empty space after the last placed token", () => {
    const crucible = placeToken(createCrucible(), token("o", "orange", 1));
    const result = calculateRoundScore(crucible);

    expect(crucible.filledUpTo).toBe(1);
    expect(result.space).toBe(2);
    expect(result.coins).toBe(2);
    expect(result.vp).toBe(0);
  });

  it("explodes only when Voidshard value exceeds 7", () => {
    let crucible = createCrucible();
    crucible = placeToken(crucible, token("w3a", "white", 3));
    crucible = placeToken(crucible, token("w2a", "white", 2));
    crucible = placeToken(crucible, token("w2b", "white", 2));

    expect(crucible.whiteSum).toBe(7);
    expect(crucible.exploded).toBe(false);

    crucible = placeToken(crucible, token("w1a", "white", 1));

    expect(crucible.whiteSum).toBe(8);
    expect(crucible.exploded).toBe(true);
  });

  it("flask returns the last safe white chip and cannot be used after explosion", () => {
    const base = player("human");
    const safe = { ...base, crucible: placeToken(base.crucible, token("w1", "white", 1)) };

    expect(canUseFlask(safe)).toBe(true);
    const afterFlask = useFlask(safe);
    expect(afterFlask.flask).toBe(false);
    expect(afterFlask.crucible.whiteSum).toBe(0);
    expect(afterFlask.bag.tokens.some((t) => t.id === "w1")).toBe(true);

    let blown = base;
    blown = { ...blown, crucible: placeToken(blown.crucible, token("w3", "white", 3)) };
    blown = { ...blown, crucible: placeToken(blown.crucible, token("w3b", "white", 3)) };
    blown = { ...blown, crucible: placeToken(blown.crucible, token("w2", "white", 2)) };
    expect(canUseFlask(blown)).toBe(false);
  });

  it("preserves every token when multiple placements reach the final spoon", () => {
    const first = token("first", "orange", 4);
    const second = token("second", "green", 2);
    let crucible = createCrucible();
    crucible = { ...crucible, filledUpTo: 32 };
    crucible = placeToken(crucible, first);
    crucible = placeToken(crucible, second);

    expect(crucible.filledUpTo).toBe(33);
    expect(getPlacedTokens(crucible).map((placed) => placed.id)).toEqual([first.id, second.id]);
  });

  it("returns every final-spoon token to the bag for the next round", () => {
    const first = token("round-first", "orange", 4);
    const second = token("round-second", "green", 2);
    let crucible = { ...createCrucible(), filledUpTo: 32 };
    crucible = placeToken(crucible, first);
    crucible = placeToken(crucible, second);

    const state = createInitialState();
    const next = advanceToNextRound({
      ...state,
      players: state.players.map((current) =>
        current.id === "human"
          ? { ...current, bag: { tokens: [] }, crucible }
          : current
      ),
    });
    const human = next.players.find((current) => current.id === "human")!;

    expect(human.bag.tokens.map((placed) => placed.id)).toEqual([first.id, second.id]);
  });

  it("flask reverses the exact effective movement of a boosted white token", () => {
    const base = player("human");
    const boosted = token("boosted-white", "white", 1);
    const placed = {
      ...base,
      crucible: placeToken({ ...base.crucible, filledUpTo: 5 }, boosted, 4),
    };

    expect(placed.crucible.filledUpTo).toBe(9);
    const reverted = useFlask(placed);
    expect(reverted.crucible.filledUpTo).toBe(5);
    expect(getPlacedTokens(reverted.crucible)).toHaveLength(0);
  });

  it("red advances extra based on Brimstone already in the pot", () => {
    let crucible = createCrucible();
    expect(redBonusValue(crucible)).toBe(0);
    crucible = placeToken(crucible, token("o1", "orange", 1));
    expect(redBonusValue(crucible)).toBe(1);
    crucible = placeToken(crucible, token("o2", "orange", 1));
    crucible = placeToken(crucible, token("o3", "orange", 1));
    expect(redBonusValue(crucible)).toBe(2);
  });

  it("yellow can return the directly previous Voidshard", () => {
    const white = token("w1", "white", 1);
    const yellow = token("y1", "yellow", 1);
    let p = player("human");
    p = { ...p, bag: { tokens: [] }, crucible: placeToken(p.crucible, white) };
    p = { ...p, crucible: placeToken(p.crucible, yellow) };

    const updated = applyYellowSetOneBonus(p, white);
    expect(updated.crucible.whiteSum).toBe(0);
    expect(updated.bag.tokens.some((t) => t.id === white.id)).toBe(true);
  });

  it("yellow can rescue a burst pot by returning the previous Voidshard", () => {
    const previousWhite = token("w3", "white", 3);
    let p = player("human");
    p = { ...p, crucible: placeToken(p.crucible, token("w5", "white", 5)) };
    p = { ...p, crucible: placeToken(p.crucible, previousWhite) };
    p = { ...p, crucible: placeToken(p.crucible, token("y1", "yellow", 1)) };

    expect(p.crucible.whiteSum).toBe(8);
    expect(p.crucible.exploded).toBe(true);

    const updated = applyYellowSetOneBonus(p, previousWhite);
    expect(updated.crucible.whiteSum).toBe(5);
    expect(updated.crucible.exploded).toBe(false);
  });

  it("green, purple, and black end-round effects resolve from final pots", () => {
    let human = player("human");
    let shade = player("ai");
    human = { ...human, crucible: placeToken(human.crucible, token("g", "green", 1)) };
    human = { ...human, crucible: placeToken(human.crucible, token("p", "purple", 1)) };
    human = { ...human, crucible: placeToken(human.crucible, token("k", "black", 1)) };
    shade = { ...shade, crucible: placeToken(shade.crucible, token("o", "orange", 1)) };

    const updated = applyEndOfRoundEffects(human, shade);

    expect(updated.rubies).toBe(1);
    expect(updated.score).toBe(1);
    expect(updated.crucible.dropletPosition).toBe(1);
  });

  it("market allows at most two purchases and they must be different colors", () => {
    const market = createMarket();
    const p = { ...player("human"), coinsThisRound: 99 };
    const buyState = { purchases: [], coinsSpent: 0, coinsAvailable: 99 };
    const first = purchaseItem(p, market, buyState, "m-green-1", 1);

    expect(() =>
      purchaseItem(first.player, first.market, first.state, "m-green-2", 1)
    ).toThrow();

    const second = purchaseItem(first.player, first.market, first.state, "m-blue-1", 1);
    expect(second.state.purchases).toHaveLength(2);
    expect(second.player.marketPurchaseCount).toBe(2);
    expect(second.player.marketPurchaseRounds).toEqual([1]);
    expect(second.player.marketPurchasedColors).toEqual(["green", "blue"]);
    expect(() =>
      purchaseItem(second.player, second.market, second.state, "m-orange-1", 1)
    ).toThrow();

    const nextRound = purchaseItem(
      second.player,
      second.market,
      { purchases: [], coinsSpent: 0, coinsAvailable: 99 },
      "m-orange-1",
      2,
    );
    expect(nextRound.player.marketPurchaseCount).toBe(3);
    expect(nextRound.player.marketPurchaseRounds).toEqual([1, 2]);
    expect(nextRound.player.marketPurchasedColors).toEqual(["green", "blue", "orange"]);
  });

  it("bonus die only returns supported renamed rewards", () => {
    const result = rollBonusDie();
    expect(["ruby", "vp", "droplet", "chip_orange_1"]).toContain(result.type);
  });

  it("uses one round-reward rule for survival, explosion choices, and protection", () => {
    const result = { space: 12, vp: 3, coins: 9, ruby: false, exploded: true };
    const prestige = applyRoundReward(player("human"), result, "vp");
    const coins = applyRoundReward(player("human"), result, "coins");
    const protectedPlayer = applyRoundReward({ ...player("human"), blueBonusExplosion: true }, result);

    expect({ score: prestige.score, coins: prestige.coinsThisRound }).toEqual({ score: 3, coins: 0 });
    expect({ score: coins.score, coins: coins.coinsThisRound }).toEqual({ score: 0, coins: 9 });
    expect({ score: protectedPlayer.score, coins: protectedPlayer.coinsThisRound }).toEqual({ score: 3, coins: 9 });
    expect(() => applyRoundReward(player("human"), result)).toThrow();
  });

  it("resolves omen start rewards through the shared rule", () => {
    const omen: OmenCard = {
      id: "test-chip-omen",
      title: "Test",
      description: "Test",
      summary: "Test",
      effect: { type: "gain_chip", color: "purple", value: 2 },
    };
    const updated = applyOmenStartEffect(player("human"), omen, {
      createToken: (color, value, source) => token(`${source}-token`, color, value),
    });

    expect(updated.bag.tokens[updated.bag.tokens.length - 1]).toEqual(token("test-chip-omen-token", "purple", 2));
  });

  it("shares omen scoring and doubled ruby-space rewards", () => {
    let p = player("human");
    p = { ...p, crucible: placeToken(p.crucible, token("omen-green-1", "green", 1)) };
    p = { ...p, crucible: placeToken(p.crucible, token("omen-green-2", "green", 1)) };
    const result = { ...calculateRoundScore(p.crucible), ruby: true };
    const colorOmen: OmenCard = {
      id: "test-color-omen", title: "Test", description: "Test", summary: "Test",
      effect: { type: "bonus_for_color", color: "green", vpPerChip: 1, rubiesPerChip: 1 },
    };
    const rubyOmen: OmenCard = {
      id: "test-ruby-omen", title: "Test", description: "Test", summary: "Test",
      effect: { type: "double_ruby_space" },
    };

    const scored = applyOmenScoringEffect(p, colorOmen, result);
    expect(scored.score).toBe(2);
    expect(scored.rubies).toBe(2);
    expect(rubyRewardForResult(rubyOmen, result)).toBe(2);
  });

  it("applies Omen droplet, exact-pressure, flask, and ruby boundaries exactly", () => {
    const byId = (id: string) => OMEN_DECK.find((card) => card.id === id)!;
    const nearEnd = {
      ...player("human"),
      flask: false,
      crucible: { ...player("human").crucible, dropletPosition: 32, filledUpTo: 33, whiteSum: 7 },
    };
    const startMoved = applyOmenStartEffect(nearEnd, byId("omen-03"), {
      createToken: (color, value, source) => token(`${source}-${color}-${value}`, color, value),
    });
    expect(startMoved.crucible.dropletPosition).toBe(32);
    expect(startMoved.crucible.filledUpTo).toBe(33);

    const result = { space: 10, vp: 2, coins: 8, ruby: true, exploded: false };
    const exactSeven = applyOmenScoringEffect(nearEnd, byId("omen-18"), result);
    expect(exactSeven.crucible.dropletPosition).toBe(32);
    expect(applyOmenScoringEffect(
      { ...nearEnd, crucible: { ...nearEnd.crucible, dropletPosition: 5, whiteSum: 6 } },
      byId("omen-18"),
      result,
    ).crucible.dropletPosition).toBe(5);
    expect(applyOmenScoringEffect(nearEnd, byId("omen-20"), result).flask).toBe(true);
    expect(applyOmenScoringEffect(nearEnd, byId("omen-23"), result).score).toBe(2);
    expect(applyOmenScoringEffect(nearEnd, byId("omen-23"), { ...result, ruby: false }).score).toBe(0);
    expect(rubyRewardForResult(byId("omen-14"), result)).toBe(2);
    expect(rubyRewardForResult(byId("omen-14"), { ...result, ruby: false })).toBe(0);
  });

  it("applies deterministic bonus-die rewards through the shared rule", () => {
    const p = player("human");
    const orange = token("die-orange", "orange", 1);
    const updated = applyBonusDieResult(p, { type: "chip_orange_1" }, orange);

    expect(updated.bag.tokens[updated.bag.tokens.length - 1]).toEqual(orange);
  });

  it("applies the rules-faithful passive Omen effects", () => {
    const omen = (id: string) => OMEN_DECK.find((card) => card.id === id)!;
    let state = createInitialState();

    state = { ...state, currentOmen: omen("omen-22") };
    const orangePlayer = placeTokenForActiveBooks(player("human"), token("omen-orange", "orange", 1), state);
    expect(orangePlayer.crucible.filledUpTo).toBe(2);

    state = { ...state, currentOmen: omen("omen-19") };
    let thresholdPlayer = player("human");
    thresholdPlayer = { ...thresholdPlayer, crucible: { ...thresholdPlayer.crucible, whiteSum: 7 } };
    thresholdPlayer = placeTokenForActiveBooks(thresholdPlayer, token("omen-white", "white", 2), state);
    expect(thresholdPlayer.crucible.exploded).toBe(false);

    state = { ...state, currentOmen: omen("omen-15") };
    const returned = placeTokenForActiveBooks(player("human"), token("first-white", "white", 3), state);
    expect(returned.crucible.placements).toHaveLength(0);
    expect(returned.bag.tokens.some((bagToken) => bagToken.id === "first-white")).toBe(true);
    expect(returned.omenFirstWhiteReturned).toBe(true);
  });

  it("advances the droplet for exactly seven pressure and refills the vial", () => {
    const exactSeven = OMEN_DECK.find((card) => card.id === "omen-18")!;
    const refill = OMEN_DECK.find((card) => card.id === "omen-20")!;
    const result = { space: 8, vp: 1, coins: 8, ruby: false, exploded: false };
    let p = { ...player("human"), flask: false, crucible: { ...createCrucible(), whiteSum: 7 } };

    p = applyOmenScoringEffect(p, exactSeven, result);
    expect(p.crucible.dropletPosition).toBe(1);
    p = applyOmenScoringEffect(p, refill, result);
    expect(p.flask).toBe(true);
  });

  it("endgame converts leftover coins and rubies into prestige", () => {
    let state = createInitialState();
    state = {
      ...state,
      currentRound: 9,
      players: state.players.map((p) => ({
        ...p,
        score: p.id === "human" ? 10 : 9,
        coinsThisRound: p.id === "human" ? 10 : 0,
        rubies: p.id === "human" ? 2 : 0,
      })),
    };

    const final = advanceToNextRound(state);
    const human = final.players.find((p) => p.id === "human")!;

    expect(final.phase).toBe("game_over");
    expect(human.score).toBe(13);
    expect(final.winner?.id).toBe("human");
  });

  it("applies final conversion exactly once even if advancement is dispatched twice", () => {
    const state = createInitialState();
    const ready = {
      ...state,
      currentRound: 9,
      players: state.players.map((current, index) => ({
        ...current,
        score: index === 0 ? 10 : 0,
        coinsThisRound: 10,
        rubies: 4,
      })),
    };
    const final = advanceToNextRound(ready);
    const repeated = advanceToNextRound(final);

    expect(final.players.map((current) => current.score)).toEqual([14, 4]);
    expect(repeated).toBe(final);
    expect(repeated.players.map((current) => current.score)).toEqual([14, 4]);
  });

  it.each([2, 3, 4] as const)("adds exactly one unique round-six Voidshard to every player in a %s-player game", (playerCount) => {
    let state = createInitialState(1, playerCount - 1);
    while (state.currentRound < 6) state = advanceToNextRound(state);

    for (const current of state.players) {
      const additions = current.bag.tokens.filter((item) => item.id === `white-1-r6-${current.id}`);
      expect(additions).toHaveLength(1);
      expect(additions[0]).toMatchObject({ color: "white", value: 1 });
    }
    const roundSixIds = state.players.flatMap((current) => current.bag.tokens)
      .filter((item) => item.id.startsWith("white-1-r6-"))
      .map((item) => item.id);
    expect(new Set(roundSixIds).size).toBe(playerCount);

    state = advanceToNextRound(state);
    expect(state.players.every((current) =>
      current.bag.tokens.filter((item) => item.id === `white-1-r6-${current.id}`).length === 1
    )).toBe(true);
  });

  it.each([2, 3, 4] as const)("rotates the starting seat through a complete %s-player cycle", (playerCount) => {
    let state = createInitialState(1, playerCount - 1);
    const seats = [state.activePlayerIndex];
    for (let step = 1; step <= playerCount; step += 1) {
      state = advanceToNextRound(state);
      seats.push(state.activePlayerIndex);
    }
    expect(seats).toEqual([
      ...Array.from({ length: playerCount }, (_, index) => index),
      0,
    ]);
  });

  it("market costs follow selected recipe books", () => {
    const set1 = createMarket(createRecipeBooks(1));
    const set3 = createMarket(createRecipeBooks(3));

    expect(set1.find((item) => item.id === "m-blue-4")?.cost).toBe(19);
    expect(set3.find((item) => item.id === "m-blue-4")?.cost).toBe(14);
  });

  it("removes every seated player's starting chips from shared supply", () => {
    const twoPlayerMarket = createMarket(createRecipeBooks(1), 2);
    const fourPlayerMarket = createMarket(createRecipeBooks(1), 4);

    expect(twoPlayerMarket.find((item) => item.id === "m-orange-1")?.stock).toBe(20);
    expect(fourPlayerMarket.find((item) => item.id === "m-orange-1")?.stock).toBe(18);
    expect(twoPlayerMarket.find((item) => item.id === "m-green-1")?.stock).toBe(13);
    expect(fourPlayerMarket.find((item) => item.id === "m-green-1")?.stock).toBe(11);
    expect(fourPlayerMarket.find((item) => item.id === "m-blue-1")?.stock).toBe(12);
  });

  it("uses seated neighbors for the official multiplayer Shadowmoss reward", () => {
    const withBlack = (id: string, count: number) => {
      let current = player(id);
      for (let index = 0; index < count; index += 1) {
        current = {
          ...current,
          crucible: placeToken(current.crucible, token(`${id}-black-${index}`, "black", 1)),
        };
      }
      return current;
    };
    const current = withBlack("human", 2);
    const beatsOne = applyBlackMultiplayerBonus(current, withBlack("left", 1), withBlack("right", 3));
    const beatsBoth = applyBlackMultiplayerBonus(current, withBlack("left", 1), withBlack("right", 0));

    expect(beatsOne.crucible.dropletPosition).toBe(1);
    expect(beatsOne.rubies).toBe(current.rubies);
    expect(beatsBoth.crucible.dropletPosition).toBe(1);
    expect(beatsBoth.rubies).toBe(current.rubies + 1);
  });

  it("rotates the starting seat and preserves exact co-winners", () => {
    let state = createInitialState(1, 2);
    state = advanceToNextRound(state);
    expect(state.activePlayerIndex).toBe(1);

    state = {
      ...state,
      currentRound: 9,
      players: state.players.map((current) => ({
        ...current,
        score: 10,
        coinsThisRound: 0,
        rubies: 0,
        crucible: { ...current.crucible, filledUpTo: 8 },
      })),
    };
    const final = advanceToNextRound(state);
    expect(final.winners).toHaveLength(3);
  });

  it("alternate recipe books change immediate effects", () => {
    const books2 = createRecipeBooks(2);
    const books4 = createRecipeBooks(4);
    const blue = token("b2", "blue", 2);
    const yellow = token("y1", "yellow", 1);

    const protectedPlayer = applyBlueImmediate(player("human"), blue, books2);
    expect(protectedPlayer.blueProtectionDraws).toBe(2);

    let yellowPlayer = player("human");
    yellowPlayer = { ...yellowPlayer, crucible: placeToken(yellowPlayer.crucible, yellow) };
    yellowPlayer = applyYellowImmediate(yellowPlayer, null, books4);
    expect(redBonusValue(yellowPlayer.crucible, books4)).toBe(0);
  });

  it("locks Bloodthorn set one bonuses to zero, one, and three Brimstone thresholds", () => {
    const books = createRecipeBooks(1);
    let crucible = createCrucible();
    expect(redBonusValue(crucible, books)).toBe(0);
    crucible = placeToken(crucible, token("orange-1", "orange", 1));
    expect(redBonusValue(crucible, books)).toBe(1);
    crucible = placeToken(crucible, token("orange-2", "orange", 1));
    expect(redBonusValue(crucible, books)).toBe(1);
    crucible = placeToken(crucible, token("orange-3", "orange", 1));
    expect(redBonusValue(crucible, books)).toBe(2);
  });

  it("Frostbile set one samples exactly the chip value and stops at an empty bag", () => {
    const bag = { tokens: [
      token("blue-draw-a", "orange", 1),
      token("blue-draw-b", "green", 1),
      token("blue-draw-c", "red", 1),
    ] };
    const two = drawBlueBonus(bag, 2);
    expect(two.drawn).toHaveLength(2);
    expect(two.bag.tokens).toHaveLength(1);
    const four = drawBlueBonus(bag, 4);
    expect(four.drawn).toHaveLength(3);
    expect(four.bag.tokens).toHaveLength(0);
  });

  it("Plaguedust set two doubles exactly the next chip and then clears", () => {
    const state = { ...createInitialState(2), currentOmen: null };
    let current = placeTokenForActiveBooks(player("human"), token("yellow-double", "yellow", 1), state);
    expect(current.yellowDoubleNext).toBe(true);
    const beforeFirst = current.crucible.filledUpTo;
    current = placeTokenForActiveBooks(current, token("orange-doubled", "orange", 1), state);
    expect(current.crucible.filledUpTo - beforeFirst).toBe(2);
    expect(current.yellowDoubleNext).toBe(false);
    const beforeSecond = current.crucible.filledUpTo;
    current = placeTokenForActiveBooks(current, token("orange-normal", "orange", 1), state);
    expect(current.crucible.filledUpTo - beforeSecond).toBe(1);
  });

  it("Plaguedust set three raises the pressure limit to eight and then nine", () => {
    const state = { ...createInitialState(3), currentOmen: null };
    let oneYellow = placeTokenForActiveBooks(player("human"), token("yellow-one", "yellow", 1), state);
    oneYellow = placeTokenForActiveBooks(oneYellow, token("white-eight", "white", 3), state);
    oneYellow = placeTokenForActiveBooks(oneYellow, token("white-eight-b", "white", 3), state);
    oneYellow = placeTokenForActiveBooks(oneYellow, token("white-eight-c", "white", 2), state);
    expect(oneYellow.crucible.whiteSum).toBe(8);
    expect(oneYellow.crucible.exploded).toBe(false);
    oneYellow = placeTokenForActiveBooks(oneYellow, token("white-nine", "white", 1), state);
    expect(oneYellow.crucible.exploded).toBe(true);

    let threeYellow = player("human");
    for (let index = 1; index <= 3; index += 1) {
      threeYellow = placeTokenForActiveBooks(threeYellow, token(`yellow-three-${index}`, "yellow", 1), state);
    }
    for (let index = 1; index <= 3; index += 1) {
      threeYellow = placeTokenForActiveBooks(threeYellow, token(`white-nine-${index}`, "white", 3), state);
    }
    expect(threeYellow.crucible.whiteSum).toBe(9);
    expect(threeYellow.crucible.exploded).toBe(false);
    threeYellow = placeTokenForActiveBooks(threeYellow, token("white-ten", "white", 1), state);
    expect(threeYellow.crucible.exploded).toBe(true);
  });

  it("Bloodthorn set four boosts only value-one Voidshards when Bloodthorn is present", () => {
    const state = { ...createInitialState(4), currentOmen: null };
    let current = placeTokenForActiveBooks(player("human"), token("red-enabler", "red", 1), state);
    const beforeOne = current.crucible.filledUpTo;
    current = placeTokenForActiveBooks(current, token("white-one-boosted", "white", 1), state);
    expect(current.crucible.filledUpTo - beforeOne).toBe(2);
    const beforeTwo = current.crucible.filledUpTo;
    current = placeTokenForActiveBooks(current, token("white-two-normal", "white", 2), state);
    expect(current.crucible.filledUpTo - beforeTwo).toBe(2);
  });

  it("Wraithbloom set three scores each chip from its own track band", () => {
    const books = createRecipeBooks(3);
    let current = player("human");
    current = { ...current, crucible: placeToken(current.crucible, token("purple-9", "purple", 1), 9) };
    current = { ...current, crucible: placeToken(current.crucible, token("purple-10", "purple", 1), 1) };
    current = { ...current, crucible: placeToken(current.crucible, token("purple-20", "purple", 1), 10) };
    current = { ...current, crucible: placeToken(current.crucible, token("purple-30", "purple", 1), 10) };
    const scored = applyEndOfRoundEffects(current, undefined, books);
    expect(scored.score).toBe(6);
  });

  it("AI risk calculation respects Yellow set three's raised safe limit", () => {
    const yellow = token("yellow-threshold", "yellow", 1);
    const safeWhite = token("safe-white", "white", 1);
    let ai = player("ai");
    ai = {
      ...ai,
      bag: { tokens: [safeWhite] },
      crucible: placeToken(
        { ...placeToken(ai.crucible, yellow), whiteSum: 7 },
        token("marker", "orange", 1),
        0
      ),
    };
    const state = createInitialState(3);
    const stateWithAI = {
      ...state,
      players: state.players.map((current) => current.id === "ai" ? ai : current),
    };

    expect(evaluateBrewingDecision(ai, stateWithAI).risk).toBe(0);
  });

  it("AI compares draw value against stopping instead of drawing safe tokens forever", () => {
    const safe = token("safe-at-spoon", "orange", 1);
    const ai = {
      ...player("ai"),
      bag: { tokens: [safe] },
      crucible: { ...createCrucible(), filledUpTo: 33 },
    };
    const state = createInitialState();
    const utility = evaluateBrewingDecision(ai, state);

    expect(utility.draw).toBeLessThan(utility.stop + 0.05);
    expect(decideBrewingAction(ai, state)).toBe("stop");
  });

  it("AI market planning evaluates legal two-item bundles in conservative mode", () => {
    const ai = { ...player("ai"), coinsThisRound: 30 };
    const market = createMarket();
    const purchases = decideMarketPurchases(
      ai,
      market,
      "conservative",
      { purchases: [], coinsSpent: 0, coinsAvailable: 30 },
      9
    );
    const colors = purchases.map((id) => market.find((item) => item.id === id)!.token.color);

    expect(purchases).toHaveLength(2);
    expect(new Set(colors).size).toBe(2);
  });

  it("Master market planning values scarce stock that opponents are building toward", () => {
    const baseItem = createMarket(createRecipeBooks(1), 2).find((item) => item.id === "m-purple-1")!;
    const abundant = { ...baseItem, id: "purple-abundant", stock: 10, available: true, unlockRound: 1 };
    const scarce = { ...baseItem, id: "purple-scarce", stock: 1, available: true, unlockRound: 1 };
    let ai = { ...player("ai"), coinsThisRound: 20 };
    let human = player("human");
    human = { ...human, bag: { tokens: [...human.bag.tokens, token("human-purple-demand", "purple", 1)] } };
    const buyState = { purchases: [], coinsSpent: 0, coinsAvailable: 20 };
    const skilledState = { ...createInitialState(1, 1, "skilled"), currentRound: 3, players: [human, ai] };
    const masterState = { ...skilledState, aiDifficulty: "master" as const };

    expect(decideMarketPurchases(ai, [abundant, scarce], "calculated", buyState, 3, skilledState)).toEqual(["purple-abundant"]);
    expect(decideMarketPurchases(ai, [abundant, scarce], "calculated", buyState, 3, masterState)).toEqual(["purple-scarce"]);
  });

  it("Master chooses a synergistic Deathweave reward instead of the first listed option", () => {
    let ai = player("ai");
    ai = { ...ai, bag: { tokens: [
      ...ai.bag.tokens,
      token("reward-purple-a", "purple", 1),
      token("reward-purple-b", "purple", 1),
    ] } };
    const options = [{ color: "yellow" as const, value: 1 }, { color: "purple" as const, value: 1 }];
    const skilled = createInitialState(2, 1, "skilled");
    const master = { ...skilled, aiDifficulty: "master" as const };

    expect(decideGreenRewardChoice(ai, options, skilled)).toEqual(options[0]);
    expect(decideGreenRewardChoice(ai, options, master)).toEqual(options[1]);
  });

  it("Master evaluates Frostbile keep choices against the resulting future bag", () => {
    const state = { ...createInitialState(1, 1, "master"), currentOmen: null };
    const safe = token("blue-choice-safe", "green", 1);
    const dangerous = token("blue-choice-danger", "white", 3);
    let ai = player("ai");
    ai = {
      ...ai,
      bag: { tokens: [safe, dangerous] },
      crucible: placeToken(
        placeToken(ai.crucible, token("blue-choice-pressure-a", "white", 3)),
        token("blue-choice-pressure-b", "white", 3),
      ),
    };
    const before = ai.bag.tokens.map((item) => item.id);

    expect(decideBlueKeep([dangerous, safe], ai, { ...state, players: [state.players[0], ai] })?.id).toBe(safe.id);
    expect(ai.bag.tokens.map((item) => item.id)).toEqual(before);
  });

  it("Master preserves final-round rubies for prestige and spends earlier pairs deliberately", () => {
    const base = createInitialState(1, 1, "master");
    const ready = { ...player("ai"), rubies: 2, flask: false };
    expect(decideAIRubyAction(ready, { ...base, currentRound: 9 })).toBe("hold");
    expect(decideAIRubyAction(ready, { ...base, currentRound: 8 })).toBe("flask");
    expect(decideAIRubyAction({ ...ready, flask: true }, { ...base, currentRound: 8 })).toBe("droplet");
  });

  it("exposes Apprentice, Skilled, and Master as distinct AI policies", () => {
    const ai = player("ai");
    const modeFor = (difficulty: "apprentice" | "skilled" | "master") => {
      const state = createInitialState(1, 1, difficulty);
      return selectAIMode(buildAIContext({ ...state, players: [state.players[0], ai] }, ai));
    };

    expect(modeFor("apprentice")).toBe("conservative");
    expect(modeFor("skilled")).toBe("reckless");
    expect(modeFor("master")).toBe("reckless");
  });

  it("gives each named Master opponent a distinct rational strategy profile", () => {
    const state = { ...createInitialState(1, 3, "master"), currentRound: 4 };
    const shade = state.players.find((current) => current.id === "ai")!;
    const wraith = state.players.find((current) => current.id === "ai-2")!;
    const seer = state.players.find((current) => current.id === "ai-3")!;
    const hollow = { ...seer, id: "ai-4", name: "The Hollow" };

    expect([getAIProfile(shade), getAIProfile(wraith), getAIProfile(seer), getAIProfile(hollow)]).toEqual(["shade", "wraith", "seer", "hollow"]);
    expect(selectAIMode(buildAIContext(state, shade))).toBe("reckless");
    expect(selectAIMode(buildAIContext(state, wraith))).toBe("calculated");
    expect(selectAIMode(buildAIContext(state, seer))).toBe("conservative");
    expect(getAIRivalDoctrine(hollow).shortLabel).toBe("ADAPTIVE");
    expect(getRiskTolerance("calculated", "shade")).toBeGreaterThan(getRiskTolerance("calculated", "seer"));
  });

  it("Master AI compares itself with the actual table leader, not only the human", () => {
    const state = createInitialState(1, 3, "master");
    const players = state.players.map((current) => ({
      ...current,
      score: current.id === "human" ? 20 : current.id === "ai-2" ? 40 : 15,
    }));
    const target = players.find((current) => current.id === "ai")!;
    const context = buildAIContext({ ...state, currentRound: 9, players }, target);

    expect(context.humanScore).toBe(20);
    expect(context.leaderScore).toBe(40);
    expect(context.scoreDelta).toBe(-25);
    expect(selectAIMode(context)).toBe("reckless");
  });

  it("Master AI evaluates multiple future draws without mutating the known bag", () => {
    const state = { ...createInitialState(1, 1, "master"), currentOmen: null };
    let ai = player("ai");
    ai = {
      ...ai,
      bag: { tokens: [
        token("lookahead-orange", "orange", 1),
        token("lookahead-green", "green", 1),
        token("lookahead-white-a", "white", 2),
        token("lookahead-white-b", "white", 3),
      ] },
      crucible: placeToken(ai.crucible, token("lookahead-pressure", "white", 3)),
    };
    const decisionState = { ...state, players: [state.players[0], ai] };
    const beforeIds = ai.bag.tokens.map((item) => item.id);
    const oneDraw = evaluateMasterLookahead(ai, decisionState, 1);
    const threeDraws = evaluateMasterLookahead(ai, decisionState, 3);

    expect(Number.isFinite(oneDraw)).toBe(true);
    expect(Number.isFinite(threeDraws)).toBe(true);
    expect(threeDraws).toBeGreaterThanOrEqual(oneDraw);
    expect(ai.bag.tokens.map((item) => item.id)).toEqual(beforeIds);
    expect(evaluateMasterLookahead(ai, decisionState, 3)).toBe(threeDraws);
  });

  it("Master rollout values bonus-die position and end-of-round ingredients", () => {
    const base = { ...createInitialState(1, 1, "master"), currentOmen: null };
    const stopped = (id: string, color: Token["color"], movement: number) => ({
      ...player(id),
      bag: { tokens: [] },
      crucible: placeToken(createCrucible(), token(`${id}-${color}`, color, 1), movement),
    });

    const leader = stopped("ai", "orange", 5);
    const behindOpponent = stopped("human", "orange", 4);
    const aheadOpponent = stopped("human", "orange", 6);
    const bonusEligible = evaluateMasterLookahead(leader, { ...base, players: [behindOpponent, leader] });
    const noBonus = evaluateMasterLookahead(leader, { ...base, players: [aheadOpponent, leader] });
    expect(bonusEligible - noBonus).toBeCloseTo(1.25, 5);

    const green = stopped("ai", "green", 5);
    const orange = stopped("ai", "orange", 5);
    const greenValue = evaluateMasterLookahead(green, { ...base, players: [behindOpponent, green] });
    const orangeValue = evaluateMasterLookahead(orange, { ...base, players: [behindOpponent, orange] });
    expect(greenValue).toBeGreaterThan(orangeValue);
  });

  it.each([1, 2, 4] as const)("AI resolves Purple set %s through the shared choice rules", (set) => {
    let ai = player("ai");
    ai = { ...ai, crucible: placeToken(ai.crucible, token(`green-${set}`, "green", 1)) };
    ai = { ...ai, crucible: placeToken(ai.crucible, token(`purple-${set}-1`, "purple", 1)) };
    ai = { ...ai, crucible: placeToken(ai.crucible, token(`purple-${set}-2`, "purple", 1)) };
    ai = { ...ai, crucible: placeToken(ai.crucible, token(`purple-${set}-3`, "purple", 1)) };
    const books = createRecipeBooks(set);
    const choice = decidePurpleChoice(purpleChoices(ai, books));

    expect(choice).not.toBeNull();
    expect(choice?.kind).not.toBe("skip");
    const resolved = applyPurpleChoice(ai, choice!);

    if (set === 1) expect(resolved.score).toBe(2);
    if (set === 2) {
      expect(resolved.score).toBe(6);
      expect(resolved.bag.tokens.some((placed) => placed.color === "yellow" && placed.value === 4)).toBe(true);
    }
    if (set === 4) {
      expect(resolved.bag.tokens.some((placed) => placed.color === "green" && placed.value === 4)).toBe(true);
    }
  });

  it("blue set two keeps a burst pot shattered but marks both-reward protection", () => {
    const books2 = createRecipeBooks(2);
    const blue = token("b1", "blue", 1);
    const white = token("w3", "white", 3);

    let p = player("human");
    p = { ...p, crucible: placeToken(p.crucible, token("w5", "white", 5)) };
    p = applyBlueImmediate({ ...p, crucible: placeToken(p.crucible, blue) }, blue, books2);
    p = { ...p, crucible: placeToken(p.crucible, white) };

    if (p.crucible.exploded && (p.blueProtectionDraws ?? 0) > 0) {
      p = { ...p, blueProtectionDraws: 0, blueBonusExplosion: true };
    }

    expect(p.crucible.exploded).toBe(true);
    expect(p.blueBonusExplosion).toBe(true);
  });

  it("Frostbile set two protection survives safe draws and resolves through the shared placement path", () => {
    const state = { ...createInitialState(2), currentOmen: null };
    let current = player("human");
    current = { ...current, crucible: placeToken(current.crucible, token("pressure-six-a", "white", 3)) };
    current = { ...current, crucible: placeToken(current.crucible, token("pressure-six-b", "white", 3)) };
    current = placeTokenForActiveBooks(current, token("blue-protect-two", "blue", 2), state);
    expect(current.blueProtectionDraws).toBe(2);
    current = placeTokenForActiveBooks(current, token("safe-between", "orange", 1), state);
    expect(current.blueProtectionDraws).toBe(1);
    current = placeTokenForActiveBooks(current, token("burst-protected", "white", 2), state);
    expect(current.crucible.exploded).toBe(true);
    expect(current.blueProtectionDraws).toBe(0);
    expect(current.blueBonusExplosion).toBe(true);
  });

  it("Plaguedust set three and the raised-threshold Omen use the higher limit without stacking", () => {
    const thresholdOmen = OMEN_DECK.find((card) => card.id === "omen-19")!;
    const base = createInitialState(3);
    const state = { ...base, currentOmen: thresholdOmen };
    let current = placeTokenForActiveBooks(player("human"), token("threshold-yellow", "yellow", 1), state);
    for (let index = 1; index <= 3; index += 1) {
      current = placeTokenForActiveBooks(current, token(`threshold-white-${index}`, "white", 3), state);
    }
    expect(current.crucible.whiteSum).toBe(9);
    expect(current.crucible.exploded).toBe(false);
    current = placeTokenForActiveBooks(current, token("threshold-white-ten", "white", 1), state);
    expect(current.crucible.whiteSum).toBe(10);
    expect(current.crucible.exploded).toBe(true);
  });

  it("unlocks Plaguedust in round two and Wraithbloom in round three", () => {
    const roundOne = createInitialState();
    const availability = (state: typeof roundOne, id: string) => state.market.find((item) => item.id === id)?.available;
    expect(availability(roundOne, "m-yellow-1")).toBe(false);
    expect(availability(roundOne, "m-purple-1")).toBe(false);

    const roundTwo = advanceToNextRound(roundOne);
    expect(availability(roundTwo, "m-yellow-1")).toBe(true);
    expect(availability(roundTwo, "m-purple-1")).toBe(false);

    const roundThree = advanceToNextRound(roundTwo);
    expect(availability(roundThree, "m-yellow-1")).toBe(true);
    expect(availability(roundThree, "m-purple-1")).toBe(true);
  });

  it("blue ruby effects check the chip landing space, not the following scoring space", () => {
    const books3 = createRecipeBooks(3);
    const blue = token("ruby-blue", "blue", 1);
    const onRuby = { ...player("human"), crucible: placeToken(createCrucible(), blue, 4) };
    const beforeRuby = { ...player("human"), crucible: placeToken(createCrucible(), blue, 3) };

    expect(applyBlueImmediate(onRuby, blue, books3).rubies).toBe(1);
    expect(applyBlueImmediate(beforeRuby, blue, books3).rubies).toBe(0);
  });

  it("Frostbile sets two through four respect protection value and landing-space rewards", () => {
    const blueFour = token("blue-four-boundary", "blue", 4);
    const protectedPlayer = applyBlueImmediate(player("human"), blueFour, createRecipeBooks(2));
    expect(protectedPlayer.blueProtectionDraws).toBe(4);

    const onRuby = { ...player("human"), crucible: placeToken(createCrucible(), blueFour, 4) };
    const offRuby = { ...player("human"), crucible: placeToken(createCrucible(), blueFour, 5) };
    expect(applyBlueImmediate(onRuby, blueFour, createRecipeBooks(3)).rubies).toBe(1);
    expect(applyBlueImmediate(offRuby, blueFour, createRecipeBooks(3)).rubies).toBe(0);
    expect(applyBlueImmediate(onRuby, blueFour, createRecipeBooks(4)).score).toBe(4);
    expect(applyBlueImmediate(offRuby, blueFour, createRecipeBooks(4)).score).toBe(0);
  });

  it("Plaguedust set four scales only its first three chips", () => {
    const state = { ...createInitialState(4), currentOmen: null };
    let current = player("human");
    const movements: number[] = [];
    for (let index = 1; index <= 4; index += 1) {
      const before = current.crucible.filledUpTo;
      current = placeTokenForActiveBooks(current, token(`yellow-scale-${index}`, "yellow", 1), state);
      movements.push(current.crucible.filledUpTo - before);
    }
    expect(movements).toEqual([2, 3, 4, 1]);
  });

  it("Deathweave effects inspect only the final two placed chips", () => {
    const makePot = () => {
      let current = player("human");
      current = { ...current, rubies: 3, crucible: placeToken(current.crucible, token("green-old", "green", 4)) };
      current = { ...current, crucible: placeToken(current.crucible, token("orange-middle", "orange", 1)) };
      current = { ...current, crucible: placeToken(current.crucible, token("green-last", "green", 1)) };
      return current;
    };

    const setOne = applyEndOfRoundEffects(makePot(), undefined, createRecipeBooks(1), { autoPurple: false });
    expect(setOne.rubies).toBe(4);
    const setTwoRewards = greenSetTwoRewards(makePot(), createRecipeBooks(2));
    expect(setTwoRewards.map((reward) => reward.sourceTokenId)).toEqual(["green-last"]);
    expect(greenSetFourSpendMax(makePot(), createRecipeBooks(4))).toBe(1);
  });

  it("Wraithbloom choices unlock at exactly one, two, and three drawn chips", () => {
    const withPurples = (count: number) => {
      let current = player("human");
      current = { ...current, crucible: placeToken(current.crucible, token("upgrade-one", "green", 1)) };
      current = { ...current, crucible: placeToken(current.crucible, token("upgrade-two", "red", 2)) };
      for (let index = 1; index <= count; index += 1) {
        current = { ...current, crucible: placeToken(current.crucible, token(`purple-threshold-${index}`, "purple", 1)) };
      }
      return current;
    };
    const ids = (set: 1 | 2 | 4, count: number) => purpleChoices(withPurples(count), createRecipeBooks(set)).map((choice) => choice.id);

    expect(ids(1, 1)).toEqual(["skip", "p1-1"]);
    expect(ids(1, 2)).toEqual(["skip", "p1-1", "p1-2"]);
    expect(ids(1, 3)).toEqual(["skip", "p1-1", "p1-2", "p1-3"]);
    expect(ids(2, 1)).toEqual(["skip", "p2-1"]);
    expect(ids(2, 2)).toEqual(["skip", "p2-1", "p2-2"]);
    expect(ids(2, 3)).toEqual(["skip", "p2-1", "p2-2", "p2-3"]);
    expect(ids(4, 1)).toContain("p4-upgrade-one-1-2");
    expect(ids(4, 1)).not.toContain("p4-upgrade-two-2-4");
    expect(ids(4, 2)).toContain("p4-upgrade-two-2-4");
    expect(ids(4, 2)).not.toContain("p4-upgrade-one-1-4");
    expect(ids(4, 3)).toContain("p4-upgrade-one-1-4");
  });

  it("green set four ruby spend is optional and bounded", () => {
    const books4 = createRecipeBooks(4);
    let p = player("human");
    p = { ...p, rubies: 2, crucible: placeToken(p.crucible, token("g1", "green", 1)) };
    p = { ...p, crucible: placeToken(p.crucible, token("g2", "green", 1)) };

    expect(greenSetFourSpendMax(p, books4)).toBe(2);

    const updated = applyGreenSetFourSpend(p, 1);
    expect(updated.rubies).toBe(1);
    expect(updated.crucible.dropletPosition).toBe(1);
  });

  it("green set three exposes optional final-chip movement at exactly seven pressure", () => {
    const books3 = createRecipeBooks(3);
    let p = player("human");
    p = { ...p, crucible: placeToken(p.crucible, token("green-three", "green", 2)) };
    p = { ...p, crucible: placeToken(p.crucible, token("white-three", "white", 3)) };
    p = { ...p, crucible: placeToken(p.crucible, token("white-two-a", "white", 2)) };
    p = { ...p, crucible: placeToken(p.crucible, token("white-two-b", "white", 2)) };
    const before = p.crucible.filledUpTo;

    expect(greenSetThreeMoveAmount(p, books3)).toBe(2);
    expect(applyEndOfRoundEffects(p, undefined, books3, { autoGreenSetThree: false }).crucible.filledUpTo).toBe(before);
    expect(applyGreenSetThreeMove(p, 2).crucible.filledUpTo).toBe(before + 2);
  });

  it("lets the human decline green set three movement", () => {
    const state = createInitialState(3);
    const human = state.players[0];
    useGameStore.setState({
      state: {
        ...state,
        phase: "green_move_choice",
        pendingGreenMoveAmount: 3,
        phaseAfterGreenChoice: "market",
      },
    });
    const before = human.crucible.filledUpTo;

    useGameStore.getState().humanResolveGreenMove(false);

    expect(useGameStore.getState().state.players[0].crucible.filledUpTo).toBe(before);
    expect(useGameStore.getState().state.phase).toBe("market");
    expect(useGameStore.getState().state.pendingGreenMoveAmount).toBeUndefined();
  });

  it("lets the human decline Bloodthorn set three extra movement", () => {
    const state = createInitialState(3);
    const white = token("red-choice-white", "white", 2);
    const red = token("red-choice", "red", 1);
    const human = {
      ...state.players[0],
      bag: { tokens: [red] },
      crucible: placeToken(createCrucible(), white),
    };
    useGameStore.setState({ state: { ...state, phase: "brewing", players: [human, ...state.players.slice(1)] } });

    useGameStore.getState().humanDraw();
    expect(useGameStore.getState().state.phase).toBe("movement_choice");
    expect(useGameStore.getState().state.pendingMovementChoice).toEqual({ amount: 2, source: "red" });
    expect(useGameStore.getState().state.players[0].crucible.filledUpTo).toBe(3);

    useGameStore.getState().humanResolveMovement(false);
    expect(useGameStore.getState().state.players[0].crucible.filledUpTo).toBe(3);
    expect(useGameStore.getState().state.phase).toBe("brewing");
  });

  it("lets the human apply Plaguedust set four optional movement", () => {
    const state = createInitialState(4);
    const yellow = token("yellow-choice", "yellow", 1);
    const human = { ...state.players[0], bag: { tokens: [yellow] } };
    useGameStore.setState({ state: { ...state, phase: "brewing", players: [human, ...state.players.slice(1)] } });

    useGameStore.getState().humanDraw();
    expect(useGameStore.getState().state.pendingMovementChoice).toEqual({ amount: 1, source: "yellow" });
    expect(useGameStore.getState().state.players[0].crucible.filledUpTo).toBe(1);

    useGameStore.getState().humanResolveMovement(true);
    expect(useGameStore.getState().state.players[0].crucible.filledUpTo).toBe(2);
    expect(useGameStore.getState().state.pendingMovementChoice).toBeUndefined();
  });

  it("green set two rewards depend on qualifying chip values", () => {
    const books2 = createRecipeBooks(2);
    let p = player("human");
    p = { ...p, crucible: placeToken(p.crucible, token("g2", "green", 2)) };
    p = { ...p, crucible: placeToken(p.crucible, token("g4", "green", 4)) };

    const rewards = greenSetTwoRewards(p, books2);

    expect(rewards).toHaveLength(2);
    expect(rewards[0].options).toEqual([
      { color: "blue", value: 1 },
      { color: "red", value: 1 },
    ]);
    expect(rewards[1].options).toEqual([
      { color: "yellow", value: 1 },
      { color: "purple", value: 1 },
    ]);
  });

  it("red set two reserve can persist beside the pot into later rounds", () => {
    let state = createInitialState(2);
    const reserved = token("r1", "red", 1);
    state = {
      ...state,
      players: state.players.map((p) =>
        p.id === "human" ? { ...p, redReserve: [reserved] } : p
      ),
    };

    const next = advanceToNextRound(state);
    const human = next.players.find((p) => p.id === "human")!;

    expect(human.redReserve?.map((t) => t.id)).toEqual([reserved.id]);
  });

  it("purple set one can take lower rewards", () => {
    let p = player("human");
    p = { ...p, crucible: placeToken(p.crucible, token("p1", "purple", 1)) };
    p = { ...p, crucible: placeToken(p.crucible, token("p2", "purple", 1)) };
    p = { ...p, crucible: placeToken(p.crucible, token("p3", "purple", 1)) };

    const choices = purpleChoices(p, createRecipeBooks(1));
    const lower = choices.find((choice) => choice.kind === "set1" && choice.level === 2)!;
    const updated = applyPurpleChoice(p, lower);

    expect(updated.score).toBe(1);
    expect(updated.rubies).toBe(1);
    expect(updated.crucible.dropletPosition).toBe(0);
  });

  it("purple set two trades drawn purple chips for rewards", () => {
    let p = player("human");
    p = { ...p, crucible: placeToken(p.crucible, token("p1", "purple", 1)) };
    p = { ...p, crucible: placeToken(p.crucible, token("p2", "purple", 1)) };

    const choices = purpleChoices(p, createRecipeBooks(2));
    const trade = choices.find((choice) => choice.kind === "set2" && choice.tradeCount === 2)!;
    const updated = applyPurpleChoice(p, trade);

    expect(updated.score).toBe(3);
    expect(updated.crucible.dropletPosition).toBe(1);
    expect(updated.bag.tokens.some((t) => t.color === "green" && t.value === 1)).toBe(true);
    expect(updated.bag.tokens.some((t) => t.color === "blue" && t.value === 2)).toBe(true);
    expect(updated.crucible.slots.some((slot) => slot.token?.color === "purple")).toBe(false);
  });

  it("returns traded Wraithbloom and consumes finite reward stock", () => {
    const state = createInitialState(2);
    const choice = { id: "p2-2", label: "trade", kind: "set2" as const, tradeCount: 2 as const };
    const purpleBefore = state.market.find((item) => item.id === "m-purple-1")!.stock;
    const greenBefore = state.market.find((item) => item.id === "m-green-1")!.stock;
    const blueBefore = state.market.find((item) => item.id === "m-blue-2")!.stock;

    const market = applyPurpleChoiceStock(state.market, choice, state.currentRound);

    expect(market.find((item) => item.id === "m-purple-1")!.stock).toBe(purpleBefore + 2);
    expect(market.find((item) => item.id === "m-green-1")!.stock).toBe(greenBefore - 1);
    expect(market.find((item) => item.id === "m-blue-2")!.stock).toBe(blueBefore - 1);
  });

  it("resolves finite Wraithbloom exchanges in rotating starting-player order", () => {
    const makePurplePlayer = (p: Player) => ({
      ...p,
      crucible: placeToken(p.crucible, token(`ordered-purple-${p.id}`, "purple", 1)),
    });

    const aiFirst = createInitialState(2, 2);
    const aiFirstPlayers = aiFirst.players.map(makePurplePlayer);
    useGameStore.setState({
      state: {
        ...aiFirst,
        players: aiFirstPlayers,
        activePlayerIndex: 1,
        phase: "end_of_round",
        currentOmen: null,
        market: aiFirst.market.map((item) => item.id === "m-black-1" ? { ...item, stock: 1 } : item),
      },
    });
    useGameStore.getState().commitAIBrewsAndResolve(aiFirstPlayers.filter((p) => p.kind === "ai"));
    let resolved = useGameStore.getState().state;
    expect(resolved.market.find((item) => item.id === "m-black-1")?.stock).toBe(0);
    expect(resolved.players.find((p) => p.id === "ai")?.bag.tokens.some((item) => item.color === "black")).toBe(true);
    expect(resolved.players.find((p) => p.id === "human")?.bag.tokens.some((item) => item.color === "black")).toBe(false);

    const humanFirst = createInitialState(2, 2);
    const humanFirstPlayers = humanFirst.players.map(makePurplePlayer);
    useGameStore.setState({
      state: {
        ...humanFirst,
        players: humanFirstPlayers,
        activePlayerIndex: 0,
        phase: "end_of_round",
        currentOmen: null,
        market: humanFirst.market.map((item) => item.id === "m-black-1" ? { ...item, stock: 1 } : item),
      },
    });
    useGameStore.getState().commitAIBrewsAndResolve(humanFirstPlayers.filter((p) => p.kind === "ai"));
    expect(useGameStore.getState().state.phase).toBe("purple_choice");
    expect(useGameStore.getState().state.market.find((item) => item.id === "m-black-1")?.stock).toBe(1);
    useGameStore.getState().humanResolvePurple("p2-1");

    resolved = useGameStore.getState().state;
    expect(resolved.market.find((item) => item.id === "m-black-1")?.stock).toBe(0);
    expect(resolved.players.find((p) => p.id === "human")?.bag.tokens.some((item) => item.color === "black")).toBe(true);
    expect(resolved.players.filter((p) => p.kind === "ai").every((p) => !p.bag.tokens.some((item) => item.color === "black"))).toBe(true);
  });

  it("resolves finite Deathweave rewards in rotating starting-player order", () => {
    const makeGreenPlayer = (p: Player) => ({
      ...p,
      crucible: placeToken(p.crucible, token(`ordered-green-${p.id}`, "green", 1)),
    });
    const greenRewardCount = (p: Player | undefined) => p?.bag.tokens.filter((item) => item.id.includes("green-reward")).length ?? 0;

    const aiFirst = createInitialState(2, 2);
    const aiFirstPlayers = aiFirst.players.map(makeGreenPlayer);
    useGameStore.setState({
      state: {
        ...aiFirst,
        players: aiFirstPlayers,
        activePlayerIndex: 1,
        phase: "end_of_round",
        currentOmen: null,
        market: aiFirst.market.map((item) => item.id === "m-orange-1" ? { ...item, stock: 1 } : item),
      },
    });
    useGameStore.getState().commitAIBrewsAndResolve(aiFirstPlayers.filter((p) => p.kind === "ai"));
    let resolved = useGameStore.getState().state;
    expect(resolved.market.find((item) => item.id === "m-orange-1")?.stock).toBe(0);
    expect(greenRewardCount(resolved.players.find((p) => p.id === "ai"))).toBe(1);
    expect(greenRewardCount(resolved.players.find((p) => p.id === "human"))).toBe(0);

    const humanFirst = createInitialState(2, 2);
    const humanFirstPlayers = humanFirst.players.map(makeGreenPlayer);
    useGameStore.setState({
      state: {
        ...humanFirst,
        players: humanFirstPlayers,
        activePlayerIndex: 0,
        phase: "end_of_round",
        currentOmen: null,
        market: humanFirst.market.map((item) => item.id === "m-orange-1" ? { ...item, stock: 1 } : item),
      },
    });
    useGameStore.getState().commitAIBrewsAndResolve(humanFirstPlayers.filter((p) => p.kind === "ai"));
    expect(useGameStore.getState().state.phase).toBe("green_reward_choice");
    expect(useGameStore.getState().state.market.find((item) => item.id === "m-orange-1")?.stock).toBe(1);
    useGameStore.getState().humanResolveGreenReward("orange", 1);

    resolved = useGameStore.getState().state;
    expect(resolved.market.find((item) => item.id === "m-orange-1")?.stock).toBe(0);
    expect(greenRewardCount(resolved.players.find((p) => p.id === "human"))).toBe(1);
    expect(greenRewardCount(resolved.players.find((p) => p.id === "ai"))).toBe(0);
  });

  it("hides a Wraithbloom exchange when any required reward is out of stock", () => {
    const state = createInitialState(2);
    const choice = { id: "p2-2", label: "trade", kind: "set2" as const, tradeCount: 2 as const };
    const depleted = state.market.map((item) => item.id === "m-blue-2" ? { ...item, stock: 0, available: false } : item);

    expect(legalPurpleChoices(depleted, [choice])).toEqual([]);
  });

  it("returns an upgraded chip to stock and consumes its replacement", () => {
    const state = createInitialState(4);
    const choice = {
      id: "p4-green", label: "upgrade", kind: "set4" as const,
      tokenId: "green", color: "green" as const, fromValue: 1 as const, toValue: 2 as const,
    };
    const sourceBefore = state.market.find((item) => item.id === "m-green-1")!.stock;
    const targetBefore = state.market.find((item) => item.id === "m-green-2")!.stock;

    const market = applyPurpleChoiceStock(state.market, choice, state.currentRound);

    expect(market.find((item) => item.id === "m-green-1")!.stock).toBe(sourceBefore + 1);
    expect(market.find((item) => item.id === "m-green-2")!.stock).toBe(targetBefore - 1);
  });

  it("purple set four upgrades an eligible placed chip into the bag", () => {
    let p = player("human");
    const green = token("g1", "green", 1);
    p = { ...p, crucible: placeToken(p.crucible, green) };
    p = { ...p, crucible: placeToken(p.crucible, token("p1", "purple", 1)) };
    p = { ...p, crucible: placeToken(p.crucible, token("p2", "purple", 1)) };
    p = { ...p, crucible: placeToken(p.crucible, token("p3", "purple", 1)) };

    const choices = purpleChoices(p, createRecipeBooks(4));
    const upgrade = choices.find((choice) => choice.kind === "set4" && choice.toValue === 4)!;
    const updated = applyPurpleChoice(p, upgrade);

    expect(updated.crucible.slots.some((slot) => slot.token?.id === green.id)).toBe(false);
    expect(updated.bag.tokens.some((t) => t.color === "green" && t.value === 4)).toBe(true);
  });
});
