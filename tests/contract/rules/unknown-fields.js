import { registerRule } from '../validator.js';

// The definitive list of all allowed properties on a lesson object.
const ALLOWED_FIELDS = new Set([
    'id',
    'name',
    'instructions',
    'initialContent',
    'target',
    'targetText',
    'targetContent',
    'exCommands',
    'startCursor',
    'setup', // Legacy setup function
    'solution',
    'version',
    'metadata'
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
    }
});
