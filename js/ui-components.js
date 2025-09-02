// VIM Master Game - UI Components (Updated)

import { escapeHtml, getSearchMatches, getLastSearchQuery, getMacroState, getCommandMode } from './game-state.js';
// Static imports for core dependencies to avoid performance overhead
import * as challengesModule from './challenges.js';
import * as levelsModule from './levels.js';
import * as gameStateModule from './game-state.js';

// DOM Elements
let editorDisplay, statusBar, instructionsEl, levelIndicator, commandLogEl, 
    editorContainer, resetBtn, modal, modalContent, modalTitle, modalMessage, 
    nextLevelBtn, celebration, celebrationRestartBtn, levelSelectionContainer,
    challengeToggleBtn, challengeContainer, challengeInstructions, challengeTimer,
    challengeProgress, challengeTotal, challengeScore, badgeSection, badgeBar,
    badgeCount, badgeToast, cheatPanel, cheatOverlay, cheatCloseBtn, cheatSearch, cheatContent;

// Initialize DOM references
export function initializeDOMReferences() {
    editorDisplay = document.getElementById('vim-editor-display');
    statusBar = document.getElementById('status-bar');
    instructionsEl = document.getElementById('instructions');
    levelIndicator = document.getElementById('level-indicator');
    commandLogEl = document.getElementById('command-log');
    editorContainer = document.getElementById('editor-container');
    resetBtn = document.getElementById('reset-btn');
    modal = document.getElementById('modal');
    modalContent = document.getElementById('modal-content');
    modalTitle = document.getElementById('modal-title');
    modalMessage = document.getElementById('modal-message');
    nextLevelBtn = document.getElementById('next-level-btn');
    celebration = document.getElementById('celebration');
    celebrationRestartBtn = document.getElementById('celebration-restart');
    levelSelectionContainer = document.getElementById('level-selection');
    challengeToggleBtn = document.getElementById('challenge-toggle');
    challengeContainer = document.getElementById('challenge-container');
    challengeInstructions = document.getElementById('challenge-instructions');
    challengeTimer = document.getElementById('timer');
    challengeProgress = document.getElementById('challenge-progress');
    challengeTotal = document.getElementById('challenge-total');
    challengeScore = document.getElementById('challenge-score');
    badgeSection = document.getElementById('badge-section');
    badgeBar = document.getElementById('badge-bar');
    badgeCount = document.getElementById('badge-count');
    badgeToast = document.getElementById('badge-toast');
    cheatPanel = document.getElementById('cheat-panel');
    cheatOverlay = document.getElementById('cheat-overlay');
    cheatCloseBtn = document.getElementById('cheat-close');
    cheatSearch = document.getElementById('cheat-search');
    cheatContent = document.getElementById('cheat-content');
}

// Editor Rendering
export function renderEditor(content, cursor, mode, visualSelection = []) {
    if (!editorDisplay) return;
    
    let html = '';
    const isInMatch = (row, col) => {
        const searchMatches = getSearchMatches();
        for (let i = 0; i < searchMatches.length; i++) {
            const m = searchMatches[i];
            if (m.row === row && col >= m.start && col < m.end) return true;
        }
        return false;
    };
    
    const isInVisualSelection = (row, col) => {
        return visualSelection.some(pos => pos.row === row && pos.col === col);
    };
    
    content.forEach((line, rowIndex) => {
        html += `<div class="flex"><span class="line-number w-10">${rowIndex + 1}</span><span class="flex-1">`;
        for (let colIndex = 0; colIndex < line.length; colIndex++) {
            const char = line[colIndex];
            const safeChar = escapeHtml(char);
            
            // Check for visual selection first
            if (mode.startsWith('VISUAL') && isInVisualSelection(rowIndex, colIndex)) {
                if (rowIndex === cursor.row && colIndex === cursor.col) {
                    html += `<span class="cursor visual-selection">${safeChar}</span>`;
                } else {
                    html += `<span class="visual-selection">${safeChar}</span>`;
                }
            } else if (rowIndex === cursor.row && colIndex === cursor.col && mode === 'NORMAL') {
                html += `<span class="cursor">${safeChar}</span>`;
            } else {
                if (getLastSearchQuery() && isInMatch(rowIndex, colIndex)) {
                    html += `<span class="bg-yellow-800/60">${safeChar}</span>`;
                } else {
                    html += safeChar;
                }
            }
        }
        if (rowIndex === cursor.row && (cursor.col === line.length || line.length === 0)) {
             if (mode === 'NORMAL') {
                html += `<span class="cursor">&nbsp;</span>`;
             } else if (mode.startsWith('VISUAL')) {
                html += `<span class="cursor visual-selection">&nbsp;</span>`;
             } else {
                html += `<span class="inline-block w-px h-6 bg-yellow-400 animate-pulse -mb-1"></span>`;
             }
        }
        html += `</span></div>`;
    });
    editorDisplay.innerHTML = html;
}

// Status Bar Updates
export function updateStatusBar(mode, searchMode, searchQuery, lastSearchDirection, searchMatches, currentMatchIndex, visualSelection = []) {
    try {
        if (!statusBar) {
            return;
        }
    
    let text = `-- ${mode.toUpperCase()} --`;
    
    // Check if we're in Ex command mode (typing a command starting with :)
    const commandMode = getCommandMode();
    if (commandMode) {
        text = `-- COMMAND --`;
    }
    
    // Add macro recording information
    const macroState = getMacroState();
    if (macroState.recording) {
        text = `--recording-- @${macroState.register}`;
    }
    
    // Add visual mode information
    if (mode.startsWith('VISUAL') && visualSelection.length > 0) {
        if (mode === 'VISUAL') {
            text += ` (${visualSelection.length} chars)`;
        } else if (mode === 'VISUAL_LINE') {
            const lines = new Set(visualSelection.map(pos => pos.row)).size;
            text += ` (${lines} lines)`;
        } else if (mode === 'VISUAL_BLOCK') {
            const rows = new Set(visualSelection.map(pos => pos.row)).size;
            const cols = new Set(visualSelection.map(pos => pos.col)).size;
            text += ` (${rows}x${cols} block)`;
        }
    }
    
    if (searchMode) {
        const prefix = lastSearchDirection === 'backward' ? '?' : '/';
        text += ` ${prefix}${searchQuery}`;
    } else if (getLastSearchQuery()) {
        const total = searchMatches.length;
        const current = currentMatchIndex >= 0 ? currentMatchIndex + 1 : 0;
        const dir = lastSearchDirection === 'backward' ? '?' : '/';
        text += ` ${dir}${getLastSearchQuery()} ${current}/${total}`;
    }
    statusBar.textContent = text;
    
    // Update status bar color based on mode
    let bgColor = 'bg-yellow-400 text-gray-900'; // Default NORMAL mode
    if (macroState.recording) {
        bgColor = 'bg-red-400 text-gray-900'; // Recording mode
    } else if (commandMode) {
        bgColor = 'bg-purple-400 text-gray-900'; // Command mode
    } else if (mode === 'INSERT') {
        bgColor = 'bg-green-400 text-gray-900';
    } else if (mode.startsWith('VISUAL')) {
        bgColor = 'bg-blue-400 text-gray-900';
    }
    
    statusBar.className = `status-bar px-2 py-1 rounded-md text-sm ${bgColor}`;
    } catch (error) {
        console.error('🔍 Error in updateStatusBar:', error);
    }
}

// Instructions Updates
export function updateInstructions(customText) {
    if (!instructionsEl) return;

    if (customText !== undefined) {
        instructionsEl.innerHTML = customText;
        return;
    }

    // Import cheat mode functions for practice mode detection
    import('./cheat-mode.js').then(({ isInPracticeMode, getCurrentLessonSpec }) => {

        
        if (isInPracticeMode() && getCurrentLessonSpec()) {
            const lesson = getCurrentLessonSpec();

            instructionsEl.innerHTML = `
                <div class="text-center">
                    <div class="text-yellow-400 font-bold text-lg mb-2">🎯 ${lesson.name}</div>
                    <div class="text-gray-300">${lesson.instructions}</div>
                </div>
            `;
        } else {
            // Use statically imported modules instead of dynamic imports
            // Check if we're in challenge mode
            if (gameStateModule.getChallengeMode && gameStateModule.getChallengeMode()) {
                const currentChallenge = gameStateModule.getCurrentChallenge();
                const currentTaskIndex = gameStateModule.getCurrentTaskIndex();

                
                if (currentChallenge && currentTaskIndex !== undefined && currentTaskIndex < currentChallenge.tasks.length) {
                    const currentTask = currentChallenge.tasks[currentTaskIndex];

                    instructionsEl.innerHTML = `
                        <div class="text-center">
                            <div class="text-blue-400 font-bold text-lg mb-2">🚀 ${currentChallenge.name}</div>
                            <div class="text-gray-300">${currentTask.instruction}</div>
                            ${currentTask.hint ? `<div class="text-yellow-400 text-sm mt-2">💡 ${currentTask.hint}</div>` : ''}
                        </div>
                    `;
                } else {

                    instructionsEl.textContent = 'Challenge mode active';
                }
            } else {
                // Normal level instructions
                const currentLevel = gameStateModule.getCurrentLevel();
                if (currentLevel !== undefined && levelsModule.levels && levelsModule.levels[currentLevel]) {
                    instructionsEl.textContent = levelsModule.levels[currentLevel].instructions || '';
                }
            }
        }
    }).catch(error => {
        console.error('Error loading cheat mode instructions:', error);
    });
}

// Level Indicator Updates
export function updateLevelIndicator(currentLevel, totalLevels) {
    if (!levelIndicator) {
        return;
    }
    levelIndicator.textContent = `Level: ${currentLevel + 1} / ${totalLevels}`;
}

// Command Log Updates
export function updateCommandLog(commandLog) {
    if (!commandLogEl) return;
    commandLogEl.textContent = commandLog.slice(-10).join('');
}

// Level Buttons Creation
export function createLevelButtons(levels, currentLevel) {
    if (!levelSelectionContainer) return;
    
    levelSelectionContainer.innerHTML = ''; // Clear existing buttons
    levels.forEach((level, index) => {
        const button = document.createElement('button');
        button.textContent = `${index + 1}`;
        button.dataset.level = index;
        button.className = `w-8 h-8 flex items-center justify-center rounded-md transition-colors font-bold`;
        if (index === currentLevel) {
            button.classList.add('bg-yellow-400', 'text-gray-900');
        } else {
            button.classList.add('bg-gray-700', 'text-gray-300', 'hover:bg-gray-600');
        }
        levelSelectionContainer.appendChild(button);
    });
}

// Badge Rendering
export function renderBadges(badges) {
    if (!badgeBar || !badgeSection || !badgeCount) return;
    
    badgeBar.innerHTML = '';
    const badgeDefs = {
        beginner: { label: 'Beginner', emoji: '🟢', title: 'Completed basic movement lessons' },
        searchmaster: { label: 'Search Master', emoji: '🔎', title: 'Used / ? n N to search' },
        'visual-master': { label: 'Visual Master', emoji: '👁️', title: 'Mastered all visual mode operations' },
        'text-object-pro': { label: 'Text Object Pro', emoji: '🎯', title: 'Mastered text object manipulation' },
        'macro-wizard': { label: 'Macro Wizard', emoji: '🪄', title: 'Created and executed complex macros' },
        'regex-ninja': { label: 'Regex Ninja', emoji: '🥷', title: 'Advanced search and replace patterns' }
    };
    const earned = Array.from(badges);
    if (earned.length === 0) {
        badgeSection.classList.add('hidden');
        return;
    }
    badgeSection.classList.remove('hidden');
    badgeCount.textContent = `(${earned.length} earned)`;
    earned.forEach((key) => {
        const def = badgeDefs[key];
        if (!def) return;
        const el = document.createElement('div');
        el.className = 'badge-card bg-blue-900/70 border border-blue-700 text-blue-100 px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-transform';
        el.title = def.title;
        el.innerHTML = `<span>${def.emoji}</span><span>${def.label}</span>`;
        badgeBar.appendChild(el);
    });
}

// Badge Toast
export function showBadgeToast(message) {
    if (!badgeToast) return;
    
    badgeToast.textContent = message;
    badgeToast.classList.remove('hidden');
    setTimeout(() => badgeToast.classList.add('hidden'), 2200);
}

// Modal Functions
export function showModal(title, message) {
    if (!modal || !modalTitle || !modalMessage) return;
    
    modalTitle.textContent = title;
    modalMessage.innerHTML = message; // Use innerHTML to render HTML content like buttons
    
    modal.classList.remove('opacity-0', 'pointer-events-none');
    modalContent.classList.remove('scale-95');
}

export function hideModal() {
    if (!modal || !modalContent) return;
    
    modal.classList.add('opacity-0', 'pointer-events-none');
    modalContent.classList.add('scale-95');
}

// Celebration Functions
export function showCelebration() {
    if (!celebration) return;
    
    celebration.classList.remove('hidden');
    celebration.style.left = '0';
    celebration.style.top = '0';
    celebration.style.right = '0';
    celebration.style.bottom = '0';
    spawnConfettiOnce();
}

export function hideCelebration() {
    if (!celebration) return;
    
    celebration.classList.add('hidden');
    celebration.style.left = '';
    celebration.style.top = '';
    celebration.style.right = '';
    celebration.style.bottom = '';
    celebration.querySelectorAll('.confetti').forEach(n => n.remove());
}

// Confetti Animation
function spawnConfettiOnce() {
    if (!celebration) return;
    
    // clear previous
    celebration.querySelectorAll('.confetti').forEach(n => n.remove());
    const emojis = ['🎉','✨','🎊','⭐','💥','🔥'];
    const pieces = 60;
    for (let i = 0; i < pieces; i++) {
        const span = document.createElement('span');
        span.className = 'confetti';
        span.textContent = emojis[i % emojis.length];
        span.style.left = Math.random() * 100 + 'vw';
        span.style.animationDuration = (5 + Math.random() * 3).toFixed(2) + 's';
        span.style.animationDelay = (Math.random() * 1.5).toFixed(2) + 's';
        span.style.transform = `translateY(${Math.random()*-40}vh)`;
        celebration.appendChild(span);
    }
}

// Level Complete Flash
export function flashLevelComplete() {
    if (!editorContainer) return;
    
    editorContainer.classList.add('level-complete-flash');
    setTimeout(() => {
        editorContainer.classList.remove('level-complete-flash');
    }, 500);
}

// Challenge UI Updates
export function updateChallengeUI(challenge, progress, score, timeRemaining) {
    if (!challenge) return;
    
    if (challengeInstructions) {
        challengeInstructions.textContent = challenge.description;
    }
    
    if (challengeTotal) {
        challengeTotal.textContent = challenge.tasks.length;
    }
    
    if (challengeProgress) {
        challengeProgress.textContent = progress;
    }
    
    if (challengeScore) {
        challengeScore.textContent = score;
    }
    
    if (challengeTimer) {
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        challengeTimer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}

export function showChallengeContainer() {
    if (challengeContainer) {
        challengeContainer.classList.remove('hidden');
    }
}

export function hideChallengeContainer() {
    if (challengeContainer) {
        challengeContainer.classList.add('hidden');
    }
}

// Export DOM references for other modules
export function getDOMReferences() {
    return {
        editorDisplay, statusBar, instructionsEl, levelIndicator, commandLogEl,
        editorContainer, resetBtn, modal, modalContent, modalTitle, modalMessage,
        nextLevelBtn, celebration, celebrationRestartBtn, levelSelectionContainer,
        challengeToggleBtn, challengeContainer, challengeInstructions, challengeTimer,
        challengeProgress, challengeTotal, challengeScore, badgeSection, badgeBar,
        badgeCount, badgeToast, cheatPanel, cheatOverlay, cheatCloseBtn, cheatSearch, cheatContent
    };
}
