import React from "react";
import type { Player } from "../game/playerTypes";
import { useTranslation } from "../i18n/useTranslation";
import { REMEDY_TRACK_MAX } from "../game/distillation";
import { MIREWROUGHT_ASSETS } from "../assets/mirewroughtAssets";
import { AFFLICTION_EMBLEMS, VEILGLASS_ASSETS } from "../assets/veilglassAssets";
import { CORE_CHARACTER_PORTRAITS, CORE_ECONOMY_ASSETS } from "../assets/coreAssets";

interface PlayerPanelProps {
  player: Player;
  isActive: boolean;
  label?: string;
  compact?: boolean;
  status?: "queued" | "brewing" | "stopped" | "complete";
}

export function PlayerPanel({ player, isActive, label, compact = false, status }: PlayerPanelProps) {
  const t = useTranslation();
  const exploded = player.crucible.exploded;
  const bagCount = player.bag.tokens.length;
  const whiteSum = player.crucible.whiteSum;
  const runoffValue = player.crucible.overflowTokens.reduce(
    (total, token) => total + (token.resolvedMovement ?? token.value),
    0,
  );
  const visualState = player.crucible.exploded ? "shattered" : status;
  const statusLabel = visualState === "shattered"
    ? t.player.shattered.replace(/✦/g, "").trim()
    : visualState === "brewing"
      ? t.player.opponentBrewing
      : visualState === "stopped"
        ? t.player.opponentStopped
        : visualState === "complete"
          ? t.player.opponentComplete
          : visualState === "queued"
            ? t.player.opponentQueued
            : undefined;
  const afflictionName = player.affliction
    ? t.afflictions.contractNames[player.affliction.contractId]
    : null;

  return (
    <div
      className={compact ? "player-panel player-panel-compact" : "player-panel"}
      data-player-id={player.id}
      data-layout={compact ? "compact" : "full"}
      data-state={visualState}
      style={{
        ...styles.panel,
        ...(compact ? styles.panelCompact : {}),
        ...(visualState === "queued" ? styles.panelQueued : {}),
        ...(visualState === "stopped" || visualState === "complete" ? styles.panelFinished : {}),
        ...(visualState === "shattered" ? styles.panelShattered : {}),
        ...(isActive || visualState === "brewing" ? styles.panelActive : {}),
      }}
    >
      {/* Header */}
      <div style={styles.header}>
        <img
          src={player.kind === "human"
            ? CORE_CHARACTER_PORTRAITS.Hexbrewer
            : CORE_CHARACTER_PORTRAITS[player.name] ?? CORE_CHARACTER_PORTRAITS["The Shade"]}
          alt={player.name}
          style={{ ...styles.avatar, ...(compact ? styles.avatarCompact : {}) }}
        />
        <span style={{ ...styles.name, ...(compact ? styles.nameCompact : {}) }}>{label ?? player.name}</span>
        {isActive && <span style={styles.activePip}>▶</span>}
        {statusLabel && (
          <span style={{
            ...styles.statusTag,
            ...(visualState === "brewing" ? styles.statusBrewing : {}),
            ...(visualState === "stopped" || visualState === "complete" ? styles.statusFinished : {}),
            ...(visualState === "shattered" ? styles.statusShattered : {}),
          }}>
            {visualState === "brewing" ? "◆ " : visualState === "queued" ? "◇ " : "✓ "}{statusLabel}
          </span>
        )}
        {player.kind === "ai" && <span style={styles.aiTag}>AI</span>}
      </div>

      {!compact && <div style={styles.divider} />}

      <div style={compact ? styles.compactStats : styles.fullStats}>
        <Stat kind="prestige" label={t.player.prestige} value={player.score} compact={compact} icon={CORE_ECONOMY_ASSETS.scoreMarker} />
        <Stat kind="rubies" label={t.player.rubies} value={player.rubies} compact={compact} accent="#cc88ff" icon={CORE_ECONOMY_ASSETS.ruby} />
        <Stat kind="bag" label={t.player.bag} value={compact ? bagCount : `${bagCount} ${t.player.tokens}`} compact={compact} icon={CORE_ECONOMY_ASSETS.brewBag} />
      </div>

      {/* White sum — danger meter */}
      <div data-player-stat="pressure" style={styles.dangerRow}>
        <span style={styles.statLabel}>{t.player.voidshards}</span>
        <div style={styles.dangerBar}>
          <div
            style={{
              ...styles.dangerFill,
              width: `${Math.min((whiteSum / 7) * 100, 100)}%`,
              background: whiteSum >= 6
                ? "#ff2200"
                : whiteSum >= 4
                  ? "#ff8800"
                  : "#4422aa",
            }}
          />
        </div>
        <span style={{
          ...styles.dangerNum,
          color: whiteSum >= 6 ? "#ff4422" : "#aa88cc",
        }}>
          {whiteSum}/7
        </span>
      </div>

      {/* Flask */}
      <div data-player-stat="vial" style={{ ...styles.row, ...(compact ? styles.compactFooter : {}) }}>
        <span style={styles.iconLabel}><img src={player.flask ? CORE_ECONOMY_ASSETS.flaskFull : CORE_ECONOMY_ASSETS.flaskEmpty} alt="" style={styles.statIcon} />{t.player.cursedVial}</span>
        <span style={{
          ...styles.flaskStatus,
          color: player.flask ? "#44ff88" : "#553355",
        }}>
          {player.flask ? t.player.ready : t.player.spent}
        </span>
      </div>

      {player.ratStoneOffset > 0 && (
        <div style={styles.row}>
          <span style={styles.iconLabel}><img src={CORE_ECONOMY_ASSETS.ratStone} alt="" style={styles.statIcon} />Rat stone</span>
          <span style={styles.statValue}>+{player.ratStoneOffset}</span>
        </div>
      )}

      {player.crucible.overflowEnabled && runoffValue > 0 && (
        <div style={{ ...styles.runoffRow, backgroundImage: `linear-gradient(rgba(3,12,15,.68),rgba(3,12,15,.68)), url('${MIREWROUGHT_ASSETS.abyssalRunoffFrame}')` }}>
          <span style={styles.statLabel}>{t.roundSummary.runoff}</span>
          <span style={styles.runoffValue}>{runoffValue} → +{Math.floor(runoffValue / 2)} {t.player.prestige}</span>
        </div>
      )}

      {player.affliction && afflictionName && (
        <div
          style={styles.afflictionBlock}
          title={t.afflictions.title}
        >
          <div style={styles.afflictionRow}>
            <span style={styles.afflictionIdentity}>
              <img src={AFFLICTION_EMBLEMS[player.affliction.contractId]} alt="" aria-hidden="true" style={styles.afflictionEmblem} />
              <span style={styles.afflictionName}>{afflictionName}</span>
            </span>
            <span style={styles.retortNumbers}>
              <span style={styles.distillate}>{t.afflictions.distillate} {player.affliction.totalDistillate}</span>
              <span style={styles.retortProgress}>{t.afflictions.retort} {player.affliction.lastProgress}/{REMEDY_TRACK_MAX}</span>
            </span>
          </div>
          <div
            style={styles.retortFrameWrap}
            role="img"
            aria-label={`${t.afflictions.retort}: ${player.affliction.lastProgress}/${REMEDY_TRACK_MAX}`}
          >
            <img src={VEILGLASS_ASSETS.retortFrame} alt="" aria-hidden="true" style={styles.retortFrame} />
            {VEILGLASS_ASSETS.retortBloodFills
              .slice(0, Math.min(player.affliction.lastProgress, REMEDY_TRACK_MAX))
              .map((src) => (
                <img
                  key={src}
                  src={src}
                  alt=""
                  aria-hidden="true"
                  style={styles.retortBloodFill}
                />
              ))}
          </div>
          {player.affliction.pendingHeadStart > 0 && (
            <span style={styles.pendingRemedy}>{t.afflictions.pendingHeadStart.replace("{amount}", String(player.affliction.pendingHeadStart))}</span>
          )}
        </div>
      )}

      {/* Explosion indicator */}
      {exploded && !compact && (
        <div style={styles.explodedBadge}>
          {t.player.shattered}
        </div>
      )}
    </div>
  );
}

function Stat({ kind, label, value, compact, accent, icon }: { kind: "prestige" | "rubies" | "bag"; label: string; value: React.ReactNode; compact: boolean; accent?: string; icon?: string }) {
  return (
    <div data-player-stat={kind} style={compact ? styles.compactStat : styles.row} title={label}>
      <span style={{ ...styles.iconLabel, ...styles.statLabel, ...(compact ? styles.compactStatLabel : {}) }}>{icon && <img src={icon} alt="" style={styles.statIcon} />}{label}</span>
      <span style={{ ...styles.statValue, ...(compact ? styles.compactStatValue : {}), ...(accent ? { color: accent } : {}) }}>
        {value}
      </span>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  panel: {
    width: "100%",
    backgroundImage: "linear-gradient(145deg, var(--scene-panel-top, rgba(22, 8, 34, 0.94)), var(--scene-panel-bottom, rgba(7, 3, 13, 0.97))), url('/images/parchment_dark.jpg')",
    backgroundSize: "cover",
    border: "1px solid var(--scene-panel-border, rgba(102, 51, 137, 0.72))",
    borderRadius: 10,
    padding: "18px 20px",
    minWidth: 190,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    boxShadow: "0 12px 34px rgba(0, 0, 0, 0.42), inset 0 1px rgba(220, 180, 255, 0.05)",
    backdropFilter: "blur(5px)",
    transition: "border-color 0.3s, box-shadow 0.3s",
  },
  panelActive: {
    border: "1px solid var(--scene-panel-inset, #9a58ca)",
    boxShadow: "0 0 24px var(--scene-panel-glow, rgba(120, 40, 200, 0.26)), inset 3px 0 #d1a443",
  },
  panelQueued: {
    opacity: 0.78,
    border: "1px solid var(--scene-panel-border-muted, rgba(75, 47, 91, 0.62))",
  },
  panelFinished: {
    border: "1px solid rgba(69, 133, 105, 0.68)",
    boxShadow: "0 10px 28px rgba(0, 0, 0, 0.36), inset 3px 0 rgba(78, 181, 132, 0.7)",
  },
  panelShattered: {
    border: "1px solid rgba(184, 54, 42, 0.85)",
    boxShadow: "0 10px 30px rgba(80, 4, 4, 0.4), inset 3px 0 #c44738",
  },
  panelCompact: {
    minWidth: 0,
    padding: "11px 12px",
    gap: 7,
    backgroundImage: "linear-gradient(145deg, var(--scene-panel-top, rgba(25, 10, 38, 0.97)), var(--scene-panel-bottom, rgba(8, 3, 15, 0.98))), url('/images/parchment_dark.jpg')",
  },
  runoffRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 8,
    padding: "5px 7px",
    border: "1px solid rgba(113, 244, 213, 0.3)",
    borderRadius: 5,
    backgroundColor: "rgba(8, 43, 40, 0.32)",
    backgroundSize: "100% 100%",
    backgroundPosition: "center",
  },
  runoffValue: {
    color: "#b8ffe9",
    fontFamily: "monospace",
    fontSize: 10,
    whiteSpace: "nowrap",
  },
  afflictionRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    minHeight: 31,
    padding: "3px 2px 5px",
    borderRadius: 5,
    background: "transparent",
    borderBottom: "1px solid rgba(111,190,229,.18)",
  },
  afflictionBlock: {
    position: "relative", isolation: "isolate", overflow: "visible", minHeight: 116,
    display: "flex", flexDirection: "column", justifyContent: "center", gap: 7, padding: "9px 10px 8px",
    border: "1px solid rgba(111,190,229,.2)", borderRadius: 7, background: "linear-gradient(180deg,rgba(8,23,35,.78),rgba(3,10,18,.74))",
  },
  retortFrameWrap: { position: "relative", width: "100%", aspectRatio: "1600 / 420", boxSizing: "border-box" },
  retortFrame: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", objectPosition: "center", zIndex: 1, pointerEvents: "none", filter: "drop-shadow(0 0 7px rgba(111,190,229,.28))" },
  retortBloodFill: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", objectPosition: "center", zIndex: 2, pointerEvents: "none", filter: "saturate(1.08)" },
  afflictionIdentity: { minWidth: 0, display: "flex", alignItems: "center", gap: 5 },
  afflictionEmblem: { width: 25, height: 25, flexShrink: 0, objectFit: "contain", filter: "drop-shadow(0 0 5px rgba(112,198,232,.55))" },
  afflictionName: { color: "#e0f1ff", fontFamily: "Georgia, serif", fontSize: 12, fontWeight: 700, lineHeight: 1.2, textShadow: "0 1px 3px #000" },
  retortNumbers: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2, whiteSpace: "nowrap" },
  distillate: { color: "#b7deff", fontFamily: "monospace", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap", textShadow: "0 1px 3px #000" },
  retortProgress: { color: "#75bfdc", fontFamily: "monospace", fontSize: 10, fontWeight: 700, textShadow: "0 1px 3px #000" },
  pendingRemedy: { color: "#ffe091", fontFamily: "monospace", fontSize: 11, lineHeight: 1.35, padding: "0 6px", textShadow: "0 1px 3px #000" },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    border: "1px solid var(--scene-panel-inset, #7733bb)",
  },
  avatarCompact: {
    width: 24,
    height: 24,
  },
  name: {
    fontFamily: "serif",
    fontSize: 17,
    color: "#e8b84d",
    letterSpacing: 1,
    flex: 1,
  },
  nameCompact: {
    fontSize: 15,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  activePip: {
    color: "#c9a86c",
    fontSize: 12,
  },
  aiTag: {
    background: "var(--scene-surface, rgba(80, 20, 120, 0.5))",
    border: "1px solid var(--scene-panel-border-muted, #5a1a8a)",
    borderRadius: 4,
    padding: "1px 6px",
    fontSize: 12,
    color: "#c9a86c",
    fontFamily: "monospace",
    letterSpacing: 1,
  },
  statusTag: {
    flexShrink: 0,
    padding: "2px 5px",
    border: "1px solid #4b2f5b",
    borderRadius: 4,
    color: "#8f7b9c",
    background: "rgba(10, 4, 18, 0.72)",
    fontFamily: "monospace",
    fontSize: 10,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  statusBrewing: {
    color: "#edc76e",
    border: "1px solid #96713a",
    boxShadow: "0 0 10px rgba(232, 184, 77, 0.2)",
  },
  statusFinished: {
    color: "#62d49a",
    border: "1px solid #356f55",
  },
  statusShattered: {
    color: "#ff8b7c",
    border: "1px solid #9b392f",
  },
  divider: {
    height: 1,
    background: "linear-gradient(90deg, transparent, var(--scene-divider, #3a1a5a), transparent)",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  fullStats: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  compactStats: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 5,
  },
  compactStat: {
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
    padding: "5px 3px",
    border: "1px solid var(--scene-panel-border-muted, rgba(109, 58, 145, 0.3))",
    borderRadius: 5,
    background: "var(--scene-surface, rgba(15, 6, 25, 0.55))",
  },
  compactStatLabel: {
    maxWidth: "100%",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontSize: 10,
    textTransform: "uppercase",
  },
  compactStatValue: {
    fontSize: 15,
  },
  compactFooter: {
    paddingTop: 1,
  },
  statLabel: {
    fontFamily: "monospace",
    fontSize: 13,
    color: "#c9a86c",
    letterSpacing: 0.5,
  },
  iconLabel: { display: "inline-flex", alignItems: "center", gap: 5, minWidth: 0 },
  statIcon: { width: 17, height: 17, flexShrink: 0, objectFit: "contain", filter: "drop-shadow(0 0 4px rgba(224,184,95,.32))" },
  statValue: {
    fontFamily: "serif",
    fontSize: 17,
    color: "#e8d5b5",
    fontWeight: "bold",
  },
  dangerRow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  dangerBar: {
    flex: 1,
    height: 6,
    background: "var(--scene-surface, #1a0a2e)",
    borderRadius: 2,
    overflow: "hidden",
  },
  dangerFill: {
    height: "100%",
    borderRadius: 2,
    boxShadow: "0 0 8px currentColor",
    transition: "width 0.4s, background 0.4s",
  },
  dangerNum: {
    fontFamily: "monospace",
    fontSize: 12,
    minWidth: 24,
    textAlign: "right",
  },
  flaskStatus: {
    fontFamily: "monospace",
    fontSize: 13,
    letterSpacing: 0.5,
  },
  explodedBadge: {
    background: "rgba(180, 20, 0, 0.2)",
    border: "1px solid #aa2200",
    borderRadius: 5,
    padding: "5px 10px",
    fontFamily: "serif",
    fontSize: 13,
    color: "#ff8888",
    textAlign: "center",
    letterSpacing: 2,
    animation: "pulse 1.2s ease-in-out infinite",
  },
};
