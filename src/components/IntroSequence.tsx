import React, { useEffect, useRef, useState } from "react";
import { soundManager } from "../SoundManager";

type IntroStage = "softcurse" | "loading" | "trailerPrelude" | "trailer" | "trailerFade" | "darkNarration" | "postNarrationBlack" | "posterReveal" | "posterHold" | "poster";
const OPENING_ASSETS = [
  "/videos/intro/ashenveil-trailer-original.webm", "/audio/intro/ashenveil-trailer-narration.mp3",
  "/audio/intro/ashenveil-trailer-choir-tail.ogg", "/music/music-ashenveil-theme.ogg",
  "/images/intro/ashenveil-poster.webp", "/images/core/rooms/central-laboratory.webp",
  "/videos/menu/central-laboratory.webm?v=2", "/videos/menu/new-game-ritual-chamber.webm?v=2",
  "/videos/menu/grimoire-scriptorium.webm?v=2", "/videos/menu/dlc-reliquary.webm?v=2",
  "/videos/menu/settings-astrolabe.webm?v=2", "/images/title/title-en.webp",
  "/images/ui/menu/menu-icon-continue.webp", "/images/ui/menu/menu-icon-new-game.webp",
  "/images/ui/menu/menu-icon-grimoire.webp", "/images/ui/menu/menu-icon-dlcs.webp", "/images/ui/menu/menu-icon-settings.webp",
];

export function IntroSequence({ onComplete }: { onComplete: () => void }) {
  const [stage, setStage] = useState<IntroStage>("softcurse");
  const [progress, setProgress] = useState(0);
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
    if (stage === "poster" || soundUnlocked) return;
    const unlock = () => {
      soundUnlockedRef.current = true;
      setSoundUnlocked(true);
      const video = softcurseRef.current;
      if (stage === "softcurse" && video) { video.muted = false; video.volume = 0.82; void video.play().catch(() => undefined); }
    };
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => { window.removeEventListener("pointerdown", unlock); window.removeEventListener("keydown", unlock); };
  }, [stage, soundUnlocked]);

  useEffect(() => {
    if (stage !== "loading") return;
    let cancelled = false;
    const started = performance.now();
    void Promise.allSettled(OPENING_ASSETS.map(async (url) => {
      if (/\.(?:webp|png|jpe?g|avif)(?:\?|$)/i.test(url)) {
        const preload = new Image();
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

  return (
    <main style={styles.root} aria-label="Hexbrewers of Ashenveil opening sequence">
      <style>{`
        @keyframes poster-reveal {
          0% { opacity: 0; filter: brightness(.35) blur(7px); transform: scale(1.018); }
          55% { opacity: 1; filter: brightness(.82) blur(1px); }
          100% { opacity: 1; filter: brightness(1) blur(0); transform: scale(1); }
        }
      `}</style>
      <video ref={softcurseRef} src="/videos/intro/softcurse-systems.mp4" autoPlay muted={!soundUnlocked} playsInline preload="auto"
        onEnded={() => setStage("loading")} style={{ ...styles.video, opacity: stage === "softcurse" ? 1 : 0 }} />
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
      <audio ref={narrationRef} src="/audio/intro/ashenveil-trailer-narration.mp3" preload="auto" onEnded={() => setStage("postNarrationBlack")} />
      <audio ref={choirTailRef} src="/audio/intro/ashenveil-trailer-choir-tail.ogg" preload="auto" />
      {stage === "loading" && (
        <div style={{ ...styles.artScreen, backgroundImage: "url('/images/loading/loading-initial.webp')" }}>
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
      {stage === "softcurse" && !soundUnlocked && <div style={styles.soundPrompt}>CLICK OR PRESS A KEY FOR SOUND</div>}
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
  posterReveal: { animation: "poster-reveal 2.5s cubic-bezier(.22,.61,.36,1) both" },
  shade: { position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(0,0,0,.18),rgba(0,0,0,.72)),radial-gradient(circle,transparent,rgba(0,0,0,.56))" },
  posterShade: { position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(0,0,0,.12),rgba(0,0,0,.66)),radial-gradient(circle,transparent 30%,rgba(0,0,0,.62))" },
  soundPrompt: { position: "absolute", zIndex: 3, left: "50%", bottom: "5vh", transform: "translateX(-50%)", fontFamily: "monospace", fontSize: 10, letterSpacing: 3, color: "#9b8968", animation: "pulse 1.8s ease-in-out infinite", textShadow: "0 2px 8px #000", whiteSpace: "nowrap" },
  loadingContent: { position: "relative", alignSelf: "end", width: "min(72vw,680px)", marginBottom: "8vh", display: "grid", gap: 16 },
  loadingText: { margin: 0, textAlign: "center", fontFamily: "monospace", fontSize: "clamp(16px,1.35vw,22px)", fontWeight: 700, letterSpacing: "clamp(2px,.45vw,6px)", color: "#dfc485", textShadow: "0 2px 10px #000,0 0 18px rgba(211,174,91,.28)" },
  track: { height: 2, overflow: "hidden", background: "rgba(216,189,131,.18)" },
  fill: { display: "block", height: "100%", background: "linear-gradient(90deg,#765436,#dfc17f)", boxShadow: "0 0 12px #d5af68", transition: "width .24s ease" },
  logo: { position: "relative", width: "min(64vw,640px)", height: "auto", transform: "translateY(-8vh)", filter: "drop-shadow(0 12px 34px #000) drop-shadow(0 0 26px rgba(133,65,184,.3))" },
  continue: { position: "absolute", bottom: "9vh", margin: 0, fontFamily: "monospace", fontSize: 12, letterSpacing: 5, color: "#ddc391", animation: "pulse 1.8s ease-in-out infinite", textShadow: "0 2px 9px #000" },
  skip: { position: "absolute", zIndex: 3, right: "clamp(18px,2.2vw,34px)", bottom: "clamp(18px,2.2vh,30px)" },
};
