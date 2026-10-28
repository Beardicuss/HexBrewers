import { describe, expect, it } from "vitest";
import { createGameSetup } from "./contentPacks";
import { createInitialStateWithSetup } from "../store/gameStoreHelpers";
import { bankEmber, canBankEmber, hasPreparedEmber } from "./preparation";
import { placeTokenForActiveBooks } from "./brewingRules";

describe("Ashenveil Ritual preparation", () => {
  it("banks one next-round Ember only after a genuinely early safe stop", () => {
    const state = createInitialStateWithSetup(createGameSetup({ totalPlayers: 2 }), "skilled", "ashenveil");
    const human = state.players[0];
    expect(canBankEmber(human, state)).toBe(true);
    expect(bankEmber(human, state).preparedEmberForRound).toBe(2);
    expect(canBankEmber({ ...human, crucible: { ...human.crucible, whiteSum: 4 } }, state)).toBe(false);
  });

  it("spends the Ember on the first colored ingredient and not on a Voidshard", () => {
    const base = createInitialStateWithSetup(createGameSetup({ totalPlayers: 2 }), "skilled", "ashenveil");
    const state = { ...base, currentRound: 2 };
    const prepared = { ...state.players[0], preparedEmberForRound: 2 };
    expect(hasPreparedEmber(prepared, state)).toBe(true);
    const afterWhite = placeTokenForActiveBooks(prepared, { id: "w", color: "white", value: 1 }, state);
    expect(afterWhite.preparedEmberForRound).toBe(2);
    const afterColor = placeTokenForActiveBooks(afterWhite, { id: "o", color: "orange", value: 1 }, state);
    expect(afterColor.crucible.placements[afterColor.crucible.placements.length - 1]?.movement).toBe(2);
    expect(afterColor.preparedEmberForRound).toBeUndefined();
    expect(afterColor.preparedEmberUsedRound).toBe(2);
  });

  it("does not bank after the final round", () => {
    const base = createInitialStateWithSetup(createGameSetup({ totalPlayers: 2 }), "skilled", "ashenveil");
    const state = { ...base, currentRound: 9 };
    expect(canBankEmber(state.players[0], state)).toBe(false);
  });
});
