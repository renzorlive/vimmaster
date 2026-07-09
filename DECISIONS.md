# Decisions

The major standing decisions, at a glance. Full reasoning (context, alternatives, trade-offs) lives in [docs/adr/](docs/adr/README.md); commitments about what we won't build live in [NON_GOALS.md](NON_GOALS.md).

## Decided ✔

| Decision | Detail |
|---|---|
| ✔ **No backend** | Static site; optional extras (leaderboards, opt-in analytics) must degrade to nothing — [ADR-0004](docs/adr/0004-no-backend-by-default.md) |
| ✔ **No account required** | localStorage + export codes are the persistence model — [ADR-0004](docs/adr/0004-no-backend-by-default.md) |
| ✔ **Offline first** | Full functionality after first load; PWA planned — [PROJECT_PRINCIPLES.md](PROJECT_PRINCIPLES.md) #2 |
| ✔ **Lessons are JSON** | All content is data; engine contains zero content-specific code — [ADR-0003](docs/adr/0003-content-as-data.md) |
| ✔ **Every lesson is CI-proven solvable** | Content ships a `solution` replayed by CI — [docs/ContentSystem.md](docs/ContentSystem.md) |
| ✔ **No AI dependency at runtime** | Deterministic, human-authored content — [NON_GOALS.md](NON_GOALS.md) |
| ✔ **Static deployment** | GitHub Pages / Cloudflare; output is plain files |
| ✔ **SEO pages generated from content** | `/commands/*`, `/tutorials/*` built from the same JSON — [docs/SEO.md](docs/SEO.md) |
| ✔ **No ads, no trackers, no paywalls** | [NON_GOALS.md](NON_GOALS.md) |
| ✔ **Decisions are recorded** | RFC → ADR process — [ADR-0001](docs/adr/0001-record-architecture-decisions.md) |
| ✔ **Outcome-based validation** | Lessons validate the edit achieved, not the exact keystrokes |

## Proposed (pending RFC) ◌

| Decision | Detail |
|---|---|
| ◌ **Vite + TypeScript build; Preact UI shell; pure-TS Vim core** | [ADR-0002](docs/adr/0002-build-tooling-and-ui-framework.md) — confirm via RFC before tooling PRs merge |

## How to change any of these

Open an [RFC](CONTRIBUTING.md#rfc-process-big-changes) that engages with the original ADR's reasoning. "I disagree" is a comment; "circumstances changed, here's the evidence and the migration" is an RFC.
