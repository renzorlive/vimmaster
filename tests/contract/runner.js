import { validateLesson } from './validator.js';

// Import all rules to register them
import './rules/id.js';
import './rules/buffer.js';
import './rules/cursor.js';
import './rules/objective.js';
import './rules/solution.js';
import './rules/unknown-fields.js';

// Import content to validate
import { levels } from '../../js/levels.js';
import { vimLessons } from '../../js/cheat-mode.js';

// Aggregate all lessons
const allLessons = [];

// From levels.js (indexed)
levels.forEach((lesson, index) => {
    allLessons.push({ lesson, fallbackId: `Level ${index}` });
});

// From cheat-mode.js (object map)
for (const [key, lesson] of Object.entries(vimLessons)) {
    allLessons.push({ lesson, fallbackId: `CheatMode ${key}` });
}

let totalErrors = 0;
let totalWarnings = 0;
let totalInfos = 0;

console.log('\n🔍 Running VIM Master Contract Suite\n');

for (const { lesson, fallbackId } of allLessons) {
    const errors = validateLesson(lesson, fallbackId);
    
    if (errors.length === 0) {
        console.log(`✓ ${lesson.name || fallbackId}`);
        continue;
    }

    // Determine the highest severity for this lesson to color the status
    const hasError = errors.some(e => e.severity === 'error');
    const hasWarning = errors.some(e => e.severity === 'warning');
    
    if (hasError) {
        console.log(`\x1b[31m✗\x1b[0m ${lesson.name || fallbackId}`);
    } else if (hasWarning) {
        console.log(`\x1b[33m⚠\x1b[0m ${lesson.name || fallbackId}`);
    } else {
        console.log(`\x1b[36mℹ\x1b[0m ${lesson.name || fallbackId}`);
    }

    // Print all violations
    for (const err of errors) {
        if (err.severity === 'error') {
            totalErrors++;
            console.log(`  \x1b[31m${err.ruleId || 'ERROR'}\x1b[0m ${err.message}`);
        } else if (err.severity === 'warning') {
            totalWarnings++;
            console.log(`  \x1b[33m${err.ruleId || 'WARN'}\x1b[0m ${err.message}`);
        } else {
            totalInfos++;
            console.log(`  \x1b[36m${err.ruleId || 'INFO'}\x1b[0m ${err.message}`);
        }
        
        if (err.suggestion) {
            console.log(`    ↳ \x1b[90m${err.suggestion}\x1b[0m`);
        }
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
