import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { levels } from '../js/levels.js';
import { vimLessons } from '../js/cheat-mode.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONTENT_DIR = path.join(__dirname, '../content/lessons');

if (!fs.existsSync(CONTENT_DIR)) {
    fs.mkdirSync(CONTENT_DIR, { recursive: true });
}

function toSlug(name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function migrate() {
    let indexData = {
        version: 1,
        contentVersion: 1,
        generatedAt: new Date().toISOString(),
        generator: 'scripts/migrate-lessons.js',
        regularLessons: [],
        practiceLessons: []
    };

    // 1. Regular Lessons
    levels.forEach((level, index) => {
        const slug = 'lesson-' + toSlug(level.name);
        indexData.regularLessons.push(slug);

        const data = {
            id: slug,
            version: 1,
            name: level.name,
            metadata: {
                revision: 1,
                author: "VIM Master Team",
                created: "2026-07-09",
                difficulty: "beginner",
                tags: ["normal"],
                estimatedTime: 60,
                prerequisites: []
            },
            instructions: level.instructions,
            initialContent: level.initialContent,
        };

        if (level.target) data.target = level.target;
        if (level.targetContent) data.targetContent = level.targetContent;
        if (level.targetText) data.targetText = level.targetText;
        if (level.exCommands) data.exCommands = level.exCommands;
        if (level.solution) data.solution = level.solution;
        if (level.setup) {
            let fakeState = { cursor: { row: 0, col: 0 }, mode: 'NORMAL' };
            level.setup(fakeState);
            data.initialCursor = fakeState.cursor;
        }

        fs.writeFileSync(path.join(CONTENT_DIR, `${slug}.json`), JSON.stringify(data, null, 2), 'utf8');
        console.log(`Migrated: ${slug}`);
    });

    // 2. Cheat Mode Lessons
    for (const [key, level] of vimLessons.entries()) {
        const slug = 'lesson-practice-' + toSlug(level.name);
        indexData.practiceLessons.push(slug);

        const data = {
            id: slug,
            version: 1,
            name: level.name,
            metadata: {
                revision: 1,
                author: "VIM Master Team",
                created: "2026-07-09",
                difficulty: "beginner",
                tags: ["practice", key],
                estimatedTime: 60,
                prerequisites: []
            },
            instructions: level.instructions,
            initialContent: level.initialContent,
        };

        if (level.target) data.target = level.target;
        if (level.targetContent) data.targetContent = level.targetContent;
        if (level.targetText) data.targetText = level.targetText;
        if (level.exCommands) data.exCommands = level.exCommands;
        if (level.solution) data.solution = level.solution;
        if (level.setup) {
            let fakeState = { cursor: { row: 0, col: 0 }, mode: 'NORMAL' };
            level.setup(fakeState);
            data.initialCursor = fakeState.cursor;
        }

        fs.writeFileSync(path.join(CONTENT_DIR, `${slug}.json`), JSON.stringify(data, null, 2), 'utf8');
        console.log(`Migrated: ${slug}`);
    }

    console.log('\nMigration complete.');
}

migrate();
