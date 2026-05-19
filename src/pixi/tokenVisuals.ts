import type { TokenColor } from "../game/tokenTypes";

export interface TokenVisual {
  fill: number;      // main fill color (hex)
  glow: number;      // glow/bloom color
  border: number;    // border color
  label: string;     // ingredient name shown on token
}

// Dark fantasy color palette for each ingredient
export const TOKEN_VISUALS: Record<TokenColor, TokenVisual> = {
  white: {
    fill: 0x1a1a2e,
    glow: 0x8888ff,
    border: 0xaaaaff,
    label: "Voidshard",
  },
  orange: {
    fill: 0x3d1a00,
    glow: 0xff6600,
    border: 0xff8800,
    label: "Brimstone",
  },
  green: {
    fill: 0x001a00,
    glow: 0x00cc44,
    border: 0x00ff55,
    label: "Deathweave",
  },
  purple: {
    fill: 0x1a0033,
    glow: 0xaa00ff,
    border: 0xcc44ff,
    label: "Wraithbloom",
  },
  blue: {
    fill: 0x00001a,
    glow: 0x0044ff,
    border: 0x2266ff,
    label: "Frostbile",
  },
  red: {
    fill: 0x1a0000,
    glow: 0xcc0000,
    border: 0xff2222,
    label: "Bloodthorn",
  },
  yellow: {
    fill: 0x1a1400,
    glow: 0xccaa00,
    border: 0xffdd00,
    label: "Plaguedust",
  },
  black: {
    fill: 0x050505,
    glow: 0x333333,
    border: 0x666666,
    label: "Shadowmoss",
  },
};

export function getTokenVisual(color: TokenColor): TokenVisual {
  return TOKEN_VISUALS[color];
}

// Token radius in pixels
export const TOKEN_RADIUS = 18;
