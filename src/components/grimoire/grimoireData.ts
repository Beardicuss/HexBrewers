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
        id: "start_boosts",
        title: "Opening Portents",
        effect: "Some omens grant rubies, prestige, droplet movement, a safe chip, or a bonus die roll before brewing.",
        description: "Ember in the Ash / Cinder Toll / Borrowed Spark / Crawling Moon / Bones of Chance",
        strategy:
            "These cards change your baseline before risk begins. A free Brimstone or droplet step makes pushing safer; early prestige or rubies may let you play more conservatively.",
        icon: "⬡",
    },
    {
        id: "survival_rewards",
        title: "Survival Rewards",
        effect: "If your crucible survives, gain extra prestige or rubies.",
        description: "Quiet Hands / Ruby Rain",
        strategy:
            "These reward discipline. Stop earlier than usual when your Voidshard pressure gets uncomfortable, because the survival bonus can outweigh one risky draw.",
        icon: "◈",
    },
    {
        id: "shatter_consolation",
        title: "Shatter Consolation",
        effect: "If your crucible shatters, gain a small ruby or prestige reward.",
        description: "Mercy in Smoke / The Last Laugh",
        strategy:
            "These soften failure but do not make explosion good. They are best treated as permission to push slightly harder when your bag is already strong.",
        icon: "⚠",
    },
    {
        id: "ingredient_omens",
        title: "Ingredient Omens",
        effect: "Specific ingredient colors in your pot pay extra prestige or rubies.",
        description: "Thread of Death / Cold Ledger / Thorn Harvest / Golden Rot / Wraith Choir / Moss Beneath Doors / Brimstone Chorus",
        strategy:
            "Let your bag composition guide the round. If the named ingredient is common in your bag, push to find it; if not, play normally and do not chase a low-probability bonus.",
        icon: "✦",
    },
    {
        id: "void_control",
        title: "Void Control",
        effect: "Low Voidshard pressure can pay bonus prestige.",
        description: "Measured Breath / Steady Pulse",
        strategy:
            "These cards strongly reward stopping before the bag turns sour. Count remaining whites carefully and treat the bonus as part of your scoring space.",
        icon: "◯",
    },
    {
        id: "ruby_spaces",
        title: "Ruby Space Omens",
        effect: "Ruby scoring spaces can pay double.",
        description: "Twin Rubies",
        strategy:
            "Ruby spaces become more valuable than usual. If you are one or two spaces away from a ruby scoring field, a controlled extra draw may be worth it.",
        icon: "◆",
    },
    {
        id: "catchup_omens",
        title: "Catchup Omens",
        effect: "Trailing brewers can receive stronger rat-stone help.",
        description: "Ashen Charity",
        strategy:
            "If you are behind, this is your chance to convert catchup distance into market money. If you are ahead, expect The Shade to start closer to danger and rewards.",
        icon: "↥",
    },
    {
        id: "still_night",
        title: "Still Night",
        effect: "No special rule.",
        description: "Still Night",
        strategy:
            "Pure brewing. No bonus to chase, no penalty to fear. Use the round to test your bag and buy for the next omen.",
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
            "24 cards are shuffled at the start of the game — one per round, no repeats.",
            "Some cards grant start bonuses, some reward survival or specific ingredients, and some change ruby or catchup value.",
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
