import type { Player } from "./playerTypes";
import type { RoundCausalInsight } from "./gameState";

export function analyzeRoundCausality(player: Player, currentRound: number): RoundCausalInsight {
  const placements = player.crucible.placements;
  let pressure = 0;
  let riskDraw: RoundCausalInsight["riskDraw"];
  let shatterCause: RoundCausalInsight["shatterCause"];

  for (const placement of placements) {
    if (placement.token.color !== "white") continue;
    const pressureBefore = pressure;
    pressure += placement.token.value;
    const candidate = {
      color: placement.token.color,
      value: placement.token.value,
      movement: placement.movement,
      pressureBefore,
      pressureAfter: pressure,
    };
    if (!riskDraw || candidate.pressureAfter > riskDraw.pressureAfter) riskDraw = candidate;
    if (player.crucible.exploded && pressureAfterShatters(pressure, player.crucible.whiteSum)) shatterCause = candidate;
  }

  const valuePlacement = placements.reduce<(typeof placements)[number] | undefined>((best, placement) => {
    if (!best || placement.movement > best.movement) return placement;
    return best;
  }, undefined);
  const purchasedPlacement = placements
    .filter((placement) => placement.token.acquiredFrom === "market" && (placement.token.acquiredRound ?? currentRound) < currentRound)
    .sort((a, b) => b.movement - a.movement)[0];

  return {
    riskDraw,
    valueDraw: valuePlacement ? drawFrom(valuePlacement) : undefined,
    shatterCause,
    stoppedWithTokens: !player.crucible.exploded ? player.bag.tokens.length : 0,
    emptiedBag: !player.crucible.exploded && player.bag.tokens.length === 0,
    purchaseContribution: purchasedPlacement ? {
      ...drawFrom(purchasedPlacement),
      acquiredRound: purchasedPlacement.token.acquiredRound!,
    } : undefined,
  };
}

function pressureAfterShatters(pressure: number, finalPressure: number): boolean {
  return pressure === finalPressure;
}

function drawFrom(placement: Player["crucible"]["placements"][number]) {
  return { color: placement.token.color, value: placement.token.value, movement: placement.movement };
}
