// ─── i18n Translation Key Types ──────────────────────────────────────────────

export type Language = "en" | "ru" | "ka";

export interface Translations {
    // ── Main Menu ──
    menu: {
        title: string;
        subtitle: string;
        newGame: string;
        grimoire: string;
        settings: string;
    };

    // ── Game Board ──
    game: {
        title: string;
        round: string;
        of: string;
        brewing: string;
        omen: string;
        scoring: string;
        rubySpend: string;
        market: string;
        blueChoice: string;
        gameOver: string;
        endOfRound: string;
        aiTurn: string;
        theShade: string;
        shadeBrewing: string;
        you: string;
    };

    // ── Player Panel ──
    player: {
        prestige: string;
        rubies: string;
        bag: string;
        tokens: string;
        voidshards: string;
        cursedVial: string;
        ready: string;
        spent: string;
        shattered: string;
    };

    // ── Brewing Controls ──
    brewing: {
        drawToken: string;
        stopBrewing: string;
        bagRemaining: string;
        whiteSum: string;
        flaskHint: string;
        riskLevel: string;
    };

    // ── Ruby Spend Panel ──
    rubySpend: {
        title: string;
        vpEarned: string;
        coinsEarned: string;
        bonusDie: string;
        rubiesLabel: string;
        advanceDroplet: string;
        refillFlask: string;
        proceedToMarket: string;
    };

    // ── Black Market ──
    marketScreen: {
        title: string;
        subtitle: string;
        coinsAvailable: string;
        buy: string;
        sold: string;
        leaveMarket: string;
        value: string;
    };

    // ── Blue Choice (Frostbile) ──
    blueChoice: {
        title: string;
        skip: string;
    };

    // ── Omen Card ──
    omen: {
        beginBrewing: string;
        bonusScore: string;
        extraWhite: string;
        marketDiscount: string;
        doubleSoulstones: string;
        poison: string;
        noEffect: string;
    };

    omenCards: Record<string, { title: string; description: string }>;

    // ── Game Over ──
    gameOver: {
        victory: string;
        defeated: string;
        victorySubtitle: string;
        defeatSubtitle: string;
        prestige: string;
        brewAgain: string;
        backToMenu: string;
    };

    // ── Exploded Choice ──
    exploded: {
        title: string;
        lastIngredient: string;
        oneVP: string;
    };

    // ── Settings ──
    settings: {
        video: string;
        audio: string;
        language: string;
        resolution: string;
        quality: string;
        qualityLow: string;
        qualityMedium: string;
        qualityHigh: string;
        masterVolume: string;
        musicVolume: string;
        sfxVolume: string;
        backToMenu: string;
        languageEnglish: string;
        languageRussian: string;
        languageGeorgian: string;
    };

    // ── Grimoire ──
    grimoire: {
        title: string;
        tabIngredients: string;
        tabRules: string;
        tabOmens: string;
        footer: string;
        lore: string;
        effect: string;
        flavor: string;
        startingBag: string;
        backToMenu: string;
        ingredientsLabel: string;
        tokenValuesLabel: string;
        descriptionLabel: string;
        gameEffectLabel: string;
        voidshardCount: string;
        otherCount: string;
        omensIntro: string;
        cardsLabel: string;
        strategyLabel: string;
        rulesIntro: string;
        // Ingredient names
        voidshard: string;
        brimstone: string;
        deathweave: string;
        frostbile: string;
        bloodthorn: string;
        plaguedust: string;
        wraithbloom: string;
        shadowmoss: string;
        // Ingredient subtitles
        voidshardSub: string;
        brimstoneSub: string;
        deathweaveSub: string;
        frostbileSub: string;
        bloodthornSub: string;
        plaguedustSub: string;
        wraithbloomSub: string;
        shadowmossSub: string;
        // Rule section titles
        ruleBagDrawing: string;
        ruleCrucible: string;
        ruleCursedVial: string;
        ruleScoringRubies: string;
        ruleBlackMarket: string;
        ruleRatStones: string;
        ruleGameEnd: string;
    };

    grimoireIngredientsData: Record<
        string,
        { description: string; effect: string; lore: string; warning?: string }
    >;
    grimoireOmensData: Record<
        string,
        { title: string; effect: string; description: string; strategy: string }
    >;
    grimoireRulesData: Record<
        string,
        { title: string; content: string[] }
    >;
}
