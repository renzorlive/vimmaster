import { registerRule } from '../validator.js';

registerRule({
    id: 'L003',
    name: 'Cursor Invalid',
    severity: 'error',
    validate: (lesson, report) => {
        // We currently do not have a declarative `startCursor` property.
        // The cursor is set via the `setup(gameState)` function in code.
        // We can check if `setup` is a function, and maybe stringify it to ensure it sets cursor.
        // In the future (V2), we will have a declarative `startCursor` field.
        if (lesson.startCursor !== undefined) {
            if (typeof lesson.startCursor !== 'object' || lesson.startCursor === null) {
                report('`startCursor` must be an object {row, col}.', 'startCursor');
            } else if (typeof lesson.startCursor.row !== 'number' || typeof lesson.startCursor.col !== 'number') {
                report('`startCursor` must contain numeric `row` and `col`.', 'startCursor');
            }
        }
        
        // For legacy `setup`, we can't fully validate the exact bounds statically without executing it,
        // but if it is provided, it must be a function.
        if (lesson.setup !== undefined && typeof lesson.setup !== 'function') {
            report('Legacy `setup` must be a function.', 'setup');
        }
    }
});
