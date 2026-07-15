import { registerRule } from '../validator.js';
import { evaluateWinCondition } from '../../../js/win-evaluator.js';

/**
 * L013 — a lesson's win condition must NOT be satisfied by its own initial
 * state. Otherwise the first keystroke (or any keystroke that doesn't break
 * the condition) instantly completes the lesson — the "hitting any key
 * completes the level" bug (issue #14).
 *
 * We reuse the real win-evaluator against the exact initial state the game
 * loads, so this catches every shape: cursor already on `target`, buffer
 * already equal to `targetContent`, target text already present, etc.
 * Search/undo lessons need runtime flags (usedSearchInLevel, …) that are
 * false at start, so they are correctly NOT flagged.
 */
registerRule({
    id: 'L013',
    name: 'Win Condition Trivially Satisfied',
    severity: 'error',
    validate: (lesson, report) => {
        if (!Array.isArray(lesson.initialContent) || lesson.initialContent.length === 0) {
            return; // buffer problems are reported by L004
        }

        const cursor = lesson.initialCursor && typeof lesson.initialCursor === 'object'
            ? { row: lesson.initialCursor.row, col: lesson.initialCursor.col }
            : { row: 0, col: 0 };

        const initialState = {
            lastExCommand: null,
            cursor,
            usedSearchInLevel: false,
            navCountSinceSearch: 0,
            lastSearchQuery: null,
            lastSearchDirection: 'forward',
            content: [...lesson.initialContent],
            mode: 'NORMAL',
            level12RedoAfterUndo: false
        };

        let won = false;
        try {
            won = evaluateWinCondition(initialState, lesson).won;
        } catch {
            return; // malformed lessons are reported by other rules
        }

        if (won) {
            report(
                'Win condition is already satisfied by the initial state — the lesson completes on any keystroke.',
                'objective',
                'The starting buffer/cursor must NOT meet the win condition. For "run a command" lessons, use `exCommands` instead of a `targetText` that is already present.'
            );
        }
    }
});
