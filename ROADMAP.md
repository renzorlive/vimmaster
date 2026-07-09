# VIMMaster Roadmap

> **Learn Vim. Together.** — *The open-source platform for mastering Vim.*
> Not just a game — a platform: interactive lessons, generated documentation, a community that contributes content without writing code, and a page for every Vim command a person might search for. Why we're building it: [VISION.md](VISION.md).

Phased so that **every phase ships a working, deployed site**, and every checkbox is a small, reviewable PR. Big decisions go through the [RFC process](CONTRIBUTING.md#rfc-process-big-changes) and are recorded as [ADRs](docs/adr/).

```
Phase 0   Stabilize
Phase 0.5 Developer Experience   ← contributor infra ready BEFORE growth
Phase 1   Architecture
Phase 2   Content
Phase 3   Platform
Phase 4   Community
Phase 5   Release (1.0)
```

---

## Phase 0 — Stabilize *(days)*

Bug fixes and free wins on the current codebase. No structural change. Details: [docs/TechnicalDebt.md](docs/TechnicalDebt.md).

- [ ] Fix progress-save off-by-one that deletes saves after the final level (TD-1)
- [ ] Fix `level.setup()` being discarded — restore per-level start positions (TD-2)
- [ ] Fix dead auto-save-on-completion hook (TD-3)
- [ ] Remove duplicated/dead challenge scoring (TD-6)
- [ ] Strip all shipped `🔍 DEBUG` console logging (TD-11)
- [ ] Meta description, Open Graph/Twitter cards, favicon link, canonical, robots.txt ([docs/SEO.md](docs/SEO.md) Phase 0)

**Exit:** finish all 16 levels, reload, keep progress; console clean; shared links render cards.

## Phase 0.5 — Developer Experience *(days–1 week)*

Infrastructure for contributors **before** the project attracts attention. A first-time contributor must go from fork to open PR in under 15 minutes.

- [x] `CONTRIBUTING.md` — persona-based, 15-minute quickstart
- [x] `CODE_OF_CONDUCT.md` — Contributor Covenant 2.1
- [x] `ROADMAP.md` (this file) — canonical plan
- [x] `docs/adr/` — ADR process + founding decisions recorded
- [x] GitHub issue templates (bug, feature, lesson proposal, RFC) + PR template
- [x] `SECURITY.md`
- [ ] GitHub labels created per [docs/ContributingVision.md](docs/ContributingVision.md)
- [ ] GitHub Discussions enabled (Q&A, Ideas, Show & Tell)
- [ ] Seed 5–10 well-scoped `good first issue`s from Phase 0 / TechnicalDebt items
- [ ] `package.json` + Vite (output identical site) — RFC/ADR-0002
- [ ] ESLint + Prettier + `.editorconfig`
- [ ] Vitest + first tests (progress-system, pure helpers)
- [ ] GitHub Actions: build + lint + test on PR; deploy on `main`
- [ ] Replace Tailwind CDN with build-time Tailwind (TD-10)

**Exit:** CI is a required check; a stranger can clone, run, change, and PR without asking anything.

## Phase 1 — Architecture *(3–4 weeks)*

The pure Vim core. Details: [docs/GameEngine.md](docs/GameEngine.md), [docs/Architecture.md](docs/Architecture.md).

- [ ] TypeScript adoption (`allowJs`, migrate module by module)
- [ ] `src/core/vim`: `dispatch(state, key) → state` reducer — zero DOM, zero globals
- [ ] Real command grammar (count/operator/motion state machine) replacing string-suffix parsing
- [ ] Engine **event stream** (motions, deletes, searches, undo/redo…) powering validation, scoring, achievements, analytics
- [ ] Vim-fidelity fixes with tests: word motions incl. punctuation, `cw` semantics, undo consistency, insert-mode Enter
- [ ] Table-driven test suite (>90% coverage of the core)
- [ ] UI shell decision executed per ADR-0002 (Preact/TSX components, feature by feature)

**Exit:** every taught command has tests; adding `f/t`, text objects, or visual mode is a grammar extension.

## Phase 2 — Content *(2–3 weeks, parallelizable with Phase 1)*

Content becomes data. Details: [docs/ContentSystem.md](docs/ContentSystem.md).

- [ ] Content schemas (zod) + loader + `npm run validate:content`
- [ ] Migrate 16 levels → `/content/lessons` (tracks: survival, movement, editing, search)
- [ ] Declarative validators replace level-name checks and per-level flags in the engine
- [ ] Migrate challenges and achievements to content files (kills 3 duplicated badge maps)
- [ ] Cheat sheet reads `/content/commands`; practice buttons launch real lessons; delete duplicated `vimLessons`
- [ ] **Solution replay in CI** — every merged lesson is provably solvable
- [ ] **Contributor playground** — drag-and-drop a `lesson.json` into the running app and play it instantly, no PR needed
- [ ] "Add a lesson in 5 minutes" guide + lesson PR template refresh
- [ ] New tracks: text objects, visual mode (the biggest learning-value gaps)

**Exit:** adding a lesson = adding one JSON file; engine contains zero content-specific code; you can test a lesson locally without touching git.

## Phase 3 — Platform *(4–6 weeks)*

From game to destination.

**Landing page** (index becomes a real front door; the game moves to `/play` or stays above the fold — RFC):
- [ ] Hero ("The Open Source Home for Learning Vim") · Why Vim? · live demo · learning path · features · community · contributors · Start Learning CTA
- [ ] Showcase strip: contributor avatars, latest lessons, recent releases, GitHub stars — generated at build time

**Brand:**
- [ ] Logo + favicon set (SVG), color palette, mascot exploration, social/OG card imagery — `brand/` directory with usage guide

**Docs website:**
- [ ] Docs site (VitePress or similar) from `/docs`: Guide · Lessons · Commands · FAQ · Contributing · Architecture · API · Roadmap
- [ ] Command reference pages generated from `/content/commands`

**Playground:**
- [ ] **Scratch buffer** — free-play page with the full emulator + live command log; no lesson, no goal ("Vim playground online")

**SEO content engine** ([docs/SEO.md](docs/SEO.md) Phase 2):
- [ ] Static page per command (`/commands/dd`, `/commands/gg`, `/commands/ciw`…) generated from content JSON, each with prose + playable embed
- [ ] Tutorial pages (`/tutorials/text-objects`, `/tutorials/macros`, `/tutorials/registers`) + `/reference`
- [ ] Sitemap generation, JSON-LD `LearningResource`

**Analytics (privacy-first, own events — no Google Analytics):**
- [ ] Event vocabulary: lesson started/finished, command failed, retries, drop-off point, hints used
- [ ] Local-first: aggregate in localStorage; opt-in anonymous beacon to a Cloudflare Worker (wrangler.toml already exists) — RFC + ADR required
- [ ] "Most failed lesson" report feeding content improvements

**App quality:**
- [ ] PWA: manifest + service worker (offline play)
- [ ] Accessibility pass: focus traps, ARIA, reduced-motion, keyboard-navigable menus
- [ ] Keystroke par + stars per lesson (Codewars-style efficiency scoring)
- [ ] Skill-tree lesson browser replacing the numbered button strip

**Exit:** vimmaster is a site people land on from search, not just a toy people are linked to.

## Phase 4 — Community *(ongoing)*

- [ ] RFC process actively used; ADR log grows
- [ ] i18n: UI catalog + lesson overrides; first community translations
- [ ] Daily challenge (deterministic, client-side) + share cards
- [ ] Streaks & practice reminders (client-side)
- [ ] Golf mode / race-your-ghost (see [docs/FeatureIdeas.md](docs/FeatureIdeas.md))
- [ ] Optional anonymous leaderboards (Cloudflare Worker + KV) — RFC; keep the core playable fully offline
- [ ] Embeddable lesson widget for blogs/docs (every embed is a backlink)
- [ ] In-game lesson attribution ("Lesson by @name") + all-contributors bot
- [ ] Monthly "state of VIMMaster" discussion post

## Phase 5 — Release *(when Phases 0–3 are done)*

- [ ] Custom domain, canonical consolidation, redirects
- [ ] Brand polish across game, landing, docs, share cards
- [ ] v1.0 tag + changelog + launch posts (r/vim, r/neovim, Hacker News — hook: text objects + golf mode + playground)
- [ ] Submit to awesome-vim lists, Vim/Neovim wikis, alternativeto (Vim Adventures alternative)
- [ ] Post-launch: watch analytics drop-off reports → content fixes

---

## Non-goals (for focus)

- Accounts/logins/user databases — export codes + localStorage remain the model
- Full Vim emulation (VimScript, plugins, splits)
- Ads or monetization features
- Heavy frameworks or SSR — static and instant, forever

## Success metric (2-year horizon)

Not feature count. **Dozens of active contributors adding content without maintainer bottlenecks, on a codebase that stays easy to maintain.** Every phase above is judged against that.
