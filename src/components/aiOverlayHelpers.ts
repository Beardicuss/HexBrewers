import type { AITurnEvent } from "../game/AITurnAnimator";
import type { Token } from "../game/tokenTypes";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LogEntry {
    id: number;
    message: string;
    kind: "thinking" | "draw" | "flask" | "stop" | "exploded" | "scored" | "surviving";
    token?: Token;
    points?: number;
    soulstones?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

let entryId = 0;

export function buildEntry(event: AITurnEvent): LogEntry | null {
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

export function getBullet(kind: LogEntry["kind"]): string {
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
