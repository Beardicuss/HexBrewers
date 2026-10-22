import type { AfflictionId } from "../game/distillation";

const ROOT = "/images/dlc/veilglass-afflictions";

export const VEILGLASS_ASSETS = {
  keyArt: `${ROOT}/veilglass-afflictions-key-art.webp`,
  badge: `${ROOT}/ui/dlc-badge-veilglass-afflictions.webp`,
  retortFrame: `${ROOT}/ui/veil-retort-track-frame.webp`,
  retortBloodFills: Array.from(
    { length: 8 },
    (_, index) => `${ROOT}/ui/retort-blood-fill-${index + 1}.webp`,
  ),
  distillateMarker: `${ROOT}/ui/distillate-marker.webp`,
  distillationBanner: `${ROOT}/ui/distillation-phase-banner.webp`,
  vaporAtlas: `${ROOT}/ui/distillation-vapor-atlas.webp`,
  retortResonance: `${ROOT}/recipes/echo-recipe-retort-resonance.webp`,
  deepResonance: `${ROOT}/recipes/echo-recipe-deep-resonance.webp`,
  distillationVapor: "/videos/dlc/distillation-vapor.webm",
} as const;

export const REMEDY_SYMBOLS = {
  distillate: `${ROOT}/ui/remedy-symbol-distillate.webp`,
  prestige: `${ROOT}/ui/remedy-symbol-prestige.webp`,
  dropletAdvance: `${ROOT}/ui/remedy-symbol-droplet-advance.webp`,
  headStart: `${ROOT}/ui/remedy-symbol-head-start.webp`,
  complete: `${ROOT}/ui/remedy-symbol-complete.webp`,
  finalConversion: `${ROOT}/ui/remedy-symbol-final-conversion.webp`,
} as const;

export const AFFLICTION_PORTRAITS: Record<AfflictionId, string> = {
  ashen_breath: `${ROOT}/afflictions/affliction-portrait-ashen-breath.webp`,
  glassvein_chill: `${ROOT}/afflictions/affliction-portrait-glassvein-chill.webp`,
  hollow_bloom: `${ROOT}/afflictions/affliction-portrait-hollow-bloom.webp`,
  embersleep: `${ROOT}/afflictions/affliction-portrait-embersleep.webp`,
  moonwater_fever: `${ROOT}/afflictions/affliction-portrait-moonwater-fever.webp`,
  thorn_memory: `${ROOT}/afflictions/affliction-portrait-thorn-memory.webp`,
  mirror_hunger: `${ROOT}/afflictions/affliction-portrait-mirror-hunger.webp`,
  silent_chorus: `${ROOT}/afflictions/affliction-portrait-silent-chorus.webp`,
};

export const AFFLICTION_EMBLEMS: Record<AfflictionId, string> = {
  ashen_breath: `${ROOT}/afflictions/affliction-emblem-ashen-breath.webp`,
  glassvein_chill: `${ROOT}/afflictions/affliction-emblem-glassvein-chill.webp`,
  hollow_bloom: `${ROOT}/afflictions/affliction-emblem-hollow-bloom.webp`,
  embersleep: `${ROOT}/afflictions/affliction-emblem-embersleep.webp`,
  moonwater_fever: `${ROOT}/afflictions/affliction-emblem-moonwater-fever.webp`,
  thorn_memory: `${ROOT}/afflictions/affliction-emblem-thorn-memory.webp`,
  mirror_hunger: `${ROOT}/afflictions/affliction-emblem-mirror-hunger.webp`,
  silent_chorus: `${ROOT}/afflictions/affliction-emblem-silent-chorus.webp`,
};

export const REMEDY_PATH_ART: Record<AfflictionId, string> = {
  ashen_breath: `${ROOT}/afflictions/remedy-path-ashen-breath.webp`,
  glassvein_chill: `${ROOT}/afflictions/remedy-path-glassvein-chill.webp`,
  hollow_bloom: `${ROOT}/afflictions/remedy-path-hollow-bloom.webp`,
  embersleep: `${ROOT}/afflictions/remedy-path-embersleep.webp`,
  moonwater_fever: `${ROOT}/afflictions/remedy-path-moonwater-fever.webp`,
  thorn_memory: `${ROOT}/afflictions/remedy-path-thorn-memory.webp`,
  mirror_hunger: `${ROOT}/afflictions/remedy-path-mirror-hunger.webp`,
  silent_chorus: `${ROOT}/afflictions/remedy-path-silent-chorus.webp`,
};

export const VEILGLASS_OMEN_ART: Record<string, string> = {
  "veil-omen-01": `${ROOT}/omens/omen-retort-rain.webp`,
  "veil-omen-02": `${ROOT}/omens/omen-sevenfold-refraction.webp`,
  "veil-omen-03": `${ROOT}/omens/omen-cracks-in-company.webp`,
  "veil-omen-04": `${ROOT}/omens/omen-mercy-of-the-thin-veil.webp`,
};
