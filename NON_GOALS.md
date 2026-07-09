# Non-Goals

What VIMMaster deliberately is **not** and will **not** become. These are commitments, not current limitations — proposals that cross them will be declined with a link to this file. To challenge one, open an [RFC](CONTRIBUTING.md#rfc-process-big-changes) that addresses the reasoning in the linked ADRs.

## We are NOT trying to:

❌ **Replace Neovim** — or Vim, or your editor. VIMMaster is a gym, not a workplace. We emulate the teachable subset *correctly*, nothing more.

❌ **Become a full IDE** — no file trees, no LSP, no terminals. One buffer, one skill, focused practice.

❌ **Simulate every Vim plugin or option** — no `.vimrc`, no plugin ecosystem, no distro debates. Core Vim fluency transfers everywhere; configs don't.

❌ **Require registration** — no accounts, no email capture, no "sign in to save progress". ([ADR-0004](docs/adr/0004-no-backend-by-default.md))

❌ **Require internet** — after first load, everything works offline. Networked extras must degrade to nothing.

❌ **Become a gamified addiction app** — no lives, no timers pressuring you to pay, no guilt notifications, no infinite-scroll dopamine. Streaks and stars celebrate mastery; they never punish absence.

❌ **Lock content behind paywalls** — every lesson, every track, every feature: free, for everyone, forever. No "pro tier".

❌ **Ship ads or trackers** — no ad networks, no Google Analytics, no third-party pixels. Trust and speed are the product.

❌ **Depend on AI services at runtime** — lessons are deterministic, human-authored, and CI-verified. The app never calls an LLM to function.

❌ **Adopt a backend as the default architecture** — static site first; any server-side extra is optional, isolated, and the app must work identically without it. ([ADR-0004](docs/adr/0004-no-backend-by-default.md))

---

*Why written down?* Because every one of these will be suggested — usually with good intentions and a plausible benefit. Non-goals turn those recurring debates into a link, and keep the project's promise simple: **open the page, learn Vim, no strings.**
