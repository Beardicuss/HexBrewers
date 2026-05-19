import React from "react";
import type { Token } from "../game/tokenTypes";
import { useTranslation } from "../i18n/useTranslation";

export function BlueChoicePanel({
    tokens,
    onChoose,
}: {
    tokens: Token[];
    onChoose: (keepId: string | null) => void;
}) {
    const t = useTranslation();
    return (
        <div style={panelStyle}>
            <div style={labelStyle}>{t.blueChoice.title}</div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                {tokens.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => onChoose(t.id)}
                        style={buttonStyle}
                    >
                        <img
                            src={`/images/${t.color === "blue" ? "frostbile" :
                                t.color === "red" ? "bloodthorn" :
                                    t.color === "yellow" ? "plaguedust" :
                                        t.color === "green" ? "deathweave" :
                                            t.color === "black" ? "shadowmoss" :
                                                t.color === "purple" ? "wraithbloom" : "empty"
                                }.png`}
                            alt={t.color}
                            style={{ width: 44, height: 44, objectFit: "contain" }}
                        />
                        <span style={{ fontFamily: "Georgia, serif", fontSize: 13, color: "#eebbff" }}>
                            {t.value}
                        </span>
                    </button>
                ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <button style={skipBtnStyle} onClick={() => onChoose(null)}>
                    {t.blueChoice.skip}
                </button>
            </div>
        </div>
    );
}

const panelStyle: React.CSSProperties = {
    background: "rgba(30, 10, 50, 0.6)",
    border: "1px solid #5a1a8a",
    borderRadius: 8,
    padding: "14px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
};

const labelStyle: React.CSSProperties = {
    fontFamily: "serif",
    fontSize: 12,
    color: "#e8b84d",
    textAlign: "center",
    fontStyle: "italic",
};

const buttonStyle: React.CSSProperties = {
    background: "rgba(10, 4, 30, 0.5)",
    border: "1px solid #5a1a8a",
    borderRadius: 8,
    padding: 4,
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
};

const skipBtnStyle: React.CSSProperties = {
    background: "transparent",
    border: "1px solid #5a1a8a",
    borderRadius: 6,
    padding: "9px",
    color: "#e8d5b5",
    fontFamily: "serif",
    fontSize: 13,
    letterSpacing: 1,
    cursor: "pointer",
};
