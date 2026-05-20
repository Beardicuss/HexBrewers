import React, { useEffect, useRef, useState } from "react";
import type { AITurnEvent } from "../game/AITurnAnimator";
import type { Token } from "../game/tokenTypes";
import { getTokenVisual } from "../pixi/tokenVisuals";
import type { LogEntry } from "./aiOverlayHelpers";
import { buildEntry, getBullet } from "./aiOverlayHelpers";
import { s } from "./aiOverlayStyles";

// ─── Props ────────────────────────────────────────────────────────────────────

interface AITurnOverlayProps {
  visible: boolean;
  events: AITurnEvent[];
  whiteSum: number;
  spiral: number;
}

// ─── Main component ───────────────────────────────────────────────────────────

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

// ─── Sub-components ───────────────────────────────────────────────────────────

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

function StatPill({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div style={s.statPill}>
      <span style={s.statLabel}>{label}</span>
      <span style={{ ...s.statValue, color }}>{value}</span>
    </div>
  );
}

function BrewingDots() {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setFrame((f) => (f + 1) % 4), 400);
    return () => clearInterval(interval);
  }, []);

  const dots = ".".repeat(frame);
  return <span style={s.dots}>{dots}</span>;
}
