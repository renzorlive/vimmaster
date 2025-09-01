// VIM Master Game - Cheat Mode & Real VIM Lessons

import { 
    getPracticedCommands, getCurrentLevel, getContent, setContent, getCursor, setCursor, getMode, setMode,
    getCommandHistory, setCommandHistory, getCommandLog, setCommandLog, addPracticedCommand
} from './game-state.js';

import { loadLevel } from './levels.js';
import { updateUI } from './event-handlers.js';

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
const vimLessons = {
    'hjkl': {
        name: "Basic Movement Practice",
        instructions: "Use h, j, k, l to move the cursor. Navigate to the target character '$'.",
        initialContent: [
            "Practice basic movement with h(left), j(down), k(up), l(right).",
            "Your cursor starts here.",
            "",
            "The goal is to navigate to the dollar sign below.",
            "Practice moving around the text first.",
            "Once comfortable, move to the '$' target.",
            "Target: $"
        ],
        target: { row: 6, col: 8 },
        setup: (gameState) => { 
            gameState.cursor = { row: 1, col: 5 }; 
            gameState.mode = 'NORMAL';
        }
    },
    'wbe': {
        name: "Word Motion Practice",
        instructions: "Use w (next word), b (back), e (end of word). Get to the end of the 'destination' word.",
        initialContent: [
            "Jumping between words is much faster than character by character.",
            "Use 'w' to jump forwards to the start of the next word.",
            "Use 'b' to jump backwards to the start of the previous word.",
            "Use 'e' to jump to the end of the current word.",
            "Find the ultimate destination."
        ],
        target: { row: 4, col: 28 },
        setup: (gameState) => { 
            gameState.cursor = { row: 0, col: 0 }; 
            gameState.mode = 'NORMAL';
        }
    },
    'ggG': {
        name: "Line Jump Practice",
        instructions: "Use gg to go to the first line, and G to go to the last line. Go to the last character of the last line.",
        initialContent: [
            "This is the first line. Use 'gg' to come here.",
            "Second line",
            "Third line",
            "Fourth line",
            "This is the last line. Use 'G' to jump here.",
            "The target is the last character of this line."
        ],
        target: { row: 5, col: 30 },
        setup: (gameState) => { 
            gameState.cursor = { row: 2, col: 0 }; 
            gameState.mode = 'NORMAL';
        }
    },
    '0$': {
        name: "Line Boundary Practice",
        instructions: "Use 0 to go to start of line, $ to go to end of line. Practice moving between boundaries.",
        initialContent: [
            "Start here and go to end with $",
            "Then return to start with 0",
            "Practice moving between line boundaries",
            "Use 0 for start, $ for end of each line"
        ],
        target: { row: 0, col: 0 },
        setup: (gameState) => { 
            gameState.cursor = { row: 0, col: 10 }; 
            gameState.mode = 'NORMAL';
        }
    },
    'ia': {
        name: "Insert Mode Practice",
        instructions: "Press 'i' to insert before cursor, 'a' to append after cursor. Type 'INSERTED' and 'APPENDED'.",
        initialContent: [
            "VIM has multiple modes. You're in NORMAL mode now.",
            "Press 'i' to insert before cursor and type 'INSERTED'.",
            "Press 'a' to append after cursor and type 'APPENDED'.",
            "When done, press 'Escape' to return to NORMAL mode.",
            "Complete the sentence: Learning VIM"
        ],
        targetText: { line: 4, text: "Learning VIM INSERTED APPENDED" },
        setup: (gameState) => { 
            gameState.cursor = { row: 4, col: 11 }; 
            gameState.mode = 'NORMAL';
        }
    },
    'x': {
        name: "Delete Character Practice",
        instructions: "Use x to delete characters. Remove the X from 'Delete X this' and fix other typos.",
        initialContent: [
            "Delete the X from this line: 'Delete X this'",
            "Use x to remove the X character",
            "Also fix: 'Fixx this typo'",
            "And: 'Removve extra letters'"
        ],
        targetContent: [
            "Delete the  this",
            "Use x to remove the  character",
            "Also fix: 'Fix this typo'",
            "And: 'Remove extra letters'"
        ],
        setup: (gameState) => { 
            gameState.cursor = { row: 0, col: 7 }; 
            gameState.mode = 'NORMAL';
        }
    },
    'dd': {
        name: "Delete Line Practice",
        instructions: "Use dd to delete entire lines. Remove the marked lines.",
        initialContent: [
            "Keep this line",
            "DELETE THIS LINE",
            "Keep this line too",
            "REMOVE THIS ONE TOO",
            "Keep this final line"
        ],
        targetContent: [
            "Keep this line",
            "Keep this line too",
            "Keep this final line"
        ],
        setup: (gameState) => { 
            gameState.cursor = { row: 1, col: 0 }; 
            gameState.mode = 'NORMAL';
        }
    },
    'search-forward': {
        name: "Forward Search Practice",
        instructions: "Use /text to search forward, n to find next. Search for 'target' and navigate to it.",
        initialContent: [
            "Search for the word 'target' in this text.",
            "Use /target and press Enter to search.",
            "Then use 'n' to find the next occurrence.",
            "Navigate to the target word.",
            "The target is here: target",
            "Another target appears later: target"
        ],
        target: { row: 4, col: 20 },
        setup: (gameState) => { 
            gameState.cursor = { row: 0, col: 0 }; 
            gameState.mode = 'NORMAL';
        }
    },
    'search-backward': {
        name: "Backward Search Practice",
        instructions: "Use ?text to search backward, N to find previous. Search backward for 'start'.",
        initialContent: [
            "Search backward for 'start' in this text.",
            "Use ?start and press Enter to search backward.",
            "Then use 'N' to find the previous occurrence.",
            "Navigate to the start word.",
            "The start is here: start",
            "Another start appears earlier: start"
        ],
        target: { row: 4, col: 20 },
        setup: (gameState) => { 
            gameState.cursor = { row: 5, col: 0 }; 
            gameState.mode = 'NORMAL';
        }
    },
    'dw': {
        name: "Delete Word Practice",
        instructions: "Use dw to delete words. Remove the extra words to clean up the sentences.",
        initialContent: [
            "This is a very very long sentence with extra words.",
            "Remove unnecessary extra words from this line too.",
            "Delete unwanted unwanted repetitions here.",
            "Clean up this messy messy text.",
            "Final result should be clean sentences."
        ],
        targetContent: [
            "This is a very long sentence with words.",
            "Remove unnecessary words from this line too.",
            "Delete unwanted repetitions here.",
            "Clean up this messy text.",
            "Final result should be clean sentences."
        ],
        setup: (gameState) => { 
            gameState.cursor = { row: 0, col: 15 }; 
            gameState.mode = 'NORMAL';
        }
    },
    'yyp': {
        name: "Yank and Paste Practice",
        instructions: "Use yy to yank (copy) a line, then p to paste it. Duplicate the important lines.",
        initialContent: [
            "This line should be duplicated",
            "",
            "This line should also be duplicated",
            "",
            "Don't duplicate this line"
        ],
        targetContent: [
            "This line should be duplicated",
            "This line should be duplicated",
            "",
            "This line should also be duplicated",
            "This line should also be duplicated",
            "",
            "Don't duplicate this line"
        ],
        setup: (gameState) => { 
            gameState.cursor = { row: 0, col: 0 }; 
            gameState.mode = 'NORMAL';
        }
    },
    'cw': {
        name: "Change Word Practice",
        instructions: "Use cw to change words. Replace the wrong words with correct ones.",
        initialContent: [
            "The wrong animal is a elephant",
            "I like to eat wrong food",
            "VIM is a wrong editor",
            "Programming is wrong activity"
        ],
        targetContent: [
            "The best animal is a elephant",
            "I like to eat good food",
            "VIM is a great editor",
            "Programming is fun activity"
        ],
        setup: (gameState) => { 
            gameState.cursor = { row: 0, col: 4 }; 
            gameState.mode = 'NORMAL';
        }
    },
    'D': {
        name: "Delete to End Practice",
        instructions: "Use D to delete from cursor to end of line. Clean up the messy line endings.",
        initialContent: [
            "Keep this part DELETE_FROM_HERE_TO_END",
            "Preserve this DELETE_REST_OF_LINE",
            "Save this text REMOVE_EVERYTHING_AFTER",
            "Maintain this DELETE_TO_FINISH"
        ],
        targetContent: [
            "Keep this part",
            "Preserve this",
            "Save this text",
            "Maintain this"
        ],
        setup: (gameState) => { 
            gameState.cursor = { row: 0, col: 15 }; 
            gameState.mode = 'NORMAL';
        }
    },
    'r': {
        name: "Replace Character Practice",
        instructions: "Use r to replace single characters. Fix the typos by replacing wrong characters.",
        initialContent: [
            "Thxs is a test",
            "VxM is awesome",
            "Reylace characters",
            "Fxx typos quickly"
        ],
        targetContent: [
            "This is a test",
            "VIM is awesome",
            "Replace characters",
            "Fix typos quickly"
        ],
        setup: (gameState) => { 
            gameState.cursor = { row: 0, col: 2 }; 
            gameState.mode = 'NORMAL';
        }
    },
    'nN': {
        name: "Search Navigation Practice",
        instructions: "First search for 'word', then use n to go to next match, N to go to previous match. Navigate to the 3rd occurrence.",
        initialContent: [
            "Find the word in this text",
            "Another word appears here",
            "The third word is the target",
            "More word instances follow",
            "Final word at the end"
        ],
        target: { row: 2, col: 10 },
        setup: (gameState) => { 
            gameState.cursor = { row: 0, col: 0 }; 
            gameState.mode = 'NORMAL';
        }
    },
    'undo-redo': {
        name: "Undo Redo Practice",
        instructions: "Make some changes, then use u to undo them, and Ctrl+r to redo. Practice the undo/redo cycle.",
        initialContent: [
            "Original text that will be modified",
            "Change this line and then undo it",
            "Practice undoing and redoing changes",
            "Master the undo/redo workflow"
        ],
        target: { row: 0, col: 0 },
        setup: (gameState) => { 
            gameState.cursor = { row: 1, col: 0 }; 
            gameState.mode = 'NORMAL';
        }
    },
    'ex': {
        name: "Ex Commands Practice",
        instructions: "Practice ex-commands like :q to quit and :wq to write and quit. Type :q and press Enter.",
        initialContent: [
            "This is a VIM lesson for ex-commands",
            "Ex-commands start with a colon (:)",
            "Common commands: :q (quit), :w (write), :wq (write and quit)",
            "Type :q and press Enter to complete this lesson"
        ],
        targetText: { line: 3, text: "Type :q and press Enter to complete this lesson" },
        setup: (gameState) => { 
            gameState.cursor = { row: 0, col: 0 }; 
            gameState.mode = 'NORMAL';
        }
    }
};

// Practice mode state
let practiceMode = false;
let currentPractice = null; // catalog item selected
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

// Practice Mode Functions - Now creates real VIM lessons
function startCheatPractice(item) {
    if (practiceMode) {
        console.log('Already in practice mode');
        return;
    }
    
    const lesson = vimLessons[item.id];
    if (!lesson) {
        console.log('No lesson found for:', item.id);
        return;
    }
    
    // Enter practice mode
    practiceMode = true;
    currentPractice = item;
    
    // Save current game state
    originalGameState = {
        content: getContent(),
        cursor: getCursor(),
        mode: getMode(),
        commandHistory: getCommandHistory(),
        commandLog: getCommandLog()
    };
    
    // Set up the VIM lesson exactly like a real level
    console.log('🔍 DEBUG: Setting lesson content:', lesson.initialContent);
    setContent(lesson.initialContent);
    console.log('🔍 DEBUG: After setContent, current content:', getContent());
    
    // Apply lesson setup to game state
    const gameState = {
        cursor: getCursor(),
        mode: getMode(),
        commandHistory: getCommandHistory(),
        commandLog: getCommandLog()
    };
    lesson.setup(gameState);
    
    // Apply the setup changes back to game state
    setCursor(gameState.cursor);
    setMode(gameState.mode);
    setCommandHistory(gameState.commandHistory);
    setCommandLog(gameState.commandLog);
    
    // Cache lesson spec for event-driven completion BEFORE updating UI
    currentLessonSpec = lesson;
    
    // Update the UI to show the lesson
    console.log('🔍 DEBUG: About to call updateUI(), current content:', getContent());
    updateUI();
    console.log('🔍 DEBUG: After updateUI(), current content:', getContent());
    
    // IMPORTANT: Update the instructions to show the lesson instructions instead of level instructions
    import('./ui-components.js').then(({ updateInstructions }) => {
        console.log('🔍 DEBUG: Calling updateInstructions() for lesson:', lesson.name);
        updateInstructions();
    }).catch(error => {
        console.error('🔍 ERROR: Failed to update instructions:', error);
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
     console.log('🔍 DEBUG: About to show lesson interface, current activeElement:', document.activeElement);
     showLessonInterface(item, lesson);
     console.log('🔍 DEBUG: After showing lesson interface, current activeElement:', document.activeElement);
     
     // Mark as practiced
     addPracticedCommand(item.id);
    
    // Force editor autofocus after lesson overlay renders
    setTimeout(() => {
        const editorInput = document.getElementById('vim-editor-input');
        if (editorInput) editorInput.focus();
    }, 100);
    
    console.log(`Started VIM lesson for: ${item.key}`);
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
    // Debug: minimal insight while testing
    // console.log('Practice check:', lesson.name, 'cursor', currentCursor);
    
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
    
    console.log('🎉 Completion overlay created and displayed!');
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
    
    console.log('Lesson overlay closed - continue practicing in main editor');
    console.log('Practice mode remains active - completion monitor continues running');
}

// Function to exit practice mode and restore game state
export function exitPracticeMode() {
    if (!practiceMode) return;
    
         // Clean up event handlers
     const editorContainer = document.getElementById('editor-container');
     if (editorContainer) {
         console.log('Cleaned up cheat mode event handlers');
     }
    
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
    currentPractice = null;
    originalGameState = null;
    
    // Update UI
    updateUI();
    
    console.log('Exited practice mode and restored game state');
}

// Export command catalog for other modules
export { commandCatalog };
