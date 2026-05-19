import React from "react";
import { useTranslation } from "../i18n/useTranslation";
import type { MarketItem, BuyPhaseState } from "../game/bazaarTypes";
import type { Player } from "../game/playerTypes";
import { canAfford } from "../game/bazaar";
import { getTokenVisual } from "../pixi/tokenVisuals";

interface BlackMarketProps {
  market: MarketItem[];
  player: Player;
  buyPhaseState: BuyPhaseState;
  round: number;
  onBuy: (itemId: string) => void;
  onDone: () => void;
}

export function BlackMarket({ market, player, buyPhaseState, round, onBuy, onDone }: BlackMarketProps) {
  const t = useTranslation();
  return (
    <div style={styles.overlay}>
      <div style={styles.panel}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.title}>{t.marketScreen.title}</div>
          <div style={styles.subtitle}>{t.marketScreen.subtitle}</div>
        </div>

        {/* Coins balance */}
        <div style={styles.balance}>
          <span style={styles.balanceLabel}>{t.marketScreen.coinsAvailable}</span>
          <span style={styles.balanceValue}>{buyPhaseState ? buyPhaseState.coinsAvailable - buyPhaseState.coinsSpent : 0}</span>
        </div>

        <div style={styles.divider} />

        {/* Item grid */}
        <div style={styles.grid}>
          {market.map((item) => (
            <MarketItemCard
              key={item.id}
              item={item}
              canBuy={buyPhaseState ? canAfford(item, buyPhaseState, round) : false}
              onBuy={() => onBuy(item.id)}
            />
          ))}
        </div>

        <div style={styles.divider} />

        <button style={styles.doneButton} onClick={onDone}>
          {t.marketScreen.leaveMarket}
        </button>
      </div>
    </div>
  );
}

// ── Individual market item card ────────────────────────────────────────────────

interface MarketItemCardProps {
  item: MarketItem;
  canBuy: boolean;
  onBuy: () => void;
}

function MarketItemCard({ item, canBuy, onBuy }: MarketItemCardProps) {
  const t = useTranslation();
  const visual = getTokenVisual(item.token.color);
  const colorHex = `#${visual.border.toString(16).padStart(6, "0")}`;
  const glowHex = `#${visual.glow.toString(16).padStart(6, "0")}`;

  const unavailable = !item.available;
  const disabled = !canBuy || unavailable;

  return (
    <div
      style={{
        ...styles.itemCard,
        opacity: disabled ? 0.45 : 1,
        borderColor: unavailable ? "#1a0a2e" : colorHex + "66",
        boxShadow: canBuy && !unavailable
          ? `0 0 12px ${glowHex}22`
          : "none",
      }}
    >
      {/* Token dot */}
      <div style={{
        ...styles.tokenDot,
        background: `#${visual.fill.toString(16).padStart(6, "0")}`,
        border: `2px solid ${colorHex}`,
        boxShadow: `0 0 8px ${glowHex}88`,
      }}>
        <span style={{ color: colorHex, fontSize: 12, fontWeight: "bold" }}>
          {item.token.value}
        </span>
      </div>

      {/* Info */}
      <div style={styles.itemInfo}>
        <div style={{ ...styles.itemName, color: colorHex }}>
          {visual.label}
        </div>
        <div style={styles.itemValue}>
          {t.marketScreen.value} {item.token.value}
        </div>
      </div>

      {/* Cost + buy */}
      <div style={styles.itemRight}>
        <div style={styles.cost}>⬡ {item.cost}</div>
        {unavailable ? (
          <div style={styles.soldOut}>{t.marketScreen.sold}</div>
        ) : (
          <button
            style={{
              ...styles.buyButton,
              ...(canBuy ? styles.buyButtonActive : styles.buyButtonDisabled),
            }}
            onClick={onBuy}
            disabled={!canBuy}
          >
            {t.marketScreen.buy}
          </button>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundImage: "url('/images/black_market_bg.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },
  panel: {
    background: "rgba(6, 2, 14, 0.75)",
    backdropFilter: "blur(8px)",
    borderRadius: 12,
    padding: "30px 40px",
    border: "1px solid #3a1a5a",
    width: "min(900px, 92vw)",
    maxHeight: "88vh",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 18,
    boxShadow: "0 0 80px rgba(100, 30, 180, 0.25)",
  },
  header: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
  },
  title: {
    fontFamily: "serif",
    fontSize: 24,
    color: "#e8b84d",
    letterSpacing: 3,
    textShadow: "0 0 16px rgba(180, 80, 255, 0.4)",
  },
  subtitle: {
    fontFamily: "monospace",
    fontSize: 11,
    color: "#8a7656",
    letterSpacing: 2,
  },
  balance: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  balanceLabel: {
    fontFamily: "monospace",
    fontSize: 12,
    color: "#c9a86c",
  },
  balanceValue: {
    fontFamily: "serif",
    fontSize: 20,
    color: "#e8d5b5",
    fontWeight: "bold",
  },
  divider: {
    height: 1,
    background: "linear-gradient(90deg, transparent, #3a1a5a, transparent)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: 10,
  },
  itemCard: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    background: "rgba(20, 8, 36, 0.6)",
    border: "1px solid",
    borderRadius: 8,
    padding: "10px 14px",
    transition: "opacity 0.2s, box-shadow 0.2s",
  },
  tokenDot: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  itemInfo: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 3,
  },
  itemName: {
    fontFamily: "serif",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  itemValue: {
    fontFamily: "monospace",
    fontSize: 13,
    color: "#8a7656",
  },
  itemRight: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 5,
  },
  cost: {
    fontFamily: "serif",
    fontSize: 17,
    color: "#e8d5b5",
    fontWeight: "bold",
  },
  buyButton: {
    border: "1px solid",
    borderRadius: 5,
    padding: "4px 12px",
    fontFamily: "monospace",
    fontSize: 13,
    letterSpacing: 1,
    cursor: "pointer",
    transition: "all 0.15s",
  },
  buyButtonActive: {
    background: "rgba(100, 30, 160, 0.4)",
    borderColor: "#7733bb",
    color: "#e8d5b5",
  },
  buyButtonDisabled: {
    background: "transparent",
    borderColor: "#2a1a3a",
    color: "#443355",
    cursor: "not-allowed",
  },
  soldOut: {
    fontFamily: "monospace",
    fontSize: 12,
    color: "#442233",
    letterSpacing: 1,
  },
  doneButton: {
    background: "transparent",
    border: "1px solid #7733bb",
    borderRadius: 7,
    padding: "12px",
    color: "#e8d5b5",
    fontFamily: "serif",
    fontSize: 17,
    letterSpacing: 2,
    cursor: "pointer",
    width: "100%",
  },
};
