import React from "react";

export function GreenSpendChoicePanel({
  maxSteps,
  onChoose,
}: {
  maxSteps: number;
  onChoose: (steps: number) => void;
}) {
  const options = Array.from({ length: maxSteps + 1 }, (_, steps) => steps);

  return (
    <div style={styles.panel}>
      <div style={styles.label}>Deathweave may feed rubies to the droplet.</div>
      <div style={styles.buttons}>
        {options.map((steps) => (
          <button key={steps} style={styles.btn} onClick={() => onChoose(steps)}>
            {steps === 0 ? "Spend none" : `Spend ${steps} ${steps === 1 ? "ruby" : "rubies"}`}
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
    gap: 10,
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
