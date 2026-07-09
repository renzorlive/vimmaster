import { registerRule } from '../validator.js';

registerRule({
    id: 'L007',
    name: 'Missing Solution',
    // Status: Temporary warning. Becomes error in PR24.
    severity: 'warning',
    validate: (lesson, report) => {
        if (!lesson.solution || !Array.isArray(lesson.solution)) {
            report(
                'Lesson is missing a `solution` array.',
                'solution',
                'Provide an array of key presses that solve the lesson. Note: this rule will become an ERROR in PR24.'
            );
        } else if (lesson.solution.length === 0) {
            report('The `solution` array is empty.', 'solution');
        }
    }
});
