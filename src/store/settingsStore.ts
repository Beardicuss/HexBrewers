import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Language } from "../i18n/types";

export interface SettingsState {
    // Video
    resolution: string;
    quality: "low" | "medium" | "high";

    // Audio (0–100)
    masterVolume: number;
    musicVolume: number;
    sfxVolume: number;

    // Language
    language: Language;

    // Actions
    setResolution: (r: string) => void;
    setQuality: (q: "low" | "medium" | "high") => void;
    setMasterVolume: (v: number) => void;
    setMusicVolume: (v: number) => void;
    setSfxVolume: (v: number) => void;
    setLanguage: (l: Language) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            resolution: "1920x1080",
            quality: "high",
            masterVolume: 80,
            musicVolume: 60,
            sfxVolume: 80,
            language: "en",

            setResolution: (resolution) => set({ resolution }),
            setQuality: (quality) => set({ quality }),
            setMasterVolume: (masterVolume) => set({ masterVolume }),
            setMusicVolume: (musicVolume) => set({ musicVolume }),
            setSfxVolume: (sfxVolume) => set({ sfxVolume }),
            setLanguage: (language) => set({ language }),
        }),
        {
            name: "hexbrewers-settings",
        }
    )
);
