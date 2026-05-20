import React, { useState } from "react";
import { useTranslation } from "../i18n/useTranslation";
import type { Ingredient } from "./grimoire/grimoireData";
import { INGREDIENTS, OMENS, RULES } from "./grimoire/grimoireData";
import { s } from "./grimoire/grimoireStyles";
import { IngredientsTab } from "./grimoire/IngredientsTab";
import { OmensTab } from "./grimoire/OmensTab";
import { RulesTab } from "./grimoire/RulesTab";

// ─── Component ────────────────────────────────────────────────────────────────

type Tab = "ingredients" | "omens" | "rules";

export function Grimoire({ onBack }: { onBack?: () => void }) {
  const [tab, setTab] = useState<Tab>("ingredients");
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient>(INGREDIENTS[0]);
  const [expandedRule, setExpandedRule] = useState<string | null>("The Crucible Spiral");

  const t = useTranslation();

  return (
    <div style={s.root}>
      {/* Parchment texture overlay */}
      <div style={s.noise} />

      {/* Header */}
      <div style={s.header}>
        {onBack && (
          <button
            style={{ ...s.tab, position: "absolute", left: 24, top: 24, fontSize: 13, padding: "8px 18px" }}
            onClick={onBack}
          >
            {t.grimoire.backToMenu}
          </button>
        )}
        <div style={s.headerRune}>✦ ✦ ✦</div>
        <h1 style={s.title}>{t.grimoire.title}</h1>
        <p style={s.headerSub}>{t.grimoire.footer}</p>
        <div style={s.headerRune}>✦ ✦ ✦</div>
      </div>

      {/* Tab bar */}
      <div style={s.tabBar}>
        {(["ingredients", "omens", "rules"] as Tab[]).map((tabId) => (
          <button
            key={tabId}
            style={{ ...s.tab, ...(tab === tabId ? s.tabActive : {}) }}
            onClick={() => setTab(tabId)}
          >
            {tabId === "ingredients" && t.grimoire.tabIngredients}
            {tabId === "omens" && t.grimoire.tabOmens}
            {tabId === "rules" && t.grimoire.tabRules}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={s.content}>
        {tab === "ingredients" && (
          <IngredientsTab
            ingredients={INGREDIENTS}
            selected={selectedIngredient}
            onSelect={setSelectedIngredient}
          />
        )}
        {tab === "omens" && <OmensTab omens={OMENS} />}
        {tab === "rules" && (
          <RulesTab
            rules={RULES}
            expanded={expandedRule}
            onExpand={setExpandedRule}
          />
        )}
      </div>

      {/* Footer */}
      <div style={s.footer}>
        <span style={s.footerText}>
          {t.grimoire.footer}
        </span>
      </div>
    </div>
  );
}
