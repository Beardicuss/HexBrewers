import React from "react";
import { useTranslation } from "../../i18n/useTranslation";
import type { OmenEntry } from "./grimoireData";
import { om } from "./grimoireStyles";

export function OmensTab({ omens }: { omens: OmenEntry[] }) {
    const t = useTranslation();
    return (
        <div style={om.root}>
            <div style={om.intro}>
                {t.grimoire.omensIntro}
            </div>

            <div style={om.grid}>
                {omens.map((omen) => {
                    const defaultData = t.grimoireOmensData[omen.id] ?? omen;
                    return (
                        <div key={omen.id} style={om.card}>
                            <div style={om.cardIcon}>{omen.icon}</div>
                            <div style={om.cardTitle}>{defaultData.title}</div>
                            <div style={om.cardCards}>{t.grimoire.cardsLabel} {defaultData.description}</div>
                            <div style={om.divider} />
                            <div style={om.effectLabel}>{t.grimoire.effect}</div>
                            <div style={om.effect}>{defaultData.effect}</div>
                            <div style={om.divider} />
                            <div style={om.stratLabel}>{t.grimoire.strategyLabel}</div>
                            <p style={om.strat}>{defaultData.strategy}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
