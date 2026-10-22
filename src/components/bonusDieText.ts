import type { BonusDieResult } from "../game/bonusDie";
import type { Translations } from "../i18n/types";

export function formatBonusDieResult(
  result: BonusDieResult,
  copy: Translations["bonusDieRewards"]
): string {
  if (result.type === "ruby") return copy.ruby.replace("{amount}", String(result.amount));
  if (result.type === "vp") return copy.prestige.replace("{amount}", String(result.amount));
  if (result.type === "droplet") return copy.droplet;
  return copy.brimstone;
}
