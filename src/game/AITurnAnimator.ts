import type { Player } from "./playerTypes";
import type { GameState } from "./gameState";
import type { Token } from "./tokenTypes";
import type { ExplodedChoice } from "./scoring";
import { drawToken } from "./bag";
import { getExplosionThreshold, placeToken, hasExploded } from "./crucible";
import { decideBrewingAction, decideFlaskUse } from "./ai";
import { canUseFlask, useFlask } from "./flask";
import { redBonusValue, applyYellowImmediate, applyBlueImmediate, countPlacedColor, drawBlueBonus } from "./chipEffects";
import { getRecipeSetForColor } from "./recipeBooks";

export type AITurnEvent =
  | { type: "thinking"; message: string }
  | { type: "draw"; token: Token; player: Player }
  | { type: "flask"; token: Token }
  | { type: "stop"; player: Player }
  | { type: "exploded"; player: Player }
  | { type: "scored"; vp: number; coins: number; choice?: ExplodedChoice }
  | { type: "done"; player: Player };

export type AIEventListener = (event: AITurnEvent) => void;

const TIMING = {
  thinkingBeforeFirstDraw: 800,
  betweenDraws: 550,
  thinkingPause: 350,
  afterExplosion: 1100,
  afterStop: 600,
};

const MSGS = {
  start: ["The Shade reaches into the darkness...", "Ancient hands stir the bag...", "The Shade calculates..."],
  drawing: ["Draws again...", "Reaches deeper...", "Unflinching, The Shade draws..."],
  risky: ["The pressure builds... yet The Shade continues.", "Dangerous. Another draw.", "The void beckons."],
  stopping: ["The Shade withdraws its hand.", "Enough. The brew is sealed.", "A precise stop."],
  exploded: ["The crucible fractures!", "Too far. The darkness consumes the brew.", "Shattered."],
  surviving: ["A perfect brew.", "The Shade survives — again.", "Controlled. Precise."],
};

const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
const wait = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));

function hasPlacedColor(player: Player, color: Token["color"]): boolean {
  return player.crucible.slots.some((slot) => slot.token?.color === color);
}

function movementForToken(player: Player, token: Token, state: GameState): number {
  let movement = token.value;
  if (token.color === "red") movement += redBonusValue(player.crucible, state.recipeBooks);
  if (
    token.color === "white" &&
    token.value === 1 &&
    getRecipeSetForColor(state.recipeBooks, "red") === 4 &&
    hasPlacedColor(player, "red")
  ) {
    movement += 1;
  }
  if (player.yellowDoubleNext) movement *= 2;
  if (token.color === "yellow" && getRecipeSetForColor(state.recipeBooks, "yellow") === 4) {
    movement += countPlacedColor(player.crucible, "yellow") + 1;
  }
  return movement;
}

function placeTokenWithActiveBooks(player: Player, token: Token, state: GameState): Player {
  const previousToken = player.crucible.lastDrawnToken;
  const threshold = getRecipeSetForColor(state.recipeBooks, "yellow") === 3
    ? getExplosionThreshold(player.crucible)
    : 7;
  let updated: Player = {
    ...player,
    yellowDoubleNext: player.yellowDoubleNext ? false : player.yellowDoubleNext,
    crucible: placeToken(player.crucible, token, movementForToken(player, token, state), threshold),
  };

  if (updated.crucible.exploded && (updated.blueProtectionDraws ?? 0) > 0) {
    updated = {
      ...updated,
      blueProtectionDraws: 0,
      crucible: { ...updated.crucible, exploded: false },
    };
  } else if ((updated.blueProtectionDraws ?? 0) > 0) {
    updated = { ...updated, blueProtectionDraws: Math.max(0, (updated.blueProtectionDraws ?? 0) - 1) };
  }

  if (token.color === "yellow") {
    updated = applyYellowImmediate(updated, previousToken, state.recipeBooks);
  }

  if (token.color === "blue") {
    updated = applyBlueImmediate(updated, token, state.recipeBooks);
  }

  return updated;
}

function chooseAIBlueKeep(tokens: Token[], player: Player): Token | null {
  const capacity = 7 - player.crucible.whiteSum;
  const ranked = tokens
    .map((token) => {
      if (token.color === "white" && token.value > capacity) return { token, score: -100 };
      const colorScore =
        token.color === "white" ? -2 :
          token.color === "orange" ? 1 :
            token.color === "green" ? 2 :
              token.color === "red" ? 2.5 :
                token.color === "yellow" ? 2.25 :
                  token.color === "purple" ? 3 :
                    token.color === "black" ? 3 : 2;
      return { token, score: token.value + colorScore };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  return ranked[0]?.token ?? null;
}

export class AITurnAnimator {
  private listener: AIEventListener | null = null;

  onEvent(listener: AIEventListener) { this.listener = listener; }
  private emit(event: AITurnEvent) { this.listener?.(event); }

  async run(aiPlayer: Player, state: GameState): Promise<Player> {
    this.emit({ type: "thinking", message: pick(MSGS.start) });
    await wait(TIMING.thinkingBeforeFirstDraw);

    let current = aiPlayer;
    let drawCount = 0;

    while (true) {
      const decision = decideBrewingAction(current, state);
      if (decision === "stop") {
        this.emit({ type: "thinking", message: pick(MSGS.stopping) });
        await wait(TIMING.afterStop);
        this.emit({ type: "stop", player: current });
        break;
      }

      const drawn = drawToken(current.bag);
      if (!drawn) { this.emit({ type: "stop", player: current }); break; }

      drawCount++;
      current = placeTokenWithActiveBooks({ ...current, bag: drawn.bag }, drawn.token, state);
      const updatedCrucible = current.crucible;

      // Flask check (must check canUseFlask AFTER placing — official rule)
      if (drawn.token.color === "white" && !updatedCrucible.exploded && canUseFlask(current)) {
        const shouldFlask = decideFlaskUse(current, state);
        if (shouldFlask) {
          this.emit({ type: "flask", token: drawn.token });
          current = useFlask(current);
          await wait(TIMING.betweenDraws);
          continue;
        }
      }

      const isRisky = current.crucible.whiteSum >= 4;
      const msg = isRisky ? pick(MSGS.risky) : drawCount > 1 ? pick(MSGS.drawing) : "";
      if (msg) this.emit({ type: "thinking", message: msg });

      this.emit({ type: "draw", token: drawn.token, player: current });
      await wait(TIMING.betweenDraws);

      let blueSource = drawn.token.color === "blue" && getRecipeSetForColor(state.recipeBooks, "blue") === 1 && !current.crucible.exploded ? drawn.token : null;
      while (blueSource && !current.crucible.exploded) {
        const bonus = drawBlueBonus(current.bag, blueSource.value);
        const kept = chooseAIBlueKeep(bonus.drawn, current);
        const returned = bonus.drawn.filter((token) => token.id !== kept?.id);
        current = { ...current, bag: { tokens: [...bonus.bag.tokens, ...returned] } };

        if (!kept) break;

        current = placeTokenWithActiveBooks(current, kept, state);
        this.emit({ type: "draw", token: kept, player: current });
        await wait(TIMING.betweenDraws);

        if (hasExploded(current.crucible)) break;
        blueSource = kept.color === "blue" && getRecipeSetForColor(state.recipeBooks, "blue") === 1 ? kept : null;
      }

      if (hasExploded(current.crucible)) {
        this.emit({ type: "thinking", message: pick(MSGS.exploded) });
        await wait(TIMING.thinkingPause);
        this.emit({ type: "exploded", player: current });
        await wait(TIMING.afterExplosion);
        break;
      }
    }

    if (!current.crucible.exploded) {
      this.emit({ type: "thinking", message: pick(MSGS.surviving) });
      await wait(TIMING.thinkingPause);
    }
    this.emit({ type: "done", player: current });
    return current;
  }
}

export const aiTurnAnimator = new AITurnAnimator();
