// VIM Master Game - Vim Command Handling

import { 
    getContent, getCursor, getMode, getCurrentLevel, getCommandHistory, getCommandLog, getYankedLine,
    getReplacePending, getCountBuffer, getUndoStack, getRedoStack, getLevel12Undo,
    getLevel12RedoAfterUndo, getLastExCommand, getSearchMode, getSearchQuery,
    getLastSearchQuery, getLastSearchDirection, getSearchMatches, getCurrentMatchIndex,
    getUsedSearchInLevel, getNavCountSinceSearch, getMacros, getMacrosCreated, pushUndo, isEscapeKey,
    setMode, setSearchMode, setCursorRow, setCursorCol, setContent, setYankedLine,
    setCommandHistory, setCommandLog, setReplacePending, setLevel12Undo, setLevel12RedoAfterUndo,
    setUsedSearchInLevel, setNavCountSinceSearch, setCurrentMatchIndex, setSearchMatches,
    setLastSearchQuery, setLastSearchDirection, setSearchQuery, updateContentLine,
    removeContentLine, insertContentLine, addContentLine, appendCommandHistory,
    appendCommandLog, clearCommandHistory, clearCommandLog, popUndo, pushRedo,
    setCountBuffer, setCountBufferAppend, setLastExCommand, setExCommandBuffer, addPracticedCommand,
    // Visual Mode
    getVisualMode, getVisualStart, getVisualSelection, getVisualEnd,
    setVisualMode, setVisualStart, setVisualSelection, setVisualEnd, clearVisualSelection,
    // Text Objects
    addTextObjectUsed, setLastTextObjectCommand,
    // Macro
    getMacroState, recordKeystroke, setMacroRecording, stopMacroRecording, getCommandMode, setCommandMode, getMarksSet, getJumpsPerformed,
    // Marks
    getMarks, setMark, setLastJumpPosition,
    // Advanced Search
    addRegexPatternUsed, setLastSubstitution,
    // Level validation tracking
    setUsedVisualMode, setUsedVisualLineMode, setUsedVisualBlockMode, setUsedTextObject,
    setMacrosCreated, setMacroPlayed, setMarksSet, setJumpsPerformed, setAdvancedMotionsUsed
} from './game-state.js';

import { levels } from './levels.js';
import { updateStatusBar } from './ui-components.js';
import { checkChallengeTask } from './challenges.js';

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
    
    // Record keystroke for macro if recording
    const macroState = getMacroState();
    if (macroState.recording) {
        recordKeystroke({ key, ctrlKey, shiftKey, mode: 'NORMAL' });
    }
    
    // Count buffer
    if (/^[0-9]$/.test(key)) {
        if (!(key === '0' && countBuffer === '')) {
            setCountBufferAppend(key);
            appendCommandLog(key);
            return;
        }
    }
    
    // Enter search mode (but not if we're in the middle of typing an Ex command)
    if ((key === '/' || key === '?') && !commandHistory.includes(':')) {
        console.log('Entering search mode for key:', key);
        setSearchMode(true);
        setSearchQuery('');
        setLastSearchDirection(key === '?' ? 'backward' : 'forward');
        setMode('NORMAL');
        addPracticedCommand(key === '?' ? 'search_backward' : 'search_forward');
        return;
    } else if ((key === '/' || key === '?') && commandHistory.includes(':')) {
        // Don't return here - let the key be added to command history for substitution commands
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
            
            // Handle basic Ex commands
            if (cmd === 'q') {
                // Quit command - for level 0, this should complete the level
                if (currentLevel === 0) {
                    addPracticedCommand('q_quit');
                    // The level completion will be handled by the level validation
                }
            } else if (cmd === 'wq') {
                // Write and quit command
                addPracticedCommand('wq_write_quit');
            } else if (cmd === 'w') {
                // Write command
                addPracticedCommand('w_write');
            } else if (cmd.startsWith('s/')) {
                // Handle substitution commands
                const result = handleExSubstitution(cmd);
                if (!result) {
                    console.log('Substitution failed. Check the command format.');
                }
            } else if (cmd === 's') {
                console.log('Incomplete substitution command. Please type the full command like: s/old/new/g');
                // Don't process incomplete commands
            }
        }
        clearCommandHistory();
        clearCommandLog();
        setCommandMode(false); // Clear command mode when command is completed
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


    
    // Handle macro commands BEFORE updating command history
    if (key.length === 1 && key !== 'Shift' && key !== 'Control' && key !== 'Alt') {
        const macroHandled = handleMacroRecording(e);
        if (macroHandled) {
            return; // Macro logic handled the key, don't process further
        }
        
        appendCommandHistory(key);
        appendCommandLog(key);
    }

    // Get FRESH command history after updating it
    const freshCommandHistory = getCommandHistory();
    
    // Check if we're in the middle of typing a substitution command
    // If so, skip all special key processing and just let the key be added to history
    if (freshCommandHistory.includes(':') && freshCommandHistory.startsWith(':s/')) {
        console.log('In substitution command mode, skipping special key processing for:', key);
        return; // Skip all special key processing, let the key be added to command history
    }
    
    // Update command mode state for status bar display
    if (freshCommandHistory.includes(':')) {
        setCommandMode(true);
    } else {
        setCommandMode(false);
    }
    
    // Handle 'o' key after command history is updated
    if (key === 'o') {
        pushUndo();
        insertContentLine(cursor.row + 1, ""); // Insert new line BELOW current position
        setCursorRow(cursor.row + 1); // Move cursor to the new line
        setCursorCol(0);
        setMode('INSERT');
        clearCommandHistory(); // Clear command history for standalone 'o'
        clearCommandLog();
        addPracticedCommand('o_open_line_below');
        return;
    }
    
    // Handle movement keys after command history is updated
    if (key === 'h') {
        addPracticedCommand('h_left');
        repeat(count, () => { 
            const currentCursor = getCursor();
            if (currentCursor.col > 0) setCursorCol(currentCursor.col - 1); 
        });
        clearCommandHistory();
        clearCommandLog();
        return;
    }
    
    if (key === 'j') {
        addPracticedCommand('j_down');
        repeat(count, () => { 
            const currentCursor = getCursor();
            if (currentCursor.row < content.length - 1) setCursorRow(currentCursor.row + 1); 
        });
        clearCommandHistory();
        clearCommandLog();
        return;
    }
    
    if (key === 'k') {
        addPracticedCommand('k_up');
        repeat(count, () => { 
            const currentCursor = getCursor();
            if (currentCursor.row > 0) setCursorRow(currentCursor.row - 1); 
        });
        clearCommandHistory();
        clearCommandLog();
        return;
    }
    
    if (key === 'l') {
        addPracticedCommand('l_right');
        repeat(count, () => { 
            const currentCursor = getCursor();
            if (currentCursor.col < content[currentCursor.row].length - 1) setCursorCol(currentCursor.col + 1); 
        });
        clearCommandHistory();
        clearCommandLog();
        return;
    }

    // Check for text object commands FIRST (before other compound commands)
    // But not if we're in the middle of typing an Ex command
    if (!freshCommandHistory.includes(':')) {
        const textObjectPattern = /^(d|c|y)(i|a)(w|W|s|p|\(|\)|\[|\]|\{|\}|"|'|t|b)$/;
        const match = freshCommandHistory.match(textObjectPattern);
        if (match) {
        const [, operator, innerOrAround, textObj] = match;
        const isInner = innerOrAround === 'i';
        
        // Map text object characters to names
        const textObjMap = {
            'w': 'word',
            'W': 'word',
            's': 'sentence',
            'p': 'paragraph',
            '(': 'parentheses',
            ')': 'parentheses',
            '[': 'brackets',
            ']': 'brackets',
            '{': 'braces',
            '}': 'braces',
            '"': 'quotes',
            "'": 'singleQuotes',
            't': 'parentheses', // HTML tags (simplified)
            'b': 'parentheses'  // Block (same as parentheses for now)
        };
        
        const textObjName = textObjMap[textObj];
        console.log('Text object mapping:', textObj, '->', textObjName);
        if (textObjName && handleTextObjectCommand(operator, textObjName, isInner, cursor, content)) {
            console.log('Text object command executed successfully');
            clearCommandHistory();
            clearCommandLog();
            return;
        } else {
            console.log('Text object command failed to execute');
        }
        }
    }

    // Check compound commands (after text object commands)
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

    // Handle marks and advanced motions
    handleMarks(e);
    handleAdvancedMotions(e);

    // Get FRESH count buffer value right before movement commands
    const countBufferValue = getCountBuffer();
    const count = countBufferValue ? Math.max(1, parseInt(countBufferValue, 10)) : 1;
    
    // Movement




    if (key === '0') { 
        setCursorCol(0); 
        clearCommandHistory();
        clearCommandLog();
    }
    if (key === '$') { 
        const line = content[cursor.row]; 
        setCursorCol(Math.max(0, line.length - 1)); 
        clearCommandHistory();
        clearCommandLog();
    }

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
        clearCommandHistory();
        clearCommandLog();
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
        clearCommandHistory();
        clearCommandLog();
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
        clearCommandHistory();
        clearCommandLog();
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
        clearCommandHistory();
        clearCommandLog();
    }

    // Visual Mode Entry
    if (key === 'v' && !ctrlKey && mode === 'NORMAL') {
        setMode('VISUAL');
        setVisualMode('VISUAL');
        setVisualStart({ ...cursor });
        setVisualEnd({ ...cursor });
        setVisualSelection([{ ...cursor }]);
        setUsedVisualMode(true);
        addPracticedCommand('v_visual_mode');
        clearCommandHistory();
        clearCommandLog();
        return;
    }
    if (key === 'V' && mode === 'NORMAL') {
        setMode('VISUAL_LINE');
        setVisualMode('VISUAL_LINE');
        setVisualStart({ ...cursor });
        setVisualEnd({ ...cursor });
        setVisualSelection([{ ...cursor }]);
        setUsedVisualLineMode(true);
        addPracticedCommand('V_visual_line_mode');
        clearCommandHistory();
        clearCommandLog();
        return;
    }
    if (key === 'v' && ctrlKey && mode === 'NORMAL') {
        setMode('VISUAL_BLOCK');
        setVisualMode('VISUAL_BLOCK');
        setVisualStart({ ...cursor });
        setVisualEnd({ ...cursor });
        setVisualSelection([{ ...cursor }]);
        setUsedVisualBlockMode(true);
        addPracticedCommand('ctrl_v_visual_block_mode');
        clearCommandHistory();
        clearCommandLog();
        return;
    }

    // Mode change
    if (key === 'i') {
        // Don't enter insert mode if 'i' is part of a text object command
        if (freshCommandHistory.length >= 2 && 
            (freshCommandHistory.endsWith('di') || freshCommandHistory.endsWith('ci') || freshCommandHistory.endsWith('yi'))) {
            // This 'i' is part of a text object command, don't enter insert mode
            return;
        }
        addPracticedCommand('i_insert_mode');
        setMode('INSERT');
        clearCommandHistory(); // Clear command history for standalone 'i'
        clearCommandLog();
    }
    if (key === 'a') {
        // Don't enter insert mode if 'a' is part of a text object command
        if (freshCommandHistory.length >= 2 && 
            (freshCommandHistory.endsWith('da') || freshCommandHistory.endsWith('ca') || freshCommandHistory.endsWith('ya'))) {
            // This 'a' is part of a text object command, don't enter insert mode
            return;
        }
        pushUndo();
        const line = content[cursor.row];
        if (cursor.col < line.length) setCursorCol(cursor.col + 1);
        setMode('INSERT');
        clearCommandHistory(); // Clear command history for standalone 'a'
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

// Visual Mode Handling
export function handleVisualMode(e) {
    e.preventDefault();
    const key = e.key;
    const ctrlKey = e.ctrlKey;
    const shiftKey = e.shiftKey;
    
    const content = getContent();
    const cursor = getCursor();
    const visualMode = getVisualMode();
    const visualStart = getVisualStart();
    
    // Record keystroke for macro if recording
    const macroState = getMacroState();
    if (macroState.recording) {
        recordKeystroke({ key, ctrlKey, shiftKey, mode: 'VISUAL' });
    }
    
    // Escape to exit visual mode
    if (isEscapeKey(e)) {
        clearVisualSelection();
        setMode('NORMAL');
        return;
    }
    
    // Movement in visual mode
    if (key === 'h') {
        if (cursor.col > 0) setCursorCol(cursor.col - 1);
        updateVisualSelection();
    }
    if (key === 'l') {
        if (cursor.col < content[cursor.row].length - 1) setCursorCol(cursor.col + 1);
        updateVisualSelection();
    }
    if (key === 'k') {
        if (cursor.row > 0) setCursorRow(cursor.row - 1);
        updateVisualSelection();
    }
    if (key === 'j') {
        if (cursor.row < content.length - 1) setCursorRow(cursor.row + 1);
        updateVisualSelection();
    }
    if (key === '0') {
        setCursorCol(0);
        updateVisualSelection();
    }
    if (key === '$') {
        const line = content[cursor.row];
        setCursorCol(Math.max(0, line.length - 1));
        updateVisualSelection();
    }
    
    // Word movement in visual mode
    if (key === 'w') {
        const line = content[cursor.row];
        const match = line.substring(cursor.col).match(/\s\S/);
        if (match) {
            setCursorCol(cursor.col + match.index + 1);
        } else if (cursor.row < content.length - 1) {
            setCursorRow(cursor.row + 1);
            setCursorCol(0);
        }
        updateVisualSelection();
    }
    if (key === 'b') {
        const line = content[cursor.row];
        const sub = line.substring(0, cursor.col).trimEnd();
        const lastSpace = sub.lastIndexOf(' ');
        setCursorCol(lastSpace !== -1 ? lastSpace + 1 : 0);
        updateVisualSelection();
    }
    if (key === 'e') {
        const line = content[cursor.row];
        let i = cursor.col;
        if (i < line.length - 1) { i++; }
        while (i < line.length && !isWordChar(line[i])) { i++; }
        while (i < line.length - 1 && isWordChar(line[i + 1])) { i++; }
        if (isWordChar(line[i])) { setCursorCol(i); }
        updateVisualSelection();
    }
    
    // Visual mode operations
    if (key === 'd') {
        performVisualOperation('delete');
        clearVisualSelection();
        setMode('NORMAL');
        return;
    }
    if (key === 'y') {
        performVisualOperation('yank');
        clearVisualSelection();
        setMode('NORMAL');
        return;
    }
    if (key === 'c') {
        performVisualOperation('change');
        setMode('INSERT');
        return;
    }
    
    // Indentation in visual line mode
    if (visualMode === 'VISUAL_LINE') {
        if (key === '>') {
            performVisualOperation('indent_right');
            clearVisualSelection();
            setMode('NORMAL');
            return;
        }
        if (key === '<') {
            performVisualOperation('indent_left');
            clearVisualSelection();
            setMode('NORMAL');
            return;
        }
    }
}

// Update visual selection based on current cursor position
function updateVisualSelection() {
    const visualMode = getVisualMode();
    const visualStart = getVisualStart();
    const cursor = getCursor();
    const content = getContent();
    
    if (!visualStart) return;
    
    setVisualEnd({ ...cursor });
    
    const selection = [];
    
    if (visualMode === 'VISUAL') {
        // Character-wise selection
        const startRow = Math.min(visualStart.row, cursor.row);
        const endRow = Math.max(visualStart.row, cursor.row);
        
        for (let row = startRow; row <= endRow; row++) {
            const line = content[row];
            const startCol = (row === visualStart.row) ? visualStart.col : 0;
            const endCol = (row === cursor.row) ? cursor.col : line.length - 1;
            
            for (let col = startCol; col <= endCol; col++) {
                selection.push({ row, col });
            }
        }
    } else if (visualMode === 'VISUAL_LINE') {
        // Line-wise selection
        const startRow = Math.min(visualStart.row, cursor.row);
        const endRow = Math.max(visualStart.row, cursor.row);
        
        for (let row = startRow; row <= endRow; row++) {
            const line = content[row];
            for (let col = 0; col < line.length; col++) {
                selection.push({ row, col });
            }
        }
    } else if (visualMode === 'VISUAL_BLOCK') {
        // Block selection
        const startRow = Math.min(visualStart.row, cursor.row);
        const endRow = Math.max(visualStart.row, cursor.row);
        const startCol = Math.min(visualStart.col, cursor.col);
        const endCol = Math.max(visualStart.col, cursor.col);
        
        for (let row = startRow; row <= endRow; row++) {
            const line = content[row];
            for (let col = startCol; col <= endCol && col < line.length; col++) {
                selection.push({ row, col });
            }
        }
    }
    
    setVisualSelection(selection);
}

// Perform visual mode operations
function performVisualOperation(operation) {
    const visualSelection = getVisualSelection();
    const content = getContent();
    
    if (visualSelection.length === 0) return;
    
    pushUndo();
    
    if (operation === 'delete') {
        // Delete selected text
        const sortedSelection = visualSelection.sort((a, b) => {
            if (a.row !== b.row) return a.row - b.row;
            return a.col - b.col;
        });
        
        // Group by row and delete from right to left to maintain positions
        const rowsToUpdate = {};
        sortedSelection.forEach(pos => {
            if (!rowsToUpdate[pos.row]) rowsToUpdate[pos.row] = [];
            rowsToUpdate[pos.row].push(pos.col);
        });
        
        Object.keys(rowsToUpdate).forEach(row => {
            const cols = rowsToUpdate[row].sort((a, b) => b - a); // Sort descending
            let line = content[row];
            cols.forEach(col => {
                if (col < line.length) {
                    line = line.slice(0, col) + line.slice(col + 1);
                }
            });
            updateContentLine(parseInt(row), line);
        });
        
    } else if (operation === 'yank') {
        // Yank selected text
        const text = getSelectedText();
        setYankedLine(text);
        
    } else if (operation === 'change') {
        // Change selected text (delete and enter insert mode)
        performVisualOperation('delete');
    }
}

// Get selected text as string
function getSelectedText() {
    const visualSelection = getVisualSelection();
    const content = getContent();
    const visualMode = getVisualMode();
    
    if (visualMode === 'VISUAL_LINE') {
        // For line mode, return full lines
        const rows = [...new Set(visualSelection.map(pos => pos.row))].sort();
        return rows.map(row => content[row]).join('\n');
    } else {
        // For character and block mode, return selected characters
        const sortedSelection = visualSelection.sort((a, b) => {
            if (a.row !== b.row) return a.row - b.row;
            return a.col - b.col;
        });
        
        let text = '';
        let currentRow = -1;
        
        sortedSelection.forEach(pos => {
            if (pos.row !== currentRow) {
                if (currentRow !== -1) text += '\n';
                currentRow = pos.row;
            }
            text += content[pos.row][pos.col] || '';
        });
        
        return text;
    }
}

// Text Objects Implementation
const textObjects = {
    word: {
        inner: (cursor, content) => findWordBoundaries(cursor, content, false),
        around: (cursor, content) => findWordBoundaries(cursor, content, true)
    },
    parentheses: {
        inner: (cursor, content) => findPairedDelimiters(cursor, content, '()', false),
        around: (cursor, content) => findPairedDelimiters(cursor, content, '()', true)
    },
    brackets: {
        inner: (cursor, content) => findPairedDelimiters(cursor, content, '[]', false),
        around: (cursor, content) => findPairedDelimiters(cursor, content, '[]', true)
    },
    braces: {
        inner: (cursor, content) => findPairedDelimiters(cursor, content, '{}', false),
        around: (cursor, content) => findPairedDelimiters(cursor, content, '{}', true)
    },
    quotes: {
        inner: (cursor, content) => findQuotedText(cursor, content, '"', false),
        around: (cursor, content) => findQuotedText(cursor, content, '"', true)
    },
    singleQuotes: {
        inner: (cursor, content) => findQuotedText(cursor, content, "'", false),
        around: (cursor, content) => findQuotedText(cursor, content, "'", true)
    },
    paragraph: {
        inner: (cursor, content) => findParagraph(cursor, content, false),
        around: (cursor, content) => findParagraph(cursor, content, true)
    },
    sentence: {
        inner: (cursor, content) => findSentence(cursor, content, false),
        around: (cursor, content) => findSentence(cursor, content, true)
    }
};

// Find word boundaries
function findWordBoundaries(cursor, content, includeSpaces) {
    const line = content[cursor.row];
    console.log('findWordBoundaries called:', { cursor, line, includeSpaces });
    if (!line) return null;
    
    let start = cursor.col;
    let end = cursor.col;
    
    // Find start of word
    while (start > 0 && isWordChar(line[start - 1])) {
        start--;
    }
    
    // Find end of word
    while (end < line.length && isWordChar(line[end])) {
        end++;
    }
    
    if (includeSpaces) {
        // Include trailing spaces
        while (end < line.length && line[end] === ' ') {
            end++;
        }
    }
    
    const result = { start: { row: cursor.row, col: start }, end: { row: cursor.row, col: end } };
    console.log('findWordBoundaries result:', result, 'start:', start, 'end:', end, 'cursor.col:', cursor.col);
    return result;
}

// Find paired delimiters
function findPairedDelimiters(cursor, content, delimiters, includeDelimiters) {
    const [open, close] = delimiters.split('');
    const line = content[cursor.row];
    console.log('findPairedDelimiters called:', { delimiters, open, close, line, cursor, includeDelimiters });
    if (!line) return null;
    
    let start = cursor.col;
    let end = cursor.col;
    let depth = 0;
    let found = false;
    
    // Search backwards for opening delimiter
    for (let i = cursor.col; i >= 0; i--) {
        if (line[i] === close) {
            depth++;
        } else if (line[i] === open) {
            if (depth === 0) {
                start = i;
                found = true;
                break;
            } else {
                depth--;
            }
        }
    }
    
    // If not found backwards, search forwards for opening delimiter
    if (!found) {
        depth = 0;
        for (let i = cursor.col; i < line.length; i++) {
            if (line[i] === open) {
                if (depth === 0) {
                    start = i;
                    found = true;
                    break;
                } else {
                    depth--;
                }
            } else if (line[i] === close) {
                depth++;
            }
        }
    }
    
    if (!found) return null;
    
    // Search forwards for closing delimiter
    depth = 0;
    for (let i = start + 1; i < line.length; i++) {
        if (line[i] === open) {
            depth++;
        } else if (line[i] === close) {
            if (depth === 0) {
                end = i;
                break;
            } else {
                depth--;
            }
        }
    }
    
    const result = includeDelimiters 
        ? { start: { row: cursor.row, col: start }, end: { row: cursor.row, col: end + 1 } }
        : { start: { row: cursor.row, col: start + 1 }, end: { row: cursor.row, col: end } };
    console.log('findPairedDelimiters result:', result);
    return result;
}

// Find quoted text
function findQuotedText(cursor, content, quote, includeQuotes) {
    console.log('findQuotedText called:', { quote, cursor, includeQuotes, content });
    
    let startRow = cursor.row;
    let startCol = cursor.col;
    let endRow = cursor.row;
    let endCol = cursor.col;
    let found = false;
    
    // Search backwards for opening quote (including previous lines)
    for (let row = cursor.row; row >= 0; row--) {
        const line = content[row];
        if (!line) continue;
        
        const startSearchCol = (row === cursor.row) ? cursor.col : line.length - 1;
        
        for (let col = startSearchCol; col >= 0; col--) {
            if (line[col] === quote && (col === 0 || line[col - 1] !== '\\')) {
                startRow = row;
                startCol = col;
                found = true;
                break;
            }
        }
        if (found) break;
    }
    
    // If not found backwards, search forwards for opening quote (including next lines)
    if (!found) {
        for (let row = cursor.row; row < content.length; row++) {
            const line = content[row];
            if (!line) continue;
            
            const startSearchCol = (row === cursor.row) ? cursor.col : 0;
            
            for (let col = startSearchCol; col < line.length; col++) {
                if (line[col] === quote && (col === 0 || line[col - 1] !== '\\')) {
                    startRow = row;
                    startCol = col;
                    found = true;
                    break;
                }
            }
            if (found) break;
        }
    }
    
    if (!found) return null;
    
    // Search forwards for closing quote (including next lines)
    for (let row = startRow; row < content.length; row++) {
        const line = content[row];
        if (!line) continue;
        
        const startSearchCol = (row === startRow) ? startCol + 1 : 0;
        
        for (let col = startSearchCol; col < line.length; col++) {
            if (line[col] === quote && line[col - 1] !== '\\') {
                endRow = row;
                endCol = col;
                break;
            }
        }
        if (endRow !== startRow || endCol !== startCol) break;
    }
    
    const result = includeQuotes 
        ? { start: { row: startRow, col: startCol }, end: { row: endRow, col: endCol + 1 } }
        : { start: { row: startRow, col: startCol + 1 }, end: { row: endRow, col: endCol } };
    console.log('findQuotedText result:', result);
    return result;
}

// Find paragraph boundaries
function findParagraph(cursor, content, includeEmptyLines) {
    let start = cursor.row;
    let end = cursor.row;
    
    // Find start of paragraph (empty line or start of content)
    while (start > 0) {
        if (content[start - 1].trim() === '') {
            if (includeEmptyLines) start--;
            break;
        }
        start--;
    }
    
    // Find end of paragraph (empty line or end of content)
    while (end < content.length - 1) {
        if (content[end + 1].trim() === '') {
            if (includeEmptyLines) end++;
            break;
        }
        end++;
    }
    
    return { 
        start: { row: start, col: 0 }, 
        end: { row: end, col: content[end].length - 1 } 
    };
}

// Find sentence boundaries
function findSentence(cursor, content, includePunctuation) {
    const line = content[cursor.row];
    if (!line) return null;
    
    let start = cursor.col;
    let end = cursor.col;
    
    // Find start of sentence
    for (let i = cursor.col; i >= 0; i--) {
        if (i === 0 || /[.!?]\s/.test(line.slice(i - 1, i + 1))) {
            start = i;
            break;
        }
    }
    
    // Find end of sentence
    for (let i = cursor.col; i < line.length; i++) {
        if (/[.!?]/.test(line[i])) {
            end = i;
            if (includePunctuation) end++;
            break;
        }
    }
    
    return { start: { row: cursor.row, col: start }, end: { row: cursor.row, col: end } };
}

// Handle text object commands
function handleTextObjectCommand(operator, textObj, isInner, cursor, content) {
    console.log('handleTextObjectCommand called:', { operator, textObj, isInner, cursor });
    const bounds = textObjects[textObj][isInner ? 'inner' : 'around'](cursor, content);
    console.log('Text object bounds:', bounds);
    if (!bounds) {
        console.log('No bounds found, returning false');
        return false;
    }
    
    pushUndo();
    
    if (operator === 'd') {
        console.log('Deleting text range:', bounds.start, 'to', bounds.end);
        deleteTextRange(bounds.start, bounds.end);
    } else if (operator === 'c') {
        deleteTextRange(bounds.start, bounds.end);
        setMode('INSERT');
    } else if (operator === 'y') {
        yankTextRange(bounds.start, bounds.end);
    }
    
    // Update cursor position
    setCursorRow(bounds.start.row);
    setCursorCol(bounds.start.col);
    
    // Track text object usage
    const command = `${operator}${isInner ? 'i' : 'a'}${textObj}`;
    addTextObjectUsed(textObj);
    setLastTextObjectCommand(command);
    setUsedTextObject(true);
    addPracticedCommand(command);
    
    console.log('Text object command completed successfully');
    return true;
}

// Delete text in a range
function deleteTextRange(start, end) {
    const content = getContent();
    console.log('deleteTextRange called:', { start, end, content });
    
    if (start.row === end.row) {
        // Same line
        const line = content[start.row];
        const newLine = line.slice(0, start.col) + line.slice(end.col);
        console.log('Same line deletion:', { line, newLine, startCol: start.col, endCol: end.col });
        updateContentLine(start.row, newLine);
    } else {
        // Multiple lines
        const firstLine = content[start.row].slice(0, start.col);
        const lastLine = content[end.row].slice(end.col);
        const newLine = firstLine + lastLine;
        
        console.log('Multi-line deletion:', { firstLine, lastLine, newLine, startRow: start.row, endRow: end.row });
        
        // Remove lines between start and end
        for (let i = end.row; i > start.row; i--) {
            removeContentLine(i);
        }
        
        updateContentLine(start.row, newLine);
    }
}

// Yank text in a range
function yankTextRange(start, end) {
    const content = getContent();
    let text = '';
    
    if (start.row === end.row) {
        // Same line
        text = content[start.row].slice(start.col, end.col);
    } else {
        // Multiple lines
        text = content[start.row].slice(start.col);
        for (let i = start.row + 1; i < end.row; i++) {
            text += '\n' + content[i];
        }
        text += '\n' + content[end.row].slice(0, end.col);
    }
    
    setYankedLine(text);
}

// Macro Recording and Playback
export function handleMacroRecording(e) {
    const key = e.key;
    const ctrlKey = e.ctrlKey;
    
    // Record keystroke for macro if recording
    const macroState = getMacroState();
    if (macroState.recording) {
        recordKeystroke({ key, ctrlKey, mode: getMode() });
    }
    
    // Check for macro start command (qa, qb, etc.)
    // Only trigger if command history is exactly 'q' and we're not in an Ex command
    if (key.match(/^[a-z]$/) && getCommandHistory() === 'q') {
        const register = key;
        setMacroRecording(true, register);
        clearCommandHistory();
        clearCommandLog();
        addPracticedCommand(`q${register}_start_macro`);
        
        // Force a UI update to show recording state
        
        return true; // Indicate that the key was handled
    }
    
    // Check for macro stop command (q)
    if (key === 'q' && macroState.recording) {
        stopMacroRecording();
        setMacrosCreated(getMacrosCreated() + 1);
        clearCommandHistory();
        clearCommandLog();
        addPracticedCommand('q_stop_macro');
        
        // Force a UI update to show normal state
        
        return true; // Indicate that the key was handled
    }
    
    // Check for macro playback (@a, @b, etc.)
    if (key.match(/^[a-z]$/) && getCommandHistory().endsWith('@')) {
        const register = key;
        playMacro(register);
        setMacroPlayed(true);
        clearCommandHistory();
        clearCommandLog();
        addPracticedCommand(`@${register}_play_macro`);
        return true; // Indicate that the key was handled
    }
    
    // Check for repeat last macro (@@)
    if (key === '@' && getCommandHistory().endsWith('@')) {
        const lastMacro = getLastPlayedMacro();
        if (lastMacro) {
            playMacro(lastMacro);
        }
        clearCommandHistory();
        clearCommandLog();
        addPracticedCommand('@@_repeat_macro');
        return true; // Indicate that the key was handled
    }
    
    return false; // Key was not handled by macro logic
}

// Play a macro
function playMacro(register) {
    const macros = getMacros();
    const macro = macros[register];
    if (!macro) return;
    
    // Store the last played macro for @@
    setLastPlayedMacro(register);
    
    // Execute each keystroke in the macro
    macro.forEach(keystroke => {
        // Create a synthetic event for each keystroke
        const syntheticEvent = {
            key: keystroke.key,
            ctrlKey: keystroke.ctrlKey || false,
            shiftKey: false,
            altKey: false,
            preventDefault: () => {}
        };
        
        // Execute the keystroke based on the mode it was recorded in
        if (keystroke.mode === 'NORMAL') {
            handleNormalMode(syntheticEvent);
        } else if (keystroke.mode === 'INSERT') {
            handleInsertMode(syntheticEvent);
        } else if (keystroke.mode.startsWith('VISUAL')) {
            handleVisualMode(syntheticEvent);
        }
    });
}

// Store last played macro for @@ command
let _lastPlayedMacro = null;
function setLastPlayedMacro(register) {
    _lastPlayedMacro = register;
}
function getLastPlayedMacro() {
    return _lastPlayedMacro;
}

// Advanced Search and Replace
export function handleAdvancedSubstitution(pattern, replacement, flags) {
    const content = getContent();
    let newContent = [...content];
    
    try {
        const regex = new RegExp(pattern, flags);
        
        newContent = newContent.map(line => {
            if (flags.includes('g')) {
                return line.replace(regex, (match, ...groups) => {
                    return processReplacementString(replacement, [match, ...groups]);
                });
            } else {
                return line.replace(regex, (match, ...groups) => {
                    return processReplacementString(replacement, [match, ...groups]);
                });
            }
        });
        
        setContent(newContent);
        setLastSubstitution({ pattern, replacement, flags });
        addRegexPatternUsed(pattern);
        addPracticedCommand('substitute_regex');
        
        return true;
    } catch (error) {
        console.error('Invalid regex pattern:', error);
        return false;
    }
}

// Process replacement string with capture groups
function processReplacementString(replacement, matches) {
    return replacement.replace(/\\(\d+)/g, (match, groupNumber) => {
        const groupIndex = parseInt(groupNumber);
        return matches[groupIndex] || '';
    });
}

// Handle Ex command substitution
export function handleExSubstitution(command) {
    // Parse :s/pattern/replacement/flags (flags are optional)
    // Use a more robust regex that handles the pattern correctly
    const match = command.match(/^s\/([^\/]+)\/([^\/]*)(?:\/([gci]*))?$/);
    if (!match) {
        console.log('Substitution command did not match expected pattern:', command);
        return false;
    }
    
    const [, pattern, replacement, flags = ''] = match;
    return handleAdvancedSubstitution(pattern, replacement, flags);
}

// Marks and Advanced Navigation
export function handleMarks(e) {
    const key = e.key;
    const ctrlKey = e.ctrlKey;
    
    // Set mark (ma, mb, etc.)
    if (key.match(/^[a-z]$/) && getCommandHistory().endsWith('m')) {
        const mark = key;
        const cursor = getCursor();
        setMark(mark, cursor);
        setLastJumpPosition(cursor);
        setMarksSet(getMarksSet() + 1);
        clearCommandHistory();
        clearCommandLog();
        addPracticedCommand(`m${mark}_set_mark`);
        console.log('Set mark', mark, 'at position:', cursor);
        return;
    }
    
    // Jump to mark ('a, 'b, etc.)
    if (key.match(/^[a-z]$/) && getCommandHistory().endsWith("'")) {
        const mark = key;
        const marks = getMarks();
        console.log('Jump to mark:', mark, 'marks:', marks, 'command history:', getCommandHistory());
        if (marks[mark]) {
            setLastJumpPosition(getCursor());
            setCursorRow(marks[mark].row);
            setCursorCol(marks[mark].col);
            setJumpsPerformed(getJumpsPerformed() + 1);
            clearCommandHistory();
            clearCommandLog();
            addPracticedCommand(`'${mark}_jump_to_mark`);
            console.log('Jumped to mark', mark, 'at position:', marks[mark]);
        } else {
            console.log('Mark', mark, 'not found in marks:', marks);
        }
        return;
    }
    
    // Jump to exact mark position (`a, `b, etc.)
    if (key.match(/^[a-z]$/) && getCommandHistory().endsWith('`')) {
        const mark = key;
        const marks = getMarks();
        if (marks[mark]) {
            setLastJumpPosition(getCursor());
            setCursorRow(marks[mark].row);
            setCursorCol(marks[mark].col);
            clearCommandHistory();
            clearCommandLog();
            addPracticedCommand(`\`${mark}_jump_to_exact_mark`);
        }
        return;
    }
    
    // Jump to last jump position ('')
    if (key === "'" && getCommandHistory().endsWith("'")) {
        const lastJump = getLastJumpPosition();
        if (lastJump) {
            setLastJumpPosition(getCursor());
            setCursorRow(lastJump.row);
            setCursorCol(lastJump.col);
            clearCommandHistory();
            clearCommandLog();
            addPracticedCommand("''_jump_to_last_position");
        }
        return;
    }
    
    // Jump to last exact position (``)
    if (key === '`' && getCommandHistory().endsWith('`')) {
        const lastJump = getLastJumpPosition();
        if (lastJump) {
            setLastJumpPosition(getCursor());
            setCursorRow(lastJump.row);
            setCursorCol(lastJump.col);
            clearCommandHistory();
            clearCommandLog();
            addPracticedCommand('``_jump_to_last_exact_position');
        }
        return;
    }
}

// Advanced Motions
export function handleAdvancedMotions(e) {
    const key = e.key;
    const ctrlKey = e.ctrlKey;
    const content = getContent();
    const cursor = getCursor();
    
    // f/F - find character forward/backward
    if (key === 'f' || key === 'F') {
        // This would need to be handled with a pending state
        // For now, we'll implement basic character finding
        addPracticedCommand(`${key}_find_character`);
        return;
    }
    
    // t/T - find character forward/backward (till)
    if (key === 't' || key === 'T') {
        addPracticedCommand(`${key}_till_character`);
        return;
    }
    
    // ; - repeat last f/F/t/T
    if (key === ';') {
        addPracticedCommand(';_repeat_find');
        return;
    }
    
    // , - repeat last f/F/t/T in opposite direction
    if (key === ',') {
        addPracticedCommand(',_repeat_find_reverse');
        return;
    }
    
    // % - match paired delimiters
    if (key === '%') {
        const line = content[cursor.row];
        const char = line[cursor.col];
        let matchChar = null;
        
        // Find matching delimiter
        switch (char) {
            case '(': matchChar = ')'; break;
            case ')': matchChar = '('; break;
            case '[': matchChar = ']'; break;
            case ']': matchChar = '['; break;
            case '{': matchChar = '}'; break;
            case '}': matchChar = '{'; break;
        }
        
        if (matchChar) {
            const bounds = findPairedDelimiters(cursor, content, char + matchChar, true);
            if (bounds) {
                setCursorRow(bounds.end.row);
                setCursorCol(bounds.end.col - 1);
                setAdvancedMotionsUsed(getAdvancedMotionsUsed() + 1);
                addPracticedCommand('%_match_delimiter');
            }
        }
        return;
    }
}
