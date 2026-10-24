const configuredRulebookUrl = import.meta.env.VITE_RULEBOOK_URL?.trim();

/** The complete Codex is hosted on the Softcurse Systems website. */
export const COMPLETE_CODEX_URL = configuredRulebookUrl
  || "https://softcursesystems.pages.dev/rulebooks/hexbrewers/";
