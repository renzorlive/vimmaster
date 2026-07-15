import { validateLesson } from './validator.js';
import { validateContentSet, lessonFilePath } from './semantic-rules.js';

// Import all per-lesson rules to register them (Tier 1)
import './rules/id.js';
import './rules/cursor.js';
import './rules/buffer.js';
import './rules/solution.js';
import './rules/objective.js';
import './rules/unknown-fields.js';
import './rules/metadata.js';
import './rules/initial-state.js';

// Import content to validate
import { levels } from '../../js/levels.js';
import { vimLessons } from '../../js/cheat-mode.js';
import { loadIndex } from '../../js/content-loader.js';

// Aggregate all lessons — regular levels AND practice lessons.
// (vimLessons is a Map: it must be iterated with .entries(); the previous
// Object.entries() returned nothing, silently skipping all practice lessons.)
const allLessons = [];

levels.forEach((lesson, index) => {
    allLessons.push({ lesson, fallbackId: `Level ${index}` });
});

for (const [key, lesson] of vimLessons.entries()) {
    allLessons.push({ lesson, fallbackId: `Practice ${key}` });
}

let totalErrors = 0;
let totalWarnings = 0;
let totalInfos = 0;

// Reporting contract (issue #26): every violation is printed with the
// lesson's file path and schema location; ALL violations across ALL lessons
// are collected in one run; a single non-zero exit happens at the end.
const printViolation = (severityColor, ruleId, filePath, location, message, suggestion) => {
    console.log(`  ${severityColor}${ruleId}\x1b[0m ${filePath} → ${location || '(lesson)'}`);
    console.log(`    ${message}`);
    if (suggestion) {
        console.log(`    ↳ \x1b[90m${suggestion}\x1b[0m`);
    }
};

console.log('\n🔍 Running VIM Master Contract Suite\n');

// ---- Tier 1: per-lesson (schema-level) ------------------------------------
for (const { lesson, fallbackId } of allLessons) {
    const errors = validateLesson(lesson, fallbackId);

    if (errors.length === 0) {
        console.log(`✓ ${lesson.name || fallbackId}`);
        continue;
    }

    const hasError = errors.some(e => e.severity === 'error');
    const hasWarning = errors.some(e => e.severity === 'warning');

    if (hasError) {
        console.log(`\x1b[31m✗\x1b[0m ${lesson.name || fallbackId}`);
    } else if (hasWarning) {
        console.log(`\x1b[33m⚠\x1b[0m ${lesson.name || fallbackId}`);
    } else {
        console.log(`\x1b[36mℹ\x1b[0m ${lesson.name || fallbackId}`);
    }

    for (const err of errors) {
        const filePath = lessonFilePath(lesson);
        if (err.severity === 'error') {
            totalErrors++;
            printViolation('\x1b[31m', err.ruleId || 'ERROR', filePath, err.field, err.message, err.suggestion);
        } else if (err.severity === 'warning') {
            totalWarnings++;
            printViolation('\x1b[33m', err.ruleId || 'WARN', filePath, err.field, err.message, err.suggestion);
        } else {
            totalInfos++;
            printViolation('\x1b[36m', err.ruleId || 'INFO', filePath, err.field, err.message, err.suggestion);
        }
    }
}

// ---- Tier 2: repository-wide (semantic) ------------------------------------
console.log('\n🧭 Semantic checks (whole content set)\n');

const semanticViolations = validateContentSet(
    allLessons.map(({ lesson }) => lesson),
    loadIndex()
);

if (semanticViolations.length === 0) {
    console.log('✓ IDs unique, prerequisites resolve, curriculum order consistent, index in sync');
} else {
    for (const v of semanticViolations) {
        totalErrors++;
        printViolation('\x1b[31m', v.ruleId, v.filePath, v.location, v.message, v.suggestion);
    }
}

console.log('\n--------------------------------');
console.log(`Lessons checked: ${allLessons.length}`);
console.log(`\x1b[31mErrors:   ${totalErrors}\x1b[0m`);
console.log(`\x1b[33mWarnings: ${totalWarnings}\x1b[0m`);
console.log(`\x1b[36mInfos:    ${totalInfos}\x1b[0m`);
console.log('--------------------------------\n');

if (totalErrors > 0) {
    process.exit(1);
} else {
    process.exit(0);
}
