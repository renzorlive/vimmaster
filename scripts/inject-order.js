import fs from 'fs';
import path from 'path';

const CONTENT_DIR = path.join(process.cwd(), 'content/lessons');

const orderedRegular = [
    "lesson-how-to-exit-ex-commands",
    "lesson-basic-movement",
    "lesson-word-movement",
    "lesson-word-motion-w",
    "lesson-line-jumps",
    "lesson-insert-mode",
    "lesson-delete-basics",
    "lesson-yank-put-copy-paste",
    "lesson-line-bounds-0-and",
    "lesson-first-non-blank",
    "lesson-append-and-open-lines",
    "lesson-change-word-cw",
    "lesson-delete-end-replace",
    "lesson-counts-move-faster",
    "lesson-undo-redo",
    "lesson-search-forward",
    "lesson-search-backward",
    "lesson-search-navigation-n-n",
    "lesson-delete-inner-word-diw",
    "lesson-change-inner-word-ciw"
];

const orderedPractice = [
    "lesson-practice-basic-movement-practice",
    "lesson-practice-word-motion-practice",
    "lesson-practice-line-jump-practice",
    "lesson-practice-line-boundary-practice",
    "lesson-practice-insert-mode-practice",
    "lesson-practice-delete-character-practice",
    "lesson-practice-delete-word-practice",
    "lesson-practice-delete-line-practice",
    "lesson-practice-delete-to-end-practice",
    "lesson-practice-replace-character-practice",
    "lesson-practice-change-word-practice",
    "lesson-practice-yank-and-paste-practice",
    "lesson-practice-undo-redo-practice",
    "lesson-practice-forward-search-practice",
    "lesson-practice-backward-search-practice",
    "lesson-practice-search-navigation-practice",
    "lesson-practice-ex-commands-practice"
];

function processList(list, startIndex) {
    list.forEach((slug, idx) => {
        const filePath = path.join(CONTENT_DIR, `${slug}.json`);
        if (fs.existsSync(filePath)) {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            data.metadata.order = startIndex + idx;
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
            console.log(`Updated ${slug} with order ${startIndex + idx}`);
        } else {
            console.warn(`File not found: ${filePath}`);
        }
    });
}

processList(orderedRegular, 1);
processList(orderedPractice, 101); // offset practice lessons just in case
