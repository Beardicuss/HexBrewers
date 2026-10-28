import type { AITurnEvent } from "../game/AITurnAnimator";
import type { Token } from "../game/tokenTypes";
import type { Translations } from "../i18n/types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LogEntry {
    id: number;
    message: string;
    kind: "thinking" | "scry" | "draw" | "flask" | "stop" | "exploded" | "scored" | "surviving";
    token?: Token;
    points?: number;
    soulstones?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

let entryId = 0;

export function buildEntry(event: AITurnEvent, copy: Translations["aiOverlay"]): LogEntry | null {
    const id = ++entryId;

    switch (event.type) {
        case "thinking":
            return { id, kind: "thinking", message: copy.messages[event.messageKey] };

        case "scry":
            return { id, kind: "scry", message: "Spent 1 ruby to bind a safer next draw.", token: event.chosen };

        case "draw":
            return {
                id,
                kind: "draw",
                message: copy.drew,
                token: event.token,
            };

        case "flask":
            return {
                id,
                kind: "flask",
                message: copy.flaskReturned,
                token: event.token,
            };

        case "stop":
            return { id, kind: "stop", message: copy.stopped };

        case "exploded":
            return { id, kind: "exploded", message: copy.shattered };

        case "scored":
            return {
                id,
                kind: "scored",
                message: event.choice
                    ? copy.scoredChoice.replace("{choice}", event.choice).replace("{vp}", String(event.vp)).replace("{coins}", String(event.coins))
                    : copy.scoredBoth.replace("{vp}", String(event.vp)).replace("{coins}", String(event.coins)),
                points: event.vp,
                soulstones: event.coins,
            };

        case "done":
            return { id, kind: "surviving", message: copy.complete };

        default:
            return null;
    }
}

export function getBullet(kind: LogEntry["kind"]): string {
    switch (kind) {
        case "thinking": return "…";
        case "scry": return "◉";
        case "draw": return "◈";
        case "flask": return "⚗";
        case "stop": return "◼";
        case "exploded": return "✸";
        case "scored": return "✦";
        case "surviving": return "✦";
    }
}
