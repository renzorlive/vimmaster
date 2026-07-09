# Vision

> **Learn Vim. Together.**
> *The open-source platform for mastering Vim.*

This document explains **why VIMMaster exists**. The [README](README.md) tells you what it is, the [ROADMAP](ROADMAP.md) tells you what's next — this tells you what we're actually building, and why it's worth your time.

## Why VIMMaster exists

Vim is one of the highest-leverage skills a person who types for a living can learn — and one of the worst-taught. The learning curve is a wall: cryptic keys, modal editing that fights every instinct, and documentation written for people who already understand it. Most people bounce off within an hour. The famous joke — *"how do I exit Vim?"* is one of the most-searched programming questions ever — is funny precisely because the wall is real.

Meanwhile, the tools that *do* teach well — Duolingo, TypeRacer, Codewars — proved something important: **short feedback loops, real practice, and a little play beat manuals every time.**

VIMMaster exists to put those two facts together: the most valuable editing skill, taught the way skills are actually learned — interactively, incrementally, in the browser, in seconds from clicking a link.

## Why another Vim project?

There are Vim tutorials (passive), `vimtutor` (great, but you must already be *in* Vim), Vim Adventures (wonderful, but paid and closed), and countless cheat sheets (reference, not practice). What doesn't exist is:

**A free, open-source, community-owned place where anyone can learn Vim by doing — and where anyone can teach by contributing a lesson without writing code.**

That second half is the actual gap. Every existing option is one author's curriculum. VIMMaster's curriculum is a folder of JSON files with a CI check that proves every lesson is solvable. That's a structurally different thing: it compounds.

## Why open source?

- **Teaching material improves with many eyes.** A confusing lesson gets fixed by the first confused learner who becomes a contributor.
- **Vim's culture is open source.** A closed Vim-learning product is dissonant; the community this serves is the community that can build it.
- **Trust.** No accounts, no tracking, no paywall — claims only verifiable because the code is public.
- **Longevity.** Personal projects die with their maintainer's attention. Platforms with contributors, recorded decisions, and clear processes survive.

## Who is it for?

- **Developers who keep meaning to learn Vim** and need the wall lowered to a staircase.
- **Vim-curious students and writers** who want to try before configuring anything.
- **Intermediate Vim users** with plateaued habits (arrow keys, no text objects) who need targeted drills.
- **Teachers and mentors** who want a link to send instead of a lecture.
- **Contributors** who enjoy teaching: the lesson format is the product.

## Who is NOT the target audience?

- **Vim power users seeking emulation perfection.** We teach the 20% that gives 80% of the power; Neovim is right there.
- **People choosing an editor for production work today.** VIMMaster is a gym, not an IDE.
- **Plugin/config enthusiasts.** `.vimrc` golf, plugin managers, and distro debates are out of scope — gloriously so.

## What will never be added?

See [NON_GOALS.md](NON_GOALS.md) — the short version: no accounts, no required internet after first load, no paywalls, no dark-pattern gamification, no full-Vim emulation, no ads. These are commitments, not current gaps.

## What makes VIMMaster different?

1. **Zero to practicing in five seconds.** A URL, not an install.
2. **Outcome validation, not keystroke mimicry.** You win by *achieving the edit*, any legal way — like real editing.
3. **Content is data.** Lessons, challenges, achievements, and translations are JSON. Contributors teach without touching code, and CI replays every lesson's solution before merge — an unbeatable lesson cannot ship.
4. **Privacy as architecture, not policy.** Static site, localStorage, export codes. There is no server to leak anything.
5. **The same content powers everything** — the game, the cheat sheet, the docs site, and a generated SEO page for every command, so the project grows more findable as it grows more useful.

## Long-term vision (5 years)

When someone anywhere in the world decides to learn Vim, VIMMaster is the obvious first stop — and when they search "vim ciw" a year later, they land on our generated reference page with a playable example.

Concretely, by then:

- **Hundreds of lessons** across tracks from "exit Vim" to registers, macros, and text-object fluency — most written by the community, each attributed in-game to its author.
- **A living curriculum in many languages**, maintained by translators who never opened `src/`.
- **A place people return to**: daily challenges, keystroke golf, racing your own ghost — mastery mechanics, not engagement traps.
- **Dozens of active contributors** and a maintainer team, with RFCs, ADRs, and CI making the project easy to steward and hard to break.
- **Still: no login, no tracking, free, instant, open.** If we scale by betraying any of those, we failed.

The measure of success is not stars or traffic. It's this sentence being commonly true: *"I learned Vim on VIMMaster — and I fixed a lesson while I was there."*

## Core principles

The seven principles that every PR is weighed against live in [PROJECT_PRINCIPLES.md](PROJECT_PRINCIPLES.md). Major standing decisions are listed in [DECISIONS.md](DECISIONS.md) with their full reasoning in [docs/adr/](docs/adr/).
