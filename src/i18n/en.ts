import type { Translations } from "./types";

export const en: Translations = {
    menu: {
        title: "Hexbrewers of Ashenveil",
        subtitle: "A Dark Fantasy Bag-Building Brewing Game",
        newGame: "New Game",
        grimoire: "Grimoire",
        settings: "Settings",
    },

    game: {
        title: "✦ Hexbrewers of Ashenveil ✦",
        round: "Round",
        of: "/",
        brewing: "BREWING",
        omen: "OMEN",
        scoring: "SCORING",
        rubySpend: "RUBY SPEND",
        market: "MARKET",
        blueChoice: "BLUE CHOICE",
        gameOver: "GAME OVER",
        endOfRound: "END OF ROUND",
        aiTurn: "AI TURN",
        theShade: "The Shade",
        shadeBrewing: "The Shade brews in silence...",
        you: "You",
    },

    player: {
        prestige: "✦ Prestige",
        rubies: "⬡ Rubies",
        bag: "◈ Bag",
        tokens: "tokens",
        voidshards: "Voidshards",
        cursedVial: "⚗ Cursed Vial",
        ready: "Ready",
        spent: "Spent",
        shattered: "✦ SHATTERED ✦",
    },

    brewing: {
        drawToken: "✦ Draw Token",
        stopBrewing: "✦ Stop Brewing",
        bagRemaining: "tokens remaining in bag",
        whiteSum: "Voidshard pressure",
        flaskHint: "⚗ Use Cursed Vial: return last Voidshard",
        riskLevel: "Risk",
    },

    rubySpend: {
        title: "✦ Round Complete ✦",
        vpEarned: "VP earned:",
        coinsEarned: "Coins earned:",
        bonusDie: "🎲 Bonus Die:",
        rubiesLabel: "rubies",
        advanceDroplet: "↑ Advance Droplet (2 rubies)",
        refillFlask: "⚗ Refill Cursed Vial (2 rubies)",
        proceedToMarket: "✦ End Round ✦",
    },

    marketScreen: {
        title: "✦ Black Market ✦",
        subtitle: "Purchase powerful ingredients for your bag",
        coinsAvailable: "⬡ Coins available:",
        buy: "Buy",
        sold: "Sold",
        leaveMarket: "✦ Leave Market ✦",
        value: "Value:",
    },

    blueChoice: {
        title: "✦ Frostbile Drawn ✦",
        skip: "✦ Skip ✦",
    },

    omen: {
        beginBrewing: "✦ Begin Brewing ✦",
        bonusScore: "⬡ Survive bonus: +{points} Prestige",
        extraWhite: "Extra Voidshard added to bags",
        marketDiscount: "Market prices reduced by {amount}",
        doubleSoulstones: "⬡ Soulstones × 2 this round",
        poison: "⬡ Explode penalty: −{penalty} Soulstones",
        noEffect: "⬡ No special effect",
    },

    omenCards: {
        "omen-1": {
            title: "The Void Hungers",
            description: "The dark between stars grows restless. This round, earn double Soulstones from your spiral position.",
        },
        "omen-2": {
            title: "Whispers of the Deep",
            description: "Ancient voices guide your hand. Draw one extra token before choosing to stop.",
        },
        "omen-3": {
            title: "Curse of the Ashenveil",
            description: "The city's curse runs thick tonight. If your crucible explodes, lose 2 Soulstones.",
        },
        "omen-4": {
            title: "Blood Pact",
            description: "A pact sealed in shadow. If your crucible does not explode, gain 3 bonus prestige.",
        },
        "omen-5": {
            title: "Eclipse of the Wraith Moon",
            description: "The wraith moon dims all magic. No special effects this round — only the brew matters.",
        },
        "omen-6": {
            title: "Shadowtide",
            description: "The shadow tide rises. This round, earn double Soulstones from your spiral position.",
        },
        "omen-7": {
            title: "Harbinger's Mark",
            description: "The harbinger watches those who falter. If your crucible explodes, lose 3 Soulstones.",
        },
        "omen-8": {
            title: "Veil of Fortune",
            description: "Fortune favours the steady hand. If your crucible does not explode, gain 5 bonus prestige.",
        },
        "omen-9": {
            title: "The Final Convergence",
            description: "All forces align for the last brew. Draw one extra token before choosing to stop.",
        },
    },

    gameOver: {
        victory: "✦ VICTORY ✦",
        defeated: "✦ DEFEAT ✦",
        victorySubtitle: "The shadows bow to your mastery",
        defeatSubtitle: "The Shade has outbrewed you",
        prestige: "prestige",
        brewAgain: "✦ Brew Again ✦",
        backToMenu: "← Back to Menu",
    },

    exploded: {
        title: "✦ Crucible Shattered! ✦",
        lastIngredient: "Take coins for market",
        oneVP: "Take victory points",
    },

    settings: {
        video: "VIDEO",
        audio: "AUDIO",
        language: "LANGUAGE",
        resolution: "Resolution",
        quality: "Graphics Quality",
        qualityLow: "Low",
        qualityMedium: "Medium",
        qualityHigh: "High",
        masterVolume: "Master Volume",
        musicVolume: "Music Volume",
        sfxVolume: "SFX Volume",
        backToMenu: "← Back to Menu",
        languageEnglish: "English",
        languageRussian: "Русский",
        languageGeorgian: "ქართული",
    },

    grimoire: {
        title: "Grimoire of Ashenveil",
        tabIngredients: "◈ Ingredients",
        tabRules: "✦ Rules",
        tabOmens: "✦ Omen Cards",
        footer: "✦ Hexbrewers of Ashenveil — Grimoire v1.0 ✦",
        lore: "Lore",
        effect: "Effect",
        flavor: "Flavor",
        startingBag: "Token Values in Starting Bag",
        backToMenu: "← Back to Menu",
        ingredientsLabel: "Ingredients",
        tokenValuesLabel: "Token Values in Starting Bag",
        descriptionLabel: "Description",
        gameEffectLabel: "Game Effect",
        voidshardCount: "{count} Voidshards in starting bag — total value {val}",
        otherCount: "{count} token(s) available at start",
        omensIntro: "At the start of each round, one Omen Card is drawn from a shuffled deck of 24. Its effect applies to all players for the entire round. Reading the Omen before you brew is not optional — it is the first rule of survival.",
        cardsLabel: "Cards:",
        strategyLabel: "Strategy",
        rulesIntro: "A good hexbrewer understands the rules. A surviving hexbrewer understands why they were written in the first place.",
        voidshard: "Voidshard",
        brimstone: "Brimstone",
        deathweave: "Deathweave",
        frostbile: "Frostbile",
        bloodthorn: "Bloodthorn",
        plaguedust: "Plaguedust",
        wraithbloom: "Wraithbloom",
        shadowmoss: "Shadowmoss",
        voidshardSub: "White — Explosive Essence",
        brimstoneSub: "Orange — Fiery Catalyst",
        deathweaveSub: "Green — Necrotic Thread",
        frostbileSub: "Blue — Frozen Venom",
        bloodthornSub: "Red — Crimson Barb",
        plaguedustSub: "Yellow — Toxic Spore",
        wraithbloomSub: "Purple — Spectral Petal",
        shadowmossSub: "Black — Gilded Lichen",
        ruleBagDrawing: "The Bag & Drawing",
        ruleCrucible: "The Crucible",
        ruleCursedVial: "The Cursed Vial",
        ruleScoringRubies: "Scoring & Rubies",
        ruleBlackMarket: "The Black Market",
        ruleRatStones: "Rat-Tail Stones",
        ruleGameEnd: "End of Game",
    },

    grimoireIngredientsData: {
        Voidshard: {
            description: "Fractured remnants of collapsed dimensional membranes, Voidshards are the most volatile ingredient in any hexbrewer's bag. Their pale luminescence belies a catastrophic instability.",
            effect: "Advances your position along the spiral by its value. Every Voidshard accumulates pressure — when the total value of all placed Voidshards exceeds 7, your crucible shatters instantly. No special effect beyond explosion risk.",
            lore: "\"Never trust a brew with no Voidshards — it will be weak. Never trust a brew with too many — you will not survive it.\" — Old hexbrewer proverb",
            warning: "CRITICAL: Track your Voidshard total at all times. 7 is the threshold of annihilation.",
        },
        Brimstone: {
            description: "Crystallised volcanic essence harvested from the geothermal vents beneath Ashenveil. Brimstone radiates heat that can be felt through leather gloves.",
            effect: "Safe ingredient — advances the spiral by 1 without adding to Voidshard pressure. No special effect.",
            lore: "\"The earth bleeds Brimstone so that we may brew without dying. Mostly.\" — Maren, Third-Rank Hexbrewer",
        },
        Deathweave: {
            description: "Silk harvested from the poisonous Ashenveil cave spider, treated with moonwater until its toxins become inert. The resulting thread glows with a sickly green phosphorescence.",
            effect: "End-of-round effect: Gain 1 ruby for each Deathweave chip that is one of the last two placed chips in your crucible.",
            lore: "\"I do not harvest the silk. I negotiate with the spider.\" — Ysolde the Pale",
        },
        Wraithbloom: {
            description: "A spectral flower that blooms only in places where the veil between worlds is thin. Its petals dissolve upon contact with sunlight, making it one of the most prized night-harvested reagents.",
            effect: "End-of-round effect: One Wraithbloom gives +1 VP; two give +1 VP and +1 ruby; three or more give +2 VP and advance your droplet 1 space.",
            lore: "\"It smells like rain, old books, and something you cannot name. Like grief made botanical.\" — Field notes, unknown hexbrewer",
        },
        Frostbile: {
            description: "Compressed ice-venom from the Frostbile serpents that inhabit the frozen Ashenveil undercity. Each chip is cold enough to blister bare skin and emits a faint blue corona.",
            effect: "Immediate effect: Draw additional chips from your bag equal to Frostbile's value. You may place one of them as your next chip and return the rest.",
            lore: "\"The serpents do not give their venom freely. Neither should you.\" — Master Hexbrewer Caldric",
        },
        Bloodthorn: {
            description: "Thorns extracted from the carnivorous Bloodthorn bramble that grows along the old execution walls. Each thorn is red-black and barbed, and hums faintly when near active magic.",
            effect: "Immediate effect: Bloodthorn advances extra spaces based on Brimstone already in your crucible. With 1-2 Brimstones it moves +1; with 3 or more it moves +2.",
            lore: "\"The bramble knows what you've done. It always does.\" — Ashenveil street warning",
        },
        Plaguedust: {
            description: "Fine golden powder scraped from the husks of plague-moths. Despite its origin, Plaguedust is non-infectious when crystallised, though hexbrewers still wear masks when handling it.",
            effect: "Immediate effect: If Plaguedust is placed directly after a Voidshard, you may return that Voidshard to your bag. The Plaguedust stays where it landed.",
            lore: "\"It smells terrible. It brews beautifully. Such is the nature of things.\" — Tavern hexbrewer, Ashenveil Lower Quarter",
        },
        Shadowmoss: {
            description: "A living darkness that grows in the deepest vaults beneath Ashenveil where no light has reached in centuries. Shadowmoss feeds on ambient magic and must be stored in obsidian containers.",
            effect: "End-of-round effect: Compare Shadowmoss counts with The Shade. If tied, advance your droplet 1 space. If you have more, advance your droplet and gain 1 ruby.",
            lore: "\"I have brewed with Shadowmoss once. Once was enough to understand why the old hexbrewers locked it away.\" — Caldric, in his final journal",
            warning: "Handle with caution. Shadowmoss has been known to shift position in sealed containers.",
        },
    },

    grimoireOmensData: {
        "double_soulstones": {
            title: "Double Soulstones",
            effect: "Earn ×2 Soulstones from your spiral position this round",
            description: "The Void Hungers / Shadowtide",
            strategy: "Push aggressively. The deeper you go on the spiral, the more scoring slots you hit — and this round they each pay double. Accept higher Voidshard risk than usual. Even a mid-range position becomes very lucrative.",
        },
        "extra_draw": {
            title: "Extra Draw",
            effect: "Draw one additional token before deciding to stop",
            description: "Whispers of the Deep / The Final Convergence",
            strategy: "Use the extra draw late — after you've already committed to stopping. It gives one free look at fate. If your Voidshard pressure is low, use it early. If you're near the threshold, use it as a last gamble.",
        },
        "poison": {
            title: "Explosion Penalty",
            effect: "If your crucible shatters, lose 2–3 Soulstones",
            description: "Curse of the Ashenveil / Harbinger's Mark",
            strategy: "Play conservatively. The penalty compounds a bad result — not only do you lose the dual reward for surviving, but you also bleed Soulstones you need for the market. Stop early, protect your resources.",
        },
        "bonus_score": {
            title: "Survival Bonus",
            effect: "If your crucible survives, gain 3–5 bonus prestige points",
            description: "Blood Pact / Veil of Fortune",
            strategy: "Do not explode. This is a round to play it safe — stop the moment your Voidshard pressure becomes uncomfortable. The bonus points reward discipline far more than a risky extra draw would.",
        },
        "no_effect": {
            title: "No Effect",
            effect: "No special rule this round",
            description: "Eclipse of the Wraith Moon",
            strategy: "Pure brewing. No bonus to chase, no penalty to fear. Use this round to evaluate your bag composition and plan your market purchases carefully. A calm round is a good round to test your limits.",
        },
    },

    grimoireRulesData: {
        "The Crucible Spiral": {
            title: "The Crucible Spiral",
            content: [
                "Your crucible is a spiral track of 33 positions. Each token you draw advances your position by the token's value.",
                "Your scoring space is the empty space directly after your last placed token. That space determines VP, coins, and ruby reward.",
                "Ruby rewards are checked on the scoring space, not on the token's own space.",
                "Your position resets to your droplet position at the start of each round — all tokens return to your bag.",
            ],
        },
        "The Bag & Drawing": {
            title: "The Bag & Drawing",
            content: [
                "Your bag starts with 9 tokens: 7 Voidshards (4×value-1, 2×value-2, 1×value-3), 1 Brimstone, 1 Deathweave.",
                "Each turn during brewing, you choose to Draw or Stop. Drawing pulls one random token from your bag.",
                "The drawn token is placed on the spiral at the next available position (current + token value).",
                "You continue drawing until you choose to stop, your bag empties, or your crucible shatters.",
            ],
        },
        "Voidshard Pressure": {
            title: "Voidshard Pressure",
            content: [
                "Every Voidshard placed on the spiral adds its value to your running Voidshard total.",
                "If your Voidshard total exceeds 7, your crucible SHATTERS. The round ends immediately.",
                "A shattered crucible forces you to choose: take VP from your position, OR take your coins. You cannot take both.",
                "A surviving crucible earns you BOTH VP AND coins. This is the core incentive to stop before shattering.",
            ],
        },
        "The Cursed Vial": {
            title: "The Cursed Vial",
            content: [
                "Once per round, you may use your Cursed Vial. It activates only on a white Voidshard token.",
                "Using it returns that token to your bag — as if it was never drawn. The Voidshard pressure is reversed.",
                "You cannot use the Vial if the Voidshard already caused an explosion.",
                "After use, the Vial is empty. Refilling costs 2 rubies during the ruby-spend phase.",
            ],
        },
        "Scoring & Rubies": {
            title: "Scoring & Rubies",
            content: [
                "VP are earned based on the scoring track (your spiral position). Coins equal your space number.",
                "If your crucible survived: collect both VP and coins.",
                "If your crucible shattered: choose one — VP OR coins.",
                "Evaluation order is bonus die, end-round chip effects, rubies, VP, buying, then ruby spending.",
                "Rubies are earned from ruby spaces and chip effects. At the end of the round, spend 2 rubies to advance your droplet 1 space or refill your Cursed Vial.",
            ],
        },
        "The Black Market": {
            title: "The Black Market",
            content: [
                "After scoring, the Black Market opens. Spend your coins to buy new ingredient tokens.",
                "You may buy up to 2 tokens per round, but they must be different colours.",
                "Purchased tokens are added directly to your bag — they will appear in future rounds.",
                "The market refreshes availability each round based on unlock rules.",
            ],
        },
        "Rat Tail Catchup": {
            title: "Rat Tail Catchup",
            content: [
                "From round 2 onward, trailing players get a head start. Count rat tail icons between your score and the leader's score.",
                "Your rat stone is placed that many spaces ahead of your droplet, giving you a longer starting position.",
                "The leader gets no bonus. This prevents runaway victories.",
            ],
        },
        "Omen Cards": {
            title: "Omen Cards",
            content: [
                "At the start of each round, an Omen Card is revealed. Its effect applies to all players this round.",
                "24 cards are shuffled at the start of the game — one per round, no repeats.",
                "Some cards grant start bonuses, some reward survival or specific ingredients, and some change ruby or catchup value.",
                "Adjust your risk tolerance based on the active Omen every single round.",
            ],
        },
        "Victory": {
            title: "Victory",
            content: [
                "The game lasts exactly 9 rounds. In round 6, an extra Voidshard (value 1) is added to every player's bag.",
                "At the end of round 9, remaining 5 coins or 2 rubies may be converted into 1 VP as often as possible.",
                "After round 9, the player with the highest total VP wins.",
                "Ties are broken by who reached the furthest scoring space in the final round. Further ties are shared.",
            ],
        },
    },
};
