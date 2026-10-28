import React from "react";
import { useTranslation } from "../i18n/useTranslation";

interface BrewingControlsProps {
  canDraw: boolean;
  canUseFlask: boolean;
  isDrawing?: boolean;
  onDraw: () => void;
  onStop: () => void;
  onUseFlask: () => void;
  canScry?: boolean;
  scryPrepared?: boolean;
  onScry?: () => void;
  whiteSum: number;
  bagCount: number;
  securedResult: {
    space: number;
    prestige: number;
    coins: number;
    ruby: boolean;
    keepsBothIfShattered: boolean;
  };
  roundObjective?: { title: string; instruction: string; reward: string; accent: string };
  canPrepare?: boolean;
  preparedEmber?: boolean;
}

export function BrewingControls({
  canDraw,
  canUseFlask,
  isDrawing = false,
  onDraw,
  onStop,
  onUseFlask,
  canScry = false,
  scryPrepared = false,
  onScry,
  whiteSum,
  bagCount,
  securedResult,
  roundObjective,
  canPrepare = false,
  preparedEmber = false,
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

      {roundObjective && (
        <div style={{ ...styles.objective, borderColor: roundObjective.accent }}>
          <span style={{ ...styles.objectiveLabel, color: roundObjective.accent }}>Optional objective</span>
          <strong style={styles.objectiveTitle}>{roundObjective.title}</strong>
          <span style={styles.objectiveCopy}>{roundObjective.instruction}</span>
          <b style={styles.objectiveReward}>{roundObjective.reward}</b>
        </div>
      )}

      {preparedEmber && (
        <div style={styles.preparedNotice}>
          Ember banked · first colored ingredient gains +1 movement
        </div>
      )}

      <div style={styles.stopPreview} aria-label={t.brewing.securedResult}>
        <div style={styles.stopPreviewHeader}>
          <span>{t.brewing.securedResult}</span>
          <span style={styles.spaceValue}>{t.brewing.scoringSpace} {securedResult.space}</span>
        </div>
        <div style={styles.rewardGrid}>
          <div style={styles.rewardCell}>
            <span style={styles.rewardLabel}>{t.brewing.securedPrestige}</span>
            <strong style={styles.rewardValue}>+{securedResult.prestige}</strong>
          </div>
          <div style={styles.rewardCell}>
            <span style={styles.rewardLabel}>{t.brewing.securedCoins}</span>
            <strong style={styles.rewardValue}>+{securedResult.coins}</strong>
          </div>
          <div style={styles.rewardCell}>
            <span style={styles.rewardLabel}>{t.brewing.securedRuby}</span>
            <strong style={{ ...styles.rewardValue, color: securedResult.ruby ? "#ef8990" : "#776f76" }}>
              {securedResult.ruby ? "+1" : "—"}
            </strong>
          </div>
        </div>
        <div style={styles.shatterStake}>
          {securedResult.keepsBothIfShattered
            ? t.brewing.protectedFromShatterLoss
            : t.brewing.shatterSacrifice}
        </div>
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
          {canPrepare ? "Stop & Bank Ember" : t.brewing.stopBrewing}
        </button>
      </div>

      {(canScry || scryPrepared) && (
        <button style={{ ...styles.scryButton, opacity: canScry ? 1 : 0.78 }} onClick={onScry} disabled={!canScry}>
          {scryPrepared ? "Chosen omen bound · next draw revealed" : "Scry the Bag · spend 1 ruby"}
        </button>
      )}

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
    gap: 13,
    width: "100%",
    padding: "18px 20px",
    background: "linear-gradient(160deg, var(--scene-panel-bottom, rgba(7, 3, 16, 0.97)), var(--scene-panel-top, rgba(24, 9, 39, 0.94)))",
    border: "1px solid var(--scene-panel-border, rgba(102, 51, 137, 0.72))",
    borderRadius: 10,
    minWidth: 0,
    boxShadow: "0 12px 34px rgba(0, 0, 0, 0.42), 0 0 20px var(--scene-panel-glow, transparent), inset 0 1px rgba(220, 240, 255, 0.05)",
    backdropFilter: "blur(5px)",
  },
  objective: { display: "grid", gap: 4, padding: "11px 12px", border: "1px solid", background: "rgba(2,15,19,.72)" },
  objectiveLabel: { fontFamily: "monospace", fontSize: 10, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase" },
  objectiveTitle: { color: "#e4c477", fontFamily: "Georgia,serif", fontSize: 16 },
  objectiveCopy: { color: "#d8cebd", fontFamily: "Georgia,serif", fontSize: 13, lineHeight: 1.35 },
  objectiveReward: { color: "#82d9d2", fontFamily: "monospace", fontSize: 11, textTransform: "uppercase" },
  preparedNotice: { padding: "10px 12px", border: "1px solid rgba(219,170,76,.55)", background: "rgba(54,34,8,.55)", color: "#e7c77e", fontFamily: "Georgia,serif", fontSize: 13, lineHeight: 1.35 },
  riskRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  riskLabel: {
    fontFamily: "monospace",
    fontSize: 13,
    color: "#c9a86c",
    flex: 1,
  },
  riskValue: {
    fontFamily: "serif",
    fontSize: 16,
    fontWeight: "bold",
  },
  criticalWarning: {
    fontFamily: "monospace",
    fontSize: 12,
    color: "#ff3300",
    letterSpacing: 1,
    animation: "pulse 0.8s ease-in-out infinite",
  },
  safeLimit: {
    color: "#9b8bad",
    fontSize: 11,
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
    fontSize: 13,
    color: "#c9a86c",
    textAlign: "center",
  },
  stopPreview: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    padding: "11px 12px",
    border: "1px solid color-mix(in srgb, var(--scene-cool-accent, #76d7c4) 42%, transparent)",
    borderRadius: 7,
    background: "linear-gradient(145deg, rgba(3,20,24,.82), rgba(3,11,17,.86))",
    boxShadow: "inset 0 0 22px rgba(65,174,181,.055)",
  },
  stopPreviewHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    color: "var(--scene-cool-accent, #76d7c4)",
    fontFamily: "monospace",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  spaceValue: {
    color: "#ead29b",
    letterSpacing: .5,
    whiteSpace: "nowrap",
  },
  rewardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 6,
  },
  rewardCell: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
    padding: "7px 4px",
    border: "1px solid rgba(113,190,198,.14)",
    borderRadius: 5,
    background: "rgba(0,7,11,.58)",
  },
  rewardLabel: {
    color: "#a9a0a2",
    fontFamily: "monospace",
    fontSize: 10,
    letterSpacing: .7,
    textTransform: "uppercase",
  },
  rewardValue: {
    color: "#e6c46f",
    fontFamily: "Georgia, serif",
    fontSize: 17,
  },
  shatterStake: {
    color: "#d2bca5",
    fontFamily: "Georgia, serif",
    fontSize: 12,
    fontStyle: "italic",
    lineHeight: 1.35,
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
    fontSize: 15,
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
    fontSize: 12,
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
  scryButton: {
    minHeight: 42,
    padding: "9px 12px",
    border: "1px solid rgba(106,211,210,.55)",
    borderRadius: 6,
    background: "linear-gradient(145deg,rgba(6,40,45,.88),rgba(9,18,29,.92))",
    color: "#b9f0e8",
    fontFamily: "Georgia, serif",
    fontSize: 14,
    letterSpacing: .4,
    cursor: "pointer",
  },
};
