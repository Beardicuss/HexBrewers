import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { GamePhase } from "../game/gameState";
import type { Player } from "../game/playerTypes";
import type { CovenantKind, CovenantSelection } from "../game/covenants";
import { canUseCovenant, DEFAULT_COVENANTS } from "../game/covenants";
import { useTranslation } from "../i18n/useTranslation";
import { COVENANT_ACTIVATION_ASSETS, COVENANT_SEAL_ASSETS, COVENANT_SPENT_SEAL_ASSETS } from "../assets/mirewroughtAssets";

export function CovenantPanel({ player, phase, onUse, selection }: {
  player: Player;
  phase: GamePhase;
  onUse: (kind: CovenantKind, source: DOMRect) => void;
  selection?: CovenantSelection;
}) {
  const t = useTranslation();
  const previousSeals = useRef(player.covenantSeals);
  const [activating, setActivating] = useState<CovenantKind | null>(null);

  useEffect(() => {
    const previous = previousSeals.current;
    const current = player.covenantSeals;
    previousSeals.current = current;
    if (!previous || !current) return;
    const used = (["bone", "moon", "blood"] as CovenantKind[])
      .find((kind) => previous[kind] && !current[kind]);
    if (!used) return;
    setActivating(used);
    const timeout = window.setTimeout(() => setActivating(null), 850);
    return () => window.clearTimeout(timeout);
  }, [player.covenantSeals]);

  if (!player.covenantSeals) return null;

  const active = selection ?? DEFAULT_COVENANTS;
  const items: Array<{ kind: CovenantKind; name: string; effect: string }> = (["bone", "moon", "blood"] as CovenantKind[]).map((kind) => ({
    kind,
    name: t.covenants.names[active[kind]],
    effect: t.covenants.effects[active[kind]],
  }));

  return (
    <section style={styles.panel} aria-label={t.covenants.title}>
      <div style={styles.heading}>{t.covenants.title}</div>
      <div style={styles.seals}>
        {items.map(({ kind, name, effect }) => {
          const available = player.covenantSeals?.[kind] ?? false;
          const legal = canUseCovenant(player, kind, phase, active);
          return (
            <button
              key={kind}
              type="button"
              disabled={!legal}
              title={effect}
              aria-label={`${name}: ${effect}`}
              data-covenant-kind={kind}
              onClick={(event) => onUse(kind, event.currentTarget.getBoundingClientRect())}
              style={{ ...styles.seal, ...(legal ? styles.legal : {}), ...(!available ? styles.spent : {}) }}
            >
              <img src={available ? COVENANT_SEAL_ASSETS[kind] : COVENANT_SPENT_SEAL_ASSETS[kind]} alt="" aria-hidden="true" style={styles.symbol} />
              {activating === kind && (
                <img src={COVENANT_ACTIVATION_ASSETS[kind]} alt="" aria-hidden="true" style={styles.activation} />
              )}
              <span>{available ? name : t.covenants.spent}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

const styles: Record<string, CSSProperties> = {
  panel: { padding: 10, border: "1px solid var(--scene-panel-border, rgba(118,215,196,.35))", borderRadius: 8, background: "linear-gradient(155deg, var(--scene-panel-top, rgba(4,18,22,.72)), var(--scene-panel-bottom, rgba(2,9,15,.82)))", boxShadow: "0 8px 24px rgba(0,0,0,.28), 0 0 16px var(--scene-panel-glow, transparent)" },
  heading: { marginBottom: 7, color: "var(--scene-cool-accent, #76d7c4)", fontFamily: "monospace", fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase" },
  seals: { display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 5 },
  seal: { position: "relative", overflow: "hidden", display: "grid", justifyItems: "center", gap: 2, padding: "6px 3px", border: "1px solid var(--scene-panel-border-muted, #49345d)", borderRadius: 6, background: "var(--scene-surface, rgba(6,2,14,.65))", color: "#77868a", fontFamily: "monospace", fontSize: 8 },
  legal: { border: "1px solid #e8b84d", color: "#e8b84d", cursor: "pointer", boxShadow: "0 0 12px rgba(232,184,77,.18)" },
  spent: { color: "#77868a" },
  symbol: { width: 27, height: 27, objectFit: "contain", filter: "drop-shadow(0 0 6px var(--scene-panel-glow, rgba(118,215,196,.35)))" },
  activation: { position: "absolute", inset: -8, width: "calc(100% + 16px)", height: "calc(100% + 16px)", objectFit: "cover", pointerEvents: "none", mixBlendMode: "screen", animation: "covenantBurst .85s ease-out forwards" },
};
