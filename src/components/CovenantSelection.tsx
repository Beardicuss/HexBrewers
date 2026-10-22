import React, { useState, type CSSProperties, type Ref } from "react";
import type { CovenantKind, CovenantOffer, CovenantSelection } from "../game/covenants";
import { useTranslation } from "../i18n/useTranslation";
import { COVENANT_ART_ASSETS, COVENANT_SEAL_ASSETS } from "../assets/mirewroughtAssets";

const KINDS: CovenantKind[] = ["bone", "moon", "blood"];

export function CovenantSelectionScreen({ offer, onConfirm, panelRef }: {
  offer: CovenantOffer;
  onConfirm: (selection: CovenantSelection) => void;
  panelRef?: Ref<HTMLDivElement>;
}) {
  const t = useTranslation();
  const [selection, setSelection] = useState<CovenantSelection>({
    bone: offer.bone[0], moon: offer.moon[0], blood: offer.blood[0],
  });
  return (
    <div style={styles.backdrop}>
      <div ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="covenant-setup-title" style={styles.panel}>
        <div style={styles.rune}>◇ ☾ ◆</div>
        <h2 id="covenant-setup-title" style={styles.title}>{t.covenants.chooseTitle}</h2>
        <p style={styles.subtitle}>{t.covenants.chooseSubtitle}</p>
        <div className="covenant-columns" style={styles.columns}>
          {KINDS.map((kind) => (
            <section key={kind} style={styles.column} aria-label={t.covenants.kindNames[kind]}>
              <h3 style={styles.kind}>
                <img src={COVENANT_SEAL_ASSETS[kind]} alt="" aria-hidden="true" style={styles.kindSeal} />
                {t.covenants.kindNames[kind]}
              </h3>
              {offer[kind].map((id) => {
                const selected = selection[kind] === id;
                return (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setSelection((current) => ({ ...current, [kind]: id }))}
                    style={{ ...styles.card, ...(selected ? styles.selected : {}) }}
                  >
                    <img src={COVENANT_ART_ASSETS[id]} alt="" aria-hidden="true" style={styles.cardArt} />
                    <span style={styles.cardCopy}>
                      <strong style={styles.name}>{t.covenants.names[id]}</strong>
                      <span style={styles.effect}>{t.covenants.effects[id]}</span>
                    </span>
                  </button>
                );
              })}
            </section>
          ))}
        </div>
        <button autoFocus type="button" onClick={() => onConfirm(selection)} style={styles.confirm}>{t.covenants.confirm}</button>
      </div>
      <style>{`
        @media(max-width:1100px){.covenant-columns{gap:10px!important}}
        @media(max-width:760px){.covenant-columns{grid-template-columns:1fr!important}}
      `}</style>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  backdrop: { position: "fixed", inset: 0, zIndex: 121, display: "grid", placeItems: "center", padding: 16, background: "radial-gradient(circle at 50% 25%,rgba(28,75,66,.82),rgba(3,1,9,.97))", backdropFilter: "blur(8px)" },
  panel: { width: "min(1540px,96vw)", maxHeight: "94vh", overflowY: "auto", padding: "30px clamp(20px,3vw,44px) 36px", border: "1px solid rgba(118,215,196,.48)", borderRadius: 14, background: "linear-gradient(145deg,rgba(7,31,31,.98),rgba(13,5,23,.98))" },
  rune: { textAlign: "center", color: "#76d7c4", fontSize: 18, letterSpacing: 18 },
  title: { margin: "10px 0", textAlign: "center", color: "#e8f7ef", fontFamily: "Georgia,serif", fontSize: 32 },
  subtitle: { maxWidth: 920, margin: "0 auto 24px", textAlign: "center", color: "#bcd8d1", fontSize: 17, lineHeight: 1.55 },
  columns: { display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 18 },
  column: { display: "flex", flexDirection: "column", gap: 11, padding: 14, border: "1px solid rgba(118,215,196,.18)", borderRadius: 9 },
  kind: { margin: "0 0 5px", color: "#8ce8d7", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontFamily: "monospace", fontSize: 16, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.4 },
  kindSeal: { width: 38, height: 38, objectFit: "contain", filter: "drop-shadow(0 0 7px rgba(118,215,196,.35))" },
  card: { position: "relative", overflow: "hidden", minHeight: 176, padding: 10, display: "grid", gridTemplateColumns: "112px minmax(0,1fr)", alignItems: "stretch", gap: 15, textAlign: "left", border: "1px solid rgba(91,119,119,.45)", borderRadius: 8, background: "linear-gradient(135deg,rgba(10,19,22,.92),rgba(5,5,12,.98))", color: "#b8c7c4", cursor: "pointer" },
  cardArt: { width: 112, height: 150, alignSelf: "center", objectFit: "contain", objectPosition: "center", borderRadius: 6, background: "rgba(1,4,7,.72)", boxShadow: "0 0 14px rgba(0,0,0,.5)" },
  cardCopy: { minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: 11 },
  selected: { borderColor: "#e8b84d", background: "rgba(79,55,15,.34)", boxShadow: "0 0 18px rgba(232,184,77,.15)" },
  name: { color: "#f0dfc1", fontFamily: "Georgia,serif", fontSize: 21, lineHeight: 1.2 },
  effect: { color: "#c9ded9", fontFamily: "monospace", fontSize: 15, lineHeight: 1.55 },
  confirm: { display: "block", margin: "26px auto 0", padding: "14px 38px", border: "1px solid #e8b84d", borderRadius: 7, background: "rgba(80,54,13,.34)", color: "#f2d783", fontFamily: "Georgia,serif", fontSize: 18, cursor: "pointer" },
};
