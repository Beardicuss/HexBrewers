# The Hexbrewer's Codex

Current content milestone: **Complete Codex** — audited core and optional-rule reference,
illustrated examples, interactive diagrams, a first-round quick-start path, and
desktop/mobile readability hardening.

Standalone HTML rulebook for the Softcurse website. This folder is intentionally
outside `src/` and `public/`, so it is not bundled into the game.

## Local preview

Serve this directory on port 4175 while the game dev server is running on 5174.

## Production link

Set `VITE_RULEBOOK_URL` when building the game to the final public Codex URL. The
Grimoire's Rules page opens that address in a new browser tab or external browser.

The static rulebook currently uses the published R2 release assets. A website build
may set `window.HEXBREWERS_ASSET_ORIGIN` before `script.js` to point to a newer media
release.
