import React from "react";
import type { RoundSummary } from "../game/gameState";
import { useTranslation } from "../i18n/useTranslation";
import { formatBonusDieResult } from "./bonusDieText";
import { REMEDY_SYMBOLS, VEILGLASS_ASSETS } from "../assets/veilglassAssets";
import { REMEDY_TRACK_MAX } from "../game/distillation";

export function RoundSummaryPanel({ summary }: { summary: RoundSummary }) {
  const t = useTranslation();
  const hasDistillation = summary.players.some((player) => player.distillationProgress !== undefined);
  return (
    <div style={styles.panel}>
      {hasDistillation && (
        <div style={styles.distillationVisual}>
          <img src={VEILGLASS_ASSETS.distillationBanner} alt="" aria-hidden="true" style={styles.distillationBanner} />
          <video key={summary.round} src={VEILGLASS_ASSETS.distillationVapor} autoPlay muted playsInline aria-hidden="true" style={styles.distillationVapor} />
        </div>
      )}
      <div style={styles.title}>{t.roundSummary.title.replace("{round}", String(summary.round))}</div>
      {summary.players.map((player) => (
        <div key={player.playerId} style={styles.playerBlock}>
          <div style={styles.nameRow}>
            <span style={styles.name}>{player.name}</span>
            <span style={player.exploded ? styles.burst : styles.safe}>
              {player.exploded ? t.roundSummary.shattered : t.roundSummary.stable}
            </span>
          </div>
          <div style={styles.grid}>
            <RewardTile label={t.roundSummary.space} value={String(player.space)} />
            <RewardTile label={t.roundSummary.prestige} value={formatAward(player.prestigeAwarded, player.vp)} tone="gold" />
            <RewardTile label={t.roundSummary.coins} value={formatAward(player.coinsAwarded, player.coins)} tone="gold" />
            <RewardTile label={t.roundSummary.ruby} value={player.rubyAwarded > 0 ? `+${player.rubyAwarded}` : "—"} tone="ruby" />
            {player.overflowValue > 0 && (
              <RewardTile label={t.roundSummary.runoff} value={`${player.overflowValue} → +${player.overflowVp}`} tone="gold" />
            )}
          </div>
          <div style={styles.explanation}>
            <div>• {scoringExplanation(player.scoringRule, player.vp, player.coins, t.roundSummary)}</div>
            {player.rubyAwarded > 0 && (
              <div>• {player.doubleRuby ? t.roundSummary.doubleRubyExplanation : t.roundSummary.rubyExplanation}</div>
            )}
            {player.bonusDie && <div>• {t.roundSummary.dieExplanation}</div>}
            {player.overflowValue > 0 && <div>• {t.roundSummary.runoffExplanation.replace("{value}", String(player.overflowValue)).replace("{prestige}", String(player.overflowVp))}</div>}
            {player.distillationProgress !== undefined && (
              <div>• {t.afflictions.roundResult
                .replace("{progress}", String(player.distillationProgress))
                .replace("{prestige}", String(player.distillationPrestige ?? 0))
                .replace("{droplet}", String(player.distillationDroplet ?? 0))
                .replace("{headStart}", String(player.distillationHeadStart ?? 0))}</div>
            )}
          </div>
          {player.distillationProgress !== undefined && (
            <div style={styles.remedyRewards}>
              <RemedyReward icon={REMEDY_SYMBOLS.distillate} value={`+${player.distillationProgress}`} />
              {(player.distillationPrestige ?? 0) > 0 && <RemedyReward icon={REMEDY_SYMBOLS.prestige} value={`+${player.distillationPrestige}`} />}
              {(player.distillationDroplet ?? 0) > 0 && <RemedyReward icon={REMEDY_SYMBOLS.dropletAdvance} value={`+${player.distillationDroplet}`} />}
              {(player.distillationHeadStart ?? 0) > 0 && <RemedyReward icon={REMEDY_SYMBOLS.headStart} value={`+${player.distillationHeadStart}`} />}
              {player.distillationProgress >= REMEDY_TRACK_MAX && <RemedyReward icon={REMEDY_SYMBOLS.complete} value="✓" />}
              {summary.round >= 9 && <RemedyReward icon={REMEDY_SYMBOLS.finalConversion} value="✦" />}
            </div>
          )}
          {player.bonusDie && (
            <div style={styles.die}>
              {t.roundSummary.die}: {formatBonusDieResult(player.bonusDie, t.bonusDieRewards)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function RemedyReward({ icon, value }: { icon: string; value: string }) {
  return <span style={styles.remedyReward}><img src={icon} alt="" aria-hidden="true" style={styles.remedyIcon} /><b>{value}</b></span>;
}

function RewardTile({ label, value, tone }: { label: string; value: string; tone?: "gold" | "ruby" }) {
  return (
    <div style={styles.rewardTile}>
      <span style={styles.rewardLabel}>{label}</span>
      <strong style={{
        ...styles.rewardValue,
        ...(tone === "gold" ? styles.rewardGold : {}),
        ...(tone === "ruby" ? styles.rewardRuby : {}),
      }}>
        {value}
      </strong>
    </div>
  );
}

function formatAward(awarded: number | null, available: number): string {
  return awarded === null ? `? / +${available}` : awarded > 0 ? `+${awarded}` : "—";
}

function scoringExplanation(
  rule: "both" | "choice" | "protected",
  prestige: number,
  coins: number,
  text: { bothExplanation: string; choiceExplanation: string; protectedExplanation: string },
): string {
  const template = rule === "both"
    ? text.bothExplanation
    : rule === "protected"
      ? text.protectedExplanation
      : text.choiceExplanation;
  return template.replace("{prestige}", String(prestige)).replace("{coins}", String(coins));
}

const styles: Record<string, React.CSSProperties> = {
  panel: {
    background: "rgba(14, 6, 28, 0.82)",
    border: "1px solid #3a1a5a",
    borderRadius: 8,
    padding: "14px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
    maxHeight: "min(52vh, 480px)",
    overflowY: "auto",
    overscrollBehavior: "contain",
    animation: "fadeInUp 0.24s ease-out",
  },
  title: {
    color: "#e8b84d",
    fontFamily: "Georgia, serif",
    fontSize: 14,
    letterSpacing: 1,
    textAlign: "center",
  },
  distillationBanner: {
    width: "100%",
    maxHeight: 62,
    objectFit: "contain",
    margin: 0,
    pointerEvents: "none",
  },
  distillationVisual: { position: "relative", height: 62, margin: "-7px 0 -8px", overflow: "hidden" },
  distillationVapor: { position: "absolute", left: "50%", top: "50%", width: 110, height: 110, transform: "translate(-50%,-50%)", objectFit: "contain", mixBlendMode: "screen", opacity: .72, pointerEvents: "none" },
  remedyRewards: { display: "flex", flexWrap: "wrap", gap: 5 },
  remedyReward: { display: "inline-flex", alignItems: "center", gap: 3, padding: "2px 6px", border: "1px solid rgba(117,191,220,.42)", borderRadius: 999, color: "#b7deff", background: "rgba(9,20,35,.7)", fontFamily: "monospace", fontSize: 10 },
  remedyIcon: { width: 20, height: 20, objectFit: "contain", filter: "drop-shadow(0 0 4px rgba(117,191,220,.5))" },
  playerBlock: {
    borderTop: "1px solid rgba(90, 26, 138, 0.65)",
    paddingTop: 8,
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  nameRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  name: {
    color: "#e8d5b5",
    fontFamily: "Georgia, serif",
    fontSize: 13,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  safe: {
    color: "#66cc88",
    fontFamily: "monospace",
    fontSize: 11,
    border: "1px solid #356f55",
    borderRadius: 4,
    padding: "2px 6px",
    background: "rgba(28, 91, 59, 0.22)",
  },
  burst: {
    color: "#ff8888",
    fontFamily: "monospace",
    fontSize: 11,
    border: "1px solid #8f392f",
    borderRadius: 4,
    padding: "2px 6px",
    background: "rgba(110, 24, 19, 0.22)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 5,
  },
  rewardTile: {
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
    padding: "5px 4px",
    border: "1px solid rgba(96, 59, 122, 0.48)",
    borderRadius: 5,
    background: "rgba(9, 3, 17, 0.58)",
  },
  rewardLabel: {
    maxWidth: "100%",
    overflow: "hidden",
    textOverflow: "ellipsis",
    color: "#9f8aba",
    fontFamily: "monospace",
    fontSize: 9,
    whiteSpace: "nowrap",
    textTransform: "uppercase",
  },
  rewardValue: {
    color: "#e5d9ec",
    fontFamily: "Georgia, serif",
    fontSize: 14,
  },
  rewardGold: {
    color: "#edc76e",
  },
  rewardRuby: {
    color: "#ff6f91",
  },
  die: {
    color: "#ffaa44",
    border: "1px solid #443300",
    background: "rgba(80, 40, 0, 0.2)",
    borderRadius: 5,
    padding: "4px 6px",
    fontFamily: "monospace",
    fontSize: 11,
    textAlign: "center",
  },
  explanation: {
    display: "flex",
    flexDirection: "column",
    gap: 3,
    color: "#b8a6c8",
    fontFamily: "monospace",
    fontSize: 10,
    lineHeight: 1.35,
  },
};
