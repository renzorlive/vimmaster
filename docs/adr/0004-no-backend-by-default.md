# ADR-0004: No backend by default; localStorage + export codes for persistence

- **Status:** Accepted
- **Date:** 2026-07-09

## Context

VIMMaster is a free, privacy-first, static site. Progress persistence currently uses localStorage plus Base64 export/import codes. Roadmap features tempt a backend: leaderboards, community lesson submission, analytics. Backends bring cost, accounts, moderation, GDPR surface, and a single point of failure — all hostile to a volunteer-run OSS project.

## Decision

The core product must remain **fully functional as a static site with no backend and no accounts**. Persistence stays localStorage + export codes. Features that genuinely need a server (anonymous leaderboards, opt-in analytics beacon) may be added as **optional, degradable extras** on Cloudflare Workers/KV (deployment already targets Cloudflare), each requiring its own RFC + ADR, and the game must work identically with them unreachable.

Analytics specifically: **no Google Analytics or third-party trackers.** Own event vocabulary (lesson started/finished, command failed, retries, drop-off), aggregated locally first; any network transmission is anonymous, opt-in, and served from our own Worker.

## Alternatives considered

- **Accounts + database (Firebase/Supabase/etc.)** — enables sync and social features, but kills privacy-first positioning, adds cost/moderation/compliance, and gates contributions on infrastructure access. Rejected.
- **Third-party analytics (GA, even Plausible-hosted)** — GA is rejected outright (privacy, weight, trust); privacy-respecting hosted options remain acceptable *fallbacks* but own-events give product insight (most-failed lesson) that pageview tools cannot.
- **Pure no-server forever** — simplest, but forecloses leaderboards/golf-mode community features that fit the mission; the "optional and degradable" rule keeps the door open safely.

## Trade-offs / consequences

- No cross-device sync (export codes are the manual escape hatch) — accepted.
- Community features must be designed to degrade (e.g., share-card-based tournaments before live leaderboards).
- Every server-touching feature carries RFC overhead by design — friction that protects the project's core promise: **open the page, learn Vim, no strings.**
