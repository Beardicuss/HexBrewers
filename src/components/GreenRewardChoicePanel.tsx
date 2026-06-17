import React from "react";
import type { GreenRewardChoice } from "../game/gameState";

const TOKEN_NAMES: Record<string, string> = {
  orange: "Brimstone",
  blue: "Frostbile",
  red: "Bloodthorn",
  yellow: "Plaguedust",
  purple: "Wraithbloom",
};

export function GreenRewardChoicePanel({
  reward,
  remaining,
  onChoose,
}: {
  reward: GreenRewardChoice;
  remaining: number;
  onChoose: (color: GreenRewardChoice["options"][number]["color"], value: number) => void;
}) {
  return (
    <div style={styles.panel}>
      <div style={styles.label}>Deathweave adds a reward to your bag.</div>
      <div style={styles.source}>Deathweave {reward.sourceValue}</div>
      <div style={styles.count}>{remaining} reward{remaining === 1 ? "" : "s"} pending</div>
      <div style={styles.buttons}>
        {reward.options.map((option) => (
          <button
            key={`${option.color}-${option.value}`}
            style={styles.btn}
            onClick={() => onChoose(option.color, option.value)}
          >
            {TOKEN_NAMES[option.color] ?? option.color} {option.value}
          </button>
        ))}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  panel: {
    background: "rgba(30, 10, 50, 0.6)",
    border: "1px solid #5a1a8a",
    borderRadius: 8,
    padding: "14px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 9,
  },
  label: {
    fontFamily: "serif",
    fontSize: 12,
    color: "#e8b84d",
    textAlign: "center",
    fontStyle: "italic",
  },
  source: {
    color: "#e8d5b5",
    fontFamily: "Georgia, serif",
    fontSize: 13,
    textAlign: "center",
    border: "1px solid #5a1a8a",
    borderRadius: 6,
    padding: "7px 10px",
    background: "rgba(10, 4, 30, 0.45)",
  },
  count: {
    color: "#9f8aba",
    fontFamily: "monospace",
    fontSize: 11,
    textAlign: "center",
  },
  buttons: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  btn: {
    background: "transparent",
    border: "1px solid #5a1a8a",
    borderRadius: 6,
    padding: "9px",
    color: "#e8d5b5",
    fontFamily: "serif",
    fontSize: 13,
    letterSpacing: 1,
    cursor: "pointer",
  },
};
