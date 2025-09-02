// VIM Master Game - Progress Save/Load System

import { 
    getBadges, getPracticedCommands, getCurrentLevel, getChallengeMode, getChallengeScoreValue,
    setBadges, setPracticedCommands, setCurrentLevel, setChallengeMode, setChallengeScoreValue
} from './game-state.js';

// Progress System Class
class ProgressSystem {
    constructor() {
        this.version = '1.0';
        this.exportPrefix = 'VIM_MASTER_PROGRESS_';
    }

    /**
     * Export user progress as a compact code
     * @returns {string} Base64 encoded progress data
     */
    exportProgress() {
        try {
            // Collect all progress data
            const progressData = {
                version: this.version,
                timestamp: Date.now(),
                badges: Array.from(getBadges()),
                practicedCommands: Array.from(getPracticedCommands()),
                currentLevel: getCurrentLevel(),
                challengeMode: getChallengeMode(),
                challengePoints: getChallengeScoreValue()
            };

            // Convert to JSON and encode
            const jsonString = JSON.stringify(progressData);
            const base64String = btoa(jsonString);
            
            // Add prefix for easy identification
            return this.exportPrefix + base64String;
        } catch (error) {
            console.error('Export failed:', error);
            throw new Error('Failed to export progress data');
        }
    }

    /**
     * Import user progress from a code
     * @param {string} importCode - The progress code to import
     * @returns {Object} Import result with success status and message
     */
    importProgress(importCode) {
        try {
            // Validate import code format
            if (!importCode || typeof importCode !== 'string') {
                return { success: false, message: 'Invalid import code format' };
            }

            // Remove prefix if present
            let code = importCode;
            if (importCode.startsWith(this.exportPrefix)) {
                code = importCode.substring(this.exportPrefix.length);
            }

            // Decode base64
            let jsonString;
            try {
                jsonString = atob(code);
            } catch (error) {
                return { success: false, message: 'Invalid import code encoding' };
            }

            // Parse JSON
            let progressData;
            try {
                progressData = JSON.parse(jsonString);
            } catch (error) {
                return { success: false, message: 'Invalid import code data' };
            }

            // Validate data structure
            const validation = this.validateProgressData(progressData);
            if (!validation.valid) {
                return { success: false, message: validation.message };
            }

            // Apply imported progress
            this.applyProgressData(progressData);

            // Save to localStorage
            this.saveToLocalStorage(progressData);

            return { 
                success: true, 
                message: `Progress imported successfully! Level ${progressData.currentLevel + 1}, ${progressData.badges.length} badges, ${progressData.practicedCommands.length} commands practiced, ${progressData.challengePoints} challenge points.` 
            };

        } catch (error) {
            console.error('Import failed:', error);
            return { success: false, message: 'Failed to import progress data' };
        }
    }

    /**
     * Validate imported progress data
     * @param {Object} data - Progress data to validate
     * @returns {Object} Validation result
     */
    validateProgressData(data) {
        // Check required fields
        if (!data.version || !data.timestamp || !data.badges || !data.practicedCommands || data.currentLevel === undefined) {
            return { valid: false, message: 'Invalid progress data structure' };
        }
        
        // Handle challenge points - if not present, default to 0
        if (data.challengePoints === undefined) {

            data.challengePoints = 0;
        }

        // Check version compatibility
        if (data.version !== this.version) {
            return { valid: false, message: `Version mismatch. Expected ${this.version}, got ${data.version}` };
        }

        // Check data types
        if (!Array.isArray(data.badges) || !Array.isArray(data.practicedCommands)) {
            return { valid: false, message: 'Invalid data types in progress data' };
        }

        // Check level range
        if (data.currentLevel < 0 || data.currentLevel > 25) {
            return { valid: false, message: 'Invalid level number in progress data' };
        }

        // Check timestamp (reject very old data)
        const maxAge = 365 * 24 * 60 * 60 * 1000; // 1 year
        if (Date.now() - data.timestamp > maxAge) {
            return { valid: false, message: 'Progress data is too old and may be incompatible' };
        }

        return { valid: true };
    }

    /**
     * Apply imported progress data to game state
     * @param {Object} data - Validated progress data
     */
    applyProgressData(data) {

        
        // Apply badges
        setBadges(data.badges);

        // Apply practiced commands
        const practicedSet = new Set(data.practicedCommands);
        setPracticedCommands(practicedSet);

        // Apply current level
        setCurrentLevel(data.currentLevel);

        // Apply challenge mode
        setChallengeMode(data.challengeMode);
        
        // Apply challenge points
        setChallengeScoreValue(data.challengePoints || 0);
        

    }

    /**
     * Save progress data to localStorage
     * @param {Object} data - Progress data to save
     */
    saveToLocalStorage(data) {
        try {
            localStorage.setItem('vimMasterProgress', JSON.stringify(data));
        } catch (error) {
            console.warn('Failed to save progress to localStorage:', error);
        }
    }

    /**
     * Load progress from localStorage
     * @returns {Object|null} Progress data or null if not found
     */
    loadFromLocalStorage() {
        try {
            const stored = localStorage.getItem('vimMasterProgress');
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.warn('Failed to load progress from localStorage:', error);
        }
        return null;
    }

    /**
     * Auto-load progress on game start
     */
    autoLoadProgress() {
        // Debug statements removed for cleaner console output
        const storedProgress = this.loadFromLocalStorage();
        if (storedProgress) {

            const validation = this.validateProgressData(storedProgress);
            if (validation.valid) {

                this.applyProgressData(storedProgress);
                return true;
            } else {

                // Clear invalid stored data
                localStorage.removeItem('vimMasterProgress');
            }
        }
        return false;
    }

    /**
     * Auto-save current progress
     */
    autoSaveProgress() {
        try {
            const challengePoints = getChallengeScoreValue();

            
            const currentProgress = {
                version: this.version,
                timestamp: Date.now(),
                badges: Array.from(getBadges()),
                practicedCommands: Array.from(getPracticedCommands()),
                currentLevel: getCurrentLevel(),
                challengeMode: getChallengeMode(),
                challengePoints: challengePoints || 0
            };

            this.saveToLocalStorage(currentProgress);
        } catch (error) {
            console.warn('Auto-save failed:', error);
        }
    }

    /**
     * Clear all saved progress
     */
    clearProgress() {
        try {
            localStorage.removeItem('vimMasterProgress');
            
            // Clear the game state using statically imported functions
            try {
                setBadges([]);
                setPracticedCommands([]);
                setCurrentLevel(0);
                setChallengeMode(false);
                setChallengeScoreValue(0);
            } catch (error) {
                console.warn('Failed to clear game state:', error);
            }
            
            return { success: true, message: 'Progress cleared successfully' };
        } catch (error) {
            return { success: false, message: 'Failed to clear progress' };
        }
    }

    /**
     * Get progress summary for display
     * @returns {Object} Progress summary
     */
    getProgressSummary() {

        
        const challengePoints = getChallengeScoreValue();

        
        // Ensure we always return a number
        const safeChallengePoints = (challengePoints !== undefined && challengePoints !== null) ? challengePoints : 0;

        
        const result = {
            currentLevel: getCurrentLevel(),
            totalLevels: 26,
            badgesEarned: getBadges().size,
            commandsPracticed: getPracticedCommands().size,
            challengePoints: safeChallengePoints,
            lastSaved: this.getLastSavedTime()
        };
        

        return result;
    }

    /**
     * Get last saved time
     * @returns {string} Formatted time string
     */
    getLastSavedTime() {
        try {
            const stored = localStorage.getItem('vimMasterProgress');
            if (stored) {
                const data = JSON.parse(stored);
                return new Date(data.timestamp).toLocaleString();
            }
        } catch (error) {
            console.warn('Failed to get last saved time:', error);
        }
        return 'Never';
    }
}

// Create and export singleton instance
export const progressSystem = new ProgressSystem();

// Export individual functions for convenience
export const exportProgress = () => progressSystem.exportProgress();
export const importProgress = (code) => progressSystem.importProgress(code);
export const autoLoadProgress = () => progressSystem.autoLoadProgress();
export const autoSaveProgress = () => progressSystem.autoSaveProgress();
export const clearProgress = () => progressSystem.clearProgress();
export const getProgressSummary = () => progressSystem.getProgressSummary();
