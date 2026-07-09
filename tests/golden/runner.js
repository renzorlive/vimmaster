import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// --- MOCK ENVIRONMENT ---
// Golden tests run in pure Node.js, so we mock browser globals that might be touched.
global.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {}
};
global.window = {};
global.document = {
    getElementById: () => null
};

// Now we can safely import game modules
import { levels, loadLevel } from '../../js/levels.js';
import { resetGameState, getContent, getCursor, getMode, getLastExCommand, getUsedSearchInLevel, getNavCountSinceSearch, getLastSearchQuery, getLastSearchDirection, getLevel12RedoAfterUndo } from '../../js/game-state.js';
import { evaluateWinCondition } from '../../js/win-evaluator.js';
import { replay } from './replay.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const manifestPath = path.join(__dirname, 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

let totalPassed = 0;
let totalFailed = 0;

console.log('\n🌟 Running VIM Master Golden Suite 🌟\n');

for (const testCase of manifest) {
    const { lessonRef, description, solution, finalBuffer, finalCursor, finalMode, maxSteps = 150 } = testCase;
    
    // Resolve lesson
    // Temporary: lessonRef is an index. In PR23 it will be an ID.
    const lesson = levels[lessonRef];
    
    if (!lesson) {
        console.log(`\x1b[31m✗ FAIL\x1b[0m ${description || lessonRef} (Lesson not found)`);
        totalFailed++;
        continue;
    }

    // Reset Engine State
    resetGameState();
    // Load the level (initializes buffer, mode, cursor)
    loadLevel(lessonRef);

    // Replay keystrokes
    const safeSolution = solution.slice(0, maxSteps);
    replay(safeSolution);

    // Capture Final State
    const state = {
        lastExCommand: getLastExCommand(),
        cursor: getCursor(),
        usedSearchInLevel: getUsedSearchInLevel(),
        navCountSinceSearch: getNavCountSinceSearch(),
        lastSearchQuery: getLastSearchQuery(),
        lastSearchDirection: getLastSearchDirection(),
        content: getContent(),
        mode: getMode(),
        level12RedoAfterUndo: getLevel12RedoAfterUndo()
    };

    let passed = true;
    let failureReasons = [];

    // 1. Verify Engine Win Condition
    const { won, reason } = evaluateWinCondition(state, lesson);
    if (!won) {
        passed = false;
        failureReasons.push(`Win condition not met: ${reason}`);
    }

    // 2. Verify Final Mode
    if (finalMode && state.mode !== finalMode) {
        passed = false;
        failureReasons.push(`Expected mode '${finalMode}', received '${state.mode}'`);
    }

    // 3. Verify Final Cursor
    if (finalCursor) {
        if (state.cursor.row !== finalCursor.row || state.cursor.col !== finalCursor.col) {
            passed = false;
            failureReasons.push(`Expected cursor {row: ${finalCursor.row}, col: ${finalCursor.col}}, received {row: ${state.cursor.row}, col: ${state.cursor.col}}`);
        }
    }

    // 4. Verify Final Buffer
    if (finalBuffer) {
        const expected = finalBuffer.join('\n');
        const received = state.content.join('\n');
        if (expected !== received) {
            passed = false;
            failureReasons.push('Buffer mismatch:\n\x1b[32mExpected buffer:\x1b[0m\n' + expected + '\n\x1b[31mReceived buffer:\x1b[0m\n' + received);
        }
    }

    // Report
    if (passed) {
        console.log(`\x1b[32m✓\x1b[0m ${description || lesson.name}`);
        totalPassed++;
    } else {
        console.log(`\x1b[31m✗\x1b[0m ${description || lesson.name}`);
        for (const failMsg of failureReasons) {
            console.log(`  \x1b[31m${failMsg}\x1b[0m`);
        }
        totalFailed++;
    }
}

console.log('\n--------------------------------');
console.log(`\x1b[32mPASS\x1b[0m ${totalPassed}`);
console.log(`\x1b[31mFAIL\x1b[0m ${totalFailed}`);
console.log('--------------------------------\n');

if (totalFailed > 0) {
    process.exit(1);
} else {
    process.exit(0);
}
