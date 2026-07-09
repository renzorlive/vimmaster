# Workspace Rules for Agents

## VIM Master Philosophy
- **Every new feature must be teachable as a lesson.** Any new Vim command, text object, or mechanic MUST have an accompanying lesson, Contract validation, Golden Test, and documentation.
- **Engine evolves slowly. Content evolves rapidly.** The engine acts as a stable API for content. Refactoring the engine should only happen when a new feature explicitly requires it, or bug fixes are necessary.

## PR23 Architecture
- The game engine must NOT load lessons via inline arrays or text. It MUST use `ContentLoader` and rely on `StaticContentProvider` to fetch content.
- Lessons are defined entirely in `content/lessons/*.json`.
