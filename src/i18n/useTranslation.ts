import { useSettingsStore } from "../store/settingsStore";
import type { Translations } from "./types";
import { en } from "./en";
import { ru } from "./ru";
import { ka } from "./ka";

const dictionaries: Record<string, Translations> = { en, ru, ka };

export function useTranslation(): Translations {
    const language = useSettingsStore((s) => s.language);
    return dictionaries[language] ?? en;
}
