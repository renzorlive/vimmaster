# Project Status

> One page, always current: where the project is *right now*. Updated with every milestone; if this file contradicts anything else, this file is stale — please open an issue.

**Last updated:** 2026-07-09

| | |
|---|---|
| **Current version** | pre-1.0 (unversioned; semver starts with the first tagged release in Phase 0.5) |
| **Current phase** | ✅ Phase 0.5 docs/infra complete → ▶️ **entering Phase 0 — Stabilize** ([ROADMAP.md](ROADMAP.md)) |
| **Current sprint** | Critical bug fixes, one PR each |
| **Current focus** | TD-1 ✅ · TD-2 ✅ ([ADR-0005](docs/adr/0005-lesson-initialization-pipeline.md)) — next up: **Phase 0.6 — logger** (replace ~150 debug logs), then testing, then CI |
| **Next milestone** | *Stable v0.1*: all Phase 0 boxes checked — 5 bug fixes, debug logging stripped, SEO meta tags |
| **Release target** | v1.0 after Phases 0–3 (engine rewrite + content system + platform pages) — no date commitment; quality gates over deadlines |

## Known issues (top of the list)

| # | Issue | Severity |
|---|---|---|
| TD-1 | ~~Progress save rejected & deleted after the final level~~ ✅ fixed — [PM-0001](docs/postmortems/PM-0001-save-corruption.md) | ✅ |
| TD-2 | ~~Per-level cursor start positions silently ignored~~ ✅ fixed — [ADR-0005](docs/adr/0005-lesson-initialization-pipeline.md) | ✅ |
| TD-3 | Auto-save on level completion never fires (dead `window` hook) | 🔴 |
| TD-6 | Duplicate, divergent challenge scoring implementations | 🔴 |
| TD-11 | ~150 debug `console.log`s ship to production, some per-keystroke | 🟡 |

Full register with file/line references: [docs/TechnicalDebt.md](docs/TechnicalDebt.md).

## How work happens right now

Every change follows the cycle: **analyze → propose (with impact) → approval → implement** in small PRs — one purpose each, with tests (once the test infra lands in Phase 0.5 tooling), updated docs, and a changelog entry. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Recently completed

- ✅ Architecture analysis + full `/docs` suite (Architecture, GameEngine, ContentSystem, Lessons, SEO, TechnicalDebt, FeatureIdeas, ContributingVision)
- ✅ Contributor infrastructure: CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, issue/PR/RFC templates
- ✅ Governance: ROADMAP, VISION, PROJECT_PRINCIPLES, NON_GOALS, DECISIONS, ADR system with 4 founding records
