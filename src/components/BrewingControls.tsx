import React from "react";
import { useTranslation } from "../i18n/useTranslation";

interface BrewingControlsProps {
  canDraw: boolean;
  canUseFlask: boolean;
  isDrawing?: boolean;
  onDraw: () => void;
  onStop: () => void;
  onUseFlask: () => void;
  whiteSum: number;
  bagCount: number;
}

export function BrewingControls({
  canDraw,
  canUseFlask,
  isDrawing = false,
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
          color: critical ? "#ff3300" : danger ? "#ff8800" : "var(--scene-cool-accent, #7755aa)",
        }}>
          {whiteSum} / 7 <small style={styles.safeLimit}>({t.brewing.safeLimit})</small>
        </span>
        {critical && <span style={styles.criticalWarning}>⚠ {t.brewing.shatterAtEight}</span>}
      </div>

      <div style={styles.riskBar}>
        <div style={{
          ...styles.riskFill,
          width: `${Math.min((whiteSum / 8) * 100, 100)}%`,
          background: critical
            ? "linear-gradient(90deg, #aa0000, #ff3300)"
            : danger
              ? "linear-gradient(90deg, #aa4400, #ff8800)"
              : "linear-gradient(90deg, var(--scene-divider, #220066), var(--scene-panel-inset, #6622aa))",
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
            opacity: canDraw || isDrawing ? 1 : 0.35,
            cursor: canDraw || isDrawing ? "pointer" : "not-allowed",
            filter: isDrawing ? "brightness(1.18)" : undefined,
          }}
          onClick={onDraw}
          disabled={!canDraw && !isDrawing}
          aria-label={isDrawing ? t.brewing.accelerateDraw : t.brewing.drawToken}
        >
          {isDrawing ? t.brewing.accelerateDraw : t.brewing.drawToken}
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
    gap: 11,
    width: "100%",
    padding: "16px 18px",
    background: "linear-gradient(160deg, var(--scene-panel-bottom, rgba(7, 3, 16, 0.97)), var(--scene-panel-top, rgba(24, 9, 39, 0.94)))",
    border: "1px solid var(--scene-panel-border, rgba(102, 51, 137, 0.72))",
    borderRadius: 10,
    minWidth: 0,
    boxShadow: "0 12px 34px rgba(0, 0, 0, 0.42), 0 0 20px var(--scene-panel-glow, transparent), inset 0 1px rgba(220, 240, 255, 0.05)",
    backdropFilter: "blur(5px)",
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
  safeLimit: {
    color: "#9b8bad",
    fontSize: 9,
    fontWeight: "normal",
  },
  riskBar: {
    height: 7,
    background: "var(--scene-surface, #0d0420)",
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
    minHeight: 48,
    padding: "11px 8px",
    fontFamily: "serif",
    fontSize: 14,
    letterSpacing: 1,
    cursor: "pointer",
    transition: "all 0.15s",
  },
  drawBtn: {
    background: "linear-gradient(180deg, color-mix(in srgb, var(--scene-panel-inset, #aa63d4) 54%, #071016), var(--scene-surface, rgba(62, 17, 99, 0.78)))",
    borderColor: "var(--scene-panel-inset, #aa63d4)",
    color: "#fff0cf",
    boxShadow: "0 0 18px var(--scene-panel-glow, rgba(155, 72, 210, 0.2))",
  },
  stopBtn: {
    background: "var(--scene-surface, rgba(18, 7, 29, 0.78))",
    borderColor: "var(--scene-panel-border-muted, #725083)",
    color: "#d7b978",
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
