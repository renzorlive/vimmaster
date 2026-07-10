// VIM Master Game - Main Entry Point

import {
    getMode, getCurrentLevel, getSearchMode, getBadges,
    getPracticedCommands, resetGameState, setCurrentLevel, setChallengeMode,
    setBadges, setPracticedCommands
} from './game-state.js';

import { levels, loadLevel } from './levels.js';
import { handleNormalMode, handleInsertMode, handleSearchMode } from './vim-commands.js';
import {
    initializeDOMReferences, updateLevelIndicator, createLevelButtons, hideModal,
    showCelebration, hideCelebration, initOnboarding, renderRetentionPanel,
    updateStreakPill
} from './ui-components.js';
import {
    openCheat, closeCheat, renderCheatList, isInPracticeMode,
    checkPracticeCompletion
} from './cheat-mode.js';
import {
    checkWinCondition, nextLevel, resetLevel, toggleChallengeMode,
    updateUI
} from './event-handlers.js';
import {
    progressSystem, exportProgress, importProgress, autoLoadProgress,
    autoSaveProgress, clearProgress
} from './progress-system.js';
import {
    initializeRetentionState, getRetentionViewModel, captureResumeSnapshot,
    markSessionExit, resetRetentionState, noteLessonStart
} from './retention-state.js';



// setChallengeMode is already imported above

// Game initialization
function initializeGame() {
    // Initialize DOM references
    initializeDOMReferences();
    
    // Auto-load progress if available. Invalid saves are repaired when
    // possible and backed up otherwise — never silently deleted (PM-0001).
    const progressResult = autoLoadProgress();
    if (progressResult.message) {
        showProgressMessage(progressResult.message, progressResult.loaded ? 'info' : 'error');
    }

    // Resume at the saved level, or start at the first level
    loadLevel(progressResult.loaded ? getCurrentLevel() : 0);
    initializeRetentionState(getCurrentProgressSummary(), getCurrentLessonName(), getCurrentFocusCommand());
    updateRetentionUI();

    // Level count in the feature list is derived, never hardcoded
    const featureLevelCount = document.getElementById('feature-level-count');
    if (featureLevelCount) {
        featureLevelCount.textContent = `${levels.length} Progressive Levels`;
    }
    
    // Initial UI update
    updateUI();
    
    // Check onboarding
    initOnboarding();
    
    // Update progress summary
    updateProgressSummary();
    
    // Setup auto-save
    setupAutoSave();

    window.addEventListener('beforeunload', () => {
        syncRetentionSnapshot();
        markSessionExit(getCurrentProgressSummary(), getCurrentLessonName(), getCurrentFocusCommand());
    });
}

// Setup event listeners
function setupEventListeners() {
    const editorInput = document.getElementById('vim-editor-input');
    const editorContainer = document.getElementById('editor-container');
    const resetBtn = document.getElementById('reset-btn');
    const nextLevelBtn = document.getElementById('next-level-btn');
    const celebrationRestartBtn = document.getElementById('celebration-restart');
    const levelSelectionContainer = document.getElementById('level-selection');
    const challengeToggleBtn = document.getElementById('challenge-toggle');
    const retentionPanel = document.getElementById('retention-panel');
    const cheatOverlay = document.getElementById('cheat-overlay');
    const cheatCloseBtn = document.getElementById('cheat-close');
    const cheatSearch = document.getElementById('cheat-search');
    const cheatContent = document.getElementById('cheat-content');
    const cheatPanel = document.getElementById('cheat-panel');

    // Progress System Event Listeners
    const progressToggle = document.getElementById('progress-toggle');
    const progressDetails = document.getElementById('progress-details');
    const exportProgressBtn = document.getElementById('export-progress-btn');
    const importProgressBtn = document.getElementById('import-progress-btn');
    const clearProgressBtn = document.getElementById('clear-progress-btn');
    const exportCodeContainer = document.getElementById('export-code-container');
    const importCodeContainer = document.getElementById('import-code-container');
    const exportCode = document.getElementById('export-code');
    const importCode = document.getElementById('import-code');
    const copyExportBtn = document.getElementById('copy-export-btn');
    const confirmImportBtn = document.getElementById('confirm-import-btn');

    // Progress Toggle Functionality
    if (progressToggle && progressDetails) {
        progressToggle.addEventListener('click', () => {
            const isHidden = progressDetails.classList.contains('hidden');
            if (isHidden) {
                progressDetails.classList.remove('hidden');
                progressToggle.querySelector('span:last-child').textContent = 'Click to collapse ▲';
            } else {
                progressDetails.classList.add('hidden');
                progressToggle.querySelector('span:last-child').textContent = 'Click to expand ▼';
            }
        });
    }

    // Export Progress
    if (exportProgressBtn) {
        exportProgressBtn.addEventListener('click', () => {
            try {
                const progressCode = exportProgress();
                exportCode.value = progressCode;
                exportCodeContainer.classList.remove('hidden');
                importCodeContainer.classList.add('hidden');
                hideProgressMessage();
            } catch (error) {
                showProgressMessage('Export failed: ' + error.message, 'error');
            }
        });
    }

    // Copy Export Code
    if (copyExportBtn) {
        copyExportBtn.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(exportCode.value);
                showProgressMessage('Progress code copied to clipboard!', 'success');
            } catch {
                showProgressMessage('Failed to copy code', 'error');
            }
        });
    }

    // Import Progress
    if (importProgressBtn) {
        importProgressBtn.addEventListener('click', () => {
            importCodeContainer.classList.remove('hidden');
            exportCodeContainer.classList.add('hidden');
            hideProgressMessage();
            importCode.focus();
        });
    }

    // Confirm Import
    if (confirmImportBtn) {
        confirmImportBtn.addEventListener('click', () => {
            handleImportProgress();
        });
    }

    // Import field Enter key support
    if (importCode) {
        importCode.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleImportProgress();
            }
        });
    }

    // Clear Progress
    if (clearProgressBtn) {
        clearProgressBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all progress? This cannot be undone.')) {
                const result = clearProgress();
                if (result.success) {
                    showProgressMessage(result.message, 'success');
                    updateProgressSummary();
                    localStorage.removeItem('vimMasterRetentionState');
                    resetRetentionState();
                    
                    // Reset game state
                    resetGameState();
                    loadLevel(0);
                    updateUI();
                } else {
                    showProgressMessage(result.message, 'error');
                }
            }
        });
    }

    // Editor input handling
    if (editorInput) {
        editorInput.addEventListener('keydown', (e) => {
            // Check if a modal is visible and handle Enter key for level advancement
            if (e.key === 'Enter') {
                const modal = document.getElementById('modal');
                if (modal && !modal.classList.contains('opacity-0')) {
                    e.preventDefault();
                    if (getCurrentLevel() === levels.length - 1) {
                        showCelebration();
                    } else {
                        nextLevel();
                        hideModal();
                        if (editorInput) editorInput.focus();
                    }
                    return; // Crucial to prevent further processing
                }
            }
            
            // Don't process any Vim commands if a modal is visible
            const modal = document.getElementById('modal');
            if (modal && !modal.classList.contains('opacity-0')) {
                return;
            }
            
            // Allow VIM commands in cheat mode even if lesson overlay is visible
            if (isInPracticeMode()) {
                // We're in cheat mode, allow VIM commands to work regardless of overlays
            } else {
                // Check for lesson overlay in non-practice mode
                const lessonOverlay = document.getElementById('lesson-overlay');
                if (lessonOverlay && !lessonOverlay.classList.contains('hidden')) {
                    // Lesson overlay is visible, don't process VIM commands
                    return;
                }
            }
            
            
            // Handle Ctrl+R redo before other commands
            if (getMode() === 'NORMAL' && e.key === 'r' && e.ctrlKey) {
                e.preventDefault();
                // Call the redo logic directly from vim-commands
                handleNormalMode(e);
                updateUI();
                checkWinCondition();
                return;
            }
            
            if (getSearchMode()) {
                handleSearchMode(e);
                // Update UI after search mode changes
                updateUI();
                return;
            }
            if (getMode() === 'NORMAL') {
                handleNormalMode(e);
            } else {
                handleInsertMode(e);
            }
            updateUI();
            if (isInPracticeMode()) {
                // Event-driven practice completion
                try { checkPracticeCompletion(); } catch { /* completion check must never break input */ }
            } else {
                checkWinCondition();
            }
        });
    }

    // Editor container click to focus
    if (editorContainer) {
        editorContainer.addEventListener('click', () => {
            if (editorInput) editorInput.focus();
        });
    }

    if (retentionPanel) {
        retentionPanel.addEventListener('click', (e) => {
            const target = e.target;
            if (!(target instanceof HTMLElement)) return;

            if (target.id === 'resume-learning-btn') {
                if (editorInput) editorInput.focus();
                editorContainer?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }

            if (target.id === 'resume-practice-btn') {
                challengeToggleBtn?.click();
            }
        });
    }

    // Reset button
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            resetLevel();
            if (editorInput) editorInput.focus();
        });
    }

    // Next level button
    if (nextLevelBtn) {
        nextLevelBtn.addEventListener('click', () => {
            if (getCurrentLevel() === levels.length - 1) {
                showCelebration();
            } else {
                nextLevel();
                hideModal();
                if (editorInput) editorInput.focus();
            }
        });
    }

    // Celebration restart button
    if (celebrationRestartBtn) {
        celebrationRestartBtn.addEventListener('click', () => {
            // Save current progress before resetting
            const currentBadges = getBadges();
            const currentPracticedCommands = getPracticedCommands();
            
            // Reset game state but preserve progress
            resetGameState();
            
            // Restore progress
            setBadges(currentBadges);
            setPracticedCommands(currentPracticedCommands);
            
            // Restart game
            setCurrentLevel(0);
            loadLevel(0);
            updateUI();
            updateLevelIndicator(0, levels.length);
            createLevelButtons(levels, 0);
            hideCelebration();
            if (editorInput) editorInput.focus();
            
            // Auto-save progress after restart
            autoSaveProgress();
            // Update progress summary display
            updateProgressSummary();
        });
    }

    // Level selection
    if (levelSelectionContainer) {
        levelSelectionContainer.addEventListener('click', (e) => {
            const button = e.target.closest('button[data-level]');
            if (button) {
                const levelIndex = parseInt(button.dataset.level, 10);
                if (levelIndex !== getCurrentLevel()) {
                    loadLevel(levelIndex);
                    updateUI();
                    updateLevelIndicator(getCurrentLevel(), levels.length);
                    createLevelButtons(levels, getCurrentLevel());
                }
                if (editorInput) editorInput.focus();
            }
        });
    }

    // Challenge toggle
    if (challengeToggleBtn) {
        challengeToggleBtn.addEventListener('click', toggleChallengeMode);
    }

    // Cheat mode event listeners are now set up after the button is created

    if (cheatOverlay) {
        cheatOverlay.addEventListener('click', () => {
            closeCheat(cheatOverlay, cheatPanel, editorInput);
        });
    }

    if (cheatCloseBtn) {
        cheatCloseBtn.addEventListener('click', () => {
            closeCheat(cheatOverlay, cheatPanel, editorInput);
        });
    }

    if (cheatSearch) {
        cheatSearch.addEventListener('input', (e) => {
            renderCheatList(cheatContent, e.target.value);
        });
    }

    // Global keyboard shortcuts
    window.addEventListener('keydown', (e) => {
        // Toggle Cheat Mode with Ctrl+/
        if (e.ctrlKey && e.key === '/') {
            e.preventDefault();
            if (cheatPanel && cheatPanel.classList.contains('translate-x-full')) {
                openCheat(cheatOverlay, cheatPanel, cheatSearch, cheatContent);
            } else {
                closeCheat(cheatOverlay, cheatPanel, editorInput);
            }
        }
    }, true);

    // Add cheat toggle button if it doesn't exist
    if (challengeToggleBtn && !document.getElementById('cheat-toggle')) {
        challengeToggleBtn.insertAdjacentHTML('afterend', '<button id="cheat-toggle" class="ml-3 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg">📘 Cheat Mode</button>');
    }
    
    // Re-get the cheat toggle button after creating it
    const cheatToggleBtnAfterCreation = document.getElementById('cheat-toggle');
    
    // Cheat mode event listeners (using the newly created button)
    if (cheatToggleBtnAfterCreation) {
        cheatToggleBtnAfterCreation.addEventListener('click', () => {
            if (cheatPanel && cheatPanel.classList.contains('translate-x-full')) {
                openCheat(cheatOverlay, cheatPanel, cheatSearch, cheatContent);
            } else {
                closeCheat(cheatOverlay, cheatPanel, editorInput);
            }
        });
    }
}

// Progress System Helper Functions
function handleImportProgress() {
    const importCode = document.getElementById('import-code');
    if (!importCode) return;
    
    const code = importCode.value.trim();
    if (!code) {
        showProgressMessage('Please enter a progress code', 'error');
        return;
    }

    const result = importProgress(code);
    if (result.success) {
        showProgressMessage(result.message, 'success');
        const importCodeContainer = document.getElementById('import-code-container');
        if (importCodeContainer) {
            importCodeContainer.classList.add('hidden');
        }
        importCode.value = '';
        
        // Reload level and update UI
        loadLevel(getCurrentLevel());
        updateUI();
        updateProgressSummary();
    } else {
        showProgressMessage(result.message, 'error');
    }
}

function updateProgressSummary() {
    const progressSummary = document.getElementById('progress-summary');
    const lastSavedTime = document.getElementById('last-saved-time');
    
    if (progressSummary && lastSavedTime) {
        const summary = getCurrentProgressSummary();
        
        // Ensure challengePoints is always a number
        const challengePoints = (summary.challengePoints !== undefined && summary.challengePoints !== null) ? summary.challengePoints : 0;
        
        progressSummary.textContent = `Level ${summary.currentLevel + 1} • ${summary.badgesEarned} badges • ${summary.commandsPracticed} commands practiced • ${challengePoints} challenge points`;
        lastSavedTime.textContent = summary.lastSaved;
    }

    updateRetentionUI();
}

function showProgressMessage(message, type = 'info') {
    const progressMessage = document.getElementById('progress-message');
    if (progressMessage) {
        progressMessage.textContent = message;
        progressMessage.className = `mt-3 text-center text-sm ${type === 'success' ? 'text-green-400' : type === 'error' ? 'text-red-400' : 'text-blue-400'}`;
        progressMessage.classList.remove('hidden');
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            hideProgressMessage();
        }, 5000);
    }
}

function hideProgressMessage() {
    const progressMessage = document.getElementById('progress-message');
    if (progressMessage) {
        progressMessage.classList.add('hidden');
    }
}

// Auto-save progress when significant changes occur
function setupAutoSave() {
    // Auto-save every 30 seconds and update progress summary
    setInterval(() => {
        autoSaveProgress();
        updateProgressSummary();
    }, 30000);
    
    // Auto-save on level completion happens inside checkWinCondition's win
    // path (event-handlers.js) — a window.checkWinCondition wrapper here was
    // dead code because the function was never assigned to window (TD-3).

    // Update progress summary more frequently for real-time updates
    setInterval(() => {
        updateProgressSummary();
    }, 5000); // Update every 5 seconds
}

function getCurrentLesson() {
    return levels[getCurrentLevel()] || null;
}

function getCurrentLessonName() {
    const lesson = getCurrentLesson();
    return lesson ? lesson.name : '';
}

function getCurrentFocusCommand() {
    const lesson = getCurrentLesson();
    if (!lesson) return '';
    return lesson.focusCommand ? lesson.focusCommand : (lesson.solution ? lesson.solution.join('') : '');
}

function getCurrentProgressSummary() {
    return progressSystem.getProgressSummary();
}

function syncRetentionSnapshot() {
    const summary = getCurrentProgressSummary();
    captureResumeSnapshot(summary, getCurrentLessonName(), getCurrentFocusCommand());
}

function updateRetentionUI() {
    const summary = getCurrentProgressSummary();
    const lesson = getCurrentLesson();
    noteLessonStart(summary.currentLevel ?? 0, lesson ? lesson.name : '', getCurrentFocusCommand());
    const model = getRetentionViewModel(summary, lesson ? lesson.name : '', getCurrentFocusCommand());
    captureResumeSnapshot(summary, lesson ? lesson.name : '', getCurrentFocusCommand());
    renderRetentionPanel(model);
    updateStreakPill(model.streakDays, model.welcomeBack);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeGame();
    
    // Setup event listeners
    setupEventListeners();
    
    // Make updateProgressSummary globally available
    window.updateProgressSummary = updateProgressSummary;
    window.updateRetentionSummary = updateRetentionUI;
    
    // Focus the editor
    const editorInput = document.getElementById('vim-editor-input');
    if (editorInput) {
        editorInput.focus();
    }
});

// Global challenge functions for modal buttons
window.startNewChallenge = () => {
    // Hide the modal
    const modal = document.getElementById('modal');
    if (modal) {
        modal.classList.add('opacity-0', 'pointer-events-none');
    }
    
    // Start a new random challenge
    toggleChallengeMode();
};

window.returnToLevel = () => {
    // Hide the modal
    const modal = document.getElementById('modal');
    if (modal) {
        modal.classList.add('opacity-0', 'pointer-events-none');
    }
    
    // Exit challenge mode and return to current level
    setChallengeMode(false);
    loadLevel(getCurrentLevel());
    updateUI();
};

// This module doesn't need to export anything - it's the main entry point
