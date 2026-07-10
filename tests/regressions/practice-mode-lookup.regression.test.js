/**
 * Regression ID: practice-mode-lookup (found during TD-11 hygiene review)
 *
 * Issue: every "Practice" button in Cheat Mode silently did nothing.
 *
 * Original Cause: the content extraction turned `vimLessons` from a plain
 * object into a `Map`, but the lookup in `startCheatPractice` kept using
 * bracket access (`vimLessons[item.id]`). Property access on a Map does not
 * read entries, so the lesson was always `undefined` and the function
 * returned early — no error, no lesson, nothing.
 *
 * User Impact: the entire Cheat Mode practice feature was dead: clicking any
 * command's Practice button closed nothing, loaded nothing, and gave no
 * feedback.
 *
 * Test Strategy:
 * 1. Every command in the cheat-sheet catalog must resolve to a practice
 *    lesson through the same lookup the UI uses.
 * 2. Starting a practice session must actually enter practice mode and load
 *    the lesson buffer into game state.
 *
 * Never Break Again: the lookup is exercised end-to-end here; a future
 * container change that breaks resolution fails these tests immediately.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
    commandCatalog, getPracticeLesson, startCheatPractice,
    isInPracticeMode, exitPracticeMode
} from '../../js/cheat-mode.js';
import { resetGameState, getContent, setContent, setCursor, setMode } from '../../js/game-state.js';

describe('Regression: Cheat Mode practice lookup', () => {
    beforeEach(() => {
        exitPracticeMode();
        resetGameState();
        setContent(['placeholder line']);
        setCursor({ row: 0, col: 0 });
        setMode('NORMAL');
    });

    it('resolves a practice lesson for every catalog entry', () => {
        for (const group of commandCatalog) {
            for (const item of group.items) {
                const lesson = getPracticeLesson(item.id);
                expect(lesson, `catalog entry '${item.id}' has no practice lesson`).toBeTruthy();
                expect(Array.isArray(lesson.initialContent)).toBe(true);
            }
        }
    });

    it('startCheatPractice enters practice mode and loads the lesson buffer', () => {
        const item = commandCatalog[0].items[0]; // hjkl
        const lesson = getPracticeLesson(item.id);

        startCheatPractice(item);

        expect(isInPracticeMode()).toBe(true);
        expect(getContent()).toEqual(lesson.initialContent);

        exitPracticeMode();
        expect(isInPracticeMode()).toBe(false);
    });
});
