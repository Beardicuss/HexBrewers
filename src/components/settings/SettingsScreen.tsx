import React, { useState } from "react";
import { useTranslation } from "../../i18n/useTranslation";
import { SettingsTab } from "./SettingsTab";
import { VideoSettings } from "./VideoSettings";
import { AudioSettings } from "./AudioSettings";
import { LanguageSettings } from "./LanguageSettings";
import { C } from "./settingsStyles";
import { MenuRoomBackground } from "../MenuRoomBackground";

type Tab = "video" | "audio" | "language";

const TAB_APPARATUS: Record<Tab, string> = {
    video: "/images/core/ui/settings-apparatus/video-apparatus.png",
    audio: "/images/core/ui/settings-apparatus/audio-apparatus.png",
    language: "/images/core/ui/settings-apparatus/language-apparatus.png",
};

interface SettingsScreenProps {
    onBack: () => void;
    backLabel?: string;
}

export function SettingsScreen({ onBack, backLabel }: SettingsScreenProps) {
    const t = useTranslation();
    const [activeTab, setActiveTab] = useState<Tab>("video");

    return (
        <div className="settings-root" style={styles.root} role="dialog" aria-modal="true" aria-label={t.menu.settings}>
            <style>{settingsResponsiveCss}</style>
            <MenuRoomBackground room="settings" />
            <div className="settings-console" style={styles.console}>
                <section className="settings-content" id="settings-panel" role="tabpanel" style={styles.content}>
                    <p style={styles.eyebrow}>ASTROLABE CONFIGURATION</p>
                    <h1 style={styles.title}>{activeTab === "video" ? t.settings.video : activeTab === "audio" ? t.settings.audio : t.settings.language}</h1>
                    <div style={styles.rule} />
                    {activeTab === "video" && <VideoSettings />}
                    {activeTab === "audio" && <AudioSettings />}
                    {activeTab === "language" && <LanguageSettings />}
                </section>

                <nav className="settings-tabs" role="tablist" aria-label={t.menu.settings} style={styles.tabs}>
                    {(["video", "audio", "language"] as Tab[]).map((tab) => (
                        <button
                            key={tab}
                            type="button"
                            role="tab"
                            aria-selected={activeTab === tab}
                            aria-controls="settings-panel"
                            className="settings-tab"
                            style={{ ...styles.tab, ...(activeTab === tab ? styles.tabSelected : {}) }}
                            onClick={() => setActiveTab(tab)}
                        >
                            <img className="settings-apparatus" src={TAB_APPARATUS[tab]} alt="" aria-hidden="true" />
                            <span style={activeTab === tab ? styles.tabActive : styles.tabInactive}>{t.settings[tab]}</span>
                        </button>
                    ))}
                </nav>
            </div>

            {/* Back button */}
            <button className="settings-back ashen-route-button" style={styles.backBtn} onClick={onBack}>
                {backLabel ?? t.settings.backToMenu}
            </button>
        </div>
    );
}

const settingsResponsiveCss = `
  .settings-content { text-shadow: 0 2px 10px rgba(0,0,0,.9); }
  .settings-tabs { position: relative; }
  .settings-tab { position: relative; }
  .settings-tab::before {
    content: ""; position: absolute; inset: 13% 10%; border-radius: 50%; opacity: 0;
    background: radial-gradient(circle,rgba(123,67,156,.2),transparent 68%);
    transition: opacity .18s,transform .18s; transform: scale(.82);
  }
  .settings-tab[aria-selected="true"]::before {
    opacity: 1; transform: scale(1);
  }
  .settings-tab:hover { color: #e8c879 !important; }
  .settings-apparatus {
    position: relative; z-index: 1; width: clamp(92px,7.4vw,142px); height: clamp(92px,7.4vw,142px);
    object-fit: contain; filter: saturate(.68) brightness(.62); opacity: .7;
    transition: filter .2s,opacity .2s,transform .2s;
  }
  .settings-tab:hover .settings-apparatus,
  .settings-tab:focus-visible .settings-apparatus {
    opacity: .94; filter: saturate(.95) brightness(.9) drop-shadow(0 0 8px rgba(163,102,208,.28)); transform: translateY(-2px);
  }
  .settings-tab[aria-selected="true"] .settings-apparatus {
    opacity: 1; filter: saturate(1.08) brightness(1.04) drop-shadow(0 0 9px rgba(232,184,77,.42)); transform: scale(1.035);
  }
  .settings-tab:focus-visible { outline: 2px solid #e8b84d; outline-offset: 3px; }
  @media (max-width: 980px), (max-height: 700px) {
    .settings-root { overflow-y: auto; }
    .settings-console { width: min(94vw, 720px) !important; grid-template-columns: 1fr !important; margin: 28px auto 100px !important; }
    .settings-tabs { grid-row: 1; display: grid !important; grid-template-columns: repeat(3,minmax(0,1fr)); padding: 0 0 12px !important; }
    .settings-tabs::before, .settings-tab::before { display: none; }
    .settings-apparatus { width: clamp(70px,15vw,105px); height: clamp(70px,15vw,105px); }
    .settings-tab { min-height: 52px !important; padding: 10px !important; justify-content: center !important; }
    .settings-tab span:last-child { font-size: clamp(12px,2.5vw,16px) !important; }
    .settings-content { grid-row: 2; min-height: 0 !important; }
    .settings-back { position: fixed !important; left: 16px !important; bottom: 16px !important; z-index: 4; }
  }
`;

const styles: Record<string, React.CSSProperties> = {
    root: {
        position: "fixed",
        inset: 0,
        background: "#03070a",
        display: "block",
        zIndex: 50,
    },
    console: {
        position: "relative", zIndex: 2, width: "min(56vw, 1040px)", margin: "clamp(66px,8vh,105px) 3.5vw 90px auto",
        display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(180px,240px)", gap: 32, alignItems: "start",
    },
    tabs: { display: "flex", flexDirection: "column", gap: 0 },
    tab: {
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 0,
        padding: "0 0 5px",
        cursor: "pointer",
        zIndex: 10,
        border: 0, borderRadius: 0,
        background: "transparent",
        transition: "color .18s, transform .18s",
    },
    tabSelected: { background: "transparent", boxShadow: "none" },
    tabActive: {
        fontFamily: "Georgia, serif",
        fontSize: 13,
        fontWeight: "bold" as const,
        letterSpacing: 2.4,
        textTransform: "uppercase" as const,
        color: C.gold,
        textShadow: "0 0 14px rgba(232, 184, 77, 0.5), 0 2px 6px rgba(0,0,0,0.6)",
    },
    tabInactive: {
        fontFamily: "Georgia, serif",
        fontSize: 13,
        fontWeight: "bold" as const,
        letterSpacing: 2.4,
        textTransform: "uppercase" as const,
        color: C.bronze,
        textShadow: "0 2px 6px rgba(0,0,0,0.4)",
    },
    content: {
        minWidth: 0, minHeight: 470, padding: "clamp(14px,2vw,28px) 0",
        border: 0, borderRadius: 0,
        background: "transparent",
        boxShadow: "none",
        backdropFilter: "none", overflow: "visible",
    },
    eyebrow: { margin: 0, color: "#75c9c0", fontFamily: "monospace", fontSize: 10, letterSpacing: 2.4 },
    title: { margin: "8px 0 12px", color: "#e7c178", fontFamily: "Georgia,serif", fontWeight: 400, fontSize: "clamp(30px,3vw,44px)" },
    rule: { height: 1, marginBottom: 18, background: "linear-gradient(90deg,rgba(232,184,77,.65),transparent)" },
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
