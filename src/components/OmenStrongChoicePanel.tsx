import React from "react";
import type { Token } from "../game/tokenTypes";
import { useTranslation } from "../i18n/useTranslation";
import { getLocalizedTokenName } from "../i18n/tokenNames";

export function OmenStrongChoicePanel({
  tokens,
  onChoose,
}: {
  tokens: Token[];
  onChoose: (tokenId: string | null) => void;
}) {
  const t = useTranslation();
  return (
    <div style={styles.panel} role="group" aria-label={t.choices.omenStrongPrompt}>
      <div style={styles.label}>{t.choices.omenStrongPrompt}</div>
      {tokens.map((token) => (
        <button key={token.id} style={styles.button} onClick={() => onChoose(token.id)}>
          {getLocalizedTokenName(token.color, t, token.value)} {token.resolvedMovement ?? (token.color === "echo" ? "?" : token.value)}
        </button>
      ))}
      <button style={styles.skip} onClick={() => onChoose(null)}>{t.choices.omenStrongSkip}</button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  panel: { background: "rgba(30,10,50,.72)", border: "1px solid #8a5aaf", borderRadius: 8, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 7 },
  label: { color: "#e8b84d", fontFamily: "serif", fontSize: 13, textAlign: "center", fontStyle: "italic", marginBottom: 3 },
  button: { background: "rgba(80,35,105,.35)", border: "1px solid #8a5aaf", borderRadius: 6, padding: 9, color: "#f1e5cf", fontFamily: "serif", cursor: "pointer" },
  skip: { background: "transparent", border: "1px solid #5a4767", borderRadius: 6, padding: 8, color: "#bbaec2", fontFamily: "serif", cursor: "pointer" },
};
