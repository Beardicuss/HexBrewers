import React from "react";
import {
  ACHIEVEMENTS,
  CHALLENGES,
  createWeeklyChallenge,
  loadChronicle,
  selectChronicleTitle,
  type ChallengeId,
  type Chronicle,
} from "../game/replayability";
import { MenuRoomBackground } from "./MenuRoomBackground";

interface Props {
  onBack: () => void;
  onStartChallenge: (id: ChallengeId) => void;
  onStartWeekly: () => void;
  initialPage?: ChroniclePage;
}
export type ChroniclePage = "record" | "trials" | "honors";

export function ChronicleScreen({ onBack, onStartChallenge, onStartWeekly, initialPage = "record" }: Props) {
  const [chronicle, setChronicle] = React.useState<Chronicle>(() =>
    loadChronicle(),
  );
  const [page, setPage] = React.useState<ChroniclePage>(initialPage);
  const winRate = chronicle.matchesPlayed
    ? Math.round((chronicle.victories / chronicle.matchesPlayed) * 100)
    : 0;
  const average = chronicle.matchesPlayed
    ? (chronicle.totalPrestige / chronicle.matchesPlayed).toFixed(1)
    : "—";
  const selectedTitle = ACHIEVEMENTS.find(
    (item) => item.id === chronicle.selectedTitleId,
  )?.titleReward;
  const weekly = React.useMemo(() => createWeeklyChallenge(), []);

  return (
    <main className="chronicle-screen">
      <style>{css}</style>
      <style>{chronicleReadabilityCss}</style>
      <MenuRoomBackground room="central" />
      <div className="chronicle-vignette" />
      <section className="chronicle-book" aria-labelledby="chronicle-title">
        <header>
          <span>✦ THE ASHEN RECORD ✦</span>
          <h1 id="chronicle-title">Brewer’s Chronicle</h1>
          <p>
            {selectedTitle
              ? `Recorded title: ${selectedTitle}`
              : "Every sealed crucible leaves a mark. No honor recorded here changes the laws of the ritual."}
          </p>
        </header>
        <nav className="chronicle-tabs" aria-label="Chronicle pages">
          <Tab active={page === "record"} onClick={() => setPage("record")}>
            Match Record
          </Tab>
          <Tab active={page === "trials"} onClick={() => setPage("trials")}>
            Named Trials
          </Tab>
          <Tab active={page === "honors"} onClick={() => setPage("honors")}>
            Honors & Titles
          </Tab>
        </nav>
        {page === "record" && (
          <>
            <div className="chronicle-ledger">
              <Stat label="Rituals sealed" value={chronicle.matchesPlayed} />
              <Stat label="Victories" value={chronicle.victories} />
              <Stat label="Victory rate" value={`${winRate}%`} />
              <Stat
                label="Highest prestige"
                value={chronicle.bestPrestige || "—"}
              />
              <Stat label="Average prestige" value={average} />
              <Stat label="Daily streak" value={chronicle.currentDailyStreak} />
            </div>
            <div className="chronicle-columns cadence-columns">
              <article>
                <h2>The Daily Omen</h2>
                <div className="daily-seals">
                  <b>{chronicle.dailyChallengesCompleted}</b>
                  <span>answered</span>
                  <b>{chronicle.dailyVictories}</b>
                  <span>conquered</span>
                  <b>{chronicle.bestDailyStreak}</b>
                  <span>best streak</span>
                </div>
                <p>
                  One shared, deterministic rite appears each day. Its complete
                  rules remain unchanged.
                </p>
              </article>
              <article>
                <h2>The Turning Trial</h2>
                <div className="daily-seals">
                  <b>{chronicle.weeklyChallengesCompleted}</b>
                  <span>answered</span>
                  <b>{chronicle.weeklyVictories}</b>
                  <span>conquered</span>
                  <b>{chronicle.bestWeeklyStreak}</b>
                  <span>best streak</span>
                </div>
                <p>A shared seal turns once each week. Every brewer receives the same rivals, recipe, and draw sequence.</p>
              </article>
              <article>
                <h2>Recent Rituals</h2>
                {chronicle.recentMatches.length === 0 ? (
                  <p>The parchment waits for your first completed brew.</p>
                ) : (
                  <ol>
                    {chronicle.recentMatches.slice(0, 6).map((match) => (
                      <li key={match.id}>
                        <span className={match.won ? "won" : "lost"}>
                          {match.won ? "VICTORY" : "DEFEAT"}
                        </span>
                        <strong>
                          {match.prestige} prestige · {match.placement}
                          {ordinal(match.placement)} place
                        </strong>
                        <small>
                          {match.mode === "daily"
                            ? "Daily Omen"
                            : match.mode === "weekly"
                              ? "Turning Trial"
                            : match.mode === "challenge"
                              ? "Named Trial"
                              : "Standard Ritual"}{" "}
                          · {match.recipe} · margin{" "}
                          {signed(match.scoreMargin ?? 0)}
                        </small>
                      </li>
                    ))}
                  </ol>
                )}
              </article>
            </div>
          </>
        )}
        {page === "trials" && (
          <>
          <article className="weekly-trial">
            <div>
              <span>✦ THIS WEEK’S TURNING SEAL · {weekly.session.weekKey} ✦</span>
              <h2>{weekly.title}</h2>
              <em>{weekly.epitaph}</em>
              <p>{weekly.description}</p>
            </div>
            <dl>
              <div><dt>Brewers</dt><dd>{weekly.setup.totalPlayers}</dd></div>
              <div><dt>Rivals</dt><dd>{weekly.difficulty}</dd></div>
              <div><dt>Recipe</dt><dd>Set {weekly.setup.recipeMode}</dd></div>
            </dl>
            <div className="weekly-progress">
              <b>{chronicle.currentWeeklyStreak}</b><span>current streak</span>
              <b>{chronicle.weeklyVictories}</b><span>victories</span>
            </div>
            <button className="ashen-route-button" onClick={onStartWeekly}>Answer This Week’s Trial</button>
          </article>
          <div className="trial-grid">
            {CHALLENGES.map((challenge) => {
              const attempts =
                  chronicle.challengeCompletions[challenge.id] ?? 0,
                wins = chronicle.challengeVictories[challenge.id] ?? 0;
              return (
                <article key={challenge.id}>
                  <span>{challenge.epitaph}</span>
                  <h2>{challenge.title}</h2>
                  <p>{challenge.description}</p>
                  <dl>
                    <div>
                      <dt>Brewers</dt>
                      <dd>{challenge.players}</dd>
                    </div>
                    <div>
                      <dt>Rivals</dt>
                      <dd>{challenge.difficulty}</dd>
                    </div>
                    <div>
                      <dt>Recipe</dt>
                      <dd>
                        {challenge.recipeMode === "random"
                          ? "Seeded random"
                          : `Set ${challenge.recipeMode}`}
                      </dd>
                    </div>
                  </dl>
                  <small>
                    {attempts} attempts · {wins} victories
                  </small>
                  <button
                    className="ashen-route-button"
                    onClick={() => onStartChallenge(challenge.id)}
                  >
                    Begin Trial
                  </button>
                </article>
              );
            })}
          </div>
          </>
        )}
        {page === "honors" && (
          <div className="honors-grid">
            {ACHIEVEMENTS.map((honor) => {
              const unlocked = chronicle.unlockedAchievementIds.includes(
                  honor.id,
                ),
                selected = chronicle.selectedTitleId === honor.id;
              return (
                <article
                  className={unlocked ? "unlocked" : "locked"}
                  key={honor.id}
                >
                  <i>{unlocked ? "✦" : "◇"}</i>
                  <h2>{honor.title}</h2>
                  <p>{honor.description}</p>
                  <strong>
                    {unlocked ? honor.titleReward : "Title remains veiled"}
                  </strong>
                  <button
                    disabled={!unlocked || selected}
                    onClick={() => setChronicle(selectChronicleTitle(honor.id))}
                  >
                    {selected
                      ? "Title Equipped"
                      : unlocked
                        ? "Equip Title"
                        : "Locked"}
                  </button>
                </article>
              );
            })}
          </div>
        )}
        <button className="ashen-route-button chronicle-back" onClick={onBack}>
          Return to the Hall
        </button>
      </section>
    </main>
  );
}

function Tab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button className={active ? "active" : ""} onClick={onClick}>
      {children}
    </button>
  );
}
function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}
function ordinal(value: number) {
  return value === 1 ? "st" : value === 2 ? "nd" : value === 3 ? "rd" : "th";
}
function signed(value: number) {
  return value > 0 ? `+${value}` : String(value);
}

const css = `
.chronicle-screen{min-height:100vh;position:relative;display:grid;place-items:center;overflow:auto;background:#020608;color:#d8c8aa;padding:clamp(20px,4vw,58px)}.chronicle-vignette{position:fixed;inset:0;z-index:1;pointer-events:none;background:radial-gradient(ellipse at 54% 44%,rgba(9,42,45,.24),rgba(1,4,7,.62) 70%,rgba(0,1,3,.94))}.chronicle-book{position:relative;z-index:2;width:min(1180px,95vw);padding:clamp(24px,3.6vw,54px);border:1px solid rgba(78,180,183,.38);background:linear-gradient(145deg,rgba(2,13,17,.95),rgba(5,8,14,.94));box-shadow:0 30px 100px #000,inset 0 0 90px rgba(29,103,109,.07)}.chronicle-book:before,.chronicle-book:after{content:'◆';position:absolute;color:#d3a94e;text-shadow:0 0 18px #54cbd0}.chronicle-book:before{left:16px;top:12px}.chronicle-book:after{right:16px;bottom:12px}.chronicle-book header{text-align:center;max-width:760px;margin:0 auto 22px}.chronicle-book header>span{font:11px monospace;letter-spacing:4px;color:#6dc7c8}.chronicle-book h1{margin:8px 0;color:#e0bb68;font:clamp(32px,4vw,54px) Georgia,serif;font-weight:400;letter-spacing:2px}.chronicle-book header p{font:italic clamp(14px,1.2vw,18px)/1.5 Georgia,serif;color:#b7a98f}.chronicle-tabs{display:flex;justify-content:center;gap:4px;margin:0 auto 24px;border-bottom:1px solid rgba(102,199,199,.18)}.chronicle-tabs button{padding:10px 22px;border:0;border-bottom:2px solid transparent;background:transparent;color:#7e796d;font:11px monospace;letter-spacing:1.4px;text-transform:uppercase;cursor:pointer}.chronicle-tabs button.active{color:#dfc078;border-color:#65bec4}.chronicle-ledger{display:grid;grid-template-columns:repeat(6,1fr);border-block:1px solid rgba(210,170,80,.2);margin-bottom:28px}.chronicle-ledger>div{padding:15px 8px;text-align:center;border-right:1px solid rgba(210,170,80,.14)}.chronicle-ledger strong{display:block;color:#dbb75e;font:27px Georgia,serif}.chronicle-ledger span{display:block;margin-top:5px;color:#70afb2;font:9px monospace;letter-spacing:1.3px;text-transform:uppercase}.chronicle-columns{display:grid;grid-template-columns:.8fr 1.2fr;gap:24px}.chronicle-columns article,.trial-grid article,.honors-grid article{padding:20px;border:1px solid rgba(84,160,164,.2);background:rgba(0,6,10,.54)}.chronicle-book h2{color:#d7bd80;font:23px Georgia,serif;font-weight:400;margin-bottom:13px}.chronicle-book p{font:14px/1.55 Georgia,serif;color:#aa9f8c}.daily-seals{display:grid;grid-template-columns:auto 1fr;gap:3px 11px;margin-bottom:12px}.daily-seals b{color:#73d0d0;font:21px Georgia,serif}.daily-seals span{align-self:center;color:#8f836e;font:9px monospace;text-transform:uppercase;letter-spacing:1px}.chronicle-columns ol{list-style:none;display:grid;gap:5px}.chronicle-columns li{display:grid;grid-template-columns:82px 1fr;gap:2px 10px;padding:8px;border-bottom:1px solid rgba(109,199,200,.12)}.chronicle-columns li>span{grid-row:1/3;align-self:center;font:8px monospace;letter-spacing:1.3px}.won{color:#77d3a5}.lost{color:#b77872}.chronicle-columns li strong{font:14px Georgia,serif;color:#dbcba8}.chronicle-columns li small{color:#719092;font:9px monospace}.trial-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.trial-grid article{display:flex;flex-direction:column;min-height:330px}.trial-grid article>span{color:#68b8ba;font:9px monospace;letter-spacing:1.3px;text-transform:uppercase}.trial-grid article>p{min-height:66px}.trial-grid dl{display:grid;gap:5px;margin:17px 0}.trial-grid dl>div{display:flex;justify-content:space-between;border-bottom:1px solid rgba(104,174,175,.12);padding:5px}.trial-grid dt{color:#708b8c;font:9px monospace;text-transform:uppercase}.trial-grid dd{color:#c9b17c;font:13px Georgia,serif;text-transform:capitalize}.trial-grid article>small{margin:auto 0 14px;color:#7e7260;font:9px monospace}.trial-grid button{align-self:flex-start}.honors-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:12px}.honors-grid article{text-align:center;min-height:235px;display:flex;flex-direction:column;align-items:center}.honors-grid article>i{color:#67c4c5;font-size:20px}.honors-grid article>h2{font-size:18px;margin:9px 0}.honors-grid article>p{font-size:12px}.honors-grid article>strong{margin:auto 0 12px;color:#d7b667;font:13px Georgia,serif}.honors-grid article>button{padding:7px 10px;border:1px solid rgba(91,186,186,.35);background:rgba(7,23,27,.6);color:#90c7c5;font:9px monospace;text-transform:uppercase;cursor:pointer}.honors-grid article.locked{filter:saturate(.2);opacity:.48}.honors-grid button:disabled{cursor:default;opacity:.55}.chronicle-back{display:block;margin:26px auto 0}@media(max-width:900px){.chronicle-ledger{grid-template-columns:repeat(3,1fr)}.chronicle-columns,.trial-grid{grid-template-columns:1fr}.honors-grid{grid-template-columns:repeat(2,1fr)}.chronicle-screen{padding:12px}.chronicle-book{width:100%}.trial-grid article{min-height:0}}
`;

const chronicleReadabilityCss = `
  .honors-grid article.locked{filter:saturate(.32);opacity:.68}
  .honors-grid button:disabled{opacity:.62}
  .chronicle-book header>span{font-size:13px}
  .chronicle-book header p{font-size:clamp(17px,1.35vw,20px)}
  .chronicle-tabs button{padding:12px 25px;font-size:14px;letter-spacing:1.5px}
  .chronicle-ledger strong{font-size:31px}
  .chronicle-ledger span{font-size:11px;line-height:1.35}
  .chronicle-book h2{font-size:27px}
  .chronicle-book p{font-size:17px;line-height:1.62}
  .daily-seals b{font-size:24px}
  .daily-seals span{font-size:11px}
  .chronicle-columns li{grid-template-columns:96px 1fr;padding:10px}
  .chronicle-columns li>span{font-size:10px}
  .chronicle-columns li strong{font-size:17px}
  .chronicle-columns li small{font-size:11px;line-height:1.4}
  .trial-grid article>span{font-size:11px}
  .trial-grid dt{font-size:11px}
  .trial-grid dd{font-size:15px}
  .trial-grid article>small{font-size:11px;line-height:1.4}
  .honors-grid article>h2{font-size:21px}
  .honors-grid article>p{font-size:15px;line-height:1.5}
  .honors-grid article>strong{font-size:15px}
  .honors-grid article>button{font-size:11px;padding:9px 12px}
  .cadence-columns{grid-template-columns:.72fr .72fr 1.56fr}
  .weekly-trial{display:grid;grid-template-columns:1.45fr .75fr .55fr auto;align-items:center;gap:22px;margin-bottom:18px;padding:22px 24px;border:1px solid rgba(213,173,82,.4);background:linear-gradient(100deg,rgba(19,79,83,.18),rgba(90,56,18,.12),rgba(0,7,10,.7));box-shadow:inset 0 0 42px rgba(63,177,180,.05)}
  .weekly-trial>div>span{color:#6fc7c6;font:11px monospace;letter-spacing:1.6px}.weekly-trial h2{margin:7px 0 3px}.weekly-trial em{display:block;color:#cbb688;font:italic 15px Georgia,serif}.weekly-trial p{margin-top:8px;font-size:15px}.weekly-trial dl{display:grid;gap:6px}.weekly-trial dl>div{display:flex;justify-content:space-between;gap:16px;padding:5px;border-bottom:1px solid rgba(105,185,185,.14)}.weekly-trial dt,.weekly-progress span{color:#719596;font:10px monospace;text-transform:uppercase}.weekly-trial dd{color:#d8bd80;font:15px Georgia,serif;text-transform:capitalize}.weekly-progress{display:grid;grid-template-columns:auto 1fr;align-items:center;gap:3px 8px}.weekly-progress b{color:#e0bb68;font:23px Georgia,serif}
  @media(max-width:900px){
    .chronicle-tabs{flex-wrap:wrap}
    .chronicle-tabs button{font-size:12px;padding:10px 14px}
    .cadence-columns{grid-template-columns:1fr}
    .weekly-trial{grid-template-columns:1fr}.weekly-trial .ashen-route-button{width:100%}
  }
`;
