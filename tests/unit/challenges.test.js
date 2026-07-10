/**
 * Unit tests for challenge task scoring — the single source of truth
 * introduced by TD-6 (the former dead endChallenge/checkChallengeTask
 * exports carried a divergent formula that players never experienced).
 */

import { describe, it, expect, afterEach, vi } from 'vitest';
import { calculateTaskPoints, challenges } from '../../js/challenges.js';

describe('calculateTaskPoints (TD-6 single scoring source)', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it('awards base 10 plus 1 point per 10 seconds remaining', () => {
        vi.useFakeTimers();
        const challenge = { timeLimit: 90 };
        const startTime = Date.now();

        // Immediately: 90s remaining → 10 + 9
        expect(calculateTaskPoints(challenge, startTime)).toBe(19);

        // After 45s: 45s remaining → 10 + 4
        vi.advanceTimersByTime(45_000);
        expect(calculateTaskPoints(challenge, startTime)).toBe(14);
    });

    it('never awards less than the base points, even after time runs out', () => {
        vi.useFakeTimers();
        const challenge = { timeLimit: 30 };
        const startTime = Date.now();
        vi.advanceTimersByTime(120_000);
        expect(calculateTaskPoints(challenge, startTime)).toBe(10);
    });

    it('challenge definitions still ship the fields scoring depends on', () => {
        for (const challenge of challenges) {
            expect(typeof challenge.timeLimit).toBe('number');
            expect(Array.isArray(challenge.tasks)).toBe(true);
            expect(challenge.tasks.length).toBeGreaterThan(0);
        }
    });
});
