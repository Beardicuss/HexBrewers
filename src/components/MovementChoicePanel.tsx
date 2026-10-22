import React from "react";
import { useTranslation } from "../i18n/useTranslation";

export function MovementChoicePanel({ amount, source, onChoose }: {
  amount: number;
  source: "red" | "yellow";
  onChoose: (apply: boolean) => void;
}) {
  const t = useTranslation();
  const prompt = source === "red" ? t.choices.redMovePrompt : t.choices.yellowMovePrompt;
  return (
    <div style={styles.panel}>
      <div style={styles.label}>{prompt.replace("{count}", String(amount))}</div>
      <div style={styles.buttons}>
        <button style={styles.btn} onClick={() => onChoose(true)}>{t.choices.applyMovement}</button>
        <button style={styles.btn} onClick={() => onChoose(false)}>{t.choices.declineMovement}</button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  panel: { background: "rgba(30, 10, 50, 0.6)", border: "1px solid #5a1a8a", borderRadius: 8, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 },
  label: { fontFamily: "serif", fontSize: 12, color: "#e8b84d", textAlign: "center", fontStyle: "italic" },
  buttons: { display: "flex", flexDirection: "column", gap: 6 },
  btn: { background: "transparent", border: "1px solid #5a1a8a", borderRadius: 6, padding: 9, color: "#e8d5b5", fontFamily: "serif", fontSize: 13, letterSpacing: 1, cursor: "pointer" },
};
