import React, { useState } from "react";
import { useTranslation } from "../i18n/useTranslation";
import type { Ingredient } from "./grimoire/grimoireData";
import { COVENANT_INGREDIENTS, INGREDIENTS, MIREWROUGHT_RULES, RULES, VEILGLASS_RULES } from "./grimoire/grimoireData";
import { s } from "./grimoire/grimoireStyles";
import { IngredientsTab } from "./grimoire/IngredientsTab";
import { OmensTab } from "./grimoire/OmensTab";
import { RulesTab } from "./grimoire/RulesTab";
import type { ContentPackId } from "../game/contentPacks";
import { MenuRoomBackground } from "./MenuRoomBackground";

// ─── Component ────────────────────────────────────────────────────────────────

type Tab = "ingredients" | "omens" | "rules";

export function Grimoire({ onBack, enabledPacks = ["base"] }: { onBack?: () => void; enabledPacks?: ContentPackId[] }) {
  const [tab, setTab] = useState<Tab>("ingredients");
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient>(INGREDIENTS[0]);
  const [expandedRule, setExpandedRule] = useState<string | null>("The Crucible Spiral");

  const t = useTranslation();
  const patronsEnabled = enabledPacks.includes("covenants_of_the_mire");
  const distillationEnabled = enabledPacks.includes("distillers_of_the_veil");
  const visibleIngredients = patronsEnabled ? [...INGREDIENTS, ...COVENANT_INGREDIENTS] : INGREDIENTS;
  const visibleRules = [
    ...RULES,
    ...(patronsEnabled ? MIREWROUGHT_RULES : []),
    ...(distillationEnabled ? VEILGLASS_RULES : []),
  ];

  return (
    <div className="grimoire-root" style={s.root}>
      <style>{grimoireResponsiveCss}</style>
      <MenuRoomBackground room="grimoire" />
      {/* Parchment texture overlay */}
      <div style={s.noise} />

      {/* Header */}
      <div className="grimoire-header" style={s.header}>
        {onBack && (
          <button
            className="grimoire-back"
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
      <div className="grimoire-tabs" style={s.tabBar}>
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
      <div className="grimoire-content" style={s.content}>
        {tab === "ingredients" && (
          <IngredientsTab
            ingredients={visibleIngredients}
            selected={selectedIngredient}
            onSelect={setSelectedIngredient}
          />
        )}
        {tab === "omens" && <OmensTab veilglassEnabled={distillationEnabled} />}
        {tab === "rules" && (
          <RulesTab
            rules={visibleRules}
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

const grimoireResponsiveCss = `
  .grimoire-tabs {
    position: relative !important;
    z-index: 20 !important;
    background: transparent;
    backdrop-filter: none;
  }
  .grimoire-content,
  .ingredient-sidebar,
  .omen-index,
  .rules-index {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .grimoire-content::-webkit-scrollbar,
  .ingredient-sidebar::-webkit-scrollbar,
  .omen-index::-webkit-scrollbar,
  .rules-index::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
  }
  .grimoire-card {
    box-shadow: none;
  }
  .ingredient-index-entry { opacity:.72; transition:opacity .18s,transform .18s,text-shadow .18s; }
  .ingredient-index-entry:hover { opacity:1; transform:translateX(4px); }
  .ingredient-index-entry.is-active { opacity:1; text-shadow:0 0 12px currentColor; }
  .ingredient-detail-card { background:linear-gradient(105deg,rgba(3,8,12,.78),rgba(5,11,14,.48) 78%,transparent)!important; }
  .ingredient-detail-card > div { position:relative; }
  .ingredient-detail-card [style*="border: 1px"] { border-top:0!important;border-right:0!important;border-bottom:0!important;border-radius:0!important;box-shadow:none!important; }
  .grimoire-tabs button:hover { color:#d39afa!important;border-bottom-color:#9b55c8!important; }
  .collection-return { display:block;margin:2px 0 14px;border:0;border-bottom:1px solid rgba(166,91,205,.45);background:transparent;color:#a979bf;padding:6px 2px;font:12px monospace;letter-spacing:2px;cursor:pointer; }
  .collection-return:hover { color:#e0aaff;border-bottom-color:#d28aff; }
  .omen-deck-gallery { display:grid;grid-template-columns:repeat(auto-fit,minmax(128px,1fr));gap:24px 18px;width:100%;box-sizing:border-box;margin:10px auto 0;padding:0 8px 44px; }
  .omen-deck-card { min-width:0;border:0;background:transparent;color:#b994cb;cursor:pointer;padding:0;font-family:Georgia,serif;transition:transform .2s,filter .2s,color .2s; }
  .omen-deck-card:hover { transform:translateY(-8px) scale(1.035);filter:drop-shadow(0 12px 16px rgba(139,55,179,.4));color:#dea6f8; }
  .omen-deck-card img { display:block;width:100%;aspect-ratio:850/1260;object-fit:contain; }
  .omen-deck-card span { display:flex;flex-direction:column;gap:4px;margin-top:7px;color:#d5c0a1;font-size:15px;line-height:1.15;text-shadow:0 2px 5px #000; }
  .omen-deck-card small { color:#a98b5c;font:9px monospace;letter-spacing:1.5px; }
  .omen-reader-detail { display:block!important; }
  .ingredient-gallery { display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:34px 22px;width:min(90vw,1450px);margin:24px 50% 0;transform:translateX(-50%); }
  .ingredient-gallery-item { border:0;background:transparent;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:8px;padding:12px;color:#cdb8d6;font-family:Georgia,serif;transition:transform .2s,filter .2s; }
  .ingredient-gallery-item:hover { transform:translateY(-7px) scale(1.04);filter:brightness(1.16); }
  .ingredient-gallery-item img { width:min(100%,150px)!important;height:auto!important;aspect-ratio:1; }
  .ingredient-gallery-item span { font-size:20px;text-shadow:0 0 12px currentColor; }
  .ingredient-gallery-item small { color:#887491;font:10px monospace;letter-spacing:2px;text-transform:uppercase; }
  .ingredient-inspector { display:grid;grid-template-columns:minmax(300px,38%) minmax(0,62%);gap:42px;align-items:start; }
  .ingredient-hero { display:flex;align-items:flex-start;justify-content:center;position:sticky;top:12px;padding-top:35px; }
  .ingredient-hero img { width:min(100%,360px)!important;height:auto!important;aspect-ratio:1; }
  .omen-index button,.rules-index button { transition:color .16s,transform .16s,border-color .16s; }
  .omen-reader { width:min(92vw,1780px);margin-left:50%;transform:translateX(-50%); }
  .omen-index button:hover,.rules-index button:hover { color:#d6a2ef!important;transform:translateX(4px); }
  .omen-index button.is-active,.rules-index button.is-active { color:#d6a2ef!important;border-left-color:#ad62d5!important;text-shadow:0 0 10px rgba(184,94,224,.35); }
  .omen-index small,.rules-index small { color:#80608f;font:11px monospace; }
  .omen-card-portrait { position:relative;width:min(100%,470px);aspect-ratio:850/1260;justify-self:center;filter:drop-shadow(0 20px 28px rgba(0,0,0,.76)); }
  .omen-card-art { position:absolute;z-index:2;inset:6.4% 7.4% 8.4%;background-size:cover;background-position:center top;border-radius:42% 42% 8% 8% / 18% 18% 6% 6%;filter:saturate(1) brightness(.96);box-shadow:inset 0 0 24px rgba(0,0,0,.5); }
  .omen-card-portrait > img { position:absolute;z-index:1;inset:0;width:100%;height:100%;object-fit:contain;pointer-events:none; }
  .omen-card-copy { align-self:start;margin-top:68px;padding:30px 24px 34px 36px;border-left:1px solid rgba(185,138,66,.52);background:linear-gradient(100deg,rgba(3,8,12,.7),rgba(3,8,12,.22),transparent);text-shadow:0 2px 8px #000; }
  .omen-card-copy > div:nth-child(2) { font-size:clamp(30px,2.3vw,40px)!important;margin:10px 0 14px; }
  .omen-card-description { font-size:clamp(16px,1vw,18px)!important;line-height:1.65; }
  .omen-card-effect { font-size:clamp(20px,1.35vw,25px)!important;line-height:1.6; }
  .rules-manuscript h2 { margin:5px 0 12px;font-size:26px;font-weight:400; }
  .rules-manuscript small { color:#76528b;font:9px monospace;letter-spacing:2px; }
  .rules-index button { font-size:17px!important;padding-top:10px!important;padding-bottom:10px!important; }
  .rules-manuscript [style*="font-size: 14px"] { font-size:18px!important; }
  .rules-manuscript [style*="font-size: 9px"] { font-size:11px!important; }
  .grimoire-back { border:0!important;border-bottom:1px solid rgba(153,96,188,.45)!important;border-radius:0!important;background:transparent!important; }
  .grimoire-back:hover { color:#d39afa!important;border-bottom-color:#c984ef!important; }
  }
  @media (max-width: 760px) {
    .grimoire-header { padding: 70px 18px 22px !important; }
    .grimoire-back { left: 14px !important; top: 14px !important; }
    .grimoire-tabs { justify-content: stretch !important; padding: 10px 12px !important; }
    .grimoire-tabs button { flex: 1; padding: 9px 8px !important; letter-spacing: 0.5px !important; }
    .grimoire-content { padding: 20px 12px 40px !important; }
    .ingredient-layout { grid-template-columns: minmax(0, 1fr) !important; }
    .ingredient-sidebar {
      position: static !important;
      flex-direction: row !important;
      overflow-x: auto;
      padding-bottom: 8px;
      scroll-snap-type: x proximity;
    }
    .ingredient-sidebar-title { display: none; }
    .ingredient-sidebar button { width: auto !important; min-width: max-content; scroll-snap-align: start; }
    .ingredient-detail { min-height: 0 !important; }
    .ingredient-detail-card { padding: 22px 18px !important; }
    .omen-grid { grid-template-columns: minmax(0, 1fr) !important; }
    .ingredient-inspector { grid-template-columns:1fr; }
    .ingredient-hero { position:static; }
    .omen-manuscript { grid-template-columns:1fr!important; }
    .omen-card-copy { margin-top:0; }
  }
  @media (max-width: 430px) {
    .grimoire-header h1 { font-size: 27px !important; letter-spacing: 2px !important; }
    .grimoire-header p { display: none; }
  }
`;
