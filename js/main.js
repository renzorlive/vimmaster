// VIM Master Game - Main Entry Point

import { 
    getContent, getCursor, getMode, getCurrentLevel, getCommandHistory, getCommandLog, 
    getYankedLine, getReplacePending, getCountBuffer, getUndoStack, getRedoStack,
    getLevel12Undo, getLevel12RedoAfterUndo, getLastExCommand, getSearchMode,
    getSearchQuery, getLastSearchQuery, getLastSearchDirection, getSearchMatches,
    getCurrentMatchIndex, getUsedSearchInLevel, getNavCountSinceSearch, getBadges,
    getPracticedCommands, getChallengeMode, getCurrentChallenge, getChallengeTimerInterval,
    getChallengeStartTime, getChallengeScoreValue, getChallengeProgressValue, getCurrentTaskIndex,
    cloneState, pushUndo, escapeHtml, isEscapeKey, resetGameState, resetChallengeState, resetLevelState,
    setCurrentLevel, setContent, setCursor, setMode, setCommandHistory, setCommandLog,
    setYankedLine, setReplacePending, setCountBuffer, setSearchMode, setSearchQuery,
    setLastSearchQuery, setLastSearchDirection, setSearchMatches, setCurrentMatchIndex,
    setUsedSearchInLevel, setNavCountSinceSearch, setLevel12Undo, setLevel12RedoAfterUndo,
    setLastExCommand, setChallengeMode, setCurrentChallenge, setChallengeTimerInterval,
    setChallengeStartTime, setChallengeScoreValue, setChallengeProgressValue, setCurrentTaskIndex
} from './game-state.js';

import { levels, loadLevel, getLevelCount, isLastLevel } from './levels.js';
import { challenges, startChallenge, endChallenge, checkChallengeTask } from './challenges.js';
import { handleNormalMode, handleInsertMode, handleSearchMode } from './vim-commands.js';
import { 
    initializeDOMReferences, renderEditor, updateStatusBar, updateInstructions, 
    updateLevelIndicator, updateCommandLog, createLevelButtons, renderBadges, 
    showModal, hideModal, showCelebration, hideCelebration, flashLevelComplete,
    updateChallengeUI, showChallengeContainer, hideChallengeContainer, showBadgeToast
} from './ui-components.js';
import { openCheat, closeCheat, renderCheatList } from './cheat-mode.js';
import { 
    checkWinCondition, maybeAwardBadges, nextLevel, previousLevel, resetLevel,
    toggleChallengeMode, updateUI
} from './event-handlers.js';

// setChallengeMode is already imported above

// Game initialization
function initializeGame() {
    // Initialize DOM references
    initializeDOMReferences();
    
    // Load first level
    loadLevel(0);
    
    // Initial UI update
    updateUI();
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
    const cheatToggleBtn = document.getElementById('cheat-toggle');
    const cheatOverlay = document.getElementById('cheat-overlay');
    const cheatCloseBtn = document.getElementById('cheat-close');
    const cheatSearch = document.getElementById('cheat-search');
    const cheatContent = document.getElementById('cheat-content');
    const cheatPanel = document.getElementById('cheat-panel');

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
            checkWinCondition();
        });
    }

    // Editor container click to focus
    if (editorContainer) {
        editorContainer.addEventListener('click', () => {
            if (editorInput) editorInput.focus();
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
            resetGameState();
            setCurrentLevel(0);
            loadLevel(0);
            updateUI();
            updateLevelIndicator(0, levels.length);
            createLevelButtons(levels, 0);
            hideCelebration();
            if (editorInput) editorInput.focus();
        });
    }

    // Level selection
    if (levelSelectionContainer) {
        levelSelectionContainer.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') {
                const levelIndex = parseInt(e.target.dataset.level, 10);
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

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeGame();
    
    // Setup event listeners
    setupEventListeners();
    
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
