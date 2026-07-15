/**
 * Regression IDs: #12 and #6 (undo history crosses editing sessions)
 *
 * Issue #12: completing a level and pressing `u` on the next level restored
 * the PREVIOUS level's buffer while the UI stayed on the new level.
 *
 * Issue #6: entering Challenge Mode and mis-hitting `u` restored the buffer
 * the player was on before the challenge.
 *
 * Original Cause: `resetLevelState()` (called by `loadLevel`) cleared search
 * and command state but NOT `_undoStack`/`_redoStack`, and the challenge
 * start path never reset per-session state at all. Undo snapshots from one
 * editing session survived into the next.
 *
 * User Impact: `u` could silently replace the current lesson's buffer with an
 * unrelated one, desyncing the visible editor from the win check.
 *
 * Never Break Again: undo/redo stacks are cleared in `resetLevelState()`
 * (level loads) and `startChallenge()` calls it (challenge entry).
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { handleNormalMode } from '../../js/vim-commands.js';
import { loadLevel, levels } from '../../js/levels.js';
import { startChallenge, challenges } from '../../js/challenges.js';
import {
    resetGameState, getContent, getUndoStack,
    setContent, setCursor, setMode,
    resetLevelState, setCurrentChallenge, setCurrentTaskIndex,
    setChallengeScoreValue, setChallengeProgressValue, setChallengeStartTime
} from '../../js/game-state.js';

const press = (key, opts = {}) =>
    handleNormalMode({ key, preventDefault: () => {}, ctrlKey: false, altKey: false, shiftKey: false, ...opts });

describe('Regression #12: undo does not cross level boundaries', () => {
    beforeEach(() => resetGameState());

    it('after loading a new level, the undo stack is empty', () => {
        // Find a level that pushes undo on edit (dd / x etc. via a target-content lesson)
        const editIndex = levels.findIndex((l) => l.targetContent);
        loadLevel(editIndex);
        // Make an edit to populate the undo stack
        press('d'); press('d');
        expect(getUndoStack().length).toBeGreaterThan(0);

        // Move to another level
        const other = (editIndex + 1) % levels.length;
        loadLevel(other);
        expect(getUndoStack().length).toBe(0);
    });

    it('pressing u on a freshly loaded level does not change its buffer', () => {
        const editIndex = levels.findIndex((l) => l.targetContent);
        loadLevel(editIndex);
        press('d'); press('d'); // edit level A

        const other = (editIndex + 1) % levels.length;
        loadLevel(other);
        const bufferBefore = JSON.stringify(getContent());
        press('u'); // must be a no-op, not a restore of level A
        expect(JSON.stringify(getContent())).toBe(bufferBefore);
    });
});

describe('Regression #6: entering a challenge clears prior undo history', () => {
    beforeEach(() => resetGameState());

    it('undo stack is empty right after a challenge starts', () => {
        // Populate an undo stack in a normal level first
        const editIndex = levels.findIndex((l) => l.targetContent);
        loadLevel(editIndex);
        press('d'); press('d');
        expect(getUndoStack().length).toBeGreaterThan(0);

        // Enter a challenge through the same object shape event-handlers uses
        const gameState = {
            resetLevelState,
            setContent, setCursor, setMode,
            setCurrentChallenge, setCurrentTaskIndex,
            setChallengeScoreValue, setChallengeProgressValue, setChallengeStartTime
        };
        startChallenge(gameState, 0);

        expect(getUndoStack().length).toBe(0);
        expect(getContent()).toEqual(challenges[0].initialContent);
    });
});
