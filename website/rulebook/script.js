const ASSET_ORIGIN = window.HEXBREWERS_ASSET_ORIGIN
  || "https://pub-7b92547fbe944d259e437d18c1c425d4.r2.dev/releases/b9d0faa";

document.querySelectorAll("[data-asset]").forEach((image) => {
  image.src = `${ASSET_ORIGIN}${image.dataset.asset}`;
});

const chapters = [...document.querySelectorAll(".chapter")];
const toc = document.querySelector("#toc");
const search = document.querySelector("#rule-search");
const optionalToggle = document.querySelector("#dlc-toggle");
const noResults = document.querySelector("#no-results");
const sidebar = document.querySelector("#chapter-navigation");
const tocToggle = document.querySelector(".toc-toggle");

const recipeIngredients = [
  {
    name: "Frostbile", color: "blue", values: "1 · 2 · 4", timing: "immediate", image: "/images/core/ingredients/ingredient-frostbile.webp",
    recipes: [
      ["Draw extra chips equal to this chip's value. Place at most one; return the rest.", "5 / 10 / 19"],
      ["The next 1, 2, or 4 draws cannot deny both scoring rewards when they cause an explosion.", "5 / 10 / 19"],
      ["When this chip itself lands on a ruby field, gain 1 ruby.", "4 / 8 / 14"],
      ["When this chip itself lands on a ruby field, gain Prestige equal to its value.", "5 / 10 / 20"],
      ["If pressure is 2 or lower after placement, gain 1 ruby.", "5 / 9 / 17"],
      ["At 6 or 7 pressure after placement, gain Prestige equal to its value.", "6 / 11 / 18"],
    ],
  },
  {
    name: "Bloodthorn", color: "red", values: "1 · 2 · 4", timing: "immediate", image: "/images/core/ingredients/ingredient-bloodthorn.webp",
    recipes: [
      ["Moves +1 with 1–2 Brimstones already in the crucible, or +2 with at least 3.", "6 / 10 / 16"],
      ["Waits beside the crucible when drawn. When you stop, place it, save it, or return it to the bag.", "4 / 8 / 14"],
      ["After a Voidshard, you may move additional spaces equal to that Voidshard's value.", "5 / 9 / 15"],
      ["After placement, every value-1 Voidshard moves 1 extra space this round.", "7 / 11 / 17"],
      ["Moves +1 for every three distinct non-white colors already placed, up to +2.", "6 / 10 / 16"],
      ["Moves +1 per Echo Reed already placed, up to +3.", "5 / 9 / 15"],
    ],
  },
  {
    name: "Plaguedust", color: "yellow", values: "1 · 2 · 4", timing: "immediate", image: "/images/core/ingredients/ingredient-plaguedust.webp",
    recipes: [
      ["If placed after a Voidshard, you may return that Voidshard to your bag.", "8 / 12 / 18"],
      ["The next chip placed moves twice its normal distance.", "9 / 13 / 19"],
      ["One Plaguedust raises the safe pressure limit to 8; three raise it to 9.", "8 / 12 / 18"],
      ["Move your first, second, and third Plaguedust +1, +2, and +3 spaces respectively.", "8 / 12 / 18"],
      ["If placed after a Voidshard, gain 1 ruby.", "8 / 12 / 18"],
      ["If placed after a Voidshard, advance your droplet 1 space.", "9 / 13 / 19"],
    ],
  },
  {
    name: "Deathweave", color: "green", values: "1 · 2 · 4", timing: "end", image: "/images/core/ingredients/ingredient-deathweave.webp",
    recipes: [
      ["Each Deathweave among the last two placed chips awards 1 ruby.", "4 / 8 / 14"],
      ["Each Deathweave among the last two grants a chip reward based on its value.", "6 / 11 / 18"],
      ["At exactly 7 pressure, move the last chip by the total value of Deathweave in the crucible.", "6 / 11 / 21"],
      ["For each Deathweave among the last two, spend 1 ruby to advance the droplet 1 space.", "4 / 8 / 14"],
      ["Each Deathweave among the last two awards 1 Prestige.", "5 / 9 / 15"],
      ["Each Deathweave among the last two advances your droplet 1 space.", "6 / 10 / 16"],
    ],
  },
  {
    name: "Wraithbloom", color: "purple", values: "1", timing: "end", image: "/images/core/ingredients/ingredient-wraithbloom.webp",
    recipes: [
      ["One grants 1 Prestige; two grant 1 Prestige and 1 ruby; three grant 2 Prestige and droplet +1.", "9"],
      ["Trade up to three placed Wraithblooms for increasingly powerful chips, Prestige, rubies, and droplet movement.", "12"],
      ["Each Wraithbloom grants 1–3 Prestige based on how far into the crucible it landed.", "10"],
      ["Placed Wraithblooms upgrade eligible non-white ingredients: 1→2, 2→4, or 1→4.", "11"],
      ["Gain Prestige equal to your distinct non-white colors, up to 4.", "10"],
      ["Gain 1 ruby per Wraithbloom and up to 2 Prestige from your Wraithblooms.", "12"],
    ],
  },
];

const fixedIngredients = [
  { name: "Voidshard", color: "white", values: "1 · 2 · 3", timing: "passive", image: "/images/core/ingredients/ingredient-voidshard.webp", effect: "Advances by its value and adds that value to pressure. The crucible shatters when pressure exceeds 7.", cost: "Not sold" },
  { name: "Brimstone", color: "orange", values: "1", timing: "passive", image: "/images/core/ingredients/ingredient-brimstone.webp", effect: "A safe ingredient. Advances 1 space without adding pressure and has no special effect.", cost: "3" },
  { name: "Shadowmoss", color: "black", values: "1", timing: "end", image: "/images/core/ingredients/ingredient-shadowmoss.webp", effect: "Compare Shadowmoss counts. A tie advances your droplet 1; having more also grants 1 ruby.", cost: "10" },
  { name: "Echo Reed", color: "echo", values: "variable", timing: "immediate", image: "/images/dlc/mirewrought-pacts/ingredients/ingredient-echo-reed.webp", effect: "Its movement is set by the active Echo recipe and becomes fixed when placed.", cost: "8", optional: true },
  { name: "Embercore", color: "orange", values: "6", timing: "passive", image: "/images/dlc/mirewrought-pacts/ingredients/ingredient-embercore-6.webp", effect: "A safe value-6 ingredient that also counts as Brimstone for orange-based effects.", cost: "12", optional: true },
];

const covenantReference = [
  ["bone", "Ossuary Mercy", "ossuary-mercy", "Ruby phase: refill your spent Cursed Vial."],
  ["bone", "Marrow Exchange", "marrow-exchange", "Ruby phase: gain 2 rubies."],
  ["bone", "Graveward", "graveward", "Ruby phase: advance your droplet 2 spaces."],
  ["bone", "Pale Reckoning", "pale-reckoning", "Ruby phase: gain 3 Prestige."],
  ["moon", "Moonstep", "moonstep", "Before your first draw: advance your droplet 1 space."],
  ["moon", "Silver Ward", "silver-ward", "Before your first draw: if the next draw shatters, retain both round rewards."],
  ["moon", "Lunar Tithe", "lunar-tithe", "Before your first draw: gain 2 rubies."],
  ["moon", "Eclipse Stride", "eclipse-stride", "Before your first draw: advance your droplet 2 spaces."],
  ["blood", "Crimson Credit", "crimson-credit", "Market phase: gain 5 coins for this round."],
  ["blood", "Sanguine Bargain", "sanguine-bargain", "Market phase: lose 2 Prestige and gain 8 coins for this round."],
  ["blood", "Red Harvest", "red-harvest", "Market phase: gain 2 rubies."],
  ["blood", "Heartprice", "heartprice", "Market phase: advance your droplet 2 spaces."],
];

const afflictionReference = [
  ["Ashen Breath", "ashen-breath", "Each breath sheds warm grey cinders.", "1 Prestige at 2 progress; 2 Prestige at 4."],
  ["Glassvein Chill", "glassvein-chill", "Veins ring like frozen crystal beneath the skin.", "At 2: 1 Prestige. At 4: also next brew +1. At 5: 2 Prestige."],
  ["Hollow Bloom", "hollow-bloom", "Pale flowers open wherever a memory has faded.", "1 Prestige per 2 progress; at 6, also advance the droplet 1."],
  ["Embersleep", "embersleep", "Dreams smoulder beneath a skin of cooling ash.", "At 3: 1 Prestige and next brew +1. At 5: 3 Prestige and next brew +2."],
  ["Moonwater Fever", "moonwater-fever", "Silver heat rises whenever moonlight touches glass.", "At 3: 1 Prestige and next brew +1. At 5: 3 Prestige and next brew +1."],
  ["Thorn Memory", "thorn-memory", "Forgotten names return as barbs beneath the tongue.", "1 Prestige at 2, 2 Prestige at 4, or 4 Prestige at 6 progress."],
  ["Mirror Hunger", "mirror-hunger", "Reflections consume details their owner can no longer recall.", "Prestige equals progress minus 2, up to 4; next brew +2 at 7."],
  ["Silent Chorus", "silent-chorus", "Unheard voices gather wherever the afflicted stands still.", "Even progress grants half as Prestige; odd progress grants one-third. Next brew +1 at 5."],
];

const omenReference = [
  ["01", "Ember in the Ash", "All players roll the bonus die once."],
  ["02", "The Cinder Toll", "Choose whether to use rat tails normally or exchange 1–3 of them for the same number of rubies."],
  ["03", "Borrowed Spark", "All players advance their droplet 1 space."],
  ["04", "The Crawling Moon", "Each player may trade 1 ruby for any value-1 ingredient except Wraithbloom or Shadowmoss."],
  ["05", "Bones of Chance", "Each player samples 5 chips; the lowest total gains Frostbile 2 and the others gain 1 ruby."],
  ["06", "Ashen Charity", "Each player samples 4 chips and may upgrade one sampled ingredient of the same color."],
  ["07", "Quiet Hands", "Choose 4 Prestige or remove one value-1 Voidshard from your bag."],
  ["08", "Ruby Rain", "The player or players with the least Prestige gain 1 Deathweave."],
  ["09", "Mercy in Smoke", "Choose a Shadowmoss, any value-2 ingredient, or 3 rubies."],
  ["10", "The Last Laugh", "Double every rat-tail bonus this round."],
  ["11", "Thread of Death", "Choose any value-4 ingredient or gain 1 Prestige per rat tail."],
  ["12", "Cold Ledger", "The player or players with the fewest rubies gain 1 ruby."],
  ["13", "Thorn Harvest", "Choose: advance your droplet 2 spaces or take 1 Wraithbloom."],
  ["14", "Golden Rot", "Ruby scoring spaces pay 2 rubies this round."],
  ["15", "Wraith Choir", "Return the first Voidshard drawn this round to your bag."],
  ["16", "Moss Beneath Doors", "A stopped brewer may sample up to 5 chips and place one without triggering its action."],
  ["17", "Brimstone Chorus", "After placing the first 5 chips, each brewer may restart the round once."],
  ["18", "Measured Breath", "Exactly 7 Voidshard pressure advances your droplet 1 space."],
  ["19", "Steady Pulse", "The explosion threshold is 9 this round."],
  ["20", "Twin Rubies", "All Cursed Vials refill for free at the end of the round."],
  ["21", "Spare Flask", "When a brewer shatters, the player to their left gains any value-2 ingredient."],
  ["22", "Guild Applause", "Every Brimstone moves 1 additional space this round."],
  ["23", "Hidden Ember", "A ruby scoring space also grants 2 additional Prestige."],
  ["24", "Still Night", "Bonus-die winners roll twice this round."],
  ["V1", "Retort Rain", "Every brewer gains 1 additional Distillation progress this round.", true],
  ["V2", "Sevenfold Refraction", "Exactly 7 Voidshard pressure contributes 2 Distillation progress instead of 1.", true],
  ["V3", "Cracks in Company", "Each adjacent shattered rival contributes 2 Distillation progress instead of 1.", true],
  ["V4", "Mercy of the Thin Veil", "Every brewer's Distillation progress is at least 3 this round.", true],
];

function ingredientCard(ingredient, recipeIndex) {
  const recipe = ingredient.recipes?.[recipeIndex];
  const effect = recipe?.[0] || ingredient.effect;
  const cost = recipe?.[1] || ingredient.cost;
  const optional = ingredient.optional ? ' data-optional-ingredient="true"' : "";
  return `<article class="ingredient-card color-${ingredient.color}"${optional}>
    <div class="ingredient-portrait"><img src="${ASSET_ORIGIN}${ingredient.image}" alt="${ingredient.name}"></div>
    <div class="ingredient-copy"><header><div><h3>${ingredient.name}</h3><small>VALUES · ${ingredient.values}</small></div><span class="timing ${ingredient.timing}">${ingredient.timing}</span></header><p>${effect}</p><div class="ingredient-cost"><b>MARKET COST</b><strong>${cost}</strong></div></div>
  </article>`;
}

function renderIngredients() {
  const grid = document.querySelector("#ingredient-grid");
  if (!grid) return;
  const recipeIndex = Number(document.querySelector("#recipe-set").value) - 1;
  grid.innerHTML = [...fixedIngredients.slice(0, 3), ...recipeIngredients, ...fixedIngredients.slice(3)]
    .map((ingredient) => ingredientCard(ingredient, recipeIndex)).join("");
  grid.querySelectorAll('[data-optional-ingredient="true"]').forEach((card) => {
    card.hidden = !optionalToggle.checked;
  });
}

function renderExpansionReferences() {
  const omenGrid = document.querySelector("#omen-reference");
  if (omenGrid) omenGrid.innerHTML = omenReference.map(([number, name, effect, optional]) => `
    <article class="omen-reference${optional ? " is-optional" : ""}"${optional ? ' data-optional-omen="true"' : ""}>
      <header><b>${optional ? "VEILGLASS" : "OMEN"} ${number}</b><h4>${name}</h4></header><p>${effect}</p>
    </article>`).join("");
  const covenantGrid = document.querySelector("#covenant-reference");
  if (covenantGrid) covenantGrid.innerHTML = covenantReference.map(([kind, name, slug, effect]) => `
    <article class="reference-card covenant-${kind}"><img src="${ASSET_ORIGIN}/images/dlc/mirewrought-pacts/covenants/covenant-${kind}-${slug}.webp" alt="${name}"><div><span>${kind.toUpperCase()} COVENANT</span><h4>${name}</h4><p>${effect}</p></div></article>`).join("");
  const afflictionGrid = document.querySelector("#affliction-reference");
  if (afflictionGrid) afflictionGrid.innerHTML = afflictionReference.map(([name, slug, symptom, reward]) => `
    <article class="reference-card"><img src="${ASSET_ORIGIN}/images/dlc/veilglass-afflictions/afflictions/affliction-emblem-${slug}.webp" alt="${name} emblem"><div><span>AFFLICTION CONTRACT</span><h4>${name}</h4><em>${symptom}</em><p>${reward}</p></div></article>`).join("");
}

chapters.forEach((chapter, index) => {
  const link = document.createElement("a");
  link.href = `#${chapter.id}`;
  link.dataset.target = chapter.id;
  link.innerHTML = `<small>${String(index).padStart(2, "0")}</small><span>${chapter.dataset.title}</span>`;
  link.addEventListener("click", () => {
    sidebar.classList.remove("is-open");
    tocToggle.setAttribute("aria-expanded", "false");
  });
  toc.append(link);
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    document.querySelectorAll("#toc a").forEach((link) => {
      link.classList.toggle("is-active", link.dataset.target === entry.target.id);
    });
  });
}, { rootMargin: "-18% 0px -65%", threshold: 0.01 });

chapters.forEach((chapter) => observer.observe(chapter));

function applyFilters() {
  const term = search.value.trim().toLocaleLowerCase();
  let visible = 0;
  chapters.forEach((chapter) => {
    const hidesOptional = chapter.dataset.optional === "true" && !optionalToggle.checked;
    const missesSearch = term && !chapter.textContent.toLocaleLowerCase().includes(term);
    const hidden = hidesOptional || missesSearch;
    chapter.hidden = hidden;
    const link = document.querySelector(`#toc a[data-target="${chapter.id}"]`);
    if (link) link.hidden = hidden;
    if (!hidden) visible += 1;
  });
  noResults.hidden = visible !== 0;
  document.querySelectorAll('[data-optional-ingredient="true"]').forEach((card) => {
    card.hidden = !optionalToggle.checked;
  });
  document.querySelectorAll('[data-optional-omen="true"]').forEach((card) => {
    card.hidden = !optionalToggle.checked;
  });
}

search.addEventListener("input", applyFilters);
optionalToggle.addEventListener("change", applyFilters);
document.querySelector("#recipe-set")?.addEventListener("change", renderIngredients);

tocToggle.addEventListener("click", () => {
  const open = sidebar.classList.toggle("is-open");
  tocToggle.setAttribute("aria-expanded", String(open));
});

document.querySelector("#replay-placement").addEventListener("click", () => {
  const token = document.querySelector(".moving-token");
  token.classList.remove("is-moving");
  requestAnimationFrame(() => requestAnimationFrame(() => token.classList.add("is-moving")));
});

addEventListener("scroll", () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  const progress = max > 0 ? Math.min(1, scrollY / max) : 0;
  document.querySelector("#progress-bar").style.transform = `scaleX(${progress})`;
}, { passive: true });

document.querySelector(".moving-token").classList.add("is-moving");
renderIngredients();
renderExpansionReferences();

// Asset-backed chapters gain height while their illustrations decode. Restore the
// requested deep link after that layout settles so a shared chapter URL opens at
// the chapter heading rather than midway through the preceding page.
addEventListener("load", () => {
  if (!location.hash) return;
  const restoreDeepLink = () => {
    const target = document.querySelector(location.hash);
    if (target) scrollTo({ top: Math.max(0, target.getBoundingClientRect().top + scrollY - 80), behavior: "instant" });
  };
  requestAnimationFrame(() => requestAnimationFrame(restoreDeepLink));
  setTimeout(restoreDeepLink, 700);
});
