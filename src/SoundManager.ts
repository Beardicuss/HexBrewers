// ─── Sound Manager ────────────────────────────────────────────────────────────
// Drop your .mp3 files into /public/sounds/ and update the paths below.
// Everything else is handled automatically.

// ─── Sound catalogue ──────────────────────────────────────────────────────────
// Add/remove entries here as you add real audio files.

type SoundId =
  | "token_draw"          // token pulled from bag
  | "token_place"         // token lands on spiral
  | "token_place_white"   // voidshard lands (more tense)
  | "explosion"           // crucible shatters
  | "brew_stop"           // player stops voluntarily
  | "flask_use"           // cursed vial activated
  | "market_buy"          // item purchased
  | "market_open"         // black market screen opens
  | "omen_reveal"         // omen card flips
  | "round_start"         // new round begins
  | "game_win"            // player wins
  | "game_lose"           // player loses
  | "ambient_loop";       // background dark ambient (looped)

interface SoundConfig {
  path: string;           // relative to /public/
  volume: number;         // 0.0 – 1.0
  loop?: boolean;
}

const SOUNDS: Record<SoundId, SoundConfig> = {
  token_draw: { path: "sounds/token_draw.mp3", volume: 0.7 },
  token_place: { path: "sounds/token_place.mp3", volume: 0.6 },
  token_place_white: { path: "sounds/token_place_white.mp3", volume: 0.75 },
  explosion: { path: "sounds/explosion.mp3", volume: 0.9 },
  brew_stop: { path: "sounds/brew_stop.mp3", volume: 0.5 },
  flask_use: { path: "sounds/flask_use.mp3", volume: 0.8 },
  market_buy: { path: "sounds/market_buy.mp3", volume: 0.6 },
  market_open: { path: "sounds/market_open.mp3", volume: 0.5 },
  omen_reveal: { path: "sounds/omen_reveal.mp3", volume: 0.7 },
  round_start: { path: "sounds/round_start.mp3", volume: 0.6 },
  game_win: { path: "sounds/game_win.mp3", volume: 0.85 },
  game_lose: { path: "sounds/game_lose.mp3", volume: 0.85 },
  ambient_loop: { path: "sounds/ambient_loop.mp3", volume: 0.18, loop: true },
};

// ─── Manager class ────────────────────────────────────────────────────────────

class SoundManager {
  private buffers: Map<SoundId, AudioBuffer> = new Map();
  private sources: Map<SoundId, AudioBufferSourceNode> = new Map();
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private muted: boolean = false;
  private loaded: boolean = false;

  // Call once on first user interaction (browsers require this)
  async init(): Promise<void> {
    if (this.context) return;

    this.context = new AudioContext();
    this.masterGain = this.context.createGain();
    this.masterGain.gain.value = 1.0;
    this.masterGain.connect(this.context.destination);

    // Separate gain nodes for music vs SFX
    this.musicGain = this.context.createGain();
    this.musicGain.gain.value = 0.6; // default 60%
    this.musicGain.connect(this.masterGain);

    this.sfxGain = this.context.createGain();
    this.sfxGain.gain.value = 0.8; // default 80%
    this.sfxGain.connect(this.masterGain);

    await this.preloadAll();
    this.loaded = true;
  }

  // Preload all sounds into memory
  private async preloadAll(): Promise<void> {
    const entries = Object.entries(SOUNDS) as [SoundId, SoundConfig][];

    await Promise.allSettled(
      entries.map(async ([id, config]) => {
        try {
          const response = await fetch(config.path);
          if (!response.ok) {
            // File not found — silently skip (placeholder mode)
            return;
          }
          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = await this.context!.decodeAudioData(arrayBuffer);
          this.buffers.set(id, audioBuffer);
        } catch {
          // Missing or malformed file — skip without crashing
        }
      })
    );
  }

  // Play a sound
  play(id: SoundId): void {
    if (!this.loaded || this.muted || !this.context || !this.masterGain) return;

    const buffer = this.buffers.get(id);
    if (!buffer) return; // file not loaded — silent fallback

    const config = SOUNDS[id];

    // If this is a looping sound and it's already playing, don't restart it
    if (config.loop && this.sources.has(id)) return;

    const gainNode = this.context.createGain();
    gainNode.gain.value = config.volume;

    // Route through the appropriate bus
    const bus = config.loop ? this.musicGain! : this.sfxGain!;
    gainNode.connect(bus);

    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.loop = config.loop ?? false;
    source.connect(gainNode);
    source.start();

    // Track looping sources so they can be stopped
    if (config.loop) {
      this.sources.set(id, source);
    }
  }

  // Stop a looping sound
  stopLoop(id: SoundId): void {
    const source = this.sources.get(id);
    if (source) {
      try { source.stop(); } catch { /* already stopped */ }
      this.sources.delete(id);
    }
  }

  // Fade a looping sound out over N milliseconds
  fadeOut(id: SoundId, durationMs: number = 1000): void {
    const source = this.sources.get(id);
    if (!source || !this.context) return;

    const gain = this.context.createGain();
    source.connect(gain);
    gain.connect(this.masterGain!);
    gain.gain.setValueAtTime(SOUNDS[id].volume, this.context.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.context.currentTime + durationMs / 1000);

    setTimeout(() => this.stopLoop(id), durationMs);
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

  // Init on first user interaction
  const initOnInteraction = useCallback(async () => {
    if (initialised.current) return;
    initialised.current = true;
    await soundManager.init();
    setReady(true); // Signal that audio is ready — let caller decide what to play
  }, []);

  useEffect(() => {
    window.addEventListener("pointerdown", initOnInteraction, { once: true });
    return () => window.removeEventListener("pointerdown", initOnInteraction);
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
