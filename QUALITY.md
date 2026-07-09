# VIM Master Quality Standards

This document serves as the central contract for maintaining the quality, stability, and maintainability of VIM Master. Every contributor is expected to adhere to these standards.

## 1. Definition of Done

A pull request is considered complete **only if** it meets all the following criteria:

- [ ] **Code reviewed**: Another pair of eyes has verified the logic.
- [ ] **Documentation updated**: README, API docs, or architectural docs reflect the changes.
- [ ] **Tests added or updated**: Appropriate Unit, Regression, Golden, or Contract tests exist.
- [ ] **No `console` usage**: All logging goes through the structured `logger` API.
- [ ] **Logger categories respected**: Logs use the correct categories and metadata structures.
- [ ] **Changelog updated**: Relevant changes are noted for the next release.
- [ ] **No TODO without issue**: Every `TODO` comment is accompanied by a link to a GitHub issue.
- [ ] **No duplicated logic introduced**: Code is factored into helpers or shared utilities where appropriate.
- [ ] **Public APIs documented**: Any new exported functions or modules have clear docstrings.
- [ ] **Manual verification completed**: The feature or fix has been tested manually in a browser.
- [ ] **Performance impact evaluated**: Ensuring no regression in framerate or initialization time.
- [ ] **Accessibility impact evaluated**: Applicable if UI changes were introduced.
- [ ] **Breaking changes documented**: Any changes that alter saved progress or standard APIs are clearly highlighted.

## 2. Testing Philosophy

We believe in testing that provides maximum confidence with minimum maintenance overhead. We organize our tests in a pyramid:

```
    Contract
   ----------
     Golden
   ----------
   Regression
  ------------
      Unit
```
*Read more in our [Testing Strategy](docs/testing/testing-strategy.md).*

## 3. Logging Philosophy

Observability is a first-class citizen. 
- We do not use the logger for control flow.
- We require structured metadata (objects, not primitives).
- We use predefined categories and Log IDs (e.g., `ENG001`) to make issues searchable.
*Read more in our [Observability Guide](docs/development/observability.md).*

## 4. ADR Process (Architecture Decision Records)

When making significant technical choices (e.g., changing the rendering engine, introducing a new state management approach, choosing a testing framework):
1. Create a document in `docs/adr/`.
2. Follow the standard format: Context, Options Considered, Decision, Consequences.
3. The PR must be approved by core maintainers before implementation begins.

## 5. RFC Process (Request for Comments)

For large new features (e.g., multiplayer, custom lessons):
1. Open a GitHub Issue titled `[RFC] Feature Name`.
2. Detail the motivation, proposed design, and alternatives.
3. Wait for community consensus before writing code.

## 6. Review Rules

- **Be kind and constructive**: Review the code, not the person.
- **Focus on the "Why"**: Don't just say a line is wrong; explain the principle behind the suggestion.
- **Automate the trivial**: Don't argue over formatting. Let linters and formatters do that job.
- **Test the PR locally**: Never approve a substantial PR just by looking at the diff. Run it on your machine.
