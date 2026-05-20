import React from "react";
import { useTranslation } from "../i18n/useTranslation";

// ── Exploded choice panel ──────────────────────────────────────────────────────

export function ExplodedChoicePanel({
    onChoose,
}: {
    onChoose: (c: "vp" | "coins") => void;
}) {
    const t = useTranslation();
    return (
        <div style={choiceStyles.panel}>
            <div style={choiceStyles.label}>{t.exploded.title}</div>
            <div style={choiceStyles.buttons}>
                <button style={choiceStyles.btn} onClick={() => onChoose("vp")}>
                    {t.exploded.oneVP}
                </button>
                <button style={choiceStyles.btn} onClick={() => onChoose("coins")}>
                    {t.exploded.lastIngredient}
                </button>
            </div>
        </div>
    );
}

const choiceStyles: Record<string, React.CSSProperties> = {
    panel: {
        background: "rgba(30, 10, 50, 0.6)",
        border: "1px solid #5a1a8a",
        borderRadius: 8,
        padding: "14px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
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
