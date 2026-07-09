import { registerRule } from '../validator.js';

registerRule({
    id: 'L001',
    name: 'Lesson ID Invalid',
    severity: 'error',
    validate: (lesson, report) => {
        if (!lesson.id || typeof lesson.id !== 'string') {
            report('Lesson is missing a unique string `id`.', 'id');
            return;
        }

        const idRegex = /^lesson-[a-z0-9-]+$/;
        if (!idRegex.test(lesson.id)) {
            report(`Lesson ID '${lesson.id}' has invalid format.`, 'id', 'Must match ^lesson-[a-z0-9-]+$');
        }

        if (/^lesson-\d+$/.test(lesson.id)) {
            report(`Lesson ID '${lesson.id}' is too generic.`, 'id', 'Include a descriptive segment, e.g., lesson-insert-basic.');
        }
    }
});
