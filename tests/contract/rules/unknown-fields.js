import { registerRule } from '../validator.js';

// The definitive list of all allowed properties on a lesson object.
const ALLOWED_FIELDS = new Set([
    'id',
    'name',
    'instructions',
    'initialContent',
    'initialCursor',
    'target',
    'targetText',
    'targetContent',
    'exCommands',
    'startCursor',
    'setup', // Legacy setup function
    'solution',
    'version',
    'metadata',
    'focusCommand'
]);

const ALLOWED_METADATA_FIELDS = new Set([
    'revision',
    'author',
    'githubUsername',
    'created',
    'difficulty',
    'tags',
    'estimatedTime',
    'prerequisites',
    'learningObjectives'
]);

registerRule({
    id: 'L010',
    name: 'Unknown Property',
    severity: 'warning',
    validate: (lesson, report) => {
        for (const key of Object.keys(lesson)) {
            if (!ALLOWED_FIELDS.has(key)) {
                report(
                    `Unknown property found: '${key}'.`,
                    key,
                    'Check for typos. Allowed properties are: ' + Array.from(ALLOWED_FIELDS).join(', ')
                );
            }
        }

        if (lesson.metadata) {
            for (const key of Object.keys(lesson.metadata)) {
                if (!ALLOWED_METADATA_FIELDS.has(key)) {
                    report(
                        `Unknown metadata property found: '${key}'.`,
                        `metadata.${key}`,
                        'Check for typos. Allowed metadata properties are: ' + Array.from(ALLOWED_METADATA_FIELDS).join(', ')
                    );
                }
            }
        }
    }
});
