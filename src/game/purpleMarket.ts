import type { MarketItem } from "./bazaarTypes";
import type { PurpleChoice } from "./gameState";
import type { TokenColor } from "./tokenTypes";

interface StockChange {
  color: TokenColor;
  value: number;
  amount: number;
}

function stockChanges(choice: PurpleChoice): StockChange[] {
  if (choice.kind === "set2") {
    const rewards: StockChange[] = choice.tradeCount === 1
      ? [{ color: "black", value: 1, amount: -1 }]
      : choice.tradeCount === 2
        ? [
            { color: "green", value: 1, amount: -1 },
            { color: "blue", value: 2, amount: -1 },
          ]
        : [{ color: "yellow", value: 4, amount: -1 }];
    return [...rewards, { color: "purple", value: 1, amount: choice.tradeCount }];
  }

  if (choice.kind === "set4") {
    return [
      { color: choice.color, value: choice.toValue, amount: -1 },
      { color: choice.color, value: choice.fromValue, amount: 1 },
    ];
  }

  return [];
}

export function canResolvePurpleChoiceFromStock(market: MarketItem[], choice: PurpleChoice): boolean {
  return stockChanges(choice).filter((change) => change.amount < 0).every((change) => {
    const item = market.find((candidate) =>
      candidate.token.color === change.color && candidate.token.value === change.value
    );
    return item !== undefined && item.stock >= Math.abs(change.amount);
  });
}

export function legalPurpleChoices(market: MarketItem[], choices: PurpleChoice[]): PurpleChoice[] {
  return choices.filter((choice) => canResolvePurpleChoiceFromStock(market, choice));
}

export function applyPurpleChoiceStock(
  market: MarketItem[],
  choice: PurpleChoice,
  currentRound: number,
): MarketItem[] {
  if (!canResolvePurpleChoiceFromStock(market, choice)) return market;
  const changes = stockChanges(choice);

  return market.map((item) => {
    const amount = changes
      .filter((change) => change.color === item.token.color && change.value === item.token.value)
      .reduce((total, change) => total + change.amount, 0);
    if (amount === 0) return item;
    const stock = item.stock + amount;
    return { ...item, stock, available: stock > 0 && item.unlockRound <= currentRound };
  });
}
