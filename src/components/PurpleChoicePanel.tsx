import React from "react";
import type { PurpleChoice } from "../game/gameState";
import { useTranslation } from "../i18n/useTranslation";

export function PurpleChoicePanel({
  choices,
  onChoose,
}: {
  choices: PurpleChoice[];
  onChoose: (choiceId: string) => void;
}) {
  const t = useTranslation();
  const labelFor = (choice: PurpleChoice): string => {
    if (choice.kind === "skip") return t.choices.purpleSkip;
    if (choice.kind === "set1") return t.choices.purpleSet1[choice.level - 1];
    if (choice.kind === "set2") return t.choices.purpleSet2[choice.tradeCount - 1];
    const names = { orange: t.grimoire.brimstone, green: t.grimoire.deathweave, blue: t.grimoire.frostbile, red: t.grimoire.bloodthorn, yellow: t.grimoire.plaguedust } as Record<string, string>;
    return t.choices.purpleUpgrade
      .replace("{name}", names[choice.color] ?? choice.color)
      .replace("{from}", String(choice.fromValue))
      .replace("{to}", String(choice.toValue));
  };
  return (
    <div style={styles.panel}>
      <div style={styles.label}>{t.choices.purplePrompt}</div>
      <div style={styles.buttons}>
        {choices.map((choice) => (
          <button key={choice.id} style={styles.btn} onClick={() => onChoose(choice.id)}>
            {labelFor(choice)}
          </button>
        ))}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  panel: {
    background: "rgba(30, 10, 50, 0.6)",
    border: "1px solid #5a1a8a",
    borderRadius: 8,
    padding: "14px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 9,
  },
  label: {
    fontFamily: "serif",
    fontSize: 12,
    color: "#e8b84d",
    textAlign: "center",
    fontStyle: "italic",
  },
  buttons: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  btn: {
    background: "transparent",
    border: "1px solid #5a1a8a",
    borderRadius: 6,
    padding: "9px",
    color: "#e8d5b5",
    fontFamily: "serif",
    fontSize: 13,
    letterSpacing: 1,
    cursor: "pointer",
  },
};
