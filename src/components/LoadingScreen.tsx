import React from "react";
import type { GameSetup } from "../game/contentPacks";
import { BASE_OMEN_ART } from "../assets/baseAssets";
import { CORE_CHARACTER_PORTRAITS, CORE_ECONOMY_ASSETS, CORE_INGREDIENT_ASSETS, CORE_OMEN_ASSETS } from "../assets/coreAssets";
import { COVENANT_ACTIVATION_ASSETS, COVENANT_ART_ASSETS, COVENANT_SEAL_ASSETS, COVENANT_SPENT_SEAL_ASSETS, MIREWROUGHT_ASSETS } from "../assets/mirewroughtAssets";
import { AFFLICTION_EMBLEMS, AFFLICTION_PORTRAITS, REMEDY_PATH_ART, REMEDY_SYMBOLS, VEILGLASS_ASSETS, VEILGLASS_OMEN_ART } from "../assets/veilglassAssets";
import { ACTIVE_GAMEPLAY_SCENE_ID, GAMEPLAY_SCENES } from "../gameplaySceneThemes";

export type GameplayLoadingKind = "new" | "continue";

const POSTERS: Record<GameplayLoadingKind, string[]> = {
  new: [
    "/images/loading/loading-01.webp", "/images/loading/loading-02.webp", "/images/loading/loading-03.webp",
    "/images/loading/entry-ashenveil-portal.webp", "/images/loading/loading-ashen-bell.webp",
  ],
  continue: [
    "/images/loading/loading-04.webp", "/images/loading/loading-05.webp", "/images/loading/loading-06.webp",
    "/images/loading/entry-ashenveil-portal.webp", "/images/loading/loading-ashen-bell.webp",
  ],
};

const COPY: Record<GameplayLoadingKind, { label: string; detail: string }> = {
  new: { label: "SEALING THE NEW CRUCIBLE", detail: "The instruments are being placed for your first draw." },
  continue: { label: "REKINDLING THE INTERRUPTED BREW", detail: "Ash remembers where every ingredient fell." },
};

export function LoadingScreen({ kind, progress, error, onReturn }: { kind: GameplayLoadingKind; progress: number; error?: string | null; onReturn?: () => void }) {
  const [poster] = React.useState(() => {
    const pool = POSTERS[kind];
    return pool[Math.floor(Math.random() * pool.length)];
  });
  const copy = COPY[kind];
  return (
    <main className={`game-loading game-loading-${kind}`} style={{ ...styles.root, backgroundImage: `url('${poster}')` }} aria-live="polite" aria-label={copy.label}>
      <div style={styles.shade} />
      <div style={styles.content}>
        <img src="/images/title/title-en.webp" alt="Hexbrewers from Ashenveil" style={styles.logo} />
        <div style={styles.ornament}><i style={styles.ornamentLine} /><span style={styles.ornamentGem} /><i style={styles.ornamentLine} /></div>
        <p style={styles.loading}>{error ? "ASSET RITUAL INTERRUPTED" : copy.label}</p>
        <p style={styles.detail}>{error ?? copy.detail}</p>
        <div style={styles.track} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}>
          <span style={{ ...styles.fill, width: `${Math.max(4, progress)}%` }} />
        </div>
        <small style={styles.percent}>{Math.round(progress)}%</small>
        {error && <button type="button" className="ashen-route-button" style={styles.returnButton} onClick={onReturn}>◆ RETURN TO THE HALL ◆</button>}
      </div>
    </main>
  );
}

const BASE_GAMEPLAY_ASSETS = [
  GAMEPLAY_SCENES[ACTIVE_GAMEPLAY_SCENE_ID].video, GAMEPLAY_SCENES[ACTIVE_GAMEPLAY_SCENE_ID].poster,
  "/videos/hand-place-alpha.webm", ...Object.values(CORE_INGREDIENT_ASSETS), ...Object.values(CORE_ECONOMY_ASSETS),
  ...Object.values(CORE_CHARACTER_PORTRAITS), ...Object.values(CORE_OMEN_ASSETS), ...Object.values(BASE_OMEN_ART),
  "/sounds/token_draw.mp3", "/sounds/token-draw-anticipation.wav", "/sounds/token_place.mp3",
  "/sounds/token_place_white.mp3", "/sounds/voidshard-impact.wav", "/sounds/explosion.mp3",
  "/sounds/brew_stop.mp3", "/sounds/flask_use.mp3", "/sounds/market_buy.mp3", "/sounds/market_open.mp3",
  "/sounds/omen_reveal.mp3", "/sounds/round_start.mp3", "/sounds/game_win.mp3", "/sounds/game_lose.mp3",
  "/music/music-crucible-vigil.ogg", "/music/music-ninth-bell.ogg",
];

function assetsForSetup(setup: GameSetup): string[] {
  const assets = [...BASE_GAMEPLAY_ASSETS];
  if (setup.modules.patrons) {
    assets.push(
      ...Object.values(MIREWROUGHT_ASSETS), ...Object.values(COVENANT_SEAL_ASSETS),
      ...Object.values(COVENANT_SPENT_SEAL_ASSETS), ...Object.values(COVENANT_ACTIVATION_ASSETS),
      ...Object.values(COVENANT_ART_ASSETS), "/music/music-mirewrought.ogg",
      "/sounds/dlc/covenant-activate-bone.ogg", "/sounds/dlc/covenant-activate-moon.ogg",
      "/sounds/dlc/covenant-activate-blood.ogg", "/sounds/dlc/covenant-spent.ogg",
    );
  }
  if (setup.modules.distillation) {
    assets.push(
      ...Object.values(VEILGLASS_ASSETS).flatMap((value) => Array.isArray(value) ? value : [value]),
      ...Object.values(REMEDY_SYMBOLS), ...Object.values(AFFLICTION_PORTRAITS),
      ...Object.values(AFFLICTION_EMBLEMS), ...Object.values(REMEDY_PATH_ART),
      ...Object.values(VEILGLASS_OMEN_ART), "/music/music-veilglass.ogg",
      "/sounds/dlc/distillation-gain.ogg", "/sounds/dlc/retort-bottle-fill.ogg",
      "/sounds/dlc/remedy-complete.ogg", "/sounds/dlc/affliction-contract-bind.ogg",
    );
  }
  return [...new Set(assets)];
}

export async function preloadGamePresentation(setup: GameSetup, onProgress?: (progress: number) => void): Promise<void> {
  const assets = assetsForSetup(setup);
  let complete = 0;
  onProgress?.(0);
  const results: PromiseSettledResult<void>[] = new Array(assets.length);
  let nextIndex = 0;
  const worker = async () => {
    while (nextIndex < assets.length) {
      const index = nextIndex++;
      try {
        await preloadPresentationAsset(assets[index]);
        results[index] = { status: "fulfilled", value: undefined };
      } catch (reason) {
        results[index] = { status: "rejected", reason };
      } finally {
        complete += 1;
        onProgress?.((complete / assets.length) * 100);
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(6, assets.length) }, worker));
  const failed = results.flatMap((result, index) => result.status === "rejected" ? [assets[index]] : []);
  if (failed.length > 0) {
    console.error("Gameplay presentation assets failed to preload:", failed);
    throw new Error(`Unable to prepare ${failed.length} gameplay asset${failed.length === 1 ? "" : "s"}. Please check your connection and try again.`);
  }
}

function preloadPresentationAsset(url: string): Promise<void> {
  if (/\.(?:webp|png|jpe?g|avif)(?:\?|$)/i.test(url)) {
    const image = new Image();
    // Keep the cached response reusable by Pixi. A non-CORS image preload can
    // poison the browser cache with an opaque response that fetch() rejects.
    image.crossOrigin = "anonymous";
    image.src = url;
    return image.decode();
  }
  return fetch(url, { mode: "cors", cache: "force-cache" }).then(async (response) => {
    if (!response.ok) throw new Error(`Unable to preload ${url}: HTTP ${response.status}`);
    // Consume the full response so the browser cache contains the complete
    // media body before gameplay begins. Later audio/video elements reuse it.
    await response.arrayBuffer();
  });
}

const styles: Record<string, React.CSSProperties> = {
  root: { position: "fixed", inset: 0, zIndex: 900, display: "grid", placeItems: "center", backgroundPosition: "center", backgroundSize: "cover", color: "#d8bd83" },
  shade: { position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(2,1,7,.58),rgba(2,1,7,.92)),radial-gradient(circle,transparent,rgba(0,0,0,.72))" },
  content: { position: "relative", width: "min(84vw,760px)", display: "grid", justifyItems: "center", gap: 18, textAlign: "center" },
  logo: { width: "min(68vw,570px)", height: "auto", filter: "drop-shadow(0 10px 28px #000)" },
  ornament: { width: "min(58vw,430px)", display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 14, color: "#a98b50" },
  ornamentLine: { display: "block", height: 1, background: "linear-gradient(90deg,transparent,currentColor)" },
  ornamentGem: { display: "block", width: 11, height: 11, border: "1px solid currentColor", transform: "rotate(45deg)", boxShadow: "0 0 13px currentColor" },
  loading: { margin: 0, fontFamily: "monospace", fontSize: "clamp(16px,1.35vw,22px)", fontWeight: 700, letterSpacing: "clamp(2px,.45vw,6px)", color: "#e1c57f", textShadow: "0 2px 10px #000,0 0 18px rgba(214,177,93,.3)" },
  detail: { margin: 0, maxWidth: 620, color: "#d4c7ae", font: "italic clamp(15px,1.25vw,19px)/1.5 Georgia,serif", textShadow: "0 2px 9px #000" },
  track: { width: "min(62vw,470px)", height: 5, overflow: "hidden", border: "1px solid rgba(199,165,96,.36)", background: "rgba(10,5,16,.66)", boxShadow: "0 0 18px rgba(155,119,55,.12)" },
  fill: { display: "block", height: "100%", background: "linear-gradient(90deg,#73542b,#e0c06f,#77cbd0)", boxShadow: "0 0 15px rgba(224,192,111,.55)", transition: "width .18s ease-out" },
  percent: { color: "#bca36d", font: "600 13px/1 monospace", letterSpacing: 2 },
  returnButton: { marginTop: 4, padding: "12px 20px", color: "#e2c47c", borderColor: "rgba(218,181,104,.64)" },
};
