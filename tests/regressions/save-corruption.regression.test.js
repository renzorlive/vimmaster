/**
 * Regression ID: TD-0001
 * 
 * Issue: Progress validation off-by-one destroys saves.
 * 
 * Original Cause: The progress validator hardcoded the max level index to 14, 
 * while the game had 16 levels. A user completing the game got their save marked 
 * invalid on load, and `autoLoadProgress` permanently deleted invalid saves.
 * 
 * User Impact: Users who beat the game lost all their progress upon refreshing the page.
 * 
 * Fixed In: PM-0001
 * 
 * Test Strategy: 
 * 1. Verify that a valid save (completed game, currentLevel = 15) is loaded successfully.
 * 2. Verify that an invalid save (corrupted) is NOT deleted from storage, but rather 
 * kept/backed up, ensuring user data is never destroyed automatically.
 * 
 * Never Break Again: We derive level count dynamically from the levels array and never
 * destructively wipe user data during auto-load validation.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { loadFixture } from '../helpers/fixtures.js';
import { setupMockStorage } from '../helpers/mock-storage.js';
import { progressSystem } from '../../js/progress-system.js';

describe('Regression: TD-0001 Save Corruption', () => {
    let mockStorage;
    let originalConsoleWarn;

    beforeEach(() => {
        // Setup mock localStorage
        mockStorage = setupMockStorage();
        
        // Suppress warnings for clean test output
        originalConsoleWarn = console.warn;
        console.warn = vi.fn();
    });

    afterEach(() => {
        console.warn = originalConsoleWarn;
        mockStorage.clear();
        vi.restoreAllMocks();
    });

    it('should successfully load a valid completed game save', () => {
        const completedSave = loadFixture('saves', 'completed-game.json');
        
        // Mock the application state setters that applyProgressData calls
        vi.spyOn(progressSystem, 'applyProgressData').mockImplementation(() => {});

        mockStorage.setItem(progressSystem.storageKey, JSON.stringify(completedSave));
        
        const result = progressSystem.autoLoadProgress();
        
        expect(result.loaded).toBe(true);
        expect(mockStorage.getItem(progressSystem.storageKey)).not.toBeNull();
        expect(progressSystem.applyProgressData).toHaveBeenCalled();
    });

    it('should attempt to repair a corrupted save and back up the original', () => {
        const corruptedSave = loadFixture('saves', 'corrupted-save.json');
        const rawJson = JSON.stringify(corruptedSave);
        
        mockStorage.setItem(progressSystem.storageKey, rawJson);
        
        const result = progressSystem.autoLoadProgress();
        
        // It should repair and load
        expect(result.loaded).toBe(true);
        expect(result.repaired).toBe(true);
        
        // The original corrupted data must be preserved in backup
        const backupDataRaw = mockStorage.getItem(progressSystem.backupKey);
        const backupData = JSON.parse(backupDataRaw);
        expect(backupData.raw).toBe(rawJson);
    });

    it('should NOT delete an unparseable save from storage', () => {
        const unparseable = "{ this is not valid json ]";
        mockStorage.setItem(progressSystem.storageKey, unparseable);
        
        const result = progressSystem.autoLoadProgress();
        
        expect(result.loaded).toBe(false);
        expect(mockStorage.getItem(progressSystem.storageKey)).toBe(unparseable);
    });
});
