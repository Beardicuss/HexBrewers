import React from "react";
import { useSettingsStore } from "../../store/settingsStore";
import { useTranslation } from "../../i18n/useTranslation";
import type { Language } from "../../i18n/types";
import { ss, C } from "./settingsStyles";

const LANGUAGES: { code: Language; img: string; key: "languageEnglish" | "languageRussian" | "languageGeorgian" }[] = [
    { code: "en", img: "/images/flags/flag_en.jpg", key: "languageEnglish" },
    { code: "ru", img: "/images/flags/flag_ru.jpg", key: "languageRussian" },
    { code: "ka", img: "/images/flags/flag_ka.jpg", key: "languageGeorgian" },
];

export function LanguageSettings() {
    const t = useTranslation();
    const { language, setLanguage } = useSettingsStore();

    return (
        <div className="language-instrument" style={ss.panel}>
            <style>{languageCss}</style>
            <div style={ss.sectionTitle}>{t.settings.language}</div>
            <div style={styles.grid}>
                {LANGUAGES.map((lang) => (
                    <button
                        key={lang.code}
                        className={language === lang.code ? "language-seal is-active" : "language-seal"}
                        style={{
                            ...styles.card,
                        }}
                        onClick={() => setLanguage(lang.code)}
                    >
                        <img src={lang.img} alt={t.settings[lang.key]} style={styles.flag} />
                        <span style={styles.name}>{t.settings[lang.key]}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    grid: {
        display: "flex",
        justifyContent: "space-around",
        gap: 18,
        paddingTop: 16,
    },
    card: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        padding: "18px 8px",
        borderRadius: "50%",
        cursor: "pointer",
        border: 0,
        transition: "all 0.2s",
        background: "transparent",
    },
    flag: {
        width: 82,
        height: 54,
        margin: "11px 0",
        borderRadius: 3,
        objectFit: "cover",
    },
    name: {
        fontFamily: "Georgia, serif",
        fontSize: 14,
        color: C.parchment,
        letterSpacing: 1,
    },
};

const languageCss = `
  .language-seal { position:relative;min-width:140px;color:#c9a86c; }
  .language-seal::before { content:"";position:absolute;left:50%;top:6px;width:98px;height:98px;transform:translateX(-50%) rotate(45deg);border:1px solid rgba(138,118,86,.5);box-shadow:inset 0 0 18px rgba(0,0,0,.8);transition:.2s; }
  .language-seal img { position:relative;z-index:1;filter:saturate(.62) brightness(.72);box-shadow:0 0 0 5px #12100d,0 0 0 6px rgba(138,118,86,.55);transition:.2s; }
  .language-seal span { position:relative;z-index:1; }
  .language-seal:hover::before { border-color:#c9a86c;transform:translateX(-50%) rotate(45deg) scale(1.04); }
  .language-seal:hover img { filter:saturate(.9) brightness(.92); }
  .language-seal.is-active { color:#f0d18c; }
  .language-seal.is-active::before { border-color:#e8b84d;box-shadow:inset 0 0 20px rgba(103,47,126,.22),0 0 14px rgba(232,184,77,.32); }
  .language-seal.is-active img { filter:saturate(.95) brightness(1);box-shadow:0 0 0 5px #17110b,0 0 0 7px #c6973f,0 0 16px rgba(232,184,77,.36); }
`;
