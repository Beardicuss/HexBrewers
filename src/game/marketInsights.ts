import type { MarketItem } from "./bazaarTypes";
import type { Player } from "./playerTypes";
import type { TokenColor } from "./tokenTypes";

export type IngredientRole = "movement" | "control" | "economy" | "ruby" | "combo" | "recovery" | "volatility";
export type SynergyKind = "matching" | "brimstone" | "voidshard" | "wraithbloom" | "neighbor" | "none";

export interface MarketPurchaseInsight {
  role: IngredientRole;
  voidshardShareBefore: number;
  voidshardShareAfter: number;
  voidshardShareChange: number;
  ownedMatching: number;
  synergy: SynergyKind;
}

function countColor(player: Player, color: TokenColor): number {
  return player.bag.tokens.filter((token) => token.color === color).length;
}

export function ingredientRole(color: TokenColor): IngredientRole {
  switch (color) {
    case "white": return "volatility";
    case "orange": return "movement";
    case "green": return "economy";
    case "purple": return "combo";
    case "blue": return "control";
    case "red": return "movement";
    case "yellow": return "recovery";
    case "black": return "ruby";
    case "echo": return "combo";
  }
}

export function analyzeMarketPurchase(player: Player, item: MarketItem): MarketPurchaseInsight {
  const totalBefore = player.bag.tokens.length;
  const voidshardsBefore = countColor(player, "white");
  const totalAfter = totalBefore + 1;
  const voidshardsAfter = voidshardsBefore + (item.token.color === "white" ? 1 : 0);
  const shareBefore = totalBefore > 0 ? voidshardsBefore / totalBefore : 0;
  const shareAfter = totalAfter > 0 ? voidshardsAfter / totalAfter : 0;
  const ownedMatching = countColor(player, item.token.color);

  const synergy: SynergyKind =
    item.token.color === "red" ? "brimstone" :
      item.token.color === "yellow" ? "voidshard" :
        item.token.color === "purple" ? "wraithbloom" :
          item.token.color === "black" ? "neighbor" :
            ownedMatching > 0 ? "matching" : "none";

  return {
    role: ingredientRole(item.token.color),
    voidshardShareBefore: shareBefore,
    voidshardShareAfter: shareAfter,
    voidshardShareChange: shareAfter - shareBefore,
    ownedMatching,
    synergy,
  };
}
