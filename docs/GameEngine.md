# Game Engine

How the editor/engine works today, and the design for the engine VIMMaster grows into.

## 1. Current engine

### Input pipeline

```
hidden <textarea id="vim-editor-input"> keydown
  → main.js keydown listener (modal/overlay guards)
    → searchMode?  handleSearchMode(e)
    → NORMAL?      handleNormalMode(e)
    → else         handleInsertMode(e)
  → updateUI()                      (full re-render)
  → checkWinCondition() | checkPracticeCompletion()
```

- Focus is maintained by clicking the editor container; the textarea is transparent and absolutely positioned over the editor.
- `Ctrl+[` is aliased to Escape (`game-state.js#isEscapeKey`).

### Command recognition (normal mode)

`vim-commands.js#handleNormalMode` — one function, ~380 lines:

- **Counts**: digit keys accumulate in `countBuffer` (string); consumed by whichever command runs next; cleared on any non-digit.
- **Single-key commands**: chained `if (key === 'h') …` blocks. Not `else if` — several can interact in one keystroke.
- **Multi-key commands**: every printable key is appended to a `commandHistory` string; the handler checks `commandHistory.endsWith('dd' | 'dw' | 'gg' | 'cw' | 'yy')`. Requires manual guards (e.g. `w` movement is suppressed when history ends with `dw`/`cw`).
- **Pending states**: `replacePending` flag for `r{char}`; `searchMode` flag for `/`/`?` input; ex commands parsed from the last `:` in `commandHistory` when Enter is pressed.
- **Registers**: a single `yankedLine` (line-wise only).
- **Undo**: explicit `pushUndo()` calls sprinkled before mutating commands (inconsistently — `a`/`o`/`O` push, `i` doesn't); stack of full state snapshots, capped at 200.

### Supported command set

Motions `h j k l w b e 0 $ gg G {n}G` · operators/edits `x dd dw cw D r yy p i a o O` · counts on most of these · `u` / `Ctrl+r` · search `/ ? n N` with highlighting · ex `:q :wq` (recognized, not executed).

### Rendering

`ui-components.js#renderEditor` rebuilds the whole editor as an HTML string per keystroke: one `div` per line, one `span` per character for cursor/search-match highlighting. At lesson sizes (≤10 lines) this is fine; the real cost today is the per-character `getSearchMatches()` defensive copy and the debug logging around it.

### Weaknesses (details in TechnicalDebt.md)

- String-suffix parsing is fragile and can't scale to operators+motions (`d3w`, `c$`, `dap`…).
- State is global; the engine can't run headless, so nothing is unit-testable.
- Win conditions partially live inside the engine keyed on level names.
- Vim fidelity gaps in the taught subset (word motion semantics, undo granularity, insert-mode Enter).

## 2. Target engine: a pure Vim core

### Shape

```ts
// zero DOM, zero globals — a reducer
dispatch(state: EditorState, input: KeyInput): DispatchResult

interface DispatchResult {
  state: EditorState;
  events: EngineEvent[];   // what happened, for validators/telemetry
}

interface EditorState {
  buffer: string[];
  cursor: Position;
  mode: Mode;                       // normal | insert | visual | search | command
  pending: {                        // the parser state machine
    count1?: number;                // count before operator
    operator?: Operator;            // d, c, y, g-prefix, r…
    count2?: number;                // count after operator
    awaiting?: 'char' | 'motion';   // r{char}, f{char}, operator{motion}
  };
  registers: { unnamed: Register; [name: string]: Register };
  undo: { stack: Snapshot[]; redo: Snapshot[] };
  search: { query: string | null; direction: 1 | -1; matches: Match[]; index: number };
  commandLine: string | null;       // ':' / '/' / '?' input buffer
}
```

### Key/command grammar

Replace suffix-matching with the actual Vim grammar as a small state machine:

```
command   := [count1] (operator [count2] motion | operator operator | simple)
operator  := d | c | y | > | < | g~ …
motion    := h j k l w b e W B E 0 ^ $ gg G f{c} t{c} / ? n N …
simple    := i a A I o O x X r{c} p P u <C-r> D C s S ~ .
```

This makes `d3w`, `2dd`, `c$`, `3fx` fall out of the grammar instead of being special cases, and doubles (`dd`, `yy`, `cc`) are just `operator operator`.

### Engine events → validation

Every dispatch emits typed events, e.g.:

```ts
{ type: 'motion',   name: 'w', count: 3 }
{ type: 'delete',   register: 'unnamed', linewise: true }
{ type: 'search',   direction: 'forward', query: 'target' }
{ type: 'searchNav', key: 'n' }
{ type: 'undo' } | { type: 'redo' }
{ type: 'ex',      command: 'wq' }
{ type: 'modeChange', from: 'normal', to: 'insert' }
```

Lesson validators (ContentSystem.md) subscribe to the event log plus final state. This deletes every level-name check and per-level flag (`level12Undo` etc.) from the engine.

### Correctness strategy

- **Unit tests** on `dispatch`: table-driven `keys → expected buffer/cursor` cases, e.g. `["one two", "dw"] → "two"`. Hundreds of these are cheap once the core is pure.
- **Fidelity oracle (optional, CI-only)**: a script replays the same key sequences through headless Neovim (`nvim --headless -es`) and diffs buffers — catching emulation drift for the taught subset without shipping any of it to the client.
- **Golden lesson tests**: every lesson in `/content` ships a `solution` key sequence; CI replays it through the engine and asserts the lesson validates. This simultaneously tests engine, content, and validators, and guarantees no lesson is unsolvable.

### Rendering contract

The UI layer receives `EditorState` and renders. Optimizations when needed (not before):

- render line-diffing (only re-render changed rows),
- one span per *style run* rather than per character,
- highlight decorations computed once per render, not per character.

### What stays out of scope

Full Vim (macros beyond `.`-repeat, splits, plugins, regex search flavors) is a non-goal. The engine implements exactly what the content teaches — but implements it correctly. New commands are added when a lesson needs them, together with tests.

## 3. Game layer on top of the core

```
LessonRunner
  load(lesson)       → initial EditorState from content file
  onDispatch(result) → feed events to validators, detect completion/mistakes
  scoring            → keystroke count vs par, time, hints used
ChallengeRunner      → LessonRunner + timer + task sequence + scoring
AchievementEngine    → declarative rules over the same event stream
```

All three consume content descriptors and the engine event stream only. That's the whole trick: **one event stream, many consumers** — validation, scoring, achievements, analytics, and (later) replay/ghost-cursor features like TypeRacer.
