/**
 * VIM Master - Win Condition Evaluator
 * 
 * A pure function that determines if the game state satisfies the lesson's target.
 * Designed to be shared between the game engine and the Golden Test Suite.
 * 
 * @param {Object} state - The current game state snapshot
 * @param {Object} lesson - The current lesson specification
 * @returns {Object} { won: boolean, reason: string }
 */
export function evaluateWinCondition(state, lesson) {
    if (!lesson) {
        return { won: false, reason: 'No lesson active' };
    }

    if (lesson.exCommands) {
        if (state.lastExCommand && lesson.exCommands.includes(state.lastExCommand)) {
            return { won: true, reason: 'Ex command matched' };
        }
    } else if (lesson.target) {
        // For search-focused levels, require actual search usage
        const searchLevelNames = ['Search Forward (/)', 'Search Backward (?)', 'Search Navigation (n/N)'];
        const isSearchLevel = searchLevelNames.includes(lesson.name);
        
        if (state.cursor.row === lesson.target.row && state.cursor.col === lesson.target.col) {
            if (!isSearchLevel) {
                return { won: true, reason: 'Cursor reached target' };
            } else {
                if (lesson.name === 'Search Navigation (n/N)') {
                    // Require at least two 'n' presses after search to reach 3rd occurrence
                    if (state.usedSearchInLevel && state.navCountSinceSearch >= 2 && state.lastSearchQuery && state.lastSearchQuery.toLowerCase() === 'foo' && state.lastSearchDirection === 'forward') {
                        return { won: true, reason: 'Target reached using search navigation correctly' };
                    }
                } else if (lesson.name === 'Search Forward (/)') {
                    // Now require one 'n' after search to reach second occurrence
                    if (state.usedSearchInLevel && state.lastSearchDirection === 'forward' && state.lastSearchQuery && state.lastSearchQuery.toLowerCase() === 'target' && state.navCountSinceSearch >= 1) {
                        return { won: true, reason: 'Target reached using forward search correctly' };
                    }
                } else if (lesson.name === 'Search Backward (?)') {
                    // Require one 'N' after search to reach previous occurrence
                    if (state.usedSearchInLevel && state.lastSearchDirection === 'backward' && state.lastSearchQuery && state.lastSearchQuery.toLowerCase() === 'alpha' && state.navCountSinceSearch >= 1) {
                        return { won: true, reason: 'Target reached using backward search correctly' };
                    }
                }
            }
        }
    } else if (lesson.targetText) {
        if (state.content[lesson.targetText.line] === lesson.targetText.text && state.mode === 'NORMAL') {
            return { won: true, reason: 'Target text reached in NORMAL mode' };
        }
    } else if (lesson.targetContent) {
        // Compare lines after trimming trailing whitespace and ignoring trailing blank lines
        const trimLineEnd = (line) => line.replace(/\s+$/, '');
        const stripTrailingBlankLines = (lines) => {
            const result = [...lines];
            while (result.length > 0 && trimLineEnd(result[result.length - 1]) === '') {
                result.pop();
            }
            return result;
        };
        const currentLines = stripTrailingBlankLines(state.content.map(trimLineEnd));
        const targetLines = stripTrailingBlankLines(lesson.targetContent.map(trimLineEnd));
        
        if (currentLines.length === targetLines.length && currentLines.every((l, i) => l === targetLines[i])) {
            if (lesson.name === 'Undo / Redo') {
                if (state.level12RedoAfterUndo) {
                    return { won: true, reason: 'Target content matched with redo' };
                }
            } else {
                return { won: true, reason: 'Target content matched exactly' };
            }
        }
    }

    return { won: false, reason: 'Win condition not met' };
}
