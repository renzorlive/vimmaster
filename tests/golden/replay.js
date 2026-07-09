import { handleSearchMode, handleNormalMode, handleInsertMode } from '../../js/vim-commands.js';
import { getSearchMode, getMode } from '../../js/game-state.js';

/**
 * Replays a sequence of keystrokes through the game engine.
 * 
 * @param {Array<string>} solution - The array of keys (e.g. ['i', 'H', 'Escape'])
 * @returns {void}
 */
export function replay(solution) {
    for (let i = 0; i < solution.length; i++) {
        const key = solution[i];
        
        // Mock a KeyboardEvent
        const e = {
            key,
            preventDefault: () => {},
            ctrlKey: false,
            altKey: false,
            shiftKey: false
        };

        // Parse modifiers (very basic parsing for 'Ctrl+r' etc. if needed)
        if (key.toLowerCase().startsWith('ctrl+')) {
            e.ctrlKey = true;
            e.key = key.split('+')[1];
        } else if (key === 'Enter') {
            e.key = 'Enter';
        } else if (key === 'Escape' || key === '<Esc>') {
            e.key = 'Escape';
        }

        // Route exactly as main.js does
        if (getMode() === 'NORMAL' && e.key === 'r' && e.ctrlKey) {
            handleNormalMode(e);
            continue;
        }

        if (getSearchMode()) {
            handleSearchMode(e);
            continue;
        }

        if (getMode() === 'NORMAL') {
            handleNormalMode(e);
        } else {
            handleInsertMode(e);
        }
    }
}
