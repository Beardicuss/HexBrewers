// ─── Sound Manager ────────────────────────────────────────────────────────────
// Drop your .mp3 files into /public/sounds/ and update the paths below.
// Everything else is handled automatically.

// ─── Sound catalogue ──────────────────────────────────────────────────────────
// Add/remove entries here as you add real audio files.

import type { TokenColor } from "./game/tokenTypes";

export type SoundId =
  | "token_draw"          // token pulled from bag
  | "token_draw_anticipation" // tactile bag search before a presented draw
  | "token_place"         // token lands on spiral
  | "token_place_white"   // voidshard lands (more tense)
  | "voidshard_impact"    // crystalline dimensional fracture on impact
  | "explosion"           // crucible shatters
  | "brew_stop"           // player stops voluntarily
  | "flask_use"           // cursed vial activated
  | "market_buy"          // item purchased
  | "market_open"         // black market screen opens
  | "omen_reveal"         // omen card flips
  | "round_start"         // new round begins
  | "game_win"            // player wins
  | "game_lose"           // player loses
  | "covenant_activate_bone" | "covenant_activate_moon" | "covenant_activate_blood"
  | "covenant_spent" | "distillation_gain" | "retort_bottle_fill"
  | "remedy_complete" | "affliction_contract_bind"
  | "music_ashenveil" | "music_crucible" | "music_mirewrought"
  | "music_veilglass" | "music_ninth_bell";

export type MusicSoundId = "music_ashenveil" | "music_crucible" | "music_mirewrought" | "music_veilglass" | "music_ninth_bell";

interface SoundConfig {
  path: string;           // relative to /public/
  volume: number;         // 0.0 – 1.0
  loop?: boolean;
  bus?: "music" | "sfx";
}

interface PlaybackOptions {
  fadeInMs?: number;
  playbackRate?: number;
  volumeScale?: number;
}

const INGREDIENT_IMPACT_VOICES: Partial<Record<TokenColor, Required<Pick<PlaybackOptions, "playbackRate" | "volumeScale">>>> = {
  orange: { playbackRate: 0.9, volumeScale: 1.08 },
  green: { playbackRate: 0.95, volumeScale: 0.88 },
  purple: { playbackRate: 1.09, volumeScale: 0.82 },
  blue: { playbackRate: 1.16, volumeScale: 0.94 },
  red: { playbackRate: 0.84, volumeScale: 1.02 },
  yellow: { playbackRate: 1.05, volumeScale: 0.78 },
  black: { playbackRate: 0.76, volumeScale: 0.84 },
  echo: { playbackRate: 1.22, volumeScale: 0.72 },
};

const SOUNDS: Record<SoundId, SoundConfig> = {
  token_draw: { path: "/sounds/token_draw.mp3", volume: 0.7 },
  token_draw_anticipation: { path: "/sounds/token-draw-anticipation.wav", volume: 0.62 },
  token_place: { path: "/sounds/token_place.mp3", volume: 0.6 },
  token_place_white: { path: "/sounds/token_place_white.mp3", volume: 0.75 },
  voidshard_impact: { path: "/sounds/voidshard-impact.wav", volume: 0.74 },
  explosion: { path: "/sounds/explosion.mp3", volume: 0.9 },
  brew_stop: { path: "/sounds/brew_stop.mp3", volume: 0.5 },
  flask_use: { path: "/sounds/flask_use.mp3", volume: 0.8 },
  market_buy: { path: "/sounds/market_buy.mp3", volume: 0.6 },
  market_open: { path: "/sounds/market_open.mp3", volume: 0.5 },
  omen_reveal: { path: "/sounds/omen_reveal.mp3", volume: 0.7 },
  round_start: { path: "/sounds/round_start.mp3", volume: 0.6 },
  game_win: { path: "/sounds/game_win.mp3", volume: 0.85 },
  game_lose: { path: "/sounds/game_lose.mp3", volume: 0.85 },
  covenant_activate_bone: { path: "/sounds/dlc/covenant-activate-bone.ogg", volume: 0.72 },
  covenant_activate_moon: { path: "/sounds/dlc/covenant-activate-moon.ogg", volume: 0.72 },
  covenant_activate_blood: { path: "/sounds/dlc/covenant-activate-blood.ogg", volume: 0.72 },
  covenant_spent: { path: "/sounds/dlc/covenant-spent.ogg", volume: 0.55 },
  distillation_gain: { path: "/sounds/dlc/distillation-gain.ogg", volume: 0.62 },
  retort_bottle_fill: { path: "/sounds/dlc/retort-bottle-fill.ogg", volume: 0.68 },
  remedy_complete: { path: "/sounds/dlc/remedy-complete.ogg", volume: 0.78 },
  affliction_contract_bind: { path: "/sounds/dlc/affliction-contract-bind.ogg", volume: 0.7 },
  music_ashenveil: { path: "/music/music-ashenveil-theme.ogg", volume: 0.42, loop: true, bus: "music" },
  music_crucible: { path: "/music/music-crucible-vigil.ogg", volume: 0.4, loop: true, bus: "music" },
  music_mirewrought: { path: "/music/music-mirewrought.ogg", volume: 0.4, loop: true, bus: "music" },
  music_veilglass: { path: "/music/music-veilglass.ogg", volume: 0.4, loop: true, bus: "music" },
  music_ninth_bell: { path: "/music/music-ninth-bell.ogg", volume: 0.43, loop: true, bus: "music" },
};

const MUSIC_IDS: MusicSoundId[] = ["music_ashenveil", "music_crucible", "music_mirewrought", "music_veilglass", "music_ninth_bell"];

// ─── Manager class ────────────────────────────────────────────────────────────

class SoundManager {
  private buffers: Map<SoundId, AudioBuffer> = new Map();
  private sources: Map<SoundId, AudioBufferSourceNode> = new Map();
  private sourceGains: Map<SoundId, GainNode> = new Map();
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private muted: boolean = false;
  private loaded: boolean = false;
  private rawBuffers: Map<SoundId, ArrayBuffer> = new Map(); // eagerly fetched
  private loadingBuffers: Map<SoundId, Promise<void>> = new Map();
  private desiredMusic: MusicSoundId | null = null;
  private musicElements: Map<MusicSoundId, HTMLAudioElement> = new Map();
  private musicElementGains: Map<MusicSoundId, GainNode> = new Map();

  // Call once on first user interaction (browsers require this)
  async init(): Promise<void> {
    if (this.context) return;

    this.context = new AudioContext();
    this.masterGain = this.context.createGain();
    this.masterGain.connect(this.context.destination);

    // Separate gain nodes for music vs SFX
    this.musicGain = this.context.createGain();
    this.musicGain.connect(this.masterGain);

    this.sfxGain = this.context.createGain();
    this.sfxGain.connect(this.masterGain);

    // Apply persisted volume settings from Zustand store
    this.applyPersistedVolume();

    this.loaded = true;
  }

  // Apply saved volume from localStorage/settingsStore
  private applyPersistedVolume(): void {
    try {
      const raw = localStorage.getItem("hexbrewers-settings");
      if (raw) {
        const parsed = JSON.parse(raw);
        const state = parsed?.state;
        if (state) {
          if (this.masterGain && typeof state.masterVolume === "number") {
            this.masterGain.gain.value = state.masterVolume / 100;
          }
          if (this.musicGain && typeof state.musicVolume === "number") {
            this.musicGain.gain.value = state.musicVolume / 100;
          }
          if (this.sfxGain && typeof state.sfxVolume === "number") {
            this.sfxGain.gain.value = state.sfxVolume / 100;
          }
          return; // successfully applied persisted values
        }
      }
    } catch { /* fall through to defaults */ }

    // Defaults if no persisted settings found
    this.masterGain!.gain.value = 0.8;
    this.musicGain!.gain.value = 0.6;
    this.sfxGain!.gain.value = 0.8;
  }

  // Eagerly fetch raw audio files (can run before AudioContext exists)
  async preloadRaw(): Promise<void> {
    const entries = Object.entries(SOUNDS) as [SoundId, SoundConfig][];
    await Promise.allSettled(
      entries.map(async ([id, config]) => {
        try {
          const response = await fetch(config.path);
          if (!response.ok) return;
          this.rawBuffers.set(id, await response.arrayBuffer());
        } catch { /* missing file — skip */ }
      })
    );
  }

  // Decode pre-fetched raw buffers into AudioBuffers (requires AudioContext)
  private async decodeAll(): Promise<void> {
    if (!this.context) return;
    const entries = Array.from(this.rawBuffers.entries());
    await Promise.allSettled(
      entries.map(async ([id, arrayBuffer]) => {
        try {
          // decodeAudioData consumes the buffer, so we clone it
          const audioBuffer = await this.context!.decodeAudioData(arrayBuffer.slice(0));
          this.buffers.set(id, audioBuffer);
        } catch { /* malformed — skip */ }
      })
    );
  }

  private loadBuffer(id: SoundId): Promise<void> {
    const pending = this.loadingBuffers.get(id);
    if (pending) return pending;
    const task = (async () => {
      if (!this.context || this.buffers.has(id)) return;
      try {
        const cached = this.rawBuffers.get(id);
        const data = cached ?? await (await fetch(SOUNDS[id].path)).arrayBuffer();
        const decoded = await this.context.decodeAudioData(data.slice(0));
        this.buffers.set(id, decoded);
        this.rawBuffers.delete(id);
      } catch { /* optional audio must never block gameplay */ }
      finally { this.loadingBuffers.delete(id); }
    })();
    this.loadingBuffers.set(id, task);
    return task;
  }

  // Play a sound
  play(id: SoundId, fadeInMs: number = 0): void {
    this.playWithOptions(id, { fadeInMs });
  }

  playIngredientImpact(color: TokenColor): void {
    const voice = INGREDIENT_IMPACT_VOICES[color];
    if (!voice) {
      this.play("token_place");
      return;
    }
    this.playWithOptions("token_place", voice);
  }

  private playWithOptions(id: SoundId, options: PlaybackOptions = {}): void {
    if (!this.loaded || this.muted || !this.context || !this.masterGain) return;

    const fadeInMs = options.fadeInMs ?? 0;

    if (SOUNDS[id].bus === "music") {
      void this.playStreamedMusic(id as MusicSoundId, fadeInMs);
      return;
    }

    const buffer = this.buffers.get(id);
    if (!buffer) {
      void this.loadBuffer(id).then(() => {
        if (SOUNDS[id].bus === "music" && this.desiredMusic !== id) return;
        this.playWithOptions(id, options);
      });
      return;
    }

    const config = SOUNDS[id];

    // If this is a looping sound and it's already playing, don't restart it
    if (config.loop && this.sources.has(id)) return;

    const gainNode = this.context.createGain();
    const targetVolume = config.volume * (options.volumeScale ?? 1);
    gainNode.gain.value = fadeInMs > 0 ? 0 : targetVolume;
    if (fadeInMs > 0) gainNode.gain.linearRampToValueAtTime(targetVolume, this.context.currentTime + fadeInMs / 1000);

    // Route through the appropriate bus
    const bus = config.bus === "music" ? this.musicGain! : this.sfxGain!;
    gainNode.connect(bus);

    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.loop = config.loop ?? false;
    source.playbackRate.value = options.playbackRate ?? 1;
    source.connect(gainNode);
    source.start();

    // Track looping sources so they can be stopped
    if (config.loop) {
      this.sources.set(id, source);
      this.sourceGains.set(id, gainNode);
      source.onended = () => {
        if (this.sources.get(id) === source) {
          this.sources.delete(id);
          this.sourceGains.delete(id);
        }
      };
    }
  }

  private async playStreamedMusic(id: MusicSoundId, fadeInMs: number): Promise<void> {
    if (!this.context || !this.musicGain || this.musicElements.has(id)) return;
    const config = SOUNDS[id];
    const element = new Audio();
    element.crossOrigin = "anonymous";
    element.src = config.path;
    element.loop = true;
    element.preload = "metadata";
    const source = this.context.createMediaElementSource(element);
    const gain = this.context.createGain();
    gain.gain.value = fadeInMs > 0 ? 0 : config.volume;
    source.connect(gain);
    gain.connect(this.musicGain);
    this.musicElements.set(id, element);
    this.musicElementGains.set(id, gain);
    if (fadeInMs > 0) {
      gain.gain.linearRampToValueAtTime(config.volume, this.context.currentTime + fadeInMs / 1000);
    }
    try {
      await element.play();
    } catch {
      this.musicElements.delete(id);
      this.musicElementGains.delete(id);
      source.disconnect();
      gain.disconnect();
    }
  }

  // Stop a looping sound
  stopLoop(id: SoundId): void {
    if (SOUNDS[id].bus === "music") {
      const musicId = id as MusicSoundId;
      const element = this.musicElements.get(musicId);
      if (element) {
        element.pause();
        element.removeAttribute("src");
        element.load();
      }
      this.musicElements.delete(musicId);
      this.musicElementGains.get(musicId)?.disconnect();
      this.musicElementGains.delete(musicId);
      return;
    }
    const source = this.sources.get(id);
    if (source) {
      try { source.stop(); } catch { /* already stopped */ }
      this.sources.delete(id);
      this.sourceGains.delete(id);
    }
  }

  // Fade a looping sound out over N milliseconds
  fadeOut(id: SoundId, durationMs: number = 1000): void {
    if (SOUNDS[id].bus === "music") {
      const musicId = id as MusicSoundId;
      const gain = this.musicElementGains.get(musicId);
      if (!gain || !this.context) return;
      gain.gain.cancelScheduledValues(this.context.currentTime);
      gain.gain.setValueAtTime(gain.gain.value, this.context.currentTime);
      gain.gain.linearRampToValueAtTime(0, this.context.currentTime + durationMs / 1000);
      window.setTimeout(() => this.stopLoop(musicId), durationMs);
      return;
    }
    const source = this.sources.get(id);
    if (!source || !this.context) return;

    const gain = this.sourceGains.get(id);
    if (!gain) return;
    gain.gain.cancelScheduledValues(this.context.currentTime);
    gain.gain.setValueAtTime(gain.gain.value, this.context.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.context.currentTime + durationMs / 1000);

    setTimeout(() => this.stopLoop(id), durationMs);
  }

  switchMusic(id: MusicSoundId, fadeMs: number = 1600): void {
    this.desiredMusic = id;
    for (const musicId of MUSIC_IDS) if (musicId !== id) this.fadeOut(musicId, fadeMs);
    if (!this.musicElements.has(id)) this.play(id, fadeMs);
  }

  // Master volume (0.0 – 1.0)
  setVolume(value: number): void {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, value));
    }
  }

  // Music volume (0.0 – 1.0)
  setMusicVolume(value: number): void {
    if (this.musicGain) {
      this.musicGain.gain.value = Math.max(0, Math.min(1, value));
    }
  }

  // SFX volume (0.0 – 1.0)
  setSfxVolume(value: number): void {
    if (this.sfxGain) {
      this.sfxGain.gain.value = Math.max(0, Math.min(1, value));
    }
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    if (this.masterGain) {
      this.masterGain.gain.value = this.muted ? 0 : 1.0;
    }
    return this.muted;
  }

  isMuted(): boolean {
    return this.muted;
  }

  isLoaded(): boolean {
    return this.loaded;
  }
}

// ─── Singleton export ─────────────────────────────────────────────────────────
// Import this anywhere and call soundManager.play("token_draw") etc.

export const soundManager = new SoundManager();

// ─── React hook ───────────────────────────────────────────────────────────────
// Optional: use this hook in components to init audio on first click.

import { useEffect, useRef, useCallback, useState } from "react";

export function useSoundManager() {
  const initialised = useRef(false);
  const [muted, setMuted] = useState(false);
  const [ready, setReady] = useState(false);

  // Init AudioContext on first user interaction (browser requires this)
  const initOnInteraction = useCallback(async () => {
    if (initialised.current) return;
    initialised.current = true;
    await soundManager.init();
    setReady(true); // Signal that audio is ready — let caller decide what to play
  }, []);

  useEffect(() => {
    window.addEventListener("pointerdown", initOnInteraction, { once: true });
    window.addEventListener("keydown", initOnInteraction, { once: true });
    return () => {
      window.removeEventListener("pointerdown", initOnInteraction);
      window.removeEventListener("keydown", initOnInteraction);
    };
  }, [initOnInteraction]);

  const play = useCallback((id: Parameters<typeof soundManager.play>[0]) => {
    soundManager.play(id);
  }, []);

  const toggleMute = useCallback(() => {
    const nowMuted = soundManager.toggleMute();
    setMuted(nowMuted);
  }, []);

  return { play, toggleMute, muted, ready };
}
