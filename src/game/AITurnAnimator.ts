import type { Player } from "./playerTypes";
import type { GameState } from "./gameState";
import type { Token } from "./tokenTypes";
import type { ExplodedChoice } from "./scoring";
import { drawToken } from "./bag";
import { placeToken, hasExploded } from "./crucible";
import { calculateRoundScore, applyFullReward, applyExplodedReward } from "./scoring";
import { decideBrewingAction, decideFlaskUse, decideExplodedChoice } from "./ai";
import { canUseFlask, useFlask } from "./flask";
import { applyEndOfRoundEffects } from "./chipEffects";
import { yellowRubyBonus } from "./chipEffects";
import { purchaseItem, refreshMarketAvailability } from "./bazaar";
import type { BuyPhaseState } from "./bazaarTypes";
import { decideMarketTurn } from "./ai";

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
  afterScoring: 700,
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
      const updatedCrucible = placeToken(current.crucible, drawn.token);
      current = { ...current, bag: drawn.bag, crucible: updatedCrucible };

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

      // Yellow: immediate ruby bonus
      if (drawn.token.color === "yellow") {
        const bonus = yellowRubyBonus(updatedCrucible);
        current = { ...current, rubies: current.rubies + bonus };
      }

      const isRisky = current.crucible.whiteSum >= 4;
      const msg = isRisky ? pick(MSGS.risky) : drawCount > 1 ? pick(MSGS.drawing) : "";
      if (msg) this.emit({ type: "thinking", message: msg });

      this.emit({ type: "draw", token: drawn.token, player: current });
      await wait(TIMING.betweenDraws);

      if (hasExploded(updatedCrucible)) {
        this.emit({ type: "thinking", message: pick(MSGS.exploded) });
        await wait(TIMING.thinkingPause);
        this.emit({ type: "exploded", player: current });
        await wait(TIMING.afterExplosion);
        break;
      }
    }

    // End-of-round chip effects
    if (!current.crucible.exploded) {
      current = applyEndOfRoundEffects(current);
    }

    // Scoring
    const result = calculateRoundScore(current.crucible);

    if (result.exploded) {
      const choice = decideExplodedChoice(current, result, state);
      const reward = applyExplodedReward(result, choice);
      current = {
        ...current,
        score: current.score + reward.vp,
        coinsThisRound: reward.coins,
        rubies: current.rubies + reward.rubies,
      };
      this.emit({ type: "scored", vp: reward.vp, coins: reward.coins, choice });
    } else {
      const reward = applyFullReward(result);
      current = {
        ...current,
        score: current.score + reward.vp,
        coinsThisRound: reward.coins,
        rubies: current.rubies + reward.rubies,
      };
      this.emit({ type: "thinking", message: pick(MSGS.surviving) });
      await wait(TIMING.thinkingPause);
      this.emit({ type: "scored", vp: reward.vp, coins: reward.coins });
    }

    await wait(TIMING.afterScoring);

    // Market — AI buys up to 2 chips of different colors
    const purchases = decideMarketTurn(current, state.market, state);
    let marketState = state.market;

    const buyState: BuyPhaseState = {
      purchases: [],
      coinsSpent: 0,
      coinsAvailable: current.coinsThisRound,
    };

    let bState = buyState;
    for (const itemId of purchases) {
      try {
        const { player, market, state: newBuyState } = purchaseItem(
          current, marketState, bState, itemId, state.currentRound
        );
        current = player;
        marketState = market;
        bState = newBuyState;
      } catch { break; }
    }

    this.emit({ type: "done", player: current });
    return current;
  }
}

export const aiTurnAnimator = new AITurnAnimator();
