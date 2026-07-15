/**
 * Repository-wide (semantic) content validation — Tier 2 of the content
 * validator (issue #26).
 *
 * Per-lesson rules (tests/contract/rules/*) can only see one lesson at a
 * time; these rules receive the FULL content set and catch what per-file
 * validation cannot: duplicate IDs, dangling cross-lesson references, and
 * curriculum-ordering inconsistencies.
 *
 * Reporting contract (issue #26): every violation carries the lesson's
 * file path and a schema location, all violations are collected in one
 * run, and the caller exits non-zero once at the end.
 */

export const lessonFilePath = (lesson) =>
    lesson && typeof lesson.id === 'string' ? `content/lessons/${lesson.id}.json` : '<unknown lesson file>';

/**
 * @param {Array<Object>} lessons - every lesson in the content set
 * @param {Object} index - parsed content/index.json ({ regularLessons, practiceLessons })
 * @returns {Array<{ruleId, severity, filePath, location, message, suggestion}>}
 */
export function validateContentSet(lessons, index) {
    const violations = [];
    const report = (ruleId, lesson, location, message, suggestion = null) => {
        violations.push({
            ruleId,
            severity: 'error',
            filePath: lessonFilePath(lesson),
            location,
            message,
            suggestion
        });
    };

    // S001 — lesson IDs must be unique across the whole content set
    const byId = new Map();
    for (const lesson of lessons) {
        if (typeof lesson.id !== 'string') continue; // per-lesson L001 reports this
        if (byId.has(lesson.id)) {
            report('S001', lesson, 'id',
                `Duplicate lesson ID '${lesson.id}' (also defined by another lesson).`,
                'Lesson IDs must be unique across content/lessons/.');
        } else {
            byId.set(lesson.id, lesson);
        }
    }

    // S002 — cross-lesson references must resolve
    for (const lesson of lessons) {
        const prerequisites = lesson.metadata?.prerequisites;
        if (!Array.isArray(prerequisites)) continue; // per-lesson L012 reports this
        for (const ref of prerequisites) {
            if (!byId.has(ref)) {
                report('S002', lesson, 'metadata.prerequisites',
                    `Prerequisite '${ref}' does not match any lesson ID.`,
                    'Reference an existing lesson id from content/lessons/.');
            }
        }
    }

    // S003 — curriculum order must be unique within each track
    const orderSeen = new Map(); // order number -> first lesson
    for (const lesson of lessons) {
        const order = lesson.metadata?.order;
        if (typeof order !== 'number') continue; // per-lesson L012 reports this
        if (orderSeen.has(order)) {
            report('S003', lesson, 'metadata.order',
                `Curriculum order ${order} is already used by '${orderSeen.get(order).id}'.`,
                'Each lesson needs a distinct metadata.order.');
        } else {
            orderSeen.set(order, lesson);
        }
    }

    // S004 — content/index.json must agree with the lesson set, both ways
    if (index && Array.isArray(index.regularLessons) && Array.isArray(index.practiceLessons)) {
        const indexed = [...index.regularLessons, ...index.practiceLessons];
        for (const id of indexed) {
            if (!byId.has(id)) {
                violations.push({
                    ruleId: 'S004',
                    severity: 'error',
                    filePath: 'content/index.json',
                    location: 'regularLessons/practiceLessons',
                    message: `Index lists '${id}' but no such lesson exists.`,
                    suggestion: 'Regenerate the index with `npm run build:content`.'
                });
            }
        }
        const indexedSet = new Set(indexed);
        for (const lesson of lessons) {
            if (typeof lesson.id === 'string' && !indexedSet.has(lesson.id)) {
                report('S004', lesson, 'id',
                    `Lesson '${lesson.id}' exists but is missing from content/index.json.`,
                    'Regenerate the index with `npm run build:content`.');
            }
        }
    }

    return violations;
}
