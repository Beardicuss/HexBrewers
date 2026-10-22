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
        <div className="audio-instrument" style={ss.panel}>
            {sliders.map((s) => (
                <div key={s.label} style={styles.sliderGroup}>
                    <div style={styles.sliderHeader}>
                        <span style={ss.label}>{s.label}</span>
                        <span style={styles.valueLabel}>{s.value}%</span>
                    </div>
                    <input
                        className="hex-slider"
                        type="range"
                        min={0}
                        max={100}
                        value={s.value}
                        onChange={(e) => s.onChange(Number(e.target.value))}
                        style={{ ...styles.slider, "--volume": `${s.value}%` } as React.CSSProperties}
                    />
                </div>
            ))}

            <style>{rangeCSS}</style>
        </div>
    );
}

// Custom range slider CSS (injected once)
const rangeCSS = `
  .audio-instrument { gap: 24px !important; }
  .audio-instrument input[type="range"].hex-slider {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 3px;
    background: linear-gradient(90deg,#b88a38 0 var(--volume),rgba(113,90,50,.38) var(--volume) 100%);
    border: 0;
    border-radius: 0;
    outline: none;
    cursor: pointer;
    box-shadow: 0 1px rgba(238,208,143,.16),0 5px 12px rgba(0,0,0,.35);
  }
  .audio-instrument input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 17px;
    height: 17px;
    background: #15120e;
    border: 2px solid #d2a64e;
    border-radius: 2px;
    transform: rotate(45deg);
    cursor: pointer;
    box-shadow: inset 0 0 0 3px #6e4a19,0 0 9px rgba(232,184,77,.38);
  }
  .audio-instrument input[type="range"]::-moz-range-thumb {
    width: 15px;
    height: 15px;
    background: #6e4a19;
    border: 2px solid #d2a64e;
    border-radius: 2px;
    cursor: pointer;
    box-shadow: 0 0 9px rgba(232,184,77,.38);
  }
  .audio-instrument input[type="range"]:focus-visible { outline:1px solid #e8b84d;outline-offset:8px; }
`;

const styles: Record<string, React.CSSProperties> = {
    sliderGroup: {
        marginBottom: 8,
        padding: "0 0 18px",
        borderBottom: "1px solid rgba(201,168,108,.18)",
    },
    sliderHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    valueLabel: {
        fontFamily: "monospace",
        fontSize: 14,
        color: C.parchment,
        fontWeight: "bold",
    },
    slider: {
        width: "100%",
    },
};
