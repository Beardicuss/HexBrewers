import React from "react";
import { useTranslation } from "../../i18n/useTranslation";
import type { RuleEntry } from "./grimoireData";
import { rl } from "./grimoireStyles";
import { GAME_RULES } from "../../game/ruleConstants";
import { COMPLETE_CODEX_URL } from "../../config/externalLinks";

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
    const [query, setQuery] = React.useState("");
    const facts = [
        [t.grimoire.rulesRounds, GAME_RULES.totalRounds],
        [t.grimoire.rulesPlayers, `${GAME_RULES.minPlayers}–${GAME_RULES.maxPlayers}`],
        [t.grimoire.rulesSafePressure, GAME_RULES.safeVoidshardPressure],
        [t.grimoire.rulesExplosion, GAME_RULES.explosionPressure],
        [t.grimoire.rulesMarketLimit, GAME_RULES.marketPurchaseLimit],
        [t.grimoire.rulesRubyCost, GAME_RULES.rubyActionCost],
    ] as const;
    const normalizedQuery = query.trim().toLocaleLowerCase();
    const filteredRules = normalizedQuery
        ? rules.filter((rule) => {
            const data = t.grimoireRulesData[rule.title] ?? rule;
            return data.title.toLocaleLowerCase().includes(normalizedQuery)
                || data.content.some((line) => line.toLocaleLowerCase().includes(normalizedQuery));
        })
        : rules;
    const selectedRule = filteredRules.find((rule) => rule.title === expanded) ?? filteredRules[0] ?? rules[0];
    const selectedIndex = Math.max(0, rules.indexOf(selectedRule));
    const selectedData = t.grimoireRulesData[selectedRule.title] ?? selectedRule;
    return (
        <div style={rl.root}>
            <div style={rl.intro}>
                {t.grimoire.rulesIntro}
            </div>

            <div className="rules-reader" style={rl.reader}>
                <nav className="rules-index" style={rl.index} aria-label={t.grimoire.tabRules}>
                    <input
                        type="search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search the rules…"
                        aria-label="Search the rules…"
                        style={rl.search}
                    />
                    {filteredRules.map((rule) => {
                        const ruleData = t.grimoireRulesData[rule.title] ?? rule;
                        const index = rules.indexOf(rule);
                        return <button key={rule.title} className={rule.title === selectedRule.title ? "is-active" : ""} style={rl.indexItem} onClick={() => onExpand(rule.title)}>
                            <small>{String(index + 1).padStart(2, "0")}</small><span>{ruleData.title}</span>
                        </button>;
                    })}
                </nav>
                <article className="rules-manuscript" style={rl.manuscript} aria-label={t.grimoire.rulesQuickReference}>
                    <div style={rl.quickTitle}>{t.grimoire.rulesQuickReference}</div>
                    <div style={rl.factGrid}>
                        {facts.map(([label, value]) => <div key={label} style={rl.fact}><strong style={rl.factValue}>{value}</strong><span style={rl.factLabel}>{label}</span></div>)}
                    </div>
                    <div style={rl.chapterHeading}><small>CHAPTER {String(selectedIndex + 1).padStart(2, "0")}</small><h2>{selectedData.title}</h2></div>
                    <div style={rl.sectionBody}>
                        {selectedData.content.map((line, j) => <div key={j} style={rl.ruleLine}><span style={rl.ruleBullet}>✦</span><span style={rl.ruleText}>{line}</span></div>)}
                    </div>
                    <div className="complete-codex-callout" style={rl.codexCallout}>
                        <span style={rl.codexRune}>✦　✦　✦</span>
                        <div>
                            <strong style={rl.codexTitle}>Seek the Complete Hexbrewer's Codex</strong>
                            <p style={rl.codexCopy}>For illustrated instructions, detailed examples, ingredient timing, and optional ritual rules, open the complete Codex.</p>
                        </div>
                        {COMPLETE_CODEX_URL ? (
                            <a href={COMPLETE_CODEX_URL} target="_blank" rel="noreferrer" style={rl.codexLink}>OPEN THE CODEX　↗</a>
                        ) : (
                            <span style={rl.codexUnavailable}>THE ARCHIVE GATE IS NOT YET INSCRIBED</span>
                        )}
                    </div>
                </article>
            </div>
        </div>
    );
}
