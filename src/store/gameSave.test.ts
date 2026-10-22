import { describe, expect, it } from "vitest";
import { createInitialState } from "./gameStoreHelpers";
import { createInitialStateWithSetup } from "./gameStoreHelpers";
import { deserializeGameState, GAME_SAVE_VERSION, serializeGameState } from "./gameSave";
import { createGameSetup } from "../game/contentPacks";

describe("game save format", () => {
  it("round-trips every active gameplay field", () => {
    const state = createInitialState("random", 3, "master");
    state.phase = "brewing";
    state.currentRound = 5;
    state.players[0].rubies = 4;
    state.marketCompletedPlayerIds = ["ai-1"];

    expect(deserializeGameState(serializeGameState(state))).toEqual(state);
  });

  it("rejects corrupt and unsupported saves", () => {
    expect(deserializeGameState("not-json")).toBeNull();
    expect(deserializeGameState(JSON.stringify({ version: GAME_SAVE_VERSION + 1, state: {} }))).toBeNull();
  });

  it("migrates saves created before AI difficulty was recorded", () => {
    const state = createInitialState(2, 1, "master") as unknown as Record<string, unknown>;
    delete state.aiDifficulty;
    for (const player of state.players as Array<{ crucible: Record<string, unknown> }>) {
      delete player.crucible.overflowEnabled;
      delete player.crucible.overflowTokens;
    }
    const raw = JSON.stringify({ version: 1, savedAt: new Date().toISOString(), state });

    const migrated = deserializeGameState(raw);
    expect(migrated?.aiDifficulty).toBe("skilled");
    expect(migrated?.setup).toEqual(createGameSetup({ totalPlayers: 2, recipeMode: 2 }));
    expect(migrated?.players.every((player) => !player.crucible.overflowEnabled && player.crucible.overflowTokens.length === 0)).toBe(true);
  });

  it("round-trips a five-player expansion setup", () => {
    const setup = createGameSetup({
      totalPlayers: 5,
      recipeMode: "random",
      enabledPacks: ["covenants_of_the_mire", "distillers_of_the_veil"],
    });
    const state = createInitialStateWithSetup(setup, "master");
    state.players[0].bag.tokens.push({ id: "echo-saved", color: "echo", value: 0, resolvedMovement: 3 });
    state.players[0].crucible.overflowTokens.push({ id: "runoff-saved", color: "orange", value: 6 });

    expect(deserializeGameState(serializeGameState(state))).toEqual(state);
  });

  it("round-trips a pending Veilglass Remedy without consuming it", () => {
    const setup = createGameSetup({ enabledPacks: ["distillers_of_the_veil"] });
    const state = createInitialStateWithSetup(setup, "master");
    state.currentRound = 6;
    state.phase = "omen";
    state.players[0].affliction = {
      ...state.players[0].affliction!,
      contractId: "embersleep",
      totalDistillate: 19,
      lastProgress: 5,
      lastPrestige: 3,
      lastDropletSteps: 0,
      lastHeadStart: 2,
      pendingHeadStart: 2,
    };

    const restored = deserializeGameState(serializeGameState(state));
    expect(restored).toEqual(state);
    expect(restored?.players[0].affliction?.pendingHeadStart).toBe(2);
  });
});
