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
import { useChronicleTranslation } from "../i18n/chronicleTranslations";

interface Props {
  onBack: () => void;
  onStartChallenge: (id: ChallengeId) => void;
  onStartWeekly: () => void;
  initialPage?: ChroniclePage;
}
export type ChroniclePage = "record" | "trials" | "honors";

const CHRONICLE_ART_ROOT = "/images/core/chronicle";
const TRIAL_ART: Record<ChallengeId, string> = {
  read_the_ashes: `${CHRONICLE_ART_ROOT}/trial-read-the-ashes.webp`,
  the_willing_stop: `${CHRONICLE_ART_ROOT}/trial-the-willing-stop.webp`,
  three_coins_ahead: `${CHRONICLE_ART_ROOT}/trial-three-coins-ahead.webp`,
  the_gentle_chain: `${CHRONICLE_ART_ROOT}/trial-the-gentle-chain.webp`,
  the_crimson_answer: `${CHRONICLE_ART_ROOT}/trial-the-crimson-answer.webp`,
  roots_beyond_nine: `${CHRONICLE_ART_ROOT}/trial-roots-beyond-nine.webp`,
  the_vial_remembers: `${CHRONICLE_ART_ROOT}/trial-the-vial-remembers.webp`,
  a_bag_with_teeth: `${CHRONICLE_ART_ROOT}/trial-a-bag-with-teeth.webp`,
  under_nine_eyes: `${CHRONICLE_ART_ROOT}/trial-under-nine-eyes.webp`,
  the_long_conjunction: `${CHRONICLE_ART_ROOT}/trial-the-long-conjunction.webp`,
  the_changing_hand: `${CHRONICLE_ART_ROOT}/trial-the-changing-hand.webp`,
  at_the_seventh_breath: `${CHRONICLE_ART_ROOT}/trial-at-the-seventh-breath.webp`,
};
const TIER_ART = {
  initiation: `${CHRONICLE_ART_ROOT}/tier-initiation-first-seals.webp`,
  craft: `${CHRONICLE_ART_ROOT}/tier-craft-crucibles-arts.webp`,
  peril: `${CHRONICLE_ART_ROOT}/tier-peril-lessons-that-bite.webp`,
  mastery: `${CHRONICLE_ART_ROOT}/tier-mastery-hands-beyond-chance.webp`,
} as const;
const HONOR_ART: Record<string, string> = {
  first_ritual: `${CHRONICLE_ART_ROOT}/honors/honor-first-seal.webp`,
  three_victories: `${CHRONICLE_ART_ROOT}/honors/honor-crucible-proven.webp`,
  prestige_25: `${CHRONICLE_ART_ROOT}/honors/honor-a-name-in-gold.webp`,
  daily_three: `${CHRONICLE_ART_ROOT}/honors/honor-omen-listener.webp`,
  trial_trinity: `${CHRONICLE_ART_ROOT}/honors/honor-first-three-seals.webp`,
  craft_trinity: `${CHRONICLE_ART_ROOT}/honors/honor-three-arts-bound.webp`,
  peril_trinity: `${CHRONICLE_ART_ROOT}/honors/honor-the-unbroken-vessel.webp`,
  mastery_trinity: `${CHRONICLE_ART_ROOT}/honors/honor-the-twelfth-seal.webp`,
  weekly_three: `${CHRONICLE_ART_ROOT}/honors/honor-the-turning-seal.webp`,
};

export function ChronicleScreen({ onBack, onStartChallenge, onStartWeekly, initialPage = "record" }: Props) {
  const copy = useChronicleTranslation();
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
  const selectedHonor = ACHIEVEMENTS.find(
    (item) => item.id === chronicle.selectedTitleId,
  );
  const selectedTitle = selectedHonor
    ? (copy.honors[selectedHonor.id]?.reward ?? selectedHonor.titleReward)
    : undefined;
  const [weekly, setWeekly] = React.useState(() => createWeeklyChallenge());
  React.useEffect(() => {
    const refreshWeekly = () => {
      const next = createWeeklyChallenge();
      setWeekly((current) =>
        current.session.weekKey === next.session.weekKey ? current : next,
      );
    };
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") refreshWeekly();
    };
    window.addEventListener("focus", refreshWeekly);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    const timer = window.setInterval(refreshWeekly, 60_000);
    return () => {
      window.removeEventListener("focus", refreshWeekly);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
      window.clearInterval(timer);
    };
  }, []);
  const weeklyText = copy.weeklyNames[weekly.title] ?? {
    title: weekly.title,
    epitaph: weekly.epitaph,
  };

  return (
    <main className="chronicle-screen">
      <style>{css}</style>
      <style>{chronicleReadabilityCss}</style>
      <MenuRoomBackground room="central" />
      <div className="chronicle-vignette" />
      <section className="chronicle-book" aria-labelledby="chronicle-title">
        <header>
          <span>{copy.eyebrow}</span>
          <h1 id="chronicle-title">{copy.title}</h1>
          <p>
            {selectedTitle
              ? copy.recordedTitle(selectedTitle)
              : copy.emptySubtitle}
          </p>
        </header>
        <nav className="chronicle-tabs" aria-label={copy.tabsLabel}>
          <Tab active={page === "record"} onClick={() => setPage("record")}>
            {copy.tabs.record}
          </Tab>
          <Tab active={page === "trials"} onClick={() => setPage("trials")}>
            {copy.tabs.trials}
          </Tab>
          <Tab active={page === "honors"} onClick={() => setPage("honors")}>
            {copy.tabs.honors}
          </Tab>
        </nav>
        {page === "record" && (
          <>
            <div className="chronicle-ledger">
              <Stat label={copy.stats.rituals} value={chronicle.matchesPlayed} />
              <Stat label={copy.stats.victories} value={chronicle.victories} />
              <Stat label={copy.stats.rate} value={`${winRate}%`} />
              <Stat
                label={copy.stats.highest}
                value={chronicle.bestPrestige || "—"}
              />
              <Stat label={copy.stats.average} value={average} />
              <Stat label={copy.stats.dailyStreak} value={chronicle.currentDailyStreak} />
            </div>
            <div className="chronicle-columns cadence-columns">
              <article>
                <h2>{copy.daily.title}</h2>
                <div className="daily-seals">
                  <b>{chronicle.dailyChallengesCompleted}</b>
                  <span>{copy.daily.answered}</span>
                  <b>{chronicle.dailyVictories}</b>
                  <span>{copy.daily.conquered}</span>
                  <b>{chronicle.bestDailyStreak}</b>
                  <span>{copy.daily.bestStreak}</span>
                </div>
                <p>
                  {copy.daily.description}
                </p>
              </article>
              <article>
                <h2>{copy.weeklyRecord.title}</h2>
                <div className="daily-seals">
                  <b>{chronicle.weeklyChallengesCompleted}</b>
                  <span>{copy.daily.answered}</span>
                  <b>{chronicle.weeklyVictories}</b>
                  <span>{copy.daily.conquered}</span>
                  <b>{chronicle.bestWeeklyStreak}</b>
                  <span>{copy.daily.bestStreak}</span>
                </div>
                <p>{copy.weeklyRecord.description}</p>
              </article>
              <article>
                <h2>{copy.recent.title}</h2>
                {chronicle.recentMatches.length === 0 ? (
                  <p>{copy.recent.empty}</p>
                ) : (
                  <ol>
                    {chronicle.recentMatches.slice(0, 6).map((match) => (
                      <li key={match.id}>
                        <span className={match.won ? "won" : "lost"}>
                          {match.won ? copy.recent.victory : copy.recent.defeat}
                        </span>
                        <strong>
                          {match.prestige} {copy.recent.prestige} · {match.placement} {copy.recent.place}
                        </strong>
                        <small>
                          {copy.modes[match.mode]} · {match.recipe} · {copy.recent.margin}{" "}
                          {signed(match.scoreMargin ?? 0)}
                          {match.buildPrimary ? ` · ${copy.buildRoles[match.buildPrimary]}${match.buildSecondary ? ` / ${copy.buildRoles[match.buildSecondary]}` : ""}` : ""}
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
            <img className="weekly-trial__art" src={`${CHRONICLE_ART_ROOT}/weekly-procession-empty-vials.webp`} alt="" aria-hidden="true" />
            <div>
              <span>{copy.weekly.seal} · {weekly.session.weekKey}</span>
              <h2>{weeklyText.title}</h2>
              <em>{weeklyText.epitaph}</em>
              <p>{copy.weekly.description(weekly.session.weekKey ?? "")}</p>
            </div>
            <dl>
              <div><dt>{copy.weekly.brewers}</dt><dd>{weekly.setup.totalPlayers}</dd></div>
              <div><dt>{copy.weekly.rivals}</dt><dd>{copy.difficulties[weekly.difficulty] ?? weekly.difficulty}</dd></div>
              <div><dt>{copy.weekly.recipe}</dt><dd>{copy.trialLabels.set} {weekly.setup.recipeMode}</dd></div>
            </dl>
            <div className="weekly-progress">
              <b>{chronicle.currentWeeklyStreak}</b><span>{copy.weekly.currentStreak}</span>
              <b>{chronicle.weeklyVictories}</b><span>{copy.weekly.victories}</span>
            </div>
            <button className="ashen-route-button" onClick={onStartWeekly}>{copy.weekly.answer}</button>
          </article>
          <div className="trial-grid">
            {(["initiation", "craft", "peril", "mastery"] as const).map((tier) => <React.Fragment key={tier}>
            <div className="trial-tier-heading">
              <img src={TIER_ART[tier]} alt="" aria-hidden="true" />
              <div>
              <span>{copy.tiers[tier].label}</span>
              <h2>{copy.tiers[tier].title}</h2>
              <p>{copy.tiers[tier].description}</p>
              </div>
            </div>
            {CHALLENGES.filter((challenge) => challenge.tier === tier).map((challenge) => {
              const localized = copy.trials[challenge.id] ?? challenge;
              const attempts =
                  chronicle.challengeCompletions[challenge.id] ?? 0,
                wins = chronicle.challengeVictories[challenge.id] ?? 0,
                masteries = chronicle.challengeMasteries[challenge.id] ?? 0;
              return (
                <article key={challenge.id}>
                  <img className="trial-card__art" src={TRIAL_ART[challenge.id]} alt="" aria-hidden="true" loading="lazy" />
                  <span>{localized.epitaph}</span>
                  <h2>{localized.title}</h2>
                  <p>{localized.description}</p>
                  <div className="trial-lesson"><b>{localized.lesson}</b><span>{localized.objective}</span></div>
                  <div className="trial-mastery"><b>{copy.trialLabels.mastery}</b><span>{localized.mastery}</span></div>
                  <dl>
                    <div>
                      <dt>{copy.trialLabels.brewers}</dt>
                      <dd>{challenge.players}</dd>
                    </div>
                    <div>
                      <dt>{copy.trialLabels.rivals}</dt>
                      <dd>{copy.difficulties[challenge.difficulty] ?? challenge.difficulty}</dd>
                    </div>
                    <div>
                      <dt>{copy.trialLabels.recipe}</dt>
                      <dd>
                        {challenge.recipeMode === "random"
                          ? copy.trialLabels.seededRandom
                          : `${copy.trialLabels.set} ${challenge.recipeMode}`}
                      </dd>
                    </div>
                  </dl>
                  <small>
                    {attempts} {copy.trialLabels.attempts} · {wins} {copy.trialLabels.seals} · {masteries} {copy.trialLabels.masteries}
                  </small>
                  <button
                    className="ashen-route-button"
                    onClick={() => onStartChallenge(challenge.id)}
                  >
                    {copy.trialLabels.begin}
                  </button>
                </article>
              );
            })}
            </React.Fragment>)}
          </div>
          </>
        )}
        {page === "honors" && (
          <div className="honors-grid">
            {ACHIEVEMENTS.map((honor) => {
              const localized = copy.honors[honor.id] ?? { title: honor.title, description: honor.description, reward: honor.titleReward };
              const unlocked = chronicle.unlockedAchievementIds.includes(
                  honor.id,
                ),
                selected = chronicle.selectedTitleId === honor.id;
              return (
                <article
                  className={`${unlocked ? "unlocked" : "locked"}${selected ? " selected" : ""}`}
                  key={honor.id}
                >
                  <div className="honor-art">
                    <img src={HONOR_ART[honor.id]} alt="" />
                  </div>
                  <div className="honor-copy">
                    <h2>{localized.title}</h2>
                    <p>{localized.description}</p>
                    <strong>
                      {unlocked ? localized.reward : copy.honorLabels.veiled}
                    </strong>
                    <button
                      disabled={!unlocked || selected}
                      onClick={() => setChronicle(selectChronicleTitle(honor.id))}
                    >
                      {selected
                        ? copy.honorLabels.equipped
                        : unlocked
                          ? copy.honorLabels.equip
                          : copy.honorLabels.locked}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
        <button className="ashen-route-button chronicle-back" onClick={onBack}>
          {copy.back}
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
function signed(value: number) {
  return value > 0 ? `+${value}` : String(value);
}

const css = `
.chronicle-screen{min-height:100vh;position:relative;display:grid;place-items:center;overflow:auto;background:#020608;color:#d8c8aa;padding:clamp(20px,4vw,58px)}.chronicle-vignette{position:fixed;inset:0;z-index:1;pointer-events:none;background:radial-gradient(ellipse at 54% 44%,rgba(9,42,45,.24),rgba(1,4,7,.62) 70%,rgba(0,1,3,.94))}.chronicle-book{position:relative;z-index:2;width:min(1180px,95vw);padding:clamp(24px,3.6vw,54px);border:1px solid rgba(78,180,183,.38);background:linear-gradient(145deg,rgba(2,13,17,.95),rgba(5,8,14,.94));box-shadow:0 30px 100px #000,inset 0 0 90px rgba(29,103,109,.07)}.chronicle-book:before,.chronicle-book:after{content:'◆';position:absolute;color:#d3a94e;text-shadow:0 0 18px #54cbd0}.chronicle-book:before{left:16px;top:12px}.chronicle-book:after{right:16px;bottom:12px}.chronicle-book header{text-align:center;max-width:760px;margin:0 auto 22px}.chronicle-book header>span{font:11px monospace;letter-spacing:4px;color:#6dc7c8}.chronicle-book h1{margin:8px 0;color:#e0bb68;font:clamp(32px,4vw,54px) Georgia,serif;font-weight:400;letter-spacing:2px}.chronicle-book header p{font:italic clamp(14px,1.2vw,18px)/1.5 Georgia,serif;color:#b7a98f}.chronicle-tabs{display:flex;justify-content:center;gap:4px;margin:0 auto 24px;border-bottom:1px solid rgba(102,199,199,.18)}.chronicle-tabs button{padding:10px 22px;border:0;border-bottom:2px solid transparent;background:transparent;color:#7e796d;font:11px monospace;letter-spacing:1.4px;text-transform:uppercase;cursor:pointer}.chronicle-tabs button.active{color:#dfc078;border-color:#65bec4}.chronicle-ledger{display:grid;grid-template-columns:repeat(6,1fr);border-block:1px solid rgba(210,170,80,.2);margin-bottom:28px}.chronicle-ledger>div{padding:15px 8px;text-align:center;border-right:1px solid rgba(210,170,80,.14)}.chronicle-ledger strong{display:block;color:#dbb75e;font:27px Georgia,serif}.chronicle-ledger span{display:block;margin-top:5px;color:#70afb2;font:9px monospace;letter-spacing:1.3px;text-transform:uppercase}.chronicle-columns{display:grid;grid-template-columns:.8fr 1.2fr;gap:24px}.chronicle-columns article,.trial-grid article,.honors-grid article{padding:20px;border:1px solid rgba(84,160,164,.2);background:rgba(0,6,10,.54)}.chronicle-book h2{color:#d7bd80;font:23px Georgia,serif;font-weight:400;margin-bottom:13px}.chronicle-book p{font:14px/1.55 Georgia,serif;color:#aa9f8c}.daily-seals{display:grid;grid-template-columns:auto 1fr;gap:3px 11px;margin-bottom:12px}.daily-seals b{color:#73d0d0;font:21px Georgia,serif}.daily-seals span{align-self:center;color:#8f836e;font:9px monospace;text-transform:uppercase;letter-spacing:1px}.chronicle-columns ol{list-style:none;display:grid;gap:5px}.chronicle-columns li{display:grid;grid-template-columns:82px 1fr;gap:2px 10px;padding:8px;border-bottom:1px solid rgba(109,199,200,.12)}.chronicle-columns li>span{grid-row:1/3;align-self:center;font:8px monospace;letter-spacing:1.3px}.won{color:#77d3a5}.lost{color:#b77872}.chronicle-columns li strong{font:14px Georgia,serif;color:#dbcba8}.chronicle-columns li small{color:#719092;font:9px monospace}.trial-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.trial-grid article{display:flex;flex-direction:column;min-height:330px}.trial-grid article>span{color:#68b8ba;font:9px monospace;letter-spacing:1.3px;text-transform:uppercase}.trial-grid article>p{min-height:66px}.trial-grid dl{display:grid;gap:5px;margin:17px 0}.trial-grid dl>div{display:flex;justify-content:space-between;border-bottom:1px solid rgba(104,174,175,.12);padding:5px}.trial-grid dt{color:#708b8c;font:9px monospace;text-transform:uppercase}.trial-grid dd{color:#c9b17c;font:13px Georgia,serif;text-transform:capitalize}.trial-grid article>small{margin:auto 0 14px;color:#7e7260;font:9px monospace}.trial-grid button{align-self:flex-start}.honors-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:12px}.honors-grid article{text-align:center;min-height:235px;display:flex;flex-direction:column;align-items:center}.honors-grid article>i{color:#67c4c5;font-size:20px}.honors-grid article>h2{font-size:18px;margin:9px 0}.honors-grid article>p{font-size:12px}.honors-grid article>strong{margin:auto 0 12px;color:#d7b667;font:13px Georgia,serif}.honors-grid article>button{padding:7px 10px;border:1px solid rgba(91,186,186,.35);background:rgba(7,23,27,.6);color:#90c7c5;font:9px monospace;text-transform:uppercase;cursor:pointer}.honors-grid article.locked{filter:saturate(.2);opacity:.48}.honors-grid button:disabled{cursor:default;opacity:.55}.chronicle-back{position:fixed;left:clamp(16px,3vw,44px);bottom:clamp(16px,3vw,38px);z-index:6;margin:0;background:rgba(2,12,16,.92);box-shadow:0 10px 34px rgba(0,0,0,.72),0 0 20px rgba(71,190,193,.12);backdrop-filter:blur(8px)}@media(max-width:900px){.chronicle-ledger{grid-template-columns:repeat(3,1fr)}.chronicle-columns,.trial-grid{grid-template-columns:1fr}.honors-grid{grid-template-columns:repeat(2,1fr)}.chronicle-screen{padding:12px 12px 86px}.chronicle-book{width:100%}.trial-grid article{min-height:0}.chronicle-back{left:12px;right:12px;bottom:12px;width:auto}}
`;

const chronicleReadabilityCss = `
  .trial-tier-heading{grid-column:1/-1;display:grid;grid-template-columns:minmax(230px,.72fr) 1.28fr;gap:22px;align-items:center;min-height:184px;padding:0 22px 0 0;overflow:hidden;border:1px solid rgba(101,190,196,.24);border-left:2px solid #65bec4;background:linear-gradient(90deg,rgba(22,91,95,.2),transparent)}
  .trial-tier-heading>img{width:100%;height:184px;object-fit:cover;filter:saturate(.88) contrast(1.04);mask-image:linear-gradient(90deg,#000 76%,transparent)}
  .trial-tier-heading>div{padding:19px 0}.trial-tier-heading>div>span{color:#70cdcf;font:12px monospace;letter-spacing:2px}.trial-tier-heading h2{margin:6px 0}.trial-tier-heading p{margin:0;max-width:820px}
  .trial-lesson,.trial-mastery{display:grid;gap:4px;margin-top:12px;padding:11px 12px;border-left:2px solid #58bec0;background:rgba(26,97,100,.1)}
  .trial-mastery{border-left-color:#d2a850;background:rgba(116,77,20,.1)}
  .trial-lesson b,.trial-mastery b{color:#75cfd0;font:11px monospace;letter-spacing:1.3px;text-transform:uppercase}.trial-mastery b{color:#ddb968}
  .trial-lesson span,.trial-mastery span{color:#c8baa0;font:15px/1.45 Georgia,serif}
  .honors-grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}
  .honors-grid article{min-height:440px;padding:0;overflow:hidden;align-items:stretch;text-align:left;background:linear-gradient(155deg,rgba(5,18,21,.94),rgba(3,7,12,.98));box-shadow:0 18px 38px rgba(0,0,0,.3)}
  .honor-art{position:relative;aspect-ratio:16/9;overflow:hidden;border-bottom:1px solid rgba(101,190,196,.26);background:#010507}
  .honor-art:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,transparent 48%,rgba(2,9,12,.68)),linear-gradient(90deg,rgba(3,12,15,.12),transparent 50%,rgba(3,12,15,.16));pointer-events:none}
  .honor-art img{width:100%;height:100%;display:block;object-fit:cover;filter:saturate(.9) contrast(1.04);transition:transform .45s ease,filter .3s ease}
  .honor-copy{display:flex;flex:1;flex-direction:column;align-items:flex-start;padding:18px 20px 20px}
  .honor-copy h2{margin:0 0 8px;font-size:24px}.honor-copy p{margin:0 0 16px;font-size:16px;line-height:1.52}.honor-copy strong{margin:auto 0 13px;color:#d7b667;font:16px/1.35 Georgia,serif}.honor-copy button{align-self:stretch;padding:10px 12px;border:1px solid rgba(91,186,186,.35);background:rgba(7,23,27,.6);color:#90c7c5;font:11px monospace;letter-spacing:.6px;text-transform:uppercase;cursor:pointer}
  .honors-grid article:hover .honor-art img{transform:scale(1.025);filter:saturate(1) contrast(1.06)}
  .honors-grid article.selected{border-color:rgba(223,187,104,.68);box-shadow:0 18px 38px rgba(0,0,0,.3),0 0 24px rgba(214,172,78,.13)}
  .honors-grid article.locked{opacity:.76}
  .honors-grid article.locked .honor-art img{filter:grayscale(.68) saturate(.3) brightness(.56) contrast(1.08)}
  .honors-grid article.locked:hover .honor-art img{filter:grayscale(.52) saturate(.42) brightness(.62) contrast(1.08)}
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
  .weekly-trial{position:relative;isolation:isolate;display:grid;grid-template-columns:1.45fr .75fr .55fr auto;align-items:center;gap:22px;min-height:248px;margin-bottom:18px;padding:28px 30px;overflow:hidden;border:1px solid rgba(213,173,82,.4);background:#030b0e;box-shadow:inset 0 0 42px rgba(63,177,180,.05)}
  .weekly-trial:after{content:'';position:absolute;inset:0;z-index:-1;background:linear-gradient(90deg,rgba(2,10,13,.9) 0%,rgba(2,10,13,.72) 50%,rgba(2,10,13,.92) 100%)}
  .weekly-trial__art{position:absolute;inset:0;z-index:-2;width:100%;height:100%;object-fit:cover;filter:saturate(.82) contrast(1.06)}
  .weekly-trial>div>span{color:#6fc7c6;font:11px monospace;letter-spacing:1.6px}.weekly-trial h2{margin:7px 0 3px}.weekly-trial em{display:block;color:#cbb688;font:italic 15px Georgia,serif}.weekly-trial p{margin-top:8px;font-size:15px}.weekly-trial dl{display:grid;gap:6px}.weekly-trial dl>div{display:flex;justify-content:space-between;gap:16px;padding:5px;border-bottom:1px solid rgba(105,185,185,.14)}.weekly-trial dt,.weekly-progress span{color:#719596;font:10px monospace;text-transform:uppercase}.weekly-trial dd{color:#d8bd80;font:15px Georgia,serif;text-transform:capitalize}.weekly-progress{display:grid;grid-template-columns:auto 1fr;align-items:center;gap:3px 8px}.weekly-progress b{color:#e0bb68;font:23px Georgia,serif}
  .trial-grid article{overflow:hidden}.trial-card__art{width:calc(100% + 40px);height:150px;margin:-20px -20px 18px;object-fit:cover;border-bottom:1px solid rgba(101,190,196,.22);filter:saturate(.84) contrast(1.04);transition:filter .22s,transform .35s}.trial-grid article:hover .trial-card__art{filter:saturate(1) contrast(1.06);transform:scale(1.015)}
  @media(max-width:900px){
    .chronicle-tabs{flex-wrap:wrap}
    .chronicle-tabs button{font-size:12px;padding:10px 14px}
    .cadence-columns{grid-template-columns:1fr}
    .weekly-trial{grid-template-columns:1fr}.weekly-trial .ashen-route-button{width:100%}
    .trial-tier-heading{grid-template-columns:1fr;padding:0}.trial-tier-heading>img{height:156px;mask-image:linear-gradient(#000 70%,transparent)}.trial-tier-heading>div{padding:0 18px 20px}
    .honors-grid{grid-template-columns:1fr}.honors-grid article{min-height:0}.honor-copy{padding:17px}
  }
`;
