import type { ContentPackId } from "../game/contentPacks";

export type CharacterFaction = "hexbrewer" | "rival";

export interface GrimoireCharacter {
  id: string;
  name: string;
  epithet: string;
  faction: CharacterFaction;
  portrait?: string;
  requiredPack?: Exclude<ContentPackId, "base">;
  sigil: string;
  lore: string[];
}

const ROOT = "/images/core/characters";

/**
 * Draft canon for the Grimoire's Veiled Concordance.
 * Gameplay link: requiredPack controls portrait selection and the sealed treatment.
 */
export const GRIMOIRE_CHARACTERS: GrimoireCharacter[] = [
  {
    id: "hexbrewer",
    name: "The Ashen Heir",
    epithet: "Keeper of the Unlit Crucible",
    faction: "hexbrewer",
    portrait: `${ROOT}/portrait-hexbrewer.webp`,
    sigil: "✦",
    lore: [
      "No record names the child who was found beneath Ashenveil's eastern bell tower on the night its bronze tongue rang without wind. The wardens discovered only a soot-black cradle, a warm shard of glass, and an infant whose breath left small constellations upon the frost. The abbey called the child an omen. The old brewer Morcant called the child an heir, though he never explained to what.",
      "Years later, when Morcant vanished and every vessel in his workshop filled itself with cold ash, the heir claimed the abandoned crucible. They brew without prayer and refuse every patron, trusting instead the whisper heard between one heartbeat and the next. Some say that whisper belongs to Morcant. Others insist it comes from whatever waited below the bell tower—and has finally learned the heir's true name.",
    ],
  },
  {
    id: "lantern-widow",
    name: "The Lantern Widow",
    epithet: "She Who Counts the Drowned",
    faction: "hexbrewer",
    portrait: `${ROOT}/portrait-lantern-widow.png`,
    sigil: "◇",
    lore: [
      "Mara Vey once ferried the sick through the reed-choked canals north of Ashenveil. On moonless nights she hung nine lanterns from her skiff, one for every passenger who might not survive the crossing. During the Grey Flood, the boat returned empty except for Mara, still rowing, while ten lights burned behind her. She has never said who carried the final lantern.",
      "Her brews are pale, salt-scented things that reveal fingerprints on sealed doors and faces beneath still water. Mara enters the crucible trials to purchase ingredients no honest apothecary will sell. Each victory removes a name from the black ledger chained beneath her coat. Each defeat adds another. When all its pages are full, she believes the drowned will come ashore and ask why she alone was spared.",
    ],
  },
  {
    id: "crowglass-exile",
    name: "The Crowglass Exile",
    epithet: "Last Physician of Orison Ward",
    faction: "hexbrewer",
    portrait: `${ROOT}/portrait-crowglass-exile.png`,
    sigil: "◆",
    lore: [
      "Doctor Elian Crowglass served in Orison Ward, where plague victims dreamed the same dream and awoke speaking with one voice. He learned to bottle those dreams before dawn, separating fever from prophecy one silver drop at a time. The city praised his cures until a sealed ward was opened and found immaculate—beds made, candles burning, every patient gone, and their shadows still lying beneath the sheets.",
      "Banished to Ashenveil, Elian hides his face behind smoked lenses and measures every ingredient twice. He claims the voices in his bottles are only vapours settling. Yet whenever his crucible nears shattering, unseen patients gather at his shoulder and finish his calculations in a whisper. Elian seeks the formula that will return the missing ward. He fears he has already brewed it once and deliberately forgotten.",
    ],
  },
  {
    id: "bellless-sister",
    name: "The Bellless Sister",
    epithet: "Confessor of the Ninth Silence",
    faction: "hexbrewer",
    portrait: `${ROOT}/portrait-bellless-sister.png`,
    sigil: "✧",
    lore: [
      "Sister Vael belonged to an order that rang a silver bell whenever a soul departed. For three centuries the sound crossed the valley without fail. Then, during Vael's final vigil, the dead began rising before the bell could be struck. By dawn the tower was empty, its ropes severed from below, and Vael had cut the clapper from the ninth bell with her own hands.",
      "She carries that clapper wrapped in funeral linen and grinds a grain of its silver into every dangerous brew. The metal never diminishes. Vael says the dead do not hate the living; they envy our ability to choose badly and still continue. She enters each contest searching for the brewer whose final mistake will ring the bell inside her bundle. When it sounds, she intends to confess what truly happened in the tower.",
    ],
  },
  {
    id: "mirebound-sable",
    name: "Sable of the Root-Crown",
    epithet: "The Mire's Unfinished Bargain",
    faction: "hexbrewer",
    portrait: `${ROOT}/portrait-mirebound-sable.png`,
    requiredPack: "covenants_of_the_mire",
    sigil: "❖",
    lore: [
      "Sable was born where the old road sinks beneath black water and every tree grows with its roots exposed like grasping fingers. Three visitors attended the birth: a pale antlered shape, a woman reflected in the moonlit fen, and something red that spoke from inside the midwife's veins. Each offered protection. Sable's mother accepted all three, promising a payment when the child took a fifth seat at a stranger's table.",
      "Years later Sable emerged from the mire wearing a crown of living roots and carrying three unbroken seals. Bone remembers every wound they survive. Moonlight shortens the roads before them. Blood opens doors that were never built. The covenants call Sable their chosen vessel, but none can agree who owns the final debt. When the Root-Crown appears beside Ashenveil's crucible, four chairs become five—and somewhere beneath the marsh, three ancient creditors begin to count.",
    ],
  },
  {
    id: "the-shade",
    name: "The Shade",
    epithet: "First Rival of the Empty Flask",
    faction: "rival",
    portrait: `${ROOT}/portrait-the-shade.webp`,
    sigil: "◈",
    lore: [
      "The Shade arrived in Ashenveil before the town had walls. Old ledgers describe a courteous traveller who paid for an empty room and asked that every mirror be covered. By morning the traveller was gone, but the room's shadow remained standing upright. It learned the innkeeper's gestures, then his voice, then all the small cruelties he believed nobody had witnessed.",
      "Now it sits wherever brewers gather, patient and impeccably still. The Shade does not invent strategies; it remembers the choices its opponents regret and offers those choices back at the worst possible moment. Beneath its hood there is no face, only the reflection of a room that burned long ago. Defeating it earns no anger. It merely bows, takes the shape of your shadow, and waits to see what you will regret next.",
    ],
  },
  {
    id: "the-seer",
    name: "The Seer",
    epithet: "Witness to the Unchosen End",
    faction: "rival",
    portrait: `${ROOT}/portrait-the-seer.webp`,
    sigil: "◎",
    lore: [
      "The Seer was once Ilyra Nenn, an astronomer who charted stars visible only in bowls of poisoned water. Her final map predicted that Ashenveil would be destroyed on seven different nights. When none of those endings came to pass, Ilyra blinded herself in gratitude. The next morning she began describing an eighth ending—one that moved whenever anyone tried to prevent it.",
      "She plays by listening to futures collapse. Every token drawn silences a thousand possible worlds; every stopped brew leaves one narrow path trembling beneath her fingers. The Seer rarely speaks, but when she does it is to apologize for something her opponent has not yet done. She is not trying to win the trials. She is arranging losses in a precise order, building toward the single future in which Ashenveil survives her.",
    ],
  },
  {
    id: "the-hollow",
    name: "The Hollow",
    epithet: "The Man the Mire Returned",
    faction: "rival",
    portrait: `${ROOT}/portrait-the-hollow.webp`,
    sigil: "○",
    lore: [
      "A generation ago, hunters found a nameless man walking out of the southern bog with peat packed beneath his eyelids. He possessed no pulse, cast no reflection, and carried a child's wooden cup filled with warm rain. Whenever asked his name, he opened his mouth and the questioner's own voice answered from somewhere deep inside his chest.",
      "The Hollow brews to feel weight. Rubies give him warmth for a moment; Voidshards make his absent heart ache; prestige allows others to remember him after he leaves the room. None of it lasts. At night he empties every earned memory into the wooden cup and listens to someone small drinking on the other side. He believes that when the cup is finally full, the mire will return the child it kept—and take him back in exchange.",
    ],
  },
  {
    id: "the-wraith",
    name: "The Wraith",
    epithet: "Bearer of the Fifth Covenant",
    faction: "rival",
    portrait: `${ROOT}/portrait-the-wraith.webp`,
    requiredPack: "covenants_of_the_mire",
    sigil: "☽",
    lore: [
      "The oldest mire tablets warn of a fifth guest who must never be offered a chair. During the Covenant War, a nameless brewer broke that law and welcomed a rain-soaked stranger to the table. The stranger won without drawing from a bag. At sunrise four negotiators were found alive but emptied of their names, while the fifth chair continued breathing.",
      "The Wraith still carries that chair's shadow across its shoulders. Bone charms rattle where a face should be; moonwater drips upward from its robes; a red seal beats beneath its ribs like a borrowed heart. It can cross into Ashenveil only when the old pacts are spoken and a fifth place is prepared. Then it brews with terrifying courtesy, collecting every promise carelessly made around the crucible. The Wraith does not seek victory. It seeks the one descendant whose blood can finish the bargain begun at that forbidden table.",
    ],
  },
];
