import React from "react";
import { useTranslation } from "../i18n/useTranslation";
import type { Player } from "../game/playerTypes";
import type { BonusDieResult } from "../game/bonusDie";
import { formatBonusDieResult } from "./bonusDieText";
import { useSettingsStore } from "../store/settingsStore";

interface RubySpendPanelProps {
    player: Player;
    bonusDieResult: BonusDieResult | null;
    canDroplet: boolean;
    canFlask: boolean;
    onDroplet: () => void;
    onFlask: () => void;
    onDone: () => void;
}

export function RubySpendPanel({
    player,
    bonusDieResult,
    canDroplet,
    canFlask,
    onDroplet,
    onFlask,
    onDone,
}: RubySpendPanelProps) {
    const t = useTranslation();
    const language = useSettingsStore((state) => state.language);
    const pluralCategory = new Intl.PluralRules(language).select(player.rubies);
    const rubyLabel = pluralCategory === "one"
        ? t.rubySpend.rubiesOne
        : pluralCategory === "few"
            ? t.rubySpend.rubiesFew
            : t.rubySpend.rubiesMany;
    return (
        <div style={styles.panel}>
            <div style={styles.title}>{t.rubySpend.title}</div>

            {/* Scoring summary */}
            <div style={styles.scoreRow}>
                <span style={styles.scoreLabel}>{t.rubySpend.vpEarned}</span>
                <span style={styles.scoreValue}>{player.score}</span>
            </div>
            <div style={styles.scoreRow}>
                <span style={styles.scoreLabel}>{t.rubySpend.coinsEarned}</span>
                <span style={styles.scoreValue}>⬡ {player.coinsThisRound}</span>
            </div>

            {bonusDieResult && (
                <div style={styles.bonusDie}>
                    {t.rubySpend.bonusDie} {formatBonusDieResult(bonusDieResult, t.bonusDieRewards)}
                </div>
            )}

            <div style={styles.divider} />

            {/* Ruby balance */}
            <div style={styles.rubyRow}>
                <span style={styles.rubyIcon}>◆</span>
                <span style={styles.rubyCount}>{player.rubies} {rubyLabel}</span>
            </div>

            {/* Spend buttons */}
            <button
                style={{
                    ...styles.btn,
                    opacity: canDroplet ? 1 : 0.35,
                    cursor: canDroplet ? "pointer" : "not-allowed",
                }}
                onClick={onDroplet}
                disabled={!canDroplet}
            >
                {t.rubySpend.advanceDroplet}
            </button>

            <button
                style={{
                    ...styles.btn,
                    opacity: canFlask ? 1 : 0.35,
                    cursor: canFlask ? "pointer" : "not-allowed",
                }}
                onClick={onFlask}
                disabled={!canFlask}
            >
                {t.rubySpend.refillFlask}
            </button>

            <div style={styles.divider} />

            <button style={styles.doneBtn} onClick={onDone}>
                {t.rubySpend.proceedToMarket}
            </button>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    panel: {
        background: "linear-gradient(160deg, rgba(7, 3, 16, 0.97), rgba(24, 9, 39, 0.94))",
        border: "1px solid rgba(102, 51, 137, 0.72)",
        borderRadius: 10,
        padding: "16px 18px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        boxShadow: "0 12px 34px rgba(0,0,0,0.42), inset 0 1px rgba(220,180,255,0.05)",
        animation: "fadeInUp 0.24s ease-out",
    },
    title: {
        fontFamily: "Georgia, serif",
        fontSize: 15,
        color: "#e8b84d",
        textAlign: "center",
        letterSpacing: 2,
        textShadow: "0 0 12px rgba(180,80,255,0.3)",
    },
    scoreRow: {
        display: "flex",
        justifyContent: "space-between",
        fontFamily: "monospace",
        fontSize: 12,
        padding: "6px 8px",
        border: "1px solid rgba(96, 59, 122, 0.4)",
        borderRadius: 5,
        background: "rgba(9, 3, 17, 0.58)",
    },
    scoreLabel: {
        color: "#8a7656",
    },
    scoreValue: {
        color: "#edc76e",
        fontWeight: "bold",
    },
    bonusDie: {
        fontFamily: "monospace",
        fontSize: 11,
        color: "#ffaa44",
        textAlign: "center",
        padding: "4px 8px",
        background: "rgba(80, 40, 0, 0.2)",
        borderRadius: 5,
        border: "1px solid #443300",
    },
    divider: {
        height: 1,
        background: "linear-gradient(90deg, transparent, #3a1a5a, transparent)",
        margin: "4px 0",
    },
    rubyRow: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
    },
    rubyIcon: {
        color: "#ff4466",
        fontSize: 14,
    },
    rubyCount: {
        fontFamily: "Georgia, serif",
        fontSize: 14,
        color: "#ff6688",
        fontWeight: "bold",
    },
    btn: {
        background: "rgba(80, 20, 140, 0.25)",
        border: "1px solid #5a1a8a",
        borderRadius: 6,
        padding: "9px",
        color: "#e8d5b5",
        fontFamily: "serif",
        fontSize: 12,
        letterSpacing: 1,
        cursor: "pointer",
    },
    doneBtn: {
        background: "linear-gradient(180deg, rgba(49, 124, 82, 0.52), rgba(21, 69, 45, 0.58))",
        border: "1px solid #4f9d70",
        borderRadius: 7,
        padding: "10px",
        color: "#8ee0af",
        fontFamily: "Georgia, serif",
        fontSize: 13,
        letterSpacing: 1,
        cursor: "pointer",
        boxShadow: "0 0 16px rgba(75, 170, 112, 0.16)",
    },
};
