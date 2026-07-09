import { registerRule } from '../validator.js';

registerRule({
    id: 'L001',
    name: 'Lesson ID Missing',
    // Status: Temporary warning. Becomes error in PR23 when content is extracted.
    severity: 'warning',
    validate: (lesson, report) => {
        if (!lesson.id || typeof lesson.id !== 'string' || lesson.id.trim() === '') {
            report(
                'Lesson is missing a unique string `id`.',
                'id',
                'Add an `id` field (e.g., `id: "lesson-01-movement"`). Note: this rule will become an ERROR in PR23.'
            );
        }
    }
});
