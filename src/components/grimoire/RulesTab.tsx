import React from "react";
import { useTranslation } from "../../i18n/useTranslation";
import type { RuleEntry } from "./grimoireData";
import { rl } from "./grimoireStyles";

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
    return (
        <div style={rl.root}>
            <div style={rl.intro}>
                {t.grimoire.rulesIntro}
            </div>

            {rules.map((rule, i) => {
                const ruleData = t.grimoireRulesData[rule.title] ?? rule;
                return (
                    <div key={rule.title} style={rl.section}>
                        <button
                            style={rl.sectionHeader}
                            onClick={() =>
                                onExpand(expanded === rule.title ? null : rule.title)
                            }
                        >
                            <span style={rl.sectionNum}>
                                {String(i + 1).padStart(2, "0")}
                            </span>
                            <span style={rl.sectionTitle}>{ruleData.title}</span>
                            <span style={rl.chevron}>
                                {expanded === rule.title ? "▲" : "▼"}
                            </span>
                        </button>

                        {expanded === rule.title && (
                            <div style={rl.sectionBody}>
                                {ruleData.content.map((line, j) => (
                                    <div key={j} style={rl.ruleLine}>
                                        <span style={rl.ruleBullet}>✦</span>
                                        <span style={rl.ruleText}>{line}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
