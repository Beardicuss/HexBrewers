import { useMemo, useState, type CSSProperties } from "react";
import type { ContentPackId } from "../../game/contentPacks";
import { GRIMOIRE_CHARACTERS, type GrimoireCharacter } from "../../lore/characters";

export function CharactersTab({ enabledPacks }: { enabledPacks: ContentPackId[] }) {
  const [selectedId, setSelectedId] = useState(GRIMOIRE_CHARACTERS[0].id);
  const selected = useMemo(
    () => GRIMOIRE_CHARACTERS.find((character) => character.id === selectedId) ?? GRIMOIRE_CHARACTERS[0],
    [selectedId],
  );
  const sealed = Boolean(selected.requiredPack && !enabledPacks.includes(selected.requiredPack));

  return (
    <section className="concordance" style={styles.root}>
      <header style={styles.intro}>
        <span style={styles.eyebrow}>✦ THE VEILED CONCORDANCE ✦</span>
        <p style={styles.introText}>Nine names have gathered around Ashenveil's crucible. Some came to master it. Some came to be remembered. Two wait behind older vows, visible through the veil but beyond mortal reach.</p>
      </header>

      <div className="concordance-layout" style={styles.layout}>
        <nav className="concordance-gallery" style={styles.gallery} aria-label="Characters">
          {(["hexbrewer", "rival"] as const).map((faction) => (
            <div key={faction} style={styles.group}>
              <div style={styles.groupTitle}>{faction === "hexbrewer" ? "THE BREWERS" : "THE RIVALS"}</div>
              <div style={styles.cards}>
                {GRIMOIRE_CHARACTERS.filter((character) => character.faction === faction).map((character) => (
                  <CharacterButton
                    key={character.id}
                    character={character}
                    active={character.id === selected.id}
                    sealed={Boolean(character.requiredPack && !enabledPacks.includes(character.requiredPack))}
                    onSelect={() => setSelectedId(character.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        <article className={`concordance-reader${sealed ? " is-sealed" : ""}`} style={styles.reader}>
          <div style={styles.portraitColumn}>
            <Portrait character={selected} sealed={sealed} large />
            <span style={styles.faction}>{selected.faction === "hexbrewer" ? "HEXBREWER" : "RIVAL OF ASHENVEIL"}</span>
          </div>
          <div style={styles.copy}>
            <span style={styles.sigil}>{selected.sigil}　ARCHIVE {String(GRIMOIRE_CHARACTERS.indexOf(selected) + 1).padStart(2, "0")}</span>
            <h2 style={styles.name}>{selected.name}</h2>
            <div style={styles.epithet}>{selected.epithet}</div>
            {sealed && (
              <div style={styles.sealNotice}>
                <b>BOUND BEYOND THE MIRE-GATE</b>
                <span>The old covenants must be awakened before this identity may take a seat at the crucible.</span>
              </div>
            )}
            <div style={{ ...styles.lore, ...(sealed ? styles.loreSealed : {}) }}>
              {selected.lore.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

function CharacterButton({ character, active, sealed, onSelect }: {
  character: GrimoireCharacter;
  active: boolean;
  sealed: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={`concordance-card${active ? " is-active" : ""}${sealed ? " is-sealed" : ""}`}
      style={styles.card}
      onClick={onSelect}
      aria-pressed={active}
    >
      <Portrait character={character} sealed={sealed} />
      <span style={styles.cardName}>{character.name}</span>
      <small style={styles.cardEpithet}>{character.epithet}</small>
      {sealed && <i style={styles.lock}>✦ COVENANT-SEALED ✦</i>}
    </button>
  );
}

function Portrait({ character, sealed, large = false }: { character: GrimoireCharacter; sealed: boolean; large?: boolean }) {
  return (
    <span className={`concordance-portrait${large ? " is-large" : ""}`} style={{ ...styles.portrait, ...(large ? styles.portraitLarge : {}) }}>
      {character.portrait ? (
        <img src={character.portrait} alt={`Portrait of ${character.name}`} style={{ ...styles.image, ...(sealed ? styles.imageSealed : {}) }} />
      ) : (
        <span style={styles.missingPortrait} aria-label={`${character.name} portrait awaiting its likeness`}>
          <b>{character.sigil}</b>
          <small>LIKENESS<br />UNRECORDED</small>
        </span>
      )}
      <span style={styles.frame} aria-hidden="true" />
      {sealed && <span style={styles.seal} aria-hidden="true">⌾</span>}
    </span>
  );
}

const styles: Record<string, CSSProperties> = {
  root: { width: "min(1460px,96vw)", margin: "0 50%", transform: "translateX(-50%)", paddingBottom: 48 },
  intro: { maxWidth: 900, margin: "4px auto 22px", textAlign: "center" },
  eyebrow: { color: "#c49a55", fontFamily: "monospace", fontSize: 12, letterSpacing: 4 },
  introText: { color: "#d2c0aa", fontSize: 18, lineHeight: 1.65, fontStyle: "italic", textShadow: "0 2px 7px #000" },
  layout: { display: "grid", gridTemplateColumns: "minmax(480px,46%) minmax(0,54%)", gap: 34, alignItems: "start" },
  gallery: { display: "flex", flexDirection: "column", gap: 22 },
  group: { display: "flex", flexDirection: "column", gap: 9 },
  groupTitle: { paddingBottom: 7, borderBottom: "1px solid rgba(196,154,85,.28)", color: "#9d7f50", fontFamily: "monospace", fontSize: 10, letterSpacing: 3 },
  cards: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(164px,1fr))", gap: 14 },
  card: { minWidth: 0, padding: "10px 9px 13px", border: "1px solid rgba(120,76,145,.22)", borderRadius: 4, background: "linear-gradient(165deg,rgba(4,12,17,.76),rgba(6,3,13,.72))", color: "#d7c4ab", cursor: "pointer", textAlign: "center" },
  cardName: { display: "block", marginTop: 10, fontFamily: "Georgia,serif", fontSize: 18, lineHeight: 1.15 },
  cardEpithet: { display: "block", minHeight: 34, marginTop: 5, color: "#aaa0ae", fontFamily: "Georgia,serif", fontSize: 12, lineHeight: 1.35, fontStyle: "italic" },
  lock: { display: "block", marginTop: 7, color: "#b08a53", fontFamily: "monospace", fontSize: 9, letterSpacing: 1, fontStyle: "normal" },
  portrait: { position: "relative", display: "grid", placeItems: "center", width: "100%", aspectRatio: "4 / 5", overflow: "hidden", background: "radial-gradient(circle at 50% 38%,rgba(77,96,109,.28),rgba(2,7,11,.95) 72%)", isolation: "isolate" },
  portraitLarge: { width: "min(100%,410px)", filter: "drop-shadow(0 22px 30px rgba(0,0,0,.68))" },
  image: { width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", transition: "filter .25s,transform .25s" },
  imageSealed: { filter: "grayscale(.68) brightness(.48) contrast(1.15) sepia(.18)" },
  frame: { position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none", boxShadow: "inset 0 0 0 1px rgba(193,153,83,.46),inset 0 0 28px 10px rgba(0,0,0,.72)" },
  seal: { position: "absolute", zIndex: 3, display: "grid", placeItems: "center", width: "42%", aspectRatio: 1, border: "1px solid rgba(184,139,71,.75)", borderRadius: "50%", color: "#c49a55", background: "rgba(3,6,10,.72)", boxShadow: "0 0 24px rgba(184,104,54,.25),inset 0 0 18px rgba(184,104,54,.2)", fontSize: 34 },
  missingPortrait: { display: "flex", flexDirection: "column", alignItems: "center", gap: 9, color: "#86689a", textAlign: "center" },
  reader: { display: "grid", gridTemplateColumns: "minmax(220px,38%) minmax(0,62%)", gap: 32, minHeight: 590, padding: "24px 30px 30px", borderLeft: "1px solid rgba(196,154,85,.5)", background: "linear-gradient(105deg,rgba(2,9,13,.88),rgba(5,8,13,.64) 76%,transparent)", boxShadow: "inset 32px 0 60px -52px rgba(215,170,91,.5)" },
  portraitColumn: { display: "flex", flexDirection: "column", alignItems: "center", gap: 10 },
  faction: { color: "#84718c", fontFamily: "monospace", fontSize: 9, letterSpacing: 2.5 },
  copy: { paddingTop: 24 },
  sigil: { color: "#a776bc", fontFamily: "monospace", fontSize: 10, letterSpacing: 2 },
  name: { margin: "10px 0 5px", color: "#e3bd73", fontFamily: "Georgia,serif", fontSize: "clamp(30px,2.7vw,46px)", fontWeight: 400, letterSpacing: 1, textShadow: "0 2px 8px #000,0 0 22px rgba(195,126,72,.2)" },
  epithet: { paddingBottom: 15, borderBottom: "1px solid rgba(196,154,85,.28)", color: "#bca889", fontSize: 17, fontStyle: "italic" },
  sealNotice: { display: "flex", flexDirection: "column", gap: 4, margin: "17px 0 8px", padding: "10px 14px", borderLeft: "1px solid #9d7046", color: "#d0b478", background: "linear-gradient(90deg,rgba(85,48,20,.25),transparent)", fontFamily: "monospace", fontSize: 11, lineHeight: 1.45 },
  lore: { color: "#eee2cf", fontFamily: "Georgia,serif", fontSize: "clamp(16px,1.12vw,19px)", lineHeight: 1.72, textShadow: "0 2px 5px #000" },
  loreSealed: { color: "#c9bdad" },
};
