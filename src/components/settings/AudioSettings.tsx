import React from "react";
import { useSettingsStore } from "../../store/settingsStore";
import { useTranslation } from "../../i18n/useTranslation";
import { soundManager } from "../../SoundManager";
import { ss, C } from "./settingsStyles";

export function AudioSettings() {
    const t = useTranslation();
    const store = useSettingsStore();

    const sliders: {
        label: string;
        value: number;
        onChange: (v: number) => void;
    }[] = [
            {
                label: t.settings.masterVolume,
                value: store.masterVolume,
                onChange: (v) => {
                    store.setMasterVolume(v);
                    soundManager.setVolume(v / 100);
                },
            },
            {
                label: t.settings.musicVolume,
                value: store.musicVolume,
                onChange: (v) => {
                    store.setMusicVolume(v);
                    soundManager.setMusicVolume(v / 100);
                },
            },
            {
                label: t.settings.sfxVolume,
                value: store.sfxVolume,
                onChange: (v) => {
                    store.setSfxVolume(v);
                    soundManager.setSfxVolume(v / 100);
                },
            },
        ];

    return (
        <div style={ss.panel}>
            {sliders.map((s) => (
                <div key={s.label} style={styles.sliderGroup}>
                    <div style={styles.sliderHeader}>
                        <span style={ss.label}>{s.label}</span>
                        <span style={styles.valueLabel}>{s.value}%</span>
                    </div>
                    <input
                        type="range"
                        min={0}
                        max={100}
                        value={s.value}
                        onChange={(e) => s.onChange(Number(e.target.value))}
                        style={styles.slider}
                    />
                </div>
            ))}

            <style>{rangeCSS}</style>
        </div>
    );
}

// Custom range slider CSS (injected once)
const rangeCSS = `
  input[type="range"].hex-slider,
  .hex-settings-panel input[type="range"] {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 6px;
    background: ${C.inputBg};
    border: 1px solid ${C.border};
    border-radius: 3px;
    outline: none;
    cursor: pointer;
  }
  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    background: ${C.gold};
    border: 2px solid #a07828;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 0 8px rgba(232, 184, 77, 0.3);
  }
  input[type="range"]::-moz-range-thumb {
    width: 18px;
    height: 18px;
    background: ${C.gold};
    border: 2px solid #a07828;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 0 8px rgba(232, 184, 77, 0.3);
  }
`;

const styles: Record<string, React.CSSProperties> = {
    sliderGroup: {
        marginBottom: 18,
    },
    sliderHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    valueLabel: {
        fontFamily: "monospace",
        fontSize: 35,
        color: C.parchment,
        fontWeight: "bold",
    },
    slider: {
        width: "100%",
    },
};
