// VIM Master Game - UI Components (Updated)

import { escapeHtml, getSearchMatches, getLastSearchQuery } from './game-state.js';
import { logger, CATEGORIES } from './logger.js';
// Static imports for core dependencies to avoid performance overhead
import * as levelsModule from './levels.js';
import * as gameStateModule from './game-state.js';

// DOM Elements
let editorDisplay, statusBar, instructionsEl, levelIndicator, commandLogEl, 
    editorContainer, resetBtn, modal, modalContent, modalTitle, modalMessage, 
    nextLevelBtn, celebration, celebrationRestartBtn, levelSelectionContainer,
    challengeToggleBtn, challengeContainer, challengeInstructions, challengeTimer,
    challengeProgress, challengeTotal, challengeScore, badgeSection, badgeBar,
    badgeCount, badgeToast, feedbackToast, sessionProgressFill, cheatPanel, cheatOverlay, cheatCloseBtn, cheatSearch, cheatContent;

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
    feedbackToast = document.getElementById('editor-feedback');
    sessionProgressFill = document.getElementById('session-progress-fill');
    cheatPanel = document.getElementById('cheat-panel');
    cheatOverlay = document.getElementById('cheat-overlay');
    cheatCloseBtn = document.getElementById('cheat-close');
    cheatSearch = document.getElementById('cheat-search');
    cheatContent = document.getElementById('cheat-content');
}

// Editor Rendering
export function renderEditor(content, cursor, mode) {
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
    
    content.forEach((line, rowIndex) => {
        const isActiveLine = rowIndex === cursor.row;
        html += `<div class="editor-line${isActiveLine ? ' active' : ''} flex"><span class="line-number w-10">${rowIndex + 1}</span><span class="flex-1">`;
        for (let colIndex = 0; colIndex < line.length; colIndex++) {
            const char = line[colIndex];
            const safeChar = escapeHtml(char);
            if (rowIndex === cursor.row && colIndex === cursor.col && mode === 'NORMAL') {
                html += `<span class="cursor cursor-normal">${safeChar}</span>`;
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
                html += `<span class="cursor cursor-normal">&nbsp;</span>`;
             } else {
                html += `<span class="cursor cursor-insert inline-block w-px h-6 -mb-1"></span>`;
             }
        }
        html += `</span></div>`;
    });
    editorDisplay.innerHTML = html;
}

// Status Bar Updates
export function updateStatusBar(mode, searchMode, searchQuery, lastSearchDirection, searchMatches, currentMatchIndex, commandHistory = '', cursor = { row: 0, col: 0 }, currentLevel = 0, totalLevels = 0, xp = 0, combo = 0) {
    if (!statusBar) return;

    const modeLabel = commandHistory && commandHistory.startsWith(':')
        ? commandHistory
        : mode.toUpperCase();
    const modeClass = commandHistory && commandHistory.startsWith(':')
        ? 'status-mode-ex'
        : `status-mode-${mode.toLowerCase()}`;
    const lessonLabel = totalLevels > 0 ? `Lesson ${currentLevel + 1}/${totalLevels}` : 'Lesson --';
    const cursorLabel = `Ln ${cursor.row + 1}, Col ${cursor.col + 1}`;
    const xpLabel = `XP ${xp}`;
    const comboLabel = `Combo x${combo}`;
    const searchLabel = searchMode
        ? `${lastSearchDirection === 'backward' ? '?' : '/'}${searchQuery}`
        : (getLastSearchQuery() ? `${lastSearchDirection === 'backward' ? '?' : '/'}${getLastSearchQuery()} ${currentMatchIndex >= 0 ? currentMatchIndex + 1 : 0}/${searchMatches.length}` : '');

    statusBar.innerHTML = `
        <span class="status-mode ${modeClass}">${escapeHtml(modeLabel)}</span>
        <span class="status-sep">│</span>
        <span>${escapeHtml(lessonLabel)}</span>
        <span class="status-sep">│</span>
        <span>${escapeHtml(cursorLabel)}</span>
        <span class="status-sep">│</span>
        <span>${escapeHtml(xpLabel)}</span>
        <span class="status-sep">│</span>
        <span>${escapeHtml(comboLabel)}</span>
        ${searchLabel ? `<span class="status-sep">│</span><span class="status-search">${escapeHtml(`Search ${searchLabel}`)}</span>` : ''}
    `;
    statusBar.className = `status-bar statusline px-3 py-2 rounded-md text-xs md:text-sm`;
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
        const authorEl = document.getElementById('lesson-author');
        if (authorEl) authorEl.classList.add('hidden'); // Hide by default

        if (isInPracticeMode() && getCurrentLessonSpec()) {
            const lesson = getCurrentLessonSpec();
            instructionsEl.innerHTML = `
                <div class="text-center">
                    <div class="text-yellow-400 font-bold text-lg mb-2">🎯 ${lesson.name}</div>
                    <div class="text-gray-300">${lesson.instructions}</div>
                </div>
            `;
            if (lesson.metadata && lesson.metadata.githubUsername && authorEl) {
                authorEl.textContent = `Lesson by @${lesson.metadata.githubUsername}`;
                authorEl.classList.remove('hidden');
            }
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
                    const level = levelsModule.levels[currentLevel];
                    const focusCmd = level.focusCommand ? level.focusCommand : (level.solution ? level.solution.join('') : '');
                    instructionsEl.innerHTML = `
                        <div class="text-center">
                            <div class="text-yellow-400 font-bold text-lg mb-2 uppercase tracking-widest">🎯 Goal</div>
                            <div class="text-gray-300 text-sm mb-4">${level.instructions || ''}</div>
                            <div class="border-t border-b border-gray-700/50 py-3 my-3">
                                <div class="text-5xl md:text-6xl font-mono text-green-400 font-bold tracking-tight">${focusCmd}</div>
                            </div>
                            <div class="text-gray-500 text-xs mt-2">Type exactly as shown</div>
                        </div>
                    `;
                    if (level.metadata && level.metadata.githubUsername && authorEl) {
                        authorEl.textContent = `Lesson by @${level.metadata.githubUsername}`;
                        authorEl.classList.remove('hidden');
                    }
                }
            }
        }
    }).catch(err => {
        logger.error(CATEGORIES.UI, 'Error updating instructions', { error: err.message });
    });
}

// Level Indicator Updates
export function updateLevelIndicator(currentLevel, totalLevels) {
    if (!levelIndicator) {
        return;
    }

    if (currentLevel < 0 || totalLevels <= 0) {
        levelIndicator.textContent = '';
        const minimalProgress = document.getElementById('minimal-progress');
        if (minimalProgress) {
            minimalProgress.classList.add('hidden');
        }
        if (sessionProgressFill) {
            sessionProgressFill.style.width = '0%';
        }
        return;
    }

    levelIndicator.textContent = `Level: ${currentLevel + 1} / ${totalLevels}`;

    if (sessionProgressFill && totalLevels > 0 && currentLevel >= 0) {
        const progress = Math.max(0, Math.min(100, ((currentLevel + 1) / totalLevels) * 100));
        sessionProgressFill.style.width = `${progress}%`;
    }
    
    // Minimal progress indicator
    const minimalProgress = document.getElementById('minimal-progress');
    if (minimalProgress) {
        minimalProgress.classList.remove('hidden');
        let blocks = '';
        const blocksToShow = Math.min(totalLevels, 16);
        for (let i = 0; i < blocksToShow; i++) {
            blocks += (i <= currentLevel) ? '█' : '□';
        }
        minimalProgress.textContent = `Lesson ${currentLevel + 1} / ${totalLevels}   ${blocks}`;
    }
    
    progressiveUnlocking(currentLevel);
}

// First Time Experience (Onboarding & Unlocking)
export function initOnboarding() {
    const overlay = document.getElementById('onboarding-overlay');
    const modal = document.getElementById('onboarding-modal');
    const startBtn = document.getElementById('start-learning-btn');
    
    // Defer the check to next tick to ensure state is loaded
    setTimeout(() => {
        const currentLevel = window.vimmasterGameState ? window.vimmasterGameState.getCurrentLevel() : 0;
        
        if (currentLevel > 0) {
            if (overlay) overlay.classList.add('hidden');
            progressiveUnlocking(currentLevel);
            return;
        }
        
        // First time experience
        if (overlay && modal && startBtn) {
            overlay.classList.remove('hidden');
            setTimeout(() => {
                modal.classList.remove('scale-95', 'opacity-0');
                modal.classList.add('scale-100', 'opacity-100');
            }, 50);
            
            startBtn.onclick = () => {
                modal.classList.remove('scale-100', 'opacity-100');
                modal.classList.add('scale-95', 'opacity-0');
                setTimeout(() => {
                    overlay.classList.add('hidden');
                }, 300);
            };
        }
        progressiveUnlocking(currentLevel);
    }, 100);
}

export function progressiveUnlocking(currentLevel) {
    const profileBtn = document.getElementById('profile-btn');
    const practiceArena = document.getElementById('challenge-toggle');
    const cheatHints = document.getElementById('cheat-hints');
    const badgeSection = document.getElementById('badge-section');
    const statsBar = document.getElementById('stats-bar');

    const showWithAnimation = (el) => {
        if (el && el.classList.contains('hidden')) {
            el.classList.remove('hidden');
            el.classList.add('fade-in-up');
        }
    };

    if (currentLevel >= 1) {
        showWithAnimation(statsBar);
        showWithAnimation(profileBtn);
        showWithAnimation(badgeSection);
    }
    if (currentLevel >= 4) {
        showWithAnimation(practiceArena);
    }
    if (currentLevel >= 8) { // End of basics
        showWithAnimation(cheatHints);
    }
}

// Stats Bar Updates
export function updateStatsBar(combo, xp) {
    const statsBar = document.getElementById('stats-bar');
    const comboDisplay = document.getElementById('combo-display');
    const xpDisplay = document.getElementById('xp-display');
    
    if (statsBar && comboDisplay && xpDisplay) {
        animateStatValue(xpDisplay, xp, 250, 'xp');
        animateStatValue(comboDisplay, combo, 180, 'combo');
    }
}

function prefersReducedMotion() {
    return typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function animateStatValue(element, targetValue, duration, kind) {
    if (!element) return;

    const nextValue = Number.isFinite(targetValue) ? Math.max(0, Math.trunc(targetValue)) : 0;
    const currentValue = Number(element.dataset.value ?? element.textContent ?? 0) || 0;

    if (currentValue === nextValue || prefersReducedMotion()) {
        element.textContent = String(nextValue);
        element.dataset.value = String(nextValue);
        return;
    }

    const startTime = performance.now();
    const startValue = currentValue;
    const delta = nextValue - startValue;
    const pulseTarget = kind === 'combo' ? element.closest('#stats-bar') || element : element;

    if (kind === 'combo' && nextValue > startValue) {
        pulseTarget.classList.remove('stat-pop');
        void pulseTarget.offsetWidth;
        pulseTarget.classList.add('stat-pop');
        window.setTimeout(() => pulseTarget.classList.remove('stat-pop'), 220);
    }

    const step = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.round(startValue + (delta * eased));
        element.textContent = String(value);
        element.dataset.value = String(value);

        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            element.textContent = String(nextValue);
            element.dataset.value = String(nextValue);
        }
    };

    window.requestAnimationFrame(step);
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
        searchmaster: { label: 'Search Master', emoji: '🔎', title: 'Used / ? n N to search' }
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
    badgeToast.classList.remove('show');
    void badgeToast.offsetWidth;
    badgeToast.classList.add('show');
    window.clearTimeout(badgeToast._hideTimer);
    badgeToast._hideTimer = window.setTimeout(() => {
        badgeToast.classList.remove('show');
        window.setTimeout(() => badgeToast.classList.add('hidden'), 180);
    }, 1800);
}

export function showEditorFeedback(message, variant = 'success') {
    if (!feedbackToast) return;

    feedbackToast.textContent = message;
    feedbackToast.dataset.variant = variant;
    feedbackToast.classList.remove('hidden', 'show', 'success', 'error');
    feedbackToast.classList.add(variant);
    requestAnimationFrame(() => feedbackToast.classList.add('show'));

    window.clearTimeout(feedbackToast._hideTimer);
    feedbackToast._hideTimer = window.setTimeout(() => {
        feedbackToast.classList.remove('show');
        window.setTimeout(() => feedbackToast.classList.add('hidden'), 180);
    }, 420);
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
    
    editorContainer.classList.add('success-pulse');
    setTimeout(() => {
        editorContainer.classList.remove('success-pulse');
    }, 800);
}

export function flashError() {
    if (!editorContainer) return;
    
    editorContainer.classList.add('error-flash');
    setTimeout(() => {
        editorContainer.classList.remove('error-flash');
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
        badgeCount, badgeToast, feedbackToast, cheatPanel, cheatOverlay, cheatCloseBtn, cheatSearch, cheatContent,
        flashError, updateStatsBar, showEditorFeedback
    };
}
