/**
 * Unit tests for the f/F find-character motion (issue #36).
 *
 * f<char> moves the cursor forward to the next occurrence of <char> on the
 * current line; F<char> moves backward to the previous occurrence. The current
 * column is excluded (Vim behavior), counts repeat the motion, a missing
 * character leaves the cursor put, and Esc cancels the pending motion.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { handleNormalMode } from '../../js/vim-commands.js';
import {
    resetGameState, setContent, setCursor, setMode,
    getCursor
} from '../../js/game-state.js';

const press = (key, opts = {}) => {
    handleNormalMode({
        key,
        preventDefault: () => {},
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        ...opts
    });
};

const type = (...keys) => keys.forEach((k) => press(k));

describe('f/F find-character motion', () => {
    beforeEach(() => {
        resetGameState();
        setMode('NORMAL');
    });

    it('fx moves forward to the next x', () => {
        setContent(['abxcdxe']); // x at cols 2 and 5
        setCursor({ row: 0, col: 0 });
        type('f', 'x');
        expect(getCursor().col).toBe(2);
    });

    it('fx does not move when the character is absent', () => {
        setContent(['abcdef']);
        setCursor({ row: 0, col: 0 });
        type('f', 'x');
        expect(getCursor().col).toBe(0);
    });

    it('fx searches after the cursor, skipping the current column', () => {
        setContent(['xabxc']); // cursor starts on the x at col 0
        setCursor({ row: 0, col: 0 });
        type('f', 'x');
        expect(getCursor().col).toBe(3); // jumps to the next x, not the one under the cursor
    });

    it('Fx moves backward to the previous x', () => {
        setContent(['axbxcd']); // x at cols 1 and 3
        setCursor({ row: 0, col: 5 });
        type('F', 'x');
        expect(getCursor().col).toBe(3);
    });

    it('Fx does not move when there is no earlier x', () => {
        setContent(['abcxd']); // the only x is ahead of the cursor
        setCursor({ row: 0, col: 2 });
        type('F', 'x');
        expect(getCursor().col).toBe(2);
    });

    it('3fx jumps to the 3rd occurrence', () => {
        setContent(['xaxbxcxdx']); // x at cols 0,2,4,6,8
        setCursor({ row: 0, col: 0 });
        type('3', 'f', 'x');
        expect(getCursor().col).toBe(6); // 3rd x after col 0 -> cols 2,4,6
    });

    it('2Fx jumps to the 2nd previous occurrence', () => {
        setContent(['xaxaxa']); // x at cols 0,2,4
        setCursor({ row: 0, col: 5 });
        type('2', 'F', 'x');
        expect(getCursor().col).toBe(2); // going back: 4 (1st), 2 (2nd)
    });

    it('a count larger than the number of matches leaves the cursor put', () => {
        setContent(['axbxc']); // only 2 x ahead
        setCursor({ row: 0, col: 0 });
        type('9', 'f', 'x');
        expect(getCursor().col).toBe(0);
    });

    it('f then Esc cancels with no movement and restores normal command handling', () => {
        setContent(['abxdef']);
        setCursor({ row: 0, col: 0 });
        type('f', 'Escape');
        expect(getCursor().col).toBe(0);
        // The next key is handled as a normal command again, not as a find target.
        press('l');
        expect(getCursor().col).toBe(1);
    });

    it('finds a digit target (f3) instead of treating it as a count', () => {
        setContent(['a3b3c']); // '3' at cols 1 and 3
        setCursor({ row: 0, col: 0 });
        type('f', '3');
        expect(getCursor().col).toBe(1);
    });
});
