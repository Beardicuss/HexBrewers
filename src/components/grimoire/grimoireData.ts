import type { TokenColor } from "../../game/tokenTypes";

// ─── Grimoire Data Types & Static Arrays ──────────────────────────────────────

export interface Ingredient {
    color: TokenColor;
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
            "CRITICAL: 7 pressure is safe. Your crucible shatters at 8 or more.",
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

export const COVENANT_INGREDIENTS: Ingredient[] = [
    {
        color: "echo",
        fill: "#082b28",
        glow: "#71f4d5",
        border: "#b8ffe9",
        name: "Echo Reed",
        latinName: "Calamus Resonans",
        rarity: "Rare",
        values: [0],
        description: "A marsh reed crystallised around the memory of every path not taken.",
        effect: "When drawn, its movement becomes your current catch-up offset, with a minimum value of 1. The resolved value is fixed when placed.",
        lore: "The reed repeats the distance between you and victory.",
    },
    {
        color: "orange",
        fill: "#351204",
        glow: "#ff8a24",
        border: "#ffc05d",
        name: "Embercore",
        latinName: "Cor Favillae",
        rarity: "Legendary",
        values: [6],
        description: "A soot-black mineral seed split by six veins of banked fire.",
        effect: "A safe orange ingredient that advances 6 spaces and counts as Brimstone for orange-based effects.",
        lore: "Even cold stone remembers the furnace that made it.",
    },
];

// ─── Rules ────────────────────────────────────────────────────────────────────

export const RULES: RuleEntry[] = [
    {
        title: "Setup & Round Flow",
        content: [
            "Choose 2–4 total brewers and one of four recipe-book sets. One seat is human; the remaining seats are AI opponents.",
            "Every brewer begins with the same nine-chip bag, 1 ruby, a filled Cursed Vial, and their droplet on the starting space.",
            "The starting seat rotates clockwise after every round. Omen choices and purchases that use limited stock resolve in that order.",
            "Each round proceeds through Omen, rat tails, brewing, evaluation, buying, and ruby spending.",
        ],
    },
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
        title: "Effect Timing & Decision Order",
        content: [
            "Resolve an immediate ingredient effect as soon as its chip is placed. A chip placed by that effect resolves its own immediate effect before brewing continues.",
            "A returned chip leaves empty distance in the crucible; later chips do not slide backward.",
            "After all brewers finish, resolve bonus dice before end-of-round ingredient effects.",
            "End-of-round choices and shared-stock rewards resolve clockwise from the rotating starting seat, followed by Omen rewards, ruby spaces, and scoring.",
            "The game pauses for every required human decision; skip is offered only when the rule permits it.",
        ],
    },
    {
        title: "Scoring & Rubies",
        content: [
            "VP are earned based on the scoring track (your spiral position). Coins equal your space number.",
            "If your crucible survived: collect both VP and coins.",
            "If your crucible shattered: choose one — VP OR coins.",
            "Every tied farthest surviving brewer rolls the bonus die. Evaluation then resolves end-round ingredient effects, rubies, VP, buying, and ruby spending.",
            "Rubies are earned from ruby spaces and chip effects. At the end of the round, spend 2 rubies to advance your droplet 1 space or refill your Cursed Vial.",
        ],
    },
    {
        title: "The Black Market",
        content: [
            "After scoring, the Black Market opens. Spend your coins to buy new ingredient tokens.",
            "You may buy up to 2 tokens per round, but they must be different colours.",
            "Purchased tokens are added directly to your bag — they will appear in future rounds.",
            "Market stock is shared by all brewers and is not replenished. New ingredient colours unlock in their printed rounds.",
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
        title: "Multiplayer Seating & Shared Stock",
        content: [
            "Games support 2–4 brewers. The human occupies one seat and AI opponents occupy the remaining seats.",
            "The starting seat rotates clockwise and controls ordered Omen choices, end effects, and market access.",
            "In a duel, Shadowmoss compares one opponent. With 3–4 players it compares both seated neighbors: beating one advances the droplet; beating both also grants a ruby.",
            "Market supply is shared. Stock taken by an earlier seat can become unavailable to later seats.",
            "Brewing outcomes are evaluated together although opponents are presented sequentially. Fast-forward changes presentation time only.",
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
            "At the end of round 9, every complete set of 5 unspent coins and every complete pair of rubies converts into 1 VP.",
            "After round 9, the player with the highest total VP wins.",
            "Tied leaders compare their final-round scoring spaces. If they are still tied, they share the victory.",
            "The physical final round uses simultaneous draws. This solo digital adaptation presents turns sequentially, then evaluates all finished crucibles together.",
        ],
    },
];

export const MIREWROUGHT_RULES: RuleEntry[] = [
    {
        title: "Mire Covenants",
        content: [
            "At setup, choose one Bone, one Moon, and one Blood Covenant for every brewer.",
            "Each brewer receives one matching seal of each kind. Every seal and its power may be used only once per match.",
            "Bone powers resolve during ruby spending, Moon powers before that brewer's first draw, and Blood powers during the market.",
            "Mirewrought Pacts permits a fifth brewer and adds The Hollow as the fourth AI identity.",
        ],
    },
    {
        title: "Abyssal Runoff & Mire Ingredients",
        content: [
            "The ingredient that reaches the final crucible space is placed normally. Later ingredients enter the Abyssal Runoff.",
            "Runoff ingredients add half their total printed value, rounded down, as prestige. Their colored ingredient actions do not activate.",
            "Echo Reed fixes its context-dependent movement when drawn. Embercore is a safe value-6 orange ingredient.",
            "Recipe sets 5 and 6 are available only while Mirewrought Pacts is enabled.",
        ],
    },
];

export const VEILGLASS_RULES: RuleEntry[] = [
    {
        title: "Distillation Phase",
        content: [
            "At setup, each brewer binds one of the three offered Affliction Contracts; multiple brewers may bind the same Contract.",
            "After brewing and before ordinary end-round scoring, every brewer completes Distillation.",
            "Gain 1 progress per distinct non-white ingredient color, +1 at exactly 7 Voidshard pressure, and +1 per adjacent shattered rival.",
            "A rival is counted once in a two-player game. With three or more brewers, only the seated left and right neighbors are checked.",
        ],
    },
    {
        title: "Afflictions & Remedy Paths",
        content: [
            "Your Contract converts this round's Distillation progress into its listed prestige, droplet movement, or next-brew head start.",
            "A delayed head start is added at the beginning of the following brew and is then consumed.",
            "In round 9, Distillation progress converts directly into equal prestige instead of the Contract's ordinary reward.",
            "Veilglass Omens may modify Distillation. Retort Resonance and Deep Resonance provide two optional Echo Reed recipes.",
        ],
    },
];
