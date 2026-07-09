import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FIXTURES_DIR = path.resolve(__dirname, '../fixtures');

export function loadFixture(category, filename) {
    const fixturePath = path.join(FIXTURES_DIR, category, filename);
    const content = fs.readFileSync(fixturePath, 'utf8');
    
    if (filename.endsWith('.json')) {
        return JSON.parse(content);
    }
    return content;
}

export function createLesson(overrides = {}) {
    return {
        id: 'test-lesson',
        name: 'Test Lesson',
        instructions: 'Test instructions',
        initialContent: ['line 1', 'line 2'],
        targetContent: ['line 1'],
        ...overrides
    };
}
