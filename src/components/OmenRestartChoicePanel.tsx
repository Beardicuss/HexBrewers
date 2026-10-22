import React from "react";
import { useTranslation } from "../i18n/useTranslation";

export function OmenRestartChoicePanel({
  canUseFlask,
  onChoose,
}: {
  canUseFlask: boolean;
  onChoose: (choice: "continue" | "restart" | "flask") => void;
}) {
  const t = useTranslation();
  return (
    <div style={styles.panel} role="group" aria-label={t.choices.omenRestartPrompt}>
      <div style={styles.label}>{t.choices.omenRestartPrompt}</div>
      {canUseFlask && <button style={styles.flask} onClick={() => onChoose("flask")}>{t.choices.omenUseFlask}</button>}
      <button style={styles.button} onClick={() => onChoose("continue")}>{t.choices.omenContinue}</button>
      <button style={styles.restart} onClick={() => onChoose("restart")}>{t.choices.omenRestart}</button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  panel: { background: "rgba(30,10,50,.75)", border: "1px solid #8a5aaf", borderRadius: 8, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 },
  label: { color: "#e8b84d", fontFamily: "serif", fontSize: 13, textAlign: "center", fontStyle: "italic" },
  button: { background: "rgba(70,40,95,.4)", border: "1px solid #8a5aaf", borderRadius: 6, padding: 9, color: "#f1e5cf", fontFamily: "serif", cursor: "pointer" },
  restart: { background: "rgba(115,35,50,.35)", border: "1px solid #a94f62", borderRadius: 6, padding: 9, color: "#ffd7d7", fontFamily: "serif", cursor: "pointer" },
  flask: { background: "rgba(25,75,100,.35)", border: "1px solid #4c91ad", borderRadius: 6, padding: 9, color: "#d5f1ff", fontFamily: "serif", cursor: "pointer" },
};
