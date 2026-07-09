# Content System

Design for the data-driven content layer: lessons, challenges, achievements, tutorials, command reference, and translations — all editable without touching application code.

## Goals

- A first-time contributor can add a lesson by creating **one JSON file** and opening a PR.
- CI validates every content file against a schema and replays its solution through the engine — a green check means the lesson works.
- The engine has **zero** knowledge of any specific piece of content (no level-name checks, no per-level flags).
- The same schema powers the game, the cheat-sheet practice mode, and future features (daily challenge, placement test).

## Directory layout

```
/content
  /lessons
    /basics            ← track = directory
      track.json       ← track metadata + lesson ordering
      exiting-vim.json
      hjkl-movement.json
      …
    /editing
    /search
  /challenges
    speed-navigation.json
    quick-deletion.json
  /achievements
    achievements.json
  /commands
    commands.json      ← command reference (cheat sheet) + metadata
  /i18n
    en.json            ← UI strings
    de.json
    /lessons           ← per-locale lesson overrides (optional)
```

## Lesson schema

```jsonc
// content/lessons/basics/hjkl-movement.json
{
  "id": "hjkl-movement",            // stable, kebab-case, unique
  "version": 1,
  "title": "Basic Movement",
  "instructions": "Use h, j, k, l to move the cursor. Reach the target character '$'.",
  "difficulty": "beginner",          // beginner | intermediate | advanced
  "commands": ["h", "j", "k", "l"],  // links to /content/commands entries
  "buffer": [
    "Move with h(left), j(down), k(up), l(right).",
    "Your cursor starts here.",
    "",
    "Once you are comfortable, move to the '$'."
  ],
  "start": { "cursor": { "row": 1, "col": 5 } },
  "goal": {
    "all": [
      { "type": "cursorAt", "row": 3, "col": 39 }
    ]
  },
  "par": 12,                         // optimal keystrokes (for scoring/stars)
  "solution": ["j", "j", "3", "9", "l"],  // replayed in CI to prove solvability
  "hints": [
    "j moves down one line.",
    "A count like 39l repeats a motion."
  ]
}
```

### Goal / validator vocabulary

The `goal` block is a small composable condition language evaluated against the engine's final state **and event log** (see GameEngine.md). This replaces every hardcoded win check that exists today:

| Validator | Replaces today's… |
|---|---|
| `cursorAt {row, col}` | `level.target` |
| `lineEquals {line, text}` | `level.targetText` |
| `bufferEquals {lines, trimTrailing?: true}` | `level.targetContent` |
| `exCommand {oneOf: ["q","wq"]}` | `level.exCommands` |
| `searched {direction, query?, minNavigations?}` | level-name checks for search levels |
| `performed {event, count?}` e.g. `{event:"undo"} + {event:"redo"}` sequence | `level12Undo`/`level12RedoAfterUndo` flags |
| `sequence [validators…]` | ordered requirements ("undo, then redo") |
| combinators `all`, `any`, `not` | ad-hoc boolean logic in `checkWinCondition` |

Adding a new validator type is an engine change; *using* validators is pure content.

### Track schema

```jsonc
// content/lessons/basics/track.json
{
  "id": "basics",
  "title": "Vim Basics",
  "description": "Survive your first Vim session.",
  "order": ["exiting-vim", "hjkl-movement", "word-motion", "line-jumps"],
  "unlocks": null            // or a track id that must be completed first
}
```

Tracks give the Duolingo-style skill path without any code: the lesson browser renders whatever tracks exist.

## Challenge schema

```jsonc
// content/challenges/quick-deletion.json
{
  "id": "quick-deletion",
  "title": "Quick Deletion",
  "description": "Delete and modify text rapidly!",
  "timeLimit": 120,
  "buffer": ["delete this remove line", "delete this line too", "This is BAD text"],
  "tasks": [
    {
      "instruction": "Delete the word 'remove' using dw",
      "hint": "Position cursor on 'r' of 'remove', then dw",
      "goal": { "all": [ { "type": "lineEquals", "line": 0, "text": "delete this line" } ] }
    }
  ],
  "scoring": { "taskPoints": 100, "timeBonusPerSecond": 1 }
}
```

Identical `goal` vocabulary as lessons — one validator engine serves both. (Today's challenge validations are inline JS functions; those become data.)

## Achievement schema

```jsonc
// content/achievements/achievements.json
[
  {
    "id": "beginner",
    "title": "Beginner",
    "emoji": "🟢",
    "description": "Completed the basic movement lessons.",
    "rule": { "type": "trackCompleted", "track": "basics" }
  },
  {
    "id": "searchmaster",
    "title": "Search Master",
    "emoji": "🔎",
    "description": "Used / ? n N to search.",
    "rule": { "type": "eventCount", "event": "search", "min": 1 }
  },
  {
    "id": "speed-demon",
    "title": "Speed Demon",
    "emoji": "⚡",
    "description": "Finished a challenge with 30+ seconds left.",
    "rule": { "type": "challengeCompleted", "minTimeRemaining": 30 }
  }
]
```

Rules are declarative and evaluated by one `AchievementEngine` over the shared event stream. Today's three divergent badge maps (`ui-components.js`, `profile-page.js`, `sharing-system.js`) collapse into this file.

## Command reference schema

```jsonc
// content/commands/commands.json
[
  {
    "id": "dd",
    "keys": "dd",
    "category": "editing",
    "summary": "Delete line",
    "example": "Remove an entire line.",
    "practiceLesson": "delete-line-practice"   // links cheat sheet → lesson
  }
]
```

The cheat sheet renders from this file; "Practice" buttons launch the linked lesson through the normal lesson runner — deleting `cheat-mode.js`'s duplicated `vimLessons` object.

## Translations

- `/content/i18n/<locale>.json` — flat UI string catalog (`"play": "Spielen"`).
- Lesson localization by override file: `/content/i18n/de/lessons/hjkl-movement.json` supplies `title`, `instructions`, `hints`; `buffer` and `goal` stay canonical unless overridden. Missing keys fall back to English.

## Validation & CI (the contract that keeps quality high)

1. **Schema validation** — zod schemas in `src/core/content`; `npm run validate:content` checks every file (types, unique ids, goal validity, buffer bounds — e.g. `cursorAt` must lie inside `buffer`).
2. **Solvability replay** — CI feeds each `solution` through the pure engine and asserts the `goal` passes. A lesson that can't be beaten can't be merged.
3. **Par sanity** — warn when `solution.length` differs wildly from `par`.
4. **Link check** — `commands`, `practiceLesson`, `track` references must resolve.

## Loading strategy

- Build step bundles content into per-track JSON chunks; the app lazy-loads a track on first open (keeps first paint small as content grows).
- Content is versioned (`version` field) so future save-data migrations can adapt stored progress.

## Migration from today's hardcoded content

1. Write the schemas + loader; generate JSON from the existing `levels.js` array (16 lessons → `basics`/`editing`/`search` tracks).
2. Port the four win-condition shapes 1:1, then add `searched`/`performed`/`sequence` validators and delete the level-name checks from the engine.
3. Port the three challenges; delete their inline validation functions.
4. Port badges to `achievements.json`; delete the three duplicated maps.
5. Point the cheat sheet at `commands.json` + real lessons; delete `vimLessons`.

After step 5, adding content requires zero application code — the definition of done for the platform vision.
