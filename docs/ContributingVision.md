# Contributing Vision

Goal: **a first-time contributor adds a lesson within minutes** and a code contributor gets a green/red answer from CI without asking a maintainer.

## Contributor personas & their golden paths

| Persona | Path | Touches code? |
|---|---|---|
| Lesson author | copy a lesson JSON, edit, PR — CI proves it's solvable | No |
| Translator | copy `content/i18n/en.json`, translate, PR | No |
| Bug fixer | issue → failing test → fix → PR | Yes |
| Engine contributor | grammar/motion work with table-driven tests | Yes |
| Designer | themes (CSS variables), UI polish | Light |

The content system (ContentSystem.md) is what makes the first two personas possible — protect that boundary in review: **content PRs must not require JS changes.**

## Repository workflow

- `main` is always deployable; deploys are automatic on merge.
- Small PRs, one concern each. A PR that fixes a bug and refactors gets split.
- Every PR: CI green (build, lint, test, content validation), no reduction in Lighthouse budget.
- Conventional commits (`feat:`, `fix:`, `content:`, `docs:`) — enables changelog automation later.
- Maintainer review within a few days; `good first issue`s get priority review as a policy (first-PR experience is the growth engine of an OSS project).

## Files to add under `.github/`

```
.github/
  ISSUE_TEMPLATE/
    bug_report.yml         (repro steps, browser, save-code if relevant)
    lesson_proposal.yml    (concept, buffer sketch, goal, par estimate)
    feature_request.yml
    config.yml             (links: Discussions for questions)
  PULL_REQUEST_TEMPLATE/
    pull_request_template.md   (checklist: tests, docs, screenshots for UI)
  workflows/
    ci.yml                 (build + lint + typecheck + test + validate:content)
    deploy.yml             (Pages/Cloudflare on main)
    lighthouse.yml         (budget check on PRs touching src/ or index.html)
    content-preview.yml    (PR comment with a preview deploy link for content PRs)
    stale.yml              (gentle nudge at 60 days, exempt `pinned`)
  labels.yml               (declarative labels, synced by action)
```

## Suggested labels

| Label | Use |
|---|---|
| `good first issue` | scoped, has pointers to exact files |
| `help wanted` | maintainers won't get to it soon |
| `content: lesson` / `content: challenge` / `content: i18n` | no-code contributions |
| `engine` | Vim core / grammar work |
| `ui` / `a11y` / `seo` / `perf` | shell concerns |
| `bug` / `regression` | with severity via `P1`/`P2`/`P3` |
| `needs repro` / `needs design` / `blocked` | status |
| `breaking-save` | changes affecting stored progress/export codes — must include migration |

## Suggested GitHub Actions detail

**ci.yml** (required check):
```yaml
on: [pull_request, push]
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4        # with cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test
      - run: npm run validate:content      # schemas + solution replay
      - run: npm run build
```

The **solution replay** step is the crown jewel: content contributors get "your lesson is unbeatable at step 3" as a CI message instead of a review comment.

## Documentation set (target)

- `CONTRIBUTING.md` — 5-minute quickstart: clone → `npm i` → `npm run dev`; links per persona
- `docs/Lessons.md` — lesson authoring guide (exists)
- `docs/ContentSystem.md` — schemas (exists)
- `docs/GameEngine.md` — engine internals for code contributors (exists)
- `CODE_OF_CONDUCT.md` — Contributor Covenant
- `SECURITY.md` — even for a static site (dependency & XSS reports)

## Folder-structure improvements for contributor clarity

Current flat `js/` is fine at 11 files but the target structure (Architecture.md §2) is itself a contributor feature: `/content` says "edit here without fear", `/src/core` says "tests required here", `/src/features` says "UI lives here". Boundaries reduce review friction more than any style guide.

## Community surfaces

- **GitHub Discussions** — Q&A, lesson ideas, show-and-tell (share cards land here naturally)
- **README badges** — CI, deploy, lesson count ("87 lessons and counting" auto-generated from content)
- **`good first issue` curation ritual** — every refactor should deliberately leave 2–3 well-scoped starter issues behind
- **CONTRIBUTORS recognition** — all-contributors bot; content authors credited in the lesson JSON (`author` field) and rendered in-game ("Lesson by @name")

That last one matters: **in-game attribution** is the strongest incentive an educational OSS project can offer contributors.
