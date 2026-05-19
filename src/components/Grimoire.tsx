import React, { useState } from "react";
import { useTranslation } from "../i18n/useTranslation";

// ─── Data ─────────────────────────────────────────────────────────────────────

interface Ingredient {
  color: string;
  fill: string;
  glow: string;
  border: string;
  name: string;
  latinName: string;
  rarity: "Common" | "Uncommon" | "Rare" | "Legendary";
  values: number[];
  description: string;
  effect: string;
  lore: string;
  warning?: string;
}

const INGREDIENTS: Ingredient[] = [
  {
    color: "white",
    fill: "#0d0d1f",
    glow: "#8888ff",
    border: "#aaaaff",
    name: "Voidshard",
    latinName: "Crystallum Vacui",
    rarity: "Common",
    values: [1, 1, 1, 1, 2, 2, 3],
    description:
      "Fractured remnants of collapsed dimensional membranes, Voidshards are the most volatile ingredient in any hexbrewer's bag. Their pale luminescence belies a catastrophic instability.",
    effect:
      "Advances your position along the spiral by its value. Every Voidshard accumulates pressure — when the total value of all placed Voidshards exceeds 7, your crucible shatters instantly. No special effect beyond explosion risk.",
    lore:
      "\"Never trust a brew with no Voidshards — it will be weak. Never trust a brew with too many — you will not survive it.\" — Old hexbrewer proverb",
    warning:
      "CRITICAL: Track your Voidshard total at all times. 7 is the threshold of annihilation.",
  },
  {
    color: "orange",
    fill: "#1f0a00",
    glow: "#ff6600",
    border: "#ff8800",
    name: "Brimstone",
    latinName: "Sulphur Infernum",
    rarity: "Common",
    values: [1, 2],
    description:
      "Crystallised volcanic essence harvested from the geothermal vents beneath Ashenveil. Brimstone radiates heat that can be felt through leather gloves.",
    effect:
      "Safe ingredient — advances the spiral without adding to Voidshard pressure. No special effect. Higher value Brimstone chips push further along the track, earning more VP and coins.",
    lore:
      "\"The earth bleeds Brimstone so that we may brew without dying. Mostly.\" — Maren, Third-Rank Hexbrewer",
    warning: undefined,
  },
  {
    color: "green",
    fill: "#001a00",
    glow: "#00cc44",
    border: "#00ff55",
    name: "Deathweave",
    latinName: "Arachnium Mortis",
    rarity: "Common",
    values: [1, 2],
    description:
      "Silk harvested from the poisonous Ashenveil cave spider, treated with moonwater until its toxins become inert. The resulting thread glows with a sickly green phosphorescence.",
    effect:
      "End-of-round effect: If a Deathweave chip is placed on the last or second-to-last space of your crucible, you earn 1 ruby. Rubies can be spent between rounds to advance your droplet or refill your Cursed Vial.",
    lore:
      "\"I do not harvest the silk. I negotiate with the spider.\" — Ysolde the Pale",
    warning: undefined,
  },
  {
    color: "purple",
    fill: "#0d0020",
    glow: "#aa00ff",
    border: "#cc44ff",
    name: "Wraithbloom",
    latinName: "Phantasma Floris",
    rarity: "Uncommon",
    values: [1, 2],
    description:
      "A spectral flower that blooms only in places where the veil between worlds is thin. Its petals dissolve upon contact with sunlight, making it one of the most prized night-harvested reagents.",
    effect:
      "End-of-round effect: If your crucible survives (does not explode), gain +1 VP for every Wraithbloom chip placed in your crucible this round. Useless if you explode — only rewards survival.",
    lore:
      "\"It smells like rain, old books, and something you cannot name. Like grief made botanical.\" — Field notes, unknown hexbrewer",
    warning: undefined,
  },
  {
    color: "blue",
    fill: "#00000f",
    glow: "#0044ff",
    border: "#2266ff",
    name: "Frostbile",
    latinName: "Glacius Mordax",
    rarity: "Uncommon",
    values: [1, 2],
    description:
      "Compressed ice-venom from the Frostbile serpents that inhabit the frozen Ashenveil undercity. Each chip is cold enough to blister bare skin and emits a faint blue corona.",
    effect:
      "Immediate effect: When a Frostbile chip is drawn, draw additional chips from your bag equal to its value (1, 2, or 4 extra draws). Choose one to keep and place in the crucible. Return the rest to your bag. Powerful for bag manipulation.",
    lore:
      "\"The serpents do not give their venom freely. Neither should you.\" — Master Hexbrewer Caldric",
    warning: undefined,
  },
  {
    color: "red",
    fill: "#0f0000",
    glow: "#cc0000",
    border: "#ff2222",
    name: "Bloodthorn",
    latinName: "Rubus Cruoris",
    rarity: "Rare",
    values: [1],
    description:
      "Thorns extracted from the carnivorous Bloodthorn bramble that grows along the old execution walls. Each thorn is red-black and barbed, and hums faintly when near active magic.",
    effect:
      "Immediate effect: When a Bloodthorn chip is drawn, it advances 1 extra space for every other Bloodthorn chip already placed in your crucible. The more Bloodthorns in your pot, the further each new one pushes. Combos stack aggressively.",
    lore:
      "\"The bramble knows what you've done. It always does.\" — Ashenveil street warning",
    warning: undefined,
  },
  {
    color: "yellow",
    fill: "#0f0c00",
    glow: "#ccaa00",
    border: "#ffdd00",
    name: "Plaguedust",
    latinName: "Pestis Pulveris",
    rarity: "Uncommon",
    values: [1, 2],
    description:
      "Fine golden powder scraped from the husks of plague-moths. Despite its origin, Plaguedust is non-infectious when crystallised, though hexbrewers still wear masks when handling it.",
    effect:
      "Immediate effect: When a Plaguedust chip is placed, earn 1 ruby for every pair of Plaguedust chips already in your crucible this round. Stacking multiple yellows in a single brew gives escalating ruby income.",
    lore:
      "\"It smells terrible. It brews beautifully. Such is the nature of things.\" — Tavern hexbrewer, Ashenveil Lower Quarter",
    warning: undefined,
  },
  {
    color: "black",
    fill: "#020202",
    glow: "#333333",
    border: "#666666",
    name: "Shadowmoss",
    latinName: "Umbra Muscus",
    rarity: "Legendary",
    values: [1],
    description:
      "A living darkness that grows in the deepest vaults beneath Ashenveil where no light has reached in centuries. Shadowmoss feeds on ambient magic and must be stored in obsidian containers.",
    effect:
      "End-of-round effect: If your crucible survives and a Shadowmoss chip is in the pot, your droplet advances 1 space forward permanently — for free. This is the same benefit as spending 2 rubies, but costs nothing.",
    lore:
      "\"I have brewed with Shadowmoss once. Once was enough to understand why the old hexbrewers locked it away.\" — Caldric, in his final journal",
    warning: "Handle with caution. Shadowmoss has been known to shift position in sealed containers.",
  },
];

interface OmenEntry {
  id: string;
  title: string;
  effect: string;
  description: string;
  strategy: string;
  icon: string;
}

const OMENS: OmenEntry[] = [
  {
    id: "double_soulstones",
    title: "Double Soulstones",
    effect: "Earn ×2 Soulstones from your spiral position this round",
    description: "The Void Hungers / Shadowtide",
    strategy:
      "Push aggressively. The deeper you go on the spiral, the more scoring slots you hit — and this round they each pay double. Accept higher Voidshard risk than usual. Even a mid-range position becomes very lucrative.",
    icon: "⬡",
  },
  {
    id: "extra_draw",
    title: "Extra Draw",
    effect: "Draw one additional token before deciding to stop",
    description: "Whispers of the Deep / The Final Convergence",
    strategy:
      "Use the extra draw late — after you've already committed to stopping. It gives one free look at fate. If your Voidshard pressure is low, use it early. If you're near the threshold, use it as a last gamble.",
    icon: "◈",
  },
  {
    id: "poison",
    title: "Explosion Penalty",
    effect: "If your crucible shatters, lose 2–3 Soulstones",
    description: "Curse of the Ashenveil / Harbinger's Mark",
    strategy:
      "Play conservatively. The penalty compounds a bad result — not only do you lose the dual reward for surviving, but you also bleed Soulstones you need for the market. Stop early, protect your resources.",
    icon: "⚠",
  },
  {
    id: "bonus_score",
    title: "Survival Bonus",
    effect: "If your crucible survives, gain 3–5 bonus prestige points",
    description: "Blood Pact / Veil of Fortune",
    strategy:
      "Do not explode. This is a round to play it safe — stop the moment your Voidshard pressure becomes uncomfortable. The bonus points reward discipline far more than a risky extra draw would.",
    icon: "✦",
  },
  {
    id: "no_effect",
    title: "No Effect",
    effect: "No special rule this round",
    description: "Eclipse of the Wraith Moon",
    strategy:
      "Pure brewing. No bonus to chase, no penalty to fear. Use this round to evaluate your bag composition and plan your market purchases carefully. A calm round is a good round to test your limits.",
    icon: "◯",
  },
];

interface RuleEntry {
  title: string;
  content: string[];
}

const RULES: RuleEntry[] = [
  {
    title: "The Crucible Spiral",
    content: [
      "Your crucible is a spiral track of 33 positions. Each token you draw advances your position by the token's value.",
      "The further along the spiral you reach, the more VP and coins you earn at the end of the round.",
      "Ruby spaces appear at positions 3, 8, 14, 20, and 27. Landing on one earns you 1 ruby.",
      "Your position resets to your droplet position at the start of each round — all tokens return to your bag.",
    ],
  },
  {
    title: "The Bag & Drawing",
    content: [
      "Your bag starts with 9 tokens: 7 Voidshards (4×value-1, 2×value-2, 1×value-3), 1 Brimstone, 1 Deathweave.",
      "Each turn during brewing, you choose to Draw or Stop. Drawing pulls one random token from your bag.",
      "The drawn token is placed on the spiral at the next available position (current + token value).",
      "You continue drawing until you choose to stop, your bag empties, or your crucible shatters.",
    ],
  },
  {
    title: "Voidshard Pressure",
    content: [
      "Every Voidshard placed on the spiral adds its value to your running Voidshard total.",
      "If your Voidshard total exceeds 7, your crucible SHATTERS. The round ends immediately.",
      "A shattered crucible forces you to choose: take VP from your position, OR take your coins. You cannot take both.",
      "A surviving crucible earns you BOTH VP AND coins. This is the core incentive to stop before shattering.",
    ],
  },
  {
    title: "The Cursed Vial",
    content: [
      "Once per round, you may use your Cursed Vial. It activates only on a white Voidshard token.",
      "Using it returns that token to your bag — as if it was never drawn. The Voidshard pressure is reversed.",
      "You cannot use the Vial if the Voidshard already caused an explosion.",
      "After use, the Vial is empty. Refilling costs 2 rubies during the ruby-spend phase.",
    ],
  },
  {
    title: "Scoring & Rubies",
    content: [
      "VP are earned based on the scoring track (your spiral position). Coins equal your space number.",
      "If your crucible survived: collect both VP and coins.",
      "If your crucible shattered: choose one — VP OR coins.",
      "Rubies are earned from ruby spaces and chip effects. Spend 2 rubies to advance your droplet 1 space, or refill your Cursed Vial.",
    ],
  },
  {
    title: "The Black Market",
    content: [
      "After scoring, the Black Market opens. Spend your coins to buy new ingredient tokens.",
      "You may buy up to 2 tokens per round, but they must be different colours.",
      "Purchased tokens are added directly to your bag — they will appear in future rounds.",
      "The market refreshes availability each round based on unlock rules.",
    ],
  },
  {
    title: "Rat Tail Catchup",
    content: [
      "From round 2 onward, trailing players get a head start. Count rat tail icons between your score and the leader's score.",
      "Your rat stone is placed that many spaces ahead of your droplet, giving you a longer starting position.",
      "The leader gets no bonus. This prevents runaway victories.",
    ],
  },
  {
    title: "Omen Cards",
    content: [
      "At the start of each round, an Omen Card is revealed. Its effect applies to all players this round.",
      "9 cards are shuffled at the start of the game — one per round, no repeats.",
      "Some cards reward survival, others punish explosion, some grant extra draws.",
      "Adjust your risk tolerance based on the active Omen every single round.",
    ],
  },
  {
    title: "Victory",
    content: [
      "The game lasts exactly 9 rounds. In round 6, an extra Voidshard (value 1) is added to every player's bag.",
      "After round 9, the player with the highest total VP wins.",
      "Ties are broken by rubies remaining. Further ties are a shared victory.",
    ],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

type Tab = "ingredients" | "omens" | "rules";

export function Grimoire({ onBack }: { onBack?: () => void }) {
  const [tab, setTab] = useState<Tab>("ingredients");
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient>(INGREDIENTS[0]);
  const [expandedRule, setExpandedRule] = useState<string | null>("The Crucible Spiral");

  const t = useTranslation();

  return (
    <div style={s.root}>
      {/* Parchment texture overlay */}
      <div style={s.noise} />

      {/* Header */}
      <div style={s.header}>
        {onBack && (
          <button
            style={{ ...s.tab, position: "absolute", left: 24, top: 24, fontSize: 13, padding: "8px 18px" }}
            onClick={onBack}
          >
            {t.grimoire.backToMenu}
          </button>
        )}
        <div style={s.headerRune}>✦ ✦ ✦</div>
        <h1 style={s.title}>{t.grimoire.title}</h1>
        <p style={s.headerSub}>{t.grimoire.footer}</p>
        <div style={s.headerRune}>✦ ✦ ✦</div>
      </div>

      {/* Tab bar */}
      <div style={s.tabBar}>
        {(["ingredients", "omens", "rules"] as Tab[]).map((tabId) => (
          <button
            key={tabId}
            style={{ ...s.tab, ...(tab === tabId ? s.tabActive : {}) }}
            onClick={() => setTab(tabId)}
          >
            {tabId === "ingredients" && t.grimoire.tabIngredients}
            {tabId === "omens" && t.grimoire.tabOmens}
            {tabId === "rules" && t.grimoire.tabRules}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={s.content}>
        {tab === "ingredients" && (
          <IngredientsTab
            ingredients={INGREDIENTS}
            selected={selectedIngredient}
            onSelect={setSelectedIngredient}
          />
        )}
        {tab === "omens" && <OmensTab omens={OMENS} />}
        {tab === "rules" && (
          <RulesTab
            rules={RULES}
            expanded={expandedRule}
            onExpand={setExpandedRule}
          />
        )}
      </div>

      {/* Footer */}
      <div style={s.footer}>
        <span style={s.footerText}>
          {t.grimoire.footer}
        </span>
      </div>
    </div>
  );
}

// ─── Ingredients tab ──────────────────────────────────────────────────────────

function IngredientsTab({
  ingredients,
  selected,
  onSelect,
}: {
  ingredients: Ingredient[];
  selected: Ingredient;
  onSelect: (i: Ingredient) => void;
}) {
  const t = useTranslation();
  return (
    <div style={ing.layout}>
      {/* Sidebar list */}
      <div style={ing.sidebar}>
        <div style={ing.sidebarTitle}>{t.grimoire.ingredientsLabel}</div>
        {ingredients.map((item) => (
          <button
            key={item.color}
            style={{
              ...ing.sidebarItem,
              border:
                selected.color === item.color
                  ? `1px solid ${item.border}99`
                  : "1px solid transparent",
              background:
                selected.color === item.color
                  ? `${item.fill}cc`
                  : "transparent",
            }}
            onClick={() => onSelect(item)}
          >
            <TokenDot ingredient={item} size={22} />
            <div style={ing.sidebarItemText}>
              <span style={{ ...ing.sidebarName, color: item.border }}>
                {(t.grimoire as any)[item.name.toLowerCase()] ?? item.name}
              </span>
              <span style={ing.sidebarRarity}>{item.rarity}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Detail panel */}
      <div style={ing.detail}>
        <IngredientDetail ingredient={selected} />
      </div>
    </div>
  );
}

function IngredientDetail({ ingredient: i }: { ingredient: Ingredient }) {
  const t = useTranslation();
  const iData = t.grimoireIngredientsData[i.name];

  return (
    <div style={det.root}>
      {/* Header */}
      <div style={det.header}>
        <TokenDot ingredient={i} size={56} />
        <div style={det.headerText}>
          <div style={{ ...det.name, color: i.border }}>{(t.grimoire as any)[i.name.toLowerCase()] ?? i.name}</div>
          <div style={det.latin}>{(t.grimoire as any)[i.name.toLowerCase() + "Sub"] ?? i.latinName}</div>
          <RarityBadge rarity={i.rarity} color={i.border} />
        </div>
      </div>

      <Divider />

      {/* Values */}
      <div style={det.section}>
        <div style={det.sectionTitle}>{t.grimoire.tokenValuesLabel}</div>
        <div style={det.valueRow}>
          {i.values.map((v, idx) => (
            <div
              key={idx}
              style={{
                ...det.valuePip,
                background: i.fill,
                border: `1px solid ${i.border}88`,
                color: i.border,
                boxShadow: `0 0 8px ${i.glow}44`,
              }}
            >
              {v}
            </div>
          ))}
        </div>
        <div style={det.valueNote}>
          {i.color === "white"
            ? t.grimoire.voidshardCount
              .replace("{count}", i.values.length.toString())
              .replace("{val}", i.values.reduce((a, b) => a + b, 0).toString())
            : t.grimoire.otherCount.replace("{count}", i.values.length.toString())}
        </div>
      </div>

      <Divider />

      {/* Description */}
      <div style={det.section}>
        <div style={det.sectionTitle}>{t.grimoire.descriptionLabel}</div>
        <p style={det.body}>{iData?.description ?? i.description}</p>
      </div>

      {/* Game effect */}
      <div style={det.section}>
        <div style={det.sectionTitle}>{t.grimoire.gameEffectLabel}</div>
        <div style={{ ...det.effectBox, border: `1px solid ${i.border}33` }}>
          <p style={{ ...det.body, color: "#cc99ff" }}>{iData?.effect ?? i.effect}</p>
        </div>
      </div>

      {/* Warning */}
      {(iData?.warning ?? i.warning) && (
        <div style={det.warningBox}>
          <span style={det.warningIcon}>⚠</span>
          <p style={det.warningText}>{iData?.warning ?? i.warning}</p>
        </div>
      )}

      {/* Lore */}
      <div style={det.section}>
        <div style={det.sectionTitle}>{t.grimoire.lore}</div>
        <p style={det.lore}>{iData?.lore ?? i.lore}</p>
      </div>
    </div>
  );
}

function TokenDot({ ingredient, size }: { ingredient: Ingredient; size: number }) {
  const colorMap: Record<string, string> = {
    white: "empty.png",
    orange: "spider.png",
    green: "deathweave.png",
    blue: "frostbile.png",
    red: "bloodthorn.png",
    yellow: "plaguedust.png",
    purple: "wraithbloom.png",
    black: "shadowmoss.png",
  };
  const iconPath = `/images/${colorMap[ingredient.color] || "empty.png"}`;

  return (
    <img
      src={iconPath}
      alt={ingredient.name}
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        flexShrink: 0,
        filter: `drop-shadow(0 0 ${size * 0.25}px ${ingredient.glow})`,
        background: "rgba(0, 0, 0, 0.5)",
        borderRadius: "50%",
        padding: Math.max(1, size * 0.1),
      }}
    />
  );
}

function RarityBadge({ rarity, color }: { rarity: string; color: string }) {
  const colors: Record<string, string> = {
    Common: "#887799",
    Uncommon: "#44aa66",
    Rare: "#4488ff",
    Legendary: "#ffaa00",
  };
  return (
    <span
      style={{
        fontFamily: "monospace",
        fontSize: 13,
        color: colors[rarity] ?? color,
        letterSpacing: 2,
        textTransform: "uppercase",
      }}
    >
      {rarity}
    </span>
  );
}

// ─── Omens tab ────────────────────────────────────────────────────────────────

function OmensTab({ omens }: { omens: OmenEntry[] }) {
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

// ─── Rules tab ────────────────────────────────────────────────────────────────

function RulesTab({
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

// ─── Shared helpers ───────────────────────────────────────────────────────────

function Divider() {
  return (
    <div
      style={{
        height: 1,
        background:
          "linear-gradient(90deg, transparent, #3a1a5a88, transparent)",
        margin: "4px 0",
      }}
    />
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s: Record<string, React.CSSProperties> = {
  root: {
    minHeight: "100vh",
    backgroundImage: "linear-gradient(rgba(10, 6, 24, 0.75), rgba(10, 6, 24, 0.75)), url('/images/parchment_dark.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    color: "#cc99ff",
    fontFamily: "Georgia, 'Times New Roman', serif",
    position: "relative",
    overflowX: "hidden",
  },
  noise: {
    position: "fixed",
    inset: 0,
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
    pointerEvents: "none",
    zIndex: 0,
  },
  header: {
    textAlign: "center",
    padding: "52px 24px 32px",
    position: "relative",
    zIndex: 1,
    borderBottom: "1px solid #1a0a2e",
    background:
      "linear-gradient(180deg, rgba(20,8,50,0.9) 0%, rgba(6,2,16,0) 100%)",
  },
  headerRune: {
    color: "#6622aa",
    fontSize: 14,
    letterSpacing: 10,
    opacity: 0.6,
    marginBottom: 8,
  },
  title: {
    fontFamily: "Georgia, serif",
    fontSize: "clamp(28px, 5vw, 48px)",
    color: "#cc88ff",
    letterSpacing: 4,
    margin: "0 0 10px",
    textShadow:
      "0 0 40px rgba(180,80,255,0.35), 0 0 80px rgba(120,40,200,0.15)",
    fontWeight: "normal",
  },
  headerSub: {
    fontFamily: "monospace",
    fontSize: 12,
    color: "#664488",
    letterSpacing: 1.5,
    margin: "0 0 16px",
  },
  tabBar: {
    display: "flex",
    justifyContent: "center",
    gap: 2,
    padding: "16px 24px",
    borderBottom: "1px solid #1a0a2e",
    position: "relative",
    zIndex: 1,
  },
  tab: {
    background: "transparent",
    border: "1px solid #2a1a3a",
    borderRadius: 6,
    padding: "9px 24px",
    color: "#664488",
    fontFamily: "monospace",
    fontSize: 12,
    letterSpacing: 1.5,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  tabActive: {
    background: "rgba(80,20,120,0.3)",
    border: "1px solid #7733bb",
    color: "#cc88ff",
    boxShadow: "0 0 16px rgba(120,40,200,0.2)",
  },
  content: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "32px 20px 60px",
    position: "relative",
    zIndex: 1,
  },
  footer: {
    textAlign: "center",
    padding: "24px",
    borderTop: "1px solid #1a0a2e",
    position: "relative",
    zIndex: 1,
  },
  footerText: {
    fontFamily: "monospace",
    fontSize: 13,
    color: "#3a1a5a",
    letterSpacing: 2,
  },
};

// Ingredient tab styles
const ing: Record<string, React.CSSProperties> = {
  layout: {
    display: "grid",
    gridTemplateColumns: "220px 1fr",
    gap: 20,
    alignItems: "start",
  },
  sidebar: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    position: "sticky",
    top: 20,
  },
  sidebarTitle: {
    fontFamily: "monospace",
    fontSize: 12,
    color: "#3a1a5a",
    letterSpacing: 3,
    textTransform: "uppercase",
    padding: "0 10px 10px",
    borderBottom: "1px solid #1a0a2e",
    marginBottom: 4,
  },
  sidebarItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "8px 10px",
    background: "transparent",
    border: "1px solid transparent",
    borderRadius: 7,
    cursor: "pointer",
    transition: "all 0.15s",
    textAlign: "left",
    width: "100%",
  },
  sidebarItemText: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  sidebarName: {
    fontFamily: "Georgia, serif",
    fontSize: 16,
  },
  sidebarRarity: {
    fontFamily: "monospace",
    fontSize: 11,
    color: "#443355",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  detail: {
    minHeight: 400,
  },
};

// Detail panel styles
const det: Record<string, React.CSSProperties> = {
  root: {
    flex: 1,
    backgroundImage: "linear-gradient(rgba(10, 6, 24, 0.75), rgba(10, 6, 24, 0.75)), url('/images/parchment_dark.jpg')",
    backgroundSize: "cover",
    border: "1px solid #2a1a3a",
    borderRadius: 12,
    padding: "28px 32px",
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 20,
  },
  headerText: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  name: {
    fontFamily: "Georgia, serif",
    fontSize: 28,
    letterSpacing: 1,
    textShadow: "0 0 20px currentColor, 2px 2px 4px rgba(0,0,0,0.8)",
    fontWeight: "bold",
    lineHeight: 1,
  },
  latin: {
    fontFamily: "monospace",
    fontSize: 13,
    color: "#554466",
    fontStyle: "italic",
    letterSpacing: 1,
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  sectionTitle: {
    fontFamily: "monospace",
    fontSize: 12,
    color: "#6633aa",
    letterSpacing: 3,
    textTransform: "uppercase",
  },
  body: {
    fontFamily: "Georgia, serif",
    fontSize: 16,
    color: "#d0b0d0", // Much lighter for contrast
    lineHeight: 1.75,
    textShadow: "1px 1px 3px rgba(0,0,0,0.9)",
    margin: 0,
  },
  lore: {
    fontFamily: "Georgia, serif",
    fontSize: 15,
    color: "#a080b0",
    lineHeight: 1.75,
    fontStyle: "italic",
    textShadow: "1px 1px 2px rgba(0,0,0,0.9)",
    margin: 0,
  },
  valueRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  valuePip: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Georgia, serif",
    fontSize: 16,
    fontWeight: "bold",
  },
  valueNote: {
    fontFamily: "monospace",
    fontSize: 13,
    color: "#443355",
  },
  effectBox: {
    background: "rgba(40,10,70,0.75)",
    boxShadow: "inset 0 0 10px rgba(0,0,0,0.5)",
    border: "1px solid transparent",
    borderRadius: 8,
    padding: "14px 16px",
  },
  warningBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    background: "rgba(120,20,0,0.5)",
    border: "1px solid #661100",
    borderRadius: 8,
    padding: "12px 16px",
  },
  warningIcon: {
    color: "#ff4422",
    fontSize: 16,
    flexShrink: 0,
    marginTop: 1,
  },
  warningText: {
    fontFamily: "monospace",
    fontSize: 14,
    color: "#cc4422",
    lineHeight: 1.6,
    margin: 0,
  },
};

// Omen tab styles
const om: Record<string, React.CSSProperties> = {
  root: {
    display: "flex",
    flexDirection: "column",
    gap: 24,
  },
  intro: {
    fontFamily: "Georgia, serif",
    fontSize: 16,
    color: "#6a4a7a",
    lineHeight: 1.75,
    textAlign: "center",
    maxWidth: 640,
    margin: "0 auto",
    fontStyle: "italic",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
    gap: 16,
  },
  card: {
    background: "linear-gradient(160deg, #0a0618 0%, #110828 100%)",
    border: "1px solid #2a0a4a",
    borderRadius: 12,
    padding: "22px 24px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  cardIcon: {
    fontSize: 24,
    color: "#7733bb",
    opacity: 0.7,
  },
  cardTitle: {
    fontFamily: "Georgia, serif",
    fontSize: 20,
    color: "#cc88ff",
    letterSpacing: 1,
  },
  cardCards: {
    fontFamily: "monospace",
    fontSize: 12,
    color: "#443355",
    letterSpacing: 1,
  },
  divider: {
    height: 1,
    background: "linear-gradient(90deg, transparent, #3a1a5a, transparent)",
    margin: "2px 0",
  },
  effectLabel: {
    fontFamily: "monospace",
    fontSize: 11,
    color: "#6633aa",
    letterSpacing: 3,
    textTransform: "uppercase",
  },
  effect: {
    fontFamily: "Georgia, serif",
    fontSize: 15,
    color: "#cc99ff",
    lineHeight: 1.6,
  },
  stratLabel: {
    fontFamily: "monospace",
    fontSize: 11,
    color: "#446633",
    letterSpacing: 3,
    textTransform: "uppercase",
  },
  strat: {
    fontFamily: "Georgia, serif",
    fontSize: 15,
    color: "#88aa77",
    lineHeight: 1.7,
    margin: 0,
    fontStyle: "italic",
  },
};

// Rules tab styles
const rl: Record<string, React.CSSProperties> = {
  root: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    maxWidth: 760,
    margin: "0 auto",
  },
  intro: {
    fontFamily: "Georgia, serif",
    fontSize: 14,
    color: "#6a4a7a",
    lineHeight: 1.75,
    textAlign: "center",
    fontStyle: "italic",
    marginBottom: 16,
  },
  section: {
    background: "rgba(10,6,24,0.7)",
    border: "1px solid #1a0a2e",
    borderRadius: 8,
    overflow: "hidden",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    width: "100%",
    background: "transparent",
    border: "none",
    padding: "15px 20px",
    cursor: "pointer",
    textAlign: "left",
    transition: "background 0.15s",
  },
  sectionNum: {
    fontFamily: "monospace",
    fontSize: 11,
    color: "#3a1a5a",
    letterSpacing: 1,
    flexShrink: 0,
  },
  sectionTitle: {
    fontFamily: "Georgia, serif",
    fontSize: 16,
    color: "#bb88ee",
    flex: 1,
    letterSpacing: 0.5,
  },
  chevron: {
    fontFamily: "monospace",
    fontSize: 10,
    color: "#6633aa",
    flexShrink: 0,
  },
  sectionBody: {
    padding: "4px 20px 20px 20px",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    borderTop: "1px solid #1a0a2e",
  },
  ruleLine: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    paddingTop: 8,
  },
  ruleBullet: {
    color: "#5a2a8a",
    fontSize: 11,
    flexShrink: 0,
    marginTop: 3,
  },
  ruleText: {
    fontFamily: "Georgia, serif",
    fontSize: 14,
    color: "#8a6a9a",
    lineHeight: 1.7,
  },
};
