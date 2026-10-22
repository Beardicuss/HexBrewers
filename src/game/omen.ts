import type { OmenCard } from "./omenTypes";
import { gameplayRandom } from "./random";
import type { ContentPackId } from "./contentPacks";

// Renamed 24-card Fortune-style deck. The names and fiction are original to
// Ashenveil; the mechanical space mirrors the tabletop rhythm: small start
// bonuses, conditional rewards, color-count incentives, and ruby-space twists.
export const OMEN_DECK: OmenCard[] = [
  {
    id: "omen-01",
    title: "Ember in the Ash",
    description: "The omen die clatters once for every brewer before the first stir.",
    summary: "All players roll the bonus die once.",
    effect: { type: "roll_bonus_die" },
  },
  {
    id: "omen-02",
    title: "The Cinder Toll",
    description: "The guild pays a modest bounty to keep the cauldrons lit.",
    summary: "Choose whether to use rat tails normally or exchange 1–3 of them for the same number of rubies.",
    effect: { type: "choice_rat_tails_for_rubies" },
  },
  {
    id: "omen-03",
    title: "Borrowed Spark",
    description: "A safe ember is pressed into every brewer's palm.",
    summary: "All players advance their droplet 1 space.",
    effect: { type: "advance_droplet", amount: 1 },
  },
  {
    id: "omen-04",
    title: "The Crawling Moon",
    description: "The cauldrons wake a little closer to the edge.",
    summary: "Each player may trade 1 ruby for any value-1 ingredient except Wraithbloom or Shadowmoss.",
    effect: { type: "choice_ruby_for_one" },
  },
  {
    id: "omen-05",
    title: "Bones of Chance",
    description: "The omen die clatters before the brewing begins.",
    summary: "Each player samples 5 chips; the lowest total gains Frostbile 2 and the others gain 1 ruby.",
    effect: { type: "sample_five_lowest" },
  },
  {
    id: "omen-06",
    title: "Ashen Charity",
    description: "Those behind the Shade's pace find a hidden current.",
    summary: "Each player samples 4 chips and may upgrade one sampled ingredient of the same color.",
    effect: { type: "sample_four_upgrade" },
  },
  {
    id: "omen-07",
    title: "Quiet Hands",
    description: "The night favors brewers who leave the pot intact.",
    summary: "Choose 4 prestige or remove one value-1 Voidshard from your bag.",
    effect: { type: "choice_beginner_boost" },
  },
  {
    id: "omen-08",
    title: "Ruby Rain",
    description: "A steady brew draws red light from the rafters.",
    summary: "The player or players with the least prestige gain 1 Deathweave.",
    effect: { type: "fewest_vp_gain_chip", color: "green", value: 1 },
  },
  {
    id: "omen-09",
    title: "Mercy in Smoke",
    description: "Even a shattered pot may leave something useful behind.",
    summary: "Choose a Shadowmoss, any value-2 ingredient, or 3 rubies.",
    effect: { type: "choice_bounty" },
  },
  {
    id: "omen-10",
    title: "The Last Laugh",
    description: "Failure earns a scar, and scars carry reputation.",
    summary: "Double every rat-tail bonus this round.",
    effect: { type: "double_rat_tails" },
  },
  {
    id: "omen-11",
    title: "Thread of Death",
    description: "Deathweave hums louder under this sky.",
    summary: "Choose any value-4 ingredient or gain 1 prestige per rat tail.",
    effect: { type: "choice_rat_reward" },
  },
  {
    id: "omen-12",
    title: "Cold Ledger",
    description: "Frostbile leaves a glittering account in the bowl.",
    summary: "The player or players with the fewest rubies gain 1 ruby.",
    effect: { type: "fewest_rubies_gain_ruby", amount: 1 },
  },
  {
    id: "omen-13",
    title: "Thorn Harvest",
    description: "Bloodthorn drinks deep and pays in rubies.",
    summary: "Choose: advance your droplet 2 spaces or take 1 Wraithbloom.",
    effect: { type: "choice_droplet_or_purple" },
  },
  {
    id: "omen-14",
    title: "Golden Rot",
    description: "Plaguedust shines with useful corruption.",
    summary: "Ruby scoring spaces pay 2 rubies this round.",
    effect: { type: "double_ruby_space" },
  },
  {
    id: "omen-15",
    title: "Wraith Choir",
    description: "Wraithbloom petals sing to the score track.",
    summary: "Return the first Voidshard drawn this round to your bag.",
    effect: { type: "return_first_white" },
  },
  {
    id: "omen-16",
    title: "Moss Beneath Doors",
    description: "Shadowmoss roots catch stray gemstones.",
    summary: "A stopped brewer may sample up to 5 chips and place one without triggering its action.",
    effect: { type: "strong_ingredient" },
  },
  {
    id: "omen-17",
    title: "Brimstone Chorus",
    description: "Safe fire makes a stronger name tonight.",
    summary: "After placing the first 5 chips, each brewer may restart the round once.",
    effect: { type: "second_chance" },
  },
  {
    id: "omen-18",
    title: "Measured Breath",
    description: "Restraint is rewarded when the void stays quiet.",
    summary: "Exactly 7 Voidshard pressure advances your droplet 1 space.",
    effect: { type: "exact_white_seven_droplet" },
  },
  {
    id: "omen-19",
    title: "Steady Pulse",
    description: "A brewer who skirts danger without crossing it earns respect.",
    summary: "The explosion threshold is 9 this round.",
    effect: { type: "round_explosion_threshold", threshold: 9 },
  },
  {
    id: "omen-20",
    title: "Twin Rubies",
    description: "Ruby spaces flare brighter than they should.",
    summary: "All Cursed Vials refill for free at the end of the round.",
    effect: { type: "refill_flask" },
  },
  {
    id: "omen-21",
    title: "Spare Flask",
    description: "A courier arrives with enough glass for everyone.",
    summary: "When a brewer shatters, the player to their left gains any value-2 ingredient.",
    effect: { type: "explosion_left_neighbor_chip" },
  },
  {
    id: "omen-22",
    title: "Guild Applause",
    description: "The watchers are generous before the smoke rises.",
    summary: "Every Brimstone moves 1 additional space this round.",
    effect: { type: "orange_extra_movement", amount: 1 },
  },
  {
    id: "omen-23",
    title: "Hidden Ember",
    description: "Another safe spark drops into every bag.",
    summary: "A ruby scoring space also grants 2 additional prestige.",
    effect: { type: "ruby_space_bonus_vp", amount: 2 },
  },
  {
    id: "omen-24",
    title: "Still Night",
    description: "No sign moves the brew. Only your nerve matters.",
    summary: "Bonus-die winners roll twice this round.",
    effect: { type: "bonus_die_rolls", rolls: 2 },
  },
];

export const VEILGLASS_OMENS: OmenCard[] = [
  {
    id: "veil-omen-01",
    title: "Retort Rain",
    description: "Cold beads gather on every vessel and fall upward into the veil.",
    summary: "Every brewer gains 1 additional Distillation progress this round.",
    effect: { type: "distillation_bonus", amount: 1 },
  },
  {
    id: "veil-omen-02",
    title: "Sevenfold Refraction",
    description: "At perfect pressure, the retorts split one pale light into two.",
    summary: "Exactly 7 Voidshard pressure contributes 2 Distillation progress instead of 1.",
    effect: { type: "distillation_exact_seven", exactSevenValue: 2 },
  },
  {
    id: "veil-omen-03",
    title: "Cracks in Company",
    description: "A neighboring fracture rings twice through the listening glass.",
    summary: "Each adjacent shattered rival contributes 2 Distillation progress instead of 1.",
    effect: { type: "distillation_neighbor_echo", valuePerExplodedNeighbor: 2 },
  },
  {
    id: "veil-omen-04",
    title: "Mercy of the Thin Veil",
    description: "Weak tinctures draw substance from the air between worlds.",
    summary: "Every brewer's Distillation progress is at least 3 this round.",
    effect: { type: "distillation_minimum", minimum: 3 },
  },
];

export function omenDeckForPacks(enabledPacks: ContentPackId[] = ["base"]): OmenCard[] {
  return enabledPacks.includes("distillers_of_the_veil")
    ? [...OMEN_DECK, ...VEILGLASS_OMENS]
    : [...OMEN_DECK];
}

export function createShuffledOmenDeck(enabledPacks: ContentPackId[] = ["base"]): OmenCard[] {
  const deck = omenDeckForPacks(enabledPacks);
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(gameplayRandom() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export function drawOmen(deck: OmenCard[]): {
  card: OmenCard;
  remaining: OmenCard[];
} | null {
  if (deck.length === 0) return null;
  const [card, ...remaining] = deck;
  return { card, remaining };
}
