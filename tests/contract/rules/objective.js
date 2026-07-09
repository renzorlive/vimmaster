import { registerRule } from '../validator.js';

const VALID_OBJECTIVES = ['target', 'targetText', 'targetContent', 'exCommands'];

registerRule({
    id: 'L005',
    name: 'Objective Missing',
    severity: 'error',
    validate: (lesson, report) => {
        const objectivesCount = VALID_OBJECTIVES.filter(prop => prop in lesson).length;
        if (objectivesCount === 0) {
            report(
                'Lesson is missing a win condition (objective).',
                'objective',
                `Provide exactly one of: ${VALID_OBJECTIVES.join(', ')}.`
            );
        }
    }
});

registerRule({
    id: 'L011',
    name: 'Multiple Objectives Defined',
    severity: 'error',
    validate: (lesson, report) => {
        const objectivesFound = VALID_OBJECTIVES.filter(prop => prop in lesson);
        if (objectivesFound.length > 1) {
            report(
                `Lesson defines multiple win conditions: ${objectivesFound.join(', ')}.`,
                'objective',
                'A lesson can only have exactly one win condition.'
            );
        }
    }
});
