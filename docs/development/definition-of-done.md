# Definition of Done

This document outlines the strict requirements for any new features or pull requests in VIM Master.

## Core Principles

1. **Every new feature must be teachable as a lesson.**
   Any new Vim command, text object, or mechanic MUST have:
   - An accompanying lesson (JSON file)
   - A Golden Test in `tests/golden/manifest.json`
   - Validation in the Contract Suite (if schema changes)
   - Documentation in the codebase

2. **Engine evolves slowly. Content evolves rapidly.**
   - The game engine acts as a stable API for content.
   - Refactoring the engine should only happen when a new feature explicitly requires it, or bug fixes are necessary.
   - Focus should be heavily on adding new lessons via JSON files.

## Pull Request Checklist

Before opening a PR, ensure you have run and passed the CI checks:
- `npm run check` (runs Linting, Contract Suite, and Golden Suite)

For Content PRs:
- JSON lesson is correctly formatted and uses a standard Slug ID.
- Lesson contains `githubUsername` and `author`.
- `prerequisites`, `learningObjectives`, and `tags` are properly filled out.
