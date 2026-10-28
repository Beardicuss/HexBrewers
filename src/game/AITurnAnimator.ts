import type { Player } from "./playerTypes";
import type { GameState } from "./gameState";
import type { Token } from "./tokenTypes";
import type { ExplodedChoice } from "./scoring";
import { drawToken } from "./bag";
import { placeToken, hasExploded } from "./crucible";
import { decideBlueKeep, decideBrewingAction, decideFlaskUse } from "./ai";
import { canUseFlask, useFlask } from "./flask";
import { drawBlueBonus } from "./chipEffects";
import { getRecipeSetForColor } from "./recipeBooks";
import { placeTokenForActiveBooks } from "./brewingRules";
import { restartBrew, shouldOfferSecondChance } from "./omenSecondChance";
import { applyIntentionAfterPlacement } from "./brewingIntentions";
import { bankEmber, canBankEmber } from "./preparation";

export type AITurnEvent =
  | { type: "thinking"; messageKey: AIMessageKey }
  | { type: "scry"; chosen: Token }
  | { type: "draw"; token: Token; player: Player }
  | { type: "flask"; token: Token }
  | { type: "stop"; player: Player }
  | { type: "exploded"; player: Player }
  | { type: "scored"; vp: number; coins: number; choice?: ExplodedChoice }
  | { type: "done"; player: Player };

export type AIEventListener = (event: AITurnEvent) => void;

export type AIMessageKey =
  | "start1" | "start2" | "start3"
  | "draw1" | "draw2" | "draw3"
  | "risk1" | "risk2" | "risk3"
  | "stop1" | "stop2" | "stop3"
  | "explode1" | "explode2" | "explode3"
  | "survive1" | "survive2" | "survive3";

const TIMING = {
  thinkingBeforeFirstDraw: 800,
  betweenDraws: 550,
  thinkingPause: 350,
  afterExplosion: 1100,
  afterStop: 600,
};

const MSGS = {
  start: ["start1", "start2", "start3"], drawing: ["draw1", "draw2", "draw3"],
  risky: ["risk1", "risk2", "risk3"], stopping: ["stop1", "stop2", "stop3"],
  exploded: ["explode1", "explode2", "explode3"], surviving: ["survive1", "survive2", "survive3"],
} satisfies Record<string, AIMessageKey[]>;

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
export class AITurnAnimator {
  private listener: AIEventListener | null = null;
  private fastForward = false;

  onEvent(listener: AIEventListener) { this.listener = listener; }
  setFastForward(enabled: boolean) { this.fastForward = enabled; }
  private emit(event: AITurnEvent) { this.listener?.(event); }
  private wait(ms: number) {
    return new Promise<void>((resolve) => setTimeout(resolve, this.fastForward ? 20 : ms));
  }

  async run(aiPlayer: Player, state: GameState): Promise<Player> {
    this.emit({ type: "thinking", messageKey: pick(MSGS.start) });
    await this.wait(TIMING.thinkingBeforeFirstDraw);

    let current = aiPlayer;
    let preparedScryToken: Token | null = null;
    if (state.ritualRuleset === "ashenveil" && current.rubies > 0 && current.scryUsedRound !== state.currentRound && current.bag.tokens.length >= 2) {
      const first = drawToken(current.bag);
      const second = first ? drawToken(first.bag) : null;
      if (first && second) {
        const danger = (token: Token) => token.color === "white" ? token.value * 5 : -token.value;
        const chosen = [first.token, second.token].sort((a, b) => danger(a) - danger(b))[0];
        preparedScryToken = chosen;
        current = { ...current, rubies: current.rubies - 1, scryUsedRound: state.currentRound };
        this.emit({ type: "scry", chosen });
        await this.wait(TIMING.thinkingPause);
      }
    }
    let drawCount = 0;

    while (true) {
      const decision = decideBrewingAction(current, state);
      if (decision === "stop") {
        if (canBankEmber(current, state)) current = bankEmber(current, state);
        this.emit({ type: "thinking", messageKey: pick(MSGS.stopping) });
        await this.wait(TIMING.afterStop);
        this.emit({ type: "stop", player: current });
        break;
      }

      const drawn = preparedScryToken
        ? { token: preparedScryToken, bag: { tokens: current.bag.tokens.filter((token) => token.id !== preparedScryToken!.id) } }
        : drawToken(current.bag);
      preparedScryToken = null;
      if (!drawn) { this.emit({ type: "stop", player: current }); break; }

      drawCount++;
      current = applyIntentionAfterPlacement(placeTokenForActiveBooks({ ...current, bag: drawn.bag }, drawn.token, state), state);
      const updatedCrucible = current.crucible;

      // Flask check (must check canUseFlask AFTER placing — official rule)
      if (drawn.token.color === "white" && !updatedCrucible.exploded && canUseFlask(current)) {
        const shouldFlask = decideFlaskUse(current, state);
        if (shouldFlask) {
          this.emit({ type: "flask", token: drawn.token });
          current = useFlask(current);
          await this.wait(TIMING.betweenDraws);
          continue;
        }
      }

      const isRisky = current.crucible.whiteSum >= 4;
      const messageKey = isRisky ? pick(MSGS.risky) : drawCount > 1 ? pick(MSGS.drawing) : null;
      if (messageKey) this.emit({ type: "thinking", messageKey });

      this.emit({ type: "draw", token: drawn.token, player: current });
      await this.wait(TIMING.betweenDraws);

      let blueSource = drawn.token.color === "blue" && getRecipeSetForColor(state.recipeBooks, "blue") === 1 && !current.crucible.exploded ? drawn.token : null;
      while (blueSource && !current.crucible.exploded) {
        const bonus = drawBlueBonus(current.bag, blueSource.value);
        const kept = decideBlueKeep(bonus.drawn, current, state);
        const returned = bonus.drawn.filter((token) => token.id !== kept?.id);
        current = { ...current, bag: { tokens: [...bonus.bag.tokens, ...returned] } };

        if (!kept) break;

        current = applyIntentionAfterPlacement(placeTokenForActiveBooks(current, kept, state), state);
        this.emit({ type: "draw", token: kept, player: current });
        await this.wait(TIMING.betweenDraws);

        if (hasExploded(current.crucible)) break;
        blueSource = kept.color === "blue" && getRecipeSetForColor(state.recipeBooks, "blue") === 1 ? kept : null;
      }

      if (shouldOfferSecondChance(state, current)) {
        const shouldRestart = current.crucible.exploded || current.crucible.whiteSum >= 6;
        current = shouldRestart
          ? restartBrew(current)
          : { ...current, omenSecondChanceUsed: true };
        if (shouldRestart) {
          this.emit({ type: "thinking", messageKey: pick(MSGS.start) });
          await this.wait(TIMING.thinkingPause);
          continue;
        }
      }

      if (hasExploded(current.crucible)) {
        this.emit({ type: "thinking", messageKey: pick(MSGS.exploded) });
        await this.wait(TIMING.thinkingPause);
        this.emit({ type: "exploded", player: current });
        await this.wait(TIMING.afterExplosion);
        break;
      }
    }

    if ((current.redReserve?.length ?? 0) > 0) {
      const reserve = current.redReserve ?? [];
      current = reserve.reduce(
        (player, token) => ({
          ...player,
          crucible: placeToken(player.crucible, token, token.value),
        }),
        { ...current, redReserve: [] as Token[] }
      );
    }

    if (!current.crucible.exploded) {
      this.emit({ type: "thinking", messageKey: pick(MSGS.surviving) });
      await this.wait(TIMING.thinkingPause);
    }
    this.emit({ type: "done", player: current });
    return current;
  }
}

export const aiTurnAnimator = new AITurnAnimator();
