import { useEffect, useRef, type CSSProperties } from "react";
import { BREWING_INTENTIONS, type BrewingIntentionId } from "../game/brewingIntentions";
import { useFocusTrap } from "./useFocusTrap";
import { objectiveForRound } from "../game/roundObjectives";

interface BrewingIntentionPanelProps {
  round: number;
  onChoose: (id: BrewingIntentionId) => void;
}

const INTENTION_ART: Record<BrewingIntentionId, string> = {
  temper: "/images/core/ui/intentions/intention-temper-the-crucible.webp",
  court: "/images/core/ui/intentions/intention-court-the-omen.webp",
  glory: "/images/core/ui/intentions/intention-brew-for-glory.webp",
};

export function BrewingIntentionPanel({ round, onChoose }: BrewingIntentionPanelProps) {
  const objective = objectiveForRound(round);
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(true, panelRef);

  useEffect(() => {
    panelRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
  }, []);

  return (
    <div className="intention-veil" role="presentation">
      <section ref={panelRef} className="intention-panel" role="dialog" aria-modal="true" aria-labelledby="intention-heading">
        <header>
          <span>ROUND {round} · DECLARE YOUR PURPOSE</span>
          <h2 id="intention-heading">How Will You Enter the Crucible?</h2>
          <p>Choose one benefit and accept its price. The vow lasts for this round only.</p>
          <aside className="round-objective" style={{ "--objective-accent": objective.accent } as CSSProperties}>
            <span>Round objective · optional</span>
            <b>{objective.title}</b>
            <p>{objective.instruction}</p>
            <strong>Reward: {objective.reward}</strong>
          </aside>
        </header>
        <div className="intention-grid">
          {BREWING_INTENTIONS.map((intention) => (
            <button
              key={intention.id}
              type="button"
              style={{ "--intention-accent": intention.accent } as CSSProperties}
              onClick={() => onChoose(intention.id)}
            >
              <span className="intention-art" aria-hidden="true">
                <img src={INTENTION_ART[intention.id]} alt="" />
              </span>
              <h3>{intention.title}</h3>
              <em>{intention.vow}</em>
              <dl>
                <div><dt>Promise</dt><dd>{intention.benefit}</dd></div>
                <div><dt>Price</dt><dd>{intention.cost}</dd></div>
              </dl>
              <strong>Bind this intention</strong>
            </button>
          ))}
        </div>
      </section>
      <style>{`
        .intention-veil{position:fixed;inset:0;z-index:132;display:grid;place-items:center;padding:32px;background:radial-gradient(circle at 50% 42%,rgba(16,61,66,.32),rgba(0,5,9,.9) 62%),rgba(0,4,8,.82);backdrop-filter:blur(9px)}
        .intention-panel{width:min(1320px,96vw);padding:clamp(24px,2.5vw,42px);border:1px solid rgba(91,207,211,.45);background:linear-gradient(145deg,rgba(2,18,23,.98),rgba(4,10,17,.98) 60%,rgba(19,11,24,.98));box-shadow:0 32px 100px #000,inset 0 1px rgba(220,255,249,.06);color:#e8dfce}
        .intention-panel>header{text-align:center;max-width:900px;margin:0 auto 22px}.intention-panel>header span{font:700 12px/1.2 monospace;letter-spacing:.28em;color:#78d6d1}.intention-panel h2{margin:8px 0 6px;color:#e4b85e;font:500 clamp(32px,3.2vw,52px)/1.05 Georgia,serif}.intention-panel>header>p{margin:0;color:#c7bcaa;font:italic 18px/1.5 Georgia,serif}.round-objective{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:6px 18px;margin:18px auto 0;padding:13px 18px;border:1px solid color-mix(in srgb,var(--objective-accent) 48%,#25353b);background:linear-gradient(90deg,color-mix(in srgb,var(--objective-accent) 10%,rgba(2,12,17,.9)),rgba(2,10,15,.9));text-align:left}.round-objective span{grid-row:1/3;font-size:10px!important;writing-mode:vertical-rl}.round-objective b{color:var(--objective-accent);font:600 20px/1.2 Georgia,serif}.round-objective p{margin:0!important;color:#dfd5c5!important;font:15px/1.35 Georgia,serif!important}.round-objective strong{grid-column:3;grid-row:1/3;color:#e8cc8c;font:700 11px/1.3 monospace;letter-spacing:.08em;text-transform:uppercase}
        .intention-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.intention-grid>button{position:relative;display:flex;min-height:530px;flex-direction:column;align-items:center;overflow:hidden;padding:18px 24px 24px;border:1px solid color-mix(in srgb,var(--intention-accent) 50%,#23343b);background:radial-gradient(circle at 50% 22%,color-mix(in srgb,var(--intention-accent) 13%,transparent),transparent 37%),linear-gradient(180deg,color-mix(in srgb,var(--intention-accent) 7%,rgba(2,12,17,.98)),rgba(1,8,13,.98));color:#ded5c6;text-align:center;cursor:pointer;transition:transform .2s ease,border-color .2s ease,box-shadow .2s ease}.intention-grid>button:hover,.intention-grid>button:focus-visible{transform:translateY(-5px);border-color:var(--intention-accent);box-shadow:0 18px 42px rgba(0,0,0,.5),0 0 28px color-mix(in srgb,var(--intention-accent) 20%,transparent);outline:none}.intention-art{display:grid;width:100%;height:178px;place-items:center;border-bottom:1px solid color-mix(in srgb,var(--intention-accent) 24%,transparent)}.intention-art img{width:190px;height:174px;object-fit:contain;filter:drop-shadow(0 14px 18px #000) drop-shadow(0 0 18px color-mix(in srgb,var(--intention-accent) 30%,transparent));transition:transform .25s ease,filter .25s ease}.intention-grid>button:hover .intention-art img,.intention-grid>button:focus-visible .intention-art img{transform:scale(1.045);filter:drop-shadow(0 15px 20px #000) drop-shadow(0 0 26px color-mix(in srgb,var(--intention-accent) 48%,transparent))}.intention-grid h3{margin:16px 0 7px;color:var(--intention-accent);font:500 28px/1.1 Georgia,serif}.intention-grid em{min-height:44px;color:#c5b9a6;font:italic 16px/1.4 Georgia,serif}.intention-grid dl{display:grid;gap:10px;width:100%;margin:15px 0;text-align:left}.intention-grid dl div{padding:11px 13px;border-left:2px solid color-mix(in srgb,var(--intention-accent) 65%,transparent);background:rgba(255,255,255,.028)}.intention-grid dt{margin-bottom:4px;color:var(--intention-accent);font:700 11px/1 monospace;letter-spacing:.18em;text-transform:uppercase}.intention-grid dd{margin:0;color:#e1d8c9;font:16px/1.4 Georgia,serif}.intention-grid strong{margin-top:auto;color:#eed9a1;font:700 12px/1 monospace;letter-spacing:.13em;text-transform:uppercase}
        @media(max-width:850px){.intention-veil{align-items:start;overflow:auto;padding:18px}.intention-grid{grid-template-columns:1fr}.intention-grid>button{min-height:0}.intention-art{height:160px}.intention-art img{height:154px}.intention-panel{padding:24px}.intention-panel>header>p{font-size:16px}.round-objective{grid-template-columns:1fr;text-align:center}.round-objective span,.round-objective b,.round-objective p,.round-objective strong{grid-column:1;grid-row:auto;writing-mode:horizontal-tb}}
        @media(prefers-reduced-motion:reduce){.intention-grid>button{transition:none}}
      `}</style>
    </div>
  );
}
