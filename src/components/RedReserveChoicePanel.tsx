import React from "react";
import type { Token } from "../game/tokenTypes";

export function RedReserveChoicePanel({
  token,
  remaining,
  onChoose,
}: {
  token: Token;
  remaining: number;
  onChoose: (action: "place" | "save" | "bag") => void;
}) {
  return (
    <div style={styles.panel}>
      <div style={styles.label}>Bloodthorn waits beside the pot.</div>
      <div style={styles.token}>Bloodthorn {token.value}</div>
      <div style={styles.count}>{remaining} reserved</div>
      <div style={styles.buttons}>
        <button style={styles.btn} onClick={() => onChoose("place")}>Place now</button>
        <button style={styles.btn} onClick={() => onChoose("save")}>Save it</button>
        <button style={styles.btn} onClick={() => onChoose("bag")}>Return to bag</button>
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
  token: {
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
