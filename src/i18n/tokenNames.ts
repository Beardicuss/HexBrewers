import type { TokenColor } from "../game/tokenTypes";
import type { Translations } from "./types";

export function getLocalizedTokenName(color: TokenColor, t: Translations, value?: number): string {
  if (color === "orange" && value === 6) return t.grimoire.embercore;
  const names: Record<TokenColor, string> = {
    white: t.grimoire.voidshard,
    orange: t.grimoire.brimstone,
    green: t.grimoire.deathweave,
    purple: t.grimoire.wraithbloom,
    blue: t.grimoire.frostbile,
    red: t.grimoire.bloodthorn,
    yellow: t.grimoire.plaguedust,
    black: t.grimoire.shadowmoss,
    echo: t.grimoire.echoReed,
  };
  return names[color];
}
