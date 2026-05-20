import React from "react";
import { useTranslation } from "../i18n/useTranslation";

// ── AI status panel ───────────────────────────────────────────────────────────

export function AIStatusPanel({ phase }: { phase: string }) {
    const t = useTranslation();
    const messages: Record<string, string> = {
        omen: "...",
        brewing: t.game.shadeBrewing,
        scoring: "...",
        market: "...",
        setup: "",
        game_over: "",
    };

    const msg = messages[phase] ?? "";
    if (!msg) return null;

    return (
        <div style={aiStyles.panel}>
            <span style={aiStyles.dot}>◈</span>
            <span style={aiStyles.text}>{msg}</span>
        </div>
    );
}

const aiStyles: Record<string, React.CSSProperties> = {
    panel: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 14px",
        background: "rgba(10, 4, 20, 0.5)",
        border: "1px solid #1a0a2e",
        borderRadius: 7,
    },
    dot: {
        color: "#553377",
        fontSize: 12,
    },
    text: {
        fontFamily: "monospace",
        fontSize: 11,
        color: "#8a7656",
        fontStyle: "italic",
    },
};
