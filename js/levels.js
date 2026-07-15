// VIM Master Game - Level Definitions and Management

// Import global state variables for backward compatibility
import {
    resetLevelState, setContent, setCursor, setMode,
    setCurrentLevel, setCommandHistory
} from './game-state.js';

// Level Definitions
import { loadRegularLessons } from './content-loader.js';
import { logger, CATEGORIES } from './logger.js';
export const levels = loadRegularLessons();

// Lesson Initialization Pipeline
//
// The ONLY way lesson-shaped content (game levels, cheat-mode practice,
// future JSON lessons) becomes playable state. The full pipeline is
// specified in docs/architecture/level-lifecycle.md (ADR-0005); parallel
// initialization code paths are not accepted.
//
// Schema validation is enforced in CI by the content validator
// (tests/contract/: per-lesson rules + semantic-rules.js — issue #26):
// cursor within buffer, buffer shape, objective validity, solution key
// tokens, unique IDs, resolvable prerequisites, index consistency; the
// Golden Suite replays every solution. The guards below remain as
// runtime defense-in-depth for content loaded outside CI.

// Exactly one of these must be present on every lesson — it is the objective.
const WIN_CONDITION_PROPS = ['target', 'targetText', 'targetContent', 'exCommands'];

// Lesson properties that are defined by the content schema but consumed
// outside runtime initialization: `solution` is replayed by the Golden
// Suite in CI, the rest are read by the UI/content tooling. Acknowledged
// here so the consumption invariant only flags genuinely unknown fields.
// Keep in sync with ALLOWED_FIELDS in tests/contract/rules/unknown-fields.js.
const PASSIVE_LESSON_PROPS = ['id', 'version', 'metadata', 'focusCommand', 'solution', 'startCursor'];

export const initializeLessonState = (lesson) => {
    // --- lesson validates -------------------------------------------------
    if (!lesson || !Array.isArray(lesson.initialContent) || lesson.initialContent.length === 0) {
        logger.warn(CATEGORIES.LESSON, `Lesson "${lesson?.name ?? '?'}" has no valid initialContent buffer — not loaded`, { lessonId: lesson?.id });
        return false;
    }

    // Invariant: every lesson property must be consumed exactly once during
    // initialization. Properties are read through this tracker; anything left
    // unread at the end is reported immediately (a field the engine ignores
    // is a silent bug — the root cause of TD-2).
    const consumed = new Set();
    const read = (prop) => { consumed.add(prop); return lesson[prop]; };

    // Metadata (rendered by the UI from game state / level lookups)
    read('name');
    read('instructions');

    // Objective: register the win condition; exactly one is required.
    const objectives = WIN_CONDITION_PROPS.filter((prop) => prop in lesson);
    objectives.forEach(read);
    if (objectives.length !== 1) {
        logger.warn(CATEGORIES.LESSON, `Lesson "${lesson.name}" must define exactly one win condition, found ${objectives.length}`, { lessonId: lesson.id, objectives });
    }

    // --- state initializes ------------------------------------------------
    const buffer = read('initialContent');
    setContent(buffer);

    // --- cursor created (defaults) -----------------------------------------
    const init = {
        cursor: { row: 0, col: 0 },
        mode: 'NORMAL',
        commandHistory: ''
    };

    // --- cursor positioned --------------------------------------------------
    // Declarative start position from content (JSON lessons)…
    const initialCursor = read('initialCursor');
    if (initialCursor && typeof initialCursor === 'object') {
        init.cursor = { row: initialCursor.row, col: initialCursor.col };
    }

    // …then legacy setup() may customize further; its result IS applied —
    // lesson configuration is never silently ignored.
    const setup = read('setup');
    if (typeof setup === 'function') {
        setup(init);
    }

    // Schema fields consumed outside runtime init (CI, UI, tooling)
    PASSIVE_LESSON_PROPS.forEach(read);

    // Clamp the requested cursor into the buffer: a bad position is
    // corrected and reported, never silently accepted (corrective, not
    // destructive — see level-lifecycle.md failure policy).
    const requestedRow = Number.isInteger(init.cursor?.row) ? init.cursor.row : 0;
    const requestedCol = Number.isInteger(init.cursor?.col) ? init.cursor.col : 0;
    const row = Math.min(Math.max(requestedRow, 0), buffer.length - 1);
    const col = Math.min(Math.max(requestedCol, 0), Math.max(0, buffer[row].length - 1));
    if (row !== requestedRow || col !== requestedCol) {
        logger.warn(CATEGORIES.LESSON, `Lesson "${lesson.name}" start cursor {${requestedRow},${requestedCol}} is outside the buffer — clamped to {${row},${col}}`, { lessonId: lesson.id });
    }

    setCursor({ row, col });
    setMode(init.mode === 'INSERT' ? 'INSERT' : 'NORMAL');
    setCommandHistory(typeof init.commandHistory === 'string' ? init.commandHistory : '');

    // --- consumption check --------------------------------------------------
    const unconsumed = Object.keys(lesson).filter((key) => !consumed.has(key));
    if (unconsumed.length > 0) {
        logger.warn(CATEGORIES.LESSON, `Lesson "${lesson.name}" has properties that were never consumed during initialization: ${unconsumed.join(', ')} — see docs/architecture/level-lifecycle.md`, { lessonId: lesson.id, unconsumed });
    }

    // buffer rendered / game starts: the caller triggers updateUI()
    return true;
};

// Level Management Functions
export const loadLevel = (levelIndex) => {
    if (levelIndex < 0 || levelIndex >= levels.length) {
        return false;
    }

    setCurrentLevel(levelIndex);
    resetLevelState();
    return initializeLessonState(levels[levelIndex]);
};

export const getCurrentLevelFromGameState = (gameState) => {
    return levels[gameState.currentLevel];
};

export const getLevelCount = () => levels.length;

export const isLastLevel = (gameState) => {
    return gameState.currentLevel === levels.length - 1;
};
