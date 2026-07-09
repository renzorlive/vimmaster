# Technical Debt Register

Severity: 🔴 breaks users · 🟠 blocks the platform vision · 🟡 quality/maintainability · ⚪ polish

Each item is small enough to be one reviewable PR unless noted.

## 🔴 Bugs (fix first, no refactoring required)

### TD-1 Progress validation off-by-one destroys saves — ✅ FIXED ([PM-0001](postmortems/PM-0001-save-corruption.md))
`js/progress-system.js:129` rejects `currentLevel > 14` and `getProgressSummary()` reports `totalLevels: 15`, but `levels.js` defines **16** levels. A player who reaches the last level gets their save rejected on next load — and `autoLoadProgress()` then **deletes** it (`localStorage.removeItem`). Same magic number appears in `sharing-system.js:20`.
**Fix:** derive from `levels.length` everywhere; never hard-delete on validation failure (keep a backup key).

### TD-2 Level `setup()` never takes effect
`js/levels.js:259-264` calls `level.setup({ cursor: getCursor(), ... })`. `getCursor()` returns a copy; the setup mutates the copy; nothing is written back. Every level starts at `{row:0, col:0}` even though 12 of 16 levels specify another start position. (Cheat-mode lessons do write the result back — `cheat-mode.js:474-486` — which is why they behave differently.)
**Fix:** apply `gameState.cursor`/`commandHistory` back via setters after `setup()` runs, mirroring cheat-mode.

### TD-3 Auto-save-on-completion never fires
`js/main.js:463-476` wraps `window.checkWinCondition`, but `checkWinCondition` is an ES-module export that is never assigned to `window`. The wrapper is dead code; only the 30-second interval save works.
**Fix:** call `autoSaveProgress()` from the actual win path in `checkWinCondition()`.

### TD-4 Stale-state bounds clamp in normal mode
`js/vim-commands.js:404-410` clamps `cursor` captured at function entry, not the post-command cursor, so the safety net evaluates stale values.
**Fix:** re-read cursor via `getCursor()` before clamping (or fix properly during the pure-core refactor).

### TD-5 `0` is unreachable as a motion
`vim-commands.js:64-70` routes `0` into the count buffer unless the buffer is empty, then line 239 also treats `0` as "go to line start" — but only when the count buffer is empty, and `$`'s handler at line 240 runs even when `$` was typed during a pending count. Behavior around `10j`, `0`, `d0` is inconsistent. Verify with tests once the core is testable.

### TD-6 Duplicate, divergent challenge logic
`challenges.js#checkChallengeTask` and `#endChallenge` are never called; scoring was re-implemented in `event-handlers.js#checkWinCondition` with different point values (10 + time/10 vs 100 + timeBonus). One source of truth must win.
**Fix:** delete the dead functions or (better) move scoring back into `challenges.js` and call it.

## 🟠 Platform blockers

### TD-7 Engine hardcodes knowledge of specific levels
- Level-name string matching: `'Undo / Redo'` in `vim-commands.js:113,395`; `['Search Forward (/)','Search Backward (?)','Search Navigation (n/N)']` in `event-handlers.js:160,236` (duplicated twice).
- Dedicated global state flags for one level: `level12Undo`, `level12RedoAfterUndo`.
- Search levels enforce query text (`'target'`, `'alpha'`, `'foo'`) inline in `checkWinCondition`.

This makes adding content require engine edits — the opposite of the data-driven goal.
**Fix:** add declarative validator types to the level schema (e.g. `requires: [{type:'search', direction:'forward', query:'target', minNavigations:1}]`, `{type:'undoThenRedo'}`) evaluated against an event log. See ContentSystem.md.

### TD-8 Content duplicated between levels and cheat-mode lessons
`cheat-mode.js#vimLessons` (16 lessons, ~310 lines) is a near-copy of `levels.js` content with drift already visible. Both should be entries in one content store, tagged for where they appear.

### TD-9 No package.json / build / lint / tests / CI
There is no way to programmatically verify anything. Every other fix lands blind. Bootstrap: `package.json`, Vite, ESLint + Prettier, vitest, one GitHub Action running `build + lint + test`. (See ContributingVision.md for workflow.)

### TD-10 Tailwind via CDN
`<script src="https://cdn.tailwindcss.com">` is a ~300 KB render-blocking script that Tailwind explicitly says is not for production, generates styles at runtime, and logs a console warning. Replace with build-time Tailwind (or a small hand-rolled CSS file) during the Vite step. Also an offline/PWA blocker.

## 🟡 Maintainability

### TD-11 Shipped debug logging
~150 `console.log('🔍 DEBUG…')` calls across `event-handlers.js`, `challenges.js`, `progress-system.js`, `ui-components.js`, `cheat-mode.js`, `main.js` — several dump full buffer content **on every keystroke** (`updateUI`). Remove entirely; if diagnostics are wanted, gate behind a `DEBUG` flag.

### TD-12 Duplicated utility logic
- `stripTrailingBlankLines`/`trimLineEnd` content comparison: `event-handlers.js:189-199` and `cheat-mode.js:620-636`.
- ASCII logo: `index.html`, `sharing-system.js` canvas array, `sharing-system.js#generateAsciiLogo` (3 copies).
- Challenge task instruction HTML template: `event-handlers.js:91-97` and `ui-components.js:147-153`.
- Badge id → emoji/label/description maps: `ui-components.js:212`, `profile-page.js:256`, `sharing-system.js:712` (3 divergent copies).
- Progress loading: `profile-page.js#loadProgressData` re-implements `progressSystem.autoLoadProgress()` without validation.

### TD-13 `game-state.js` getter/setter explosion
~70 exported functions; call sites import 30+ names each (`main.js` imports 44). The defensive-copy getters also mean hot paths (`renderEditor`'s per-character `isInMatch`) copy the match array **per character rendered**. Replace with a single state object + narrow update API during the core refactor; short-term, hoist `getSearchMatches()` out of the render loop.

### TD-14 `handleNormalMode` is a 380-line conditional
Command parsing by `commandHistory.endsWith(...)` is fragile (e.g. any key sequence *ending* in `dd` triggers delete; `w` needs an explicit guard against `dw`/`cw`). Needs a real `count → operator → motion` parser (GameEngine.md).

### TD-15 Inline `onclick` + string-interpolated HTML
`sharing-system.js` and `profile-page.js` build large HTML strings with inline styles and `onclick="sharingSystem.…({name: '${…}'})"` — breaks on quotes in data, requires globals on `window`, and is an XSS hazard the moment content becomes contributor-supplied. Modal buttons in `event-handlers.js:128-133` use the same pattern (`window.startNewChallenge`).

### TD-16 Timer and interval hygiene
- `main.js` runs two unconditional `setInterval`s (5 s UI refresh, 30 s save) forever.
- Challenge timer is managed both in `event-handlers.js` (local `timerInterval`) and `game-state.js` (`_challengeTimerInterval`), with the stuck-state patch in `updateUI` (`Fixing stuck challenge mode state`) papering over lifecycle confusion.

### TD-17 Vim fidelity gaps in taught commands
Within the subset the game teaches: `b` only understands spaces (punctuation breaks it), `w` uses `\s\S` (skips punctuation semantics), `cw` deletes to whitespace rather than word end, `i` doesn't push undo while `a`/`o`/`O` do, insert-mode Enter doesn't split lines, `p` with a count pastes N copies in reverse order (prepending at the same row). Fine for v1; must be right (and tested) in the pure core.

## ⚪ Polish

### TD-18 SEO/meta absent
No meta description, canonical, Open Graph/Twitter cards, favicon `<link>`, robots.txt, sitemap, or structured data. Title is "VIM Master Game". Full plan in SEO.md — these are cheap, high-value, zero-risk additions.

### TD-19 Accessibility
No ARIA roles/labels, modals lack focus traps, color-only mode indication, hidden-textarea focus model undiscoverable to screen readers, no `prefers-reduced-motion` handling for confetti/particles.

### TD-20 `profile.html` duplicates head/styles inline
~180 lines of page-specific CSS inline in `<style>`; extract to shared stylesheet during the Vite step.

## Suggested burn-down order

1. TD-1..TD-4, TD-6 (bug fixes, individually shippable)
2. TD-11 (log strip) + TD-18 (meta tags) — trivial wins
3. TD-9 → TD-10 (tooling, then Tailwind build)
4. TD-7 + TD-8 via the content extraction (ContentSystem.md)
5. TD-13 + TD-14 + TD-17 via the pure-core refactor (GameEngine.md)
6. TD-12, TD-15, TD-16, TD-19, TD-20 opportunistically alongside
