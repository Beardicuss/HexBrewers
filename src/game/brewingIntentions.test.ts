import { beforeEach, describe, expect, it } from "vitest";
import { createGameSetup } from "./contentPacks";
import { applyIntentionAfterPlacement, applyIntentionRoundReward, BREWING_INTENTIONS, chooseAIIntention } from "./brewingIntentions";
import { createInitialStateWithSetup } from "../store/gameStoreHelpers";
import { useGameStore } from "../store/gameStore";
import { AITurnAnimator } from "./AITurnAnimator";

describe("Ashenveil Ritual brewing intentions", () => {
  beforeEach(() => {
    useGameStore.setState({
      state: createInitialStateWithSetup(createGameSetup({ totalPlayers: 2 }), "skilled", "ashenveil"),
    });
  });

  it("defines three promises with an explicit benefit and price", () => {
    expect(BREWING_INTENTIONS.map((entry) => entry.id)).toEqual(["temper", "court", "glory"]);
    expect(BREWING_INTENTIONS.every((entry) => entry.benefit.length > 20 && entry.cost.length > 20)).toBe(true);
  });

  it("records the human vow and a deterministic rival vow before brewing", () => {
    const before = useGameStore.getState().state;
    useGameStore.setState({ state: { ...before, phase: "intention" } });

    useGameStore.getState().selectBrewingIntention("court");
    const after = useGameStore.getState().state;
    const rival = after.players.find((player) => player.kind === "ai")!;

    expect(after.phase).toBe("brewing");
    expect(after.intentionRound).toBe(1);
    expect(after.roundIntentions?.human).toBe("court");
    expect(after.roundIntentions?.[rival.id]).toBe(chooseAIIntention(rival, 1));
  });

  it("lets rival doctrines answer public Omens and round objectives", () => {
    const base = useGameStore.getState().state;
    const shade = { ...base.players.find((player) => player.kind === "ai")!, id: "ai", name: "The Shade" };
    const wraith = { ...shade, id: "ai-2", name: "The Wraith" };
    const seer = { ...shade, id: "ai-3", name: "The Seer" };
    const hollow = { ...shade, id: "ai-4", name: "The Hollow", score: 0 };
    const scoringOmen = {
      id: "test-reward",
      title: "A Rewarding Omen",
      description: "Test",
      summary: "Test",
      effect: { type: "gain_vp" as const, amount: 1 },
    };
    const state = { ...base, currentOmen: scoringOmen, players: [{ ...base.players[0], score: 8 }, shade, wraith, seer, hollow] };

    expect(chooseAIIntention(wraith, 4, state)).toBe("court");
    expect(chooseAIIntention(seer, 5, state)).toBe("temper");
    expect(chooseAIIntention(shade, 6, state)).toBe("glory");
    expect(chooseAIIntention(hollow, 4, state)).toBe("court");
  });

  it("does not allow Standard Ritual to bind an intention", () => {
    const standard = createInitialStateWithSetup(createGameSetup({ totalPlayers: 2 }), "skilled", "standard");
    useGameStore.setState({ state: { ...standard, phase: "intention" } });
    useGameStore.getState().selectBrewingIntention("glory");
    expect(useGameStore.getState().state.roundIntentions?.human).toBeUndefined();
  });

  it("wards Temper's first shattering draw but not the second", () => {
    const state = { ...useGameStore.getState().state, roundIntentions: { human: "temper" as const } };
    const human = state.players.find((player) => player.id === "human")!;
    const shattered = { ...human, crucible: { ...human.crucible, whiteSum: 8, exploded: true } };
    const warded = applyIntentionAfterPlacement(shattered, state);
    expect(warded.crucible.exploded).toBe(false);
    expect(warded.intentionWardUsedRound).toBe(1);
    expect(applyIntentionAfterPlacement({ ...warded, crucible: { ...warded.crucible, exploded: true } }, state).crucible.exploded).toBe(true);
  });

  it("makes seven pressure shatter under Glory", () => {
    const state = { ...useGameStore.getState().state, roundIntentions: { human: "glory" as const } };
    const human = state.players.find((player) => player.id === "human")!;
    const resolved = applyIntentionAfterPlacement(
      { ...human, crucible: { ...human.crucible, whiteSum: 7, exploded: false } },
      state,
    );
    expect(resolved.crucible.exploded).toBe(true);
  });

  it("repeats a positive Omen reward for Court and charges a coin when unanswered", () => {
    const state = { ...useGameStore.getState().state, roundIntentions: { human: "court" as const } };
    const human = { ...state.players.find((player) => player.id === "human")!, score: 4, rubies: 1, coinsThisRound: 6 };
    const result = { space: 10, vp: 2, coins: 8, ruby: false, exploded: false };
    expect(applyIntentionRoundReward(human, result, state, { bonusPoints: 1, bonusRubies: 1 })).toMatchObject({ score: 5, rubies: 2, coinsThisRound: 6 });
    expect(applyIntentionRoundReward(human, result, state, { bonusPoints: 0, bonusRubies: 0 }).coinsThisRound).toBe(5);
  });

  it("pays Glory only for a surviving ambitious scoring space", () => {
    const state = { ...useGameStore.getState().state, roundIntentions: { human: "glory" as const } };
    const human = { ...state.players.find((player) => player.id === "human")!, score: 3 };
    const result = { space: 10, vp: 2, coins: 8, ruby: false, exploded: false };
    expect(applyIntentionRoundReward(human, result, state, { bonusPoints: 0, bonusRubies: 0 }).score).toBe(5);
    expect(applyIntentionRoundReward(human, { ...result, space: 9 }, state, { bonusPoints: 0, bonusRubies: 0 }).score).toBe(3);
  });

  it("offers one paid Scry, preserves the unchosen token, and binds the chosen next draw", () => {
    const initial = useGameStore.getState().state;
    useGameStore.setState({ state: { ...initial, phase: "brewing" } });
    const bagCount = initial.players.find((player) => player.id === "human")!.bag.tokens.length;

    useGameStore.getState().humanBeginScry();
    const offered = useGameStore.getState().state;
    expect(offered.phase).toBe("scry_choice");
    expect(offered.pendingScryTokens).toHaveLength(2);
    expect(offered.players.find((player) => player.id === "human")!.bag.tokens).toHaveLength(bagCount);

    const chosen = offered.pendingScryTokens![0];
    useGameStore.getState().humanResolveScry(chosen.id);
    const bound = useGameStore.getState().state;
    const human = bound.players.find((player) => player.id === "human")!;
    expect(bound.phase).toBe("brewing");
    expect(bound.scryPreparedTokenId).toBe(chosen.id);
    expect(human.rubies).toBe(0);
    expect(human.scryUsedRound).toBe(bound.currentRound);
    expect(human.bag.tokens).toHaveLength(bagCount);
  });

  it("cannot Scry in Standard Ritual", () => {
    const standard = createInitialStateWithSetup(createGameSetup({ totalPlayers: 2 }), "skilled", "standard");
    useGameStore.setState({ state: { ...standard, phase: "brewing" } });
    useGameStore.getState().humanBeginScry();
    expect(useGameStore.getState().state.phase).toBe("brewing");
    expect(useGameStore.getState().state.pendingScryTokens).toBeUndefined();
  });

  it("gives rivals the same once-per-round paid Scry rule", async () => {
    const state = useGameStore.getState().state;
    const rival = state.players.find((player) => player.kind === "ai")!;
    const animator = new AITurnAnimator();
    animator.setFastForward(true);
    const resolved = await animator.run(rival, state);
    expect(resolved.scryUsedRound).toBe(state.currentRound);
    expect(resolved.rubies).toBe(rival.rubies - 1);
  });
});

