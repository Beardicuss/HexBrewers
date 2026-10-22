import React from "react";
import type { OmenCard } from "../game/omenTypes";
import type { Translations } from "../i18n/types";
import { useTranslation } from "../i18n/useTranslation";
import { VEILGLASS_OMEN_ART } from "../assets/veilglassAssets";
import { BASE_OMEN_ART } from "../assets/baseAssets";
import { CORE_OMEN_ASSETS } from "../assets/coreAssets";

interface OmenCardProps {
  card: OmenCard | null;
  visible: boolean;
  onDismiss: () => void;
}

export function OmenCardDisplay({ card, visible, onDismiss }: OmenCardProps) {
  const t = useTranslation();
  if (!card || !visible) return null;
  const localized = t.omenCards[card.id];
  const artwork = BASE_OMEN_ART[card.id] ?? VEILGLASS_OMEN_ART[card.id];

  return (
    <div style={styles.overlay}>
      <div style={styles.reveal}>
        <div style={styles.card}>
          <div style={{ ...styles.art, ...(artwork ? { backgroundImage: `url('${artwork}')` } : {}) }} />
          <img src={CORE_OMEN_ASSETS.blankFront} alt="" aria-hidden="true" style={styles.frame} />
        </div>
        <div style={styles.copy}>
          <div style={styles.topRune}>✦　OMEN REVEALED　✦</div>
          <div style={styles.title}>{localized?.title ?? card.title}</div>
          <div style={styles.divider} />
          <div style={styles.description}>{localized?.description ?? localized?.summary ?? card.description}</div>
          <div style={styles.effectLabel}>EFFECT</div>
          <div style={styles.effectBadge}>{localized?.summary ?? getEffectLabel(card, t)}</div>
          <button className="omen-reveal-action" style={styles.button} onClick={onDismiss}>
            ✦ {t.omen.beginBrewing} ✦
          </button>
        </div>
      </div>
      <style>{`.omen-reveal-action:hover,.omen-reveal-action:focus-visible{color:#ffe39b!important;border-bottom-color:#e5b753!important;text-shadow:0 0 16px rgba(224,174,75,.55);transform:translateY(-2px);outline:none}`}</style>
    </div>
  );
}

function getEffectLabel(card: OmenCard, t: Translations): string {
  if (card.summary) return card.summary;

  switch (card.effect.type) {
    case "no_effect": return t.omen.noEffect;
    default: return t.omen.noEffect;
  }
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "radial-gradient(ellipse at center,rgba(12,28,30,.82),rgba(3,1,8,.95) 72%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    backdropFilter: "blur(6px)",
    padding: 24,
  },
  reveal: {
    width: "min(1420px,94vw)",
    maxHeight: "94vh",
    overflowY: "auto",
    display: "grid",
    gridTemplateColumns: "minmax(390px,520px) minmax(0,1fr)",
    alignItems: "center",
    gap: "clamp(50px,7vw,110px)",
    padding: "20px 34px",
  },
  card: {
    position: "relative",
    width: "min(100%,520px)",
    aspectRatio: "850 / 1260",
    filter: "drop-shadow(0 24px 36px rgba(0,0,0,.8))",
  },
  art: {
    position: "absolute",
    zIndex: 2,
    inset: "6.4% 7.4% 8.4%",
    backgroundSize: "cover",
    backgroundPosition: "center top",
    borderRadius: "42% 42% 8% 8% / 18% 18% 6% 6%",
    boxShadow: "inset 0 0 30px rgba(0,0,0,.55)",
  },
  frame: { position: "absolute", zIndex: 1, inset: 0, width: "100%", height: "100%", objectFit: "contain", pointerEvents: "none" },
  copy: {
    padding: "44px 28px 46px 46px",
    borderLeft: "1px solid rgba(196,151,74,.52)",
    background: "linear-gradient(100deg,rgba(3,8,12,.68),rgba(3,8,12,.2),transparent)",
    textShadow: "0 2px 8px #000",
  },
  topRune: {
    color: "#79c9bd",
    fontFamily: "monospace",
    fontSize: 14,
    letterSpacing: 3,
    marginBottom: 18,
  },
  title: {
    fontFamily: "Georgia,serif",
    fontSize: "clamp(38px,4vw,62px)",
    color: "#e8c675",
    textAlign: "left",
    letterSpacing: 1.5,
    textShadow: "2px 2px 6px #000,0 0 20px rgba(213,164,73,.18)",
  },
  divider: {
    width: "82%",
    height: 1,
    background: "linear-gradient(90deg,#b48843,transparent)",
    margin: "22px 0 28px",
  },
  description: {
    fontFamily: "Georgia,serif",
    fontSize: "clamp(20px,1.65vw,27px)",
    color: "#e6dac6",
    textAlign: "left",
    lineHeight: 1.7,
    fontStyle: "italic",
    marginBottom: 30,
  },
  effectLabel: { color: "#c59a53", fontFamily: "monospace", fontSize: 14, letterSpacing: 4, marginBottom: 10 },
  effectBadge: {
    padding: "4px 0 8px",
    fontFamily: "Georgia,serif",
    fontSize: "clamp(23px,1.8vw,30px)",
    color: "#f0d7a2",
    lineHeight: 1.55,
  },
  button: {
    marginTop: 36,
    background: "transparent",
    border: 0,
    borderBottom: "1px solid #b98b3f",
    padding: "14px 34px",
    color: "#e5c36f",
    fontFamily: "Georgia,serif",
    fontSize: 20,
    letterSpacing: 2,
    cursor: "pointer",
    transition: "all .18s",
  },
};
