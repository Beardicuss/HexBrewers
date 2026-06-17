import React from "react";
import type { RoundSummary } from "../game/gameState";
import { describeDieResult } from "../game/bonusDie";

export function RoundSummaryPanel({ summary }: { summary: RoundSummary }) {
  return (
    <div style={styles.panel}>
      <div style={styles.title}>Round {summary.round} Results</div>
      {summary.players.map((player) => (
        <div key={player.playerId} style={styles.playerBlock}>
          <div style={styles.nameRow}>
            <span style={styles.name}>{player.name}</span>
            <span style={player.exploded ? styles.burst : styles.safe}>
              {player.exploded ? "Shattered" : "Stable"}
            </span>
          </div>
          <div style={styles.grid}>
            <span>Space</span>
            <strong>{player.space}</strong>
            <span>Prestige</span>
            <strong>+{player.vp}</strong>
            <span>Coins</span>
            <strong>{player.coins}</strong>
            <span>Ruby</span>
            <strong>{player.ruby ? "+1" : "-"}</strong>
          </div>
          {player.bonusDie && (
            <div style={styles.die}>
              Die: {describeDieResult(player.bonusDie)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  panel: {
    background: "rgba(14, 6, 28, 0.82)",
    border: "1px solid #3a1a5a",
    borderRadius: 8,
    padding: "14px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
  },
  title: {
    color: "#e8b84d",
    fontFamily: "Georgia, serif",
    fontSize: 14,
    letterSpacing: 1,
    textAlign: "center",
  },
  playerBlock: {
    borderTop: "1px solid rgba(90, 26, 138, 0.65)",
    paddingTop: 8,
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  nameRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  name: {
    color: "#e8d5b5",
    fontFamily: "Georgia, serif",
    fontSize: 13,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  safe: {
    color: "#66cc88",
    fontFamily: "monospace",
    fontSize: 11,
  },
  burst: {
    color: "#ff8888",
    fontFamily: "monospace",
    fontSize: 11,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: "4px 8px",
    color: "#9f8aba",
    fontFamily: "monospace",
    fontSize: 11,
  },
  die: {
    color: "#ffaa44",
    border: "1px solid #443300",
    background: "rgba(80, 40, 0, 0.2)",
    borderRadius: 5,
    padding: "4px 6px",
    fontFamily: "monospace",
    fontSize: 11,
    textAlign: "center",
  },
};
