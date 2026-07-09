import { generatedContent } from './generated-content.js';

/**
 * Abstraction layer for delivering content to the engine.
 * Isolates the engine from the specifics of how JSON files are bundled or fetched.
 */
export class StaticContentProvider {
    constructor() {
        this.index = generatedContent.index;
        this.lessons = generatedContent.lessons;
    }

    /**
     * @returns {Object} The complete content index.
     */
    getIndex() {
        return this.index;
    }

    /**
     * @param {string} lessonId - The slug ID of the lesson.
     * @returns {Object|null} The lesson JSON, or null if not found.
     */
    getLesson(lessonId) {
        return this.lessons[lessonId] || null;
    }

    /**
     * @returns {Array<Object>} All regular lessons.
     */
    getAllRegularLessons() {
        return this.index.regularLessons.map(id => this.lessons[id]).filter(Boolean);
    }

    /**
     * @returns {Array<Object>} All practice/cheat-mode lessons.
     */
    getAllPracticeLessons() {
        return this.index.practiceLessons.map(id => this.lessons[id]).filter(Boolean);
    }
}

// In the future, a FetchContentProvider could be added here.
