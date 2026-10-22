import React, { useState } from "react";
import { useTranslation } from "../../i18n/useTranslation";
import { om } from "./grimoireStyles";
import { omenDeckForPacks } from "../../game/omen";
import { VEILGLASS_OMEN_ART } from "../../assets/veilglassAssets";
import { BASE_OMEN_ART } from "../../assets/baseAssets";

export function OmensTab({ veilglassEnabled = false }: { veilglassEnabled?: boolean }) {
    const t = useTranslation();
    const omens = omenDeckForPacks(veilglassEnabled ? ["base", "distillers_of_the_veil"] : ["base"]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    if (selectedId === null) {
        return (
            <div style={om.root}>
                <div style={om.intro}>{t.grimoire.omensIntro}</div>
                <div className="omen-deck-gallery">
                    {omens.map((omen, index) => (
                        <button className="omen-deck-card" key={omen.id} onClick={() => setSelectedId(omen.id)}>
                            <img src="/images/core/omens/omen-card-back.webp" alt="" />
                            <span><small>OMEN {String(index + 1).padStart(2, "0")}</small>{t.omenCards[omen.id]?.title ?? omen.title}</span>
                        </button>
                    ))}
                </div>
            </div>
        );
    }
    const selectedIndex = Math.max(0, omens.findIndex((omen) => omen.id === selectedId));
    const selected = omens[selectedIndex] ?? omens[0];
    if (!selected) return null;
    const localized = t.omenCards[selected.id];
    const artwork = BASE_OMEN_ART[selected.id] ?? VEILGLASS_OMEN_ART[selected.id];
    return (
        <div style={om.root}>
            <div style={om.intro}>
                {t.grimoire.omensIntro}
            </div>

            <button className="collection-return" onClick={() => setSelectedId(null)}>← OMEN DECK</button>
            <div className="omen-reader omen-reader-detail" style={om.grid}>
                <article className="omen-manuscript" style={om.card}>
                    <div className="omen-card-portrait">
                        <div className="omen-card-art" style={artwork ? { backgroundImage: `url('${artwork}')` } : undefined} />
                        <img src="/images/core/omens/omen-card-front-blank.webp" alt="" aria-hidden="true" />
                    </div>
                    <div className="omen-card-copy">
                        <div style={om.cardIcon}>✦ <span style={om.cardNumber}>OMEN {String(selectedIndex + 1).padStart(2, "0")}</span></div>
                        <div style={om.cardTitle}>{localized?.title ?? selected.title}</div>
                        {selected.id.startsWith("veil-omen-") && <div style={om.effectLabel}>{t.grimoire.veilglassOmen}</div>}
                        <div className="omen-card-description" style={om.cardCards}>{localized?.description ?? selected.description}</div>
                        <div style={om.divider} />
                        <div style={om.effectLabel}>{t.grimoire.effect}</div>
                        <div className="omen-card-effect" style={om.effect}>{localized?.summary ?? selected.summary}</div>
                    </div>
                </article>
            </div>
        </div>
    );
}
