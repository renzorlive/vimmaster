# ADR-0003: All content is data; the engine knows no content

- **Status:** Accepted
- **Date:** 2026-07-09

## Context

Lessons, challenges, achievements, and the command reference are currently hardcoded in JavaScript, partially duplicated (levels vs. cheat-mode lessons; three badge maps), and the engine contains level-specific logic (level-name string checks, per-level flags). Every content addition requires code changes and code review — the opposite of a contributor-friendly content platform. The mission ("The Open Source Home for Learning Vim") depends on non-programmers adding lessons and translations.

## Decision

All content — lessons, challenges, achievements, tutorials, command reference, translations — lives in declarative JSON files under `/content`, validated by schemas, with win conditions expressed in a composable validator vocabulary evaluated against the engine's event stream. The engine may gain new *validator types*; it must never reference a specific piece of content. Every lesson ships a `solution` key sequence that CI replays through the engine to prove solvability before merge.

Full schemas: docs/ContentSystem.md.

## Alternatives considered

- **Keep content in JS modules** — flexible (arbitrary validation functions) but requires JS review for every lesson, allows unbounded logic in content, and prevents no-code contribution, schema validation, and generated SEO pages.
- **Markdown + frontmatter per lesson** — friendlier to write, but goals/buffers need structure anyway; JSON with a good template + the contributor playground (load a `lesson.json` live, no PR) wins. Markdown remains an option for *tutorial prose* later.
- **CMS/database** — infrastructure, cost, and a second source of truth; git-based content keeps review, history, and attribution for free.

## Trade-offs / consequences

- The validator vocabulary must grow deliberately (each new type is engine work + tests) — a feature, not a bug: it keeps content declarative.
- One-time migration cost for the 16 existing levels, 3 challenges, badges, and the cheat sheet — which also deletes their current duplications.
- Enables: solution-replay CI, generated `/commands/*` SEO pages, docs-site command reference, i18n overrides, and the contributor playground — all from the same files.
