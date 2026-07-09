import { StaticContentProvider } from './content-provider.js';
import { deepFreeze } from './utils/deep-freeze.js';

const provider = new StaticContentProvider();

/**
 * Normalizes a lesson object (e.g., standardizing difficulty enums or empty arrays).
 * 
 * @param {Object} rawLesson - The un-normalized lesson JSON.
 * @returns {Object} The normalized lesson.
 */
function normalizeLesson(rawLesson) {
    const lesson = { ...rawLesson };

    // Normalize metadata
    if (!lesson.metadata) {
        lesson.metadata = {};
    }
    
    // Ensure difficulty is a standard enum (fallback to beginner)
    const validDifficulties = ['beginner', 'intermediate', 'advanced'];
    if (!lesson.metadata.difficulty || !validDifficulties.includes(lesson.metadata.difficulty)) {
        lesson.metadata.difficulty = 'beginner';
    }

    // Default prerequisites
    if (!lesson.metadata.prerequisites) {
        lesson.metadata.prerequisites = [];
    }

    return lesson;
}

/**
 * Loads all regular lessons, normalizes them, and strictly freezes them.
 * 
 * @returns {Array<Object>} The frozen regular lessons.
 */
export function loadRegularLessons() {
    const rawLessons = provider.getAllRegularLessons();
    const normalized = rawLessons.map(normalizeLesson);
    return deepFreeze(normalized);
}

/**
 * Loads all practice lessons (cheat mode), normalizes them, and strictly freezes them.
 * 
 * @returns {Array<Object>} The frozen practice lessons.
 */
export function loadPracticeLessons() {
    const rawLessons = provider.getAllPracticeLessons();
    const normalized = rawLessons.map(normalizeLesson);
    return deepFreeze(normalized);
}

/**
 * Get the full index (version, generatedAt, lists of ids).
 * @returns {Object} The frozen index.
 */
export function loadIndex() {
    return deepFreeze(provider.getIndex());
}
