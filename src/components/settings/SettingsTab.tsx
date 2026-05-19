import React from "react";
import { C } from "./settingsStyles";

interface SettingsTabProps {
    label: string;
    active: boolean;
    onClick: () => void;
}

export function SettingsTab({ label, active, onClick }: SettingsTabProps) {
    return (
        <button
            style={{
                ...styles.tab,
                ...(active ? styles.active : styles.inactive),
            }}
            onClick={onClick}
        >
            {label}
        </button>
    );
}

const styles: Record<string, React.CSSProperties> = {
    tab: {
        background: "transparent",
        border: "none",
        fontFamily: "Georgia, serif",
        fontSize: "4vw",
        fontWeight: "bold",
        letterSpacing: 4,
        padding: "0",
        width: "25vw",
        height: "8vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "all 0.2s",
        textTransform: "uppercase",
    },
    active: {
        color: C.gold,
        textShadow: "0 0 14px rgba(232, 184, 77, 0.5), 0 2px 6px rgba(0,0,0,0.6)",
    },
    inactive: {
        color: C.bronze,
        textShadow: "0 2px 6px rgba(0,0,0,0.4)",
    },
};
