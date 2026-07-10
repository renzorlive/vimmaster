/**
 * Regression ID: TD-3
 *
 * Issue: Auto-save on level completion never fired.
 *
 * Original Cause: main.js wrapped `window.checkWinCondition` to save after a
 * win, but `checkWinCondition` is an ES-module export that was never assigned
 * to `window` — the wrapper was dead code. Wins were persisted only by the
 * 30-second interval save.
 *
 * User Impact: Completing a level and closing the tab within the interval
 * window lost the completion (XP, badges, level) silently.
 *
 * Test Strategy: put the engine in a winning state for a real lesson, call
 * checkWinCondition(), advance the completion timers, and assert the save
 * landed in storage — without any interval timer involved.
 *
 * Never Break Again: the save lives inside checkWinCondition's win path
 * itself (event-handlers.js); the dead window wrapper was removed.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setupMockStorage } from '../helpers/mock-storage.js';
import { checkWinCondition } from '../../js/event-handlers.js';
import { levels } from '../../js/levels.js';
import {
    resetGameState, setContent, setCursor, setMode, setCurrentLevel,
    setChallengeMode
} from '../../js/game-state.js';

describe('Regression: TD-3 auto-save on level completion', () => {
    let mockStorage;
    let originalConsoleLog;

    beforeEach(() => {
        mockStorage = setupMockStorage();
        vi.useFakeTimers();
        originalConsoleLog = console.log;
        console.log = vi.fn();
    });

    afterEach(() => {
        vi.useRealTimers();
        console.log = originalConsoleLog;
        vi.restoreAllMocks();
    });

    it('persists progress the moment a level is won, without interval timers', () => {
        // Arrange: a cursor-target lesson driven into its winning state
        const index = levels.findIndex((l) => l.target);
        const lesson = levels[index];
        resetGameState();
        setChallengeMode(false);
        setCurrentLevel(index);
        setContent(lesson.initialContent);
        setMode('NORMAL');
        setCursor({ row: lesson.target.row, col: lesson.target.col });

        expect(mockStorage.getItem('vimMasterProgress')).toBeNull();

        // Act: evaluate the win and run the completion timers (flash + modal)
        checkWinCondition();
        vi.runAllTimers();

        // Assert: the save exists and records the completed level
        const raw = mockStorage.getItem('vimMasterProgress');
        expect(raw).not.toBeNull();
        expect(JSON.parse(raw).currentLevel).toBe(index);
    });
});
