import React, { useEffect, useState } from "react";
import { useSettingsStore } from "../../store/settingsStore";
import { useTranslation } from "../../i18n/useTranslation";
import { ss, C } from "./settingsStyles";

const RESOLUTIONS = [
    "1280x720",
    "1600x900",
    "1920x1080",
    "2560x1440",
];

const QUALITIES = ["low", "medium", "high"] as const;

export function VideoSettings() {
    const t = useTranslation();
    const { resolution, quality, presentationSpeed, setResolution, setQuality, setPresentationSpeed } = useSettingsStore();
    const [fullscreen, setFullscreen] = useState(Boolean(document.fullscreenElement));

    useEffect(() => {
        const update = () => setFullscreen(Boolean(document.fullscreenElement));
        document.addEventListener("fullscreenchange", update);
        return () => document.removeEventListener("fullscreenchange", update);
    }, []);

    const chooseResolution = (nextResolution: string) => {
        setResolution(nextResolution);
        const [width, height] = nextResolution.split("x").map(Number);
        void window.hexbrewersDisplay?.setResolution(width, height);
    };

    const stepResolution = (direction: -1 | 1) => {
        const current = Math.max(0, RESOLUTIONS.indexOf(resolution));
        chooseResolution(RESOLUTIONS[(current + direction + RESOLUTIONS.length) % RESOLUTIONS.length]);
    };

    const qualityLabels = {
        low: t.settings.qualityLow,
        medium: t.settings.qualityMedium,
        high: t.settings.qualityHigh,
    };

    return (
        <div className="video-instrument" style={ss.panel}>
            <style>{instrumentCss}</style>
            <div style={ss.sectionTitle}>{t.settings.resolution}</div>
            <div className="calibration-stepper" aria-label={t.settings.resolution}>
                <button type="button" onClick={() => stepResolution(-1)} aria-label="Previous resolution">‹</button>
                <div className="calibration-value"><small>DISPLAY MATRIX</small><strong>{resolution.replace("x", " × ")}</strong></div>
                <button type="button" onClick={() => stepResolution(1)} aria-label="Next resolution">›</button>
            </div>

            <div style={{ height: 20 }} />

            <div style={ss.sectionTitle}>{t.settings.quality}</div>
            <div className="quality-rail" style={styles.qualityRow}>
                {QUALITIES.map((q) => (
                    <button
                        key={q}
                        className={quality === q ? "is-active" : ""}
                        style={styles.qualityBtn}
                        onClick={() => setQuality(q)}
                    >
                        {qualityLabels[q]}
                    </button>
                ))}
            </div>

            <div style={{ height: 20 }} />

            <div style={ss.sectionTitle}>{t.settings.presentationSpeed}</div>
            <div className="quality-rail" style={styles.qualityRow}>
                {(["normal", "fast"] as const).map((speed) => (
                    <button
                        key={speed}
                        className={presentationSpeed === speed ? "is-active" : ""}
                        style={styles.qualityBtn}
                        onClick={() => setPresentationSpeed(speed)}
                    >
                        {speed === "normal" ? t.settings.presentationNormal : t.settings.presentationFast}
                    </button>
                ))}
            </div>

            <div style={{ height: 20 }} />

            <button
                type="button"
                className="fullscreen-rite"
                onClick={() => {
                    if (document.fullscreenElement) void document.exitFullscreen();
                    else void document.documentElement.requestFullscreen();
                }}
            >
                {fullscreen ? t.settings.exitFullscreen : t.settings.fullscreen}
            </button>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    qualityRow: {
        display: "flex",
        gap: 10,
    },
    qualityBtn: {
        flex: 1,
        padding: "36px 0 8px",
        fontFamily: "Georgia, serif",
        fontSize: 15,
        letterSpacing: 1,
        borderRadius: 0,
        cursor: "pointer",
        border: 0,
        background: "transparent",
        color: C.amber,
        transition: "all 0.15s",
    },
};

const instrumentCss = `
  .calibration-stepper { display:grid;grid-template-columns:64px 1fr 64px;align-items:center;border-top:1px solid rgba(201,168,108,.32);border-bottom:1px solid rgba(201,168,108,.32); }
  .calibration-stepper button { height:72px;border:0;background:transparent;color:#c9a86c;font:38px/1 Georgia,serif;cursor:pointer;transition:color .18s,text-shadow .18s; }
  .calibration-stepper button:hover { color:#f0d18c;text-shadow:0 0 12px rgba(232,184,77,.65); }
  .calibration-value { display:flex;flex-direction:column;align-items:center;gap:5px; }
  .calibration-value small { color:#75c9c0;font:9px/1 monospace;letter-spacing:2.4px; }
  .calibration-value strong { color:#ead7ad;font:22px/1.2 monospace;font-weight:400;letter-spacing:2px; }
  .quality-rail { position:relative; }
  .quality-rail::before { content:"";position:absolute;left:12%;right:12%;top:17px;height:1px;background:linear-gradient(90deg,transparent,#715a32 12%,#715a32 88%,transparent); }
  .quality-rail button { position:relative; }
  .quality-rail button::before { content:"";position:absolute;left:50%;top:8px;width:15px;height:15px;transform:translateX(-50%) rotate(45deg);border:1px solid #79623c;background:#091014;box-shadow:0 0 0 4px rgba(5,10,12,.9);transition:.18s; }
  .quality-rail button:hover::before { border-color:#d5aa57; }
  .quality-rail button.is-active { color:#f0d18c!important;text-shadow:0 0 10px rgba(232,184,77,.4); }
  .quality-rail button.is-active::before { background:#b67e23;border-color:#f0cf7b;box-shadow:0 0 12px rgba(232,184,77,.72),0 0 0 4px rgba(5,10,12,.9); }
  .fullscreen-rite { width:100%;margin-top:2px;padding:14px 70px;border:0;background:transparent;color:#d5b776;font:16px Georgia,serif;letter-spacing:1px;cursor:pointer;position:relative; }
  .fullscreen-rite::before,.fullscreen-rite::after { content:"";position:absolute;top:50%;width:23%;height:1px;background:linear-gradient(90deg,transparent,rgba(201,168,108,.55)); }
  .fullscreen-rite::before { left:3%; }.fullscreen-rite::after { right:3%;transform:scaleX(-1); }
  .fullscreen-rite:hover { color:#f0d18c;text-shadow:0 0 10px rgba(232,184,77,.4); }
`;
