// ─── Grimoire Data Types & Static Arrays ──────────────────────────────────────

export interface Ingredient {
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

export interface OmenEntry {
    id: string;
    title: string;
    effect: string;
    description: string;
    strategy: string;
    icon: string;
}

export interface RuleEntry {
    title: string;
    content: string[];
}

// ─── Ingredients ──────────────────────────────────────────────────────────────

export const INGREDIENTS: Ingredient[] = [
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
        values: [1],
        description:
            "Crystallised volcanic essence harvested from the geothermal vents beneath Ashenveil. Brimstone radiates heat that can be felt through leather gloves.",
        effect:
            "Safe ingredient — advances the spiral by 1 without adding to Voidshard pressure. No special effect. It is the cheapest safe chip in the market.",
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
        values: [1, 2, 4],
        description:
            "Silk harvested from the poisonous Ashenveil cave spider, treated with moonwater until its toxins become inert. The resulting thread glows with a sickly green phosphorescence.",
        effect:
            "End-of-round effect: Gain 1 ruby for each Deathweave chip that is one of the last two placed chips in your crucible.",
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
        values: [1],
        description:
            "A spectral flower that blooms only in places where the veil between worlds is thin. Its petals dissolve upon contact with sunlight, making it one of the most prized night-harvested reagents.",
        effect:
            "End-of-round effect: Count Wraithbloom chips in your crucible. One gives +1 VP; two give +1 VP and +1 ruby; three or more give +2 VP and advance your droplet 1 space.",
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
        values: [1, 2, 4],
        description:
            "Compressed ice-venom from the Frostbile serpents that inhabit the frozen Ashenveil undercity. Each chip is cold enough to blister bare skin and emits a faint blue corona.",
        effect:
            "Immediate effect: Draw additional chips from your bag equal to Frostbile's value. You may place one of those chips as your next chip, then return the rest to your bag. If the placed chip has an immediate effect, resolve it too.",
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
        values: [1, 2, 4],
        description:
            "Thorns extracted from the carnivorous Bloodthorn bramble that grows along the old execution walls. Each thorn is red-black and barbed, and hums faintly when near active magic.",
        effect:
            "Immediate effect: Bloodthorn advances extra spaces based on Brimstone already in your crucible. With 1-2 Brimstone chips it moves +1 space; with 3 or more it moves +2 spaces.",
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
        values: [1, 2, 4],
        description:
            "Fine golden powder scraped from the husks of plague-moths. Despite its origin, Plaguedust is non-infectious when crystallised, though hexbrewers still wear masks when handling it.",
        effect:
            "Immediate effect: If Plaguedust is placed directly after a Voidshard, you may return that Voidshard to your bag. The Plaguedust stays where it landed and the emptied space remains empty.",
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
            "End-of-round effect in a two-player duel: compare Shadowmoss counts with your opponent. If tied, advance your droplet 1 space. If you have more, advance your droplet 1 space and gain 1 ruby.",
        lore:
            "\"I have brewed with Shadowmoss once. Once was enough to understand why the old hexbrewers locked it away.\" — Caldric, in his final journal",
        warning: "Handle with caution. Shadowmoss has been known to shift position in sealed containers.",
    },
];

// ─── Omens ────────────────────────────────────────────────────────────────────

export const OMENS: OmenEntry[] = [
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

// ─── Rules ────────────────────────────────────────────────────────────────────

export const RULES: RuleEntry[] = [
    {
        title: "The Crucible Spiral",
        content: [
            "Your crucible is a spiral track of 33 positions. Each token you draw advances your position by the token's value.",
            "Your scoring space is the empty space directly after your last placed token. That space determines VP, coins, and ruby reward.",
            "Ruby rewards are checked on the scoring space, not on the token's own space.",
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
            "Evaluation order is bonus die, end-round chip effects, rubies, VP, buying, then ruby spending.",
            "Rubies are earned from ruby spaces and chip effects. At the end of the round, spend 2 rubies to advance your droplet 1 space or refill your Cursed Vial.",
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
            "At the end of round 9, remaining 5 coins or 2 rubies may be converted into 1 VP as often as possible.",
            "After round 9, the player with the highest total VP wins.",
            "Ties are broken by who reached the furthest scoring space in the final round. Further ties are shared.",
        ],
    },
];
