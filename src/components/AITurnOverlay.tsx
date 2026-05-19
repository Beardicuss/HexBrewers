import React, { useEffect, useRef, useState } from "react";
import type { AITurnEvent } from "../game/AITurnAnimator";
import type { Token } from "../game/tokenTypes";
import { getTokenVisual } from "../pixi/tokenVisuals";

interface LogEntry {
  id: number;
  message: string;
  kind: "thinking" | "draw" | "flask" | "stop" | "exploded" | "scored" | "surviving";
  token?: Token;
  points?: number;
  soulstones?: number;
}

interface AITurnOverlayProps {
  visible: boolean;
  events: AITurnEvent[];
  whiteSum: number;
  spiral: number; // filledUpTo
}

let entryId = 0;

export function AITurnOverlay({
  visible,
  events,
  whiteSum,
  spiral,
}: AITurnOverlayProps) {
  const [log, setLog] = useState<LogEntry[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Convert incoming events to log entries
  useEffect(() => {
    if (events.length === 0) {
      setLog([]);
      return;
    }

    const last = events[events.length - 1];

    const entry = buildEntry(last);
    if (!entry) return;

    setLog((prev) => [...prev.slice(-14), entry]); // keep last 15
  }, [events]);

  // Auto-scroll log
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [log]);

  if (!visible) return null;

  return (
    <div style={s.overlay}>
      <div style={s.panel}>
        {/* Header */}
        <div style={s.header}>
          <div style={s.shade}>✦ The Shade ✦</div>
          <div style={s.subtitle}>is brewing</div>
          <BrewingDots />
        </div>

        {/* Stats bar */}
        <div style={s.statsRow}>
          <StatPill label="Spiral" value={spiral} color="#cc88ff" />
          <VoidshardMeter sum={whiteSum} />
          <StatPill label="Shard Σ" value={`${whiteSum}/7`} color={whiteSum >= 6 ? "#ff3300" : whiteSum >= 4 ? "#ff8800" : "#7755aa"} />
        </div>

        {/* Event log */}
        <div style={s.log}>
          {log.map((entry) => (
            <LogLine key={entry.id} entry={entry} />
          ))}
          <div ref={logEndRef} />
        </div>
      </div>
    </div>
  );
}

// ─── Log line ─────────────────────────────────────────────────────────────────

function LogLine({ entry }: { entry: LogEntry }) {
  const styleMap: Record<LogEntry["kind"], React.CSSProperties> = {
    thinking: { color: "#6644aa", fontStyle: "italic" },
    draw: { color: "#cc99ff" },
    flask: { color: "#44cc88" },
    stop: { color: "#9966cc" },
    exploded: { color: "#ff4422", fontWeight: "bold" },
    scored: { color: "#ffcc44" },
    surviving: { color: "#44ff88", fontStyle: "italic" },
  };

  return (
    <div style={{ ...s.logLine, ...styleMap[entry.kind] }}>
      <span style={s.logBullet}>{getBullet(entry.kind)}</span>
      <span>{entry.message}</span>
      {entry.token && <TokenChip token={entry.token} />}
    </div>
  );
}

function getBullet(kind: LogEntry["kind"]): string {
  switch (kind) {
    case "thinking": return "…";
    case "draw": return "◈";
    case "flask": return "⚗";
    case "stop": return "◼";
    case "exploded": return "✸";
    case "scored": return "✦";
    case "surviving": return "✦";
  }
}

// ─── Token chip ───────────────────────────────────────────────────────────────

function TokenChip({ token }: { token: Token }) {
  const visual = getTokenVisual(token.color);
  const fillHex = `#${visual.fill.toString(16).padStart(6, "0")}`;
  const borderHex = `#${visual.border.toString(16).padStart(6, "0")}`;
  const glowHex = `#${visual.glow.toString(16).padStart(6, "0")}`;

  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      marginLeft: 8,
      background: fillHex,
      border: `1px solid ${borderHex}`,
      borderRadius: 20,
      padding: "1px 8px 1px 4px",
      boxShadow: `0 0 6px ${glowHex}55`,
    }}>
      <span style={{
        width: 10,
        height: 10,
        borderRadius: "50%",
        background: borderHex,
        boxShadow: `0 0 4px ${glowHex}`,
        display: "inline-block",
      }} />
      <span style={{ color: borderHex, fontSize: 11 }}>
        {visual.label} ×{token.value}
      </span>
    </span>
  );
}

// ─── Voidshard meter ──────────────────────────────────────────────────────────

function VoidshardMeter({ sum }: { sum: number }) {
  const pct = Math.min((sum / 7) * 100, 100);
  const color = sum >= 6 ? "#ff3300" : sum >= 4 ? "#ff8800" : "#4422aa";

  return (
    <div style={s.meterWrapper}>
      <div style={s.meterLabel}>Voidshards</div>
      <div style={s.meterTrack}>
        <div style={{ ...s.meterFill, width: `${pct}%`, background: color, transition: "width 0.4s, background 0.4s" }} />
      </div>
    </div>
  );
}

// ─── Stat pill ────────────────────────────────────────────────────────────────

function StatPill({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div style={s.statPill}>
      <span style={s.statLabel}>{label}</span>
      <span style={{ ...s.statValue, color }}>{value}</span>
    </div>
  );
}

// ─── Animated brewing dots ────────────────────────────────────────────────────

function BrewingDots() {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setFrame((f) => (f + 1) % 4), 400);
    return () => clearInterval(interval);
  }, []);

  const dots = ".".repeat(frame);
  return <span style={s.dots}>{dots}</span>;
}

// ─── Entry builder ────────────────────────────────────────────────────────────

function buildEntry(event: AITurnEvent): LogEntry | null {
  const id = ++entryId;

  switch (event.type) {
    case "thinking":
      return { id, kind: "thinking", message: event.message };

    case "draw":
      return {
        id,
        kind: "draw",
        message: `Drew`,
        token: event.token,
      };

    case "flask":
      return {
        id,
        kind: "flask",
        message: `Cursed Vial — returned`,
        token: event.token,
      };

    case "stop":
      return { id, kind: "stop", message: "Stopped brewing" };

    case "exploded":
      return { id, kind: "exploded", message: "Crucible shattered!" };

    case "scored":
      return {
        id,
        kind: "scored",
        message: event.choice
          ? `Chose ${event.choice} — +${event.vp}vp / +${event.coins} coins`
          : `Scored +${event.vp}vp and +${event.coins} coins`,
        points: event.vp,
        soulstones: event.coins,
      };

    case "done":
      return { id, kind: "surviving", message: "Turn complete" };

    default:
      return null;
  }
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(4, 2, 14, 0.82)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 90,
    backdropFilter: "blur(3px)",
    pointerEvents: "none",
  },
  panel: {
    background: "linear-gradient(160deg, #0d0720 0%, #160930 60%, #0a0418 100%)",
    border: "1px solid #3a1a5a",
    borderRadius: 14,
    padding: "28px 32px",
    width: "min(480px, 92vw)",
    display: "flex",
    flexDirection: "column",
    gap: 18,
    boxShadow: "0 0 80px rgba(80, 20, 160, 0.3), inset 0 0 40px rgba(60,10,120,0.08)",
  },
  header: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
  },
  shade: {
    fontFamily: "Georgia, serif",
    fontSize: 24,
    color: "#aa66ee",
    letterSpacing: 3,
    textShadow: "0 0 20px rgba(160, 80, 240, 0.4)",
  },
  subtitle: {
    fontFamily: "monospace",
    fontSize: 11,
    color: "#554477",
    letterSpacing: 2,
  },
  dots: {
    fontFamily: "monospace",
    fontSize: 18,
    color: "#7733bb",
    letterSpacing: 4,
    minHeight: 24,
    display: "block",
    textAlign: "center",
  },
  statsRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  statPill: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
    background: "rgba(20,8,40,0.6)",
    border: "1px solid #2a1a3a",
    borderRadius: 7,
    padding: "6px 12px",
    flexShrink: 0,
  },
  statLabel: {
    fontFamily: "monospace",
    fontSize: 9,
    color: "#443355",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  statValue: {
    fontFamily: "Georgia, serif",
    fontSize: 16,
    fontWeight: "bold",
  },
  meterWrapper: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 5,
  },
  meterLabel: {
    fontFamily: "monospace",
    fontSize: 9,
    color: "#443355",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  meterTrack: {
    height: 6,
    background: "#0d0420",
    borderRadius: 3,
    overflow: "hidden",
  },
  meterFill: {
    height: "100%",
    borderRadius: 3,
  },
  log: {
    display: "flex",
    flexDirection: "column",
    gap: 7,
    maxHeight: 240,
    overflowY: "auto",
    padding: "4px 0",
  },
  logLine: {
    fontFamily: "Georgia, serif",
    fontSize: 13,
    lineHeight: 1.5,
    display: "flex",
    alignItems: "center",
    gap: 8,
    animation: "fadeInUp 0.2s ease-out",
  },
  logBullet: {
    flexShrink: 0,
    width: 14,
    textAlign: "center",
    opacity: 0.7,
  },
};
