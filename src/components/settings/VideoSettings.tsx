import React from "react";
import { useSettingsStore } from "../../store/settingsStore";
import { useTranslation } from "../../i18n/useTranslation";
import { ss, C } from "./settingsStyles";

const RESOLUTIONS = [
    "1280x720",
    "1366x768",
    "1920x1080",
    "2560x1440",
];

const QUALITIES = ["low", "medium", "high"] as const;

export function VideoSettings() {
    const t = useTranslation();
    const { resolution, quality, setResolution, setQuality } = useSettingsStore();

    const qualityLabels = {
        low: t.settings.qualityLow,
        medium: t.settings.qualityMedium,
        high: t.settings.qualityHigh,
    };

    return (
        <div style={ss.panel}>
            <div style={ss.sectionTitle}>{t.settings.resolution}</div>
            <select
                style={ss.select}
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
            >
                {RESOLUTIONS.map((r) => (
                    <option key={r} value={r}>
                        {r.replace("x", " × ")}
                    </option>
                ))}
            </select>

            <div style={{ height: 20 }} />

            <div style={ss.sectionTitle}>{t.settings.quality}</div>
            <div style={styles.qualityRow}>
                {QUALITIES.map((q) => (
                    <button
                        key={q}
                        style={{
                            ...styles.qualityBtn,
                            ...(quality === q ? styles.qualityActive : styles.qualityInactive),
                        }}
                        onClick={() => setQuality(q)}
                    >
                        {qualityLabels[q]}
                    </button>
                ))}
            </div>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    qualityRow: {
        display: "flex",
        gap: 10,
    },
    qualityBtn: {
        flex: 1,
        padding: "14px 0",
        fontFamily: "Georgia, serif",
        fontSize: 35,
        letterSpacing: 1,
        borderRadius: 6,
        cursor: "pointer",
        border: "1px solid",
        transition: "all 0.15s",
    },
    qualityActive: {
        background: "rgba(232, 184, 77, 0.15)",
        borderColor: C.gold,
        color: C.gold,
        boxShadow: "0 0 12px rgba(232, 184, 77, 0.15)",
    },
    qualityInactive: {
        background: "rgba(20, 10, 40, 0.5)",
        borderColor: C.border,
        color: C.amber,
    },
};
