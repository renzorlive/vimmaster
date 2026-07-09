# Level / Lesson Lifecycle

The single source of truth for how a lesson goes from a definition object to a playable state. Any code that initializes a lesson — `loadLevel()` for game levels, cheat-mode practice — MUST go through this pipeline (implemented in `js/levels.js#initializeLessonState`). There is exactly one initializer; parallel implementations are how [TD-2] happened.

## The pipeline

```
lesson loads            the definition object is selected (levels array,
                        cheat-mode catalog, later: /content JSON loader)
        ↓
lesson validates        shape guards: buffer exists and is a non-empty array;
                        exactly ONE win-condition property is present
        ↓
state initializes       level-scoped state is reset (search, command history,
                        flags); buffer is written to game state
        ↓
cursor created          defaults: cursor {row:0, col:0}, mode NORMAL,
                        empty command history
        ↓
cursor positioned       the lesson's setup() customizes the defaults;
                        the result is APPLIED to game state and the cursor
                        is clamped into the buffer (a bad position is
                        corrected and reported, never silently accepted)
        ↓
buffer rendered         the caller triggers updateUI() → renderEditor()
        ↓
game starts             input handling resumes; win conditions are
                        checked after each keystroke
```

## The consumption invariant

> **Every lesson property must be consumed exactly once during initialization.**

Initialization reads properties through a tracking reader. When it finishes, any property present on the lesson object that was never read is reported immediately (console warning today; CI schema failure once test infra lands). This is the structural fix for the class of bug behind TD-2: configuration data that the engine silently ignores.

Consequences:

- Adding a new field to a lesson without teaching the initializer about it produces an immediate, visible complaint — not a silently dead field.
- A typo (`taget` instead of `target`) is caught the moment the lesson loads.
- Zero or multiple win-condition properties (`target`, `targetText`, `targetContent`, `exCommands`) are reported — exactly one is required.

## Known lesson properties

| Property | Consumed at stage | Purpose |
|---|---|---|
| `name` | metadata | display + (temporarily) engine special-cases, see TD-7 |
| `instructions` | metadata | player-facing instructions |
| `initialContent` | buffer | starting buffer, non-empty `string[]` |
| `setup(init)` | cursor positioned | customizes `{cursor, mode, commandHistory}` defaults |
| `target` \| `targetText` \| `targetContent` \| `exCommands` | validates (registered as the objective) | win condition — exactly one |

## Failure policy

Initialization is **corrective, not destructive** (in the spirit of PROJECT_PRINCIPLES.md #8): a lesson with a bad start cursor is clamped and reported; a lesson with a malformed buffer refuses to load (returns `false`) rather than corrupting state. Warnings are loud and specific — they name the lesson and the property.

## Future work (tracked, not implemented)

- **`validateLessonSchema()`** — a real schema validator (zod, Phase 2 content system) run in CI over every content file: cursor within buffer, buffer shape, objective validity, solution replay. The inline guards in `initializeLessonState` are its interim, runtime-side subset. See the TODO in `js/levels.js` and [docs/ContentSystem.md](../ContentSystem.md).
- **Pure `initializeLesson(level)`** — long-term, initialization becomes a pure function returning a complete state object `{buffer, cursor, objectives, metadata, state}` consumed by the engine, instead of mutating global game state. Recorded in [ADR-0005](../adr/0005-lesson-initialization-pipeline.md); lands with the pure-core refactor (Phase 1).

[TD-2]: ../TechnicalDebt.md
