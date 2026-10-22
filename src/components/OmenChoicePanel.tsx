import React from "react";
import type { OmenChoice } from "../game/gameState";
import { useTranslation } from "../i18n/useTranslation";

export function OmenChoicePanel({
  choices,
  onChoose,
}: {
  choices: OmenChoice[];
  onChoose: (choiceId: string) => void;
}) {
  const t = useTranslation();
  const ingredientNames: Record<string, string> = {
    orange: t.grimoire.brimstone,
    green: t.grimoire.deathweave,
    blue: t.grimoire.frostbile,
    red: t.grimoire.bloodthorn,
    yellow: t.grimoire.plaguedust,
    purple: t.grimoire.wraithbloom,
    black: t.grimoire.shadowmoss,
    white: t.grimoire.voidshard,
  };
  const fill = (template: string, values: Record<string, string | number>) =>
    Object.entries(values).reduce(
      (label, [key, value]) => label.replace(`{${key}}`, String(value)),
      template,
    );
  const labelFor = (choice: OmenChoice): string => {
    if (choice.kind === "gain_vp") return fill(t.choices.omenGainPrestige, { amount: choice.amount });
    if (choice.kind === "gain_rubies") return fill(t.choices.omenGainRubies, { amount: choice.amount });
    if (choice.kind === "advance_droplet") return fill(t.choices.omenAdvanceDroplet, { amount: choice.amount });
    if (choice.kind === "remove_white_one") return t.choices.omenRemoveWhite;
    if (choice.kind === "skip") return choice.id === "omen-keep-rat-tails"
      ? t.choices.omenKeepRatTails
      : t.choices.omenSkip;
    if (choice.kind === "trade_rat_tails_for_rubies") return fill(t.choices.omenTradeRatTails, { amount: choice.amount });
    if (choice.kind === "upgrade_sampled_chip") return fill(t.choices.omenUpgradeSample, {
      name: ingredientNames[choice.color] ?? choice.color,
      from: choice.fromValue,
      to: choice.value,
    });
    if (choice.kind === "trade_ruby_for_market_chip") return fill(t.choices.omenTradeIngredient, {
      name: ingredientNames[choice.color] ?? choice.color,
      value: choice.value,
    });
    return fill(t.choices.omenGainIngredient, {
      name: ingredientNames[choice.color] ?? choice.color,
      value: choice.value,
    });
  };

  return (
    <div style={styles.panel} role="group" aria-label={t.choices.omenPrompt}>
      <div style={styles.label}>{t.choices.omenPrompt}</div>
      <div style={styles.buttons}>
        {choices.map((choice) => (
          <button key={choice.id} style={styles.button} onClick={() => onChoose(choice.id)}>
            {labelFor(choice)}
          </button>
        ))}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  panel: {
    background: "rgba(30, 10, 50, 0.72)",
    border: "1px solid #8a5aaf",
    borderRadius: 8,
    padding: "14px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 9,
  },
  label: {
    fontFamily: "serif",
    fontSize: 13,
    color: "#e8b84d",
    textAlign: "center",
    fontStyle: "italic",
  },
  buttons: { display: "flex", flexDirection: "column", gap: 7 },
  button: {
    background: "rgba(80, 35, 105, 0.35)",
    border: "1px solid #8a5aaf",
    borderRadius: 6,
    padding: "10px",
    color: "#f1e5cf",
    fontFamily: "serif",
    fontSize: 13,
    letterSpacing: 0.5,
    cursor: "pointer",
  },
};
