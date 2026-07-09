# Lessons

How lessons work today, how to add one right now, and where lesson design is headed.

## 1. How lessons work today

A lesson ("level") is an object in the `levels` array in [`js/levels.js`](../js/levels.js):

```js
{
    name: "Delete Basics",
    instructions: "Use dd to delete the full middle line. …",
    initialContent: [
        "Keep this line.",
        "Delete this entire line.",
        "Fix this mistake here."
    ],
    targetContent: [                 // ← the win condition
        "Keep this line.",
        "Fix this here."
    ],
    setup: (gameState) => { gameState.cursor = { row: 0, col: 0 }; }
}
```

### Win-condition types (exactly one per level)

| Field | Meaning | Checked in |
|---|---|---|
| `target: {row, col}` | cursor reaches this position | `event-handlers.js#checkWinCondition` |
| `targetText: {line, text}` | line `line` equals `text` (and mode is NORMAL) | same |
| `targetContent: [lines]` | entire buffer equals (trailing whitespace/blank lines ignored) | same |
| `exCommands: ["q","wq"]` | player executed one of these `:` commands | same |

### Special cases you must know about (current caveats)

- **Search levels** (`Search Forward (/)`, `Search Backward (?)`, `Search Navigation (n/N)`) are matched **by name** in `checkWinCondition` and additionally require the right search direction, the exact query (`target`/`alpha`/`foo`), and a minimum number of `n`/`N` presses. Renaming these levels breaks them.
- **`Undo / Redo`** is matched by name in `vim-commands.js` and requires the undo→redo sequence via `level12Undo`/`level12RedoAfterUndo` flags.
- **`setup()` currently doesn't work** — it receives a copy of the cursor and its changes are discarded (TechnicalDebt.md TD-2). Until fixed, every level effectively starts at `{0,0}`. Design lessons accordingly or fix TD-2 first.
- Adding/removing a level changes `levels.length`; the progress validator hardcodes 15/14 (TD-1) and must be updated — another reason these numbers must be derived, not hardcoded.

There is a **second, parallel lesson set**: `vimLessons` in `js/cheat-mode.js` powers the "Practice" buttons in Cheat Mode with the same shape (plus working `setup`). It is a drifted near-copy of the levels — treat any content change as needing both places checked until the content system unifies them.

### Adding a lesson today (interim recipe)

1. Append an object to the `levels` array with `name`, `instructions`, `initialContent`, and exactly one win-condition field.
2. Prefer `targetContent`/`targetText`/`target` — avoid anything needing new engine flags.
3. Verify coordinates are 0-based and inside the buffer (`target.col` counts characters, not display width).
4. Update the hardcoded totals in `progress-system.js` (until TD-1 is fixed) and the "16 Progressive Levels" copy in `index.html`/README.
5. Play it end-to-end, including winning it, and confirm the modal and next-level flow.

## 2. Where lessons are headed

The target format is one JSON file per lesson under `/content/lessons/<track>/` with declarative goals, a machine-checkable `solution`, `par` keystrokes, and hints — full schema in [ContentSystem.md](ContentSystem.md). CI replays the solution so a merged lesson is a provably solvable lesson.

## 3. Lesson design guidelines (apply to both formats)

**One concept per lesson.** Teach `dd` or teach `dw` — not both — then add a "combo" lesson afterwards that mixes them. (Today's "Delete Basics" teaches `dd`+`dw`+`x` at once; split candidates.)

**Show, then remove scaffolding.** First lesson of a concept names the keys in the buffer text itself; later lessons stop mentioning keys and only state the outcome ("make the buffer look like this").

**Buffer text is part of the lesson.** Use it for flavor and context, keep lines under ~60 chars (mobile), and never make the target character ambiguous (one `$` in the buffer, not three).

**Win on outcomes, not keystrokes** — already the project's stated philosophy. The validator vocabulary exists so "used search, not 40 presses of `l`" can be expressed declaratively when the method *is* the point.

**Difficulty ramp per track:** introduce → drill (2–3 quick variants) → combine with earlier concepts → challenge (timed, in Challenge Mode).

**Par values** should be the true optimum; stars/scoring compare player keystrokes against par (Codewars/LeetCode-style efficiency ranking comes free once the engine counts keystrokes).

## 4. Planned lesson tracks (content roadmap)

| Track | Concepts | Status |
|---|---|---|
| Survival | `:q` `:wq` `:q!` modes, Esc | partial (level 1) |
| Movement | `hjkl`, `wbe`, `0 $ ^`, `gg G {n}G`, `f t ; ,` | partial |
| Editing | `x r`, `i a I A`, `o O`, `dd dw D`, `cw cc C`, `yy p P` | partial |
| Counts & repeat | counts, `.` repeat | partial (counts only) |
| Search | `/ ? n N *` | done (needs `*`) |
| Text objects | `iw aw i" i( ip` + operators | missing (high value!) |
| Visual mode | `v V Ctrl-v`, operators on selections | missing |
| Ex essentials | `:%s`, ranges, `:g` | missing |
| Registers & macros | named registers, `q` macros | missing (advanced track) |

Text objects and visual mode are the biggest gaps between "toy" and "actually teaches Vim" — prioritize them once the engine grammar refactor lands (GameEngine.md), since both need the `operator + motion/textobject` parser.
