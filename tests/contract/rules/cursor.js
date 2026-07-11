import { registerRule } from '../validator.js';

registerRule({
    id: 'L003',
    name: 'Cursor Invalid',
    severity: 'error',
    validate: (lesson, report) => {
        // Declarative start position: must be a well-formed {row, col} that
        // sits INSIDE the initial buffer (issue #26, Tier 1). The runtime
        // clamp in initializeLessonState remains as defense-in-depth; CI is
        // the enforcement point.
        if (lesson.initialCursor !== undefined) {
            const cursor = lesson.initialCursor;
            if (typeof cursor !== 'object' || cursor === null) {
                report('`initialCursor` must be an object {row, col}.', 'initialCursor');
            } else if (!Number.isInteger(cursor.row) || !Number.isInteger(cursor.col)) {
                report('`initialCursor` must contain integer `row` and `col`.', 'initialCursor');
            } else if (Array.isArray(lesson.initialContent) && lesson.initialContent.length > 0) {
                const { row, col } = cursor;
                if (row < 0 || row >= lesson.initialContent.length) {
                    report(
                        `\`initialCursor.row\` ${row} is outside the buffer (0..${lesson.initialContent.length - 1}).`,
                        'initialCursor.row'
                    );
                } else {
                    const line = lesson.initialContent[row];
                    const maxCol = Math.max(0, (typeof line === 'string' ? line.length : 1) - 1);
                    if (col < 0 || col > maxCol) {
                        report(
                            `\`initialCursor.col\` ${col} is outside line ${row} (0..${maxCol}).`,
                            'initialCursor.col'
                        );
                    }
                }
            }
        }

        // Legacy fields kept for backward compatibility
        if (lesson.startCursor !== undefined) {
            if (typeof lesson.startCursor !== 'object' || lesson.startCursor === null) {
                report('`startCursor` must be an object {row, col}.', 'startCursor');
            } else if (typeof lesson.startCursor.row !== 'number' || typeof lesson.startCursor.col !== 'number') {
                report('`startCursor` must contain numeric `row` and `col`.', 'startCursor');
            }
        }

        // For legacy `setup`, we can't fully validate the exact bounds statically
        // without executing it, but if it is provided, it must be a function.
        if (lesson.setup !== undefined && typeof lesson.setup !== 'function') {
            report('Legacy `setup` must be a function.', 'setup');
        }
    }
});
