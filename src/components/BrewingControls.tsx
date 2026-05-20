import React from "react";
import { useTranslation } from "../i18n/useTranslation";

interface BrewingControlsProps {
  canDraw: boolean;
  canUseFlask: boolean;
  onDraw: () => void;
  onStop: () => void;
  onUseFlask: () => void;
  whiteSum: number;
  bagCount: number;
}

export function BrewingControls({
  canDraw,
  canUseFlask,
  onDraw,
  onStop,
  onUseFlask,
  whiteSum,
  bagCount,
}: BrewingControlsProps) {
  const t = useTranslation();
  const danger = whiteSum >= 5;
  const critical = whiteSum >= 6;

  return (
    <div style={styles.wrapper}>
      {/* Risk indicator */}
      <div style={styles.riskRow}>
        <span style={styles.riskLabel}>{t.brewing.whiteSum}:</span>
        <span style={{
          ...styles.riskValue,
          color: critical ? "#ff3300" : danger ? "#ff8800" : "#7755aa",
        }}>
          {whiteSum} / 7
        </span>
        {critical && <span style={styles.criticalWarning}>⚠ CRITICAL</span>}
      </div>

      <div style={styles.riskBar}>
        <div style={{
          ...styles.riskFill,
          width: `${Math.min((whiteSum / 7) * 100, 100)}%`,
          background: critical
            ? "linear-gradient(90deg, #aa0000, #ff3300)"
            : danger
              ? "linear-gradient(90deg, #aa4400, #ff8800)"
              : "linear-gradient(90deg, #220066, #6622aa)",
        }} />
      </div>

      {/* Bag info */}
      <div style={styles.bagInfo}>
        ◈ {bagCount} {t.brewing.bagRemaining}
      </div>

      {/* Action buttons */}
      <div style={styles.buttons}>
        <button
          style={{
            ...styles.btn,
            ...styles.drawBtn,
            opacity: canDraw ? 1 : 0.35,
            cursor: canDraw ? "pointer" : "not-allowed",
          }}
          onClick={onDraw}
          disabled={!canDraw}
        >
          {t.brewing.drawToken}
        </button>

        <button
          style={{ ...styles.btn, ...styles.stopBtn }}
          onClick={onStop}
        >
          {t.brewing.stopBrewing}
        </button>
      </div>

      {/* Flask hint */}
      {canUseFlask && (
        <button style={styles.flaskButton} onClick={onUseFlask}>
          {t.brewing.flaskHint}
        </button>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    padding: "16px 20px",
    background: "linear-gradient(160deg, #0a0618, #110828)",
    border: "1px solid #2a0a4a",
    borderRadius: 10,
    minWidth: 240,
  },
  riskRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  riskLabel: {
    fontFamily: "monospace",
    fontSize: 11,
    color: "#c9a86c",
    flex: 1,
  },
  riskValue: {
    fontFamily: "serif",
    fontSize: 14,
    fontWeight: "bold",
  },
  criticalWarning: {
    fontFamily: "monospace",
    fontSize: 10,
    color: "#ff3300",
    letterSpacing: 1,
    animation: "pulse 0.8s ease-in-out infinite",
  },
  riskBar: {
    height: 5,
    background: "#0d0420",
    borderRadius: 3,
    overflow: "hidden",
  },
  riskFill: {
    height: "100%",
    borderRadius: 3,
    transition: "width 0.4s, background 0.4s",
  },
  bagInfo: {
    fontFamily: "monospace",
    fontSize: 11,
    color: "#c9a86c",
    textAlign: "center",
  },
  buttons: {
    display: "flex",
    gap: 8,
    marginTop: 4,
  },
  btn: {
    flex: 1,
    border: "1px solid",
    borderRadius: 7,
    padding: "11px 8px",
    fontFamily: "serif",
    fontSize: 14,
    letterSpacing: 1,
    cursor: "pointer",
    transition: "all 0.15s",
  },
  drawBtn: {
    background: "rgba(80, 20, 140, 0.35)",
    borderColor: "#7733bb",
    color: "#e8d5b5",
  },
  stopBtn: {
    background: "rgba(30, 10, 50, 0.4)",
    borderColor: "#3a1a5a",
    color: "#c9a86c",
  },
  flaskButton: {
    fontFamily: "monospace",
    fontSize: 10,
    color: "#44aa66",
    textAlign: "center",
    letterSpacing: 0.5,
    lineHeight: 1.5,
    padding: "6px 10px",
    background: "rgba(20, 60, 30, 0.2)",
    border: "1px solid #224433",
    borderRadius: 5,
    cursor: "pointer",
  },
};
