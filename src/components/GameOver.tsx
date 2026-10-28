import React from "react";
import type { Player } from "../game/playerTypes";
import type { AIDifficulty } from "../game/aiStrategy";
import type { GameSetup } from "../game/contentPacks";
import {
  ACHIEVEMENTS,
  CHALLENGES,
  createMatchRecord,
  recordCompletedMatchProgression,
  type MatchProgression,
  type MatchRecord,
  type RitualSession,
} from "../game/replayability";
import type { ChroniclePage } from "./ChronicleScreen";
import type { RecipeBooks } from "../game/recipeBooks";

interface GameOverProps {
  players: Player[];
  winners: Player[];
  onRestart: () => void;
  onReturnToMenu: () => void;
  onOpenChronicle: (page: ChroniclePage) => void;
  session: RitualSession;
  setup: GameSetup;
  difficulty: AIDifficulty;
  recipeBooks: RecipeBooks;
}

interface SealedResult {
  record: MatchRecord;
  progression: MatchProgression;
}

export function GameOver({ players, winners, onRestart, onReturnToMenu, onOpenChronicle, session, setup, difficulty, recipeBooks }: GameOverProps) {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const humanWon = winners.some((player) => player.kind === "human");
  const winnerIds = new Set(winners.map((player) => player.id));
  const [sealed, setSealed] = React.useState<SealedResult | null>(null);
  const [reveal, setReveal] = React.useState(0);
  const recorded = React.useRef(false);

  React.useEffect(() => {
    if (recorded.current) return;
    recorded.current = true;
    const record = createMatchRecord(session, setup, difficulty, players, winners.map((player) => player.id), new Date(), recipeBooks);
    setSealed({ record, progression: recordCompletedMatchProgression(record) });
  }, [difficulty, players, recipeBooks, session, setup, winners]);

  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReveal(3);
      return;
    }
    const timers = [
      window.setTimeout(() => setReveal(1), 320),
      window.setTimeout(() => setReveal(2), 980),
      window.setTimeout(() => setReveal(3), 1650),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, []);

  const record = sealed?.record;
  const progression = sealed?.progression;
  const newHonors = ACHIEVEMENTS.filter((honor) => progression?.newlyUnlockedAchievementIds.includes(honor.id));
  const challenge = CHALLENGES.find((entry) => entry.id === record?.challengeId);
  const newBest = Boolean(record && progression && record.prestige > progression.previousBestPrestige);

  return (
    <div className="ending-veil" role="dialog" aria-modal="true" aria-labelledby="ending-title">
      <style>{endingCss}</style>
      <div className={`ending-sigil ${humanWon ? "is-victory" : "is-defeat"}`} aria-hidden="true" />
      <section className={`ending-record reveal-${reveal}`}>
        <header className="ending-header">
          <span>✦ THE NINTH OMEN IS SEALED ✦</span>
          <h1 id="ending-title">{humanWon ? "The Crucible Remembers" : "The Ashen Record Endures"}</h1>
          <p>{humanWon ? "Your name survives the final bell, written where smoke cannot erase it." : "The rite is lost, but its scars have entered the Chronicle."}</p>
          <div className="ending-verdict">{humanWon ? "VICTORY" : "DEFEAT"}</div>
        </header>

        <div className="ending-body">
          <div className="ending-ranks" aria-label="Final standings">
            <h2>Final Reckoning</h2>
            {sorted.map((player, index) => (
              <div className={`ending-rank${player.kind === "human" ? " is-human" : ""}${winnerIds.has(player.id) ? " is-winner" : ""}`} key={player.id} style={{ "--rank-delay": `${index * 90}ms` } as React.CSSProperties}>
                <b>{roman(index + 1)}</b>
                <span>{player.name}<small>{player.kind === "human" ? "YOU" : "RIVAL"}</small></span>
                <strong>{player.score}<small>PRESTIGE</small></strong>
              </div>
            ))}
          </div>

          <aside className="ending-progression" aria-live="polite">
            <h2>Sealed in the Chronicle</h2>
            {record ? (
              <>
                <div className="ending-metrics">
                  <Metric value={`${record.placement}${ordinal(record.placement)}`} label="Final Place" />
                  <Metric value={record.prestige} label="Prestige" />
                  <Metric value={signed(record.scoreMargin)} label="Rival Margin" />
                </div>
                <div className="ending-inscriptions">
                  {newBest && <span>◆ New Prestige record</span>}
                  {challenge && record.trialSucceeded && <span>◆ Trial sealed: {challenge.title}</span>}
                  {challenge && record.trialMastered && <span>◆ Mastery achieved: {challenge.mastery}</span>}
                  {challenge && !record.trialSucceeded && <span>◆ Trial attempted: its objective remains unsealed</span>}
                  {record.mode === "daily" && <span>◆ Daily Omen answered</span>}
                  {record.mode === "weekly" && <span>◆ This week’s Turning Trial answered</span>}
                  {!newBest && !challenge && record.mode !== "daily" && record.mode !== "weekly" && <span>◆ {record.mode === "ashenveil" ? "Ashenveil Ritual" : "Ritual"} entered into the Ashen Record</span>}
                </div>
                {newHonors.length > 0 && (
                  <div className="ending-honors">
                    <em>HONOR UNSEALED</em>
                    {newHonors.map((honor) => (
                      <article key={honor.id}>
                        <i>✦</i>
                        <div><b>{honor.title}</b><span>Title: {honor.titleReward}</span></div>
                      </article>
                    ))}
                  </div>
                )}
              </>
            ) : <p className="ending-writing">The Chronicle is receiving your mark…</p>}
          </aside>
        </div>

        <footer className="ending-actions">
          <button className="ashen-route-button primary" onClick={onRestart}>Brew Again</button>
          <button className="ashen-route-button" onClick={() => onOpenChronicle("trials")}>Named Trials</button>
          <button className="ashen-route-button" onClick={() => onOpenChronicle(newHonors.length ? "honors" : "record")}>Open Chronicle</button>
          <button className="ending-hall" onClick={onReturnToMenu}>Return to the Hall</button>
        </footer>
      </section>
    </div>
  );
}

function Metric({ value, label }: { value: React.ReactNode; label: string }) { return <div><strong>{value}</strong><span>{label}</span></div>; }
function roman(value: number) { return ["I", "II", "III", "IV", "V"][value - 1] ?? String(value); }
function ordinal(value: number) { return value === 1 ? "st" : value === 2 ? "nd" : value === 3 ? "rd" : "th"; }
function signed(value: number) { return value > 0 ? `+${value}` : String(value); }

const endingCss = `
.ending-veil{position:fixed;inset:0;z-index:220;display:grid;place-items:center;overflow:auto;padding:clamp(18px,3vw,46px);color:#d8c7a4;background:radial-gradient(circle at 50% 48%,rgba(7,45,49,.55),rgba(1,6,9,.88) 48%,rgba(0,2,4,.97));backdrop-filter:blur(9px)}
.ending-sigil{position:fixed;width:min(76vw,900px);aspect-ratio:1;border:1px solid rgba(83,195,196,.1);border-radius:50%;opacity:.42;animation:ending-turn 28s linear infinite;pointer-events:none}.ending-sigil:before,.ending-sigil:after{content:"";position:absolute;inset:9%;border:1px dashed rgba(213,171,79,.13);border-radius:50%}.ending-sigil:after{inset:22%;border-style:solid;box-shadow:0 0 90px rgba(53,179,182,.08)}
.ending-record{position:relative;width:min(1220px,96vw);padding:clamp(25px,3.2vw,48px);border:1px solid rgba(84,186,188,.4);background:linear-gradient(145deg,rgba(2,15,18,.96),rgba(5,8,14,.97));box-shadow:0 30px 110px #000,inset 0 0 100px rgba(40,132,137,.06);opacity:0;transform:translateY(18px);transition:opacity .65s,transform .65s}.reveal-1,.reveal-2,.reveal-3{opacity:1;transform:none}.ending-record:before,.ending-record:after{content:"◆";position:absolute;color:#d5aa50;text-shadow:0 0 15px #55c5c8}.ending-record:before{top:14px;left:17px}.ending-record:after{right:17px;bottom:14px}
.ending-header{text-align:center}.ending-header>span{color:#6fc7c6;font:12px monospace;letter-spacing:4px}.ending-header h1{margin:10px 0 7px;color:#e2bd6c;font:clamp(36px,4.2vw,62px) Georgia,serif;font-weight:400;letter-spacing:1.5px}.ending-header p{color:#b5a78f;font:italic clamp(16px,1.35vw,20px)/1.5 Georgia,serif}.ending-verdict{display:inline-block;margin-top:16px;padding:7px 30px;border-block:1px solid rgba(221,181,91,.32);color:#e0bd70;font:13px monospace;letter-spacing:5px;text-shadow:0 0 18px rgba(225,180,82,.3)}
.ending-body{display:grid;grid-template-columns:1.08fr .92fr;gap:22px;margin-top:27px}.ending-body h2{margin:0 0 13px;color:#d8bd82;font:25px Georgia,serif;font-weight:400}.ending-ranks,.ending-progression{padding:21px;border:1px solid rgba(91,177,180,.2);background:rgba(0,7,10,.54)}
.ending-rank{display:grid;grid-template-columns:42px 1fr auto;align-items:center;gap:13px;padding:10px 13px;border-bottom:1px solid rgba(97,180,181,.12);opacity:0;transform:translateX(-10px);transition:opacity .4s calc(var(--rank-delay) + .1s),transform .4s calc(var(--rank-delay) + .1s)}.reveal-2 .ending-rank,.reveal-3 .ending-rank{opacity:1;transform:none}.ending-rank>b{color:#65999b;font:17px Georgia,serif}.ending-rank>span{color:#cdbb98;font:18px Georgia,serif}.ending-rank small{display:block;margin-top:3px;color:#668b8d;font:9px monospace;letter-spacing:1.5px}.ending-rank>strong{color:#dcb967;font:27px Georgia,serif;text-align:right}.ending-rank.is-human{background:linear-gradient(90deg,rgba(42,153,158,.13),transparent);box-shadow:inset 2px 0 #64c3c5}.ending-rank.is-winner>span{color:#f0d28d}
.ending-progression{opacity:0;transform:translateY(9px);transition:opacity .5s,transform .5s}.reveal-3 .ending-progression{opacity:1;transform:none}.ending-metrics{display:grid;grid-template-columns:repeat(3,1fr);border-block:1px solid rgba(208,166,77,.2)}.ending-metrics>div{padding:13px 5px;text-align:center;border-right:1px solid rgba(208,166,77,.13)}.ending-metrics strong{display:block;color:#e0bd69;font:28px Georgia,serif}.ending-metrics span{display:block;margin-top:4px;color:#6fa7a8;font:10px monospace;letter-spacing:1px;text-transform:uppercase}.ending-inscriptions{display:grid;gap:7px;margin:15px 0;color:#b9ac92;font:15px/1.4 Georgia,serif}.ending-honors{margin-top:15px;padding:13px;border:1px solid rgba(217,176,81,.35);background:linear-gradient(90deg,rgba(125,81,19,.12),rgba(25,103,107,.1))}.ending-honors>em{color:#6fc7c6;font:10px monospace;letter-spacing:2px;font-style:normal}.ending-honors article{display:flex;align-items:center;gap:12px;margin-top:9px}.ending-honors i{color:#e3bd63;font-size:22px}.ending-honors b,.ending-honors span{display:block}.ending-honors b{color:#ebcf8d;font:18px Georgia,serif}.ending-honors span{margin-top:3px;color:#8ea9a5;font:11px monospace}.ending-writing{color:#8f8779;font:italic 16px Georgia,serif}
.ending-actions{display:flex;justify-content:center;align-items:center;flex-wrap:wrap;gap:10px;margin-top:24px;opacity:0;transition:opacity .45s}.reveal-3 .ending-actions{opacity:1}.ending-actions .primary{border-color:rgba(100,205,205,.75)!important;box-shadow:0 0 22px rgba(60,190,192,.12)!important}.ending-hall{padding:12px 15px;border:0;background:transparent;color:#817765;font:11px monospace;letter-spacing:1.4px;text-transform:uppercase;cursor:pointer}.ending-hall:hover{color:#d4ba7d}
@keyframes ending-turn{to{transform:rotate(360deg)}}
@media(max-width:820px){.ending-body{grid-template-columns:1fr}.ending-record{width:100%}.ending-header h1{font-size:34px}.ending-actions .ashen-route-button{width:100%}.ending-hall{width:100%}}
@media(max-height:760px) and (min-width:821px){.ending-record{padding:22px 32px}.ending-header h1{font-size:38px}.ending-header p{font-size:15px}.ending-body{margin-top:17px}.ending-rank{padding:7px 11px}.ending-actions{margin-top:16px}}
@media(prefers-reduced-motion:reduce){.ending-sigil{animation:none}.ending-record,.ending-rank,.ending-progression,.ending-actions{transition:none}}
`;
