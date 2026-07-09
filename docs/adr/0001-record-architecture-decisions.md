# ADR-0001: Record architecture decisions

- **Status:** Accepted
- **Date:** 2026-07-09

## Context

VIMMaster aims to become a multi-contributor open-source platform ("The Open Source Home for Learning Vim"). Projects at that scale repeatedly re-argue old decisions unless the reasoning is written down. New contributors also need a way to learn *why* things are the way they are without archaeology through PR threads.

## Decision

We record every significant technical decision as an Architecture Decision Record in `docs/adr/`, using the template in this directory. Big changes go through an RFC (GitHub issue with the RFC template → discussion → accepted) and are then condensed into an ADR. ADRs are immutable; reversals happen via superseding ADRs.

## Alternatives considered

- **Decisions in PR descriptions/discussions only** — where they live today; unfindable within months.
- **A single DECISIONS.md** — becomes an unstructured wall; no lifecycle per decision.
- **Full RFC repository (Rust-style)** — heavier than a project this size needs; the issue-template RFC + ADR condensation gives 90% of the value.

## Trade-offs / consequences

Small writing overhead per big decision; in exchange, contributor onboarding and long-term maintainability improve, and "why?" questions get a link instead of a debate.
