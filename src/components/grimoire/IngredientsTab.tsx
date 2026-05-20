import React from "react";
import { useTranslation } from "../../i18n/useTranslation";
import type { Ingredient } from "./grimoireData";
import { ing, det } from "./grimoireStyles";

// ─── Ingredients tab ──────────────────────────────────────────────────────────

export function IngredientsTab({
    ingredients,
    selected,
    onSelect,
}: {
    ingredients: Ingredient[];
    selected: Ingredient;
    onSelect: (i: Ingredient) => void;
}) {
    const t = useTranslation();
    return (
        <div style={ing.layout}>
            {/* Sidebar list */}
            <div style={ing.sidebar}>
                <div style={ing.sidebarTitle}>{t.grimoire.ingredientsLabel}</div>
                {ingredients.map((item) => (
                    <button
                        key={item.color}
                        style={{
                            ...ing.sidebarItem,
                            border:
                                selected.color === item.color
                                    ? `1px solid ${item.border}99`
                                    : "1px solid transparent",
                            background:
                                selected.color === item.color
                                    ? `${item.fill}cc`
                                    : "transparent",
                        }}
                        onClick={() => onSelect(item)}
                    >
                        <TokenDot ingredient={item} size={22} />
                        <div style={ing.sidebarItemText}>
                            <span style={{ ...ing.sidebarName, color: item.border }}>
                                {(t.grimoire as any)[item.name.toLowerCase()] ?? item.name}
                            </span>
                            <span style={ing.sidebarRarity}>{item.rarity}</span>
                        </div>
                    </button>
                ))}
            </div>

            {/* Detail panel */}
            <div style={ing.detail}>
                <IngredientDetail ingredient={selected} />
            </div>
        </div>
    );
}

// ─── Ingredient detail ────────────────────────────────────────────────────────

function IngredientDetail({ ingredient: i }: { ingredient: Ingredient }) {
    const t = useTranslation();
    const iData = t.grimoireIngredientsData[i.name];

    return (
        <div style={det.root}>
            {/* Header */}
            <div style={det.header}>
                <TokenDot ingredient={i} size={56} />
                <div style={det.headerText}>
                    <div style={{ ...det.name, color: i.border }}>{(t.grimoire as any)[i.name.toLowerCase()] ?? i.name}</div>
                    <div style={det.latin}>{(t.grimoire as any)[i.name.toLowerCase() + "Sub"] ?? i.latinName}</div>
                    <RarityBadge rarity={i.rarity} color={i.border} />
                </div>
            </div>

            <Divider />

            {/* Values */}
            <div style={det.section}>
                <div style={det.sectionTitle}>{t.grimoire.tokenValuesLabel}</div>
                <div style={det.valueRow}>
                    {i.values.map((v, idx) => (
                        <div
                            key={idx}
                            style={{
                                ...det.valuePip,
                                background: i.fill,
                                border: `1px solid ${i.border}88`,
                                color: i.border,
                                boxShadow: `0 0 8px ${i.glow}44`,
                            }}
                        >
                            {v}
                        </div>
                    ))}
                </div>
                <div style={det.valueNote}>
                    {i.color === "white"
                        ? t.grimoire.voidshardCount
                            .replace("{count}", i.values.length.toString())
                            .replace("{val}", i.values.reduce((a, b) => a + b, 0).toString())
                        : t.grimoire.otherCount.replace("{count}", i.values.length.toString())}
                </div>
            </div>

            <Divider />

            {/* Description */}
            <div style={det.section}>
                <div style={det.sectionTitle}>{t.grimoire.descriptionLabel}</div>
                <p style={det.body}>{iData?.description ?? i.description}</p>
            </div>

            {/* Game effect */}
            <div style={det.section}>
                <div style={det.sectionTitle}>{t.grimoire.gameEffectLabel}</div>
                <div style={{ ...det.effectBox, border: `1px solid ${i.border}33` }}>
                    <p style={{ ...det.body, color: "#cc99ff" }}>{iData?.effect ?? i.effect}</p>
                </div>
            </div>

            {/* Warning */}
            {(iData?.warning ?? i.warning) && (
                <div style={det.warningBox}>
                    <span style={det.warningIcon}>⚠</span>
                    <p style={det.warningText}>{iData?.warning ?? i.warning}</p>
                </div>
            )}

            {/* Lore */}
            <div style={det.section}>
                <div style={det.sectionTitle}>{t.grimoire.lore}</div>
                <p style={det.lore}>{iData?.lore ?? i.lore}</p>
            </div>
        </div>
    );
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

export function TokenDot({ ingredient, size }: { ingredient: Ingredient; size: number }) {
    const colorMap: Record<string, string> = {
        white: "empty.png",
        orange: "spider.png",
        green: "deathweave.png",
        blue: "frostbile.png",
        red: "bloodthorn.png",
        yellow: "plaguedust.png",
        purple: "wraithbloom.png",
        black: "shadowmoss.png",
    };
    const iconPath = `/images/${colorMap[ingredient.color] || "empty.png"}`;

    return (
        <img
            src={iconPath}
            alt={ingredient.name}
            style={{
                width: size,
                height: size,
                objectFit: "contain",
                flexShrink: 0,
                filter: `drop-shadow(0 0 ${size * 0.25}px ${ingredient.glow})`,
                background: "rgba(0, 0, 0, 0.5)",
                borderRadius: "50%",
                padding: Math.max(1, size * 0.1),
            }}
        />
    );
}

function RarityBadge({ rarity, color }: { rarity: string; color: string }) {
    const colors: Record<string, string> = {
        Common: "#887799",
        Uncommon: "#44aa66",
        Rare: "#4488ff",
        Legendary: "#ffaa00",
    };
    return (
        <span
            style={{
                fontFamily: "monospace",
                fontSize: 13,
                color: colors[rarity] ?? color,
                letterSpacing: 2,
                textTransform: "uppercase",
            }}
        >
            {rarity}
        </span>
    );
}

export function Divider() {
    return (
        <div
            style={{
                height: 1,
                background:
                    "linear-gradient(90deg, transparent, #3a1a5a88, transparent)",
                margin: "4px 0",
            }}
        />
    );
}
