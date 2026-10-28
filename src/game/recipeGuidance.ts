import type { RecipeColor } from "./recipeBooks";

export type RecipeSetNumber = 1 | 2 | 3 | 4 | 5 | 6;

export interface RecipeRuling {
  timing: string;
  choice: "Automatic" | "Optional";
  trigger: string;
  resolution: string;
  multiple: string;
  example: string;
  worksWellWith: string;
  tradeoff: string;
}

type GuidanceBySet = Record<RecipeSetNumber, RecipeRuling>;

const ruling = (
  timing: string,
  choice: RecipeRuling["choice"],
  trigger: string,
  resolution: string,
  multiple: string,
  example: string,
  worksWellWith: string,
  tradeoff: string,
): RecipeRuling => ({ timing, choice, trigger, resolution, multiple, example, worksWellWith, tradeoff });

/** Canonical player-facing rulings. Keep these aligned with brewingRules.ts and
 * chipEffects.ts; both the Grimoire and complete Codex render this dataset. */
export const RECIPE_GUIDANCE: Record<RecipeColor, GuidanceBySet> = {
  blue: {
    1: ruling("Immediately after placement", "Optional", "Place Frostbile.", "Draw chips equal to its printed value. Choose at most one to place and resolve normally; return every other sampled chip to the bag.", "Each Frostbile resolves separately. A kept Frostbile can begin another sample.", "A value-2 Frostbile samples two chips; you may place either one or neither.", "Plaguedust recovery and position-based Wraithbloom.", "More resolved draws can still expose Voidshards."),
    2: ruling("For the following draws", "Automatic", "Place Frostbile.", "Its value becomes the number of protected draws. If one of those draws shatters the crucible, you may keep both normal scoring rewards instead of choosing one.", "A new Frostbile keeps the larger remaining protection; protection does not add together.", "Value 2 protects the next two placed draws.", "High-value ingredients and raised pressure limits.", "It protects rewards, not the crucible; the brew still shatters."),
    3: ruling("Immediately after placement", "Automatic", "This Frostbile itself finishes on a ruby space.", "Gain 1 ruby.", "Every Frostbile checks its own landing space and may pay once.", "A Frostbile landing on space 9 gains one ruby.", "Ruby engines and droplet advancement.", "No reward on an ordinary space."),
    4: ruling("Immediately after placement", "Automatic", "This Frostbile itself finishes on a ruby space.", "Gain Prestige equal to its printed value.", "Each Frostbile checks and scores independently.", "A value-4 Frostbile landing on a ruby space gains 4 Prestige.", "Sequential Plaguedust movement and refined bags.", "Expensive chips can miss the required spaces."),
    5: ruling("Immediately after placement", "Automatic", "Pressure is 2 or lower after Frostbile is placed.", "Gain 1 ruby.", "Every qualifying Frostbile pays once.", "At pressure 2, a placed Frostbile grants one ruby.", "Early safe draws and ruby spending.", "Its payoff disappears once pressure rises above 2."),
    6: ruling("Immediately after placement", "Automatic", "Pressure is exactly 6 or 7 after Frostbile is placed.", "Gain Prestige equal to its printed value.", "Every qualifying Frostbile scores independently.", "At pressure 6, value-2 Frostbile gains 2 Prestige.", "Pressure control and late-brew timing.", "It asks you to remain close to shattering."),
  },
  red: {
    1: ruling("When movement is calculated", "Automatic", "Place Bloodthorn after Brimstones are already in the crucible.", "Move +1 with 1–2 earlier Brimstones, or +2 with 3 or more.", "Each Bloodthorn counts the Brimstones present when it is placed.", "With three Brimstones already placed, value-1 Bloodthorn moves 3.", "Brimstone density and safe movement.", "Brimstones drawn later do not improve an earlier Bloodthorn."),
    2: ruling("When drawn; decide after brewing", "Optional", "Draw Bloodthorn.", "Set it beside the crucible without moving. After brewing ends, choose separately for each reserved chip: place it now, save it beside the crucible for a later round, or return it to the bag.", "Every reserved Bloodthorn receives its own choice, and saved chips remain reserved between rounds.", "Two reserved Bloodthorns may be handled differently: place one now and save the other.", "End-position Deathweave and planned future rounds.", "Movement is delayed, and saving it denies its value to the current brew."),
    3: ruling("Immediately after placement", "Optional", "Bloodthorn is placed directly after a Voidshard.", "Move it additional spaces equal to that preceding Voidshard's printed value.", "Each qualifying Bloodthorn may take its own bonus.", "After a value-3 Voidshard, value-1 Bloodthorn may move 4 total.", "Voidshard recovery and exact-seven builds.", "The setup adds pressure before it adds movement."),
    4: ruling("For later value-1 Voidshards this round", "Automatic", "At least one Bloodthorn has already been placed.", "Every subsequently placed value-1 Voidshard moves one additional space.", "Additional Bloodthorns do not increase the bonus.", "After Bloodthorn, a value-1 Voidshard moves 2 but still adds only 1 pressure.", "Raised pressure limits and fast position builds.", "The extra movement can encourage another dangerous draw."),
    5: ruling("When movement is calculated", "Automatic", "Place Bloodthorn after distinct non-white colors.", "Move +1 for three distinct colors already present, or +2 for six; maximum +2.", "Each Bloodthorn recounts earlier colors when placed.", "Blue, yellow, and green already placed grant +1.", "Broad multicolor bags.", "Focused bags rarely reach the threshold."),
    6: ruling("When movement is calculated", "Automatic", "Place Bloodthorn after Echo Reeds.", "Move +1 per earlier Echo Reed, to a maximum of +3.", "Each Bloodthorn recounts Echo Reeds when placed.", "Two earlier Echo Reeds make value-2 Bloodthorn move 4.", "Echo Reed concentration.", "Requires Mirewrought ingredients and favorable order."),
  },
  yellow: {
    1: ruling("Immediately after placement", "Optional", "Plaguedust is placed directly after a Voidshard.", "Return that preceding Voidshard to the bag and subtract its value from pressure. Plaguedust remains where it landed.", "Each Plaguedust can return only the immediately preceding chip.", "Returning a value-2 Voidshard reduces pressure by 2.", "Selective Frostbile draws and aggressive stopping decisions.", "It cannot return an older Voidshard."),
    2: ruling("On the next placed chip", "Automatic", "Place Plaguedust.", "The next chip placed moves twice its normal calculated distance; then the effect ends.", "The effect does not stack. If the next chip is Plaguedust, that chip is doubled and creates a fresh effect for the following chip.", "A normally moving value-4 chip moves 8.", "High-value Bloodthorn and Frostbile.", "Hidden draw order may spend it on a weak chip."),
    3: ruling("Passive while brewing", "Automatic", "Have Plaguedust in the crucible.", "One or two raise the safe pressure limit from 7 to 8; three or more raise it to 9.", "Copies advance the two thresholds; they do not add one limit per chip.", "With three Plaguedusts, pressure 9 is safe and 10 shatters.", "Exact-seven Deathweave and risky draw engines.", "Safety alone produces no reward."),
    4: ruling("Immediately after each placement", "Optional", "Place your first, second, or third Plaguedust of the round.", "Move it +1, +2, or +3 respectively. Later Plaguedusts receive no bonus.", "The count is shared across all Plaguedust values.", "Your second Plaguedust may move two extra spaces.", "Position-band Wraithbloom and ruby-space Frostbile.", "Requires drawing several copies in useful order."),
    5: ruling("Immediately after placement", "Automatic", "Plaguedust is placed directly after a Voidshard.", "Gain 1 ruby.", "Every qualifying Plaguedust pays once.", "Two separate Voidshard→Plaguedust pairs gain two rubies.", "Ruby-spending engines.", "Adds no protection from the preceding pressure."),
    6: ruling("Immediately after placement", "Automatic", "Plaguedust is placed directly after a Voidshard.", "Advance the droplet 1 space.", "Every qualifying Plaguedust advances it once.", "A qualifying pair improves next round's starting position by one.", "Long-term droplet engines.", "The current brew still carries the Voidshard's danger."),
  },
  green: {
    1: ruling("During end-of-round evaluation", "Automatic", "Deathweave is one of the final two placed chips.", "Gain 1 ruby for each qualifying Deathweave.", "Both final spaces can qualify, for at most 2 rubies.", "If the last two chips are both Deathweave, gain 2 rubies.", "Controlled stopping and ruby conversion.", "Drawing once more can push it out of the final two."),
    2: ruling("During end-of-round evaluation", "Optional", "Deathweave is one of the final two placed chips.", "Value 1 gains Brimstone 1; value 2 chooses Frostbile 1 or Bloodthorn 1; value 4 chooses Plaguedust 1 or Wraithbloom 1. Rewards require available shared stock.", "Resolve each qualifying Deathweave separately in seating order.", "A final value-2 Deathweave may add Frostbile 1 to the bag.", "Deferred Bloodthorn and adaptive bag building.", "End position and shared stock can deny the desired reward."),
    3: ruling("During end-of-round evaluation", "Optional", "Finish with exactly 7 pressure and at least one Deathweave placed.", "Move the final placed chip additional spaces equal to the total printed value of all placed Deathweave.", "This is one combined movement, not one movement per Deathweave.", "Deathweave values 1 and 2 move the final chip +3.", "Raised pressure limits and deliberate exact-seven brewing.", "Missing exactly 7 yields nothing."),
    4: ruling("During end-of-round evaluation", "Optional", "Deathweave is one of the final two placed chips.", "For each qualifying Deathweave, you may spend 1 ruby to advance the droplet 1 space.", "Up to two conversions may occur, limited by your rubies.", "Two final Deathweaves and two rubies can advance the droplet twice.", "Ruby-space Frostbile and long-term starts.", "Competes with flask refills and other ruby uses."),
    5: ruling("During end-of-round evaluation", "Automatic", "Deathweave is one of the final two placed chips.", "Gain 1 Prestige for each qualifying Deathweave.", "Both final spaces may score, for at most 2 Prestige.", "One qualifying Deathweave gains 1 Prestige.", "Precise stopping.", "One extra draw can remove the payoff."),
    6: ruling("During end-of-round evaluation", "Automatic", "Deathweave is one of the final two placed chips.", "Advance the droplet 1 space for each qualifying Deathweave.", "Both final spaces may trigger, for at most 2 advances.", "Two qualifying copies advance the droplet twice.", "Long-term starting position.", "Low immediate movement and strict ending order."),
  },
  purple: {
    1: ruling("During end-of-round evaluation", "Optional", "Finish with placed Wraithblooms.", "Choose any unlocked milestone or skip: one grants 1 Prestige; two grant 1 Prestige and 1 ruby; three or more grant 2 Prestige and droplet +1.", "Milestones are not cumulative; resolve one choice total, and you may deliberately take a lower unlocked reward.", "With three Wraithblooms, you may take the three-copy reward or select either lower milestone instead.", "Collection and end-position engines.", "Copies move only one space and unlock late."),
    2: ruling("During end-of-round evaluation", "Optional", "Finish with placed Wraithblooms.", "Trade exactly 1 for Shadowmoss 1 +1 Prestige +1 ruby; 2 for Deathweave 1 + Frostbile 2 +3 Prestige +droplet 1; or 3 for Plaguedust 4 +6 Prestige +1 ruby +droplet 2. Rewards require stock.", "Choose one trade total; traded Wraithblooms leave the crucible.", "Trading two uses both placed copies and grants the complete two-copy package.", "Slow transmutation and tailored bag growth.", "Large setup cost and limited shared stock."),
    3: ruling("During end-of-round evaluation", "Automatic", "A Wraithbloom was placed on space 10 or farther.", "Each scores by its own landing space: 10–19 gains 1 Prestige, 20–29 gains 2, and 30+ gains 3.", "Score every Wraithbloom separately.", "Copies on spaces 12 and 22 score 1 + 2 Prestige.", "Movement multipliers and fast positioning.", "Copies below space 10 score nothing."),
    4: ruling("During end-of-round evaluation", "Optional", "Finish with placed Wraithblooms and own an eligible colored ingredient.", "Choose one upgrade total: with 1+ Wraithbloom upgrade one value 1→2; with 2+ upgrade one 2→4; with 3+ upgrade one 1→4. The old chip is removed and the new chip enters the bag; stock must exist.", "Only one upgrade is made, regardless of copy count.", "Three Wraithblooms may turn one value-1 colored chip directly into value 4.", "Long-term bag refinement.", "Late access leaves fewer rounds to recover the investment."),
    5: ruling("During end-of-round evaluation", "Automatic", "At least one Wraithbloom is placed.", "Gain Prestige equal to the number of distinct non-white colors in the crucible, maximum 4.", "Additional Wraithblooms do not repeat the score.", "Four distinct colors plus Wraithbloom gain 4 Prestige.", "Broad multicolor bags.", "Focused builds score less and extra copies add no score."),
    6: ruling("During end-of-round evaluation", "Automatic", "Finish with placed Wraithblooms.", "Gain 1 ruby per Wraithbloom and Prestige equal to their count, maximum 2 Prestige.", "Rubies continue per copy; only Prestige is capped at 2.", "Three copies gain 3 rubies and 2 Prestige.", "Ruby engines and collection.", "Low movement and high purchase cost."),
  },
};

export function getRecipeRuling(color: RecipeColor, set: number): RecipeRuling | undefined {
  return RECIPE_GUIDANCE[color]?.[set as RecipeSetNumber];
}
