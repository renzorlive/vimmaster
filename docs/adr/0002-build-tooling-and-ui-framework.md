# ADR-0002: Vite + TypeScript build, Preact UI shell, pure-TS Vim core

- **Status:** Proposed *(to be confirmed via RFC before Phase 0.5 tooling work merges)*
- **Date:** 2026-07-09
- **RFC/Discussion:** TBD

## Context

The project is currently zero-build vanilla JS with Tailwind via CDN. That keeps contribution friction at zero but blocks: type safety, tests, dead-code elimination, removing the non-production Tailwind CDN script, content bundling/validation, and the generated SEO pages planned in the roadmap. The platform vision (docs/Architecture.md) needs a build step; the question is which stack, chosen to preserve speed and contributor-friendliness.

## Decision

1. **Vite + TypeScript** as build tooling. Output remains a fully static site (GitHub Pages / Cloudflare).
2. **The Vim core is pure TypeScript with zero DOM and zero framework dependency** — a `dispatch(state, key) → state` reducer (docs/GameEngine.md). This is non-negotiable regardless of UI choices.
3. **Preact (with the React compat alias) for the UI shell**, migrated feature by feature. Contributors write standard React/TSX; the runtime costs ~4 KB.
4. **Tailwind as a build-time dependency**, replacing the CDN script.

## Alternatives considered

- **Stay vanilla JS forever** — lowest friction today, but hand-rolled rendering and no verification tooling scale badly past ~10 UI surfaces (lesson browser, docs, playgrounds, i18n are coming). Rejected for the platform vision, kept for as long as possible (Phase 0 fixes happen pre-build).
- **React proper** — maximum contributor familiarity, ~45 KB baseline for a game whose core view is a `<pre>`. Preact's compat alias gives the same DX; switching later is a one-line alias change, which is why Preact wins.
- **Svelte/Solid** — excellent runtimes, smaller contributor pools; contributor familiarity is a first-class goal here.
- **Webpack/Parcel/esbuild-raw** — Vite is the current community default with the best DX; no reason to deviate.

## Trade-offs / consequences

- Contributors now need Node + `npm install` (documented in CONTRIBUTING; quickstart stays under 15 minutes).
- A build step means CI must guard it (Phase 0.5 GitHub Actions).
- The pure-core rule means UI churn can never break editing logic, and the emulator is testable headlessly — the foundation for solution-replay CI and the Neovim fidelity oracle.
- If Preact ever becomes limiting, the compat alias makes React a migration, not a rewrite.
