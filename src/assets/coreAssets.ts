const ROOT = "/images/core";

export const CORE_INGREDIENT_ASSETS: Record<string, string> = {
  white: `${ROOT}/ingredients/ingredient-voidshard.webp`,
  orange: `${ROOT}/ingredients/ingredient-brimstone.webp`,
  green: `${ROOT}/ingredients/ingredient-deathweave.webp`,
  blue: `${ROOT}/ingredients/ingredient-frostbile.webp`,
  red: `${ROOT}/ingredients/ingredient-bloodthorn.webp`,
  yellow: `${ROOT}/ingredients/ingredient-plaguedust.webp`,
  purple: `${ROOT}/ingredients/ingredient-wraithbloom.webp`,
  black: `${ROOT}/ingredients/ingredient-shadowmoss.webp`,
};

export const CORE_ECONOMY_ASSETS = {
  brewBag: `${ROOT}/economy/brew-bag.webp`,
  coin: `${ROOT}/economy/coin.webp`,
  flaskEmpty: `${ROOT}/economy/flask-empty.webp`,
  flaskFull: `${ROOT}/economy/flask-full.webp`,
  ratStone: `${ROOT}/economy/rat-stone.webp`,
  ruby: `${ROOT}/economy/ruby.webp`,
  scoreMarker: `${ROOT}/economy/score-marker.webp`,
} as const;

export const CORE_CHARACTER_PORTRAITS: Record<string, string> = {
  Hexbrewer: `${ROOT}/characters/portrait-hexbrewer.webp`,
  "The Hollow": `${ROOT}/characters/portrait-the-hollow.webp`,
  "The Seer": `${ROOT}/characters/portrait-the-seer.webp`,
  "The Shade": `${ROOT}/characters/portrait-the-shade.webp`,
  "The Wraith": `${ROOT}/characters/portrait-the-wraith.webp`,
};

export const CORE_OMEN_ASSETS = {
  back: `${ROOT}/omens/omen-card-back.webp`,
  blankFront: `${ROOT}/omens/omen-card-front-blank.webp`,
} as const;

export type MenuRoom = "central" | "new-game" | "grimoire" | "dlc" | "settings";

export const MENU_ROOM_ASSETS: Record<MenuRoom, { poster: string; video: string }> = {
  central: { poster: `${ROOT}/rooms/central-laboratory.webp`, video: "/videos/menu/central-laboratory.webm?v=2" },
  "new-game": { poster: `${ROOT}/rooms/new-game-ritual-chamber.webp`, video: "/videos/menu/new-game-ritual-chamber.webm?v=2" },
  grimoire: { poster: `${ROOT}/rooms/grimoire-scriptorium.webp`, video: "/videos/menu/grimoire-scriptorium.webm?v=2" },
  dlc: { poster: `${ROOT}/rooms/dlc-reliquary.webp`, video: "/videos/menu/dlc-reliquary.webm?v=2" },
  settings: { poster: `${ROOT}/rooms/settings-astrolabe.webp`, video: "/videos/menu/settings-astrolabe.webm?v=2" },
};
