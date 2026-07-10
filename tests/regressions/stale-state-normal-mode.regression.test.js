/**
 * Regression IDs: TD-4 and TD-4b
 *
 * Issue: `handleNormalMode` captured `content`, `cursor`, and `mode` snapshots
 * at handler entry and kept using them after the command mutated real state.
 *
 * TD-4b — counted edits looped over the stale buffer copy: each iteration of
 * `2x` (and counted `dw`/`dd` bookkeeping) re-read the ORIGINAL line and
 * re-applied the same single-character deletion, so `2x` deleted one char.
 *
 * TD-4 — the end-of-handler bounds clamp evaluated the stale cursor: with the
 * cursor sitting past EOL (after `j` onto a shorter line), pressing `0` moved
 * to col 0 but the clamp then overwrote it to the line end — `0` silently
 * failed.
 *
 * User Impact: The README promises numeric counts ("5x"); players using them
 * got wrong edits, and `0` misbehaved after vertical movement — both found by
 * the Golden Suite in PR24, which had to work around them in solutions.
 *
 * Test Strategy: drive `handleNormalMode` with real key events and assert on
 * fresh game state, covering counted x / dw / dd and the j-then-0 sequence.
 *
 * Never Break Again: every loop iteration and the final clamp re-read state
 * via getContent()/getCursor()/getMode() instead of entry-time snapshots.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { handleNormalMode } from '../../js/vim-commands.js';
import {
    resetGameState, setContent, setCursor, setMode,
    getContent, getCursor
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

describe('Regression: TD-4b counted edits used a stale buffer copy', () => {
    beforeEach(() => {
        resetGameState();
        setMode('NORMAL');
    });

    it('2x deletes two characters', () => {
        setContent(['abcdef']);
        setCursor({ row: 0, col: 0 });
        type('2', 'x');
        expect(getContent()[0]).toBe('cdef');
    });

    it('5x deletes five characters', () => {
        setContent(['abcdefgh']);
        setCursor({ row: 0, col: 1 });
        type('5', 'x');
        expect(getContent()[0]).toBe('agh');
    });

    it('counted x stops at end of line instead of looping on stale text', () => {
        setContent(['ab']);
        setCursor({ row: 0, col: 0 });
        type('9', 'x');
        expect(getContent()[0]).toBe('');
    });

    it('2dw deletes two words', () => {
        setContent(['one two three four']);
        setCursor({ row: 0, col: 0 });
        type('2', 'd', 'w');
        expect(getContent()[0]).toBe('three four');
    });

    it('2dd deletes two lines and keeps the buffer non-empty state sane', () => {
        setContent(['first', 'second', 'third']);
        setCursor({ row: 0, col: 0 });
        type('2', 'd', 'd');
        expect(getContent()).toEqual(['third']);
        expect(getCursor().row).toBe(0);
    });
});

describe('Regression: TD-4 stale cursor clamp corrupted motions', () => {
    beforeEach(() => {
        resetGameState();
        setMode('NORMAL');
    });

    it('0 moves to column 0 even when the cursor was past EOL after j', () => {
        // Long first line, short second line: j used to leave col out of
        // bounds, and the stale clamp then overwrote 0's result.
        setContent(['a very long first line indeed', 'short']);
        setCursor({ row: 0, col: 25 });
        type('j', '0');
        expect(getCursor()).toEqual({ row: 1, col: 0 });
    });

    it('j onto a shorter line clamps the column into the line', () => {
        setContent(['a very long first line indeed', 'short']);
        setCursor({ row: 0, col: 25 });
        type('j');
        const cursor = getCursor();
        expect(cursor.row).toBe(1);
        expect(cursor.col).toBeLessThanOrEqual('short'.length - 1);
    });

    it('x at end of a line after clamping deletes the character under the cursor', () => {
        setContent(['abcdefghij', 'xyz']);
        setCursor({ row: 0, col: 9 });
        type('j', 'x');
        expect(getContent()[1]).toBe('xy');
    });
});
