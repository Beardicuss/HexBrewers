import React from "react";
import type { Player } from "../game/playerTypes";
import { useTranslation } from "../i18n/useTranslation";

interface GameOverProps {
  players: Player[];
  winner: Player;
  onRestart: () => void;
}

export function GameOver({ players, winner, onRestart }: GameOverProps) {
  const t = useTranslation();
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const humanWon = winner.kind === "human";

  return (
    <div style={styles.overlay}>
      <div style={styles.panel}>
        {/* Title */}
        <div style={styles.runeTop}>✦ ✦ ✦</div>
        <div style={styles.title}>
          {humanWon ? t.gameOver.victory : t.gameOver.defeated}
        </div>
        <div style={{
          ...styles.subtitle,
          color: humanWon ? "#44ff88" : "#ff4422",
        }}>
          {humanWon
            ? t.gameOver.victorySubtitle
            : t.gameOver.defeatSubtitle}
        </div>

        <div style={styles.divider} />

        {/* Score table */}
        <div style={styles.scoreTable}>
          {sorted.map((p, i) => (
            <div key={p.id} style={{
              ...styles.scoreRow,
              ...(i === 0 ? styles.scoreRowFirst : {}),
            }}>
              <span style={styles.rank}>{i === 0 ? "✦" : "◈"}</span>
              <span style={styles.playerName}>{p.name}</span>
              <span style={styles.playerKind}>
                {p.kind === "ai" ? "[AI]" : `[${t.game.you}]`}
              </span>
              <span style={styles.playerScore}>{p.score}</span>
              <span style={styles.scoreLabel}>{t.gameOver.prestige}</span>
            </div>
          ))}
        </div>

        <div style={styles.divider} />

        <button style={styles.restartButton} onClick={onRestart}>
          {t.gameOver.brewAgain}
        </button>

        <div style={styles.runeBottom}>✦ ✦ ✦</div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(4, 2, 10, 0.95)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 200,
    backdropFilter: "blur(8px)",
  },
  panel: {
    background: "linear-gradient(160deg, #0a0618 0%, #160930 60%, #0a0418 100%)",
    border: "1px solid #4a1a7a",
    borderRadius: 16,
    padding: "44px 52px",
    maxWidth: 420,
    width: "90%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 20,
    boxShadow: "0 0 100px rgba(120, 40, 200, 0.3)",
  },
  runeTop: {
    color: "#7733bb",
    fontSize: 16,
    letterSpacing: 8,
    opacity: 0.5,
  },
  title: {
    fontFamily: "serif",
    fontSize: 40,
    color: "#cc88ff",
    letterSpacing: 4,
    textShadow: "0 0 24px rgba(180, 80, 255, 0.5)",
  },
  subtitle: {
    fontFamily: "serif",
    fontSize: 14,
    fontStyle: "italic",
    letterSpacing: 1,
  },
  divider: {
    width: "80%",
    height: 1,
    background: "linear-gradient(90deg, transparent, #6622aa, transparent)",
  },
  scoreTable: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    width: "100%",
  },
  scoreRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 16px",
    background: "rgba(20, 8, 36, 0.5)",
    borderRadius: 8,
    border: "1px solid #2a0a4a",
  },
  scoreRowFirst: {
    border: "1px solid #6622aa",
    background: "rgba(60, 20, 100, 0.25)",
  },
  rank: {
    color: "#9955dd",
    fontSize: 14,
    width: 16,
  },
  playerName: {
    fontFamily: "serif",
    fontSize: 16,
    color: "#cc99ff",
    flex: 1,
  },
  playerKind: {
    fontFamily: "monospace",
    fontSize: 10,
    color: "#664488",
    letterSpacing: 1,
  },
  playerScore: {
    fontFamily: "serif",
    fontSize: 22,
    color: "#ddbbff",
    fontWeight: "bold",
  },
  scoreLabel: {
    fontFamily: "monospace",
    fontSize: 10,
    color: "#664488",
  },
  restartButton: {
    background: "transparent",
    border: "1px solid #7733bb",
    borderRadius: 8,
    padding: "13px 36px",
    color: "#cc88ff",
    fontFamily: "serif",
    fontSize: 16,
    letterSpacing: 3,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  runeBottom: {
    color: "#7733bb",
    fontSize: 16,
    letterSpacing: 8,
    opacity: 0.5,
  },
};
