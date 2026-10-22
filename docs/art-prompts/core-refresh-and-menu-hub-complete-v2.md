# Core Art Refresh and Menu Hub — Complete Prompt Pack v2

Updated: 2026-10-21

Use the current game assets as composition references where specified. Generate artwork without text, letters, numbers, logos, watermarks, UI labels, or signatures. Keep the source generations; runtime conversion to WebP/WebM happens during integration.

## Shared visual style block

Append this block to every still-image prompt:

> Premium dark-fantasy game artwork for *Hexbrewers of Ashenveil*. Grounded late-medieval occult alchemy, painterly realism with restrained cinematic detail, aged materials, smoked glass, blackened iron, tarnished brass and silver, spectral teal, restrained violet, ember orange and old-gold highlights. Somber, mysterious and handcrafted; readable silhouettes; physically plausible materials; controlled contrast; coherent with an ancient laboratory beneath a ruined gothic castle. Mature European dark fantasy, not anime, not cartoon, not glossy mobile-game art, not plastic 3D, not steampunk, not science fiction, no excessive bloom, no neon cyberpunk, no gore, no text, no letters, no numbers, no watermark.

## Shared icon rules

Append this block to every isolated token/object prompt:

> Single centered object, transparent background, top-down three-quarter icon view, orthographic-feeling presentation, soft controlled rim light, complete silhouette with generous transparent margin, no cast environment, no frame, no pedestal, no extra objects. Must remain identifiable at 48 pixels. 1024×1024 master.

---

# A. Original ingredient tokens

Generate eight separate transparent assets.

## `ingredient-voidshard.png`

> A single fractured Voidshard: an irregular wedge of pale translucent mineral formed from a collapsed dimensional membrane, milky white glass with a cold blue-violet core, hairline spatial fractures suspended inside it, faint dangerous luminescence, visibly unstable but dense and mineral rather than magical smoke. Avoid ordinary quartz, snowflake shapes and clean gemstones. [Shared visual style block] [Shared icon rules]

## `ingredient-brimstone.png`

> A single crystallized Brimstone reagent: rough volcanic sulfur fused into a compact ember-orange stone, black basalt crust split by contained orange heat, scorched granular edges, faint warmth without open flame. It must read as the cheapest dependable alchemical ingredient, sturdy and common rather than jewel-like. Avoid a spider, coal briquette, fireball or glowing lava puddle. [Shared visual style block] [Shared icon rules]

## `ingredient-deathweave.png`

> A single coil of Deathweave: poisonous cave-spider silk treated with moonwater, several thick luminous green-black strands braided into an occult knot, fine phosphorescent filaments at the edges, a tiny sealed venom bead caught in the weave. Ingredient token, not a living spider. Avoid web backgrounds, insects and loose unreadable thread. [Shared visual style block] [Shared icon rules]

## `ingredient-wraithbloom.png`

> A single Wraithbloom flower harvested at night: five to seven translucent spectral violet petals around a dim silver-violet heart, edges evaporating into only a few restrained ghost wisps, slightly wilted and mournful, botanical structure clearly readable. Avoid a generic lotus, cheerful flower, bouquet or excessive smoke. [Shared visual style block] [Shared icon rules]

## `ingredient-frostbile.png`

> A single ampoule-like lump of compressed Frostbile serpent venom: dense frozen blue-black droplet with an icy shell, sharp frost ridges, luminous cobalt liquid trapped inside and one subtle fang-shaped contour, cold enough to mist slightly. It must read as frozen venom, not an ordinary ice cube or blue gemstone. [Shared visual style block] [Shared icon rules]

## `ingredient-bloodthorn.png`

> A single Bloodthorn reagent: one heavy red-black carnivorous bramble thorn curved like a ritual barb, dried crimson sap visible within a narrow split, dark iron-like surface, dangerous hooked silhouette, restrained red magical pulse. No blood splatter, no gore, no rose and no bundle of branches. [Shared visual style block] [Shared icon rules]

## `ingredient-plaguedust.png`

> A single compact Plaguedust ingredient token: a cracked plague-moth husk curled around a dense mound of crystallized antique-gold powder, several readable granular crystals and one small folded wing fragment, dry toxic beauty, warm yellow-gold glow kept subtle. Avoid loose clouds that disappear at icon size, living moths and bright treasure gold. [Shared visual style block] [Shared icon rules]

## `ingredient-shadowmoss.png`

> A single clump of Shadowmoss: living velvet-black moss growing over a small obsidian fragment, absorbing the nearby light, faint charcoal-silver edges and tiny muted gold lichen specks, asymmetrical organic silhouette, ancient and unnervingly alive. Preserve detail within the dark mass so it remains readable. Avoid a black blob, ordinary forest moss or luminous green vegetation. [Shared visual style block] [Shared icon rules]

---

# B. Core economy and gameplay objects

## `ruby.png`

> One alchemical ruby currency stone, roughly hand-cut rather than perfectly faceted, deep wine-red translucent crystal held by three tiny tarnished-brass alchemical claws, internal ember gleam, valuable but ominous. No crown, coin, pile or modern jewelry. [Shared visual style block] [Shared icon rules]

## `coin.png`

> One worn Ashenveil market coin, thick irregular antique brass, embossed with an abstract cauldron-and-crescent sigil, clipped and oxidized edges, shallow engraved relief, dark patina in recesses, readable circular silhouette. The sigil must contain no letters or numbers. [Shared visual style block] [Shared icon rules]

## `score-marker.png`

> One prestige score marker shaped as a small ceremonial droplet pawn, tarnished silver cage around a violet glass core, flat stable base, strong vertical silhouette, crafted for an ancient occult board rather than a modern board game. No text or number. [Shared visual style block] [Shared icon rules]

## `flask-empty.png`

> One empty Cursed Vial, squat medieval alchemical bottle made from smoky uneven glass, blackened silver collar, tiny sealed crescent stopper, faint residue and hairline violet curse marks inside but clearly empty. Symmetrical readable silhouette, no liquid. [Shared visual style block] [Shared icon rules]

## `flask-full.png`

> The exact same Cursed Vial design and camera angle as the empty reference, now filled with dense luminous violet-black potion up to the shoulder, subtle suspended sparks and internal refraction, stopper sealed, unmistakably full. Use `flask-empty` as a strict shape reference. No overflow or open flame. [Shared visual style block] [Shared icon rules]

## `rat-stone.png`

> One ancient catch-up Rat Stone: a palm-sized irregular slate token carved with the profile of a gaunt subterranean rat, worn shallow relief, chipped edges, old silver inlay in the eyes and tail, faint sympathetic magic, humble and ominous rather than cute. No living rat and no text. [Shared visual style block] [Shared icon rules]

## `brew-bag.png`

> One closed hexbrewer ingredient bag, heavy plum-black velvet and cracked leather, gathered neck bound with tarnished silver chain, subtle embroidered spiral sigil, weighted rounded base containing many hard tokens, one restrained violet seam glow. Functional, old and frequently handled; no visible ingredients spilling out. Transparent background, centered full object, front three-quarter view, readable at 96 pixels, 1536×1536 master. [Shared visual style block]

---

# C. Player portrait collection

Generate five matching square portraits. Keep identical camera distance, lighting direction, tonal range and background treatment across the set.

## Shared portrait block

> Square chest-up character portrait, anonymous dark-fantasy occult brewer, painterly realism with visible traditional brush texture, weathered human features and believable age, dignified restraint, asymmetrical period clothing, no glamour pose, no smooth plastic skin. Dim laboratory background with smoked glass and restrained violet/teal practical light. Face and silhouette readable at 96 pixels. No text, border, logo, anime styling, fashion photography, youthful influencer face or glossy 3D-render appearance. 1024×1024 master.

## `portrait-hexbrewer.png`

> The player Hexbrewer: an imposing, completely genderless master of forbidden alchemy, chest-up and facing slightly toward the viewer. The face is fully concealed inside a deep structured black hood and a fitted ritual brewing mask of blackened leather, tarnished silver and smoked glass; no skin, hair, eyes, age or gender visible. Two narrow asymmetrical smoked-glass lenses catch restrained violet and poisonous teal reflections, giving an intelligent, dangerous presence without resembling a robot. Layered black alchemist robes, reinforced leather shoulders, silver chain seals, small potion ampoules and one heavy gauntleted hand held near the chest as if controlling an unseen brew. Strong triangular silhouette, commanding stillness, mysterious player-avatar identity, seasoned and formidable rather than heroic. Premium dark-fantasy protagonist portrait matching the menace and visual authority of The Shade, The Wraith, The Seer and The Hollow. Avoid an ordinary middle-aged person, visible face, feminine or masculine body emphasis, plague-doctor beak, skull mask, knight helmet, gas mask, sci-fi respirator, superhero pose or excessive ornament. For this portrait, the concealed mask and hood replace the visible-face requirement in the Shared portrait block. [Shared portrait block] [Shared visual style block]

## `portrait-the-shade.png`

> The Shade: a severe older rival whose face seems partially consumed by natural shadow, lean angular features, closely wrapped dark hood and high alchemist collar, only one cold violet eye catching the light, calculating stillness, unmistakably human beneath the occult concealment. No skull face, monster teeth or featureless hood. [Shared portrait block] [Shared visual style block]

## `portrait-the-wraith.png`

> The Wraith: a pale middle-aged rival with rain-dark hair, hollow sleepless eyes and translucent breath drifting across one cheek, worn mourning coat threaded with faded silver, the faint impression of a second spectral profile displaced behind the head. Somber and human, not undead gore. [Shared portrait block] [Shared visual style block]

## `portrait-the-seer.png`

> The Seer: an elderly rival with deeply lined face, clouded eyes covered by a narrow cracked-smoked-glass divination lens, layered scholar robes and tiny brass omen instruments at the collar, composed expression as if listening to a future sound. No wizard hat, glowing eyeballs or ornate crown. [Shared portrait block] [Shared visual style block]

## `portrait-the-hollow.png`

> The Hollow: an older gaunt rival from the drowned mire, dark weathered skin, shaved or tightly bound hair, bone covenant beads and damp black-green mantle, expression calm but emotionally unreachable, subtle empty reflection in one eye and faint marsh light behind the shoulders. Human and dignified, not a zombie or swamp monster. [Shared portrait block] [Shared visual style block]

---

# D. Omen card structure

Maintain the existing 2:3 card ratio. Generate at 1024×1536, then crop during integration to the current 832×1248 ratio if required.

## `omen-card-back.png`

> Vertical dark-fantasy Omen card back, perfectly centered and vertically symmetrical. Layered black leather, smoked blue glass, tarnished silver filigree and restrained violet enamel. Central emblem: a sealed eye above a small alchemical cauldron, surrounded by nine subtle radial marks representing nine rounds. Strong silhouette when displayed small, premium engraved relief, dark quiet center, richly finished edges. No text, letters, numbers, suit symbols or watermark. Full-bleed card artwork, no mockup, no hands, 1024×1536 master. [Shared visual style block]

## `omen-card-front-blank.png`

> Vertical blank Omen card frame matching the card-back materials. Ornate but restrained tarnished-silver and smoked-glass border, slightly heavier ornament at top and bottom, four corners intact, very large uninterrupted dark center reserved for variable illustration and readable UI text, subtle lower plaque area with no writing, controlled contrast and nine-slice-safe inner margins. No illustration, text, symbols, letters, numbers, mockup or hands. Transparent background outside the card silhouette if supported, 1024×1536 master. [Shared visual style block]

---

# E. Spatial main-menu hub rooms

Generate all five rooms as 1920×1080 still masters first. Use the current `main_menu_bg.jpg` as the architectural and palette reference so every room feels connected to the same underground castle. Keep the camera at human eye level with a 35–45 mm cinematic lens and reserve the left third for UI unless stated otherwise.

## `menu-room-central-laboratory.png`

> Preserve the current Ashenveil main-menu laboratory composition as closely as possible: vast gothic catacomb laboratory beneath a ruined castle, long stone worktables, glass vessels glowing restrained violet, cold teal light descending through ancient arches, wet worn flagstones and deep darkness beyond. Upgrade material detail, atmospheric depth and cinematic lighting without redesigning the location. Establish five believable visual routes or focal objects: living central cauldron for Continue, ritual worktable for New Game, shadowed lectern doorway for Grimoire, sealed iron reliquary door for DLCs, brass astrolabe doorway for Settings. No people, no text, no interface, no extreme fog. [Shared visual style block]

## `menu-room-new-game-ritual-chamber.png`

> Connected chamber reached from the central laboratory: intimate ritual preparation room with a waist-high brewing table centered beneath a narrow shaft of teal light, empty ingredient sockets, closed velvet bag, brass scales and three unlit covenant seal mounts. Dark gothic stone architecture visibly matches the central lab. Reserve a broad calm dark region across the center-left for New Game configuration UI. No active spell, no characters, no readable writing. [Shared visual style block]

## `menu-room-grimoire-scriptorium.png`

> Connected forbidden scriptorium beneath the same castle: monumental open alchemical grimoire on a blackened-oak lectern, surrounding shelves lost in darkness, hanging silver index chains, violet glass inlays, a few candles and spectral teal dust. The open pages contain abstract diagrams and illegible marks only. Reserve a large low-contrast central field behind the Grimoire interface; ornament and bright detail concentrated at the edges. No readable text or characters. [Shared visual style block]

## `menu-room-dlc-reliquary.png`

> Connected sealed reliquary vault beneath the same laboratory: three monumental alcoves for forbidden additions, one bound in mire-grown bone and moonlit water, one formed from cracked spectral blue glass, one still chained and lost in darkness for future content. Tarnished brass locking mechanisms, warning seals without writing, restrained violet residue. Frontal composition with ample central space for DLC cards. No characters, no readable text, no treasure-room excess. [Shared visual style block]

## `menu-room-settings-astrolabe.png`

> Connected alchemical control chamber beneath the same castle: large ancient brass astrolabe and smoked-glass lens apparatus built into a gothic stone wall, calibrated rings with abstract tick marks but no numbers, quiet teal reflections and restrained violet indicator light, blackened control desk, orderly and contemplative rather than mechanical steampunk. Reserve a clean dark central-right field for Settings panels. No characters or readable text. [Shared visual style block]

---

# F. Background loop prompts

Create still masters first. Only animate an approved still. Use image-to-video mode and supply the corresponding still as a strict visual reference.

## Main-menu central laboratory loop

Static locked camera. The central cauldron is visibly alive: its violet liquid continuously simmers with slow circular ripples, and several luminous violet vapor tendrils rise above it, curl sideways and dissolve into the air. Cold teal mist drifts steadily from right to left through the high arch and light shaft. Candle flames flutter gently, floating dust crosses the teal light, and the moving cauldron glow creates soft rippling reflections across the wet foreground stones. The environmental motion is clearly visible but slow, ominous and suitable behind a game menu. Architecture, doors, furniture, bottles and instruments keep their original shapes and positions. No people, creatures, camera movement, zoom, scene transition or newly appearing objects.

## New Game chamber loop

Static locked camera. A broad stream of teal-lit dust and thin mist descends visibly through the overhead light behind the ritual table. The candle on the right flickers gently, causing warm highlights to move across the brass scales and tabletop edges. A dim violet glow slowly gathers and fades inside each of the three circular seal instruments in sequence, without changing their engraved designs. Faint reflected light moves across the damp floor. The motion is calm but clearly perceptible. The table, scales, sockets, purple bag, shelves and architecture keep their original shapes and positions. No people, hands, active spell burst, camera movement, zoom, scene transition or newly appearing objects. Keep the dark left side visually quiet for interface text.

## Grimoire scriptorium loop

Static locked camera. Both edge candles flicker visibly and cast slowly moving warm highlights across the open grimoire, lectern and nearby metalwork. Fine teal dust drifts downward through the dark upper background. A restrained violet light moves gently inside the existing glass ornaments, and a thin trace of violet illumination travels along the outer metal rim of the lectern before fading. The atmospheric motion is clearly visible but scholarly and subdued. The book remains open to the same pages; all diagrams, writing, page shapes, chains, shelves and architecture remain unchanged. No page turning, changing symbols, flying objects, people, camera movement, zoom, scene transition or newly appearing objects. Keep the dark central field calm for interface elements.

## DLC reliquary loop

Static locked camera. Dark moon-water in the left alcove moves with slow visible ripples beneath the bone frame. Teal light flows gradually through the center alcove's cracked glass, brightening different existing fracture lines without changing their pattern. A low violet mist curls along the floor beneath all three alcoves and then disperses. The outer candles flicker gently and small dust particles cross the scene. The motion is clearly visible but restrained and ominous. The three alcoves, bones, glass cracks, sealed door, chains, locks and bottles keep their original shapes and positions. No doors opening, moving chains, creatures, camera movement, zoom, scene transition or newly appearing objects. Keep the central areas readable for DLC cards.

## Settings astrolabe loop

Static locked camera. Deep teal light moves visibly but slowly behind the astrolabe's central smoked-glass lens, like distant clouds passing across moonlight. A soft highlight travels across the curved lens surface. Violet energy drifts upward inside the existing vertical glass columns in gentle streams, while a few dust particles cross the narrow teal window light. The motion is clearly perceptible, controlled and contemplative. The brass rings, pointers, engraved markings, desk instruments and architecture keep their original shapes and positions. No rotating mechanism, sparks, people, camera movement, zoom, scene transition or newly appearing objects. Keep the large dark right side calm for Settings panels.

### Kling Video 3.0 generation settings

- Use the corresponding approved still as the **Start Frame only**. Leave **End Frame empty**; supplying the identical frame at both ends can suppress nearly all motion.
- Generate **10 seconds** at the highest available 16:9 quality; select 1080p when offered.
- Disable generated audio.
- Keep the camera static, but use the normal/default motion setting rather than minimum motion.
- Paste only the applicable motion prompt above; do not append the still-image style prompt.
- Test the Central Laboratory first. Reject any result with reframing, breathing architecture, changing symbols, malformed props or appearing objects.
- The generated clip does not need to loop by itself. Integration will create a seamless runtime loop with a controlled overlap and crossfade, avoiding the motion suppression caused by identical start and end frames.

## Generic room-transition prompt

Supply both approved room stills as start and end references:

> Create a restrained 1.2-second first-person cinematic passage from the supplied starting room to the supplied destination room, moving through their shared gothic doorway. Smooth human-height camera, gentle forward motion, a brief veil of teal-violet fog hiding the midpoint, exact stable destination composition on the final frames. No character body, no head bob, no whip pan, no motion sickness, no new architecture, no text. End on the destination reference precisely. 1920×1080, 30 fps, silent.

For reduced-motion mode, do not use transition video; use a 250 ms fog crossfade between the two approved stills.

---

# Generation and intake checklist

1. Generate four candidates per still prompt.
2. Inspect silhouettes at intended small size before judging surface detail.
3. Reject malformed glass rims, asymmetrical card borders, unreadable black objects, accidental letters and inconsistent portrait camera angles.
4. Approve all five room stills before generating any video loops.
5. Keep prompt, generator, model/version, seed when available, date and license/usage notes with each approved source.
6. Do not crop transparent icons tightly; retain at least 8% clear margin.
7. Deliver original PNG masters. Integration will create optimized WebP/WebM runtime assets and preserve static fallbacks.
