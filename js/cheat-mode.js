// VIM Master Game - Cheat Mode & Real VIM Lessons

import {
    getPracticedCommands, getContent, setContent, getCursor,
    setCursor, getMode, setMode, getCommandHistory,
    setCommandHistory, getCommandLog, setCommandLog, addPracticedCommand
} from './game-state.js';
import { loadPracticeLessons } from './content-loader.js';

import { initializeLessonState } from './levels.js';
import { updateUI } from './event-handlers.js';
import { logger, CATEGORIES } from './logger.js';

// Command catalog with real VIM lessons
const commandCatalog = [
    {
        category: 'Movement',
        items: [
            { key: 'h / j / k / l', id: 'hjkl', desc: 'Basic movement: left/down/up/right', example: 'Navigate around text with precision.' },
            { key: 'w / b / e', id: 'wbe', desc: 'Word motions: next/back/end', example: 'Jump between words quickly.' },
            { key: 'gg / G', id: 'ggG', desc: 'Go to first/last line', example: 'Jump to file bounds.' },
            { key: '0 / $', id: '0$', desc: 'Line start / end', example: 'Move to start or end of line.' },
        ]
    },
    {
        category: 'Editing',
        items: [
            { key: 'i / a', id: 'ia', desc: 'Insert/Append text', example: 'Enter insert mode to type.' },
            { key: 'x', id: 'x', desc: 'Delete character', example: 'Remove a single character.' },
            { key: 'dd', id: 'dd', desc: 'Delete line', example: 'Remove an entire line.' },
            { key: 'dw', id: 'dw', desc: 'Delete word', example: 'Remove word from cursor.' },
            { key: 'yy / p', id: 'yyp', desc: 'Yank and paste line', example: 'Copy and paste a line.' },
            { key: 'cw', id: 'cw', desc: 'Change word', example: 'Delete word and enter insert.' },
            { key: 'D', id: 'D', desc: 'Delete to end of line', example: 'Trim line from cursor to end.' },
            { key: 'r', id: 'r', desc: 'Replace one character', example: 'Replace character under cursor.' },
        ]
    },
    {
        category: 'Search',
        items: [
            { key: '/text', id: 'search-forward', desc: 'Search forward for text', example: 'Use / then Enter to jump.' },
            { key: '?text', id: 'search-backward', desc: 'Search backward for text', example: 'Use ? then Enter to jump.' },
            { key: 'n / N', id: 'nN', desc: 'Next / Previous match', example: 'Navigate search results.' },
        ]
    },
    {
        category: 'Other',
        items: [
            { key: 'u / Ctrl+r', id: 'undo-redo', desc: 'Undo / Redo changes', example: 'Revert or re-apply edits.' },
            { key: ':q / :wq', id: 'ex', desc: 'Quit / Write & Quit', example: 'Use ex-commands.' },
        ]
    }
];

// Real VIM lessons that work like actual game levels
export const vimLessons = new Map();
const practiceLessons = loadPracticeLessons();
practiceLessons.forEach(lesson => {
    const key = lesson.metadata.tags.find(t => t !== 'practice') || lesson.id;
    vimLessons.set(key, lesson);
});

// Practice mode state
let practiceMode = false;
let originalGameState = null;
let currentLessonSpec = null; // resolved lesson data

// Export practice mode state for main.js to check
export function isInPracticeMode() {
    return practiceMode;
}

// Explicitly focus the hidden editor input used for Vim commands
export function focusEditor() {
    const editorInput = document.getElementById('vim-editor-input');
    if (editorInput) editorInput.focus();
}

// Expose current lesson for UI/validation consumers
export function getCurrentLessonSpec() {
    return currentLessonSpec;
}



// Cheat Panel Functions
export function renderCheatList(cheatContent, filter = '') {
    if (!cheatContent) return;
    
    const q = filter.trim().toLowerCase();
    cheatContent.innerHTML = '';
    commandCatalog.forEach(group => {
        const matchedItems = group.items.filter(it => {
            if (!q) return true;
            return it.key.toLowerCase().includes(q) || it.desc.toLowerCase().includes(q);
        });
        if (matchedItems.length === 0) return;
        const section = document.createElement('div');
        section.innerHTML = `<div class="text-blue-300 font-bold mb-2">${group.category}</div>`;
        const list = document.createElement('div');
        list.className = 'grid grid-cols-1 gap-2';
        matchedItems.forEach(it => {
            const tried = getPracticedCommands().has(it.id);
            const card = document.createElement('button');
            card.className = `text-left bg-gray-900 border ${tried ? 'border-green-600' : 'border-gray-700'} hover:border-yellow-500 rounded-md p-3 flex items-center justify-between`;
            card.innerHTML = `
                <div>
                    <div class="text-yellow-300 font-mono">${it.key}</div>
                    <div class="text-gray-300 text-sm">${it.desc}</div>
                    <div class="text-gray-500 text-xs">${it.example}</div>
                </div>
                <div class="text-xs ${tried ? 'text-green-400' : 'text-blue-400'}">${tried ? '✅ Practiced' : '▶️ Practice'}</div>
            `;
            card.addEventListener('click', () => startCheatPractice(it));
            list.appendChild(card);
        });
        section.appendChild(list);
        cheatContent.appendChild(section);
    });
}

export function openCheat(cheatOverlay, cheatPanel, cheatSearch, cheatContent) {
    if (!cheatOverlay || !cheatPanel || !cheatSearch || !cheatContent) return;
    
    cheatOverlay.classList.remove('hidden');
    cheatPanel.classList.remove('translate-x-full');
    cheatSearch.value = '';
    renderCheatList(cheatContent, '');
    cheatSearch.focus();
}

export function closeCheat(cheatOverlay, cheatPanel, editorInput) {
    if (!cheatOverlay || !cheatPanel) return;
    
    cheatOverlay.classList.add('hidden');
    cheatPanel.classList.add('translate-x-full');
    if (editorInput) editorInput.focus();
}

// Resolve a catalog entry to its practice lesson. `vimLessons` is a Map —
// bracket access on a Map reads properties, not entries, which silently
// broke every Practice button (see practice-mode-lookup regression test).
export function getPracticeLesson(catalogId) {
    return vimLessons.get(catalogId) || null;
}

// Practice Mode Functions - Now creates real VIM lessons
export function startCheatPractice(item) {
    if (practiceMode) {
        return;
    }

    const lesson = getPracticeLesson(item.id);
    if (!lesson) {
        logger.warn(CATEGORIES.LESSON, `No practice lesson found for cheat-sheet entry '${item.id}'`, { catalogId: item.id });
        return;
    }
    
    // Enter practice mode
    practiceMode = true;
    
    // Save current game state
    originalGameState = {
        content: getContent(),
        cursor: getCursor(),
        mode: getMode(),
        commandHistory: getCommandHistory(),
        commandLog: getCommandLog()
    };
    
    // Set up the VIM lesson through the single initialization pipeline
    // (docs/architecture/level-lifecycle.md — same path as real levels)
    if (!initializeLessonState(lesson)) {
        practiceMode = false;
            originalGameState = null;
        return;
    }

    // Cache lesson spec for event-driven completion BEFORE updating UI
    currentLessonSpec = lesson;
    
    // Update the UI to show the lesson
    updateUI();
    
    // IMPORTANT: Update the instructions to show the lesson instructions instead of level instructions
    import('./ui-components.js').then(({ updateInstructions }) => {
        updateInstructions();
    }).catch(error => {
        logger.error(CATEGORIES.UI, 'Failed to update instructions', { error: error.message });
    });
    
    // Auto-close cheat panel for better UX
    const cheatOverlay = document.getElementById('cheat-overlay');
    const cheatPanel = document.getElementById('cheat-panel');
    if (cheatOverlay && cheatPanel) {
        cheatOverlay.classList.add('hidden');
        cheatPanel.classList.add('translate-x-full');
    }
    
    // Remove any existing overlays to prevent conflicts
    const existingLessonOverlay = document.getElementById('lesson-overlay');
    if (existingLessonOverlay) {
        existingLessonOverlay.remove();
    }
    
    const existingCompletionOverlay = document.getElementById('completion-overlay');
    if (existingCompletionOverlay) {
        existingCompletionOverlay.remove();
    }
    
    // Note: For reliability, the editor requires a click to focus in cheat mode.
    // We intentionally avoid auto-focus and custom key handlers here.
     
     // Show lesson interface AFTER focusing the editor
     showLessonInterface(item, lesson);
     
     // Mark as practiced
     addPracticedCommand(item.id);
    
    // Force editor autofocus after lesson overlay renders
    setTimeout(() => {
        const editorInput = document.getElementById('vim-editor-input');
        if (editorInput) editorInput.focus();
    }, 100);
    
}

function showLessonInterface(item, lesson) {
    // Create lesson overlay
    const lessonOverlay = document.createElement('div');
    lessonOverlay.id = 'lesson-overlay';
    // Remove pointer-events-none so the editor beneath can be focused
    lessonOverlay.className = 'fixed inset-0 bg-black/80 backdrop-blur-sm z-40 flex items-center justify-center';
    
    lessonOverlay.innerHTML = `
        <div class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 max-w-4xl mx-auto border border-gray-600/50">
            <div class="text-center mb-6">
                <h2 class="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 mb-2">
                    ${lesson.name}
                </h2>
                <p class="text-gray-300 text-lg">${lesson.instructions}</p>
                <p class="text-yellow-300 text-sm mt-2">👉 Click inside the editor below to focus it before typing.</p>
            </div>
            
            <div class="bg-gray-900 rounded-lg p-4 mb-6 border border-gray-700/50">
                <h3 class="text-blue-400 font-semibold mb-2">🎯 VIM Lesson Active</h3>
                <div class="text-gray-300 text-sm mb-2">The main editor below now contains your lesson content.</div>
                <div class="text-green-300 text-sm">✅ Real VIM functionality - Ready to practice!</div>
            </div>
            
            <div class="text-center">
                <div class="text-gray-400 text-sm mb-4">Practice VIM commands in the main editor. Close this when ready to continue.</div>
                <button id="lesson-close" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300">
                    🎯 Continue Practice
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(lessonOverlay);
    
    // Add event listener for close
    document.getElementById('lesson-close').addEventListener('click', () => {
        closeLesson();
        // Focus editor explicitly here too
        const editorInput = document.getElementById('vim-editor-input');
        if (editorInput) editorInput.focus();
    });
}

// Event-driven completion check (called after each key handling)
export function checkPracticeCompletion() {
    if (!practiceMode || !currentLessonSpec) return;
    const lesson = currentLessonSpec;
    const currentCursor = getCursor();
    const currentContent = getContent();
    
    if (lesson.target && isTargetReached(currentCursor, lesson.target)) {
        showLessonCompletion(lesson, 'Target reached!');
        return;
    }
    if (lesson.targetText && isTargetTextReached(currentContent, lesson.targetText)) {
        showLessonCompletion(lesson, 'Text target achieved!');
        return;
    }
    if (lesson.targetContent && isTargetContentReached(currentContent, lesson.targetContent)) {
        showLessonCompletion(lesson, 'Content target achieved!');
        return;
    }
}

function isTargetReached(cursor, target) {
    return cursor.row === target.row && cursor.col === target.col;
}

function isTargetTextReached(content, targetText) {
    if (targetText.line >= 0 && targetText.line < content.length) {
        return content[targetText.line] === targetText.text;
    }
    return false;
}

function isTargetContentReached(content, targetContent) {
    const trimLineEnd = (line) => line.replace(/\s+$/, '');
    const stripTrailingBlankLines = (lines) => {
        const result = [...lines];
        while (result.length > 0 && trimLineEnd(result[result.length - 1]) === '') {
            result.pop();
        }
        return result;
    };
    const currentLines = stripTrailingBlankLines(content.map(trimLineEnd));
    const targetLines = stripTrailingBlankLines(targetContent.map(trimLineEnd));
    if (currentLines.length !== targetLines.length) return false;
    for (let i = 0; i < currentLines.length; i++) {
        if (currentLines[i] !== targetLines[i]) return false;
    }
    return true;
}

function showLessonCompletion(lesson, message) {
    // Create a new completion overlay since the lesson overlay might be closed
    const completionOverlay = document.createElement('div');
    completionOverlay.id = 'completion-overlay';
    completionOverlay.className = 'fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center';
    
    completionOverlay.innerHTML = `
        <div class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 max-w-4xl mx-auto border border-gray-600/50">
            <div class="text-center mb-6">
                <h2 class="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 mb-2">
                    🎉 Lesson Complete!
                </h2>
                <p class="text-gray-300 text-lg">${lesson.name}</p>
                <p class="text-green-300 text-lg mt-2">${message}</p>
            </div>
            
            <div class="bg-green-900/20 rounded-lg p-4 mb-6 border border-green-600/50">
                <h3 class="text-green-400 font-semibold mb-2">✅ Lesson Completed Successfully!</h3>
                <div class="text-gray-300 text-sm mb-2">You've successfully practiced: ${lesson.instructions}</div>
                <div class="text-green-300 text-sm">Great job! You can now close this lesson and continue practicing.</div>
            </div>
            
            <div class="text-center">
                <button id="completion-close" class="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300">
                    🎯 Close Lesson
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(completionOverlay);
    
    // Add event listener for close
    document.getElementById('completion-close').addEventListener('click', () => {
        completionOverlay.remove();
        // Exit practice mode when lesson is completed
        exitPracticeMode();
    });
    
}

function closeLesson() {
    if (!practiceMode) return;
    
    // Remove lesson overlay
    const lessonOverlay = document.getElementById('lesson-overlay');
    if (lessonOverlay) {
        lessonOverlay.remove();
    }
    
    // DON'T reset practice mode here - keep it active for completion monitoring
    // practiceMode = false;  ← REMOVED
    // currentPractice = null; ← REMOVED
    
}

// Function to exit practice mode and restore game state
export function exitPracticeMode() {
    if (!practiceMode) return;
    
    
    // Restore original game state
    if (originalGameState) {
        setContent(originalGameState.content);
        setCursor(originalGameState.cursor);
        setMode(originalGameState.mode);
        setCommandHistory(originalGameState.commandHistory);
        setCommandLog(originalGameState.commandLog);
    }
    
    // Restore original instructions using centralized function
    import('./ui-components.js').then(({ updateInstructions }) => {
        updateInstructions();
    });
    
    // Remove lesson overlay if it exists
    const lessonOverlay = document.getElementById('lesson-overlay');
    if (lessonOverlay) {
        lessonOverlay.remove();
    }
    
    // Remove completion overlay if it exists
    const completionOverlay = document.getElementById('completion-overlay');
    if (completionOverlay) {
        completionOverlay.remove();
    }
    
    // Reset practice mode
    practiceMode = false;
    originalGameState = null;
    
    // Update UI
    updateUI();
    
}

// Export command catalog for other modules
export { commandCatalog };
