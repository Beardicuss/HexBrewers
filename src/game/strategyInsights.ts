import type { Bag } from "./bagTypes";
import { EXPLOSION_THRESHOLD } from "./crucibleTypes";
import type { Token, TokenColor } from "./tokenTypes";

export interface TokenGroup {
  color: TokenColor;
  value: number;
  count: number;
}

export type RiskBand = "safe" | "unsettled" | "grave" | "ruinous";

export interface NextDrawRisk {
  dangerousCount: number;
  totalCount: number;
  probability: number;
  band: RiskBand;
  minimumMovement: number;
  maximumMovement: number;
}

export function groupTokens(tokens: Token[]): TokenGroup[] {
  const groups = new Map<string, TokenGroup>();

  for (const token of tokens) {
    const key = `${token.color}:${token.value}`;
    const existing = groups.get(key);
    if (existing) existing.count += 1;
    else groups.set(key, { color: token.color, value: token.value, count: 1 });
  }

  return [...groups.values()].sort((a, b) => {
    if (a.color === "white" && b.color !== "white") return -1;
    if (b.color === "white" && a.color !== "white") return 1;
    return a.color.localeCompare(b.color) || a.value - b.value;
  });
}

export function calculateNextDrawRisk(bag: Bag, currentWhiteSum: number): NextDrawRisk {
  const totalCount = bag.tokens.length;
  const dangerousCount = bag.tokens.filter(
    (token) => token.color === "white" && currentWhiteSum + token.value > EXPLOSION_THRESHOLD,
  ).length;
  const probability = totalCount === 0 ? 0 : dangerousCount / totalCount;
  const movements = bag.tokens.map((token) => token.resolvedMovement ?? token.value);

  return {
    dangerousCount,
    totalCount,
    probability,
    band: probability === 0
      ? "safe"
      : probability < 0.2
        ? "unsettled"
        : probability < 0.45
          ? "grave"
          : "ruinous",
    minimumMovement: movements.length ? Math.min(...movements) : 0,
    maximumMovement: movements.length ? Math.max(...movements) : 0,
  };
}
