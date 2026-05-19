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
        <div style={ss.panel}>
            <div style={ss.sectionTitle}>{t.settings.language}</div>
            <div style={styles.grid}>
                {LANGUAGES.map((lang) => (
                    <button
                        key={lang.code}
                        style={{
                            ...styles.card,
                            ...(language === lang.code ? styles.cardActive : styles.cardInactive),
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
        gap: 14,
    },
    card: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        padding: "20px 16px",
        borderRadius: 10,
        cursor: "pointer",
        border: "2px solid",
        transition: "all 0.2s",
        background: "transparent",
    },
    cardActive: {
        borderColor: C.gold,
        background: "rgba(232, 184, 77, 0.08)",
        boxShadow: "0 0 20px rgba(232, 184, 77, 0.15)",
    },
    cardInactive: {
        borderColor: C.border,
        background: "rgba(20, 10, 40, 0.4)",
    },
    flag: {
        width: 64,
        height: 43,
        borderRadius: 4,
        objectFit: "cover",
    },
    name: {
        fontFamily: "Georgia, serif",
        fontSize: 25,
        color: C.parchment,
        letterSpacing: 1,
    },
};
