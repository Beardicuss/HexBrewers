# Hexbrewers DLC and Gameplay Visual Generation Prompts

Prompt version: 1.0 — 2026-10-18

These prompts are production briefs. Keep the generated master, model name, seed,
generation settings, edit history, and commercial-use status beside every accepted asset.
Do not bake text, logos, UI labels, borders, or reference-game imagery into generated art.

## Shared style lock

Append this block to every raster prompt:

> Original dark-fantasy alchemical world of Ashenveil; gothic stone, tarnished brass,
> blackened iron, smoked glass, wet mineral surfaces, restrained violet and spectral teal
> illumination, painterly cinematic realism, intricate but readable silhouettes, premium
> strategy-game key art, dramatic chiaroscuro, controlled bloom, deep blacks that retain
> detail, no modern objects, no steampunk machinery, no text, no letters, no logo, no
> watermark, no frame, no recognizable characters or compositions from existing games.

Negative prompt:

> cartoon, anime, cheerful fantasy, generic mobile-game gloss, oversaturated neon,
> flat lighting, plastic materials, sci-fi technology, modern clothing, typography,
> watermark, signature, duplicated objects, malformed anatomy, extra fingers, cropped
> subject, muddy detail, compression artifacts.

## Priority order

1. Gameplay hand placement animation.
2. Gameplay cauldron-room ambient loop or overlay layers.
3. Echo Reed, Embercore, Distillate Marker, and the three Covenant Seals.
4. Veil Retort and Abyssal Runoff frames.
5. The Hollow portrait and eight Affliction portraits.
6. Twelve Covenant portraits, DLC key art, Remedy Path cards, Omens, and VFX atlases.

## Gameplay ambience

### Seamless gameplay-room video

Use `public/images/cauldron_bg.jpg` as the exact first-frame image reference.

> Animate this exact top-down dark alchemical chamber without redesigning or moving any
> object. The camera is perfectly locked: no pan, zoom, roll, crop, parallax, or lens
> breathing. Preserve the original cauldron position, proportions, stone floor, handles,
> pillars, color palette, texture sharpness, and empty UI-safe areas. Create only subtle
> life: slow purple liquid convection inside the cauldron, small bubbles rising and
> collapsing, faint violet light breathing across the nearest metal rim and stones,
> extremely soft steam drifting upward, rare tiny arcane motes, and almost imperceptible
> shadow movement from unseen flame. Nothing enters or leaves the frame. No splashes over
> the rim. The final frame must transition invisibly into the first frame. Dark, restrained,
> atmospheric, not distracting behind gameplay UI. 8-second perfect seamless loop,
> 1920×1080, 30 fps.

Export master as high-quality video; ship as VP9 WebM, ideally below 4 MB. Keep the JPG
as poster/fallback and disable autoplay animation when reduced motion is enabled.

### Preferred overlay-only version

Generate separate grayscale masks or sprite atlases rather than a replacement background:

> Top-down transparent VFX overlay for a circular dark-fantasy cauldron: slow curling
> vapor, sparse tiny bubbles, faint soft-edged magical motes, and irregular liquid-light
> caustics. Effects concentrated inside a centered cauldron circle with only a very subtle
> spill onto its rim. Black background for additive/screen blending, no cauldron, no room,
> no solid objects, no camera movement, perfect 6-second loop, 2048×2048 square master.

## Ingredient-placement hand

Generate the hand separately from the ingredient. The game will attach the live token
sprite beneath the fingers so one animation works for every ingredient.

### Hand sprite-sheet prompt

> Orthographic top-down view of one elegant adult hexbrewer hand and forearm entering from
> the bottom-right, wearing a worn black leather glove with slender fingers, subtle tarnished
> brass rings and a dark plum cuff. The thumb and index finger form a precise pinch around
> an empty circular gap 72 pixels wide; do not draw an ingredient in the gap. Create eight
> evenly spaced animation frames on a transparent background: off-screen approach, entering,
> hovering with pinched fingers, lowering, release beginning, fingers opening, withdrawal,
> almost off-screen. Identical anatomy, costume, lighting, scale, and camera in every frame.
> Soft violet under-light from the cauldron, restrained teal rim light, crisp readable
> silhouette. Horizontal 8-frame sprite sheet, 4096×512 PNG with alpha.

Negative additions:

> ingredient, coin, chip, object between fingers, extra fingers, missing fingers, changing
> jewelry, changing sleeve, changing hand size, perspective camera, palm facing camera,
> opaque background, cast shadow outside the hand.

Recommended implementation: animate 250–350 ms into the selected crucible position,
release the existing Pixi token, withdraw over 220–300 ms, and skip immediately under
reduced-motion or fast-forward settings.

## Mirewrought Pacts

### DLC key art

> A drowned covenant shrine deep in an ancient subterranean mire beneath Ashenveil. Three
> distinct ritual altars form a triangular composition: pale bone and candles, silver
> moonwater and reeds, dark crimson roots and sealed vials. A faceless hollow brewer waits
> beyond them in fog. Echo Reeds glow spectral teal around black water; a cracked channel
> carries violet potion into an abyss. Strong central negative space for optional external
> logo placement. Cinematic 16:9 composition, 2560×1440 layered master.

### The Hollow portrait

> Bust portrait of The Hollow, an original nonhuman rival hexbrewer: tall empty ceremonial
> hood containing darkness and a faint ring of teal marsh-fire, layered weathered robes,
> bone clasps, wet black reeds, restrained posture, intelligent and unreadable rather than
> monstrous. Three-quarter view, dark neutral background, face area readable at 96 pixels,
> square 1024×1024 master.

### Covenant portrait template

> Vertical portrait card illustration for the [NAME] [BONE/MOON/BLOOD] Covenant. Depict
> [SUBJECT] as a single iconic ritual tableau with one dominant silhouette and uncluttered
> corners for UI overlays. Bone Covenants use ivory, ash, and muted green; Moon Covenants use
> silver-blue, teal, and black; Blood Covenants use oxblood, ember red, and tarnished gold.
> No text, no border, 3:4 composition, 768×1024 master.

Subjects:

- Ossuary Mercy — a skeletal hand refilling a cracked ritual vial with pale light.
- Marrow Exchange — two carved bone vessels exchanging luminous marrow.
- Graveward — a stone grave sentinel guarding a glowing droplet path.
- Pale Reckoning — ivory scales weighing ash against three spectral coins.
- Moonstep — a silver footprint crossing black water beneath a thin moon.
- Silver Ward — a crescent shield catching a bursting white crystal.
- Lunar Tithe — two moonlit rubies offered in a dark silver bowl.
- Eclipse Stride — a black sun casting a long silver path through reeds.
- Crimson Credit — five blood-red coins issued from a sealed ledger.
- Sanguine Bargain — a cut palm above eight coins, solemn rather than graphic.
- Red Harvest — two ruby fruits cut from a thorned ritual vine.
- Heartprice — a crystal heart powering a two-step droplet mechanism.

### Covenant Seal icons

Generate three separate icons:

> Centered heraldic ritual seal for the [Bone/Moon/Blood] Covenant: [interlocked ivory
> vertebrae / crescent reflected in black water / thorn-bound drop]. Bold silhouette,
> readable at 32 pixels, shallow engraved relief, transparent background, no text, no outer
> card frame, 1024×1024 master.

### Echo Reed

> Single crystallized marsh reed ingredient token artwork, curled teal reed preserving
> ghostlike echoes of several possible paths inside translucent mineral fibers, luminous
> cut edges, isolated centered object, transparent background, top-down three-quarter icon
> lighting, readable at 48 pixels, 1024×1024 master.

### Embercore-6

> Single soot-black mineral seed split by exactly six controlled veins of banked orange
> fire, dense heavy stone rather than a flame, circular ingredient-token silhouette,
> isolated centered object, transparent background, readable at 48 pixels, 1024×1024 master.

### Abyssal Runoff frame

> Wide transparent UI ornament shaped as a cracked black-stone overflow channel leading
> from a cauldron rim into darkness. Six readable resting notches for ingredient tokens,
> tarnished brass measurement marks without numbers, faint violet residue, symmetrical
> nine-slice-safe end caps, no text, transparent background, 1200×360 master.

## Veilglass Afflictions

### DLC key art

> Secret gothic infirmary and alchemical laboratory beyond a fractured glass veil. A tall
> antique retort holds pale blue distillate; eight shadowed patient emblems appear as faint
> reflections in suspended glass fragments. Violet potion light meets icy spectral blue,
> with a distant impossible silhouette looking back through the retort. Strong central
> negative space for external logo placement, 16:9, 2560×1440 layered master.

### Affliction portrait template

> Square symbolic dark-fantasy portrait for the original Affliction Contract [NAME]. Show
> one anonymous afflicted figure from chest up, with the symptom expressed through magical
> material rather than gore: [SYMPTOM]. Somber dignity, no medical realism, no text, no
> border, coherent Veilglass palette of smoked glass, spectral blue, restrained violet and
> tarnished silver, face readable at 96 pixels, 1024×1024 master.

Symptoms:

- Ashen Breath — warm grey cinders escaping with each breath.
- Glassvein Chill — delicate frozen-glass veins glowing beneath shadowed skin.
- Hollow Bloom — pale flowers opening where fragments of memory fade.
- Embersleep — closed eyes and cooling ash with embers beneath the skin.
- Moonwater Fever — silver heat rising where moonlight touches glass.
- Thorn Memory — spectral thorn-vines forming forgotten names near the mouth.
- Mirror Hunger — reflection losing details while the subject remains whole.
- Silent Chorus — several translucent unheard faces gathering in the surrounding dark.

### Veil Retort

> Wide transparent UI frame of an antique alchemical retort made from smoked blue glass,
> tarnished silver, black iron clamps, and eight clear progress chambers. Empty center cells
> remain unobstructed for code-drawn markers. Symmetrical, front-facing orthographic UI
> ornament, readable at 320 pixels wide, nine-slice-safe ends, no text, transparent
> background, 1600×420 master.

### Distillate Marker

> Single luminous droplet of pale spectral-blue distillate suspended inside a tiny cracked
> glass ampoule, bold circular silhouette, centered, transparent background, readable at
> 20 pixels, 512×512 master.

### Remedy Path frame template

> Vertical dark-fantasy card background for [AFFLICTION NAME], built from smoked glass,
> tarnished silver filigree, and a subtle symbolic motif of [SYMPTOM]. Large quiet center
> area for code-rendered rules and rewards, no text, no icons, no numbers, 3:4 composition,
> 768×1024 master.

### Distillation vapor atlas

> Transparent VFX sprite atlas showing sixteen sequential frames of pale-blue and violet
> alchemical vapor rising through a glass retort, starting as a compact wisp, curling into
> branching filaments, briefly forming a thin halo, then dissipating completely. Consistent
> scale and lighting, no apparatus, no solid objects, premultiplied-alpha-safe edges,
> 4×4 atlas, 2048×2048 PNG.

## Acceptance checks

- Compare the first and last video frames with a difference blend; the loop seam should be
  invisible.
- Reject hand sheets with changing anatomy, jewelry, sleeve length, or pinch position.
- Test every icon at 32, 48, and 96 pixels before accepting the master.
- Verify transparent edges on both dark and light checkerboards.
- Keep UI text and numbers code-rendered for English, Russian, and Georgian.
- Preserve the static JPG and reduced-motion fallback for every animated background.
