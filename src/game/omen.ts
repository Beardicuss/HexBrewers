import type { OmenCard } from "./omenTypes";

// Renamed 24-card Fortune-style deck. The names and fiction are original to
// Ashenveil; the mechanical space mirrors the tabletop rhythm: small start
// bonuses, conditional rewards, color-count incentives, and ruby-space twists.
export const OMEN_DECK: OmenCard[] = [
  {
    id: "omen-01",
    title: "Ember in the Ash",
    description: "Every brewer pockets a live coal before the first stir.",
    summary: "All players gain 1 ruby.",
    effect: { type: "gain_rubies", amount: 1 },
  },
  {
    id: "omen-02",
    title: "The Cinder Toll",
    description: "The guild pays a modest bounty to keep the cauldrons lit.",
    summary: "All players gain 1 prestige.",
    effect: { type: "gain_vp", amount: 1 },
  },
  {
    id: "omen-03",
    title: "Borrowed Spark",
    description: "A safe ember is pressed into every brewer's palm.",
    summary: "All players gain 1 Brimstone.",
    effect: { type: "gain_chip", color: "orange", value: 1 },
  },
  {
    id: "omen-04",
    title: "The Crawling Moon",
    description: "The cauldrons wake a little closer to the edge.",
    summary: "All players advance their droplet 1 space.",
    effect: { type: "advance_droplet", amount: 1 },
  },
  {
    id: "omen-05",
    title: "Bones of Chance",
    description: "The omen die clatters before the brewing begins.",
    summary: "All players roll the bonus die.",
    effect: { type: "roll_bonus_die" },
  },
  {
    id: "omen-06",
    title: "Ashen Charity",
    description: "Those behind the Shade's pace find a hidden current.",
    summary: "Rat stones count 1 extra this round.",
    effect: { type: "extra_rat_stone", amount: 1 },
  },
  {
    id: "omen-07",
    title: "Quiet Hands",
    description: "The night favors brewers who leave the pot intact.",
    summary: "Surviving players gain 2 prestige.",
    effect: { type: "bonus_if_survived", vp: 2 },
  },
  {
    id: "omen-08",
    title: "Ruby Rain",
    description: "A steady brew draws red light from the rafters.",
    summary: "Surviving players gain 1 ruby.",
    effect: { type: "bonus_if_survived", rubies: 1 },
  },
  {
    id: "omen-09",
    title: "Mercy in Smoke",
    description: "Even a shattered pot may leave something useful behind.",
    summary: "Exploded players gain 1 ruby.",
    effect: { type: "bonus_if_exploded", rubies: 1 },
  },
  {
    id: "omen-10",
    title: "The Last Laugh",
    description: "Failure earns a scar, and scars carry reputation.",
    summary: "Exploded players gain 1 prestige.",
    effect: { type: "bonus_if_exploded", vp: 1 },
  },
  {
    id: "omen-11",
    title: "Thread of Death",
    description: "Deathweave hums louder under this sky.",
    summary: "Gain 1 prestige for each Deathweave in your pot.",
    effect: { type: "bonus_for_color", color: "green", vpPerChip: 1 },
  },
  {
    id: "omen-12",
    title: "Cold Ledger",
    description: "Frostbile leaves a glittering account in the bowl.",
    summary: "Gain 1 prestige for each Frostbile in your pot.",
    effect: { type: "bonus_for_color", color: "blue", vpPerChip: 1 },
  },
  {
    id: "omen-13",
    title: "Thorn Harvest",
    description: "Bloodthorn drinks deep and pays in rubies.",
    summary: "Gain 1 ruby for each Bloodthorn in your pot.",
    effect: { type: "bonus_for_color", color: "red", rubiesPerChip: 1 },
  },
  {
    id: "omen-14",
    title: "Golden Rot",
    description: "Plaguedust shines with useful corruption.",
    summary: "Gain 1 prestige for each Plaguedust in your pot.",
    effect: { type: "bonus_for_color", color: "yellow", vpPerChip: 1 },
  },
  {
    id: "omen-15",
    title: "Wraith Choir",
    description: "Wraithbloom petals sing to the score track.",
    summary: "Gain 1 prestige for each Wraithbloom in your pot.",
    effect: { type: "bonus_for_color", color: "purple", vpPerChip: 1 },
  },
  {
    id: "omen-16",
    title: "Moss Beneath Doors",
    description: "Shadowmoss roots catch stray gemstones.",
    summary: "Gain 1 ruby for each Shadowmoss in your pot.",
    effect: { type: "bonus_for_color", color: "black", rubiesPerChip: 1 },
  },
  {
    id: "omen-17",
    title: "Brimstone Chorus",
    description: "Safe fire makes a stronger name tonight.",
    summary: "Gain 1 prestige for each Brimstone in your pot.",
    effect: { type: "bonus_for_color", color: "orange", vpPerChip: 1 },
  },
  {
    id: "omen-18",
    title: "Measured Breath",
    description: "Restraint is rewarded when the void stays quiet.",
    summary: "If your Voidshard total is 4 or less, gain 2 prestige.",
    effect: { type: "bonus_for_white_limit", maxWhiteSum: 4, vp: 2 },
  },
  {
    id: "omen-19",
    title: "Steady Pulse",
    description: "A brewer who skirts danger without crossing it earns respect.",
    summary: "If your Voidshard total is 6 or less, gain 1 prestige.",
    effect: { type: "bonus_for_white_limit", maxWhiteSum: 6, vp: 1 },
  },
  {
    id: "omen-20",
    title: "Twin Rubies",
    description: "Ruby spaces flare brighter than they should.",
    summary: "Ruby scoring spaces pay 2 rubies this round.",
    effect: { type: "double_ruby_space" },
  },
  {
    id: "omen-21",
    title: "Spare Flask",
    description: "A courier arrives with enough glass for everyone.",
    summary: "All players gain 1 ruby.",
    effect: { type: "gain_rubies", amount: 1 },
  },
  {
    id: "omen-22",
    title: "Guild Applause",
    description: "The watchers are generous before the smoke rises.",
    summary: "All players gain 2 prestige.",
    effect: { type: "gain_vp", amount: 2 },
  },
  {
    id: "omen-23",
    title: "Hidden Ember",
    description: "Another safe spark drops into every bag.",
    summary: "All players gain 1 Brimstone.",
    effect: { type: "gain_chip", color: "orange", value: 1 },
  },
  {
    id: "omen-24",
    title: "Still Night",
    description: "No sign moves the brew. Only your nerve matters.",
    summary: "No special effect.",
    effect: { type: "no_effect" },
  },
];

export function createShuffledOmenDeck(): OmenCard[] {
  const deck = [...OMEN_DECK];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
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
