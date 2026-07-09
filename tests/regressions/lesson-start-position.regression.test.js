/**
 * Regression ID: TD-0002
 * 
 * Issue: Level setup() never takes effect (specifically starting positions).
 * 
 * Original Cause: The engine explicitly called `level.setup({ cursor: getCursor(), ... })`,
 * which passed a defensive copy of the cursor to the level. The level mutated the copy,
 * but the engine never read the mutated copy back. This caused every level to start at {row:0, col:0}
 * regardless of its configured starting position.
 * 
 * User Impact: Users started lessons at the beginning of the text, often having to navigate 
 * manually to the relevant section before they could begin the actual exercise.
 * 
 * Fixed In: ADR-0005 (level-lifecycle.md)
 * 
 * Test Strategy: 
 * 1. Verify that when `initializeLessonState` is given a lesson with a custom `setup` 
 *    that modifies the cursor, the game state receives the new cursor coordinates.
 * 2. Verify that if a lesson requests an invalid/out-of-bounds cursor, the engine 
 *    clamps it to the buffer dimensions and emits a warning.
 * 
 * Never Break Again: The initialization pipeline treats `setup()` as a mutator of a local `init` 
 * object and applies its results back to the global state immediately.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loadFixture } from '../helpers/fixtures.js';
import { initializeLessonState } from '../../js/levels.js';
import { getCursor } from '../../js/game-state.js';

describe('Regression: TD-0002 Lesson Start Position', () => {
    let originalConsoleWarn;

    beforeEach(() => {
        originalConsoleWarn = console.warn;
        console.warn = vi.fn();
    });

    afterEach(() => {
        console.warn = originalConsoleWarn;
        vi.restoreAllMocks();
    });

    it('should apply a valid custom cursor position defined by the lesson', () => {
        const fixture = loadFixture('lessons', 'custom-start.json');
        
        // We add the setup function dynamically since it can't be stored in JSON
        const lesson = {
            ...fixture,
            setup: (state) => {
                state.cursor = { row: 1, col: 5 };
            }
        };

        initializeLessonState(lesson);

        const currentCursor = getCursor();
        expect(currentCursor.row).toBe(1);
        expect(currentCursor.col).toBe(5);
        expect(console.warn).not.toHaveBeenCalled();
    });

    it('should clamp an out-of-bounds cursor and emit a warning', () => {
        const fixture = loadFixture('lessons', 'invalid-cursor.json');
        
        // Buffer is 2 lines long. "A short line" is 12 chars.
        // We request row 10 (invalid) and col 100 (invalid).
        const lesson = {
            ...fixture,
            setup: (state) => {
                state.cursor = { row: 10, col: 100 };
            }
        };

        initializeLessonState(lesson);

        const currentCursor = getCursor();
        
        // Should clamp to the last row (index 1) and the end of that row
        expect(currentCursor.row).toBe(1);
        expect(currentCursor.col).toBe(fixture.initialContent[1].length - 1);
        
        // Should warn that clamping occurred
        expect(console.warn).toHaveBeenCalledWith(
            expect.stringContaining('is outside the buffer — clamped to')
        );
    });
});
