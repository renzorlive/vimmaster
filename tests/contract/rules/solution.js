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
        }
    }
});
