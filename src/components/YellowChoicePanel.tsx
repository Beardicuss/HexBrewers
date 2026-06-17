import React from "react";
import type { Token } from "../game/tokenTypes";

export function YellowChoicePanel({
  token,
  onChoose,
}: {
  token: Token;
  onChoose: (returnPrevious: boolean) => void;
}) {
  return (
    <div style={styles.panel}>
      <div style={styles.label}>Plaguedust may cast back the last Voidshard.</div>
      <div style={styles.tokenRow}>
        <span style={styles.tokenName}>Voidshard {token.value}</span>
      </div>
      <div style={styles.buttons}>
        <button style={styles.btn} onClick={() => onChoose(true)}>Return it</button>
        <button style={styles.btn} onClick={() => onChoose(false)}>Leave it</button>
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
  tokenRow: {
    display: "flex",
    justifyContent: "center",
    color: "#e8d5b5",
    fontFamily: "Georgia, serif",
    fontSize: 13,
  },
  tokenName: {
    border: "1px solid #5a1a8a",
    borderRadius: 6,
    padding: "7px 10px",
    background: "rgba(10, 4, 30, 0.45)",
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
