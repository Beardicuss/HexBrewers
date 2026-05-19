import React from "react";
import type { OmenCard } from "../game/omenTypes";
import type { Translations } from "../i18n/types";
import { useTranslation } from "../i18n/useTranslation";

interface OmenCardProps {
  card: OmenCard | null;
  visible: boolean;
  onDismiss: () => void;
}

export function OmenCardDisplay({ card, visible, onDismiss }: OmenCardProps) {
  const t = useTranslation();
  if (!card || !visible) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <div style={styles.topRune}>✦</div>

        <div style={styles.title}>{t.omenCards[card.id]?.title ?? card.title}</div>
        <div style={styles.divider} />
        <div style={styles.description}>{t.omenCards[card.id]?.description ?? card.description}</div>
        <div style={styles.effectBadge}>{getEffectLabel(card, t)}</div>

        <button style={styles.button} onClick={onDismiss}>
          {t.omen.beginBrewing}
        </button>

        <div style={styles.bottomRune}>✦</div>
      </div>
    </div>
  );
}

function getEffectLabel(card: OmenCard, t: Translations): string {
  switch (card.effect.type) {
    case "double_soulstones": return t.omen.doubleSoulstones;
    case "extra_draw": return t.omen.extraWhite;
    case "poison": return t.omen.poison.replace("{penalty}", card.effect.penalty.toString());
    case "bonus_score": return t.omen.bonusScore.replace("{points}", card.effect.points.toString());
    case "no_effect": return t.omen.noEffect;
  }
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(4, 2, 10, 0.95)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    backdropFilter: "blur(4px)",
  },
  card: {
    backgroundImage: "url('/images/omen_card_front_blank.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    border: "1px solid #4a1a7a",
    borderRadius: 12,
    padding: "36px 44px",
    width: "min(380px, 90vw)",
    aspectRatio: "2.5 / 3.5",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    boxShadow: "0 0 60px rgba(120, 40, 200, 0.25), inset 0 0 40px rgba(80, 0, 140, 0.1)",
    position: "relative",
  },
  topRune: {
    color: "#7733bb",
    fontSize: 22,
    opacity: 0.6,
  },
  title: {
    fontFamily: "serif",
    fontSize: 24,
    color: "#eecccc",
    textAlign: "center",
    letterSpacing: 1.5,
    textShadow: "2px 2px 4px rgba(0,0,0,0.9), 0 0 15px rgba(0,0,0,0.8)",
  },
  divider: {
    width: "60%",
    height: 1,
    background: "linear-gradient(90deg, transparent, #6622aa, transparent)",
  },
  description: {
    fontFamily: "serif",
    fontSize: 16,
    color: "#ddccdd",
    textAlign: "center",
    lineHeight: 1.7,
    fontStyle: "italic",
    textShadow: "1px 1px 3px rgba(0,0,0,0.9)",
    margin: "auto 0",
  },
  effectBadge: {
    background: "rgba(80, 20, 120, 0.4)",
    border: "1px solid #5a1a8a",
    borderRadius: 6,
    padding: "8px 16px",
    fontFamily: "monospace",
    fontSize: 14,
    color: "#ffddff",
    letterSpacing: 1,
    textShadow: "1px 1px 2px rgba(0,0,0,0.9)",
    boxShadow: "0 4px 10px rgba(0,0,0,0.4)",
  },
  button: {
    marginTop: 8,
    background: "transparent",
    border: "1px solid #7733bb",
    borderRadius: 6,
    padding: "10px 28px",
    color: "#cc88ff",
    fontFamily: "serif",
    fontSize: 16,
    letterSpacing: 2,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  bottomRune: {
    color: "#7733bb",
    fontSize: 22,
    opacity: 0.6,
  },
};
