// VIM Master Game - Event Handlers

import {
    getContent, getCursor, getMode, getCurrentLevel,
    getCommandHistory, getCommandLog, getYankedLine, getReplacePending,
    getCountBuffer, getUndoStack, getRedoStack, getLevel12Undo,
    getLevel12RedoAfterUndo, getLastExCommand, getSearchMode, getSearchQuery,
    getLastSearchQuery, getLastSearchDirection, getSearchMatches, getCurrentMatchIndex,
    getUsedSearchInLevel, getNavCountSinceSearch, getBadges, getPracticedCommands,
    getChallengeMode, getCurrentChallenge, getChallengeTimerInterval, getChallengeStartTime,
    getChallengeScoreValue, getChallengeProgressValue, getCurrentTaskIndex, resetChallengeState,
    resetLevelState, setChallengeMode, setCurrentLevel, setContent,
    setCursor, setMode, setLastExCommand, setCurrentChallenge,
    setCurrentTaskIndex, setChallengeScoreValue, setChallengeProgressValue, setChallengeStartTime,
    setChallengeTimerInterval, addBadge, getXp, getCombo,
    setXp, setCombo
} from './game-state.js';

import { levels, loadLevel } from './levels.js';
import { isInPracticeMode } from './cheat-mode.js';
import { startChallenge, getChallengeTimeRemaining, calculateTaskPoints } from './challenges.js';
import {
    renderEditor, updateStatusBar, updateInstructions, updateLevelIndicator,
    updateCommandLog, createLevelButtons, renderBadges, showModal,
    showCelebration, flashLevelComplete, updateChallengeUI, showChallengeContainer,
    hideChallengeContainer, showBadgeToast, flashError, updateStatsBar,
    showEditorFeedback
} from './ui-components.js';
import {
    noteMistake, noteLessonComplete, recordCompletionState, getSessionMetrics
} from './retention-state.js';
import { autoSaveProgress } from './progress-system.js';
import { evaluateWinCondition } from './win-evaluator.js';
import { logger, CATEGORIES } from './logger.js';

// Game Logic Functions
export function checkWinCondition() {
    // Check challenge mode first
    if (getChallengeMode() && getCurrentChallenge()) {
        const challenge = getCurrentChallenge();
        const currentTask = challenge.tasks[getCurrentTaskIndex()];
        
        
        if (currentTask.validation) {
            // Create a gameState object for validation
            const gameState = {
                getContent: getContent,
                getCursor: getCursor,
                getYankedLine: getYankedLine
            };
            
            
            const validationResult = currentTask.validation(gameState);
            
            if (validationResult) {
                
                 // Award points via the single scoring source of truth (TD-6)
                 const taskPoints = calculateTaskPoints(challenge, getChallengeStartTime());
                 setChallengeScoreValue(getChallengeScoreValue() + taskPoints);
                 
                 
                 // Auto-save progress to persist challenge points
                 try {
                     autoSaveProgress();
                 } catch (error) {
                     logger.warn(CATEGORIES.PROGRESS, 'Failed to auto-save progress', { error: error.message });
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
                     hideChallengeContainer();
                     
                     // Disable challenge mode to stop timer
                     setChallengeMode(false);
                     setCurrentChallenge(null);
                     
                     // Auto-save final challenge points
                     try {
                         autoSaveProgress();
                     } catch (error) {
                         logger.warn(CATEGORIES.PROGRESS, 'Failed to save final challenge points', { error: error.message });
                     }
                     
                     // Debug modal elements
                     
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
                     
                     
                     return;
                 }
            }
        }
        return; // Don't check level win condition in challenge mode
    }
    
    // Regular level win condition check
    const level = levels[getCurrentLevel()];
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

    const { won } = evaluateWinCondition(state, level);

    if (won) {
        flashLevelComplete();
        setTimeout(() => {
            maybeAwardBadges();
            
            // Calculate XP based on difficulty
            let earnedXp = 10;
            const diff = level.metadata && level.metadata.difficulty ? level.metadata.difficulty : 'beginner';
            if (diff === 'beginner') earnedXp = 15;
            else if (diff === 'intermediate') earnedXp = 25;
            else if (diff === 'advanced') earnedXp = 50;
            
            setXp(getXp() + earnedXp);
            setCombo(getCombo() + 1);
            showEditorFeedback(`✔ Correct\n+${earnedXp} XP\nCombo x${getCombo()}`, 'success');
            noteLessonComplete({
                earnedXp,
                combo: getCombo(),
                progressSummary: {
                    currentLevel: getCurrentLevel(),
                    totalLevels: levels.length,
                    badgesEarned: getBadges().size,
                    commandsPracticed: getPracticedCommands().size,
                    challengePoints: getChallengeScoreValue()
                },
                lessonName: level.name,
                focusCommand: level.focusCommand ? level.focusCommand : (level.solution ? level.solution.join('') : ''),
                finalLevel: getCurrentLevel() === levels.length - 1
            });
            const sessionMetrics = getSessionMetrics();

            // Persist progress at the moment of completion (TD-3): the dead
            // window.checkWinCondition wrapper never ran, so wins relied on
            // the 30s interval save and could be lost on a quick tab close.
            try {
                autoSaveProgress();
                if (typeof window.updateProgressSummary === 'function') {
                    window.updateProgressSummary();
                }
            } catch (error) {
                logger.warn(CATEGORIES.PROGRESS, 'Failed to auto-save progress on level completion', { error: error.message });
            }

            // Check if this is the final level
            if (getCurrentLevel() === levels.length - 1) {
                // Final level completed - show celebration directly
                recordCompletionState(true);
                showCelebration();
            } else {
                // Regular level completed - show level completion modal
                const focusCmd = level.focusCommand ? level.focusCommand : (level.solution ? level.solution.join('') : '');
                
                let title = `✓ Lesson Complete`;
                let message = `
                    <div class="lesson-complete-summary">
                        <div class="text-xs uppercase tracking-[0.35em] text-gray-400 mb-2">Next step unlocked</div>
                        <div class="bg-gray-800/90 border border-gray-700 rounded-xl font-mono text-green-400 text-3xl md:text-4xl text-center inline-block px-4 py-3 tracking-tight shadow-inner">${focusCmd}</div>
                        <div class="text-gray-300 text-sm mt-4 mb-3">${level.instructions || 'You completed the lesson!'}</div>
                        <div class="flex flex-wrap justify-center gap-3 text-sm">
                            <div class="px-3 py-2 rounded-full bg-gray-800/80 border border-gray-700 text-yellow-300 font-semibold">Accuracy ${sessionMetrics.accuracy}%</div>
                            <div class="px-3 py-2 rounded-full bg-gray-800/80 border border-gray-700 text-blue-300 font-semibold">${sessionMetrics.lessonSeconds}s</div>
                            <div class="px-3 py-2 rounded-full bg-gray-800/80 border border-gray-700 text-yellow-300 font-semibold">+${earnedXp} XP</div>
                            <div class="px-3 py-2 rounded-full bg-gray-800/80 border border-gray-700 text-orange-300 font-semibold">Combo x${getCombo()}</div>
                        </div>
                        <div class="text-blue-300 text-xs mt-4 uppercase tracking-[0.25em]">Continue when ready</div>
                    </div>`;
                
                if (getCurrentLevel() === 3) {
                    message += `<div class="mt-4 pt-4 border-t border-gray-700/50 text-blue-400 font-bold fade-in-up">🎉 New mode unlocked: Practice Arena</div>`;
                }
                
                showModal(title, message);
            }
        }, 500);
    } else {
        // If an Ex command was just entered and failed to win
        if (state.lastExCommand) {
            flashError();
            showEditorFeedback('✖ Not quite', 'error');
            noteMistake();
            setCombo(0);
            updateStatsBar(0, getXp());
            setLastExCommand(''); // Reset it so it doesn't flash continuously
        }
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
                 autoSaveProgress();
                 // Update progress summary display using the global updateProgressSummary function
                 if (typeof window.updateProgressSummary === 'function') {
                     window.updateProgressSummary();
                 }
             } catch {
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
    
    setChallengeMode(!getChallengeMode());
    
    if (getChallengeMode()) {
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
        
        
        const challenge = startChallenge(gameStateObj);
        
        // Update the challenge UI with the challenge data
        if (challenge) {
            
            updateChallengeUI(challenge, 0, 0, challenge.timeLimit);
            
                         // Start the challenge timer
             const timerInterval = setInterval(() => {
                 // Check if challenge is still active
                 if (!getChallengeMode() || !getCurrentChallenge()) {
                     clearInterval(timerInterval);
                     return;
                 }
                 
                 const timeRemaining = getChallengeTimeRemaining({
                     currentChallenge: challenge,
                     challengeStartTime: getChallengeStartTime()
                 });
                 
                 
                 if (timeRemaining <= 0) {
                     // Time's up - end the challenge
                     clearInterval(timerInterval);
                     
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
        
        // Update the main UI to show challenge content
        updateUI();
        
        // Ensure editor gets focus for immediate input
        setTimeout(() => {
            const editorInput = document.getElementById('vim-editor-input');
            if (editorInput) {
                editorInput.focus();
            }
        }, 100);
    } else {
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
        return;
    }
    
    _isUpdatingUI = true;
    
    try {
        renderEditor(getContent(), getCursor(), getMode());
        updateStatusBar(
            getMode(),
            getSearchMode(),
            getSearchQuery(),
            getLastSearchDirection(),
            getSearchMatches(),
            getCurrentMatchIndex(),
            getCommandHistory(),
            getCursor(),
            getCurrentLevel(),
            levels.length,
            getXp(),
            getCombo()
        );
        
        // Use centralized instructions rendering
        updateInstructions();
        
        // Fix stuck challenge mode state - if we're not in practice mode and no current challenge, reset challenge mode
        if (getChallengeMode() && !isInPracticeMode() && !getCurrentChallenge()) {
            setChallengeMode(false);
            setCurrentChallenge(null);
        }
        
        // Hide level indicator and buttons in challenge mode or practice mode
        if (getChallengeMode() || isInPracticeMode()) {
            updateLevelIndicator(-1, 0); // Hide level indicator
            // Don't create level buttons in challenge mode or practice mode
        } else {
            updateLevelIndicator(getCurrentLevel(), levels.length);
            createLevelButtons(levels, getCurrentLevel());
        }
        
        updateCommandLog(getCommandLog());
        renderBadges(getBadges());
        
        // Update gamification stats
        import('./game-state.js').then(module => {
            updateStatsBar(module.getCombo(), module.getXp());
        });

        if (typeof window.updateRetentionSummary === 'function') {
            window.updateRetentionSummary();
        }
        
    } finally {
        _isUpdatingUI = false;
    }
}

// All functions are already exported as named exports above
