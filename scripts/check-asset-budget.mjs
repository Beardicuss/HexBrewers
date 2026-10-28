import { readdir, stat } from "node:fs/promises";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../public/", import.meta.url));
const limits = {
  image: 3 * 1024 * 1024,
  music: 6 * 1024 * 1024,
  sfx: 1 * 1024 * 1024,
  video: 12 * 1024 * 1024,
  introVideo: 24 * 1024 * 1024,
  loadingPoster: 850 * 1024,
  criticalLogo: 150 * 1024,
  // The checked-out media library is the lossless local QA source. Production
  // builds serve these files from R2 and omit them from the Worker bundle.
  total: 132 * 1024 * 1024,
  // This is the complete blocking post-ident stage: trailer/menu media plus
  // every visual needed before gameplay's setup-aware loader takes over.
  openingSequence: 52 * 1024 * 1024,
  gamePresentation: 5 * 1024 * 1024,
  basePixiTextures: 4 * 1024 * 1024,
  menuRooms: 16 * 1024 * 1024,
};

const groups = {
  openingSequence: [
    "videos/intro/",
    "videos/menu/",
    "images/intro/",
    "images/loading/",
    "images/core/rooms/",
    "images/core/chronicle/",
    "images/core/ui/new-game-silhouettes/",
    "images/core/ui/dlc-reliquary/",
    "images/ui/menu/",
    "images/ui/softcurse-mark.webp",
    "images/main_menu_bg.jpg",
    "images/title/title-en.webp",
  ],
  gamePresentation: ["videos/cauldron-room-loop.webm", "videos/hand-place-alpha.webm", "images/cauldron_bg.jpg"],
  basePixiTextures: ["images/core/economy/brew-bag.webp", "images/core/ingredients/"],
  menuRooms: ["videos/menu/", "images/core/rooms/"],
};

function belongsToGroup(path, entries) {
  return entries.some((entry) => entry.endsWith("/") ? path.startsWith(entry) : path === entry);
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? walk(path) : path;
  }))).flat();
}

const files = await walk(root);
let total = 0;
const failures = [];
const groupTotals = Object.fromEntries(Object.keys(groups).map((name) => [name, 0]));
for (const file of files) {
  const bytes = (await stat(file)).size;
  total += bytes;
  const path = relative(root, file).replaceAll("\\", "/");
  const extension = extname(file).toLowerCase();
  for (const [name, entries] of Object.entries(groups)) {
    if (belongsToGroup(path, entries)) groupTotals[name] += bytes;
  }
  let limit = Infinity;
  if (path.startsWith("music/")) limit = limits.music;
  else if (path.startsWith("sounds/")) limit = limits.sfx;
  else if (path.startsWith("videos/intro/")) limit = limits.introVideo;
  else if (path.startsWith("videos/")) limit = limits.video;
  else if (path.startsWith("images/loading/")) limit = limits.loadingPoster;
  else if (path === "images/title/title-en.webp") limit = limits.criticalLogo;
  else if ([".png", ".jpg", ".jpeg", ".webp", ".avif"].includes(extension)) limit = limits.image;
  if (bytes > limit) failures.push(`${path}: ${(bytes / 1024 / 1024).toFixed(2)} MiB exceeds ${(limit / 1024 / 1024).toFixed(2)} MiB`);
}
if (total > limits.total) failures.push(`public total: ${(total / 1024 / 1024).toFixed(2)} MiB exceeds ${(limits.total / 1024 / 1024).toFixed(2)} MiB`);
for (const [name, bytes] of Object.entries(groupTotals)) {
  const limit = limits[name];
  if (bytes > limit) failures.push(`${name}: ${(bytes / 1024 / 1024).toFixed(2)} MiB exceeds ${(limit / 1024 / 1024).toFixed(2)} MiB`);
}
if (failures.length) {
  console.error(`Asset budget failed:\n${failures.map((failure) => `- ${failure}`).join("\n")}`);
  process.exit(1);
}
console.log(`Asset budget passed: ${files.length} files, ${(total / 1024 / 1024).toFixed(2)} MiB total.`);
for (const [name, bytes] of Object.entries(groupTotals)) {
  console.log(`- ${name}: ${(bytes / 1024 / 1024).toFixed(2)} MiB / ${(limits[name] / 1024 / 1024).toFixed(2)} MiB`);
}
