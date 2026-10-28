import React, { useRef } from "react";
import type { Token } from "../game/tokenTypes";
import { getTokenVisual } from "../pixi/tokenVisuals";
import { useFocusTrap } from "./useFocusTrap";
import { CORE_INGREDIENT_ASSETS } from "../assets/coreAssets";
import { MIREWROUGHT_ASSETS } from "../assets/mirewroughtAssets";

interface Props { tokens: Token[]; onChoose: (tokenId: string) => void; }

export function ScryChoicePanel({ tokens, onChoose }: Props) {
  const panelRef = useRef<HTMLElement>(null);
  useFocusTrap(true, panelRef);
  return <div className="scry-veil" role="presentation">
    <section ref={panelRef} className="scry-panel" role="dialog" aria-modal="true" aria-labelledby="scry-heading">
      <span className="scry-kicker">ONE GLIMPSE · ONE PRICE</span>
      <h2 id="scry-heading">The Bag Answers Twice</h2>
      <p>Choose one token to bind as your next draw. The other returns unseen to the bag. The glimpse costs one ruby.</p>
      <div className="scry-candidates">
        {tokens.map((token) => { const visual = getTokenVisual(token.color); const accent = `#${visual.border.toString(16).padStart(6, "0")}`; const image = token.color === "echo" ? MIREWROUGHT_ASSETS.echoReed : CORE_INGREDIENT_ASSETS[token.color]; return <button key={token.id} onClick={() => onChoose(token.id)} style={{ "--scry-accent": accent } as React.CSSProperties}>
          <img src={image} alt="" /><strong>{visual.label}</strong><span>Value {token.value}</span><em>Bind this draw</em>
        </button>; })}
      </div>
      <small>The chosen token is revealed; every later draw remains hidden.</small>
    </section>
    <style>{`
      .scry-veil{position:fixed;inset:0;z-index:134;display:grid;place-items:center;padding:28px;background:radial-gradient(circle at 50% 45%,rgba(26,102,104,.28),rgba(0,5,9,.92) 60%);backdrop-filter:blur(10px)}
      .scry-panel{width:min(820px,92vw);padding:40px;border:1px solid rgba(100,220,216,.55);background:linear-gradient(145deg,rgba(2,22,27,.98),rgba(3,10,18,.99));box-shadow:0 30px 100px #000;text-align:center;color:#d9d0c1}.scry-kicker{color:#72d7d1;font:700 12px/1 monospace;letter-spacing:.24em}.scry-panel h2{margin:12px 0 8px;color:#e5bc63;font:500 42px/1.08 Georgia,serif}.scry-panel>p{max-width:650px;margin:0 auto 28px;color:#cabfad;font:italic 18px/1.5 Georgia,serif}.scry-candidates{display:grid;grid-template-columns:repeat(2,1fr);gap:18px}.scry-candidates button{display:flex;min-height:270px;flex-direction:column;align-items:center;justify-content:center;border:1px solid color-mix(in srgb,var(--scry-accent) 55%,#31545b);background:radial-gradient(circle,color-mix(in srgb,var(--scry-accent) 14%,#05141a),#020a10 72%);color:#e1d5bf;cursor:pointer;transition:.2s}.scry-candidates button:hover,.scry-candidates button:focus-visible{transform:translateY(-4px);border-color:var(--scry-accent);box-shadow:0 0 28px color-mix(in srgb,var(--scry-accent) 24%,transparent);outline:none}.scry-candidates img{width:112px;height:112px;object-fit:contain;filter:drop-shadow(0 0 18px var(--scry-accent))}.scry-candidates strong{margin-top:12px;color:#f0d69a;font:500 24px/1.1 Georgia,serif}.scry-candidates span{margin-top:5px;color:#a9e6df;font:13px/1 monospace}.scry-candidates em{margin-top:18px;color:#d7c9ae;font:italic 15px/1 Georgia,serif}.scry-panel>small{display:block;margin-top:24px;color:#8ca5a4;font:12px/1.4 monospace}@media(max-width:620px){.scry-panel{padding:24px}.scry-panel h2{font-size:32px}.scry-candidates{grid-template-columns:1fr}.scry-candidates button{min-height:190px}.scry-candidates img{width:82px;height:82px}}@media(prefers-reduced-motion:reduce){.scry-candidates button{transition:none}}
    `}</style>
  </div>;
}
