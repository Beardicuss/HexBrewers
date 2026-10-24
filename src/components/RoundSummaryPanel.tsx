import React from "react";
import type { RoundSummary } from "../game/gameState";
import { useTranslation } from "../i18n/useTranslation";
import { formatBonusDieResult } from "./bonusDieText";
import { AFFLICTION_EMBLEMS, REMEDY_SYMBOLS, VEILGLASS_ASSETS } from "../assets/veilglassAssets";
import { REMEDY_TRACK_MAX } from "../game/distillation";
import type { AfflictionState } from "../game/distillation";

export function RoundSummaryPanel({ summary, cinematic = false, afflictions = {} }: {
  summary: RoundSummary;
  cinematic?: boolean;
  afflictions?: Record<string, AfflictionState | undefined>;
}) {
  const t = useTranslation();
  const hasDistillation = summary.players.some((player) => player.distillationProgress !== undefined);
  return (
    <div style={{ ...styles.panel, ...(cinematic ? styles.panelCinematic : {}) }}>
      <style>{`@keyframes scoring-player-reveal{from{opacity:0;transform:translateY(14px);filter:blur(3px)}to{opacity:1;transform:translateY(0);filter:blur(0)}}@keyframes scoring-title-reveal{from{opacity:0;letter-spacing:.35em}to{opacity:1;letter-spacing:.08em}}@keyframes distill-cell-fill{0%{opacity:.12;transform:scale(.55);filter:brightness(.6)}55%{opacity:1;transform:scale(1.18);filter:brightness(1.7)}100%{opacity:1;transform:scale(1);filter:brightness(1)}}@keyframes distill-marker-rise{from{opacity:0;transform:translateY(10px) scale(.7)}to{opacity:1;transform:translateY(0) scale(1)}}@media(prefers-reduced-motion:reduce){.scoring-player,.scoring-title,.distillation-cell,.distillation-marker{animation:none!important;opacity:1!important}}`}</style>
      {hasDistillation && (
        <div style={styles.distillationVisual}>
          <img src={VEILGLASS_ASSETS.distillationBanner} alt="" aria-hidden="true" style={styles.distillationBanner} />
          <video key={summary.round} src={VEILGLASS_ASSETS.distillationVapor} autoPlay muted playsInline aria-hidden="true" style={styles.distillationVapor} />
        </div>
      )}
      {cinematic && <div style={styles.kicker}>{t.roundSummary.calculating}</div>}
      <div className="scoring-title" style={{ ...styles.title, ...(cinematic ? styles.titleCinematic : {}) }}>{t.roundSummary.title.replace("{round}", String(summary.round))}</div>
      {cinematic && hasDistillation && (
        <div style={styles.distillationSequence}>
          {summary.players.map((player, playerIndex) => {
            const affliction = afflictions[player.playerId];
            if (!affliction || player.distillationProgress === undefined) return null;
            const progress = Math.min(REMEDY_TRACK_MAX, player.distillationProgress);
            return (
              <div key={player.playerId} style={styles.distillationPlayer}>
                <div style={styles.distillationIdentity}>
                  <img src={AFFLICTION_EMBLEMS[affliction.contractId]} alt="" aria-hidden="true" style={styles.distillationEmblem} />
                  <span><b>{player.name}</b><small>{t.afflictions.contractNames[affliction.contractId]}</small></span>
                </div>
                <div style={styles.distillationTrack} aria-label={`${t.afflictions.retort}: ${progress}/${REMEDY_TRACK_MAX}`}>
                  {Array.from({ length: REMEDY_TRACK_MAX }, (_, index) => (
                    <span
                      key={index}
                      className="distillation-cell"
                      style={{
                        ...styles.distillationCell,
                        ...(index < progress ? styles.distillationCellFilled : {}),
                        animationDelay: index < progress ? `${260 + playerIndex * 120 + index * 70}ms` : undefined,
                      }}
                    />
                  ))}
                  <img
                    className="distillation-marker"
                    src={VEILGLASS_ASSETS.distillateMarker}
                    alt=""
                    aria-hidden="true"
                    style={{ ...styles.distillationMarker, left: `${Math.max(3, progress / REMEDY_TRACK_MAX * 100)}%`, animationDelay: `${320 + playerIndex * 120 + progress * 70}ms` }}
                  />
                </div>
                <strong style={styles.distillationGain}>+{player.distillationProgress}</strong>
              </div>
            );
          })}
        </div>
      )}
      <div style={cinematic ? styles.playersCinematic : undefined}>
      {summary.players.map((player, index) => (
        <div className="scoring-player" key={player.playerId} style={{ ...styles.playerBlock, ...(cinematic ? styles.playerBlockCinematic : {}), animationDelay: cinematic ? `${180 + index * 150}ms` : undefined }}>
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
  panelCinematic: {
    width: "min(1040px, 90vw)",
    maxHeight: "86vh",
    padding: "28px 34px 32px",
    gap: 14,
    background: "linear-gradient(155deg,var(--scene-panel-top,rgba(3,22,27,.97)),var(--scene-panel-bottom,rgba(2,9,15,.98)))",
    borderColor: "var(--scene-panel-border,rgba(91,194,199,.55))",
    boxShadow: "0 24px 90px rgba(0,0,0,.7),0 0 70px var(--scene-panel-glow,rgba(45,150,166,.16))",
  },
  kicker: { color: "var(--scene-cool-accent,#76d7c4)", textAlign: "center", fontFamily: "monospace", fontSize: 11, letterSpacing: 3, textTransform: "uppercase" },
  titleCinematic: { fontSize: 28, animation: "scoring-title-reveal .5s ease-out both" },
  playersCinematic: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16 },
  playerBlockCinematic: { padding: 14, border: "1px solid rgba(91,194,199,.22)", borderRadius: 8, background: "rgba(1,9,14,.55)", opacity: 0, animation: "scoring-player-reveal .48s ease-out both" },
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
  distillationSequence: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 8, padding: "10px 12px", border: "1px solid rgba(117,191,220,.3)", borderRadius: 8, background: "linear-gradient(135deg,rgba(8,25,38,.82),rgba(4,10,20,.78))", boxShadow: "inset 0 0 30px rgba(73,154,188,.06)" },
  distillationPlayer: { display: "grid", gridTemplateColumns: "minmax(100px,.9fr) minmax(100px,1.3fr) auto", alignItems: "center", gap: 10, minWidth: 0, padding: "7px 8px", borderBottom: "1px solid rgba(117,191,220,.12)" },
  distillationIdentity: { display: "flex", alignItems: "center", gap: 7, minWidth: 0, color: "#e8f4ff", fontFamily: "Georgia,serif", fontSize: 12 },
  distillationEmblem: { width: 31, height: 31, objectFit: "contain", flexShrink: 0, filter: "drop-shadow(0 0 8px rgba(117,191,220,.56))" },
  distillationTrack: { position: "relative", display: "grid", gridTemplateColumns: `repeat(${REMEDY_TRACK_MAX},1fr)`, gap: 3, alignItems: "center", minWidth: 0, padding: "9px 4px" },
  distillationCell: { height: 7, border: "1px solid rgba(117,191,220,.28)", borderRadius: 999, background: "rgba(2,10,18,.78)", opacity: .45 },
  distillationCellFilled: { background: "linear-gradient(90deg,#4d8da8,#b7e9ff)", borderColor: "#9eddf7", boxShadow: "0 0 8px rgba(117,191,220,.5)", animation: "distill-cell-fill .42s ease-out both" },
  distillationMarker: { position: "absolute", top: "50%", width: 23, height: 23, objectFit: "contain", transform: "translate(-50%,-50%)", filter: "drop-shadow(0 0 7px rgba(180,230,255,.8))", animation: "distill-marker-rise .38s ease-out both" },
  distillationGain: { color: "#b7e9ff", font: "700 16px/1 monospace", textShadow: "0 0 10px rgba(117,191,220,.7)" },
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
