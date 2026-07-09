# Changelog

All notable changes to VIMMaster are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versioning: semver, starting with the first tagged release.

## [v3.0.0] - Community Alpha

### Added
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

### Fixed
- **Level start positions now apply.** `loadLevel()` discarded the result of each level's `setup()`, so every level started at `{0,0}` despite its configuration. Lessons (game levels and cheat-mode practice) now initialize through a single pipeline ([docs/architecture/level-lifecycle.md](docs/architecture/level-lifecycle.md)) with a consumption invariant: every lesson property must be consumed exactly once during initialization — unconsumed or malformed configuration is reported immediately instead of silently ignored ([ADR-0005](docs/adr/0005-lesson-initialization-pipeline.md)).
- **Saves are no longer destroyed after finishing the game** ([PM-0001](docs/postmortems/PM-0001-save-corruption.md)). The progress validator hardcoded a 15-level range while the game has 16 levels; reaching the final level made the save "invalid", and the loader deleted it on the next visit. All level counts are now derived from `levels.length`.
- **Invalid saves are repaired, never deleted.** The load path is now: load → validate → repair → otherwise keep the original, write a backup (`vimMasterProgressBackup`), and notify the player. The age-based save rejection (saves older than 1 year were deleted) is removed.
- **Saved level is actually resumed.** Loading previously applied the saved level to state but then always started the session at level 1.
- "Clear Progress" (user-initiated) now backs up the save before clearing.
- The "16 Progressive Levels" text on the page is now computed from the level data.
