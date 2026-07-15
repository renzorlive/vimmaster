/**
 * Unit tests for the caret and WORD motions (issues #5 and #7).
 *
 * `^` — first non-blank character of the line.
 * `W`/`B`/`E` — WORD motions, whitespace-delimited (punctuation stays
 * attached to the WORD, unlike lowercase w/b/e).
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { handleNormalMode } from '../../js/vim-commands.js';
import { resetGameState, setContent, setCursor, setMode, getCursor } from '../../js/game-state.js';

const press = (key) =>
    handleNormalMode({ key, preventDefault: () => {}, ctrlKey: false, altKey: false, shiftKey: false });
const type = (...keys) => keys.forEach(press);
const col = () => getCursor().col;
const row = () => getCursor().row;

beforeEach(() => {
    resetGameState();
    setMode('NORMAL');
});

describe('^ — first non-blank character (issue #5)', () => {
    it('jumps to the first non-blank character', () => {
        setContent(['    hello world']);
        setCursor({ row: 0, col: 12 });
        press('^');
        expect(col()).toBe(4); // first 'h'
    });

    it('goes to column 0 on an all-whitespace line', () => {
        setContent(['      ']);
        setCursor({ row: 0, col: 3 });
        press('^');
        expect(col()).toBe(0);
    });

    it('stays put when already at the first non-blank', () => {
        setContent(['  ab']);
        setCursor({ row: 0, col: 2 });
        press('^');
        expect(col()).toBe(2);
    });
});

describe('W/B/E — WORD motions keep punctuation attached (issue #7)', () => {
    // "foo.bar baz qux"
    //  0123456789...
    it('W skips over punctuation that w would stop on', () => {
        setContent(['foo.bar baz qux']);
        setCursor({ row: 0, col: 0 });
        press('W');
        expect(col()).toBe(8); // start of "baz", not the '.' at col 3
    });

    it('2W jumps two WORDs', () => {
        setContent(['foo.bar baz qux']);
        setCursor({ row: 0, col: 0 });
        type('2', 'W');
        expect(col()).toBe(12); // start of "qux"
    });

    it('W crosses to the next line when no WORD remains', () => {
        setContent(['end', 'next line']);
        setCursor({ row: 0, col: 1 });
        press('W');
        expect(row()).toBe(1);
        expect(col()).toBe(0);
    });

    it('E moves to the end of the WORD, treating punctuation as part of it', () => {
        setContent(['foo.bar baz']);
        setCursor({ row: 0, col: 0 });
        press('E');
        expect(col()).toBe(6); // 'r' — end of "foo.bar"
    });

    it('B moves back to the start of the WORD', () => {
        setContent(['foo.bar baz']);
        setCursor({ row: 0, col: 8 }); // on "baz"
        press('B');
        expect(col()).toBe(0); // start of "foo.bar"
    });

    it('B from mid-WORD goes to that WORD’s start', () => {
        setContent(['alpha beta.gamma']);
        setCursor({ row: 0, col: 12 }); // inside "beta.gamma"
        press('B');
        expect(col()).toBe(6); // start of "beta.gamma"
    });
});
