# ADR-0005: Single lesson-initialization pipeline with a consumption invariant

- **Status:** Accepted
- **Date:** 2026-07-09
- **Origin:** TD-2 — lesson `setup()` results were silently discarded; every level started at `{0,0}` regardless of its configuration

## Context

Lesson initialization existed twice: `levels.js#loadLevel` (broken — it passed copies to `setup()` and discarded the result) and `cheat-mode.js#startCheatPractice` (working — it wrote the result back). The engine happily accepted configuration it then ignored; the bug was invisible because nothing checked that lesson data was actually used. With the JSON content system coming (ADR-0003), "engine silently ignores a content field" would become a recurring class of contributor-facing bug: a new field in a lesson file that does nothing, with no error anywhere.

## Decision

1. **One initializer.** All lesson-shaped content (game levels, cheat-mode practice, future JSON lessons) is initialized by a single function, `initializeLessonState(lesson)` in `levels.js`. Parallel init code paths are not accepted in review.
2. **The consumption invariant:** *every lesson property must be consumed exactly once during initialization.* The initializer reads properties through a tracking reader and reports any property that exists on the lesson but was never read, immediately. Exactly one win-condition property is required and registered as the objective.
3. **Corrective failure policy:** invalid configuration is repaired-and-reported where safe (out-of-bounds cursor → clamped + warning) and refused where not (missing/empty buffer → lesson does not load). Configuration is never silently ignored and state is never silently corrupted.
4. **Documented pipeline:** the load → validate → initialize → position → render → start sequence is specified in [docs/architecture/level-lifecycle.md](../architecture/level-lifecycle.md), which is the single source of truth.
5. **Future direction (recorded now, implemented in Phase 1):** initialization becomes a pure function

   ```ts
   initializeLesson(level): { buffer, cursor, objectives, metadata, state }
   ```

   returning a complete state object consumed by the pure engine core, replacing the current mutate-global-state approach and the mutable `setup(gameState)` convention. `validateLessonSchema()` (zod, CI-run) replaces the runtime shape guards when the Phase 2 content system lands.

## Alternatives considered

- **Just write the setup result back** (minimal bug fix) — repairs the symptom, leaves two init paths and no protection against the next ignored field. Rejected: the cause is architectural.
- **Throw on unconsumed properties** — strictest enforcement, but a typo in one lesson would brick the game for players. Warn loudly at runtime now; *throw in CI* once schema validation exists (best of both).
- **Freeze/proxy the lesson object to detect reads engine-wide** — heavier machinery for the same guarantee; the tracking reader is ~10 lines and lives where the invariant is defined.

## Trade-offs / consequences

- New lesson fields require touching the initializer (adding them to the known-properties consumption) — intentional friction: a field's meaning must be defined before it can exist.
- Win-condition properties are *registered* at init and *evaluated* at play time; the invariant covers presence/registration, not evaluation correctness — that's what solution-replay CI (ADR-0003) is for.
- The `setup()` mutable-object convention survives until Phase 1 solely for compatibility; the pure `initializeLesson` shape above is the committed target.
