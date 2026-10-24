// ─── i18n Translation Key Types ──────────────────────────────────────────────
import type { AIMessageKey } from "../game/AITurnAnimator";

export type Language = "en" | "ru" | "ka";

export interface Translations {
    // ── Main Menu ──
    menu: {
        title: string;
        subtitle: string;
        newGame: string;
        continueGame: string;
        grimoire: string;
        dlcs: string;
        settings: string;
        players: string;
        difficulty: string;
        apprentice: string;
        skilled: string;
        master: string;
        expansions: string;
        covenantsOfTheMire: string;
        covenantsSummary: string;
        distillersOfTheVeil: string;
        distillersSummary: string;
        enabled: string;
        disabled: string;
        inDevelopment: string;
        echoRecipe: string;
        retortResonance: string;
        deepResonance: string;
    };

    dlc: {
        title: string;
        subtitle: string;
        backToMenu: string;
        returnToReliquary: string;
        statusEnabled: string;
        statusDisabled: string;
        enable: string;
        disable: string;
        inDevelopment: string;
        featuresTitle: string;
        storyTitle: string;
        mire: {
            title: string;
            tagline: string;
            summary: string;
            features: string[];
            story: string[];
        };
        veil: {
            title: string;
            tagline: string;
            summary: string;
            features: string[];
            story: string[];
        };
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
        distillation: string;
        aiTurn: string;
        theShade: string;
        shadeBrewing: string;
        you: string;
        setup: string;
        ratTails: string;
        yellowChoice: string;
        movementChoice: string;
        redChoice: string;
        greenChoice: string;
        greenMoveChoice: string;
        greenRewardChoice: string;
        purpleChoice: string;
        omenChoice: string;
        omenStrongChoice: string;
        omenRestartChoice: string;
        ingredientReaction: string;
        advancesSpaces: string;
        bonusMovement: string;
        rubyGained: string;
        decisionRequired: string;
        roundOpening: string;
        finalRound: string;
        omenAwaits: string;
        yourBrewBegins: string;
        brewDecision: string;
    };

    afflictions: {
        title: string; distillate: string; ashenBreath: string; glassveinChill: string; hollowBloom: string;
        roundResult: string;
        retort: string; pendingHeadStart: string;
        chooseTitle: string; chooseSubtitle: string; choose: string;
        contractNames: Record<string, string>;
        contractSymptoms: Record<string, string>;
        contractRewards: Record<string, string>;
    };

    covenants: {
        title: string;
        bone: string;
        boneEffect: string;
        moon: string;
        moonEffect: string;
        blood: string;
        bloodEffect: string;
        spent: string;
        chooseTitle: string;
        chooseSubtitle: string;
        confirm: string;
        kindNames: Record<string, string>;
        names: Record<string, string>;
        effects: Record<string, string>;
    };

    pause: {
        open: string;
        title: string;
        resume: string;
        settings: string;
        backToPause: string;
        restart: string;
        mainMenu: string;
        confirmRestart: string;
        confirmMenu: string;
        tutorial: string;
    };

    tutorial: {
        title: string;
        steps: [string, string, string, string, string];
        next: string;
        start: string;
        skip: string;
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
        opponentQueued: string;
        opponentBrewing: string;
        opponentStopped: string;
        opponentComplete: string;
    };

    // ── Brewing Controls ──
    brewing: {
        drawToken: string;
        accelerateDraw: string;
        stopBrewing: string;
        bagRemaining: string;
        whiteSum: string;
        flaskHint: string;
        riskLevel: string;
        safeLimit: string;
        shatterAtEight: string;
    };

    // ── Ruby Spend Panel ──
    rubySpend: {
        title: string;
        vpEarned: string;
        coinsEarned: string;
        bonusDie: string;
        rubiesOne: string;
        rubiesFew: string;
        rubiesMany: string;
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
        purchased: string;
        lockedUntilRound: string;
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

    omenCards: Record<string, { title: string; description?: string; summary?: string }>;

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

    choices: {
        yellowPrompt: string; returnIt: string; leaveIt: string;
        redMovePrompt: string; yellowMovePrompt: string; applyMovement: string; declineMovement: string;
        greenSpendPrompt: string; spendNone: string; spendRubies: string;
        greenMovePrompt: string; moveFinalChip: string; leaveFinalChip: string;
        greenRewardPrompt: string; rewardsPending: string;
        redPrompt: string; reserved: string; placeNow: string; saveIt: string; returnToBag: string;
        purplePrompt: string; purpleSkip: string;
        purpleSet1: [string, string, string];
        purpleSet2: [string, string, string];
        purpleUpgrade: string;
        omenPrompt: string;
        omenGainPrestige: string;
        omenGainRubies: string;
        omenAdvanceDroplet: string;
        omenRemoveWhite: string;
        omenGainIngredient: string;
        omenTradeIngredient: string;
        omenSkip: string;
        omenKeepRatTails: string;
        omenTradeRatTails: string;
        omenStrongPrompt: string;
        omenStrongSkip: string;
        omenUpgradeSample: string;
        omenRestartPrompt: string;
        omenContinue: string;
        omenRestart: string;
        omenUseFlask: string;
    };

    roundSummary: {
        title: string; shattered: string; stable: string; space: string;
        prestige: string; coins: string; ruby: string; die: string;
        runoff: string; runoffExplanation: string;
        bothExplanation: string; choiceExplanation: string; protectedExplanation: string;
        rubyExplanation: string; doubleRubyExplanation: string; dieExplanation: string;
        calculating: string; sealed: string; nextRound: string; continueRitual: string;
    };

    aiOverlay: {
        brewing: string; spiral: string; voidshards: string; shardSum: string; fastForward: string;
        drew: string; flaskReturned: string; stopped: string; shattered: string;
        scoredChoice: string; scoredBoth: string; complete: string;
        messages: Record<AIMessageKey, string>;
    };

    bonusDieRewards: {
        ruby: string; prestige: string; droplet: string; brimstone: string;
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
        presentationSpeed: string;
        presentationNormal: string;
        presentationFast: string;
        fullscreen: string;
        exitFullscreen: string;
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
        tabCharacters: string;
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
        activeRecipeSet: string;
        sharedStock: string;
        unlockRound: string;
        voidshardCount: string;
        otherCount: string;
        rarityCommon: string;
        rarityUncommon: string;
        rarityRare: string;
        rarityLegendary: string;
        omensIntro: string;
        cardsLabel: string;
        strategyLabel: string;
        rulesIntro: string;
        rulesQuickReference: string;
        rulesSearch: string;
        rulesNoResults: string;
        veilglassOmen: string;
        rulesRounds: string;
        rulesPlayers: string;
        rulesSafePressure: string;
        rulesExplosion: string;
        rulesMarketLimit: string;
        rulesRubyCost: string;
        // Ingredient names
        voidshard: string;
        brimstone: string;
        deathweave: string;
        frostbile: string;
        bloodthorn: string;
        plaguedust: string;
        wraithbloom: string;
        shadowmoss: string;
        echoReed: string;
        embercore: string;
        // Ingredient subtitles
        voidshardSub: string;
        brimstoneSub: string;
        deathweaveSub: string;
        frostbileSub: string;
        bloodthornSub: string;
        plaguedustSub: string;
        wraithbloomSub: string;
        shadowmossSub: string;
        recipeSet: string;
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
    grimoireRecipeSets: Record<string, Array<{ effect: string; costs: string }>>;
    grimoireOmensData: Record<
        string,
        { title: string; effect: string; description: string; strategy: string }
    >;
    grimoireRulesData: Record<
        string,
        { title: string; content: string[] }
    >;
}
