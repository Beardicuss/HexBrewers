import type React from "react";

// ── Shared color palette ──────────────────────────────────────────────────────

export const C = {
    gold: "#e8b84d",
    parchment: "#e8d5b5",
    amber: "#c9a86c",
    bronze: "#8a7656",
    darkBg: "rgba(8, 4, 18, 0.7)",
    panelBg: "rgba(12, 6, 24, 0.8)",
    border: "#3a1a5a",
    activeBorder: "#e8b84d",
    inputBg: "rgba(20, 10, 40, 0.7)",
    hoverBg: "rgba(40, 20, 70, 0.5)",
} as const;

// ── Common styles ─────────────────────────────────────────────────────────────

export const ss: Record<string, React.CSSProperties> = {
    sectionTitle: {
        fontFamily: "Georgia, serif",
        fontSize: 55,
        color: C.gold,
        letterSpacing: 1.5,
        marginBottom: 14,
        textShadow: "0 0 8px rgba(232, 184, 77, 0.2)",
        textAlign: "center",
    },
    label: {
        fontFamily: "monospace",
        fontSize: 45,
        color: C.amber,
        letterSpacing: 0.5,
        marginBottom: 6,
    },
    select: {
        background: C.inputBg,
        border: `1px solid ${C.border}`,
        borderRadius: 6,
        padding: "12px 16px",
        color: C.parchment,
        fontFamily: "monospace",
        fontSize: 18,
        width: "100%",
        cursor: "pointer",
        outline: "none",
    },
    row: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    panel: {
        background: "transparent",
        backdropFilter: "none",
        border: "none",
        borderRadius: 10,
        padding: "24px 28px",
        display: "flex",
        flexDirection: "column",
        gap: 6,
    },
};
