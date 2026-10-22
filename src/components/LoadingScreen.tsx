import React, { useState } from "react";
import type { GameSetup } from "../game/contentPacks";

const CURRENT_POSTERS = [
  "/images/loading/loading-01.webp",
  "/images/loading/loading-02.webp",
  "/images/loading/loading-03.webp",
  "/images/loading/loading-04.webp",
  "/images/loading/loading-05.webp",
  "/images/loading/loading-06.webp",
];

export function LoadingScreen() {
  const [poster] = useState(() => CURRENT_POSTERS[Math.floor(Math.random() * CURRENT_POSTERS.length)]);
  return (
    <main style={{ ...styles.root, backgroundImage: `url('${poster}')` }} aria-live="polite" aria-label="Loading game">
      <div style={styles.shade} />
      <div style={styles.content}>
        <img src="/images/title/title-en.webp" alt="Hexbrewers from Ashenveil" style={styles.logo} />
        <div style={styles.ornament}><i style={styles.ornamentLine} /><span style={styles.ornamentGem} /><i style={styles.ornamentLine} /></div>
        <p style={styles.loading}>PREPARING THE CRUCIBLE</p>
        <div style={styles.track}><span style={styles.fill} /></div>
      </div>
    </main>
  );
}

export async function preloadGamePresentation(setup: GameSetup): Promise<void> {
  const assets = [
    "/images/cauldron_bg.jpg",
    "/videos/cauldron-room-loop.webm",
    "/videos/hand-place-alpha.webm",
  ];
  if (setup.modules.patrons) assets.push("/images/dlc/mirewrought-pacts/mirewrought-pacts-key-art.webp");
  if (setup.modules.distillation) assets.push("/images/dlc/veilglass-afflictions/veilglass-afflictions-key-art.webp");
  await Promise.allSettled(assets.map(preloadPresentationAsset));
}

function preloadPresentationAsset(url: string): Promise<void> {
  if (/\.(?:webp|png|jpe?g|avif)$/i.test(url)) {
    const image = new Image();
    image.src = url;
    return image.decode();
  }
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const timeout = window.setTimeout(() => reject(new Error(`Timed out preloading ${url}`)), 12000);
    const finish = () => {
      window.clearTimeout(timeout);
      video.removeEventListener("loadeddata", finish);
      video.removeEventListener("error", fail);
      resolve();
    };
    const fail = () => {
      window.clearTimeout(timeout);
      reject(new Error(`Unable to preload ${url}`));
    };
    video.preload = "auto";
    video.muted = true;
    video.addEventListener("loadeddata", finish, { once: true });
    video.addEventListener("error", fail, { once: true });
    video.src = url;
    video.load();
  });
}

const styles: Record<string, React.CSSProperties> = {
  root: { position: "fixed", inset: 0, zIndex: 900, display: "grid", placeItems: "center", backgroundPosition: "center", backgroundSize: "cover", color: "#d8bd83" },
  shade: { position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(2,1,7,.62),rgba(2,1,7,.9)),radial-gradient(circle,transparent,rgba(0,0,0,.72))" },
  content: { position: "relative", width: "min(72vw,620px)", display: "grid", justifyItems: "center", gap: 15 },
  logo: { width: "min(62vw,500px)", height: "auto", filter: "drop-shadow(0 10px 28px #000)" },
  ornament: { width: "min(50vw,360px)", display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 12, color: "#957746" },
  ornamentLine: { display: "block", height: 1, background: "linear-gradient(90deg,transparent,currentColor)" },
  ornamentGem: { display: "block", width: 9, height: 9, border: "1px solid currentColor", transform: "rotate(45deg)", boxShadow: "0 0 10px currentColor" },
  loading: { margin: 0, fontFamily: "monospace", fontSize: 11, letterSpacing: 4, color: "#c6a96f" },
  track: { width: "min(48vw,340px)", height: 2, overflow: "hidden", background: "rgba(196,164,103,.18)" },
  fill: { display: "block", width: "42%", height: "100%", background: "linear-gradient(90deg,transparent,#d7b96f,transparent)", animation: "loadingSweep 1.3s ease-in-out infinite" },
};
