import React, { useState } from "react";
import { useTranslation } from "../../i18n/useTranslation";
import { SettingsTab } from "./SettingsTab";
import { VideoSettings } from "./VideoSettings";
import { AudioSettings } from "./AudioSettings";
import { LanguageSettings } from "./LanguageSettings";
import { C } from "./settingsStyles";

type Tab = "video" | "audio" | "language";

interface SettingsScreenProps {
    onBack: () => void;
}

export function SettingsScreen({ onBack }: SettingsScreenProps) {
    const t = useTranslation();
    const [activeTab, setActiveTab] = useState<Tab>("video");

    return (
        <div style={styles.root}>
            {/* VIDEO — left plaque */}
            <div style={{ ...styles.tab, top: "8.9%", left: "7.5%", width: "20%", height: "7%" }}
                onClick={() => setActiveTab("video")}>
                <span style={activeTab === "video" ? styles.tabActive : styles.tabInactive}>
                    {t.settings.video}
                </span>
            </div>
            {/* AUDIO — center plaque */}
            <div style={{ ...styles.tab, top: "8.5%", left: "37.5%", width: "25%", height: "8%" }}
                onClick={() => setActiveTab("audio")}>
                <span style={activeTab === "audio" ? styles.tabActive : styles.tabInactive}>
                    {t.settings.audio}
                </span>
            </div>
            {/* LANGUAGE — right plaque */}
            <div style={{ ...styles.tab, top: "8.9%", left: "71.5%", width: "22%", height: "7%" }}
                onClick={() => setActiveTab("language")}>
                <span style={activeTab === "language" ? styles.tabActive : styles.tabInactive}>
                    {t.settings.language}
                </span>
            </div>

            {/* Tab content */}
            <div style={styles.content}>
                {activeTab === "video" && <VideoSettings />}
                {activeTab === "audio" && <AudioSettings />}
                {activeTab === "language" && <LanguageSettings />}
            </div>

            {/* Back button */}
            <button style={styles.backBtn} onClick={onBack}>
                {t.settings.backToMenu}
            </button>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    root: {
        position: "fixed",
        inset: 0,
        backgroundImage: "url('/images/settings_bg.jpg')",
        backgroundSize: "100% 100%",
        backgroundPosition: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        zIndex: 50,
    },
    tab: {
        position: "absolute" as const,
        top: "1%",
        height: "8%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        zIndex: 10,
    },
    tabActive: {
        fontFamily: "Georgia, serif",
        fontSize: "2vw",
        fontWeight: "bold" as const,
        letterSpacing: 3,
        textTransform: "uppercase" as const,
        color: C.gold,
        textShadow: "0 0 14px rgba(232, 184, 77, 0.5), 0 2px 6px rgba(0,0,0,0.6)",
    },
    tabInactive: {
        fontFamily: "Georgia, serif",
        fontSize: "2vw",
        fontWeight: "bold" as const,
        letterSpacing: 3,
        textTransform: "uppercase" as const,
        color: C.bronze,
        textShadow: "0 2px 6px rgba(0,0,0,0.4)",
    },
    content: {
        width: "min(560px, 88vw)",
        marginTop: "35vh",
        maxHeight: "58vh",
        overflowY: "auto" as const,
    },
    backBtn: {
        position: "absolute",
        bottom: 30,
        left: 40,
        background: "rgba(8, 4, 18, 0.6)",
        backdropFilter: "blur(6px)",
        border: `1px solid ${C.border}`,
        borderRadius: 8,
        padding: "10px 20px",
        color: C.amber,
        fontFamily: "Georgia, serif",
        fontSize: 14,
        letterSpacing: 1,
        cursor: "pointer",
    },
};
