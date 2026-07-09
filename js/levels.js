// VIM Master Game - Level Definitions and Management

// Import global state variables for backward compatibility
import { 
    getContent, getCursor, getMode, getCurrentLevel, getCommandHistory, getCommandLog,
    getYankedLine, getReplacePending, getCountBuffer, getUndoStack, getRedoStack,
    getLevel12Undo, getLevel12RedoAfterUndo, getLastExCommand, getSearchMode,
    getSearchQuery, getLastSearchQuery, getLastSearchDirection, getSearchMatches,
    getCurrentMatchIndex, getUsedSearchInLevel, getNavCountSinceSearch, getBadges,
    getPracticedCommands, getChallengeMode, getCurrentChallenge, getChallengeTimerInterval,
    getChallengeStartTime, getChallengeScoreValue, getChallengeProgressValue, getCurrentTaskIndex,
    resetLevelState, resetChallengeState, setContent, setCursor, setMode, setCurrentLevel,
    setCommandHistory, setCommandLog, setYankedLine, setReplacePending, setCountBuffer,
    setSearchMode, setSearchQuery, setLastSearchQuery, setLastSearchDirection, setSearchMatches,
    setCurrentMatchIndex, setUsedSearchInLevel, setNavCountSinceSearch, setLevel12Undo,
    setLevel12RedoAfterUndo, setLastExCommand
} from './game-state.js';

// Level Definitions
import { loadRegularLessons } from './content-loader.js';
export const levels = loadRegularLessons();

// Lesson Initialization Pipeline
//
// The ONLY way lesson-shaped content (game levels, cheat-mode practice,
// future JSON lessons) becomes playable state. The full pipeline is
// specified in docs/architecture/level-lifecycle.md (ADR-0005); parallel
// initialization code paths are not accepted.
//
// TODO(validateLessonSchema): when the JSON content system lands
// (docs/ContentSystem.md, Phase 2), replace these runtime guards with a
// schema validator run in CI over every content file: cursor within buffer,
// buffer shape, objective validity, solution replay.

// Exactly one of these must be present on every lesson — it is the objective.
const WIN_CONDITION_PROPS = ['target', 'targetText', 'targetContent', 'exCommands'];

export const initializeLessonState = (lesson) => {
    // --- lesson validates -------------------------------------------------
    if (!lesson || !Array.isArray(lesson.initialContent) || lesson.initialContent.length === 0) {
        console.warn(`VIMMaster: lesson "${lesson?.name ?? '?'}" has no valid initialContent buffer — not loaded`);
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
        console.warn(`VIMMaster: lesson "${lesson.name}" must define exactly one win condition, found ${objectives.length}${objectives.length ? `: ${objectives.join(', ')}` : ''}`);
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
    // setup() customizes the defaults and its result IS applied — lesson
    // configuration is never silently ignored.
    const setup = read('setup');
    if (typeof setup === 'function') {
        setup(init);
    }

    // Clamp the requested cursor into the buffer: a bad position is
    // corrected and reported, never silently accepted (corrective, not
    // destructive — see level-lifecycle.md failure policy).
    const requestedRow = Number.isInteger(init.cursor?.row) ? init.cursor.row : 0;
    const requestedCol = Number.isInteger(init.cursor?.col) ? init.cursor.col : 0;
    const row = Math.min(Math.max(requestedRow, 0), buffer.length - 1);
    const col = Math.min(Math.max(requestedCol, 0), Math.max(0, buffer[row].length - 1));
    if (row !== requestedRow || col !== requestedCol) {
        console.warn(`VIMMaster: lesson "${lesson.name}" start cursor {${requestedRow},${requestedCol}} is outside the buffer — clamped to {${row},${col}}`);
    }

    setCursor({ row, col });
    setMode(init.mode === 'INSERT' ? 'INSERT' : 'NORMAL');
    setCommandHistory(typeof init.commandHistory === 'string' ? init.commandHistory : '');

    // --- consumption check --------------------------------------------------
    const unconsumed = Object.keys(lesson).filter((key) => !consumed.has(key));
    if (unconsumed.length > 0) {
        console.warn(`VIMMaster: lesson "${lesson.name}" has properties that were never consumed during initialization: ${unconsumed.join(', ')} — see docs/architecture/level-lifecycle.md`);
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
