import type { CSSProperties, Ref } from "react";
import type { AfflictionId } from "../game/distillation";
import { useTranslation } from "../i18n/useTranslation";
import { AFFLICTION_EMBLEMS, AFFLICTION_PORTRAITS, REMEDY_PATH_ART, VEILGLASS_ASSETS } from "../assets/veilglassAssets";

export function AfflictionSelection({ ids, onSelect, panelRef }: {
  ids: AfflictionId[];
  onSelect: (id: AfflictionId) => void;
  panelRef?: Ref<HTMLDivElement>;
}) {
  const t = useTranslation();
  return (
    <div style={styles.backdrop} role="presentation">
      <div ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="affliction-title" style={styles.panel}>
        <img src={VEILGLASS_ASSETS.distillationBanner} alt="" aria-hidden="true" style={styles.banner} />
        <h2 id="affliction-title" style={styles.title}>{t.afflictions.chooseTitle}</h2>
        <p style={styles.subtitle}>{t.afflictions.chooseSubtitle}</p>
        <div className="affliction-grid" style={styles.grid}>
          {ids.map((id, index) => (
            <button
              key={id}
              type="button"
              className="affliction-card"
              style={styles.card}
              onClick={() => onSelect(id)}
            >
              <img src={REMEDY_PATH_ART[id]} alt="" aria-hidden="true" style={styles.remedyFrame} />
              <span style={styles.portraitWrap}>
                <img src={AFFLICTION_PORTRAITS[id]} alt="" aria-hidden="true" style={styles.portrait} />
                <img src={AFFLICTION_EMBLEMS[id]} alt="" aria-hidden="true" style={styles.emblem} />
              </span>
              <span style={styles.number}>{String(index + 1).padStart(2, "0")}</span>
              <span style={styles.copy}>
                <strong style={styles.name}>{t.afflictions.contractNames[id]}</strong>
                <span style={styles.symptom}>{t.afflictions.contractSymptoms[id]}</span>
                <span style={styles.reward}>{t.afflictions.contractRewards[id]}</span>
                <span style={styles.choose}>{t.afflictions.choose}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
      <style>{`.affliction-card:hover,.affliction-card:focus-visible{border-color:#8fc8ff!important;transform:translateY(-4px);box-shadow:0 16px 40px rgba(54,145,190,.3)!important}@media(max-width:760px){.affliction-grid{grid-template-columns:1fr!important}.affliction-card{min-height:540px!important}}`}</style>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  backdrop: { position: "fixed", inset: 0, zIndex: 120, display: "grid", placeItems: "center", padding: 20, background: "radial-gradient(circle at 50% 35%,rgba(24,64,82,.8),rgba(3,1,10,.97))", backdropFilter: "blur(8px)" },
  panel: { width: "min(1500px,96vw)", maxHeight: "94vh", overflowY: "auto", padding: "30px clamp(20px,3vw,44px) 38px", border: "1px solid rgba(143,200,255,.45)", borderRadius: 14, background: "linear-gradient(145deg,rgba(10,26,42,.97),rgba(12,4,22,.98))", boxShadow: "0 26px 90px rgba(0,0,0,.65)" },
  banner: { display: "block", width: "min(940px,92%)", height: "auto", maxHeight: 188, objectFit: "contain", margin: "-12px auto -24px", pointerEvents: "none" },
  title: { margin: "10px 0", textAlign: "center", color: "#e5f2ff", fontFamily: "Georgia,serif", fontSize: "clamp(30px,3vw,42px)" },
  subtitle: { maxWidth: 920, margin: "0 auto 25px", textAlign: "center", color: "#cbdce9", fontSize: 19, lineHeight: 1.55 },
  grid: { display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 18 },
  card: { position: "relative", isolation: "isolate", overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "stretch", gap: 13, minHeight: 570, aspectRatio: "3 / 4", padding: "44px 38px 36px", textAlign: "left", border: "1px solid rgba(93,147,183,.42)", borderRadius: 10, background: "linear-gradient(180deg,rgba(9,20,31,.96),rgba(5,2,12,.98))", color: "#dcecff", cursor: "pointer", transition: "transform .2s,border-color .2s,box-shadow .2s" },
  remedyFrame: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "fill", zIndex: -1, pointerEvents: "none" },
  portraitWrap: { position: "relative", display: "block", width: "82%", aspectRatio: "1 / 1", margin: "0 auto", flexShrink: 0 },
  portrait: { width: "100%", height: "100%", objectFit: "contain", objectPosition: "center", borderRadius: "50%", WebkitMaskImage: "radial-gradient(circle,black 56%,transparent 74%)", maskImage: "radial-gradient(circle,black 56%,transparent 74%)" },
  emblem: { position: "absolute", right: -10, bottom: -5, width: 82, height: 82, objectFit: "contain", filter: "drop-shadow(0 0 12px rgba(123,199,236,.58))" },
  copy: { minHeight: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "8px 6px", borderRadius: 6, background: "rgba(2,7,14,.54)", textAlign: "center" },
  number: { position: "absolute", top: 11, right: 14, color: "#a9d8f5", fontFamily: "monospace", fontSize: 15, fontWeight: 700 },
  name: { color: "#e8f5ff", fontFamily: "Georgia,serif", fontSize: 27, lineHeight: 1.15, textShadow: "0 2px 4px #000" },
  symptom: { color: "#d8e3eb", fontFamily: "Georgia,serif", fontStyle: "italic", fontSize: 18, lineHeight: 1.42, textShadow: "0 1px 3px #000" },
  reward: { color: "#b8e2ff", fontFamily: "monospace", fontSize: 15, fontWeight: 700, lineHeight: 1.48, textShadow: "0 1px 3px #000" },
  choose: { marginTop: "auto", color: "#ffe18c", fontFamily: "monospace", fontSize: 15, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2 },
};
