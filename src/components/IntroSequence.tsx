import React, { useEffect, useRef, useState } from "react";
import { soundManager } from "../SoundManager";

type IntroStage = "entry" | "softcurseReveal" | "softcurse" | "loading" | "trailerPrelude" | "trailer" | "trailerFade" | "darkNarration" | "postNarrationBlack" | "posterReveal" | "posterHold" | "poster";
const ENTRY_ART = "/images/loading/entry-ashenveil-portal.webp";
const INITIAL_LOADING_ART = "/images/loading/loading-ashen-bell.webp";
const SOFTCURSE_VIDEO = "/videos/intro/softcurse-systems.mp4";
const GAMEPLAY_LOADING_POSTERS = [
  "/images/loading/loading-01.webp", "/images/loading/loading-02.webp", "/images/loading/loading-03.webp",
  "/images/loading/loading-04.webp", "/images/loading/loading-05.webp", "/images/loading/loading-06.webp",
  ENTRY_ART, INITIAL_LOADING_ART,
];
const PRE_GAME_UI_ASSETS = [
  "/images/core/ui/new-game-silhouettes/difficulty-apprentice.png",
  "/images/core/ui/new-game-silhouettes/difficulty-skilled.png",
  "/images/core/ui/new-game-silhouettes/difficulty-master.png",
  "/images/core/ui/new-game-silhouettes/recipe-bag.png",
  "/images/core/ui/new-game-silhouettes/recipe-bag-opened.png",
  "/images/core/ui/new-game-silhouettes/player-count.png",
  "/images/core/ui/new-game-silhouettes/scrying-orb.png",
  "/images/core/ui/dlc-reliquary/skull-toggle.png",
  "/images/ui/softcurse-mark.webp",
];
const CHRONICLE_ASSETS = [
  "/images/core/chronicle/weekly-procession-empty-vials.webp",
  "/images/core/chronicle/tier-initiation-first-seals.webp",
  "/images/core/chronicle/tier-craft-crucibles-arts.webp",
  "/images/core/chronicle/tier-peril-lessons-that-bite.webp",
  "/images/core/chronicle/tier-mastery-hands-beyond-chance.webp",
  "/images/core/chronicle/trial-read-the-ashes.webp",
  "/images/core/chronicle/trial-the-willing-stop.webp",
  "/images/core/chronicle/trial-three-coins-ahead.webp",
  "/images/core/chronicle/trial-the-gentle-chain.webp",
  "/images/core/chronicle/trial-the-crimson-answer.webp",
  "/images/core/chronicle/trial-roots-beyond-nine.webp",
  "/images/core/chronicle/trial-the-vial-remembers.webp",
  "/images/core/chronicle/trial-a-bag-with-teeth.webp",
  "/images/core/chronicle/trial-under-nine-eyes.webp",
  "/images/core/chronicle/trial-the-long-conjunction.webp",
  "/images/core/chronicle/trial-the-changing-hand.webp",
  "/images/core/chronicle/trial-at-the-seventh-breath.webp",
  "/images/core/chronicle/honors/honor-first-seal.webp",
  "/images/core/chronicle/honors/honor-crucible-proven.webp",
  "/images/core/chronicle/honors/honor-a-name-in-gold.webp",
  "/images/core/chronicle/honors/honor-omen-listener.webp",
  "/images/core/chronicle/honors/honor-first-three-seals.webp",
  "/images/core/chronicle/honors/honor-three-arts-bound.webp",
  "/images/core/chronicle/honors/honor-the-unbroken-vessel.webp",
  "/images/core/chronicle/honors/honor-the-twelfth-seal.webp",
  "/images/core/chronicle/honors/honor-the-turning-seal.webp",
];
export const OPENING_ASSETS = [
  "/videos/intro/ashenveil-trailer-original.webm", "/audio/intro/ashenveil-trailer-narration.mp3?v=2",
  "/audio/intro/ashenveil-trailer-choir-tail.ogg?v=2", "/music/music-ashenveil-theme.ogg",
  "/images/intro/ashenveil-poster.webp", "/images/core/rooms/central-laboratory.webp",
  "/images/core/rooms/new-game-ritual-chamber.webp", "/images/core/rooms/grimoire-scriptorium.webp",
  "/images/core/rooms/dlc-reliquary.webp", "/images/core/rooms/settings-astrolabe.webp",
  "/videos/menu/central-laboratory.webm?v=2", "/videos/menu/new-game-ritual-chamber.webm?v=2",
  "/videos/menu/grimoire-scriptorium.webm?v=2", "/videos/menu/dlc-reliquary.webm?v=2",
  "/videos/menu/settings-astrolabe.webm?v=2", "/images/title/title-en.webp",
  "/images/ui/menu/menu-icon-continue.webp", "/images/ui/menu/menu-icon-new-game.webp",
  "/images/ui/menu/menu-icon-grimoire.webp", "/images/ui/menu/menu-icon-dlcs.webp", "/images/ui/menu/menu-icon-settings.webp",
  ...GAMEPLAY_LOADING_POSTERS, ...PRE_GAME_UI_ASSETS, ...CHRONICLE_ASSETS,
];

export function IntroSequence({ onComplete }: { onComplete: () => void }) {
  const [stage, setStage] = useState<IntroStage>("entry");
  const [progress, setProgress] = useState(0);
  const [entryReady, setEntryReady] = useState(false);
  const [entryDeparting, setEntryDeparting] = useState(false);
  const [soundUnlocked, setSoundUnlocked] = useState(false);
  const soundUnlockedRef = useRef(false);
  const softcurseRef = useRef<HTMLVideoElement>(null);
  const trailerRef = useRef<HTMLVideoElement>(null);
  const narrationRef = useRef<HTMLAudioElement>(null);
  const choirTailRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (stage !== "poster") return;
    const act = () => onComplete();
    window.addEventListener("pointerdown", act, { once: true });
    window.addEventListener("keydown", act, { once: true });
    return () => { window.removeEventListener("pointerdown", act); window.removeEventListener("keydown", act); };
  }, [stage, onComplete]);

  useEffect(() => {
    if (stage !== "entry") return;
    let cancelled = false;
    const image = new Image();
    image.src = ENTRY_ART;
    const imageReady = image.decode();
    const video = softcurseRef.current;
    const videoReady = !video || video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA
      ? Promise.resolve()
      : new Promise<void>((resolve, reject) => {
        video.addEventListener("canplaythrough", () => resolve(), { once: true });
        video.addEventListener("error", () => reject(new Error("Unable to prepare the Softcurse ident.")), { once: true });
      });
    void Promise.all([imageReady, videoReady])
      .catch(() => undefined)
      .finally(() => { if (!cancelled) setEntryReady(true); });
    return () => { cancelled = true; };
  }, [stage]);

  useEffect(() => {
    if (stage !== "softcurseReveal") return;
    const preload = new Image();
    preload.src = INITIAL_LOADING_ART;
    void preload.decode().catch(() => undefined);
    const video = softcurseRef.current;
    let frame = 0;
    const started = performance.now();
    if (video) {
      video.currentTime = 0;
      video.muted = false;
      video.volume = 0;
      void video.play().catch(() => undefined);
      const fadeAudio = (now: number) => {
        video.volume = Math.max(0, Math.min(0.82, 0.82 * ((now - started) / 900)));
        if (now - started < 900) frame = requestAnimationFrame(fadeAudio);
      };
      frame = requestAnimationFrame(fadeAudio);
    }
    const revealTimer = window.setTimeout(() => {
      if (video) video.volume = 0.82;
      setStage("softcurse");
    }, 900);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(revealTimer);
    };
  }, [stage]);

  useEffect(() => {
    if (!entryDeparting) return;
    const timer = window.setTimeout(() => setStage("softcurseReveal"), 4000);
    return () => window.clearTimeout(timer);
  }, [entryDeparting]);

  useEffect(() => {
    if (stage !== "loading") return;
    let cancelled = false;
    const started = performance.now();
    void Promise.allSettled(OPENING_ASSETS.map(async (url) => {
      if (/\.(?:webp|png|jpe?g|avif)(?:\?|$)/i.test(url)) {
        const preload = new Image();
        preload.crossOrigin = "anonymous";
        preload.src = url;
        await preload.decode();
      } else {
        await preloadTimedMedia(url);
      }
      if (!cancelled) setProgress((value) => Math.min(100, value + 100 / OPENING_ASSETS.length));
    })).then(() => {
      const wait = Math.max(0, 900 - (performance.now() - started));
      window.setTimeout(() => { if (!cancelled) setStage("trailerPrelude"); }, wait);
    });
    return () => { cancelled = true; };
  }, [stage]);

  useEffect(() => {
    if (stage !== "trailerPrelude") return;
    const trailerTimer = window.setTimeout(() => setStage("trailer"), 2500);
    return () => {
      window.clearTimeout(trailerTimer);
    };
  }, [stage]);

  useEffect(() => {
    if (stage !== "trailer") return;
    const video = trailerRef.current;
    const narration = narrationRef.current;
    let narrationTimer = 0;
    if (video) {
      video.currentTime = 0;
      video.playbackRate = 1;
      video.muted = !soundUnlockedRef.current;
      video.volume = 0.58;
      void video.play().catch(() => undefined);
    }
    if (narration) {
      narration.currentTime = 0;
      narration.muted = !soundUnlockedRef.current;
      narration.volume = 0.92;
      narrationTimer = window.setTimeout(() => void narration.play().catch(() => undefined), 1000);
    }
    return () => window.clearTimeout(narrationTimer);
  }, [stage]);

  useEffect(() => {
    if (stage !== "trailerFade") return;
    const trailer = trailerRef.current;
    const choirTail = choirTailRef.current;
    if (choirTail) {
      choirTail.currentTime = 0;
      choirTail.muted = !soundUnlockedRef.current;
      choirTail.volume = 0.52;
      void choirTail.play().catch(() => undefined);
    }
    const started = performance.now();
    const trailerVolume = trailer?.volume ?? 0;
    let frame = 0;
    const fadeAudio = (now: number) => {
      const remaining = Math.max(0, 1 - (now - started) / 1000);
      if (trailer) trailer.volume = trailerVolume * remaining;
      if (remaining > 0) frame = requestAnimationFrame(fadeAudio);
    };
    frame = requestAnimationFrame(fadeAudio);
    const timer = window.setTimeout(() => {
      trailer?.pause();
      setStage("darkNarration");
    }, 1000);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [stage]);

  useEffect(() => {
    if (stage !== "postNarrationBlack") return;
    const timer = window.setTimeout(() => setStage("posterReveal"), 1000);
    return () => window.clearTimeout(timer);
  }, [stage]);

  useEffect(() => {
    if (stage !== "posterReveal") return;
    soundManager.switchMusic("music_ashenveil", 2500);
    const timer = window.setTimeout(() => setStage("posterHold"), 2500);
    return () => window.clearTimeout(timer);
  }, [stage]);

  useEffect(() => {
    if (stage !== "posterHold") return;
    const timer = window.setTimeout(() => setStage("poster"), 1000);
    return () => window.clearTimeout(timer);
  }, [stage]);

  const skip = () => {
    const softcurse = softcurseRef.current;
    const trailer = trailerRef.current;
    const narration = narrationRef.current;
    const choirTail = choirTailRef.current;
    softcurse?.pause();
    trailer?.pause();
    narration?.pause();
    choirTail?.pause();
    if (softcurse) softcurse.currentTime = 0;
    if (trailer) trailer.currentTime = 0;
    if (narration) narration.currentTime = 0;
    if (choirTail) choirTail.currentTime = 0;
    if (stage === "softcurse") {
      setStage("loading");
      return;
    }
    setStage("poster");
  };

  const enterAshenveil = () => {
    if (!entryReady || entryDeparting) return;
    soundUnlockedRef.current = true;
    setSoundUnlocked(true);
    void soundManager.init();
    setEntryDeparting(true);
    const video = softcurseRef.current;
    if (video) {
      video.currentTime = 0;
      video.muted = false;
      video.volume = 0;
      void video.play().then(() => video.pause()).catch(() => undefined);
    }
  };

  return (
    <main style={styles.root} aria-label="Hexbrewers of Ashenveil opening sequence">
      <style>{`
        @keyframes entry-breathe {
          0%, 100% { box-shadow: 0 0 20px rgba(78,198,203,.12), inset 0 0 18px rgba(78,198,203,.06); }
          50% { box-shadow: 0 0 42px rgba(78,198,203,.28), inset 0 0 26px rgba(78,198,203,.1); }
        }
        @keyframes entry-camera-rush {
          0% { transform: translate3d(0,0,0) scale(1); }
          40% { transform: translate3d(0,0,0) scale(1.6); }
          100% { transform: translate3d(0,0,0) scale(6); }
        }
        @keyframes entry-through-veil {
          0%, 35% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes entry-color-journey {
          0% { background-color: #087987; }
          20% { background-color: #1799a4; }
          40% { background-color: #36b4bc; }
          60% { background-color: #6dced0; }
          78% { background-color: #a9e5e2; }
          90% { background-color: #d7f3ef; }
          100% { background-color: #ffffff; }
        }
        @keyframes entry-release {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes poster-reveal {
          0% { opacity: 0; filter: brightness(.35) blur(7px); transform: scale(1.018); }
          55% { opacity: 1; filter: brightness(.82) blur(1px); }
          100% { opacity: 1; filter: brightness(1) blur(0); transform: scale(1); }
        }
      `}</style>
      <video ref={softcurseRef} src={SOFTCURSE_VIDEO} muted={!soundUnlocked} playsInline preload="auto"
        onEnded={() => setStage("loading")} style={{ ...styles.video, opacity: stage === "softcurseReveal" || stage === "softcurse" ? 1 : 0 }} />
      <video ref={trailerRef} src="/videos/intro/ashenveil-trailer-original.webm" playsInline preload="auto"
        onTimeUpdate={(event) => {
          const video = event.currentTarget;
          if (stage === "trailer" && Number.isFinite(video.duration) && video.duration - video.currentTime <= 1.05) {
            setStage("trailerFade");
          }
        }}
        style={{
          ...styles.video,
          opacity: stage === "trailer" ? 1 : 0,
          transition: stage === "trailerFade" ? "opacity 1s ease-in" : "none",
          visibility: stage === "darkNarration" || stage === "postNarrationBlack" || stage === "posterReveal" || stage === "posterHold" || stage === "poster" ? "hidden" : "visible",
          pointerEvents: stage === "trailer" ? "auto" : "none",
        }} />
      <audio ref={narrationRef} src="/audio/intro/ashenveil-trailer-narration.mp3?v=2" crossOrigin="anonymous" preload="auto" onEnded={() => setStage("postNarrationBlack")} />
      <audio ref={choirTailRef} src="/audio/intro/ashenveil-trailer-choir-tail.ogg?v=2" crossOrigin="anonymous" preload="auto" />
      {(stage === "entry" || stage === "softcurseReveal") && (
        <div className={stage === "softcurseReveal" ? "entry-screen is-revealing" : "entry-screen"} style={styles.artScreen}>
          <div className={entryDeparting ? "entry-rush is-departing" : "entry-rush"} style={styles.entryRush}>
            <img src={ENTRY_ART} alt="" aria-hidden="true" draggable={false} style={styles.entryImage} />
            <div style={styles.entryShade} />
            <div style={styles.entryContent}>
              <p style={styles.entryLine}>Ashenveil waits in silence.</p>
              <button type="button" style={styles.entryButton} onClick={enterAshenveil} disabled={!entryReady || entryDeparting}>
                {entryReady ? "ENTER ASHENVEIL" : "PREPARING ASHENVEIL…"}
              </button>
            </div>
          </div>
          <div className={entryDeparting ? "entry-veil is-departing" : "entry-veil"} style={styles.entryVeil} />
          <style>{`
            .entry-rush.is-departing{pointer-events:none;animation:entry-camera-rush 1400ms cubic-bezier(.4,0,1,1) forwards}
            .entry-veil.is-departing{animation:entry-through-veil 1400ms ease-in forwards,entry-color-journey 1600ms linear 1400ms forwards}
            .entry-screen.is-revealing{pointer-events:none;animation:entry-release 900ms cubic-bezier(.22,.61,.36,1) forwards}
            @media(max-width:768px){@keyframes entry-camera-rush{0%{transform:translate3d(0,0,0) scale(1)}40%{transform:translate3d(0,0,0) scale(1.3)}100%{transform:translate3d(0,0,0) scale(3)}}}
            @media(prefers-reduced-motion:reduce){.entry-rush.is-departing{animation:none}.entry-veil.is-departing{animation:entry-through-veil .5s ease-in forwards,entry-color-journey 1600ms linear 1400ms forwards}}
          `}</style>
        </div>
      )}
      {stage === "loading" && (
        <div style={{ ...styles.artScreen, backgroundImage: `url('${INITIAL_LOADING_ART}')` }}>
          <div style={styles.shade} /><div style={styles.loadingContent}>
            <p style={styles.loadingText}>OPENING THE WAY TO ASHENVEIL</p>
            <div style={styles.track}><span style={{ ...styles.fill, width: `${progress}%` }} /></div>
          </div>
        </div>
      )}
      {(stage === "posterReveal" || stage === "posterHold" || stage === "poster") && (
        <div style={{ ...styles.artScreen, ...styles.posterReveal, backgroundImage: "url('/images/intro/ashenveil-poster.webp')" }}>
          <div style={styles.posterShade} /><img src="/images/title/title-en.webp" alt="Hexbrewers from Ashenveil" style={styles.logo} />
          {stage === "poster" && <p style={styles.continue}>PRESS ANY KEY TO CONTINUE</p>}
        </div>
      )}
      {(stage === "softcurse" || stage === "trailerPrelude" || stage === "trailer") && <button type="button" className="cinematic-skip" onClick={skip} style={styles.skip}>Skip</button>}
    </main>
  );
}

function preloadTimedMedia(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const media = document.createElement(/\.(?:mp3|ogg|wav)(?:\?|$)/i.test(url) ? "audio" : "video");
    const timeout = window.setTimeout(() => reject(new Error(`Timed out preloading ${url}`)), 30000);
    const finish = () => { window.clearTimeout(timeout); media.src = ""; resolve(); };
    const fail = () => { window.clearTimeout(timeout); reject(new Error(`Unable to preload ${url}`)); };
    if (url.includes("/music/")) media.crossOrigin = "anonymous";
    media.crossOrigin = "anonymous";
    media.preload = "auto";
    media.muted = true;
    media.addEventListener("canplaythrough", finish, { once: true });
    media.addEventListener("error", fail, { once: true });
    media.src = url;
    media.load();
  });
}

const styles: Record<string, React.CSSProperties> = {
  root: { position: "fixed", inset: 0, zIndex: 1000, overflow: "hidden", background: "#000", color: "#d8bd83" },
  video: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", background: "#000", transition: "opacity .45s ease" },
  artScreen: { position: "absolute", inset: 0, display: "grid", placeItems: "center", backgroundPosition: "center", backgroundSize: "cover" },
  entryRush: { position: "absolute", inset: 0, overflow: "hidden", display: "grid", placeItems: "center", transformOrigin: "50% 47%", willChange: "transform", backfaceVisibility: "hidden", contain: "strict" },
  entryImage: { position: "absolute", inset: 0, width: "100%", height: "100%", display: "block", objectFit: "cover", userSelect: "none", pointerEvents: "none" },
  entryShade: { position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(0,5,8,.2),rgba(0,4,7,.68)),radial-gradient(circle at 50% 45%,transparent 16%,rgba(0,0,0,.62) 78%)" },
  entryVeil: { position: "absolute", inset: 0, zIndex: 5, opacity: 0, background: "#087987", pointerEvents: "none", willChange: "opacity" },
  entryContent: { position: "relative", alignSelf: "end", width: "min(88vw,640px)", marginBottom: "clamp(54px,9vh,112px)", display: "grid", justifyItems: "center", gap: 22, textAlign: "center" },
  entryLine: { margin: 0, color: "#dfd2b5", font: "italic clamp(18px,1.55vw,25px)/1.45 Georgia,serif", letterSpacing: ".04em", textShadow: "0 3px 14px #000,0 0 22px rgba(63,185,193,.18)" },
  entryButton: { minWidth: "min(78vw,340px)", minHeight: 56, padding: "15px 30px", border: "1px solid rgba(102,211,216,.72)", borderRadius: 3, background: "linear-gradient(180deg,rgba(6,27,32,.88),rgba(2,12,17,.94))", color: "#ead29a", font: "700 clamp(14px,1.1vw,17px)/1.2 Georgia,serif", letterSpacing: ".17em", cursor: "pointer", textShadow: "0 2px 8px #000", animation: "entry-breathe 2.4s ease-in-out infinite" },
  posterReveal: { animation: "poster-reveal 2.5s cubic-bezier(.22,.61,.36,1) both" },
  shade: { position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(0,0,0,.18),rgba(0,0,0,.72)),radial-gradient(circle,transparent,rgba(0,0,0,.56))" },
  posterShade: { position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(0,0,0,.12),rgba(0,0,0,.66)),radial-gradient(circle,transparent 30%,rgba(0,0,0,.62))" },
  loadingContent: { position: "relative", alignSelf: "end", width: "min(72vw,680px)", marginBottom: "8vh", display: "grid", gap: 16 },
  loadingText: { margin: 0, textAlign: "center", fontFamily: "monospace", fontSize: "clamp(16px,1.35vw,22px)", fontWeight: 700, letterSpacing: "clamp(2px,.45vw,6px)", color: "#dfc485", textShadow: "0 2px 10px #000,0 0 18px rgba(211,174,91,.28)" },
  track: { height: 2, overflow: "hidden", background: "rgba(216,189,131,.18)" },
  fill: { display: "block", height: "100%", background: "linear-gradient(90deg,#765436,#dfc17f)", boxShadow: "0 0 12px #d5af68", transition: "width .24s ease" },
  logo: { position: "relative", width: "min(64vw,640px)", height: "auto", transform: "translateY(-8vh)", filter: "drop-shadow(0 12px 34px #000) drop-shadow(0 0 26px rgba(133,65,184,.3))" },
  continue: { position: "absolute", bottom: "9vh", margin: 0, fontFamily: "monospace", fontSize: 12, letterSpacing: 5, color: "#ddc391", animation: "pulse 1.8s ease-in-out infinite", textShadow: "0 2px 9px #000" },
  skip: { position: "absolute", zIndex: 3, right: "clamp(18px,2.2vw,34px)", bottom: "clamp(18px,2.2vh,30px)" },
};
