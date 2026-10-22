import type { CovenantId, CovenantKind } from "../game/covenants";

const ROOT = "/images/dlc/mirewrought-pacts";

export const MIREWROUGHT_ASSETS = {
  keyArt: `${ROOT}/mirewrought-pacts-key-art.webp`,
  hollowPortrait: `${ROOT}/characters/the-hollow-portrait.webp`,
  abyssalRunoffFrame: `${ROOT}/ui/abyssal-runoff-frame.webp`,
  badge: `${ROOT}/ui/dlc-badge-mirewrought-pacts.webp`,
  echoReed: `${ROOT}/ingredients/ingredient-echo-reed.webp`,
  embercore: `${ROOT}/ingredients/ingredient-embercore-6.webp`,
} as const;

export const COVENANT_SEAL_ASSETS: Record<CovenantKind, string> = {
  bone: `${ROOT}/covenants/covenant-seal-bone.webp`,
  moon: `${ROOT}/covenants/covenant-seal-moon.webp`,
  blood: `${ROOT}/covenants/covenant-seal-blood.webp`,
};

export const COVENANT_SPENT_SEAL_ASSETS: Record<CovenantKind, string> = {
  bone: `${ROOT}/covenants/covenant-seal-bone-spent.webp`,
  moon: `${ROOT}/covenants/covenant-seal-moon-spent.webp`,
  blood: `${ROOT}/covenants/covenant-seal-blood-spent.webp`,
};

export const COVENANT_ACTIVATION_ASSETS: Record<CovenantKind, string> = {
  bone: `${ROOT}/effects/covenant-activation-bone.webp`,
  moon: `${ROOT}/effects/covenant-activation-moon.webp`,
  blood: `${ROOT}/effects/covenant-activation-blood.webp`,
};

export const COVENANT_ART_ASSETS: Record<CovenantId, string> = {
  ossuary_mercy: `${ROOT}/covenants/covenant-bone-ossuary-mercy.webp`,
  marrow_exchange: `${ROOT}/covenants/covenant-bone-marrow-exchange.webp`,
  graveward: `${ROOT}/covenants/covenant-bone-graveward.webp`,
  pale_reckoning: `${ROOT}/covenants/covenant-bone-pale-reckoning.webp`,
  moonstep: `${ROOT}/covenants/covenant-moon-moonstep.webp`,
  silver_ward: `${ROOT}/covenants/covenant-moon-silver-ward.webp`,
  lunar_tithe: `${ROOT}/covenants/covenant-moon-lunar-tithe.webp`,
  eclipse_stride: `${ROOT}/covenants/covenant-moon-eclipse-stride.webp`,
  crimson_credit: `${ROOT}/covenants/covenant-blood-crimson-credit.webp`,
  sanguine_bargain: `${ROOT}/covenants/covenant-blood-sanguine-bargain.webp`,
  red_harvest: `${ROOT}/covenants/covenant-blood-red-harvest.webp`,
  heartprice: `${ROOT}/covenants/covenant-blood-heartprice.webp`,
};
