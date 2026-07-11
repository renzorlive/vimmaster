# Changelog

All notable changes to VIMMaster are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versioning: semver, starting with the first tagged release.

## [Unreleased]

### Added
- **Two-tier content validator** (issue #26): per-lesson schema rules now also check `initialCursor` within buffer bounds and validate every `solution` key token; a new repository-wide semantic pass catches what per-file validation can't — duplicate lesson IDs (S001), dangling `prerequisites` references (S002), duplicate curriculum order (S003), and index/content drift in both directions (S004). Every violation is reported with `file path → schema location`, all in one run. 14 new tests cover every violation class.

### Fixed
- **Practice lessons are validated again**: the contract runner iterated the `vimLessons` Map with `Object.entries()` (always empty), silently skipping all 17 practice lessons — the suite now checks all 35 lessons instead of 18. Same Map-migration bug family as the dead Practice buttons fixed in v3.0.0.

## [3.0.0] - 2026-07-10 — Community Alpha

> First tagged release. Everything below shipped together as the Community Alpha; nothing earlier was ever tagged.

### Fixed (hygiene — TD-11 + practice mode)
- **Cheat Mode practice buttons work again.** The content extraction turned `vimLessons` into a `Map`, but the lookup kept using bracket access — property access on a Map reads nothing, so every Practice button silently did nothing. Fixed with `Map.get` via a named `getPracticeLesson()`; regression-tested end-to-end (every catalog entry must resolve, and starting practice must load the lesson buffer).
- **Zero console noise in production** (TD-11): ~110 debug `console.log`s deleted (several dumped full buffer state per keystroke); meaningful warnings/errors now flow through the structured logger (`js/logger.js`) with categories (`lesson`, `progress`, `storage`, `ui`) and debug filtering via `localStorage.vimMasterDebug`.
- **Lint is clean and stays clean:** 195 warnings burned down to **0**; ~170 unused imports/variables removed; `no-console`, `no-unused-vars`, `no-empty`, and `no-debugger` are now ESLint **errors** (with `js/logger.js`, `scripts/`, and `tests/` exempted from `no-console`), enforced by CI on every PR.

### Fixed (PR26 — completion auto-save & challenge scoring)
- **Progress is saved the moment a level is won** (TD-3). The intended on-completion save was a dead `window.checkWinCondition` wrapper that never ran; wins relied on the 30-second interval save and could be lost by closing the tab. The save now lives inside the win path itself. Regression-tested.
- **Challenge task scoring has a single source of truth** (TD-6): dead `endChallenge`/`checkChallengeTask` exports (carrying a divergent 100-points formula players never experienced) are deleted; the live formula (10 + 1 point per 10s remaining) lives only in `challenges.js#calculateTaskPoints`, unit-tested, with dead imports cleaned from three modules.

### Fixed (PR25 — stale-state normal mode)
- **Numeric counts now work as promised.** `2x` deleted a single character (counted edits looped over a stale buffer snapshot — TD-4b), and `2dd`/`2dw` never worked at all (the operator's first key wiped the pending count). Counts survive multi-key commands and each loop iteration reads fresh state. 8 new regression tests.
- **`0` no longer silently fails after `j` onto a shorter line** (TD-4): the end-of-handler bounds clamp evaluated the cursor captured at handler entry and overwrote valid motions; it now clamps fresh state, and `j` onto a shorter line clamps the column into the line.
- The Golden solution for `lesson-practice-delete-character-practice` no longer works around these engine bugs (uses counted `x` and natural `j`-then-`0` order).

### Added
- **Every lesson is now provably solvable (PR24):** all 35 lessons carry a `solution` key sequence; the Golden Suite auto-verifies every lesson with a solution (35/35 passing), and contract rule L007 is promoted from warning to **error** — a lesson without a working solution cannot be merged.
- Lesson start positions restored as declarative `initialCursor` in every lesson JSON (they were lost in the content extraction; the engine ignored the field entirely, so all lessons started at `{0,0}` — caught by the ADR-0005 consumption invariant).
- The lesson initializer now consumes the full content schema (`initialCursor` applied; `id`/`version`/`metadata`/`focusCommand`/`solution` acknowledged), eliminating per-load invariant warnings.

### Fixed (content — unwinnable lessons found by the Golden Suite)
- `lesson-practice-insert-mode-practice` was unwinnable (target text omitted the line's prefix — inherited from the original cheat-mode data); target, start cursor, and solution corrected.
- `lesson-practice-delete-character-practice` had an unachievable target buffer; replaced with an x-achievable target.
- `lesson-practice-backward-search-practice` target was one column past the search match; aligned to the match start.
- Two engine defects discovered by the Golden Suite are documented as TD-4 (confirmed: `0` silently fails when the cursor is past EOL after `j`) and TD-4b (`2x` deletes one char — counted edits loop over a stale buffer copy) in docs/TechnicalDebt.md.

### Added (content & platform architecture)
- JSON lesson architecture: all levels are now loaded from external JSON files in `content/lessons/`.
- Contract Suite: ensures valid structure for all community lessons.
- Golden Suite: automated regression testing against actual engine logic.
- Regression Suite: automated testing for previously resolved issues.
- Content Provider: decoupling engine from lesson generation logic.
- Community lesson pipeline: isolated workflow allowing non-programmers to contribute to lessons.
- XP system: dynamically generated based on level difficulty metadata (beginner, intermediate, advanced).
- Combo system: tracks back-to-back correct executions.
- Progressive onboarding: hides advanced UI until appropriate levels are reached.
- `PROJECT_PRINCIPLES.md` principle #8: *User data is never destroyed automatically* (absolute).
- `docs/architecture/constants.md`: derivable constants must be derived — policy + review checklist.
- `docs/postmortems/` with PM-0001.
- Governance & contributor infrastructure: VISION, PROJECT_PRINCIPLES, NON_GOALS, DECISIONS, PROJECT_STATUS, ROADMAP, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, GitHub issue/PR/RFC templates, ADR system, full `/docs` architecture suite, README banner.

### Changed
- UI simplification: stripped non-essential visual elements, heavily increasing focus on the editor (`min-h-[320px]`).
- Focus command visualization: the "Level Complete" modal has been replaced with a dopamine-inducing card presenting the specific focused command.
- Lesson metadata: added metadata schema for descriptions, authors, tags, and focus commands.
- Progress persistence: saves XP, Combos, and Challenge Points in a backwards-compatible manner.

### Fixed (initialization & save integrity)
- **Level start positions now apply.** `loadLevel()` discarded the result of each level's `setup()`, so every level started at `{0,0}` despite its configuration. Lessons (game levels and cheat-mode practice) now initialize through a single pipeline ([docs/architecture/level-lifecycle.md](docs/architecture/level-lifecycle.md)) with a consumption invariant: every lesson property must be consumed exactly once during initialization — unconsumed or malformed configuration is reported immediately instead of silently ignored ([ADR-0005](docs/adr/0005-lesson-initialization-pipeline.md)).
- **Saves are no longer destroyed after finishing the game** ([PM-0001](docs/postmortems/PM-0001-save-corruption.md)). The progress validator hardcoded a 15-level range while the game has 16 levels; reaching the final level made the save "invalid", and the loader deleted it on the next visit. All level counts are now derived from `levels.length`.
- **Invalid saves are repaired, never deleted.** The load path is now: load → validate → repair → otherwise keep the original, write a backup (`vimMasterProgressBackup`), and notify the player. The age-based save rejection (saves older than 1 year were deleted) is removed.
- **Saved level is actually resumed.** Loading previously applied the saved level to state but then always started the session at level 1.
- "Clear Progress" (user-initiated) now backs up the save before clearing.
- The "16 Progressive Levels" text on the page is now computed from the level data.
