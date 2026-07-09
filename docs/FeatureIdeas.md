# Feature Ideas

A backlog of ideas, scored for impact vs. effort. Nothing here is committed — Roadmap.md holds the committed sequence. Inspirations noted: Duolingo (habit/progression), Vim Adventures (playfulness), Codewars/LeetCode (mastery ranking), TypeRacer (speed/competition).

## High impact / low–medium effort

| Idea | Notes |
|---|---|
| **Keystroke par + stars** | Score each lesson vs optimal keystrokes (`par` in content schema). 1–3 stars. Instantly adds replay value; engine already sees every key. |
| **Daily challenge** | Deterministic pick from the challenge pool by date. "I solved today's VIMMaster daily in 14 keystrokes" share card. Habit loop with zero backend. |
| **Streak counter** | Client-side day streak, shown on the progress bar. Cheap Duolingo magic. |
| **Hint ladder** | Hints already exist in content; gate them: hint 1 free, hint 2 costs a star. Teaches self-sufficiency. |
| **Mistake heatmap** | Track which commands the player fumbles (wrong-key events); surface "you should practice `b`" with a one-click practice lesson. |
| **Command of the day** | Cheat-sheet entry surfaced on load with its practice lesson. Pure content reuse. |
| **Solution replay** | After winning, show the par solution as an animated ghost cursor. Content files already carry `solution`. |
| **PWA / installable + offline** | Manifest + service worker after the Vite migration. "Learn Vim on a plane." |

## High impact / higher effort

| Idea | Notes |
|---|---|
| **Text objects & visual mode tracks** | The single biggest credibility jump for real Vim learners. Needs the grammar engine (Phase 3). |
| **Skill-tree lesson browser** | Duolingo-style map of tracks with locks/completion. Replaces the 1–16 button strip; makes 100+ lessons navigable. |
| **Race your ghost** | Store best-run keystroke log per lesson; replay it as a second cursor while you play. TypeRacer feel, no backend. |
| **Placement test** | 3-minute adaptive test that unlocks the right starting track for experienced users. |
| **Sandbox / free-play buffer** | Empty buffer with the full emulator + live command log, for experimentation. Good SEO landing page too ("Vim playground online"). |
| **Embeddable lesson widget** | `<iframe src=".../embed/dd-basics">` for blogs and docs. Growth loop: every embed is a backlink. |
| **`.`-repeat and macro lessons** | Once the engine supports them — the "aha" commands that convert casual users to Vim converts. |

## Community / competitive (needs infra decisions)

| Idea | Notes |
|---|---|
| **Anonymous leaderboards** | Per daily challenge: name + score, Cloudflare Worker + KV (wrangler.toml already exists). First backend — keep optional and separate. |
| **Golf mode** | Codegolf-style: same buffer transform, global fewest-keystrokes board. The Vim community *loves* vimgolf — huge shareability. |
| **Community lesson gallery** | PR-based at first (content system makes this free); later a submission form that generates a PR. |
| **Weekly tournament** | Rotating challenge set, results thread on GitHub Discussions. Zero backend if scores are share-card based. |

## Polish / delight

- Themes (gruvbox, catppuccin, solarized…) — CSS variables, community-contributable
- Sound effects toggle (soft thock per keystroke, chime on win)
- Konami-code style easter eggs (`:help hidden-level`)
- Achievement rarity ("3% of players earned this")
- Animated intro lesson ("You are trapped in Vim. Escape." — leans into the meme)
- Keyboard layout awareness (Colemak/Dvorak notes on movement lessons)
- Per-lesson "why this matters" blurb (real-world editing scenario)

## Explicitly rejected (with reasons, to save future discussion)

- **Accounts/logins** — kills privacy-first, adds cost and moderation burden; export codes cover portability
- **Full Vim emulation** — infinite scope; we teach a curriculum, not replace Neovim
- **Electron/desktop app** — the browser is the distribution advantage
- **Ads** — trust and speed are the product
