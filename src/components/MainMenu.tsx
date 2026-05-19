import React from "react";
import { useTranslation } from "../i18n/useTranslation";
import { useSettingsStore } from "../store/settingsStore";

interface MainMenuProps {
    onNewGame: () => void;
    onGrimoire: () => void;
    onSettings: () => void;
}

export function MainMenu({ onNewGame, onGrimoire, onSettings }: MainMenuProps) {
    const t = useTranslation();
    const language = useSettingsStore((s) => s.language);
    return (
        <div style={s.root}>
            {/* Ambient particles overlay */}
            <div style={s.particles} />

            {/* Content — left-aligned layout per wireframe */}
            <div style={s.content}>
                {/* Title area — top-left */}
                <div style={s.titleBlock}>
                    <div style={s.rune}>✦ ✦ ✦</div>
                    <img
                        src={`/images/title/title-${language}.png`}
                        alt={t.menu.title}
                        style={s.titleImage}
                    />
                    <p style={s.subtitle}>{t.menu.subtitle}</p>
                </div>

                {/* Menu buttons — left-aligned, vertical stack */}
                <nav style={s.nav}>
                    <MenuButton label={t.menu.newGame} icon="⬡" onClick={onNewGame} accent="#e8b84d" />
                    <MenuButton label={t.menu.grimoire} icon="✦" onClick={onGrimoire} accent="#e8b84d" />
                    <MenuButton label={t.menu.settings} icon="◈" onClick={onSettings} accent="#e8b84d" />
                </nav>

                {/* Footer */}
                <div style={s.footer}>
                    <span style={s.footerText}>v0.1.0 - Built in the shadows of Softcurse Systems</span>
                </div>
            </div>

            {/* Right-side ambient glow */}
            <div style={s.glowOrb} />
        </div>
    );
}

// ── Menu button component ────────────────────────────────────────────────────

function MenuButton({
    label,
    icon,
    onClick,
    accent,
}: {
    label: string;
    icon: string;
    onClick: () => void;
    accent: string;
}) {
    return (
        <button
            style={s.menuBtn}
            onClick={onClick}
            onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = accent + "88";
                (e.currentTarget as HTMLButtonElement).style.color = accent;
                (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 24px ${accent}15`;
                (e.currentTarget as HTMLButtonElement).style.paddingLeft = "36px";
            }}
            onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "transparent";
                (e.currentTarget as HTMLButtonElement).style.color = "#c9a86c"; // C.amber
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
                (e.currentTarget as HTMLButtonElement).style.paddingLeft = "28px";
            }}
        >
            <span style={s.menuIcon}>{icon}</span>
            <span style={s.menuLabel}>{label}</span>
        </button>
    );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s: Record<string, React.CSSProperties> = {
    root: {
        minHeight: "100vh",
        backgroundImage: "url('/images/main_menu_bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        userSelect: "none",
    },
    particles: {
        position: "fixed",
        inset: 0,
        backgroundImage:
            "radial-gradient(1px 1px at 10% 20%, #cc88ff11 0%, transparent 100%), " +
            "radial-gradient(1px 1px at 30% 60%, #aa66ee08 0%, transparent 100%), " +
            "radial-gradient(1.5px 1.5px at 70% 30%, #8855bb0a 0%, transparent 100%), " +
            "radial-gradient(1px 1px at 50% 80%, #cc88ff06 0%, transparent 100%), " +
            "radial-gradient(2px 2px at 80% 15%, #7733bb0d 0%, transparent 100%)",
        pointerEvents: "none",
        zIndex: 0,
    },
    content: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "clamp(48px, 8vh, 80px) clamp(40px, 6vw, 100px)",
        position: "relative",
        zIndex: 1,
        flex: 1,
        maxWidth: 700,
    },
    titleBlock: {
        marginTop: 0,
        marginBottom: 250
    },
    rune: {
        color: "#4a1a7a",
        fontSize: 30,
        letterSpacing: 10,
        marginBottom: 16,
        opacity: 0.7,
    },
    title: {
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontSize: "clamp(32px, 5vw, 52px)",
        color: "#cc88ff",
        letterSpacing: 2,
        margin: 0,
        lineHeight: 1.15,
        fontWeight: "normal",
        textShadow:
            "0 0 40px rgba(180, 80, 255, 0.3), 0 0 80px rgba(120, 40, 200, 0.1)",
    },
    titleImage: {
        width: "100%",
        maxWidth: 850,
        height: "auto",
        objectFit: "contain",
        display: "block",
        margin: "12px 0",
        filter: "drop-shadow(0 0 20px rgba(180, 80, 255, 0.3)) drop-shadow(0 0 40px rgba(120, 40, 200, 0.1))",
    },
    titleOf: {
        color: "#664488",
        fontSize: "0.7em",
        fontStyle: "italic",
    },
    subtitle: {
        fontFamily: "monospace",
        fontSize: 14,
        color: "#c9a86c", // Gold/amber
        letterSpacing: 2,
        marginTop: 14,
    },
    nav: {
        display: "flex",
        flexDirection: "column",
        gap: 12,
        marginBottom: "auto",
    },
    menuBtn: {
        display: "flex",
        alignItems: "center",
        gap: 20,
        background: "transparent",
        border: "2px solid transparent",
        borderRadius: 12,
        padding: "24px 42px",
        color: "#c9a86c", // Match settings text color
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontSize: 50,
        letterSpacing: 2,
        cursor: "pointer",
        textAlign: "left",
        transition:
            "border-color 0.25s, color 0.25s, box-shadow 0.25s, padding-left 0.25s",
        width: "100%",
        maxWidth: 550,
    },
    menuIcon: {
        fontSize: 32,
        opacity: 0.6,
        flexShrink: 0,
        width: 40,
        textAlign: "center",
    },
    menuLabel: {
        flex: 1,
    },
    footer: {
        marginTop: "auto",
        paddingTop: 40,
    },
    footerText: {
        fontFamily: "monospace",
        fontSize: 12,
        color: "#8a7656", // Bronze
        letterSpacing: 2,
    },
    glowOrb: {
        position: "fixed",
        right: "-15vw",
        top: "20vh",
        width: "50vw",
        height: "50vw",
        borderRadius: "50%",
        background:
            "radial-gradient(circle, rgba(100, 30, 180, 0.06) 0%, rgba(60, 10, 120, 0.02) 40%, transparent 70%)",
        pointerEvents: "none",
        zIndex: 0,
    },
};
