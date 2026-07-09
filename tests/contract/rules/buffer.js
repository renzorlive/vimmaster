import { registerRule } from '../validator.js';

registerRule({
    id: 'L004',
    name: 'Buffer Empty or Invalid',
    severity: 'error',
    validate: (lesson, report) => {
        if (!lesson.initialContent) {
            report('Lesson is missing `initialContent`.', 'initialContent', 'Provide an array of strings representing the buffer.');
            return;
        }

        if (!Array.isArray(lesson.initialContent)) {
            report('`initialContent` must be an array of strings.', 'initialContent');
            return;
        }

        if (lesson.initialContent.length === 0) {
            report('`initialContent` buffer is empty.', 'initialContent', 'Provide at least one line of text.');
            return;
        }

        for (let i = 0; i < lesson.initialContent.length; i++) {
            if (typeof lesson.initialContent[i] !== 'string') {
                report(`Line ${i} in \`initialContent\` is not a string.`, 'initialContent');
            }
        }
    }
});
