import React from "react";
import { useTranslation } from "../i18n/useTranslation";
import type { EchoRecipe, RecipeMode } from "../game/recipeBooks";
import type { AIDifficulty } from "../game/aiStrategy";
import type { ContentPackId, GameSetup } from "../game/contentPacks";
import { createGameSetup } from "../game/contentPacks";
import { MenuRoomBackground } from "./MenuRoomBackground";

interface MainMenuProps {
    onNewGame: (setup: GameSetup, aiDifficulty?: AIDifficulty) => void;
    onContinue: () => void;
    canContinue: boolean;
    onGrimoire: () => void;
    onDlcs: () => void;
    onSettings: () => void;
    enabledPacks: ContentPackId[];
}

const dripStreams = [
    { fromX: "23.7%", toX: "32.5%", toY: "56%", duration: 5.8, delay: 0.4 },
    { fromX: "34.1%", toX: "44.2%", toY: "64%", duration: 6.7, delay: 2.2 },
    { fromX: "42.8%", toX: "36.6%", toY: "72%", duration: 7.1, delay: 4.1 },
    { fromX: "79.8%", toX: "80.1%", toY: "64%", duration: 6.3, delay: 1.3 },
    { fromX: "95.3%", toX: "93.5%", toY: "83%", duration: 7.8, delay: 3.3 },
];

const DIFFICULTY_SILHOUETTES: Record<AIDifficulty, string> = {
    apprentice: "/images/core/ui/new-game-silhouettes/difficulty-apprentice.png",
    skilled: "/images/core/ui/new-game-silhouettes/difficulty-skilled.png",
    master: "/images/core/ui/new-game-silhouettes/difficulty-master.png",
};
const RECIPE_BAG_SILHOUETTE = "/images/core/ui/new-game-silhouettes/recipe-bag.png";
const RECIPE_BAG_OPENED_SILHOUETTE = "/images/core/ui/new-game-silhouettes/recipe-bag-opened.png";
const PLAYER_COUNT_FRAME = "/images/core/ui/new-game-silhouettes/player-count.png";
const SCRYING_ORB = "/images/core/ui/new-game-silhouettes/scrying-orb.png";
type SelectableEchoRecipe = "retort_resonance" | "deep_resonance";
const ECHO_RECIPE_ART: Record<SelectableEchoRecipe, string> = {
    retort_resonance: "/images/dlc/veilglass-afflictions/recipes/echo-recipe-retort-resonance.webp",
    deep_resonance: "/images/dlc/veilglass-afflictions/recipes/echo-recipe-deep-resonance.webp",
};

type RitualTuningKey = AIDifficulty | "recipeBag";
type RitualAssetTuning = { x: number; y: number; scale: number };
type RitualTuningMap = Record<RitualTuningKey, RitualAssetTuning>;

const RITUAL_ASSET_TUNING: RitualTuningMap = {
    apprentice: { x: 11.9, y: 0, scale: 1.8 },
    skilled: { x: 3, y: -10, scale: 1.8 },
    master: { x: -5, y: -19, scale: 1.8 },
    recipeBag: { x: 10, y: 5, scale: 1.6 },
};

type ConfigTuningKey = "playerNumbers" | "playerHighlight" | SelectableEchoRecipe;
type ConfigTuningValue = { x: number; y: number; scale: number; gap?: number };
type ConfigTuningMap = Record<ConfigTuningKey, ConfigTuningValue>;

const CONFIG_CONTROL_TUNING: ConfigTuningMap = {
    playerNumbers: { x: 3.9, y: -1.5, scale: 1, gap: -2.4 },
    playerHighlight: { x: 0, y: 0, scale: .7 },
    retort_resonance: { x: -5, y: -18.4, scale: 1.3 },
    deep_resonance: { x: 11, y: -34.1, scale: 1 },
};

type OrbTuning = { x: number; y: number; scale: number };
const ORB_TUNING: OrbTuning = { x: 3.3, y: -23.2, scale: 1.2 };

export function MainMenu({ onNewGame, onContinue, canContinue, onGrimoire, onDlcs, onSettings, enabledPacks }: MainMenuProps) {
    const t = useTranslation();
    const [view, setView] = React.useState<"main" | "setup">("main");
    const [recipeMode, setRecipeMode] = React.useState<RecipeMode>(1);
    const [totalPlayers, setTotalPlayers] = React.useState(2);
    const [aiDifficulty, setAIDifficulty] = React.useState<AIDifficulty>("skilled");
    const [echoRecipe, setEchoRecipe] = React.useState<EchoRecipe>("retort_resonance");
    const [recipeOpen, setRecipeOpen] = React.useState(false);
    const mireEnabled = enabledPacks.includes("covenants_of_the_mire");
    const veilglassEnabled = enabledPacks.includes("distillers_of_the_veil");
    const recipeModes = [1, 2, 3, 4, ...(mireEnabled ? [5, 6] : []), "random"] as RecipeMode[];
    const playerCounts = [2, 3, 4, ...(mireEnabled ? [5] : [])];

    React.useEffect(() => {
        if (view !== "setup") return;
        const close = (event: KeyboardEvent) => {
            if (event.key !== "Escape") return;
            if (recipeOpen) setRecipeOpen(false);
            else setView("main");
        };
        window.addEventListener("keydown", close);
        return () => window.removeEventListener("keydown", close);
    }, [view, recipeOpen]);

    return (
        <div style={s.root}>
            <style>{menuAtmosphereCss}</style>
            <MenuRoomBackground room={view === "setup" ? "new-game" : "central"} />

            {/* Content — left-aligned layout per wireframe */}
            <div className="main-menu-content" style={s.content}>
                {/* Title area — top-left */}
                {view === "main" && <div className="main-menu-title" style={s.titleBlock}>
                    <img
                        src="/images/title/title-en.webp"
                        alt={t.menu.title}
                        style={s.titleImage}
                    />
                    <p style={s.subtitle}>{t.menu.subtitle}</p>
                </div>}

                {view === "main" ? (
                <nav className="main-menu-nav main-menu-primary" style={s.nav} aria-label="Main menu">
                    <MenuButton label={t.menu.continueGame} icon="continue" onClick={onContinue} accent="#76d7c4" disabled={!canContinue} />
                    <MenuButton label={t.menu.newGame} icon="new-game" onClick={() => setView("setup")} accent="#e8b84d" />
                    <MenuButton label={t.menu.grimoire} icon="grimoire" onClick={onGrimoire} accent="#e8b84d" />
                    <MenuButton label={t.menu.dlcs} icon="dlcs" onClick={onDlcs} accent="#76d7c4" />
                    <MenuButton label={t.menu.settings} icon="settings" onClick={onSettings} accent="#e8b84d" />
                </nav>
                ) : (
                <section className="ritual-setup" style={s.ritualOverlay} aria-labelledby="new-game-heading">
                    <svg className="ritual-outline-filters" width="0" height="0" aria-hidden="true">
                        <defs>
                            <filter id="ritual-outline-idle" x="-24%" y="-24%" width="148%" height="148%" colorInterpolationFilters="sRGB">
                                <feMorphology in="SourceAlpha" operator="dilate" radius="2" result="expanded" />
                                <feComposite in="expanded" in2="SourceAlpha" operator="out" result="ring" />
                                <feFlood floodColor="#a58b59" floodOpacity=".46" result="color" />
                                <feComposite in="color" in2="ring" operator="in" result="outline" />
                                <feMerge><feMergeNode in="SourceGraphic" /><feMergeNode in="outline" /></feMerge>
                            </filter>
                            <filter id="ritual-outline-active" x="-35%" y="-35%" width="170%" height="170%" colorInterpolationFilters="sRGB">
                                <feMorphology in="SourceAlpha" operator="dilate" radius="3" result="expanded" />
                                <feComposite in="expanded" in2="SourceAlpha" operator="out" result="ring" />
                                <feFlood floodColor="#d8ac58" floodOpacity=".68" result="gold" />
                                <feComposite in="gold" in2="ring" operator="in" result="outline" />
                                <feGaussianBlur in="outline" stdDeviation="1.7" result="glow" />
                                <feMerge><feMergeNode in="SourceGraphic" /><feMergeNode in="glow" /><feMergeNode in="outline" /></feMerge>
                            </filter>
                        </defs>
                    </svg>
                    <div className="ritual-art-stage" style={s.ritualArtStage}>
                        <header className="ritual-heading" style={s.ritualHeading}>
                            <p style={s.setupEyebrow}>NEW SESSION</p>
                            <h2 id="new-game-heading" style={s.ritualTitle}>Prepare a New Brew</h2>
                            <p style={s.ritualSubtitle}>Set the instruments, then begin the rite.</p>
                        </header>
                        <aside className="ritual-summary" style={s.ritualSummary} aria-label="Current game setup">
                            <span><b>Recipe</b>{recipeMode === "random" ? "Random" : `Set ${recipeMode}`}</span>
                            <span><b>Brewers</b>{totalPlayers}</span>
                            <span><b>Rivals</b>{t.menu[aiDifficulty]}</span>
                            {veilglassEnabled && <span><b>Echo</b>{echoRecipe === "retort_resonance" ? t.menu.retortResonance : t.menu.deepResonance}</span>}
                        </aside>
                        <button type="button" className="ritual-back" onClick={() => setView("main")} style={s.ritualBack}>← Main Menu</button>

                        {veilglassEnabled && (
                            <fieldset className="ritual-group ritual-echo" style={{ ...s.ritualGroup, ...s.ritualEcho }}>
                                <legend style={s.ritualLegend}>{t.menu.echoRecipe}</legend>
                                {(["retort_resonance", "deep_resonance"] as SelectableEchoRecipe[]).map((recipe, index) => (
                                    <button type="button" key={recipe} className={`ritual-object ritual-echo-hotspot${echoRecipe === recipe ? " is-active" : ""}`}
                                        style={{ ...s.ritualEchoHotspot, left: index === 0 ? "0%" : "68%" }} aria-pressed={echoRecipe === recipe}
                                        aria-label={recipe === "retort_resonance" ? t.menu.retortResonance : t.menu.deepResonance}
                                        data-tooltip={recipe === "retort_resonance" ? t.menu.retortResonance : t.menu.deepResonance} onClick={() => setEchoRecipe(recipe)}>
                                        <img src={ECHO_RECIPE_ART[recipe]} style={{
                                            "--echo-x": `${CONFIG_CONTROL_TUNING[recipe].x}%`,
                                            "--echo-y": `${CONFIG_CONTROL_TUNING[recipe].y}%`,
                                            "--echo-scale": CONFIG_CONTROL_TUNING[recipe].scale,
                                            "--echo-delay": index === 0 ? "0s" : "-1.6s",
                                        } as React.CSSProperties} alt="" aria-hidden="true" />
                                    </button>
                                ))}
                                <div className="ritual-echo-status" style={{ ...s.ritualEchoStatus, transform: tuningTransform(ORB_TUNING) }} aria-live="polite">
                                    <span className="ritual-scrying-float">
                                    <img className="ritual-scrying-orb" src={SCRYING_ORB} alt="" aria-hidden="true" />
                                    <span className="ritual-scrying-copy">
                                        <small>Scrying Orb</small>
                                        <strong>{echoRecipe === "retort_resonance" ? "Retort" : "Deep"}</strong>
                                        <b>Resonance</b>
                                    </span>
                                    </span>
                                </div>
                            </fieldset>
                        )}

                        <fieldset className="ritual-group ritual-difficulty" style={{ ...s.ritualGroup, ...s.ritualDifficulty }}>
                            <legend style={s.ritualLegend}>{t.menu.difficulty}</legend>
                            {(["apprentice", "skilled", "master"] as AIDifficulty[]).map((difficulty, index) => (
                                <button type="button" key={difficulty} className={`ritual-object ritual-dial${aiDifficulty === difficulty ? " is-active" : ""}`}
                                    style={{ ...s.ritualDial, left: `${index * 33.333}%`, transform: tuningTransform(RITUAL_ASSET_TUNING[difficulty]) }} aria-pressed={aiDifficulty === difficulty}
                                    aria-label={t.menu[difficulty]} data-tooltip={t.menu[difficulty]} onClick={() => setAIDifficulty(difficulty)}>
                                    <img className="ritual-silhouette" src={DIFFICULTY_SILHOUETTES[difficulty]} alt="" aria-hidden="true" />
                                </button>
                            ))}
                        </fieldset>

                        <fieldset className="ritual-group ritual-players" style={{ ...s.ritualGroup, ...s.ritualPlayers }}>
                            <legend style={s.ritualLegend}>{t.menu.players}</legend>
                            <img className="ritual-player-frame" src={PLAYER_COUNT_FRAME} alt="" aria-hidden="true" />
                            {[2, 3, 4, 5].map((count, index) => {
                                const available = playerCounts.includes(count);
                                return <button type="button" key={count} className={`ritual-player-medallion${totalPlayers === count ? " is-active" : ""}`}
                                    style={{
                                        left: `${3 + CONFIG_CONTROL_TUNING.playerNumbers.x + index * (24 + (CONFIG_CONTROL_TUNING.playerNumbers.gap ?? 0))}%`,
                                        top: `${16 + CONFIG_CONTROL_TUNING.playerNumbers.y}%`,
                                        transform: `scale(${CONFIG_CONTROL_TUNING.playerNumbers.scale})`,
                                    }} disabled={!available} aria-pressed={totalPlayers === count}
                                    aria-label={available ? `${count} players` : `${count} players requires Mirewrought Pacts`}
                                    onClick={() => available && setTotalPlayers(count)}>
                                    {totalPlayers === count && <i className="ritual-player-glow" style={{ transform: `translate(${CONFIG_CONTROL_TUNING.playerHighlight.x}%,${CONFIG_CONTROL_TUNING.playerHighlight.y}%) scale(${CONFIG_CONTROL_TUNING.playerHighlight.scale})` }} />}
                                    <span>{available ? count : "◆"}</span>
                                </button>;
                            })}
                        </fieldset>

                        <div className="ritual-recipe" style={s.ritualRecipe}>
                            <button type="button" className={`ritual-object ritual-bag${recipeOpen ? " is-open" : ""}`} style={s.ritualBag}
                                aria-label={`Recipe Book, ${recipeMode === "random" ? "Random" : `Set ${recipeMode}`}`} aria-expanded={recipeOpen}
                                data-tooltip={`Recipe: ${recipeMode === "random" ? "Random" : `Set ${recipeMode}`}`} onClick={() => setRecipeOpen((open) => !open)}>
                                <img className={`ritual-silhouette ritual-bag-closed${recipeOpen ? " is-hidden" : ""}`} style={{ transform: tuningTransform(RITUAL_ASSET_TUNING.recipeBag) }} src={RECIPE_BAG_SILHOUETTE} alt="" aria-hidden="true" />
                                <img className={`ritual-silhouette ritual-bag-opened${recipeOpen ? " is-visible" : ""}`} style={{ transform: tuningTransform(RITUAL_ASSET_TUNING.recipeBag) }} src={RECIPE_BAG_OPENED_SILHOUETTE} alt="" aria-hidden="true" />
                            </button>
                            {recipeOpen && <div className="ritual-recipe-picker" style={s.ritualRecipePicker} role="menu" aria-label="Recipe Book sets">
                                <span style={s.recipePickerTitle}>Choose Recipe Book</span>
                                <div style={s.recipePickerGrid}>
                                    {recipeModes.map((mode) => <button type="button" key={mode} role="menuitemradio" aria-checked={recipeMode === mode}
                                        className={recipeMode === mode ? "is-selected" : ""}
                                        onClick={() => { setRecipeMode(mode); setRecipeOpen(false); }}>
                                        {mode === "random" ? "Random" : `Set ${mode}`}
                                    </button>)}
                                </div>
                            </div>}
                        </div>

                        <button type="button" autoFocus className="ritual-begin" onClick={() => onNewGame(createGameSetup({ recipeMode, totalPlayers, enabledPacks, echoRecipe }), aiDifficulty)} style={s.ritualBegin}>
                            <strong>Begin Brewing</strong><small>Seal this configuration</small>
                        </button>
                    </div>
                </section>
                )}

                {/* Footer */}
                {view === "main" && <div className="main-menu-footer" style={s.footer}>
                    <img src="/images/ui/softcurse-mark.webp" alt="" aria-hidden="true" style={s.studioMark} />
                    <span style={s.footerText}>© Softcurse Systems</span>
                </div>}
            </div>

        </div>
    );
}

function tuningTransform(value: RitualAssetTuning) {
    return `translate(${value.x}%, ${value.y}%) scale(${value.scale})`;
}

function MenuAtmosphere() {
    return (
        <div className="menu-atmosphere" aria-hidden="true">
            <div className="menu-light menu-light-teal" />
            <div className="menu-light menu-light-purple" />
            <FogCanvas />
            {dripStreams.flatMap((stream, streamIndex) => (
                [0, 1].map((repeat) => {
                    const delay = stream.delay + repeat * (stream.duration / 2);
                    const variables = {
                        "--drop-to-x": stream.toX,
                        "--drop-to-y": stream.toY,
                        "--drop-duration": `${stream.duration}s`,
                        "--drop-delay": `${delay}s`,
                    } as React.CSSProperties;
                    return (
                        <span
                            key={`${streamIndex}-${repeat}`}
                            className="menu-drip"
                            style={{ ...variables, left: stream.fromX }}
                        />
                    );
                })
            ))}
        </div>
    );
}

interface FogWisp {
    startX: number;
    targetX: number;
    y: number;
    radius: number;
    rise: number;
    drift: number;
    phase: number;
    phaseSpeed: number;
    opacity: number;
    age: number;
    lifetime: number;
}

function FogCanvas() {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);

    React.useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext("2d");
        if (!context) return;

        let frameId = 0;
        let lastDrawAt = 0;
        const frameInterval = 1000 / 30;
        let width = 0;
        let height = 0;
        let wisps: FogWisp[] = [];
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        const resetWisp = (wisp: FogWisp, initial = false) => {
            wisp.startX = width * (0.615 + Math.random() * 0.075);
            wisp.targetX = width * (0.49 + Math.random() * 0.27);
            wisp.y = height * (0.47 + Math.random() * 0.08);
            wisp.radius = Math.max(42, width * (0.022 + Math.random() * 0.038));
            wisp.rise = reducedMotion ? 0 : 0.45 + Math.random() * 0.4;
            wisp.drift = (Math.random() - 0.5) * 0.1;
            wisp.phase = Math.random() * Math.PI * 2;
            wisp.phaseSpeed = 0.004 + Math.random() * 0.008;
            wisp.opacity = 0.025 + Math.random() * 0.03;
            wisp.lifetime = 680 + Math.random() * 270;
            wisp.age = initial ? Math.random() * wisp.lifetime * 0.72 : 0;
            if (initial) wisp.y -= wisp.age * wisp.rise;
        };

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = Math.round(width * dpr);
            canvas.height = Math.round(height * dpr);
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            context.setTransform(dpr, 0, 0, dpr, 0, 0);
            wisps = Array.from({ length: width < 900 ? 22 : 48 }, () => {
                const wisp = {} as FogWisp;
                resetWisp(wisp, true);
                return wisp;
            });
        };

        const draw = (now: number) => {
            frameId = window.requestAnimationFrame(draw);
            if (now - lastDrawAt < frameInterval) return;
            lastDrawAt = now - ((now - lastDrawAt) % frameInterval);
            context.clearRect(0, 0, width, height);
            context.globalCompositeOperation = "lighter";

            for (const wisp of wisps) {
                const progress = wisp.age / wisp.lifetime;
                const fade = Math.sin(Math.min(1, progress) * Math.PI);
                const shapedProgress = progress * progress * (3 - 2 * progress);
                const curl = Math.sin(wisp.phase + wisp.age * wisp.phaseSpeed) * wisp.radius * (0.28 + progress * 0.48);
                const spread = 0.78 + progress * 1.55;
                const pathX = wisp.startX + (wisp.targetX - wisp.startX) * shapedProgress;
                const x = pathX + curl + wisp.drift * wisp.age;
                const radius = wisp.radius * spread;
                const gradient = context.createRadialGradient(x, wisp.y, radius * 0.08, x, wisp.y, radius);
                gradient.addColorStop(0, `rgba(178, 255, 239, ${wisp.opacity * fade})`);
                gradient.addColorStop(0.34, `rgba(87, 221, 202, ${wisp.opacity * fade * 0.72})`);
                gradient.addColorStop(1, "rgba(29, 120, 116, 0)");
                context.fillStyle = gradient;
                context.beginPath();
                context.ellipse(
                    x,
                    wisp.y,
                    radius * (0.9 + Math.sin(wisp.phase) * 0.14),
                    radius * (0.46 + progress * 0.22),
                    Math.sin(wisp.phase + progress * 4) * 0.18,
                    0,
                    Math.PI * 2,
                );
                context.fill();

                wisp.y -= wisp.rise;
                wisp.age += 1;
                if (wisp.age >= wisp.lifetime || wisp.y < -radius) resetWisp(wisp);
            }

        };

        resize();
        window.addEventListener("resize", resize);
        frameId = window.requestAnimationFrame(draw);
        return () => {
            window.cancelAnimationFrame(frameId);
            window.removeEventListener("resize", resize);
        };
    }, []);

    return <canvas ref={canvasRef} className="menu-fog-canvas" />;
}

// ── Menu button component ────────────────────────────────────────────────────

function MenuButton({
    label,
    icon,
    onClick,
    accent,
    disabled = false,
}: {
    label: string;
    icon: "continue" | "new-game" | "grimoire" | "dlcs" | "settings";
    onClick: () => void;
    accent: string;
    disabled?: boolean;
}) {
    return (
        <button
            className="main-menu-action"
            aria-label={label}
            style={s.menuBtn}
            onClick={onClick}
            disabled={disabled}
            aria-disabled={disabled}
            onMouseEnter={(e) => {
                if (disabled) return;
                (e.currentTarget as HTMLButtonElement).style.borderColor = accent + "88";
                (e.currentTarget as HTMLButtonElement).style.color = accent;
                (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 24px ${accent}15`;
            }}
            onMouseLeave={(e) => {
                if (disabled) return;
                (e.currentTarget as HTMLButtonElement).style.borderColor = "transparent";
                (e.currentTarget as HTMLButtonElement).style.color = "#c9a86c"; // C.amber
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
            }}
        >
            <span style={s.menuFlourish} aria-hidden="true" />
            <img src={`/images/ui/menu/menu-icon-${icon}.webp`} alt="" style={{ ...s.menuIcon, filter: `drop-shadow(0 0 8px ${accent}66)` }} aria-hidden="true" />
            <span style={s.menuLabel}>{label}</span>
        </button>
    );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s: Record<string, React.CSSProperties> = {
    root: {
        minHeight: "100vh",
        background: "#03070a",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        userSelect: "none",
    },
    particles: {
        position: "fixed",
        inset: 0,
        backgroundImage:
            "radial-gradient(1px 1px at 10% 20%, #cc88ff11 0%, transparent 100%), " +
            "radial-gradient(1px 1px at 30% 60%, #aa66ee08 0%, transparent 100%), " +
            "radial-gradient(1.5px 1.5px at 70% 30%, #8855bb0a 0%, transparent 100%), " +
            "radial-gradient(1px 1px at 50% 80%, #cc88ff06 0%, transparent 100%), " +
            "radial-gradient(2px 2px at 80% 15%, #7733bb0d 0%, transparent 100%)",
        pointerEvents: "none",
        zIndex: 0,
    },
    content: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "clamp(28px, 5vh, 58px) clamp(40px, 6vw, 100px)",
        position: "relative",
        zIndex: 1,
        flex: 1,
        maxWidth: 760,
    },
    titleBlock: {
        marginTop: 0,
        marginBottom: "clamp(24px, 4vh, 48px)",
    },
    rune: {
        color: "#4a1a7a",
        fontSize: 24,
        letterSpacing: 10,
        marginBottom: 8,
        opacity: 0.7,
    },
    title: {
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontSize: "clamp(32px, 5vw, 52px)",
        color: "#cc88ff",
        letterSpacing: 2,
        margin: 0,
        lineHeight: 1.15,
        fontWeight: "normal",
        textShadow:
            "0 0 40px rgba(180, 80, 255, 0.3), 0 0 80px rgba(120, 40, 200, 0.1)",
    },
    titleImage: {
        width: "100%",
        maxWidth: 520,
        height: "auto",
        objectFit: "contain",
        display: "block",
        margin: "6px 0",
        filter: "drop-shadow(0 0 20px rgba(180, 80, 255, 0.3)) drop-shadow(0 0 40px rgba(120, 40, 200, 0.1))",
    },
    titleOf: {
        color: "#664488",
        fontSize: "0.7em",
        fontStyle: "italic",
    },
    subtitle: {
        fontFamily: "monospace",
        fontSize: 14,
        color: "#c9a86c", // Gold/amber
        letterSpacing: 2,
        marginTop: 8,
    },
    nav: {
        display: "flex",
        flexDirection: "column",
        gap: 4,
        marginTop: "clamp(90px, 11vh, 145px)",
        marginBottom: 24,
        padding: "8px 0",
        width: "min(410px, 100%)",
    },
    menuBtn: {
        display: "flex",
        alignItems: "center",
        gap: 16,
        background: "linear-gradient(90deg,rgba(2,7,10,.68),rgba(3,8,12,.25) 72%,transparent)",
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: "transparent",
        borderRadius: 4,
        padding: "10px 24px 10px 14px",
        color: "#c9a86c", // Match settings text color
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontSize: "clamp(27px, 2.85vh, 36px)",
        letterSpacing: 2,
        cursor: "pointer",
        textAlign: "left",
        transition: "border-color 0.25s, color 0.25s, box-shadow 0.25s",
        width: "100%",
        maxWidth: 400,
    },
    menuFlourish: {
        width: 2,
        height: 30,
        background: "linear-gradient(transparent,#b9904d,transparent)",
        boxShadow: "0 0 12px rgba(232,184,77,.35)",
        opacity: 0.72,
        flexShrink: 0,
    },
    menuIcon: {
        display: "block",
        width: 44,
        height: 44,
        objectFit: "contain",
        opacity: 0.92,
        flexShrink: 0,
    },
    menuLabel: {
        flex: 1,
        minWidth: 0,
        whiteSpace: "nowrap",
    },
    footer: {
        marginTop: "auto",
        paddingTop: 18,
        display: "flex",
        alignItems: "center",
        gap: 8,
    },
    studioMark: {
        width: 28,
        height: 28,
        objectFit: "contain",
        opacity: 0.58,
        filter: "grayscale(1) sepia(.5) brightness(.88)",
    },
    footerText: {
        fontFamily: "monospace",
        fontSize: 12,
        color: "#8a7656", // Bronze
        letterSpacing: 2,
    },
    ritualOverlay: {
        position: "fixed",
        inset: 0,
        zIndex: 5,
        overflow: "hidden",
        pointerEvents: "none",
        animation: "menuBackdropIn .28s ease-out both",
    },
    ritualArtStage: {
        position: "absolute",
        left: "50%",
        top: "50%",
        width: "max(100vw, calc(100vh * 1.80282))",
        height: "max(100vh, calc(100vw / 1.80282))",
        transform: "translate(-50%,-50%)",
        pointerEvents: "none",
    },
    ritualHeading: {
        position: "absolute",
        left: "9.2%",
        top: "15.5%",
        width: "27%",
        padding: "1.1% 1.4% 1.2%",
        borderLeft: "1px solid rgba(232,184,77,.52)",
        background: "linear-gradient(90deg,rgba(1,5,8,.76),rgba(1,5,8,.28),transparent)",
        filter: "drop-shadow(0 12px 20px rgba(0,0,0,.7))",
    },
    ritualTitle: {
        margin: 0,
        color: "#e6cb91",
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontSize: "clamp(25px,2.25vw,44px)",
        fontWeight: 400,
        letterSpacing: 1,
        textShadow: "0 2px 14px #000",
    },
    ritualSubtitle: {
        margin: "8px 0 0",
        color: "#94866d",
        fontFamily: "Georgia, serif",
        fontSize: "clamp(11px,.82vw,16px)",
        fontStyle: "italic",
    },
    ritualSummary: {
        position: "absolute",
        left: "10.6%",
        top: "31.5%",
        width: "23%",
        display: "grid",
        gridTemplateColumns: "repeat(2,minmax(0,1fr))",
        gap: "clamp(8px,1vh,14px) clamp(14px,1.4vw,26px)",
        padding: "1.2% 1.4%",
        borderTop: "1px solid rgba(201,168,108,.25)",
        borderBottom: "1px solid rgba(201,168,108,.18)",
        background: "linear-gradient(90deg,rgba(1,6,9,.58),rgba(1,6,9,.16),transparent)",
        color: "#d2b77e",
        fontFamily: "Georgia,serif",
        fontSize: "clamp(11px,.78vw,15px)",
        pointerEvents: "none",
    },
    ritualBack: {
        position: "absolute",
        left: "6.2%",
        top: "87.5%",
        padding: ".7% 1.15%",
        border: "1px solid rgba(201,168,108,.38)",
        borderRadius: 4,
        background: "rgba(1,6,9,.75)",
        color: "#c9a86c",
        fontFamily: "Georgia, serif",
        fontSize: "clamp(12px,.9vw,18px)",
        cursor: "pointer",
        pointerEvents: "auto",
    },
    ritualGroup: {
        position: "absolute",
        margin: 0,
        padding: 0,
        border: 0,
        pointerEvents: "none",
    },
    ritualLegend: {
        position: "absolute",
        left: "50%",
        bottom: "calc(100% + 8px)",
        transform: "translateX(-50%)",
        padding: "3px 7px",
        border: 0,
        background: "rgba(2,8,11,.42)",
        color: "#cfb171",
        boxShadow: "0 4px 12px rgba(0,0,0,.45)",
        fontFamily: "monospace",
        fontSize: "clamp(8px,.62vw,12px)",
        letterSpacing: 2,
        textTransform: "uppercase",
        whiteSpace: "nowrap",
    },
    ritualEcho: { left: "54%", top: "55.1%", width: "22%", height: "8.2%", zIndex: 4 },
    ritualEchoHotspot: {
        position: "absolute",
        top: 0,
        width: "24%",
        height: "100%",
        padding: 0,
        border: "1px solid rgba(201,168,108,.24)",
        borderRadius: "50%",
        background: "transparent",
        color: "#e8b84d",
        cursor: "pointer",
        pointerEvents: "auto",
    },
    ritualEchoStatus: {
        position: "absolute",
        left: "34%",
        top: "4%",
        width: "24%",
        height: "88%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "#dbc17f",
        textAlign: "center",
        textShadow: "0 2px 6px #000",
        pointerEvents: "none",
    },
    ritualDifficulty: { left: "50.3%", top: "49.8%", width: "17.7%", height: "10.6%" },
    ritualDial: {
        position: "absolute",
        top: 0,
        width: "26%",
        height: "100%",
        border: "1px solid rgba(201,168,108,.24)",
        borderRadius: "46% 46% 12px 12px",
        background: "rgba(1,6,8,.025)",
        color: "rgba(220,191,129,.48)",
        fontFamily: "Georgia,serif",
        cursor: "pointer",
        pointerEvents: "auto",
    },
    ritualPlayers: { left: "9.2%", top: "41.5%", width: "24%", height: "14%" },
    ritualSocket: {
        position: "absolute",
        top: 0,
        width: "25%",
        height: "78%",
        border: "1px solid rgba(201,168,108,.24)",
        borderRadius: "50%",
        background: "rgba(0,0,0,.05)",
        color: "rgba(220,191,129,.48)",
        fontFamily: "Georgia,serif",
        fontSize: "clamp(13px,1.15vw,22px)",
        cursor: "pointer",
        pointerEvents: "auto",
    },
    ritualRecipe: {
        position: "absolute",
        left: "77.9%",
        top: "52.1%",
        width: "5%",
        height: "8.8%",
        pointerEvents: "auto",
    },
    ritualBag: {
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        border: "1px solid rgba(201,168,108,.32)",
        borderRadius: "48% 48% 22% 22%",
        background: "rgba(76,22,98,.03)",
        cursor: "pointer",
    },
    ritualRecipePicker: {
        position: "absolute",
        right: "calc(100% + 18px)",
        top: "-42%",
        width: "clamp(220px,14vw,290px)",
        padding: "14px",
        border: "1px solid rgba(201,168,108,.48)",
        borderRadius: 5,
        background: "linear-gradient(145deg,rgba(3,10,13,.96),rgba(15,6,21,.94))",
        boxShadow: "0 18px 46px rgba(0,0,0,.76),inset 0 0 30px rgba(100,38,126,.12)",
        zIndex: 8,
    },
    recipePickerTitle: { display: "block", marginBottom: 10, color: "#d6b873", fontFamily: "monospace", fontSize: 11, letterSpacing: 2, textTransform: "uppercase" },
    recipePickerGrid: { display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 7 },
    ritualBegin: {
        position: "absolute",
        left: "12.1%",
        top: "58.5%",
        width: "20%",
        minHeight: "6.6%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: ".65% 1.35%",
        border: "1px solid rgba(201,168,108,.58)",
        borderRadius: 2,
        background: "linear-gradient(90deg,rgba(5,10,12,.9),rgba(28,15,20,.88),rgba(5,10,12,.9))",
        boxShadow: "0 14px 36px rgba(0,0,0,.68),inset 0 0 22px rgba(117,67,23,.08)",
        color: "#f0d18c",
        fontFamily: "Georgia,serif",
        fontSize: "clamp(16px,1.18vw,24px)",
        letterSpacing: 1,
        cursor: "pointer",
        pointerEvents: "auto",
    },
    setupOverlay: {
        position: "fixed",
        inset: 0,
        zIndex: 5,
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "clamp(24px,4vw,72px)",
        background: "linear-gradient(90deg,rgba(0,0,0,.42),transparent 58%)",
        animation: "menuBackdropIn .24s ease-out both",
    },
    setupPanel: {
        width: "min(760px,48vw)",
        maxHeight: "calc(100vh - 60px)",
        overflowY: "auto",
        padding: "clamp(24px,3vh,34px) clamp(24px,2.5vw,38px) 24px",
        border: "1px solid rgba(201,168,108,.38)",
        borderRadius: 5,
        background: "linear-gradient(135deg,rgba(3,11,14,.93),rgba(10,4,17,.91))",
        boxShadow: "0 28px 100px rgba(0,0,0,.78), inset 0 0 70px rgba(84,32,117,.1), 0 0 0 1px rgba(0,0,0,.8)",
        animation: "menuPanelIn .28s ease-out both",
    },
    setupHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 },
    setupEyebrow: { margin: "0 0 4px", fontFamily: "monospace", fontSize: 10, letterSpacing: 4, color: "#76d7c4" },
    setupTitle: { margin: 0, fontFamily: "Georgia, serif", fontWeight: 400, fontSize: "clamp(27px,3.2vh,38px)", letterSpacing: 1, color: "#e1c58d" },
    closeBtn: { width: 38, height: 38, border: "1px solid rgba(201,168,108,.3)", borderRadius: 4, background: "rgba(0,0,0,.25)", color: "#bca476", fontSize: 24, lineHeight: 1, cursor: "pointer" },
    setupDivider: { height: 1, margin: "15px 0", background: "linear-gradient(90deg,#a17b3f,rgba(118,215,196,.18),transparent)" },
    setupGrid: { display: "grid", gap: 10 },
    setupActions: { display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 17 },
    secondaryBtn: { padding: "11px 22px", border: "1px solid rgba(201,168,108,.3)", borderRadius: 4, background: "rgba(0,0,0,.2)", color: "#bca476", fontFamily: "Georgia,serif", fontSize: 16, cursor: "pointer" },
    beginBtn: { padding: "11px 26px", border: "1px solid #d9a936", borderRadius: 4, background: "linear-gradient(180deg,rgba(113,71,15,.62),rgba(49,27,7,.82))", color: "#f0d18c", boxShadow: "0 0 22px rgba(232,184,77,.13)", fontFamily: "Georgia,serif", fontSize: 17, letterSpacing: .6, cursor: "pointer" },
    escapeHint: { margin: "10px 0 0", textAlign: "right", fontFamily: "monospace", fontSize: 9, letterSpacing: 2, color: "#74664e" },
    recipePanel: {
        display: "flex",
        flexDirection: "column",
        gap: 10,
        minWidth: 0,
        minHeight: 118,
        padding: "14px 14px 12px",
        border: "1px solid rgba(232,184,77,0.25)",
        background: "linear-gradient(145deg,rgba(13,8,20,.72),rgba(2,9,12,.56))",
        borderRadius: 5,
    },
    recipeLabel: {
        fontFamily: "monospace",
        fontSize: 12,
        color: "#c9a86c",
        letterSpacing: 2,
        textTransform: "uppercase",
    },
    recipeButtons: {
        display: "flex",
        gap: 9,
        flexWrap: "wrap",
        marginTop: "auto",
    },
    recipeBtn: {
        background: "transparent",
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: "#3a1a5a",
        borderRadius: 5,
        color: "#c9a86c",
        padding: "9px 14px",
        fontFamily: "monospace",
        cursor: "pointer",
    },
    optionHint: {
        margin: 0,
        minHeight: 34,
        color: "#94866d",
        fontFamily: "Georgia, serif",
        fontSize: 13,
        lineHeight: 1.35,
        fontStyle: "italic",
    },
    recipeBtnActive: {
        borderColor: "#e8b84d",
        color: "#e8b84d",
        background: "rgba(232,184,77,0.12)",
    },
    echoRecipeBtn: {
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
    },
    echoRecipeIcon: {
        width: 24,
        height: 24,
        objectFit: "contain",
        filter: "drop-shadow(0 0 5px rgba(143,200,255,.45))",
    },
    expansionPanel: {
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: 7,
        maxWidth: 550,
        padding: "10px 12px",
        border: "1px solid rgba(118,215,196,0.3)",
        background: "rgba(4,18,22,0.62)",
        borderRadius: 8,
    },
    expansionToggle: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        width: "100%",
        padding: "9px 10px",
        border: "1px solid rgba(118,215,196,0.2)",
        borderRadius: 6,
        color: "#bda988",
        background: "rgba(6,2,14,0.5)",
        cursor: "pointer",
        textAlign: "left",
    },
    expansionToggleActive: {
        borderColor: "rgba(118,215,196,0.75)",
        background: "rgba(31,93,87,0.24)",
        color: "#d9ede7",
    },
    expansionCopy: {
        display: "grid",
        gap: 3,
        minWidth: 0,
    },
    expansionTitle: {
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontSize: 14,
        letterSpacing: 0.4,
    },
    expansionSummary: {
        fontFamily: "monospace",
        fontSize: 10,
        lineHeight: 1.35,
        opacity: 0.76,
    },
    expansionState: {
        flexShrink: 0,
        padding: "4px 7px",
        border: "1px solid #49345d",
        borderRadius: 999,
        fontFamily: "monospace",
        fontSize: 9,
        letterSpacing: 0.7,
        textTransform: "uppercase",
    },
    expansionStateActive: {
        borderColor: "#76d7c4",
        color: "#76d7c4",
    },
    glowOrb: {
        position: "fixed",
        right: "-15vw",
        top: "20vh",
        width: "50vw",
        height: "50vw",
        borderRadius: "50%",
        background:
            "radial-gradient(circle, rgba(100, 30, 180, 0.06) 0%, rgba(60, 10, 120, 0.02) 40%, transparent 70%)",
        pointerEvents: "none",
        zIndex: 0,
    },
};

const menuAtmosphereCss = `
  @keyframes menuBackdropIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes menuPanelIn {
    from { opacity: 0; transform: translateY(16px) scale(.985); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  .main-menu-action:disabled {
    opacity: .34;
    cursor: default !important;
    filter: grayscale(.55);
  }

  .main-menu-action:focus-visible,
  .new-game-setup button:focus-visible,
  .main-menu-options button:focus-visible,
  .ritual-setup button:focus-visible {
    outline: 2px solid #e8b84d;
    outline-offset: 3px;
  }

  .ritual-summary span { display: grid; gap: 3px; }
  .ritual-summary b {
    color: #6fbfb4; font: 8px/1 monospace; letter-spacing: 1.6px; text-transform: uppercase;
  }

  .ritual-object {
    transition: border-color .2s, background .2s, box-shadow .2s, color .2s, filter .2s;
  }
  .ritual-object:hover,
  .ritual-object:focus-visible {
    border-color: rgba(230,203,145,.72) !important;
    background: rgba(107,52,130,.08) !important;
    box-shadow: inset 0 0 13px rgba(182,104,228,.12), 0 0 12px rgba(182,104,228,.26);
  }
  .ritual-object.is-active,
  .ritual-bag.is-open {
    border-color: #e8b84d !important;
    background: rgba(155,82,190,.09) !important;
    box-shadow: inset 0 0 18px rgba(195,117,255,.17), 0 0 18px rgba(232,184,77,.42);
    color: #f0d18c !important;
  }
  .ritual-dial,
  .ritual-dial:hover,
  .ritual-dial:focus-visible,
  .ritual-dial.is-active,
  .ritual-bag,
  .ritual-bag:hover,
  .ritual-bag:focus-visible,
  .ritual-bag.is-active,
  .ritual-bag.is-open {
    border-color: transparent !important;
    background: transparent !important;
    box-shadow: none !important;
    outline: none !important;
  }
  .ritual-echo-hotspot,
  .ritual-echo-hotspot:hover,
  .ritual-echo-hotspot:focus-visible,
  .ritual-echo-hotspot.is-active {
    border-color: transparent !important;
    background: transparent !important;
    box-shadow: none !important;
    outline: none !important;
  }
  .ritual-dial {
    transform-origin: 50% 82%;
  }
  .ritual-bag .ritual-silhouette {
    transform-origin: 50% 88%;
  }
  .ritual-silhouette {
    position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain;
    pointer-events: none; filter: url(#ritual-outline-idle);
    transition: filter .2s ease, transform .2s ease, opacity .22s ease;
  }
  .ritual-bag-opened { opacity: 0; }
  .ritual-bag-opened.is-visible { opacity: 1; }
  .ritual-bag-closed.is-hidden { opacity: 0; }
  .ritual-dial:hover .ritual-silhouette,
  .ritual-dial:focus-visible .ritual-silhouette,
  .ritual-dial.is-active .ritual-silhouette,
  .ritual-bag:hover .ritual-silhouette,
  .ritual-bag:focus-visible .ritual-silhouette,
  .ritual-bag.is-active .ritual-silhouette {
    filter: url(#ritual-outline-active);
  }
  .ritual-bag:hover .ritual-silhouette,
  .ritual-bag:focus-visible .ritual-silhouette { filter: url(#ritual-outline-idle); }
  .ritual-object:disabled { opacity: .64; cursor: default !important; }
  .ritual-echo-hotspot { overflow: visible; }
  .ritual-echo-hotspot > img {
    position: absolute; left: 50%; top: 50%; width: 128%; height: 128%;
    object-fit: contain;
    filter: saturate(.65) brightness(.62); opacity: .72; pointer-events: none;
    transition: filter .2s ease, opacity .2s ease;
    animation: ritualEchoLevitate 3.2s ease-in-out var(--echo-delay) infinite;
  }
  .ritual-echo-hotspot:hover > img,
  .ritual-echo-hotspot:focus-visible > img,
  .ritual-echo-hotspot.is-active > img {
    filter: saturate(1.08) brightness(1.12) drop-shadow(0 0 7px rgba(227,181,83,.78));
    opacity: 1;
  }
  .ritual-echo > legend { display: none; }
  @keyframes ritualEchoLevitate {
    0%,100% { transform: translate(calc(-50% + var(--echo-x)),calc(-50% + var(--echo-y) + 2%)) scale(var(--echo-scale)); }
    50% { transform: translate(calc(-50% + var(--echo-x)),calc(-50% + var(--echo-y) - 5%)) scale(var(--echo-scale)); }
  }
  .ritual-echo-status {
    overflow: visible; isolation: isolate;
  }
  .ritual-echo-status::before {
    content:"";position:absolute;inset:14%;z-index:0;border-radius:50%;
    background:radial-gradient(circle,rgba(131,230,224,.18),rgba(97,50,154,.12) 45%,transparent 72%);
    filter:blur(5px);animation:scryingOrbGlow 3.8s ease-in-out infinite;
  }
  .ritual-scrying-float { position:absolute;inset:0;z-index:1;display:flex;align-items:center;justify-content:center;animation:scryingOrbFloat 3.5s ease-in-out -.8s infinite; }
  .ritual-scrying-orb { position:absolute;left:50%;top:50%;width:134%;height:134%;object-fit:contain;transform:translate(-50%,-50%);z-index:1;filter:brightness(.72) saturate(.9);pointer-events:none; }
  .ritual-scrying-copy { position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;text-shadow:0 2px 5px #071016,0 0 5px rgba(3,9,13,.9); }
  .ritual-scrying-copy small { color: #b8eee6; font: clamp(7px,.43vw,9px)/1 monospace; letter-spacing: 1px; text-transform: uppercase; }
  .ritual-scrying-copy strong { margin-top: 3px; color:#f0dcaa; font: clamp(11px,.72vw,15px)/1 Georgia,serif; font-weight:400; }
  .ritual-scrying-copy b { margin-top: 2px; color: #d0b779; font: clamp(7px,.4vw,9px)/1 monospace; letter-spacing: .7px; text-transform: uppercase; }
  @keyframes scryingOrbGlow { 0%,100%{opacity:.4;transform:scale(.9)} 50%{opacity:.9;transform:scale(1.08)} }
  @keyframes scryingOrbFloat { 0%,100%{transform:translateY(2px)} 50%{transform:translateY(-5px)} }

  .ritual-player-frame { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; pointer-events: none; }
  .ritual-player-medallion {
    position: absolute; top: 16%; width: 21.5%; height: 68%; padding: 0;
    border: 0; border-radius: 50%; background: transparent; color: rgba(205,181,126,.66);
    font: clamp(17px,1.55vw,30px)/1 Georgia,serif; text-shadow: 0 2px 7px #000;
    cursor: pointer; pointer-events: auto;
    transition: color .2s ease, background .2s ease, box-shadow .2s ease, filter .2s ease;
  }
  .ritual-player-medallion:hover,
  .ritual-player-medallion:focus-visible {
    color: #f0d18c; background: radial-gradient(circle,rgba(89,184,177,.22),transparent 65%);
    box-shadow: inset 0 0 18px rgba(102,219,207,.22), 0 0 12px rgba(102,219,207,.2);
  }
  .ritual-player-medallion.is-active {
    color: #ffe19a; background: transparent; box-shadow: none;
  }
  .ritual-player-medallion > span { position: relative; z-index: 2; }
  .ritual-player-glow {
    position: absolute; inset: 3%; z-index: 1; border-radius: 50%; pointer-events: none;
    background: radial-gradient(circle,rgba(171,96,207,.4),rgba(73,25,91,.1) 58%,transparent 72%);
    box-shadow: inset 0 0 22px rgba(194,115,232,.38), 0 0 14px rgba(232,184,77,.42);
    transform-origin: 50% 50%;
  }
  .ritual-player-medallion:disabled { cursor: not-allowed; opacity: .28; filter: grayscale(1); }
  .ritual-player-medallion:focus-visible { outline: 2px solid #e8b84d; outline-offset: 2px; }
  .ritual-object::after {
    content: attr(data-tooltip);
    position: absolute;
    left: 50%; top: calc(100% + 7px);
    transform: translateX(-50%);
    width: max-content;
    max-width: 150px;
    padding: 4px 7px;
    border: 1px solid rgba(201,168,108,.2);
    border-radius: 3px;
    background: rgba(1,6,9,.88);
    color: #c9a86c;
    font: clamp(11px,.68vw,14px)/1.25 monospace;
    letter-spacing: .7px;
    opacity: 0;
    pointer-events: none;
    transition: opacity .18s;
    z-index: 3;
  }
  .ritual-object:hover::after,
  .ritual-object:focus-visible::after { opacity: 1; }
  .ritual-dial::after { top: auto; bottom: calc(100% + 42px); z-index: 12; padding: 6px 10px; }
  .ritual-bag::after,
  .ritual-echo-hotspot::after { top: auto; bottom: calc(100% + 12px); z-index: 12; padding: 6px 10px; }
  .ritual-difficulty > legend { display: none; }
  .ritual-players > legend { font-size: clamp(11px,.76vw,16px) !important; z-index: 11; }
  .ritual-players > legend { opacity: 0; transition: opacity .18s ease; }
  .ritual-players:has(button:hover) > legend,
  .ritual-players:focus-within > legend { opacity: 1; }
  .ritual-player-value { cursor: default !important; }
  .ritual-recipe-picker button {
    padding: 9px 10px; border: 1px solid rgba(106,54,139,.55); border-radius: 3px;
    background: rgba(5,5,12,.55); color: #baa375; font: 11px monospace; cursor: pointer;
  }
  .ritual-recipe-picker button:hover,
  .ritual-recipe-picker button.is-selected {
    border-color: #e8b84d; color: #f0d18c; background: rgba(123,76,20,.26);
  }
  .ritual-begin::before,.ritual-begin::after { content:"";position:absolute;top:50%;width:14%;height:1px;background:linear-gradient(90deg,transparent,rgba(211,175,101,.62)); }
  .ritual-begin::before { left:7%; }
  .ritual-begin::after { right:7%;transform:scaleX(-1); }
  .ritual-begin > strong { font-weight: 400; }
  .ritual-begin > small { margin-top:3px;color:#8f7d60;font:9px monospace;letter-spacing:1.5px;text-transform:uppercase; }
  .ritual-back:hover, .ritual-begin:hover,
  .ritual-recipe button:hover { filter: brightness(1.24); }

  @media (max-aspect-ratio: 4/3) {
    .ritual-heading { left: 16% !important; width: 25% !important; }
    .ritual-summary, .ritual-begin { left: 16% !important; }
    .ritual-back { left: 8% !important; }
  }

  @media (max-width: 720px) {
    .expansion-options { grid-template-columns: 1fr !important; }
  }

  @media (max-height: 800px) and (min-width: 721px) {
    .expansion-summary { display: none; }
  }

  .menu-atmosphere {
    position: fixed;
    inset: 0;
    z-index: 0;
    overflow: hidden;
    pointer-events: none;
  }

  .menu-light {
    position: absolute;
    border-radius: 50%;
    mix-blend-mode: screen;
    will-change: opacity, transform;
  }

  .menu-light-teal {
    left: 45%;
    top: -22%;
    width: 45vw;
    height: 72vh;
    background: radial-gradient(ellipse, rgba(55, 255, 224, 0.17), rgba(14, 177, 164, 0.06) 42%, transparent 72%);
    filter: blur(28px);
    animation: menuLightBreathe 7.5s ease-in-out infinite;
  }

  .menu-light-purple {
    left: -7%;
    top: 21%;
    width: 36vw;
    height: 62vh;
    background: radial-gradient(ellipse, rgba(192, 45, 255, 0.13), rgba(105, 20, 178, 0.04) 46%, transparent 72%);
    filter: blur(24px);
    animation: menuLightBreathe 9s ease-in-out -3s infinite reverse;
  }

  .menu-fog-canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    mix-blend-mode: screen;
  }

  .menu-drip {
    position: absolute;
    top: 3%;
    width: 2px;
    height: 17px;
    border-radius: 50% 50% 60% 60%;
    opacity: 0;
    background: linear-gradient(to bottom, transparent, rgba(116, 190, 178, 0.46));
    box-shadow: 0 0 3px rgba(62, 153, 139, 0.2);
    animation: menuDripFall var(--drop-duration) linear var(--drop-delay) infinite;
    will-change: left, top, opacity, transform;
  }

  @keyframes menuDripFall {
    0%, 7% { top: 3%; opacity: 0; transform: scaleY(0.7); }
    10% { opacity: 0.9; }
    35% { opacity: 0.72; }
    38%, 100% { left: var(--drop-to-x); top: var(--drop-to-y); opacity: 0; transform: scaleY(1.25); }
  }

  @keyframes menuLightBreathe {
    0%, 100% { opacity: 0.45; transform: scale(0.96); }
    50% { opacity: 0.92; transform: scale(1.06); }
  }

  @media (max-width: 900px) {
    .menu-drip { display: none; }
  }

  @media (max-height: 820px) {
    .main-menu-content {
      justify-content: flex-start !important;
      padding-top: 20px !important;
      padding-bottom: 16px !important;
    }
    .main-menu-title { margin-bottom: 14px !important; }
    .main-menu-title img { max-width: 320px !important; }
    .main-menu-title p { margin-top: 3px !important; font-size: 11px !important; }
    .main-menu-title > div { margin-bottom: 2px !important; font-size: 18px !important; }
    .main-menu-primary { margin-top: 20px !important; margin-bottom: 8px !important; }
    .main-menu-nav { gap: 2px !important; }
    .main-menu-options { min-height: 0 !important; padding: 10px 12px !important; gap: 5px !important; }
    .main-menu-options p { min-height: 0 !important; font-size: 11px !important; }
    .main-menu-action {
      padding-top: 5px !important;
      padding-bottom: 5px !important;
      font-size: 22px !important;
      max-width: none !important;
    }
    .new-game-setup { padding-top: 18px !important; padding-bottom: 14px !important; }
    .setup-options-grid { gap: 6px !important; }
    .main-menu-footer { padding-top: 8px !important; }
  }

  @media (max-width: 700px) {
    .main-menu-content {
      width: min(100%, 560px);
      padding-left: 20px !important;
      padding-right: 20px !important;
    }
    .main-menu-title img { max-width: min(88vw, 440px) !important; }
    .main-menu-action { max-width: 100% !important; }
    .setup-options-grid { grid-template-columns: 1fr !important; }
    .setup-overlay { padding: 14px !important; }
    .new-game-setup { width: calc(100vw - 28px) !important; }
  }

  @media (prefers-reduced-motion: reduce) {
    .menu-atmosphere * { animation: none !important; }
    .menu-light { opacity: 0.45; }
  }
`;
