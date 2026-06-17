import React from "react";
import type { PurpleChoice } from "../game/gameState";

export function PurpleChoicePanel({
  choices,
  onChoose,
}: {
  choices: PurpleChoice[];
  onChoose: (choiceId: string) => void;
}) {
  return (
    <div style={styles.panel}>
      <div style={styles.label}>Wraithbloom offers a pact.</div>
      <div style={styles.buttons}>
        {choices.map((choice) => (
          <button key={choice.id} style={styles.btn} onClick={() => onChoose(choice.id)}>
            {choice.label}
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
