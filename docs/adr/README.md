# Architecture Decision Records (ADRs)

Every significant technical decision in VIMMaster is recorded here: **why** it was made, what **alternatives** were considered, and what **trade-offs** were accepted. This is how a project survives maintainer turnover and contributor growth without re-litigating the past — and how it *deliberately* revisits the past when circumstances change.

## When to write an ADR

Write one when a decision:
- changes architecture, the content schema, or the save-data format,
- adds/removes a dependency or a build tool,
- commits to or rejects a whole approach (backend? framework? analytics?),
- would make a future contributor ask "why on earth is it like this?"

Big decisions should go through the [RFC process](../../CONTRIBUTING.md#rfc-process-big-changes) first; the accepted RFC is then condensed into an ADR.

## Format

One file per decision: `NNNN-short-title.md`, numbered sequentially, using [the template](template.md). Statuses: `Proposed` → `Accepted` → `Implemented`, or `Rejected` / `Superseded by ADR-XXXX`.

ADRs are **immutable history**: to reverse a decision, write a new ADR that supersedes the old one — don't edit the old one beyond updating its status line.

## Index

| # | Title | Status |
|---|---|---|
| [0001](0001-record-architecture-decisions.md) | Record architecture decisions | Accepted |
| [0002](0002-build-tooling-and-ui-framework.md) | Vite + TypeScript build, Preact UI shell, pure-TS Vim core | Proposed |
| [0003](0003-content-as-data.md) | All content is data, engine knows no content | Accepted |
| [0004](0004-no-backend-by-default.md) | No backend by default; localStorage + export codes | Accepted |
| [0005](0005-lesson-initialization-pipeline.md) | Single lesson-initialization pipeline with a consumption invariant | Accepted |
