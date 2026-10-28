import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { RECIPE_GUIDANCE } from "../src/game/recipeGuidance";
import { BASE_SET_STRATEGIES } from "../src/game/strategyBalance";

const target = resolve(process.cwd(), "website/rulebook/recipe-guidance.js");
const source = `/* Generated from the game rules sources. */\nwindow.HEXBREWERS_RECIPE_GUIDANCE = ${JSON.stringify(RECIPE_GUIDANCE, null, 2)};\nwindow.HEXBREWERS_RECIPE_STRATEGIES = ${JSON.stringify(BASE_SET_STRATEGIES, null, 2)};\n`;
writeFileSync(target, source, "utf8");
console.log(`Wrote ${target}`);
