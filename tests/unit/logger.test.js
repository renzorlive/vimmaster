import { describe, it, expect } from 'vitest';
import { CATEGORIES, LEVELS } from '../../js/logger.js';

describe('Developer Platform - Logger Constants', () => {
    it('should have the correct categories defined', () => {
        // This simple test proves that Vitest can import our ES modules
        // and that the basic infrastructure (Node, Vite, Vitest) is functional.
        expect(CATEGORIES.ENGINE).toBe('engine');
        expect(CATEGORIES.DEVELOPER).toBe('developer');
    });

    it('should have the correct log levels defined', () => {
        expect(LEVELS.DEBUG.name).toBe('debug');
        expect(LEVELS.ERROR.name).toBe('error');
        
        // Ensure emojis are present as they are a core feature of the dev logger
        expect(LEVELS.SUCCESS.emoji).toBe('✅');
    });
});
