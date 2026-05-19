import type { OmenCard } from "./omenTypes";

// The full Omen deck — one card is revealed at the start of each round.
// 9 rounds = 9 cards drawn from this shuffled deck.

export const OMEN_DECK: OmenCard[] = [
  {
    id: "omen-1",
    title: "The Void Hungers",
    description:
      "The dark between stars grows restless. This round, earn double Soulstones from your spiral position.",
    effect: { type: "double_soulstones" },
  },
  {
    id: "omen-2",
    title: "Whispers of the Deep",
    description:
      "Ancient voices guide your hand. Draw one extra token before choosing to stop.",
    effect: { type: "extra_draw" },
  },
  {
    id: "omen-3",
    title: "Curse of the Ashenveil",
    description:
      "The city's curse runs thick tonight. If your crucible explodes, lose 2 Soulstones.",
    effect: { type: "poison", penalty: 2 },
  },
  {
    id: "omen-4",
    title: "Blood Pact",
    description:
      "A pact sealed in shadow. If your crucible does not explode, gain 3 bonus prestige.",
    effect: { type: "bonus_score", points: 3 },
  },
  {
    id: "omen-5",
    title: "Eclipse of the Wraith Moon",
    description:
      "The wraith moon dims all magic. No special effects this round — only the brew matters.",
    effect: { type: "no_effect" },
  },
  {
    id: "omen-6",
    title: "Shadowtide",
    description:
      "The shadow tide rises. This round, earn double Soulstones from your spiral position.",
    effect: { type: "double_soulstones" },
  },
  {
    id: "omen-7",
    title: "Harbinger's Mark",
    description:
      "The harbinger watches those who falter. If your crucible explodes, lose 3 Soulstones.",
    effect: { type: "poison", penalty: 3 },
  },
  {
    id: "omen-8",
    title: "Veil of Fortune",
    description:
      "Fortune favours the steady hand. If your crucible does not explode, gain 5 bonus prestige.",
    effect: { type: "bonus_score", points: 5 },
  },
  {
    id: "omen-9",
    title: "The Final Convergence",
    description:
      "All forces align for the last brew. Draw one extra token before choosing to stop.",
    effect: { type: "extra_draw" },
  },
];

// Return a shuffled copy of the omen deck.
export function createShuffledOmenDeck(): OmenCard[] {
  const deck = [...OMEN_DECK];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

// Draw the top card from the deck.
// Returns the card and the remaining deck (immutable).
export function drawOmen(deck: OmenCard[]): {
  card: OmenCard;
  remaining: OmenCard[];
} | null {
  if (deck.length === 0) return null;
  const [card, ...remaining] = deck;
  return { card, remaining };
}
