import React from "react";
import type { Player } from "../game/playerTypes";
import { useTranslation } from "../i18n/useTranslation";

interface PlayerPanelProps {
  player: Player;
  isActive: boolean;
  label?: string;
}

export function PlayerPanel({ player, isActive, label }: PlayerPanelProps) {
  const t = useTranslation();
  const exploded = player.crucible.exploded;
  const bagCount = player.bag.tokens.length;
  const whiteSum = player.crucible.whiteSum;

  return (
    <div style={{ ...styles.panel, ...(isActive ? styles.panelActive : {}) }}>
      {/* Header */}
      <div style={styles.header}>
        <img
          src={player.kind === "human" ? "/images/avatar_hexbrewer.jpg" : "/images/avatar_shade.jpg"}
          alt={player.name}
          style={styles.avatar}
        />
        <span style={styles.name}>{label ?? player.name}</span>
        {isActive && <span style={styles.activePip}>▶</span>}
        {player.kind === "ai" && <span style={styles.aiTag}>AI</span>}
      </div>

      <div style={styles.divider} />

      {/* Score */}
      <div style={styles.row}>
        <span style={styles.statLabel}>{t.player.prestige}</span>
        <span style={styles.statValue}>{player.score}</span>
      </div>

      {/* Rubies */}
      <div style={styles.row}>
        <span style={styles.statLabel}>{t.player.rubies}</span>
        <span style={{ ...styles.statValue, color: "#cc88ff" }}>
          {player.rubies}
        </span>
      </div>

      {/* Bag */}
      <div style={styles.row}>
        <span style={styles.statLabel}>{t.player.bag}</span>
        <span style={styles.statValue}>{bagCount} {t.player.tokens}</span>
      </div>

      {/* White sum — danger meter */}
      <div style={styles.dangerRow}>
        <span style={styles.statLabel}>{t.player.voidshards}</span>
        <div style={styles.dangerBar}>
          <div
            style={{
              ...styles.dangerFill,
              width: `${Math.min((whiteSum / 7) * 100, 100)}%`,
              background: whiteSum >= 6
                ? "#ff2200"
                : whiteSum >= 4
                  ? "#ff8800"
                  : "#4422aa",
            }}
          />
        </div>
        <span style={{
          ...styles.dangerNum,
          color: whiteSum >= 6 ? "#ff4422" : "#aa88cc",
        }}>
          {whiteSum}/7
        </span>
      </div>

      {/* Flask */}
      <div style={styles.row}>
        <span style={styles.statLabel}>{t.player.cursedVial}</span>
        <span style={{
          ...styles.flaskStatus,
          color: player.flask ? "#44ff88" : "#553355",
        }}>
          {player.flask ? t.player.ready : t.player.spent}
        </span>
      </div>

      {/* Explosion indicator */}
      {exploded && (
        <div style={styles.explodedBadge}>
          {t.player.shattered}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  panel: {
    backgroundImage: "url('/images/parchment_dark.jpg')",
    backgroundSize: "cover",
    border: "1px solid #2a0a4a",
    borderRadius: 10,
    padding: "18px 20px",
    minWidth: 190,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    transition: "border-color 0.3s, box-shadow 0.3s",
  },
  panelActive: {
    border: "1px solid #7733bb",
    boxShadow: "0 0 20px rgba(120, 40, 200, 0.2)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    border: "1px solid #7733bb",
  },
  name: {
    fontFamily: "serif",
    fontSize: 17,
    color: "#e8b84d",
    letterSpacing: 1,
    flex: 1,
  },
  activePip: {
    color: "#c9a86c",
    fontSize: 12,
  },
  aiTag: {
    background: "rgba(80, 20, 120, 0.5)",
    border: "1px solid #5a1a8a",
    borderRadius: 4,
    padding: "1px 6px",
    fontSize: 12,
    color: "#c9a86c",
    fontFamily: "monospace",
    letterSpacing: 1,
  },
  divider: {
    height: 1,
    background: "linear-gradient(90deg, transparent, #3a1a5a, transparent)",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statLabel: {
    fontFamily: "monospace",
    fontSize: 13,
    color: "#c9a86c",
    letterSpacing: 0.5,
  },
  statValue: {
    fontFamily: "serif",
    fontSize: 17,
    color: "#e8d5b5",
    fontWeight: "bold",
  },
  dangerRow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  dangerBar: {
    flex: 1,
    height: 4,
    background: "#1a0a2e",
    borderRadius: 2,
    overflow: "hidden",
  },
  dangerFill: {
    height: "100%",
    borderRadius: 2,
    transition: "width 0.4s, background 0.4s",
  },
  dangerNum: {
    fontFamily: "monospace",
    fontSize: 12,
    minWidth: 24,
    textAlign: "right",
  },
  flaskStatus: {
    fontFamily: "monospace",
    fontSize: 13,
    letterSpacing: 0.5,
  },
  explodedBadge: {
    background: "rgba(180, 20, 0, 0.2)",
    border: "1px solid #aa2200",
    borderRadius: 5,
    padding: "5px 10px",
    fontFamily: "serif",
    fontSize: 13,
    color: "#ff8888",
    textAlign: "center",
    letterSpacing: 2,
    animation: "pulse 1.2s ease-in-out infinite",
  },
};
