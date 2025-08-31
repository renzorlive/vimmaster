// VIM Master Game - Vim Command Handling

import { 
    getContent, getCursor, getMode, getCurrentLevel, getCommandHistory, getCommandLog, getYankedLine,
    getReplacePending, getCountBuffer, getUndoStack, getRedoStack, getLevel12Undo,
    getLevel12RedoAfterUndo, getLastExCommand, getSearchMode, getSearchQuery,
    getLastSearchQuery, getLastSearchDirection, getSearchMatches, getCurrentMatchIndex,
    getUsedSearchInLevel, getNavCountSinceSearch, pushUndo, isEscapeKey,
    setMode, setSearchMode, setCursorRow, setCursorCol, setContent, setYankedLine,
    setCommandHistory, setCommandLog, setReplacePending, setLevel12Undo, setLevel12RedoAfterUndo,
    setUsedSearchInLevel, setNavCountSinceSearch, setCurrentMatchIndex, setSearchMatches,
    setLastSearchQuery, setLastSearchDirection, setSearchQuery, updateContentLine,
    removeContentLine, insertContentLine, addContentLine, appendCommandHistory,
    appendCommandLog, clearCommandHistory, clearCommandLog, popUndo, pushRedo,
    setCountBuffer, setCountBufferAppend, setLastExCommand, addPracticedCommand
} from './game-state.js';

import { levels } from './levels.js';
import { checkChallengeTask } from './challenges.js';
import { updateStatusBar } from './ui-components.js';

// Utility function for repeating actions
const repeat = (count, action) => {
    for (let i = 0; i < count; i++) {
        action();
    }
};

// Check if character is a word character
const isWordChar = (char) => /\w/.test(char);

// Handle Normal Mode Commands
export function handleNormalMode(e) {
    e.preventDefault();
    const key = e.key;
    const ctrlKey = e.ctrlKey;
    const shiftKey = e.shiftKey;
    const altKey = e.altKey;
    
    // Get current state
    let content = getContent();
    let cursor = getCursor();
    let mode = getMode();
    let commandHistory = getCommandHistory();
    let commandLog = getCommandLog();
    let countBuffer = getCountBuffer();
    let replacePending = getReplacePending();
    let searchMode = getSearchMode();
    let searchQuery = getSearchQuery();
    let lastSearchQuery = getLastSearchQuery();
    let lastSearchDirection = getLastSearchDirection();
    let searchMatches = getSearchMatches();
    let currentMatchIndex = getCurrentMatchIndex();
    let usedSearchInLevel = getUsedSearchInLevel();
    let navCountSinceSearch = getNavCountSinceSearch();
    let yankedLine = getYankedLine();
    let undoStack = getUndoStack();
    let redoStack = getRedoStack();
    let level12Undo = getLevel12Undo();
    let level12RedoAfterUndo = getLevel12RedoAfterUndo();
    let currentLevel = getCurrentLevel();
    
    // Count buffer
    if (/^[0-9]$/.test(key)) {
        if (!(key === '0' && countBuffer === '')) {
            setCountBufferAppend(key);
            appendCommandLog(key);
            return;
        }
    }
    
    // Enter search mode
    if (key === '/' || key === '?') {
        setSearchMode(true);
        setSearchQuery('');
        setLastSearchDirection(key === '?' ? 'backward' : 'forward');
        setMode('NORMAL');
        addPracticedCommand(key === '?' ? 'search_backward' : 'search_forward');
        return;
    }

    // n / N navigation for last search
    if ((key === 'n' || key === 'N') && lastSearchQuery) {
        const forward = (key === 'n') ? (lastSearchDirection === 'forward') : (lastSearchDirection === 'backward');
        if (searchMatches.length === 0) {
            return;
        }
        if (currentMatchIndex === -1) setCurrentMatchIndex(0);
        if (forward) {
            setCurrentMatchIndex((currentMatchIndex + 1) % searchMatches.length);
        } else {
            setCurrentMatchIndex((currentMatchIndex - 1 + searchMatches.length) % searchMatches.length);
        }
        const m = searchMatches[getCurrentMatchIndex()];
        setCursorRow(m.row);
        setCursorCol(Math.max(0, m.start));
        setNavCountSinceSearch(navCountSinceSearch + 1);
        addPracticedCommand(key === 'n' ? 'search_next' : 'search_previous');
        return;
    }

    // Redo (Ctrl+r) should be handled before any other 'r' logic
    if (key === 'r' && ctrlKey) {
        const next = redoStack.pop();
        if (next) {
            pushRedo({ content: [...content], cursor: { ...cursor }, mode, yankedLine });
            setContent(next.content);
            setCursorRow(next.cursor.row);
            setCursorCol(next.cursor.col);
            setMode(next.mode);
            setYankedLine(next.yankedLine);
        }
        if (levels[getCurrentLevel()]?.name === 'Undo / Redo' && level12Undo) {
            setLevel12RedoAfterUndo(true);
        }
        return;
    }

    // Handle Ex commands on Enter: parse from last ':'
    if (key === 'Enter') {
        const idx = commandHistory.lastIndexOf(':');
        if (idx !== -1) {
            const cmd = commandHistory.slice(idx + 1).trim();
            setLastExCommand(cmd);
        }
        clearCommandHistory();
        clearCommandLog();
        return;
    }

    // Start single-char replace immediately so it doesn't get logged in command history
    if (key === 'r' && !replacePending) {
        setReplacePending(true);
        clearCommandLog();
        return;
    }

    // Handle pending single-char replace (r)
    if (replacePending) {
        // Ignore modifier keys while waiting for the actual replacement character
        if (key === 'Shift' || key === 'Control' || key === 'Alt' || key === 'Meta') {
            return;
        }
        // Allow cancel with Escape
        if (isEscapeKey(e)) {
            setReplacePending(false);
            return;
        }
        if (key.length === 1) {
            let line = content[cursor.row];
            if (cursor.col < line.length) {
                updateContentLine(cursor.row, line.slice(0, cursor.col) + key + line.slice(cursor.col + 1));
            } else {
                // If at end, append
                updateContentLine(cursor.row, line + key);
            }
            setReplacePending(false);
            return;
        }
        // For other non-printable keys, do nothing but keep waiting
        return;
    }


    
    // Append to command history FIRST for compound command detection
    if (key.length === 1 && key !== 'Shift' && key !== 'Control' && key !== 'Alt') {
        appendCommandHistory(key);
        appendCommandLog(key);
    }

    // Get FRESH command history after updating it
    const freshCommandHistory = getCommandHistory();

    // Check compound commands FIRST (after command history is updated)
    if (freshCommandHistory.endsWith('dd')) {
        pushUndo();
        const count = countBuffer ? Math.max(1, parseInt(countBuffer, 10)) : 1;
        for (let i = 0; i < count; i++) {
            const removedLine = removeContentLine(cursor.row);
            setYankedLine(removedLine);
            if (content.length === 0) addContentLine("");
            if (cursor.row >= content.length) setCursorRow(content.length - 1);
        }
        setCursorCol(0);
        clearCommandHistory();
        clearCommandLog();
        return; // Exit early after processing compound command
    } else if (freshCommandHistory.endsWith('dw')) {
        pushUndo();
        const count = countBuffer ? Math.max(1, parseInt(countBuffer, 10)) : 1;
        for (let i = 0; i < count; i++) {
            let line = content[cursor.row];
            let start = cursor.col;
            let endOfWord = line.substring(start).search(/\s|$/);
            if (endOfWord === -1) { endOfWord = line.length; } else { endOfWord += start; }
            let startOfNextWord = line.substring(endOfWord).search(/\S/);
            if (startOfNextWord === -1) { startOfNextWord = line.length; } else { startOfNextWord += endOfWord; }
            updateContentLine(cursor.row, line.slice(0, start) + line.slice(startOfNextWord));
        }
        clearCommandHistory();
        clearCommandLog();
        return; // Exit early after processing compound command
    }

    // Get FRESH count buffer value right before movement commands
    const countBufferValue = getCountBuffer();
    const count = countBufferValue ? Math.max(1, parseInt(countBufferValue, 10)) : 1;
    
    // Movement
    if (key === 'h') {
        addPracticedCommand('h_left');
        repeat(count, () => { 
            const currentCursor = getCursor();
            if (currentCursor.col > 0) setCursorCol(currentCursor.col - 1); 
        });
    }
    if (key === 'l') {
        addPracticedCommand('l_right');
        repeat(count, () => { 
            const currentCursor = getCursor();
            if (currentCursor.col < content[currentCursor.row].length - 1) setCursorCol(currentCursor.col + 1); 
        });
    }
    if (key === 'k') {
        addPracticedCommand('k_up');
        repeat(count, () => { 
            const currentCursor = getCursor();
            if (currentCursor.row > 0) setCursorRow(currentCursor.row - 1); 
        });
    }
    if (key === 'j') {
        addPracticedCommand('j_down');
        repeat(count, () => { 
            const currentCursor = getCursor();
            if (currentCursor.row < content.length - 1) setCursorRow(currentCursor.row + 1); 
        });
    }
    if (key === '0') { setCursorCol(0); }
    if (key === '$') { const line = content[cursor.row]; setCursorCol(Math.max(0, line.length - 1)); }

    // Word movement
    // Avoid moving on 'w' when it's part of operators like 'dw' or 'cw'
    if (key === 'w' && !(freshCommandHistory.endsWith('dw') || freshCommandHistory.endsWith('cw'))) {
        addPracticedCommand('w_word_forward');
        repeat(count, () => {
            // Get FRESH cursor position for each iteration
            const currentCursor = getCursor();
            const line = content[currentCursor.row];
            const match = line.substring(currentCursor.col).match(/\s\S/);
            if (match) {
                setCursorCol(currentCursor.col + match.index + 1);
            } else if (currentCursor.row < content.length - 1) {
                setCursorRow(currentCursor.row + 1);
                setCursorCol(0);
            }
        });
    }
    if (key === 'b') {
        addPracticedCommand('b_word_backward');
        repeat(count, () => {
            const currentCursor = getCursor();
            const line = content[currentCursor.row];
            const sub = line.substring(0, currentCursor.col).trimEnd();
            const lastSpace = sub.lastIndexOf(' ');
            setCursorCol(lastSpace !== -1 ? lastSpace + 1 : 0);
        });
    }
    if (key === 'e') {
        repeat(count, () => {
            const currentCursor = getCursor();
            const line = content[currentCursor.row];
            let i = currentCursor.col;
            if (i < line.length - 1) { i++; }
            while (i < line.length && !isWordChar(line[i])) { i++; }
            while (i < line.length - 1 && isWordChar(line[i + 1])) { i++; }
            if (isWordChar(line[i])) { setCursorCol(i); }
        });
    }

    // Line jumps
    if (freshCommandHistory.endsWith('gg')) {
        setCursorRow(0);
        setCursorCol(0);
        clearCommandHistory();
        clearCommandLog();
    }
    if (key === 'G') {
        if (countBuffer) {
            const lineNum = Math.max(1, parseInt(countBuffer, 10));
            setCursorRow(Math.min(content.length - 1, lineNum - 1));
            setCursorCol(0);
        } else {
            setCursorRow(content.length - 1);
            setCursorCol(0);
        }
    }

    // Mode change
    if (key === 'i') {
        addPracticedCommand('i_insert_mode');
        setMode('INSERT');
        clearCommandHistory(); // Clear command history for standalone 'i'
        clearCommandLog();
    }
    if (key === 'a') {
        pushUndo();
        const line = content[cursor.row];
        if (cursor.col < line.length) setCursorCol(cursor.col + 1);
        setMode('INSERT');
        clearCommandHistory(); // Clear command history for standalone 'a'
        clearCommandLog();
    }
    if (key === 'o') {
        pushUndo();
        insertContentLine(cursor.row + 1, ""); // Insert new line BELOW current position
        setCursorRow(cursor.row + 1); // Move cursor to the new line
        setCursorCol(0);
        setMode('INSERT');
        clearCommandHistory(); // Clear command history for standalone 'o'
        clearCommandLog();
    }
    if (key === 'O') {
        pushUndo();
        insertContentLine(cursor.row, "");
        setCursorCol(0);
        setMode('INSERT');
        clearCommandHistory(); // Clear command history for standalone 'O'
        clearCommandLog();
    }
    
    // Deletion
    if (key === 'x') {
        pushUndo();
        const count = countBuffer ? Math.max(1, parseInt(countBuffer, 10)) : 1;
        for (let i = 0; i < count; i++) {
            let line = content[cursor.row];
            if (cursor.col < line.length) {
                updateContentLine(cursor.row, line.slice(0, cursor.col) + line.slice(cursor.col + 1));
            }
        }
    }
    if (freshCommandHistory.endsWith('cw')) {
        pushUndo();
        // Change word: delete to end of current word and enter insert mode
        let line = content[cursor.row];
        let start = cursor.col;
        let endRel = line.substring(start).search(/\s|$/);
        let end = endRel === -1 ? line.length : start + endRel;
        updateContentLine(cursor.row, line.slice(0, start) + line.slice(end));
        setMode('INSERT');
        clearCommandHistory();
        clearCommandLog();
    }
    if (key === 'D') {
        // Delete to end of line
        pushUndo();
        let line = content[cursor.row];
        updateContentLine(cursor.row, line.slice(0, cursor.col));
        clearCommandLog();
    }
    
    // Yank & Put
    if (freshCommandHistory.endsWith('yy')) {
        const count = countBuffer ? Math.max(1, parseInt(countBuffer, 10)) : 1;
        const yankedLineContent = content[Math.min(content.length - 1, cursor.row + count - 1)];
        setYankedLine(yankedLineContent);
        clearCommandHistory();
        clearCommandLog();
    }
    if (key === 'p' && yankedLine !== null) {
        pushUndo();
        const count = countBuffer ? Math.max(1, parseInt(countBuffer, 10)) : 1;
        for (let i = 0; i < count; i++) {
            insertContentLine(cursor.row + 1, yankedLine);
        }
    }

    // Clear operator combos when standalone keys are pressed
    if (['i','a','o','O','p','D'].includes(key)) {
        clearCommandLog();
    }

    // Undo / Redo
    if (key === 'u') {
        const prev = popUndo();
        if (prev) {
            pushRedo({ content: [...content], cursor: { ...cursor }, mode, yankedLine });
            setContent(prev.content);
            setCursorRow(prev.cursor.row);
            setCursorCol(prev.cursor.col);
            setMode(prev.mode);
            setYankedLine(prev.yankedLine);
        }
        if (levels[currentLevel]?.name === 'Undo / Redo') {
            setLevel12Undo(true);
            setLevel12RedoAfterUndo(false);
        }
        return;
    }



    // Ensure cursor is within bounds
    if (cursor.row >= content.length) setCursorRow(content.length - 1);
    if (cursor.col > content[cursor.row].length) setCursorCol(content[cursor.row].length);
    if (cursor.col < 0) setCursorCol(0);
    if(mode === 'NORMAL' && cursor.col === content[cursor.row].length && content[cursor.row].length > 0) {
        setCursorCol(cursor.col - 1);
    }
    
    // Reset count buffer AFTER ALL commands have been processed
    if (!/^[0-9]$/.test(key)) setCountBuffer('');
}

// Handle Insert Mode Commands
export function handleInsertMode(e) {
    e.preventDefault();
    const content = getContent();
    const cursor = getCursor();
    let line = content[cursor.row];
    
    if (isEscapeKey(e)) {
        setMode('NORMAL');
        if (cursor.col > 0) setCursorCol(cursor.col - 1);
    } else if (e.key === 'Backspace') {
        if (cursor.col > 0) {
            updateContentLine(cursor.row, line.slice(0, cursor.col - 1) + line.slice(cursor.col));
            setCursorCol(cursor.col - 1);
        }
    } else if (e.key.length === 1) {
        updateContentLine(cursor.row, line.slice(0, cursor.col) + e.key + line.slice(cursor.col));
        setCursorCol(cursor.col + 1);
    }
}

// Handle Search Mode Commands
export function handleSearchMode(e) {
    e.preventDefault();
    const key = e.key;
    
    if (isEscapeKey(e)) {
        setSearchMode(false);
        setSearchQuery('');
        return;
    }
    if (key === 'Backspace') {
        const currentQuery = getSearchQuery();
        setSearchQuery(currentQuery.slice(0, -1));
        // Update status bar to show the updated search query
        updateStatusBar(getMode(), getSearchMode(), getSearchQuery(), getLastSearchDirection(), getSearchMatches(), getCurrentMatchIndex());
        return;
    }
    if (key === 'Enter') {
        const currentQuery = getSearchQuery();
        setLastSearchQuery(currentQuery);
        setUsedSearchInLevel(true);
        setSearchMode(false);
        setCurrentMatchIndex(-1);
        recomputeSearchMatches();
        jumpToFirstMatchFromCursor();
        setNavCountSinceSearch(0);
        return;
    }
    if (key.length === 1) {
        const currentQuery = getSearchQuery();
        setSearchQuery(currentQuery + key);
        // Update status bar to show the updated search query
        updateStatusBar(getMode(), getSearchMode(), getSearchQuery(), getLastSearchDirection(), getSearchMatches(), getCurrentMatchIndex());
    }
}

// Search utility functions
function recomputeSearchMatches() {
    const content = getContent();
    const lastSearchQuery = getLastSearchQuery();
    
    setSearchMatches([]);
    if (!lastSearchQuery || lastSearchQuery.length === 0) return;
    
    const needle = lastSearchQuery.toLowerCase();
    const matches = [];
    
    for (let r = 0; r < content.length; r++) {
        const line = content[r];
        const lineLower = line.toLowerCase();
        let idx = 0;
        while (true) {
            const found = lineLower.indexOf(needle, idx);
            if (found === -1) break;
            matches.push({ row: r, start: found, end: found + needle.length });
            idx = found + (needle.length > 0 ? Math.max(1, needle.length) : 1);
        }
    }
    
    setSearchMatches(matches);
}

function jumpToFirstMatchFromCursor() {
    const searchMatches = getSearchMatches();
    const cursor = getCursor();
    const lastSearchDirection = getLastSearchDirection();
    
    if (searchMatches.length === 0) { 
        setCurrentMatchIndex(-1); 
        return; 
    }
    
    const startRow = cursor.row;
    const startCol = cursor.col;
    let bestIndex = -1;
    
    if (lastSearchDirection === 'forward') {
        // first match at or after cursor position scanning forward through lines
        for (let i = 0; i < searchMatches.length; i++) {
            const m = searchMatches[i];
            if (m.row < startRow) continue;
            if (m.row === startRow && m.start < startCol) continue;
            bestIndex = i; break;
        }
        if (bestIndex === -1) bestIndex = 0; // wrap
    } else {
        // first match at or before cursor scanning backward
        for (let i = searchMatches.length - 1; i >= 0; i--) {
            const m = searchMatches[i];
            if (m.row > startRow) continue;
            if (m.row === startRow && m.start > startCol) continue;
            bestIndex = i; break;
        }
        if (bestIndex === -1) bestIndex = searchMatches.length - 1; // wrap
    }
    
    setCurrentMatchIndex(bestIndex);
    const m = searchMatches[bestIndex];
    setCursorRow(m.row);
    setCursorCol(Math.max(0, m.start));
}
