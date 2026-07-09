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

        if (meta.order === undefined || typeof meta.order !== 'number') {
            report('Metadata is missing or has invalid `order`.', 'metadata.order', 'Must be a number (e.g. 1, 2, 3) representing curriculum order.');
        }

        if (!meta.author || typeof meta.author !== 'string') {
            report('Missing or invalid author.', 'metadata.author', 'Author name is required (e.g. "VIM Master Team").');
        }

        if (!meta.githubUsername || typeof meta.githubUsername !== 'string') {
            report('Missing or invalid githubUsername.', 'metadata.githubUsername', 'GitHub username is required (e.g. "github").');
        }

        if (meta.difficulty) {
            if (!['beginner', 'intermediate', 'advanced'].includes(meta.difficulty)) {
                report(`Invalid difficulty '${meta.difficulty}'.`, 'metadata.difficulty', 'Must be beginner, intermediate, or advanced.');
            }
        }

        if (meta.estimatedTime === undefined || typeof meta.estimatedTime !== 'number') {
            report('Missing or invalid estimatedTime.', 'metadata.estimatedTime', 'Estimated time in seconds is required.');
        }

        if (!Array.isArray(meta.prerequisites)) {
            report('Missing or invalid prerequisites.', 'metadata.prerequisites', 'Must be an array of slugs (can be empty []).');
        }

        if (!Array.isArray(meta.learningObjectives)) {
            report('Missing or invalid learningObjectives.', 'metadata.learningObjectives', 'Must be an array of strings (can be empty []).');
        }

        if (!Array.isArray(meta.tags)) {
            report('Missing or invalid tags.', 'metadata.tags', 'Must be an array of strings (can be empty []).');
        }
    }
});
