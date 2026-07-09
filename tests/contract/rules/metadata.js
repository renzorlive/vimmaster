import { registerRule } from '../validator.js';

registerRule({
    id: 'L012',
    name: 'Version and Metadata Valid',
    severity: 'error',
    validate: (lesson, report) => {
        if (lesson.version !== 1) {
            report('Lesson is missing or has invalid `version`.', 'version', 'Must be `version: 1`');
        }

        if (!lesson.metadata) {
            report('Lesson is missing `metadata` object.', 'metadata', 'Required in V2');
            return;
        }

        const meta = lesson.metadata;
        if (meta.revision === undefined || typeof meta.revision !== 'number') {
            report('Metadata is missing or has invalid `revision`.', 'metadata.revision', 'Must be a number (e.g. 1)');
        }

        if (meta.difficulty) {
            if (!['beginner', 'intermediate', 'advanced'].includes(meta.difficulty)) {
                report(`Invalid difficulty '${meta.difficulty}'.`, 'metadata.difficulty', 'Must be beginner, intermediate, or advanced.');
            }
        }

        if (meta.estimatedTime !== undefined && typeof meta.estimatedTime !== 'number') {
            report('Invalid estimatedTime.', 'metadata.estimatedTime', 'Must be a number.');
        }

        if (meta.prerequisites !== undefined && !Array.isArray(meta.prerequisites)) {
            report('Invalid prerequisites.', 'metadata.prerequisites', 'Must be an array of slugs.');
        }
    }
});
