// VIM Master Game - Event Handlers

import { 
    getContent, getCursor, getMode, getCurrentLevel, getCommandHistory, getCommandLog,
    getYankedLine, getReplacePending, getCountBuffer, getUndoStack, getRedoStack,
    getLevel12Undo, getLevel12RedoAfterUndo, getLastExCommand, getSearchMode,
    getSearchQuery, getLastSearchQuery, getLastSearchDirection, getSearchMatches,
    getCurrentMatchIndex, getUsedSearchInLevel, getNavCountSinceSearch, getBadges,
    getPracticedCommands, getChallengeMode, getCurrentChallenge, getChallengeTimerInterval,
    getChallengeStartTime, getChallengeScoreValue, getChallengeProgressValue, getCurrentTaskIndex,
    cloneState, pushUndo, escapeHtml, isEscapeKey, resetGameState, resetChallengeState, resetLevelState,
    setChallengeMode, setCurrentLevel, setContent, setCursor, setMode, setCommandHistory,
    setCommandLog, setYankedLine, setReplacePending, setCountBuffer, setSearchMode,
    setSearchQuery, setLastSearchQuery, setLastSearchDirection, setSearchMatches,
    setCurrentMatchIndex, setUsedSearchInLevel, setNavCountSinceSearch, setLevel12Undo,
    setLevel12RedoAfterUndo, setLastExCommand, setCurrentChallenge, setCurrentTaskIndex,
    setChallengeScoreValue, setChallengeProgressValue, setChallengeStartTime,
    setChallengeTimerInterval, addBadge
} from './game-state.js';

import { levels, loadLevel, getCurrentLevelFromGameState, getLevelCount, isLastLevel } from './levels.js';
import { isInPracticeMode, getCurrentLessonSpec } from './cheat-mode.js';
import { challenges, startChallenge, endChallenge, checkChallengeTask, getChallengeTimeRemaining, getChallengeProgress } from './challenges.js';
import { handleNormalMode, handleInsertMode, handleSearchMode } from './vim-commands.js';
import { 
    renderEditor, updateStatusBar, updateInstructions, updateLevelIndicator, 
    updateCommandLog, createLevelButtons, renderBadges, showModal, hideModal,
    showCelebration, hideCelebration, flashLevelComplete, updateChallengeUI,
    showChallengeContainer, hideChallengeContainer, showBadgeToast
} from './ui-components.js';
import { openCheat, closeCheat, renderCheatList } from './cheat-mode.js';

// Game Logic Functions
export function checkWinCondition() {
    // Check challenge mode first
    if (getChallengeMode() && getCurrentChallenge()) {
        const challenge = getCurrentChallenge();
        const currentTask = challenge.tasks[getCurrentTaskIndex()];
        
        console.log('🔍 Checking challenge task:', currentTask.instruction);
        console.log('🔍 Current task index:', getCurrentTaskIndex());
        
        if (currentTask.validation) {
            // Create a gameState object for validation
            const gameState = {
                getContent: getContent,
                getCursor: getCursor,
                getYankedLine: getYankedLine
            };
            
            console.log('🔍 DEBUG: Running challenge validation for task:', currentTask.instruction);
            console.log('🔍 DEBUG: Current content:', getContent());
            console.log('🔍 DEBUG: Current cursor:', getCursor());
            
            const validationResult = currentTask.validation(gameState);
            console.log('🔍 DEBUG: Validation result:', validationResult);
            
            if (validationResult) {
                console.log('🔍 Challenge task completed!');
                
                                 // Award points for completing task
                 const timeBonus = Math.max(0, Math.floor(getChallengeTimeRemaining({
                     currentChallenge: challenge,
                     challengeStartTime: getChallengeStartTime()
                 }) / 10)); // 1 point per 10 seconds remaining
                 const taskPoints = 10 + timeBonus;
                 setChallengeScoreValue(getChallengeScoreValue() + taskPoints);
                 
                 console.log('🔍 Task completed! Points awarded:', taskPoints, 'Total score:', getChallengeScoreValue());
                 
                 // Auto-save progress to persist challenge points
                 try {
                     import('./progress-system.js').then(({ autoSaveProgress }) => {
                         autoSaveProgress();
                         console.log('🔍 Progress auto-saved with challenge points');
                     });
                 } catch (error) {
                     console.warn('Failed to auto-save progress:', error);
                 }
                
                // Move to next task or complete challenge
                                 if (getCurrentTaskIndex() < challenge.tasks.length - 1) {
                     // Next task
                     setCurrentTaskIndex(getCurrentTaskIndex() + 1);
                     setChallengeProgressValue(getChallengeProgressValue() + 1);
                     
                     // Manually update just the instructions for the new task
                     const nextTask = challenge.tasks[getCurrentTaskIndex()];
                     if (nextTask) {
                         const instructionsEl = document.getElementById('instructions');
                         if (instructionsEl) {
                             instructionsEl.innerHTML = `
                                 <div class="text-center">
                                     <div class="text-blue-400 font-bold text-lg mb-2">🚀 ${challenge.name}</div>
                                     <div class="text-gray-300">${nextTask.instruction}</div>
                                     ${nextTask.hint ? `<div class="text-yellow-400 text-sm mt-2">💡 ${nextTask.hint}</div>` : ''}
                                 </div>
                             `;
                         }
                     }
                     
                     return; // Don't show win condition yet
                 } else {
                     // Challenge completed!
                     console.log('🔍 Challenge completed!');
                     hideChallengeContainer();
                     
                     // Disable challenge mode to stop timer
                     setChallengeMode(false);
                     setCurrentChallenge(null);
                     
                     // Auto-save final challenge points
                     try {
                         import('./progress-system.js').then(({ autoSaveProgress }) => {
                             autoSaveProgress();
                             console.log('🔍 Final challenge points saved to progress');
                         });
                     } catch (error) {
                         console.warn('Failed to save final challenge points:', error);
                     }
                     
                     // Debug modal elements
                     console.log('🔍 Modal elements check:');
                     console.log('🔍 - modal:', document.getElementById('modal'));
                     console.log('🔍 - modalTitle:', document.getElementById('modal-title'));
                     console.log('🔍 - modalMessage:', document.getElementById('modal-message'));
                     
                     // Show completion modal with option to play again
                     showModal('🎉 Challenge Complete!', 
                         `You've completed ${challenge.name} with a score of ${getChallengeScoreValue()}!<br><br>
                         <button onclick="window.startNewChallenge()" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                             🚀 Play Another Challenge
                         </button>
                         <button onclick="window.returnToLevel()" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded ml-2">
                             📚 Return to Level
                         </button>`
                     );
                     
                     console.log('🔍 showModal called, checking if modal is visible...');
                     setTimeout(() => {
                         const modal = document.getElementById('modal');
                         if (modal) {
                             console.log('🔍 Modal classes:', modal.className);
                             console.log('🔍 Modal style:', modal.style.cssText);
                         }
                     }, 100);
                     
                     return;
                 }
            }
        }
        return; // Don't check level win condition in challenge mode
    }
    
    // Regular level win condition check
    const level = levels[getCurrentLevel()];
    let won = false;
    
    if (level.exCommands) {
        if (getLastExCommand() && level.exCommands.includes(getLastExCommand())) won = true;
    } else if (level.target) {
        // For search-focused levels, require actual search usage
        const searchLevelNames = ['Search Forward (/)','Search Backward (?)','Search Navigation (n/N)'];
        const isSearchLevel = searchLevelNames.includes(level.name);
        const cursor = getCursor();
        if (cursor.row === level.target.row && cursor.col === level.target.col) {
            if (!isSearchLevel) {
                won = true;
            } else {
                if (level.name === 'Search Navigation (n/N)') {
                    // Require at least two 'n' presses after search to reach 3rd occurrence
                    if (getUsedSearchInLevel() && getNavCountSinceSearch() >= 2 && getLastSearchQuery() && getLastSearchQuery().toLowerCase() === 'foo' && getLastSearchDirection() === 'forward') won = true;
                } else if (level.name === 'Search Forward (/)') {
                    // Now require one 'n' after search to reach second occurrence
                    if (getUsedSearchInLevel() && getLastSearchDirection() === 'forward' && getLastSearchQuery() && getLastSearchQuery().toLowerCase() === 'target' && getNavCountSinceSearch() >= 1) {
                        won = true;
                    }
                } else if (level.name === 'Search Backward (?)') {
                    // Require one 'N' after search to reach previous occurrence
                    if (getUsedSearchInLevel() && getLastSearchDirection() === 'backward' && getLastSearchQuery() && getLastSearchQuery().toLowerCase() === 'alpha' && getNavCountSinceSearch() >= 1) {
                        won = true;
                    }
                }
            }
        }
    
    } else if (level.targetText) {
        if (getContent()[level.targetText.line] === level.targetText.text && getMode() === 'NORMAL') won = true;
    
    } else if (level.targetContent) {
        // Compare lines after trimming trailing whitespace and ignoring trailing blank lines
        const trimLineEnd = (line) => line.replace(/\s+$/, '');
        const stripTrailingBlankLines = (lines) => {
            const result = [...lines];
            while (result.length > 0 && trimLineEnd(result[result.length - 1]) === '') {
                result.pop();
            }
            return result;
        };
        const currentLines = stripTrailingBlankLines(getContent().map(trimLineEnd));
        const targetLines = stripTrailingBlankLines(level.targetContent.map(trimLineEnd));
        if (currentLines.length === targetLines.length && currentLines.every((l, i) => l === targetLines[i])) {
            if (level.name === 'Undo / Redo') {
                if (getLevel12RedoAfterUndo()) won = true;
            } else {
                won = true;
            }
        }
    }

    if (won) {
        flashLevelComplete();
        setTimeout(() => {
            maybeAwardBadges();
            // Check if this is the final level
            if (getCurrentLevel() === levels.length - 1) {
                // Final level completed - show celebration directly
                showCelebration();
            } else {
                // Regular level completed - show level completion modal
                showModal(`Level ${getCurrentLevel() + 1} Complete!`, `You've mastered: ${levels[getCurrentLevel()].name}.`);
            }
        }, 500);
    }
}

export function maybeAwardBadges() {
    let badgesAwarded = false;
    
    // Beginner: after finishing levels up to basic movement group (1-3)
    if (!getBadges().has('beginner') && getCurrentLevel() >= 2) {
        // Add badge to game state
        addBadge('beginner');
        renderBadges(getBadges());
        showBadgeToast('🟢 Beginner Badge earned!');
        badgesAwarded = true;
    }
    // Search Master: after completing any of the search levels while using search
    const searchNames = ['Search Forward (/)','Search Backward (?)','Search Navigation (n/N)'];
    if (!getBadges().has('searchmaster') && searchNames.includes(levels[getCurrentLevel()].name) && getUsedSearchInLevel()) {
        // Add badge to game state
        addBadge('searchmaster');
        renderBadges(getBadges());
        showBadgeToast('🔎 Search Master Badge earned!');
        badgesAwarded = true;
    }
    
    // Auto-save progress if badges were awarded
    if (badgesAwarded) {
        // Use global progress system functions
        setTimeout(() => {
            try {
                // Import the global progress system functions
                import('./progress-system.js').then(({ autoSaveProgress }) => {
                    autoSaveProgress();
                    // Update progress summary display using the global updateProgressSummary function
                    if (typeof window.updateProgressSummary === 'function') {
                        window.updateProgressSummary();
                    }
                });
            } catch (error) {
                // Progress system not available, continue without auto-save
            }
        }, 1000);
    }
}

// Level Management Functions
export function nextLevel() {
    if (getCurrentLevel() < levels.length - 1) {
        setCurrentLevel(getCurrentLevel() + 1);
        loadLevel(getCurrentLevel());
        updateUI();
    }
    // Note: Final level completion is now handled in checkWinCondition()
}

export function previousLevel() {
    if (getCurrentLevel() > 0) {
        setCurrentLevel(getCurrentLevel() - 1);
        loadLevel(getCurrentLevel());
        updateUI();
    }
}

export function resetLevel() {
    loadLevel(getCurrentLevel());
    updateUI();
}

// Challenge Functions
export function toggleChallengeMode() {
    console.log('🔍 toggleChallengeMode called');
    console.log('🔍 Current challenge mode:', getChallengeMode());
    
    setChallengeMode(!getChallengeMode());
    console.log('🔍 New challenge mode:', getChallengeMode());
    
    if (getChallengeMode()) {
        console.log('🔍 Starting challenge mode...');
        showChallengeContainer();
        
        const gameStateObj = {
            content: getContent(), cursor: getCursor(), mode: getMode(), currentLevel: getCurrentLevel(), 
            commandHistory: getCommandHistory(), commandLog: getCommandLog(),
            yankedLine: getYankedLine(), replacePending: getReplacePending(), countBuffer: getCountBuffer(), 
            undoStack: getUndoStack(), redoStack: getRedoStack(),
            level12Undo: getLevel12Undo(), level12RedoAfterUndo: getLevel12RedoAfterUndo(), 
            lastExCommand: getLastExCommand(), searchMode: getSearchMode(),
            searchQuery: getSearchQuery(), lastSearchQuery: getLastSearchQuery(), 
            lastSearchDirection: getLastSearchDirection(), searchMatches: getSearchMatches(),
            currentMatchIndex: getCurrentMatchIndex(), usedSearchInLevel: getUsedSearchInLevel(), 
            navCountSinceSearch: getNavCountSinceSearch(), badges: getBadges(),
            practicedCommands: getPracticedCommands(), challengeMode: getChallengeMode(), 
            currentChallenge: getCurrentChallenge(), challengeTimerInterval: getChallengeTimerInterval(),
            challengeStartTime: getChallengeStartTime(), challengeScoreValue: getChallengeScoreValue(), 
            challengeProgressValue: getChallengeProgressValue(), currentTaskIndex: getCurrentTaskIndex(),
            resetLevelState, resetChallengeState,
            // Add setter functions to update global state
            setContent, setCursor, setMode, setCurrentChallenge, setCurrentTaskIndex,
            setChallengeScoreValue, setChallengeProgressValue, setChallengeStartTime,
            // Add getter functions for challenge validation
            getContent, getCursor, getYankedLine
        };
        
        console.log('🔍 Game state object created:', gameStateObj);
        console.log('🔍 Current content before challenge:', getContent());
        
        const challenge = startChallenge(gameStateObj);
        console.log('🔍 Challenge returned:', challenge);
        
        // Update the challenge UI with the challenge data
        if (challenge) {
            console.log('🔍 Challenge name:', challenge.name);
            console.log('🔍 Challenge content:', challenge.initialContent);
            console.log('🔍 Current content after challenge:', getContent());
            
            updateChallengeUI(challenge, 0, 0, challenge.timeLimit);
            
                         // Start the challenge timer
             const timerInterval = setInterval(() => {
                 // Check if challenge is still active
                 if (!getChallengeMode() || !getCurrentChallenge()) {
                     clearInterval(timerInterval);
                     console.log('🔍 Timer stopped - challenge mode disabled or no current challenge');
                     return;
                 }
                 
                 const timeRemaining = getChallengeTimeRemaining({
                     currentChallenge: challenge,
                     challengeStartTime: getChallengeStartTime()
                 });
                 
                 console.log('🔍 Timer tick - time remaining:', timeRemaining, 'seconds');
                 
                 if (timeRemaining <= 0) {
                     // Time's up - end the challenge
                     clearInterval(timerInterval);
                     console.log('🔍 Time up! Ending challenge...');
                     
                     // Only show timeout modal if challenge hasn't been completed
                     if (getChallengeMode()) {
                         hideChallengeContainer();
                         showModal('⏰ Time Up!', 
                             `Time's up! You scored ${getChallengeScoreValue()} points.<br><br>
                             <button onclick="window.startNewChallenge()" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                 🚀 Try Again
                             </button>
                             <button onclick="window.returnToLevel()" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded ml-2">
                                 📚 Return to Level
                             </button>`
                         );
                     }
                 } else {
                     // Update the timer display
                     updateChallengeUI(challenge, 0, getChallengeScoreValue(), timeRemaining);
                 }
             }, 1000);
            
            // Store the timer interval
            setChallengeTimerInterval(timerInterval);
        }
        
        console.log('🔍 About to call updateUI()');
        // Update the main UI to show challenge content
        updateUI();
        console.log('🔍 updateUI() called, current content:', getContent());
        
        // Ensure editor gets focus for immediate input
        setTimeout(() => {
            const editorInput = document.getElementById('vim-editor-input');
            if (editorInput) {
                editorInput.focus();
                console.log('🔍 Editor focused for challenge mode');
            }
        }, 100);
    } else {
        console.log('🔍 Exiting challenge mode...');
        hideChallengeContainer();
        // Return to current level
        loadLevel(getCurrentLevel());
        updateUI();
    }
}

// Main UI Update Function
let _isUpdatingUI = false; // Guard against infinite loops

export function updateUI() {
    if (_isUpdatingUI) {
        console.log('🔍 updateUI already running, skipping');
        return;
    }
    
    _isUpdatingUI = true;
    console.log('🔍 updateUI called');
    console.log('🔍 Current content in updateUI:', getContent());
    console.log('🔍 Current cursor in updateUI:', getCursor());
    console.log('🔍 Current mode in updateUI:', getMode());
    
    try {
        renderEditor(getContent(), getCursor(), getMode());
        updateStatusBar(getMode(), getSearchMode(), getSearchQuery(), getLastSearchDirection(), getSearchMatches(), getCurrentMatchIndex());
        
        // Use centralized instructions rendering
        updateInstructions();
        
        // Fix stuck challenge mode state - if we're not in practice mode and no current challenge, reset challenge mode
        if (getChallengeMode() && !isInPracticeMode() && !getCurrentChallenge()) {
            console.log('🔍 DEBUG: Fixing stuck challenge mode state');
            setChallengeMode(false);
            setCurrentChallenge(null);
        }
        
        // Hide level indicator and buttons in challenge mode or practice mode
        console.log('🔍 DEBUG: getChallengeMode():', getChallengeMode());
        console.log('🔍 DEBUG: isInPracticeMode():', isInPracticeMode());
        if (getChallengeMode() || isInPracticeMode()) {
            console.log('🔍 DEBUG: Hiding level indicator - in challenge or practice mode');
            updateLevelIndicator(-1, 0); // Hide level indicator
            // Don't create level buttons in challenge mode or practice mode
        } else {
            console.log('🔍 DEBUG: Showing level indicator - current level:', getCurrentLevel(), 'total levels:', levels.length);
            updateLevelIndicator(getCurrentLevel(), levels.length);
            createLevelButtons(levels, getCurrentLevel());
        }
        
        updateCommandLog(getCommandLog());
        renderBadges(getBadges());
        
        console.log('🔍 updateUI completed');
    } finally {
        _isUpdatingUI = false;
    }
}

// All functions are already exported as named exports above
