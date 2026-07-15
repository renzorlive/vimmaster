/**
 * Content validator — issue #26.
 *
 * Proves both validation tiers catch every violation class from the
 * acceptance criteria, and that the reporting contract holds: ALL
 * violations are collected in one run (never stop-at-first), each carrying
 * a file path and schema location.
 */

import { describe, it, expect } from 'vitest';
import { validateLesson, getRegisteredRules } from '../../tests/contract/validator.js';
import { validateContentSet, lessonFilePath } from '../../tests/contract/semantic-rules.js';

// Register the per-lesson rules
import '../../tests/contract/rules/id.js';
import '../../tests/contract/rules/cursor.js';
import '../../tests/contract/rules/buffer.js';
import '../../tests/contract/rules/solution.js';
import '../../tests/contract/rules/objective.js';
import '../../tests/contract/rules/unknown-fields.js';
import '../../tests/contract/rules/metadata.js';

const validMeta = {
    revision: 1,
    author: 'Test',
    githubUsername: 'test',
    created: '2026-07-11',
    difficulty: 'beginner',
    tags: ['normal'],
    estimatedTime: 30,
    prerequisites: [],
    learningObjectives: [],
    order: 900
};

const validLesson = (overrides = {}) => ({
    id: 'lesson-fixture-valid',
    version: 1,
    name: 'Fixture',
    metadata: { ...validMeta },
    instructions: 'Do the thing.',
    initialContent: ['hello world'],
    initialCursor: { row: 0, col: 0 },
    target: { row: 0, col: 6 },
    solution: ['w'],
    ...overrides
});

const ruleIds = (violations) => violations.map((v) => v.ruleId);

describe('Tier 1 — per-lesson schema rules', () => {
    it('accepts a fully valid lesson with zero violations', () => {
        expect(validateLesson(validLesson(), 'fixture')).toEqual([]);
    });

    it('rejects an out-of-bounds initialCursor (row and col)', () => {
        const rowViolations = validateLesson(
            validLesson({ initialCursor: { row: 9, col: 0 } }), 'fixture');
        expect(ruleIds(rowViolations)).toContain('L003');

        const colViolations = validateLesson(
            validLesson({ initialCursor: { row: 0, col: 999 } }), 'fixture');
        expect(ruleIds(colViolations)).toContain('L003');
    });

    it('rejects unknown fields (typo protection)', () => {
        const violations = validateLesson(validLesson({ taget: { row: 0, col: 1 } }), 'fixture');
        expect(ruleIds(violations)).toContain('L010');
    });

    it('rejects zero and multiple win conditions', () => {
        const none = validLesson();
        delete none.target;
        expect(ruleIds(validateLesson(none, 'fixture'))).toContain('L005');

        const both = validLesson({ targetText: { line: 0, text: 'x' } });
        expect(ruleIds(validateLesson(both, 'fixture'))).toContain('L011');
    });

    it('rejects invalid command sequences in solution', () => {
        const violations = validateLesson(
            validLesson({ solution: ['w', 'NotAKey', 42, 'Ctrl+r'] }), 'fixture');
        const l007 = violations.filter((v) => v.ruleId === 'L007');
        // Both bad entries reported — not just the first
        expect(l007.length).toBe(2);
        expect(l007.map((v) => v.field)).toEqual(['solution[1]', 'solution[2]']);
    });

    it('reports ALL violations in one run, never stopping at the first', () => {
        const broken = validLesson({
            initialCursor: { row: 9, col: 9 },     // L003
            taget: {},                              // L010
            solution: [null],                       // L007
            targetText: { line: 0, text: 'x' }      // L011 (second objective)
        });
        const violations = validateLesson(broken, 'fixture');
        const ids = new Set(ruleIds(violations));
        expect(ids.has('L003')).toBe(true);
        expect(ids.has('L010')).toBe(true);
        expect(ids.has('L007')).toBe(true);
        expect(ids.has('L011')).toBe(true);
    });
});

describe('Tier 2 — repository-wide semantic rules', () => {
    const indexFor = (lessons) => ({
        regularLessons: lessons.map((l) => l.id),
        practiceLessons: []
    });

    it('accepts a consistent content set', () => {
        const a = validLesson({ id: 'lesson-a', metadata: { ...validMeta, order: 1 } });
        const b = validLesson({ id: 'lesson-b', metadata: { ...validMeta, order: 2, prerequisites: ['lesson-a'] } });
        expect(validateContentSet([a, b], indexFor([a, b]))).toEqual([]);
    });

    it('S001: rejects duplicate lesson IDs', () => {
        const a = validLesson({ id: 'lesson-dup', metadata: { ...validMeta, order: 1 } });
        const b = validLesson({ id: 'lesson-dup', metadata: { ...validMeta, order: 2 } });
        const violations = validateContentSet([a, b], indexFor([a]));
        expect(ruleIds(violations)).toContain('S001');
    });

    it('S002: rejects dangling cross-lesson references', () => {
        const a = validLesson({
            id: 'lesson-a',
            metadata: { ...validMeta, order: 1, prerequisites: ['lesson-ghost'] }
        });
        const violations = validateContentSet([a], indexFor([a]));
        const s002 = violations.find((v) => v.ruleId === 'S002');
        expect(s002).toBeTruthy();
        expect(s002.filePath).toBe('content/lessons/lesson-a.json');
        expect(s002.location).toBe('metadata.prerequisites');
    });

    it('S003: rejects duplicate curriculum order', () => {
        const a = validLesson({ id: 'lesson-a', metadata: { ...validMeta, order: 7 } });
        const b = validLesson({ id: 'lesson-b', metadata: { ...validMeta, order: 7 } });
        const violations = validateContentSet([a, b], indexFor([a, b]));
        expect(ruleIds(violations)).toContain('S003');
    });

    it('S004: rejects index/content drift in both directions', () => {
        const a = validLesson({ id: 'lesson-a', metadata: { ...validMeta, order: 1 } });
        const violations = validateContentSet([a], {
            regularLessons: ['lesson-a', 'lesson-listed-but-missing'],
            practiceLessons: []
        });
        expect(ruleIds(violations)).toContain('S004');

        const unlisted = validateContentSet([a], { regularLessons: [], practiceLessons: [] });
        expect(ruleIds(unlisted)).toContain('S004');
    });

    it('reports ALL semantic violations in one run with file paths', () => {
        const a = validLesson({ id: 'lesson-dup', metadata: { ...validMeta, order: 1, prerequisites: ['lesson-ghost'] } });
        const b = validLesson({ id: 'lesson-dup', metadata: { ...validMeta, order: 1 } });
        const violations = validateContentSet([a, b], { regularLessons: ['lesson-phantom'], practiceLessons: [] });
        const ids = new Set(ruleIds(violations));
        expect(ids.has('S001')).toBe(true);
        expect(ids.has('S002')).toBe(true);
        expect(ids.has('S003')).toBe(true);
        expect(ids.has('S004')).toBe(true);
        for (const v of violations) {
            expect(v.filePath).toBeTruthy();
        }
    });
});

describe('helpers', () => {
    it('lessonFilePath maps ids to content file paths', () => {
        expect(lessonFilePath({ id: 'lesson-x' })).toBe('content/lessons/lesson-x.json');
        expect(lessonFilePath({})).toBe('<unknown lesson file>');
    });

    it('rule registry is populated (guards against silent import breakage)', () => {
        expect(getRegisteredRules().length).toBeGreaterThanOrEqual(7);
    });
});
