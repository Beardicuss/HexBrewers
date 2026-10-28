import React, { useEffect, useMemo } from "react";
import { CORE_ECONOMY_ASSETS, CORE_INGREDIENT_ASSETS } from "../assets/coreAssets";
import { getPlacedTokens } from "../game/crucible";
import type { Player } from "../game/playerTypes";
import type { RecipeBooks } from "../game/recipeBooks";
import { analyzeBuildIdentity } from "../game/buildIdentity";
import { calculateNextDrawRisk, groupTokens, type RiskBand, type TokenGroup } from "../game/strategyInsights";
import { getLocalizedTokenName } from "../i18n/tokenNames";
import { useTranslation } from "../i18n/useTranslation";
import { getTokenVisual } from "../pixi/tokenVisuals";

interface BrewersLedgerProps {
  player: Player;
  recipeBooks: RecipeBooks;
  open: boolean;
  onClose: () => void;
}

const RISK_COLORS: Record<RiskBand, string> = {
  safe: "#79d9d5",
  unsettled: "#d8bd72",
  grave: "#df884e",
  ruinous: "#ef5e4e",
};

export function BrewersLedger({ player, recipeBooks, open, onClose }: BrewersLedgerProps) {
  const t = useTranslation();
  const bagGroups = useMemo(() => groupTokens(player.bag.tokens), [player.bag.tokens]);
  const drawnTokens = useMemo(() => getPlacedTokens(player.crucible), [player.crucible]);
  const drawnGroups = useMemo(() => groupTokens(drawnTokens), [drawnTokens]);
  const risk = useMemo(
    () => calculateNextDrawRisk(player.bag, player.crucible.whiteSum),
    [player.bag, player.crucible.whiteSum],
  );
  const build = useMemo(() => analyzeBuildIdentity(player, recipeBooks), [player, recipeBooks]);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open, onClose]);

  if (!open) return null;

  const riskLabel = t.brewing.riskBands[risk.band];
  const exactRisk = Math.round(risk.probability * 100);

  return (
    <div style={styles.overlay} role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section style={styles.panel} role="dialog" aria-modal="true" aria-labelledby="brewers-ledger-title">
        <button autoFocus style={styles.close} onClick={onClose} aria-label={t.brewing.closeLedger}>×</button>
        <div style={styles.headingRow}>
          <img src={CORE_ECONOMY_ASSETS.brewBag} alt="" style={styles.bagImage} />
          <div>
            <div style={styles.eyebrow}>{t.brewing.ledgerEyebrow}</div>
            <h2 id="brewers-ledger-title" style={styles.title}>{t.brewing.ledgerTitle}</h2>
            <p style={styles.subtitle}>{t.brewing.ledgerSubtitle}</p>
          </div>
        </div>

        <div style={styles.riskCard}>
          <div>
            <span style={styles.sectionLabel}>{t.brewing.nextDrawRisk}</span>
            <strong style={{ ...styles.riskName, color: RISK_COLORS[risk.band] }}>{riskLabel}</strong>
          </div>
          <div style={styles.riskFacts}>
            <span><b>{risk.dangerousCount}</b> / {risk.totalCount} {t.brewing.dangerousDraws}</span>
            <span><b>{exactRisk}%</b> {t.brewing.shatterChance}</span>
            <span><b>{risk.minimumMovement}–{risk.maximumMovement}</b> {t.brewing.movementRange}</span>
          </div>
        </div>

        <div style={styles.buildCard}>
          <div style={styles.buildMain}>
            <span style={styles.sectionLabel}>{t.brewing.buildIdentity}</span>
            <div style={styles.buildRoles}>
              <strong style={styles.buildPrimary}>{t.brewing.buildRoles[build.primary]}</strong>
              {build.secondary && <span style={styles.buildSecondary}>/ {t.brewing.buildRoles[build.secondary]}</span>}
            </div>
            <p style={styles.buildGuidance}>{build.primaryScore > 0 ? t.brewing.buildGuidance[build.primary] : t.brewing.buildUnformed}</p>
          </div>
          <div style={styles.buildDetails}>
            <div><span style={styles.buildDetailLabel}>{t.brewing.buildEnvironment}</span><b style={styles.buildDetailValue}>{build.recipeEnvironment.map((role) => t.brewing.buildRoles[role]).join(" · ")}</b></div>
            <div><span style={styles.buildDetailLabel}>{t.brewing.buildSupport}</span><b style={styles.buildDetailValue}>{build.supportingColors.length > 0 ? build.supportingColors.map((color) => getLocalizedTokenName(color, t)).join(" · ") : "—"}</b></div>
          </div>
        </div>

        <div style={styles.columns}>
          <LedgerSection
            title={t.brewing.insideBag}
            detail={`${player.bag.tokens.length} ${t.player.tokens}`}
            groups={bagGroups}
            empty={t.brewing.emptyBag}
          />
          <LedgerSection
            title={t.brewing.alreadyDrawn}
            detail={`${drawnTokens.length} ${t.player.tokens}`}
            groups={drawnGroups}
            empty={t.brewing.noneDrawn}
          />
        </div>

        <p style={styles.privacy}>{t.brewing.orderHidden}</p>
      </section>
    </div>
  );
}

function LedgerSection({ title, detail, groups, empty }: { title: string; detail: string; groups: TokenGroup[]; empty: string }) {
  const t = useTranslation();
  return (
    <div style={styles.section}>
      <div style={styles.sectionHeader}>
        <h3 style={styles.sectionTitle}>{title}</h3>
        <span style={styles.sectionCount}>{detail}</span>
      </div>
      <div style={styles.tokenList}>
        {groups.length === 0 && <div style={styles.empty}>{empty}</div>}
        {groups.map((group) => {
          const visual = getTokenVisual(group.color);
          const image = CORE_INGREDIENT_ASSETS[group.color];
          return (
            <div key={`${group.color}-${group.value}`} style={styles.tokenRow}>
              {image
                ? <img src={image} alt="" style={styles.tokenImage} />
                : <span style={{ ...styles.tokenSymbol, color: `#${visual.border.toString(16).padStart(6, "0")}` }}>{visual.symbol}</span>}
              <span style={styles.tokenName}>{getLocalizedTokenName(group.color, t, group.value)}</span>
              <span style={styles.tokenValue}>{group.color === "echo" ? "?" : group.value}</span>
              <strong style={styles.tokenCount}>×{group.count}</strong>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: { position: "fixed", inset: 0, zIndex: 220, display: "grid", placeItems: "center", padding: 24, background: "rgba(0,5,8,.76)", backdropFilter: "blur(8px)" },
  panel: { position: "relative", width: "min(1120px,95vw)", maxHeight: "91vh", overflowY: "auto", padding: "38px clamp(28px,4vw,56px) 34px", color: "#e8dfce", background: "linear-gradient(145deg,rgba(2,16,20,.985),rgba(3,9,16,.99))", border: "1px solid var(--scene-panel-inset,#4ab8c0)", borderRadius: 12, boxShadow: "0 30px 90px #000,0 0 45px var(--scene-panel-glow,rgba(62,202,210,.16)),inset 0 1px rgba(255,255,255,.05)" },
  close: { position: "absolute", top: 17, right: 19, width: 44, height: 44, color: "#dfc98f", background: "rgba(3,12,18,.75)", border: "1px solid rgba(207,176,103,.4)", borderRadius: 5, fontSize: 28, cursor: "pointer" },
  headingRow: { display: "flex", alignItems: "center", gap: 22, paddingRight: 48 },
  bagImage: { width: 108, height: 108, objectFit: "contain", filter: "drop-shadow(0 0 16px rgba(82,211,210,.25))" },
  eyebrow: { color: "#6ed2d0", font: "700 13px/1.2 monospace", letterSpacing: ".24em", textTransform: "uppercase" },
  title: { margin: "6px 0 7px", color: "#e3bd65", font: "600 clamp(38px,4vw,54px)/1 Georgia,serif" },
  subtitle: { margin: 0, color: "#c8bdad", font: "italic 20px/1.45 Georgia,serif" },
  riskCard: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, margin: "28px 0 24px", padding: "20px 22px", background: "linear-gradient(90deg,rgba(7,31,35,.8),rgba(10,17,26,.72))", borderTop: "1px solid rgba(91,202,202,.32)", borderBottom: "1px solid rgba(91,202,202,.2)" },
  sectionLabel: { display: "block", color: "#a9a091", font: "700 12px/1.2 monospace", letterSpacing: ".18em", textTransform: "uppercase" },
  riskName: { display: "block", marginTop: 5, font: "600 31px/1.1 Georgia,serif" },
  riskFacts: { display: "flex", flexWrap: "wrap", justifyContent: "flex-end", gap: "11px 24px", color: "#d2c9ba", font: "15px/1.45 monospace" },
  buildCard: { display: "grid", gridTemplateColumns: "minmax(280px,1.15fr) minmax(300px,.85fr)", gap: 24, marginBottom: 24, padding: "20px 22px", background: "linear-gradient(115deg,rgba(38,27,10,.46),rgba(4,25,28,.7))", border: "1px solid rgba(201,166,83,.28)", borderRadius: 7 },
  buildMain: { minWidth: 0 },
  buildRoles: { display: "flex", alignItems: "baseline", flexWrap: "wrap", gap: 10, marginTop: 6 },
  buildPrimary: { color: "#e4bd62", font: "600 29px/1.1 Georgia,serif" },
  buildSecondary: { color: "#86d2ce", font: "600 19px/1.2 Georgia,serif" },
  buildGuidance: { margin: "9px 0 0", color: "#d1c7b6", font: "17px/1.45 Georgia,serif" },
  buildDetails: { display: "grid", alignContent: "center", gap: 13, paddingLeft: 22, borderLeft: "1px solid rgba(100,193,193,.2)" },
  buildDetailLabel: { display: "block", marginBottom: 4, color: "#8fa7a2", font: "700 11px/1.2 monospace", letterSpacing: ".12em", textTransform: "uppercase" },
  buildDetailValue: { display: "block", color: "#e1d5c0", font: "600 15px/1.4 Georgia,serif" },
  columns: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 18 },
  section: { minWidth: 0, padding: 21, background: "rgba(0,7,11,.58)", border: "1px solid rgba(86,155,164,.24)", borderRadius: 8 },
  sectionHeader: { display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, marginBottom: 12, paddingBottom: 9, borderBottom: "1px solid rgba(181,151,85,.18)" },
  sectionTitle: { margin: 0, color: "#d9bc79", font: "600 25px/1.2 Georgia,serif" },
  sectionCount: { color: "#78ceca", font: "13px/1.2 monospace", textTransform: "uppercase" },
  tokenList: { display: "grid", gap: 7 },
  tokenRow: { display: "grid", gridTemplateColumns: "44px minmax(0,1fr) 38px 48px", alignItems: "center", gap: 11, minHeight: 52, padding: "7px 11px", background: "rgba(10,18,24,.72)", border: "1px solid rgba(255,255,255,.045)", borderRadius: 5 },
  tokenImage: { width: 42, height: 42, objectFit: "contain", filter: "drop-shadow(0 0 6px rgba(130,180,200,.25))" },
  tokenSymbol: { display: "grid", placeItems: "center", width: 36, height: 36, fontSize: 23 },
  tokenName: { overflow: "hidden", textOverflow: "ellipsis", color: "#e5dbca", font: "600 18px/1.2 Georgia,serif", whiteSpace: "nowrap" },
  tokenValue: { color: "#8ee0dc", font: "700 17px/1 monospace", textAlign: "center" },
  tokenCount: { color: "#e8c36d", font: "700 18px/1 monospace", textAlign: "right" },
  empty: { padding: "25px 10px", color: "#9b9286", font: "italic 18px/1.5 Georgia,serif", textAlign: "center" },
  privacy: { margin: "21px 0 0", color: "#aaa094", font: "italic 16px/1.5 Georgia,serif", textAlign: "center" },
};
