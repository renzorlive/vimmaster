import { registerRule } from '../validator.js';

registerRule({
    id: 'L007',
    name: 'Missing Solution',
    // Every lesson must be provably solvable: the Golden Suite replays this
    // array in CI. Promoted from warning to error in PR24 as announced.
    severity: 'error',
    validate: (lesson, report) => {
        if (!lesson.solution || !Array.isArray(lesson.solution)) {
            report(
                'Lesson is missing a `solution` array.',
                'solution',
                'Provide an array of key presses that solve the lesson; the Golden Suite replays it to prove the lesson can be won.'
            );
        } else if (lesson.solution.length === 0) {
            report('The `solution` array is empty.', 'solution');
        } else {
            // Each entry must be a valid key token: a single printable
            // character, a named key, or a Ctrl+<char> chord — the formats
            // the Golden replay understands (issue #26: invalid command
            // sequences).
            const NAMED_KEYS = new Set(['Enter', 'Escape', 'Backspace', '<Esc>']);
            lesson.solution.forEach((key, i) => {
                const valid =
                    typeof key === 'string' &&
                    (key.length === 1 ||
                        NAMED_KEYS.has(key) ||
                        /^Ctrl\+.$/i.test(key));
                if (!valid) {
                    report(
                        `\`solution[${i}]\` is not a valid key token: ${JSON.stringify(key)}.`,
                        `solution[${i}]`,
                        "Use single characters ('d'), named keys ('Enter', 'Escape', 'Backspace'), or chords ('Ctrl+r')."
                    );
                }
            });
        }
    }
});
