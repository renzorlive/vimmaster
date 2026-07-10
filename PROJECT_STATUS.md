# Project Status

> One page, always current: where the project is *right now*. Updated with every milestone; if this file contradicts anything else, this file is stale — please open an issue.

**Last updated:** 2026-07-10

| | |
|---|---|
| **Current version** | v3.0.0 — Community Alpha (see [CHANGELOG.md](CHANGELOG.md)) |
| **Current phase** | ✅ Phase 0 (bugs) · ✅ tooling/tests (unit + contract + golden + regression) · ✅ **content extraction** (35 JSON lessons in `/content/lessons`) → ▶️ Community Alpha hardening ([ROADMAP.md](ROADMAP.md)) |
| **Current sprint** | PR24: every lesson provably solvable — `solution` in all 35 lessons, Golden Suite auto-verifies each (35/35), L007 promoted to ERROR |
| **Current focus** | **All 🔴 Phase-0 bugs closed** (TD-1..TD-4b, TD-6 — each regression-tested). Next: lint-warning burn-down (~186), debug-log strip (TD-11), Community Alpha release checklist |
| **Next milestone** | Community Alpha announcement once the release checklist in QUALITY.md is green |
| **Release target** | v1.0 after the pure-core engine rewrite + platform pages — no date commitment; quality gates over deadlines |

## Known issues (top of the list)

| # | Issue | Severity |
|---|---|---|
| TD-1 | ~~Progress save rejected & deleted after the final level~~ ✅ fixed — [PM-0001](docs/postmortems/PM-0001-save-corruption.md), regression-tested | ✅ |
| TD-2 | ~~Per-level cursor start positions silently ignored~~ ✅ fixed — [ADR-0005](docs/adr/0005-lesson-initialization-pipeline.md), regression-tested | ✅ |
| TD-3 | ~~Auto-save on level completion never fires~~ ✅ fixed — PR26, regression-tested | ✅ |
| TD-4 | ~~Stale cursor clamp (`0` failed past EOL after `j`)~~ ✅ fixed — PR25, regression-tested | ✅ |
| TD-4b | ~~Counted edits stale/broken (`2x`→1 char; `2dd`/`2dw` never worked)~~ ✅ fixed — PR25, regression-tested | ✅ |
| TD-6 | ~~Duplicate, divergent challenge scoring~~ ✅ fixed — PR26, single source + unit tests | ✅ |
| TD-11 | Debug `console.log`s ship to production | 🟡 |

Full register with file/line references: [docs/TechnicalDebt.md](docs/TechnicalDebt.md).

## How work happens right now

Every change follows the cycle: **analyze → propose (with impact) → approval → implement** in small PRs — one purpose each, with tests (once the test infra lands in Phase 0.5 tooling), updated docs, and a changelog entry. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Recently completed

- ✅ Architecture analysis + full `/docs` suite (Architecture, GameEngine, ContentSystem, Lessons, SEO, TechnicalDebt, FeatureIdeas, ContributingVision)
- ✅ Contributor infrastructure: CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, issue/PR/RFC templates
- ✅ Governance: ROADMAP, VISION, PROJECT_PRINCIPLES, NON_GOALS, DECISIONS, ADR system with 4 founding records
