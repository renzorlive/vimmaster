// VIM Master Game - Progress Save/Load System

import {
    getBadges, getPracticedCommands, getCurrentLevel, getChallengeMode,
    getChallengeScoreValue, getXp, getCombo, setBadges,
    setPracticedCommands, setCurrentLevel, setChallengeMode, setChallengeScoreValue,
    setXp, setCombo
} from './game-state.js';

import { levels } from './levels.js';
import { logger, CATEGORIES } from './logger.js';

// Progress System Class
class ProgressSystem {
    constructor() {
        this.version = '1.0';
        this.exportPrefix = 'VIM_MASTER_PROGRESS_';
        this.storageKey = 'vimMasterProgress';
        this.backupKey = 'vimMasterProgressBackup';
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
                challengePoints: getChallengeScoreValue(),
                xp: getXp(),
                combo: getCombo()
            };

            // Convert to JSON and encode
            const jsonString = JSON.stringify(progressData);
            const base64String = btoa(jsonString);
            
            // Add prefix for easy identification
            return this.exportPrefix + base64String;
        } catch (error) {
            logger.error(CATEGORIES.PROGRESS, 'Export failed', { error: error.message });
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
            } catch {
                return { success: false, message: 'Invalid import code encoding' };
            }

            // Parse JSON
            let progressData;
            try {
                progressData = JSON.parse(jsonString);
            } catch {
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
            logger.error(CATEGORIES.PROGRESS, 'Import failed', { error: error.message });
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
        
        if (data.xp === undefined) data.xp = 0;
        if (data.combo === undefined) data.combo = 0;

        // Check version compatibility
        if (data.version !== this.version) {
            return { valid: false, message: `Version mismatch. Expected ${this.version}, got ${data.version}` };
        }

        // Check data types
        if (!Array.isArray(data.badges) || !Array.isArray(data.practicedCommands)) {
            return { valid: false, message: 'Invalid data types in progress data' };
        }

        // Check level range (always derived from the levels data — never hardcoded,
        // see docs/architecture/constants.md)
        if (!Number.isInteger(data.currentLevel) || data.currentLevel < 0 || data.currentLevel >= levels.length) {
            return { valid: false, message: 'Invalid level number in progress data' };
        }

        return { valid: true };
    }

    /**
     * Attempt to repair invalid progress data instead of rejecting it.
     * User data is never destroyed automatically (PROJECT_PRINCIPLES.md #8).
     * @param {Object} data - Possibly-invalid progress data
     * @returns {Object|null} A valid progress object, or null if unrepairable
     */
    repairProgressData(data) {
        if (typeof data !== 'object' || data === null) {
            return null;
        }

        const repaired = { ...data };

        // Best-effort migration: normalize to the current version after
        // defaulting any fields that version didn't have
        repaired.version = this.version;
        if (typeof repaired.timestamp !== 'number') repaired.timestamp = Date.now();
        if (!Array.isArray(repaired.badges)) repaired.badges = [];
        if (!Array.isArray(repaired.practicedCommands)) repaired.practicedCommands = [];
        if (typeof repaired.challengeMode !== 'boolean') repaired.challengeMode = false;
        if (typeof repaired.challengePoints !== 'number' || !Number.isFinite(repaired.challengePoints)) {
            repaired.challengePoints = 0;
        }
        if (typeof repaired.xp !== 'number' || !Number.isFinite(repaired.xp)) repaired.xp = 0;
        if (typeof repaired.combo !== 'number' || !Number.isFinite(repaired.combo)) repaired.combo = 0;

        // Clamp the level into the valid range instead of rejecting it
        const level = Number(repaired.currentLevel);
        repaired.currentLevel = Number.isFinite(level)
            ? Math.min(Math.max(Math.trunc(level), 0), levels.length - 1)
            : 0;

        return this.validateProgressData(repaired).valid ? repaired : null;
    }

    /**
     * Preserve the original (raw) save before it can be overwritten.
     * @param {string} raw - The raw string found in storage
     * @param {string} reason - Why the backup was made
     */
    backupProgress(raw, reason) {
        try {
            localStorage.setItem(this.backupKey, JSON.stringify({
                backedUpAt: Date.now(),
                reason,
                raw
            }));
        } catch (error) {
            logger.warn(CATEGORIES.STORAGE, 'Failed to back up progress data', { error: error.message });
        }
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
        
        // Apply XP and Combo
        setXp(data.xp || 0);
        setCombo(data.combo || 0);
        
    }

    /**
     * Save progress data to localStorage
     * @param {Object} data - Progress data to save
     */
    saveToLocalStorage(data) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (error) {
            logger.warn(CATEGORIES.STORAGE, 'Failed to save progress to localStorage', { error: error.message });
        }
    }

    /**
     * Load progress from localStorage
     * @returns {Object|null} Progress data or null if not found
     */
    loadFromLocalStorage() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            logger.warn(CATEGORIES.STORAGE, 'Failed to load progress from localStorage', { error: error.message });
        }
        return null;
    }

    /**
     * Auto-load progress on game start.
     *
     * Load → validate → if invalid, try repair → if repaired, continue;
     * otherwise keep the original save, create a backup, and notify the user.
     * A save is NEVER deleted here, no matter how corrupted (see PM-0001).
     *
     * @returns {{loaded: boolean, repaired: boolean, message: string|null}}
     */
    autoLoadProgress() {
        let raw = null;
        try {
            raw = localStorage.getItem(this.storageKey);
        } catch (error) {
            logger.warn(CATEGORIES.STORAGE, 'Failed to access saved progress', { error: error.message });
            return { loaded: false, repaired: false, message: null };
        }

        if (!raw) {
            return { loaded: false, repaired: false, message: null };
        }

        let stored = null;
        try {
            stored = JSON.parse(raw);
        } catch (error) {
            logger.warn(CATEGORIES.STORAGE, 'Saved progress is not valid JSON', { error: error.message });
        }

        if (stored) {
            const validation = this.validateProgressData(stored);
            if (validation.valid) {
                this.applyProgressData(stored);
                return { loaded: true, repaired: false, message: null };
            }

            const repaired = this.repairProgressData(stored);
            if (repaired) {
                this.backupProgress(raw, `repaired: ${validation.message}`);
                this.applyProgressData(repaired);
                this.saveToLocalStorage(repaired);
                return {
                    loaded: true,
                    repaired: true,
                    message: 'Your saved progress was automatically repaired. A backup of the original was kept.'
                };
            }
        }

        // Unrepairable: keep the original save untouched, back it up, tell the user.
        this.backupProgress(raw, 'unrepairable');
        return {
            loaded: false,
            repaired: false,
            message: 'Your saved progress could not be read. It was NOT deleted — a backup was kept in your browser.'
        };
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
            logger.warn(CATEGORIES.PROGRESS, 'Auto-save failed', { error: error.message });
        }
    }

    /**
     * Clear all saved progress. This is only ever called from an explicit,
     * user-confirmed action — even then, the save is backed up first
     * (user data is never destroyed automatically, PROJECT_PRINCIPLES.md #8).
     */
    clearProgress() {
        try {
            const raw = localStorage.getItem(this.storageKey);
            if (raw) {
                this.backupProgress(raw, 'user-initiated clear');
            }
            localStorage.removeItem(this.storageKey);
            
            // Clear the game state using statically imported functions
            try {
                setBadges([]);
                setPracticedCommands([]);
                setCurrentLevel(0);
                setChallengeMode(false);
                setChallengeScoreValue(0);
            } catch (error) {
                logger.warn(CATEGORIES.PROGRESS, 'Failed to clear game state', { error: error.message });
            }
            
            return { success: true, message: 'Progress cleared successfully' };
        } catch {
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
            totalLevels: levels.length,
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
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const data = JSON.parse(stored);
                return new Date(data.timestamp).toLocaleString();
            }
        } catch (error) {
            logger.warn(CATEGORIES.STORAGE, 'Failed to get last saved time', { error: error.message });
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
