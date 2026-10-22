import React from "react";
import { useTranslation } from "../../i18n/useTranslation";
import type { RuleEntry } from "./grimoireData";
import { rl } from "./grimoireStyles";
import { GAME_RULES } from "../../game/ruleConstants";

export function RulesTab({
    rules,
    expanded,
    onExpand,
}: {
    rules: RuleEntry[];
    expanded: string | null;
    onExpand: (t: string | null) => void;
}) {
    const t = useTranslation();
    const facts = [
        [t.grimoire.rulesRounds, GAME_RULES.totalRounds],
        [t.grimoire.rulesPlayers, `${GAME_RULES.minPlayers}–${GAME_RULES.maxPlayers}`],
        [t.grimoire.rulesSafePressure, GAME_RULES.safeVoidshardPressure],
        [t.grimoire.rulesExplosion, GAME_RULES.explosionPressure],
        [t.grimoire.rulesMarketLimit, GAME_RULES.marketPurchaseLimit],
        [t.grimoire.rulesRubyCost, GAME_RULES.rubyActionCost],
    ] as const;
    const selectedRule = rules.find((rule) => rule.title === expanded) ?? rules[0];
    const selectedIndex = Math.max(0, rules.indexOf(selectedRule));
    const selectedData = t.grimoireRulesData[selectedRule.title] ?? selectedRule;
    return (
        <div style={rl.root}>
            <div style={rl.intro}>
                {t.grimoire.rulesIntro}
            </div>

            <div className="rules-reader" style={rl.reader}>
                <nav className="rules-index" style={rl.index} aria-label={t.grimoire.tabRules}>
                    {rules.map((rule, index) => {
                        const ruleData = t.grimoireRulesData[rule.title] ?? rule;
                        return <button key={rule.title} className={rule.title === selectedRule.title ? "is-active" : ""} style={rl.indexItem} onClick={() => onExpand(rule.title)}>
                            <small>{String(index + 1).padStart(2, "0")}</small><span>{ruleData.title}</span>
                        </button>;
                    })}
                </nav>
                <article className="rules-manuscript" style={rl.manuscript}>
                    <div style={rl.quickTitle}>{t.grimoire.rulesQuickReference}</div>
                    <div style={rl.factGrid}>
                        {facts.map(([label, value]) => <div key={label} style={rl.fact}><strong style={rl.factValue}>{value}</strong><span style={rl.factLabel}>{label}</span></div>)}
                    </div>
                    <div style={rl.chapterHeading}><small>CHAPTER {String(selectedIndex + 1).padStart(2, "0")}</small><h2>{selectedData.title}</h2></div>
                    <div style={rl.sectionBody}>
                        {selectedData.content.map((line, j) => <div key={j} style={rl.ruleLine}><span style={rl.ruleBullet}>✦</span><span style={rl.ruleText}>{line}</span></div>)}
                    </div>
                </article>
            </div>
        </div>
    );
}
