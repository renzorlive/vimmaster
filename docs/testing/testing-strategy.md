# VIM Master Testing Strategy

To ensure VIM Master remains stable, maintainable, and regression-free, we employ a multi-layered testing strategy. This ensures that a single broken keystroke or missing lesson property is caught immediately in CI.

---

## 1. The Testing Pyramid

Our tests are organized in a pyramid structure. The higher you go, the more domain-specific and encompassing the tests become.

```
      Contract
    ------------
       Golden
    ------------
     Regression
    ------------
        Unit
```

### Why this structure?
- **Unit Tests** act as the foundation. They prove that small, isolated pieces of logic work (e.g., math helpers, string parsers).
- **Regression Tests** lock down the past. They guarantee that bugs we have already fixed will never reappear in the future.
- **Golden Tests** lock down the present gameplay. They verify that our entire engine can still successfully play and beat our core content.
- **Contract Tests** lock down the content integrity. They prove that no one accidentally introduced a broken, unsolvable, or malformed lesson into the database.

---

## 2. Directory Structure

All test-related code lives inside the `/tests` directory.

```text
tests/
  ├── unit/          # Standard unit tests for pure functions
  ├── regression/    # Specific test files dedicated to squashed bugs
  ├── golden/        # Manifest-driven tests for beating lessons end-to-end
  ├── contract/      # Semantic validation for content payloads
  ├── helpers/       # Factory methods, custom assertions, and shared utilities
  └── fixtures/      # Static JSON payloads for testing
      ├── lessons/
      ├── saves/
      ├── buffers/
      └── commands/
```

By keeping `fixtures/` and `helpers/` inside `tests/`, we avoid polluting the root directory while ensuring we never duplicate complex setup objects across different test files.

---

## 3. Test Types in Detail

### Unit Tests
Focus on isolated state management, parsers, and utilities. Fast and focused.

### Regression Tests
Every time a user-reported bug is fixed (e.g., Technical Debt items like TD-1 or TD-2), a regression test MUST be added. 

**Naming Convention:**
Do not name files by their issue tracker ID (e.g., `TD-0001.test.ts`). Use descriptive names so they are readable years later. Note the ID in the file header or comments.

*Correct:* `save-corruption.regression.test.ts`
*Incorrect:* `bug-42.test.ts`

### Golden Tests
Golden tests ensure that given a known valid sequence of keystrokes, a lesson can be successfully completed by the engine.

Instead of hardcoding lessons inside tests, we use a **Manifest** approach.

**Example Manifest (`lesson-01.golden.json`):**
```json
{
  "lesson": "lesson-01",
  "solution": [
    "d", "w"
  ]
}
```
A generic golden test runner will iterate over all manifests, feed the solution keystrokes into the engine for that specific lesson, and assert that the completion event fires.

### Contract Tests
These are semantic validators for our content. They don't test gameplay; they test data integrity.

Every lesson added to VIM Master must pass the following rules:
- **Unique ID**: No two lessons can share the same ID.
- **Valid Title**: Titles cannot be null or empty.
- **Valid Difficulty**: Must be one of the predefined levels (e.g., beginner, intermediate, advanced).
- **Executable Solution**: The solution array must be present and contain valid vim commands.
- **Valid Buffers**: Initial state must be a valid text payload.
- **Valid Cursor**: The starting cursor position must fall within the bounds of the initial buffer.
- **Valid Objective**: The end goal state must be correctly defined.

### Replay Tests (Future)
In the future, we will expand this strategy to include Replay Tests. This will involve recording a raw stream of real user keystrokes, running them through the engine headlessly, and comparing the final state snapshot to ensure zero deviation in engine processing over time.
