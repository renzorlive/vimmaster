# VIMMaster Architecture

This document describes the architecture as it exists today, the target architecture, and the migration path between them.

## 1. Current State (as of 2026-07)

### Stack

| Layer | Technology |
|---|---|
| Markup | Two static pages: `index.html` (game), `profile.html` (profile/sharing) |
| Styling | Tailwind via CDN script + `css/main.css` |
| Logic | 11 vanilla-JS ES modules under `js/`, loaded with `<script type="module">` |
| Build | None — files are served as-is |
| Deploy | GitHub Pages + Cloudflare (`wrangler.toml`) |
| Persistence | `localStorage` + Base64 export/import codes |
| Tests / CI / Lint | None |

### Module map

```
index.html
└── js/main.js            entry point: init, DOM wiring, auto-save loop
    ├── game-state.js     module-singleton state (~30 vars, ~70 getters/setters)
    ├── levels.js         16 hardcoded level definitions + loadLevel()
    ├── vim-commands.js   keydown → state mutation (NORMAL/INSERT/SEARCH handlers)
    ├── event-handlers.js checkWinCondition, badges, challenge orchestration, updateUI
    ├── ui-components.js  DOM rendering (editor, status bar, modals, badges)
    ├── challenges.js     3 hardcoded timed challenges
    ├── cheat-mode.js     command reference panel + 16 hardcoded practice lessons
    └── progress-system.js localStorage save/load, export/import codes

profile.html
└── js/profile-page.js
    └── sharing-system.js  canvas achievement cards, social share links
```

### How the pieces work

**State management.** `game-state.js` holds all mutable state in private module variables and exposes them exclusively through getter/setter functions. Getters return defensive copies. There is no store, no events, no subscriptions — modules call setters and then someone calls `updateUI()` to re-render everything.

**The editor.** There is no real text-editing widget. A visually-hidden `<textarea>` (`#vim-editor-input`) captures keyboard focus; its `keydown` handler dispatches to `handleNormalMode` / `handleInsertMode` / `handleSearchMode` in `vim-commands.js`. The visible editor (`#vim-editor-display`) is rebuilt from scratch (`innerHTML`) after every keystroke by `renderEditor()`.

**Command parsing.** Single keys are handled by `if (key === ...)` chains. Multi-key commands (`dd`, `dw`, `gg`, `cw`, `yy`) are detected by appending each key to a `commandHistory` string and checking `endsWith('dd')` etc. Counts (`3w`) accumulate in a `countBuffer` string. Ex commands (`:q`) are parsed from `commandHistory` on Enter.

**Lessons/levels.** `levels.js` exports a hardcoded array. Each level has `name`, `instructions`, `initialContent`, an optional `setup()`, and one of four win-condition shapes:

- `target: {row, col}` — cursor position
- `targetText: {line, text}` — one line equals a string
- `targetContent: [lines]` — whole buffer equals (whitespace-tolerant)
- `exCommands: [...]` — an ex command was executed

Win checking lives in `checkWinCondition()` (event-handlers.js). Search levels and the undo/redo level additionally have behavior requirements enforced by **level-name string matching** and dedicated global flags (`level12Undo`, `usedSearchInLevel`, `navCountSinceSearch`).

**Routing.** None. Two pages, plain links.

**Rendering flow per keystroke:**

```
keydown → handleXxxMode() mutates state
        → updateUI() → renderEditor / updateStatusBar / updateInstructions
                        / level buttons / badges (full re-render)
        → checkWinCondition() or checkPracticeCompletion()
```

### Known defects (see TechnicalDebt.md for the full list)

1. `progress-system.js` validates `currentLevel <= 14` and hardcodes `totalLevels: 15`, but there are 16 levels — saved progress from the final level is rejected **and deleted** on reload.
2. `loadLevel()` passes a *copy* of cursor state to `level.setup()`, so per-level start positions are silently ignored; every level starts at `{0,0}`.
3. `setupAutoSave()` wraps `window.checkWinCondition`, which is never set on `window` — the on-completion auto-save never fires.
4. `challenges.js#checkChallengeTask/endChallenge` are dead code; scoring was re-implemented (with different values) in `checkWinCondition`.
5. The cursor-bounds clamp at the end of `handleNormalMode` reads a stale cursor snapshot.

## 2. Target Architecture

The long-term vision: **a data-driven learning platform** where the engine knows nothing about specific lessons, and all content (lessons, challenges, achievements, command reference, translations) lives in declarative files contributors can edit without touching code.

### Guiding principles

- **Engine/content separation.** The Vim emulator and game engine consume content descriptors; nothing in engine code references a specific lesson.
- **Pure core, thin shell.** The Vim emulator is a pure function: `(EditorState, KeyEvent) → EditorState`. All DOM work lives at the edge. This is what makes the core unit-testable.
- **Stay fast.** Static-first delivery, no server required to play, offline-capable (PWA). Any framework choice must keep first-load small.
- **Progressive migration.** Never a big-bang rewrite; each step ships a working game.

### Target layout (feature-based)

```
/content                    ← contributor-facing, no code
  /lessons/<track>/<id>.json
  /challenges/<id>.json
  /achievements/achievements.json
  /commands/commands.json   ← cheat-sheet + command metadata
  /i18n/<locale>.json
/src
  /core                     ← pure TypeScript, zero DOM
    /vim                    editor state, motions, operators, registers, modes
    /engine                 lesson runner, validators, scoring, achievements
    /content               schema types, loaders, zod validation
  /features
    /lesson-player          UI for playing a lesson
    /challenge-mode
    /cheat-sheet
    /profile
    /progress               persistence, export/import
  /ui                       shared components (editor view, modal, toast…)
  /app                      entry, routing, layout
/tests
  /core                     unit tests (vitest)
  /content                  schema validation of all content files
  /e2e                      playwright smoke tests
/docs
/.github                    templates, workflows, labels
```

### Technology decisions (compared)

**Build tooling — Vite + TypeScript.** Recommended unconditionally. It preserves the instant-static deployment model (output is still plain static files), adds type safety, dead-code elimination, minification, and removes the Tailwind CDN script. Cost: contributors need `npm install`. This is the single highest-leverage change.

**UI framework — three options considered:**

| Option | Pros | Cons |
|---|---|---|
| Stay vanilla + TS | zero deps, smallest bundle | hand-rolled rendering/diffing grows unmaintainable as UI grows (profile, settings, i18n, lesson browser) |
| **Preact + TS (recommended)** | React model & ecosystem, ~4 KB, drop-in `react` alias, easy contributor onboarding | slightly smaller ecosystem than React proper |
| React 19 | largest contributor familiarity | ~45 KB baseline for a game whose core is a `<pre>` block |

Recommendation: **Preact with the React compat alias** — contributors write standard React/TSX, the bundle stays tiny, and a later switch to React is a one-line alias change if ever needed. The Vim core itself stays framework-free (pure TS), so this choice only affects the shell.

**Styling — Tailwind as a build-time dependency** (replaces the CDN script), keeping current visual design.

**State — keep it simple.** The pure core owns editor state. App-level state (progress, settings) fits in one small store (zustand or a hand-rolled `useSyncExternalStore` store). No Redux.

### The pure Vim core (see GameEngine.md for detail)

```ts
interface EditorState {
  buffer: string[];
  cursor: { row: number; col: number };
  mode: 'normal' | 'insert' | 'visual' | 'command' | 'search';
  pending: PendingInput;        // operator, count, register…
  registers: Record<string, Register>;
  undo: UndoHistory;
  search: SearchState;
  lastEvent: EngineEvent | null; // what just happened, for validators
}

function dispatch(state: EditorState, key: KeyInput): EditorState;
```

Deterministic, side-effect-free, snapshot-testable. Lesson validators consume `EditorState` + an event log instead of poking at global flags.

## 3. Migration path (safe, incremental)

Each phase leaves the game fully working. Details and sequencing in Roadmap.md.

1. **Stabilize** — fix known bugs, strip debug logging, add the missing meta/SEO tags. Pure wins, no structural change.
2. **Tooling** — add `package.json`, Vite, ESLint/Prettier, vitest; move `js/` under `src/` unchanged; CI runs build + lint + tests. Output identical site.
3. **Extract content** — move levels/challenges/achievements/commands into `/content` JSON with a schema + loader; delete the duplicated cheat-mode lesson copies; remove level-name checks from the engine by introducing declarative validator types.
4. **Type & purify the core** — convert `vim-commands.js`/`game-state.js` into the pure TS core with a proper key/operator/motion parser; grow unit-test coverage here first.
5. **Shell migration** — rebuild UI surfaces as Preact components feature by feature (editor view → lesson player → cheat sheet → profile).
6. **Platform features** — lesson tracks, i18n, PWA/offline, leaderboards-without-backend, etc. (Roadmap.md).

## 4. Non-goals

- No backend/accounts in the foreseeable future. localStorage + export codes preserve the privacy-first model.
- No attempt at full Vim fidelity (that's Neovim's job). We emulate the subset lessons teach, but that subset must behave *correctly*.
