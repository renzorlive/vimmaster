// VIM Master Game - Cheat Mode (Updated - Fixed - Final)

import { getPracticedCommands } from './game-state.js';

// Command Catalog
const commandCatalog = [
    {
        category: 'Movement',
        items: [
            { key: 'h / j / k / l', id: 'hjkL', desc: 'Move left/down/up/right', example: 'Navigate the cursor around the text.' },
            { key: 'w / b / e', id: 'wbe', desc: 'Word motions: next/back/end', example: 'Jump between words quickly.' },
            { key: 'gg / G', id: 'ggG', desc: 'Go to first/last line', example: 'Jump to file bounds.' },
            { key: '0 / $', id: '0$', desc: 'Line start / end', example: 'Move to start or end of line.' },
        ]
    },
    {
        category: 'Editing',
        items: [
            { key: 'i / a', id: 'ia', desc: 'Insert/Append text', example: 'Enter insert mode to type.' },
            { key: 'x', id: 'x', desc: 'Delete character', example: 'Remove a single character.' },
            { key: 'dd', id: 'dd', desc: 'Delete line', example: 'Remove an entire line.' },
            { key: 'dw', id: 'dw', desc: 'Delete word', example: 'Remove word from cursor.' },
            { key: 'yy / p', id: 'yyp', desc: 'Yank and paste line', example: 'Copy and paste a line.' },
            { key: 'cw', id: 'cw', desc: 'Change word', example: 'Delete word and enter insert.' },
            { key: 'D', id: 'D', desc: 'Delete to end of line', example: 'Trim line from cursor to end.' },
            { key: 'r', id: 'r', desc: 'Replace one character', example: 'Replace character under cursor.' },
        ]
    },
    {
        category: 'Search',
        items: [
            { key: '/text', id: 'search-forward', desc: 'Search forward for text', example: 'Use / then Enter to jump.' },
            { key: '?text', id: 'search-backward', desc: 'Search backward for text', example: 'Use ? then Enter to jump.' },
            { key: 'n / N', id: 'nN', desc: 'Next / Previous match', example: 'Navigate search results.' },
        ]
    },
    {
        category: 'Other',
        items: [
            { key: 'u / Ctrl+r', id: 'undo-redo', desc: 'Undo / Redo changes', example: 'Revert or re-apply edits.' },
            { key: ':q / :wq', id: 'ex', desc: 'Quit / Write & Quit', example: 'Use ex-commands.' },
        ]
    }
];

// Cheat Panel Functions
export function renderCheatList(cheatContent, filter = '') {
    if (!cheatContent) return;
    
    const q = filter.trim().toLowerCase();
    cheatContent.innerHTML = '';
    commandCatalog.forEach(group => {
        const matchedItems = group.items.filter(it => {
            if (!q) return true;
            return it.key.toLowerCase().includes(q) || it.desc.toLowerCase().includes(q);
        });
        if (matchedItems.length === 0) return;
        const section = document.createElement('div');
        section.innerHTML = `<div class="text-blue-300 font-bold mb-2">${group.category}</div>`;
        const list = document.createElement('div');
        list.className = 'grid grid-cols-1 gap-2';
        matchedItems.forEach(it => {
            const tried = getPracticedCommands().has(it.id);
            const card = document.createElement('button');
            card.className = `text-left bg-gray-900 border ${tried ? 'border-green-600' : 'border-gray-700'} hover:border-yellow-500 rounded-md p-3 flex items-center justify-between`;
            card.innerHTML = `
                <div>
                    <div class="text-yellow-300 font-mono">${it.key}</div>
                    <div class="text-gray-300 text-sm">${it.desc}</div>
                    <div class="text-gray-500 text-xs">${it.example}</div>
                </div>
                <div class="text-xs ${tried ? 'text-green-400' : 'text-blue-400'}">${tried ? 'Practiced' : 'Practice'}</div>
            `;
            card.addEventListener('click', () => startCheatPractice(it));
            list.appendChild(card);
        });
        section.appendChild(list);
        cheatContent.appendChild(section);
    });
}

export function openCheat(cheatOverlay, cheatPanel, cheatSearch, cheatContent) {
    if (!cheatOverlay || !cheatPanel || !cheatSearch || !cheatContent) return;
    
    cheatOverlay.classList.remove('hidden');
    cheatPanel.classList.remove('translate-x-full');
    cheatSearch.value = '';
    renderCheatList(cheatContent, '');
    cheatSearch.focus();
}

export function closeCheat(cheatOverlay, cheatPanel, editorInput) {
    if (!cheatOverlay || !cheatPanel) return;
    
    cheatOverlay.classList.add('hidden');
    cheatPanel.classList.add('translate-x-full');
    if (editorInput) editorInput.focus();
}

// Practice Mode Functions
function startCheatPractice(item) {
    // This would integrate with the main game to start practice mode
    // For now, just show a message
    console.log(`Practice mode for: ${item.key}`);
    // Practice mode functionality would go here
}

// Export command catalog for other modules
export { commandCatalog };
