import React from "react";
import { useTranslation } from "../i18n/useTranslation";
import type { ContentPackId } from "../game/contentPacks";
import { MenuRoomBackground } from "./MenuRoomBackground";

interface DlcScreenProps { enabledPacks: ContentPackId[]; activationAvailable?: boolean; onToggle: (id: Exclude<ContentPackId, "base">) => void; onBack: () => void; }
type ChronicleId = "mire" | "veil";
type Tuning = { x: number; y: number; scale: number };
type DebugKey = "mireSkull" | "veilSkull" | "mireMirror" | "veilMirror" | "sealedText" | "eyeGlow";
const SKULL_ART = "/images/core/ui/dlc-reliquary/skull-toggle.png";
const PACK = { mire: "covenants_of_the_mire", veil: "distillers_of_the_veil" } as const;
const DLC_DEBUG_TUNING: Record<DebugKey, Tuning> = {
  mireSkull: { x: 93, y: -59.5, scale: 1.75 },
  veilSkull: { x: -8, y: -58.5, scale: 1.75 },
  mireMirror: { x: 18, y: -20, scale: 1.2 },
  veilMirror: { x: -1.5, y: -20, scale: 1.2 },
  sealedText: { x: -22, y: 386, scale: 1.4 },
  eyeGlow: { x: 38.5, y: 42.4, scale: 1 },
};

export function DlcScreen({ enabledPacks, activationAvailable = true, onToggle, onBack }: DlcScreenProps) {
  const t = useTranslation();
  const [selected, setSelected] = React.useState<ChronicleId | null>(null);
  const tuning = DLC_DEBUG_TUNING;
  React.useEffect(() => {
    const key = (event: KeyboardEvent) => { if (event.key === "Escape") selected ? setSelected(null) : onBack(); };
    window.addEventListener("keydown", key); return () => window.removeEventListener("keydown", key);
  }, [onBack, selected]);
  const enabled = (id: ChronicleId) => enabledPacks.includes(PACK[id]);

  return <main className={`dlc-screen${selected ? " is-reading" : ""}`} aria-labelledby="dlc-title">
    <style>{css}</style><MenuRoomBackground room="dlc" /><div className="dlc-atmosphere" aria-hidden="true" />
    {!selected && <header className="dlc-heading"><div>✦ ◈ ✦</div><h1 id="dlc-title">{t.dlc.title}</h1><p>{t.dlc.subtitle}</p></header>}
    <section className="dlc-reliquary" aria-label={t.menu.dlcs}>
      <Reliquary id="mire" title={t.dlc.mire.title} tagline={t.dlc.mire.tagline} enabled={enabled("mire")} activationAvailable={activationAvailable} enableLabel={t.dlc.enable} disableLabel={t.dlc.disable} skullTuning={tuning.mireSkull} mirrorTuning={tuning.mireMirror} eyeTuning={tuning.eyeGlow} onInspect={() => setSelected("mire")} onToggle={() => onToggle(PACK.mire)} />
      <Reliquary id="veil" title={t.dlc.veil.title} tagline={t.dlc.veil.tagline} enabled={enabled("veil")} activationAvailable={activationAvailable} enableLabel={t.dlc.enable} disableLabel={t.dlc.disable} skullTuning={tuning.veilSkull} mirrorTuning={tuning.veilMirror} eyeTuning={tuning.eyeGlow} onInspect={() => setSelected("veil")} onToggle={() => onToggle(PACK.veil)} />
      <div className="dlc-sealed" style={{ "--dx": `${tuning.sealedText.x}%`, "--dy": `${tuning.sealedText.y}%`, "--scale": tuning.sealedText.scale } as React.CSSProperties} aria-label="Sealed Chronicle"><span>SEALED</span><strong>THE THIRD CHRONICLE</strong></div>
    </section>
    {selected && <ChronicleDetail id={selected} copy={selected === "mire" ? t.dlc.mire : t.dlc.veil} onClose={() => setSelected(null)} />}
    <button type="button" className="dlc-back ashen-route-button" onClick={selected ? () => setSelected(null) : onBack}>← {selected ? t.dlc.returnToReliquary : t.dlc.backToMenu}</button>
  </main>;
}

function Reliquary({ id, title, tagline, enabled, activationAvailable, enableLabel, disableLabel, skullTuning, mirrorTuning, eyeTuning, onInspect, onToggle }: { id: ChronicleId; title: string; tagline: string; enabled: boolean; activationAvailable: boolean; enableLabel: string; disableLabel: string; skullTuning: Tuning; mirrorTuning: Tuning; eyeTuning: Tuning; onInspect: () => void; onToggle: () => void; }) {
  const mirrorStyle = { "--dx": `${mirrorTuning.x}%`, "--dy": `${mirrorTuning.y}%`, "--scale": mirrorTuning.scale } as React.CSSProperties;
  const skullStyle = { "--dx": `${skullTuning.x}%`, "--dy": `${skullTuning.y}%`, "--scale": skullTuning.scale, "--eye-inset": `${eyeTuning.x}%`, "--eye-y": `${eyeTuning.y}%`, "--eye-scale": eyeTuning.scale } as React.CSSProperties;
  return <div className={`dlc-slot dlc-${id}${enabled ? " is-enabled" : ""}`}>
    <button type="button" className="dlc-portal" style={mirrorStyle} onClick={onInspect} aria-label={title}>
      <span className="dlc-portal-label"><strong>{title}</strong><em>{tagline}</em><small>ENTER CHRONICLE</small></span>
    </button>
    <button type="button" className="dlc-skull" style={skullStyle} aria-label={activationAvailable ? `${enabled ? disableLabel : enableLabel}: ${title}` : `DLC activation unavailable: ${title}`} aria-pressed={enabled} disabled={!activationAvailable} onClick={onToggle}>
      <img src={SKULL_ART} alt="" draggable={false} /><i className="eye eye-left" /><i className="eye eye-right" /><span>{activationAvailable ? (enabled ? "BOUND" : "AWAKEN") : "SEALED"}</span>
    </button>
  </div>;
}

function ChronicleDetail({ id, copy, onClose }: { id: ChronicleId; copy: ReturnType<typeof useTranslation>["dlc"]["mire"]; onClose: () => void; }) {
  return <section className={`dlc-chronicle chronicle-${id}`} aria-labelledby="chronicle-title">
    <button type="button" className="dlc-detail-close" onClick={onClose} aria-label="Close chronicle">×</button>
    <div className="detail-kicker">FORBIDDEN CHRONICLE</div><h2 id="chronicle-title">{copy.title}</h2><p className="detail-tagline">{copy.tagline}</p><p className="detail-summary">{copy.summary}</p>
    <h3>WHAT IT ADDS</h3><ul>{copy.features.map(feature => <li key={feature}>{feature}</li>)}</ul><h3>CHRONICLE</h3>{copy.story.map(paragraph => <p className="dlc-story" key={paragraph}>{paragraph}</p>)}
  </section>;
}

const css = `
.dlc-screen{min-height:100vh;position:relative;overflow:hidden;color:#ead9ba;background:#03070a;isolation:isolate}.dlc-atmosphere{position:fixed;inset:0;z-index:1;pointer-events:none;background:linear-gradient(180deg,rgba(1,2,4,.64),transparent 27%,transparent 73%,rgba(2,1,5,.78)),radial-gradient(circle at 50% 53%,transparent 20%,rgba(0,0,0,.18) 74%)}
.dlc-heading{position:fixed;z-index:8;top:clamp(18px,3vh,42px);left:50%;transform:translateX(-50%);width:min(760px,88vw);text-align:center;pointer-events:none;text-shadow:0 3px 18px #000}.dlc-heading div{color:#9c55cf;letter-spacing:12px;font-size:20px}.dlc-heading h1{margin:2px 0;color:#e1bc73;font:400 clamp(30px,3.2vw,52px)/1.05 Georgia,serif}.dlc-heading p{margin:8px 0;color:#c9b994;font:11px/1.5 monospace;letter-spacing:2px;text-transform:uppercase}
.dlc-reliquary{position:fixed;z-index:4;left:50%;top:50%;width:max(100vw,177.7778vh);height:max(100vh,56.25vw);transform:translate(-50%,-50%)}.dlc-slot{position:absolute;top:12.5%;width:28.5%;height:73%;transition:opacity .35s}.dlc-mire{left:2.6%}.dlc-veil{left:35.9%}.dlc-portal{position:absolute;left:50%;top:49%;width:76%;height:86%;border:0;padding:0;background:transparent;cursor:pointer;color:inherit;transform:translate(calc(-50% + var(--dx)),calc(-50% + var(--dy))) scale(var(--scale));transform-origin:center}.dlc-portal:focus-visible{outline:none}
.dlc-portal-label{position:absolute;left:50%;bottom:8%;transform:translate(-50%,8px);width:92%;text-align:center;opacity:0;transition:.22s;text-shadow:0 2px 10px #000,0 0 18px #000}.dlc-portal:hover .dlc-portal-label,.dlc-portal:focus-visible .dlc-portal-label{opacity:1;transform:translate(-50%,0)}.dlc-portal-label strong{display:block;color:#f0d59d;font:400 clamp(18px,1.7vw,29px)/1.15 Georgia,serif}.dlc-portal-label em{display:block;margin:5px 0 10px;color:#d0c0a1;font:italic 13px/1.25 Georgia,serif}.dlc-portal-label small{color:#ddba73;font:9px monospace;letter-spacing:2px}
.dlc-skull{position:absolute;z-index:6;left:50%;bottom:-2%;width:clamp(66px,7vw,112px);aspect-ratio:1;transform:translate(calc(-50% + var(--dx)),var(--dy)) scale(var(--scale));transform-origin:center;padding:0;border:0;background:transparent;cursor:pointer}.dlc-skull img{width:100%;height:100%;object-fit:contain;filter:brightness(.72) drop-shadow(0 7px 9px #000);transition:.2s}.dlc-skull:hover img,.dlc-skull:focus-visible img{filter:brightness(1.12) drop-shadow(0 0 12px #eec2689e)}.dlc-skull:focus-visible{outline:none}.eye{position:absolute;top:var(--eye-y);width:calc(7.4% * var(--eye-scale));aspect-ratio:1.2;border-radius:50%;opacity:0;background:#ff1608;box-shadow:0 0 7px 3px #f21b0b,0 0 18px 7px #f41608b8;transition:.25s;pointer-events:none}.eye-left{left:var(--eye-inset);transform:rotate(8deg)}.eye-right{right:var(--eye-inset);transform:rotate(-8deg)}.is-enabled .eye{opacity:.95;animation:eye-pulse 2.8s ease-in-out infinite}.is-enabled .dlc-skull img{filter:brightness(.98) drop-shadow(0 0 13px #a5120875)}.dlc-skull>span{position:absolute;top:100%;left:50%;transform:translate(-50%,-5px);color:#b49b70;font:8px monospace;letter-spacing:2px;opacity:0;white-space:nowrap;text-shadow:0 2px 7px #000;transition:.2s}.dlc-skull:hover span,.dlc-skull:focus-visible span,.is-enabled .dlc-skull span{opacity:1;transform:translate(-50%,1px)}.is-enabled .dlc-skull span{color:#e45b48}@keyframes eye-pulse{50%{filter:brightness(1.5)}}
.dlc-skull:disabled{cursor:not-allowed}.dlc-skull:disabled img{filter:grayscale(.72) brightness(.48) drop-shadow(0 7px 9px #000)}.dlc-skull:disabled:hover img{filter:grayscale(.72) brightness(.55) drop-shadow(0 7px 9px #000)}.dlc-skull:disabled>span{opacity:1;color:#9b8b78;transform:translate(-50%,1px)}
.dlc-sealed{position:absolute;left:71.2%;top:37%;width:25%;transform:translate(var(--dx),var(--dy)) scale(var(--scale));transform-origin:center;text-align:center;color:#aeb4b9;opacity:.96;text-shadow:0 2px 10px #000,0 0 16px #000;pointer-events:none}.dlc-sealed span{display:block;color:#b9685f;font:700 9px monospace;letter-spacing:5px;text-shadow:0 0 8px #4d0505,0 2px 8px #000}.dlc-sealed strong{display:block;margin-top:8px;color:#b9b3a8;font:400 clamp(15px,1.4vw,22px) Georgia,serif;letter-spacing:1px;text-shadow:0 2px 8px #000,0 0 18px #050505}
.dlc-screen.is-reading .dlc-atmosphere{z-index:9;background:linear-gradient(90deg,#01030580,#020307ed 48%,#020307fa);backdrop-filter:blur(3px)}.dlc-screen.is-reading .dlc-reliquary{z-index:10}.dlc-screen.is-reading .dlc-slot,.dlc-screen.is-reading .dlc-sealed{opacity:0;pointer-events:none}.dlc-chronicle{position:fixed;z-index:12;top:8%;right:6%;width:min(660px,48vw);max-height:80vh;overflow-y:auto;padding:14px 22px 28px 8px;scrollbar-color:#66502d transparent;color:#d8c9af;text-shadow:0 2px 10px #000}.dlc-detail-close{position:absolute;right:6px;top:4px;border:0;background:transparent;color:#ba9b62;font:32px Georgia;cursor:pointer}.detail-kicker,.dlc-chronicle h3{color:#bc9959;font:10px monospace;letter-spacing:3px}.dlc-chronicle h2{margin:8px 44px 0 0;color:#efd49e;font:400 clamp(34px,4vw,58px)/1 Georgia,serif}.detail-tagline{margin:9px 0 22px;color:#baa7c5;font:italic 18px Georgia}.detail-summary{color:#eadfc9;font:18px/1.65 Georgia}.dlc-chronicle h3{margin:27px 0 10px;padding-bottom:7px;border-bottom:1px solid #bc995957}.dlc-chronicle ul{padding-left:20px;display:grid;gap:8px;line-height:1.5}.dlc-chronicle li::marker{color:#b89352}.dlc-story{color:#c6b9a7;font:16px/1.72 Georgia}
.dlc-back{position:fixed;z-index:14;left:clamp(18px,3vw,46px);bottom:clamp(18px,3vh,38px);min-height:42px;padding:10px 18px;border:1px solid #c9a86c7a;border-radius:5px;background:#05030ab8;color:#d0af70;font:11px monospace;letter-spacing:1px;cursor:pointer;backdrop-filter:blur(6px)}.dlc-back:hover{color:#f1d79f;border-color:#d8b36a;box-shadow:0 0 18px #c5923729}
@media(max-width:760px){.dlc-heading{top:16px}.dlc-chronicle{top:6%;left:7%;right:7%;width:auto;max-height:79vh}}@media(prefers-reduced-motion:reduce){.eye,.dlc-portal img,.dlc-skull img{animation:none!important;transition:none!important}}
`;
