# Contributing to VIMMaster

**Learn Vim. Together.** Every lesson, translation, bug fix, and idea makes VIMMaster better for the next person trapped in Vim. Thank you for being here.

Before diving in, skim [VISION.md](VISION.md) and the seven [project principles](PROJECT_PRINCIPLES.md) — every PR is evaluated against them — and [NON_GOALS.md](NON_GOALS.md) so you don't build something we've committed to never shipping.

This guide gets you from zero to an open PR in **under 15 minutes**.

## The 15-minute quickstart

VIMMaster currently has **no build step**. You need a browser and any static file server — nothing else.

```bash
# 1. Fork on GitHub, then:
git clone https://github.com/<you>/vimmaster.git
cd vimmaster

# 2. Serve it (pick whichever you have):
npx serve .            # Node
python -m http.server  # Python
# …or use the Live Server extension in VS Code

# 3. Open http://localhost:3000 (or :8000) — you're running VIMMaster.

# 4. Create a branch, make your change, verify it in the browser:
git checkout -b fix/level-5-typo

# 5. Commit and open a PR:
git commit -am "fix: correct typo in Delete Basics instructions"
git push origin fix/level-5-typo
```

> ⚠️ Opening `index.html` directly from disk (`file://`) will **not** work — ES modules require a server. Use step 2.

## Pick your path

| I want to… | Start here | Code needed? |
|---|---|---|
| 🐛 Report a bug | [Open a bug report](../../issues/new?template=bug_report.yml) | No |
| 📚 Add or improve a lesson | [docs/Lessons.md](docs/Lessons.md), then edit `js/levels.js` | Minimal (JSON-like objects) |
| 💡 Propose a feature | [Open a feature request](../../issues/new?template=feature_request.yml) | No |
| 🏗️ Propose a big change | [Open an RFC](../../issues/new?template=rfc.yml) — see "RFC process" below | No |
| 🔧 Fix a bug / write code | Issues labeled [`good first issue`](../../issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) | Yes |
| 🎨 Improve UI/design/themes | Issues labeled `ui` | Light |
| 🌍 Translate | Coming with the content system ([docs/ContentSystem.md](docs/ContentSystem.md)) — watch `content: i18n` |

## Adding a lesson (today's format)

Lessons live in [`js/levels.js`](js/levels.js). Each is a plain object:

```js
{
    name: "Delete Basics",
    instructions: "Use dd to delete the full middle line.",
    initialContent: ["Keep this line.", "Delete this entire line."],
    targetContent: ["Keep this line."],          // win when buffer matches
    setup: (gameState) => { gameState.cursor = { row: 0, col: 0 }; }
}
```

Win-condition options (use exactly one): `target: {row, col}` (cursor position), `targetText: {line, text}` (one line matches), `targetContent: [lines]` (whole buffer matches), `exCommands: ["q"]` (an ex command was run).

**Checklist for lesson PRs:**
- [ ] One concept per lesson (see design guidelines in [docs/Lessons.md](docs/Lessons.md))
- [ ] You played it and won it in the browser
- [ ] Coordinates are 0-based and inside the buffer
- [ ] Lines under ~60 characters

A pure-JSON content system with automatic validation is coming ([docs/ContentSystem.md](docs/ContentSystem.md)) — lesson PRs will get even easier.

## Code contributions

### The change cycle

All non-trivial work — from maintainers, agents, and contributors alike — follows the same cycle:

1. **Analyze** the problem (issue or RFC).
2. **Propose** the solution and its impact.
3. **Get approval** (issue triage for small things, RFC acceptance for big ones).
4. **Implement in small PRs**, each with: a single purpose, tests (once the test infra exists), updated docs, and a changelog entry.

### Ground rules

- **Small PRs, one concern each.** A bug fix and a refactor are two PRs.
- **Never break existing functionality.** Play through the affected levels before and after your change.
- **Match the surrounding style.** ES modules, no frameworks, no new dependencies without discussion.
- **No new hardcoded content in engine code.** Engine changes that reference a specific lesson by name will be asked to use/extend the declarative approach instead.
- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/): `fix:`, `feat:`, `content:`, `docs:`, `refactor:`, `chore:`.

### Manual test checklist (until automated tests land)

Before opening a PR that touches `js/`:

1. Complete at least one level of each win-condition type (levels 1, 2, 5, 6).
2. Open Challenge Mode, complete one task, let the timer expire once.
3. Open Cheat Mode (`Ctrl+/`), run one practice lesson to completion.
4. Export progress, clear it, import it back.
5. Check the console for errors.

### Where things live

```
index.html / profile.html   pages
js/main.js                  entry point & DOM wiring
js/game-state.js            all mutable state (getters/setters)
js/vim-commands.js          keystroke → state (the Vim emulator)
js/levels.js                lesson definitions
js/event-handlers.js        win conditions, badges, challenges, updateUI
js/ui-components.js         rendering
docs/                       architecture, roadmap, content system, SEO…
docs/adr/                   architecture decision records
```

Deep dives: [docs/Architecture.md](docs/Architecture.md) · [docs/GameEngine.md](docs/GameEngine.md) · [docs/TechnicalDebt.md](docs/TechnicalDebt.md)

## RFC process (big changes)

For anything that changes architecture, the content schema, save-data format, or adds a dependency:

1. **RFC** — open an issue with the [RFC template](../../issues/new?template=rfc.yml) describing the problem, the proposal, and alternatives.
2. **Discussion** — the community and maintainers weigh in; expect iteration.
3. **Accepted** — a maintainer applies the `rfc: accepted` label and the decision is recorded as an ADR in [docs/adr/](docs/adr/).
4. **Implemented** — PRs reference the RFC; the ADR is updated to `Implemented`.

Skipping the RFC for a large PR usually means rework — save yourself the time.

## Architecture Decision Records

Significant technical decisions are recorded in [docs/adr/](docs/adr/) (why, alternatives, trade-offs). Read them before proposing to reverse one — and feel free to propose reversing one via RFC when circumstances change.

## Review expectations

- Maintainers aim to respond to PRs within a few days; `good first issue` PRs get priority.
- Reviews are about the code, never the person — see our [Code of Conduct](CODE_OF_CONDUCT.md).
- CI (build/lint/tests) is being introduced in Phase 0.5 of the [roadmap](ROADMAP.md); until then, the manual checklist above is the bar.

## Recognition

Contributors are credited in release notes, and once the content system lands, lesson files carry an `author` field rendered **in-game** ("Lesson by @you"). Your name ships with the thing you made.

## Questions?

Open a [Discussion](../../discussions) or an issue — there are no stupid questions, especially about Vim. 🙂
