import React, { useState } from "react";
import { CORE_INGREDIENT_ASSETS } from "../../assets/coreAssets";
import { useTranslation } from "../../i18n/useTranslation";
import type { Ingredient } from "./grimoireData";
import { ing, det } from "./grimoireStyles";
import { useGameStore } from "../../store/gameStore";
import type { RecipeColor } from "../../game/recipeBooks";
import { getLocalizedTokenName } from "../../i18n/tokenNames";
import { MIREWROUGHT_ASSETS } from "../../assets/mirewroughtAssets";

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
    const [inspecting, setInspecting] = useState(false);
    if (!inspecting) {
        return (
            <div className="ingredient-gallery">
                {ingredients.map((item) => (
                    <button key={`${item.color}-${item.name}`} className="ingredient-gallery-item" onClick={() => { onSelect(item); setInspecting(true); }}>
                        <TokenDot ingredient={item} size={150} />
                        <span style={{ color: item.border }}>{item.name === "Embercore" ? t.grimoire.embercore : getLocalizedTokenName(item.color, t)}</span>
                        <small>{localizedRarity(item.rarity, t.grimoire)}</small>
                    </button>
                ))}
            </div>
        );
    }
    return (
        <div>
            <button className="collection-return" onClick={() => setInspecting(false)}>← INGREDIENTS</button>
            <div className="ingredient-inspector">
                <div className="ingredient-hero"><TokenDot ingredient={selected} size={360} /></div>
            <div className="ingredient-detail" style={ing.detail}>
                <IngredientDetail ingredient={selected} />
            </div>
            </div>
        </div>
    );
}

// ─── Ingredient detail ────────────────────────────────────────────────────────

function IngredientDetail({ ingredient: i }: { ingredient: Ingredient }) {
    const t = useTranslation();
    const iData = t.grimoireIngredientsData[i.name];
    const { market, recipeBooks } = useGameStore((store) => ({
        market: store.state.market,
        recipeBooks: store.state.recipeBooks,
    }));
    const marketItems = market.filter((item) => item.token.color === i.color);
    const sharedStock = marketItems.reduce((total, item) => total + item.stock, 0);
    const unlockRound = marketItems.length > 0 ? Math.min(...marketItems.map((item) => item.unlockRound)) : null;
    const recipeSet = (["blue", "red", "yellow", "green", "purple"] as string[]).includes(i.color)
        ? recipeBooks[i.color as RecipeColor]
        : null;

    return (
        <div className="grimoire-card ingredient-detail-card" style={det.root}>
            {/* Header */}
            <div style={det.header}>
                <TokenDot ingredient={i} size={56} />
                <div style={det.headerText}>
                    <div style={{ ...det.name, color: i.border }}>{i.name === "Embercore" ? t.grimoire.embercore : getLocalizedTokenName(i.color, t)}</div>
                    <div style={det.latin}>{(t.grimoire as any)[i.name.toLowerCase() + "Sub"] ?? i.latinName}</div>
                    <RarityBadge rarity={i.rarity} label={localizedRarity(i.rarity, t.grimoire)} color={i.border} />
                </div>
            </div>

            <Divider />

            {(unlockRound !== null || recipeSet !== null) && (
                <div style={{ ...det.effectBox, border: `1px solid ${i.border}33` }}>
                    {recipeSet !== null && (
                        <div style={{ ...det.sectionTitle, color: i.border }}>
                            {t.grimoire.activeRecipeSet.replace("{set}", String(recipeSet))}
                        </div>
                    )}
                    {unlockRound !== null && (
                        <div style={{ fontFamily: "monospace", fontSize: 12, color: "#c5b49c", lineHeight: 1.7 }}>
                            {t.grimoire.sharedStock.replace("{count}", String(sharedStock))}
                            {" · "}
                            {t.grimoire.unlockRound.replace("{round}", String(unlockRound))}
                        </div>
                    )}
                </div>
            )}

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

            {t.grimoireRecipeSets[i.name] && (
                <div style={det.section}>
                    {t.grimoireRecipeSets[i.name].map((recipe, index) => (
                        <div key={index} style={{ ...det.effectBox, border: `1px solid ${i.border}33`, marginBottom: 9 }}>
                            <div style={{ ...det.sectionTitle, color: i.border }}>
                                {t.grimoire.recipeSet.replace("{set}", String(index + 1))}
                            </div>
                            <p style={{ ...det.body, color: "#f0d8a7", marginBottom: 6 }}>{recipe.effect}</p>
                            <div style={{ fontFamily: "monospace", fontSize: 12, color: "#b9a78d" }}>{recipe.costs}</div>
                        </div>
                    ))}
                </div>
            )}

            {!t.grimoireRecipeSets[i.name] && (
                <div style={det.section}>
                    <div style={det.sectionTitle}>{t.grimoire.gameEffectLabel}</div>
                    <div style={{ ...det.effectBox, border: `1px solid ${i.border}33` }}>
                        <p style={{ ...det.body, color: "#f0d8a7" }}>{iData?.effect ?? i.effect}</p>
                    </div>
                </div>
            )}

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
    if (ingredient.color === "echo" || ingredient.name === "Embercore") {
        const iconPath = ingredient.color === "echo"
            ? MIREWROUGHT_ASSETS.echoReed
            : MIREWROUGHT_ASSETS.embercore;
        return (
            <img
                src={iconPath}
                alt={ingredient.name}
                style={{
                    width: size,
                    height: size,
                    display: "block",
                    flexShrink: 0,
                    borderRadius: "50%",
                    objectFit: "contain",
                    filter: `drop-shadow(0 0 ${size * 0.25}px ${ingredient.glow})`,
                }}
            />
        );
    }
    const iconPath = CORE_INGREDIENT_ASSETS[ingredient.color] ?? CORE_INGREDIENT_ASSETS.white;

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

function localizedRarity(rarity: string, text: { rarityCommon: string; rarityUncommon: string; rarityRare: string; rarityLegendary: string }) {
    return rarity === "Common"
        ? text.rarityCommon
        : rarity === "Uncommon"
            ? text.rarityUncommon
            : rarity === "Rare"
                ? text.rarityRare
                : text.rarityLegendary;
}

function RarityBadge({ rarity, label, color }: { rarity: string; label: string; color: string }) {
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
            {label}
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
