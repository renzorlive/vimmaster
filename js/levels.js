// VIM Master Game - Level Definitions and Management

// Import global state variables for backward compatibility
import { 
    getContent, getCursor, getMode, getCurrentLevel, getCommandHistory, getCommandLog,
    getYankedLine, getReplacePending, getCountBuffer, getUndoStack, getRedoStack,
    getLevel12Undo, getLevel12RedoAfterUndo, getLastExCommand, getSearchMode,
    getSearchQuery, getLastSearchQuery, getLastSearchDirection, getSearchMatches,
    getCurrentMatchIndex, getUsedSearchInLevel, getNavCountSinceSearch, getBadges,
    getPracticedCommands, getChallengeMode, getCurrentChallenge, getChallengeTimerInterval,
    getChallengeStartTime, getChallengeScoreValue, getChallengeProgressValue, getCurrentTaskIndex,
    resetLevelState, resetChallengeState, setContent, setCursor, setMode, setCurrentLevel,
    setCommandHistory, setCommandLog, setYankedLine, setReplacePending, setCountBuffer,
    setSearchMode, setSearchQuery, setLastSearchQuery, setLastSearchDirection, setSearchMatches,
    setCurrentMatchIndex, setUsedSearchInLevel, setNavCountSinceSearch, setLevel12Undo,
    setLevel12RedoAfterUndo, setLastExCommand
} from './game-state.js';

// Level Definitions
export const levels = [
    // Level 1: Exiting Vim (fun intro)
    {
        name: "How to Exit (Ex Commands)",
        instructions: "Type :q to quit, or :wq to write and quit. Press Enter after the command.",
        initialContent: [
            "Welcome to VIM Master!",
            "Most searched question: how to exit Vim?",
            "Try typing :q and press Enter (or :wq)."
        ],
        exCommands: ["q", "wq"],
        setup: (gameState) => { gameState.cursor = { row: 0, col: 0 }; }
    },
    // Level 1: Basic Movement
    {
        name: "Basic Movement",
        instructions: "Use h, j, k, l to move the cursor. Reach the target character '$'.",
        initialContent: [
            "Move with h(left), j(down), k(up), l(right).",
            "Your cursor starts here.",
            "",
            "The goal is to navigate to the dollar sign.",
            "Practice moving around the text.",
            "Once you are comfortable, move to the '$'."
        ],
        target: { row: 5, col: 39 },
        setup: (gameState) => { gameState.cursor = { row: 1, col: 5 }; }
    },
    // Level 2: Word Movement
    {
        name: "Word Movement",
        instructions: "Use w (next word), b (back), e (end of word). Get to the end of the 'destination' word.",
        initialContent: [
            "Jumping between words is much faster.",
            "Use 'w' to jump forwards to the start of the next word.",
            "Use 'b' to jump backwards to the start of the previous word.",
            "Use 'e' to jump to the end of the current word.",
            "Find the ultimate destination."
        ],
        target: { row: 4, col: 28 }, // Target is the 'n' in destination
        setup: (gameState) => { gameState.cursor = { row: 0, col: 0 }; }
    },
    // Level 3: Line Jumps
    {
        name: "Line Jumps",
        instructions: "Use gg to go to the first line, and G to go to the last line. Go to the last character of the last line.",
        initialContent: [
            "This is the first line. Use 'gg' to come here.",
            "...",
            "...",
            "...",
            "This is the last line. Use 'G' to jump here.",
            "The target is on the word 'here'."
        ],
        target: { row: 5, col: 30 }, // Target is the '.' at the end of the line
        setup: (gameState) => { gameState.cursor = { row: 2, col: 0 }; gameState.commandHistory = ''; }
    },
    // Level 4: Insert Mode
    {
        name: "Insert Mode",
        instructions: "Press 'a' to append after the cursor. Type ' is awesome!' and press Esc to return to NORMAL mode.",
        initialContent: [
            "VIM has multiple modes. You've been in NORMAL mode.",
            "Press 'a' to append after the cursor and start typing.",
            "When you're done, press 'Escape' to go back.",
            "Your task: complete the sentence below.",
            "Learning VIM"
        ],
        targetText: { line: 4, text: "Learning VIM is awesome!" },
        setup: (gameState) => { gameState.cursor = { row: 4, col: 11 }; }
    },
     // Level 5: Delete Basics
    {
        name: "Delete Basics",
        instructions: "Use dd to delete the full middle line. Then use dw to remove the word 'mistake' on the last line. You can use x to delete a single character if needed.",
        initialContent: [
            "Keep this line.",
            "Delete this entire line.",
            "Fix this mistake here."
        ],
        targetContent: [
            "Keep this line.",
            "Fix this here."
        ],
        setup: (gameState) => { gameState.cursor = { row: 0, col: 0 }; gameState.commandHistory = ''; }
    },
    // Level 6: Yank & Put
    {
        name: "Yank & Put (Copy/Paste)",
        instructions: "Use yy to yank (copy) a line and p to put (paste) it. Duplicate the second line.",
        initialContent: [
            "Let's copy and paste.",
            "Yank this line!",
            "And put it below this line.",
            ""
        ],
        targetContent: [
            "Let's copy and paste.",
            "Yank this line!",
            "And put it below this line.",
            "Yank this line!",
        ],
        setup: (gameState) => { gameState.cursor = { row: 1, col: 0 }; gameState.commandHistory = ''; }
    },
    // Level 7: Line Start/End
    {
        name: "Line Bounds (0 and $)",
        instructions: "Use 0 to jump to start of line and $ to jump to end. Move to the last character of the first line.",
        initialContent: [
            "Jump to the start and end of this line.",
            "Practice makes perfect."
        ],
        // The first line length is 39, last character index is length - 1 = 38
        target: { row: 0, col: 38 },
        setup: (gameState) => { gameState.cursor = { row: 0, col: 0 }; }
    },
    // Level 8: Append and Open Lines
    {
        name: "Append and Open Lines",
        instructions: "Use a to append after cursor. Use o to open a new line below, and O to open above. Add a new line between the two lines that reads 'Inserted here'.",
        initialContent: [
            "First line.",
            "Second line."
        ],
        targetContent: [
            "First line.",
            "Inserted here",
            "Second line."
        ],
        setup: (gameState) => { gameState.cursor = { row: 0, col: 5 }; }
    },
    // Level 9: Change Word (cw)
    {
        name: "Change Word (cw)",
        instructions: "Use cw to change the word 'bad' into 'good'. Press Esc when done.",
        initialContent: [
            "This is a bad example."
        ],
        targetText: { line: 0, text: "This is a good example." },
        setup: (gameState) => { gameState.cursor = { row: 0, col: 10 }; }
    },
    // Level 10: Delete to End (D) and Replace (r)
    {
        name: "Delete End & Replace",
        instructions: "Use D to delete from cursor to end of line, then use r to replace the 'x' with '!'.",
        initialContent: [
            "Keep this → remove from here to end",
            "Replace this x"
        ],
        targetContent: [
            "Keep this → ",
            "Replace this !"
        ],
        setup: (gameState) => { gameState.cursor = { row: 0, col: 12 }; }
    },
    // Level 11: Numeric Counts (3w)
    {
        name: "Counts: Move Faster",
        instructions: "Use a count with motions. Press 3 then w to jump three words and land on 'target'.",
        initialContent: [
            "one two three target here"
        ],
        target: { row: 0, col: 14 },
        setup: (gameState) => { gameState.cursor = { row: 0, col: 0 }; }
    },
    // Level 12: Undo and Redo
    {
        name: "Undo / Redo",
        instructions: "Delete the middle line with dd, undo it with u, then redo with Ctrl+r to finish with the line deleted.",
        initialContent: [
            "Top line.",
            "Remove me.",
            "Bottom line."
        ],
        targetContent: [
            "Top line.",
            "Bottom line."
        ],
        setup: (gameState) => { gameState.cursor = { row: 1, col: 0 }; }
    },
    // Level 13: Forward Search
    {
        name: "Search Forward (/)",
        instructions: "Press / then type 'target' and Enter, then press n once to jump to the next occurrence.",
        initialContent: [
            "find the target here",
            "another target and another target",
            "no match on this line"
        ],
        // second 'target' on line 2 (index 27)
        target: { row: 1, col: 27 },
        setup: (gameState) => { gameState.cursor = { row: 2, col: 0 }; }
    },
    // Level 14: Backward Search
    {
        name: "Search Backward (?)",
        instructions: "Press ? then type 'alpha' and Enter, then press N once to jump to the previous occurrence.",
        initialContent: [
            "alpha beta gamma",
            "delta epsilon alpha",
            "zeta eta theta"
        ],
        // require moving to the earlier 'alpha' on line 1 (row 0, col 0) using N
        target: { row: 0, col: 0 },
        setup: (gameState) => { gameState.cursor = { row: 2, col: 5 }; }
    },
    // Level 15: Search Navigation (n/N)
    {
        name: "Search Navigation (n/N)",
        instructions: "Search for 'foo' with /foo then press n twice to reach the third occurrence.",
        initialContent: [
            "foo bar baz",
            "qux foo quux",
            "corge grault foo"
        ],
        // third 'foo' starts at col 13 in line 2 (0-based)
        target: { row: 2, col: 13 },
        setup: (gameState) => { gameState.cursor = { row: 0, col: 0 }; }
    },
    
    // Chapter 2: Advanced Features
    // Level 17: Visual Mode Fundamentals
    {
        name: "Visual Mode: Character Selection",
        chapter: 2,
        instructions: "Press 'v' to enter visual mode, select the word 'TARGET' using movement keys, then press 'd' to delete it.",
        initialContent: [
            "Visual mode allows precise text selection.",
            "Select the word TARGET in this sentence.",
            "Use visual mode to edit efficiently."
        ],
        targetContent: [
            "Visual mode allows precise text selection.",
            "Select the word in this sentence.",
            "Use visual mode to edit efficiently."
        ],
        setup: (gameState) => { 
            gameState.cursor = { row: 1, col: 15 }; 
        },
        validation: (gameState) => {
            return gameState.content[1].includes("word") && 
                   !gameState.content[1].includes("TARGET") &&
                   gameState.usedVisualMode;
        }
    },
    
    // Level 18: Line-wise Visual Mode
    {
        name: "Visual Mode: Line Selection",
        chapter: 2,
        instructions: "Press 'V' to enter visual line mode, select the middle line, then press 'd' to delete it.",
        initialContent: [
            "Keep this line.",
            "Delete this entire line.",
            "Keep this line too."
        ],
        targetContent: [
            "Keep this line.",
            "Keep this line too."
        ],
        setup: (gameState) => { 
            gameState.cursor = { row: 1, col: 0 }; 
        },
        validation: (gameState) => {
            return gameState.content.length === 2 &&
                   gameState.content[0] === "Keep this line." &&
                   gameState.content[1] === "Keep this line too." &&
                   gameState.usedVisualLineMode;
        }
    },
    
    // Level 19: Block Visual Mode
    {
        name: "Visual Mode: Block Selection",
        chapter: 2,
        instructions: "Press Ctrl+v to enter visual block mode, select the first column of text, then press 'd' to delete it.",
        initialContent: [
            "A line with text",
            "B line with text", 
            "C line with text"
        ],
        targetContent: [
            " line with text",
            " line with text",
            " line with text"
        ],
        setup: (gameState) => { 
            gameState.cursor = { row: 0, col: 0 }; 
        },
        validation: (gameState) => {
            return gameState.content.every(line => line.startsWith(" line with text")) &&
                   gameState.usedVisualBlockMode;
        }
    },
    
    // Level 20: Text Objects Introduction
    {
        name: "Text Objects: Word Boundaries",
        chapter: 2,
        instructions: "Use 'diw' to delete the inner word 'bad' and replace it with 'good'.",
        initialContent: [
            "This is a bad example."
        ],
        targetContent: [
            "This is a good example."
        ],
        setup: (gameState) => { 
            gameState.cursor = { row: 0, col: 10 }; 
        },
        validation: (gameState) => {
            return gameState.content[0].includes("good") && 
                   !gameState.content[0].includes("bad") &&
                   gameState.usedTextObject;
        }
    },
    
    // Level 21: Advanced Text Objects
    {
        name: "Text Objects: Parentheses and Quotes",
        chapter: 2,
        instructions: "Use 'di(' to delete the content inside parentheses, then use 'ci\"' to change the quoted text.",
        initialContent: [
            "function(old parameters)",
            'console.log("old text");'
        ],
        targetContent: [
            "function()",
            'console.log("new text");'
        ],
        setup: (gameState) => { 
            gameState.cursor = { row: 0, col: 8 }; 
        },
        validation: (gameState) => {
            return gameState.content[0].includes("function()") &&
                   gameState.content[1].includes('"new text"') &&
                   gameState.textObjectsUsed.size >= 2;
        }
    },
    
    // Level 22: Paragraph & Sentence Objects
    {
        name: "Text Objects: Paragraphs and Sentences",
        chapter: 2,
        instructions: "Use 'dip' to delete the inner paragraph, then use 'dis' to delete the inner sentence.",
        initialContent: [
            "First paragraph.",
            "Second paragraph.",
            "",
            "This is a sentence. This is another sentence.",
            "Final paragraph."
        ],
        targetContent: [
            "First paragraph.",
            "",
            "This is another sentence.",
            "Final paragraph."
        ],
        setup: (gameState) => { 
            gameState.cursor = { row: 1, col: 0 }; 
        },
        validation: (gameState) => {
            return gameState.content.length === 4 &&
                   gameState.content[0] === "First paragraph." &&
                   gameState.content[2] === "This is another sentence." &&
                   gameState.textObjectsUsed.has('paragraph') &&
                   gameState.textObjectsUsed.has('sentence');
        }
    },
    
    // Level 23: Basic Macros
    {
        name: "Macros: Recording and Playback",
        chapter: 2,
        instructions: "Record a macro with 'qa' that deletes a word, then use '@a' to replay it on the next word.",
        initialContent: [
            "delete this word and this word"
        ],
        targetContent: [
            "delete and word"
        ],
        setup: (gameState) => { 
            gameState.cursor = { row: 0, col: 7 }; 
        },
        validation: (gameState) => {
            return gameState.content[0] === "delete and word" &&
                   gameState.macrosCreated >= 1 &&
                   gameState.macroPlayed;
        }
    },
    
    // Level 24: Advanced Search & Replace
    {
        name: "Advanced Search & Replace",
        chapter: 2,
        instructions: "Type the EXACT command ':s/old/new/g' (including the colon, forward slashes, and 'g' at the end) and press Enter. This will replace all occurrences of 'old' with 'new' in the entire file. Make sure to type the complete command without any extra characters.",
        initialContent: [
            "old text with old words",
            "more old content here"
        ],
        targetContent: [
            "new text with new words",
            "more new content here"
        ],
        setup: (gameState) => { 
            gameState.cursor = { row: 0, col: 0 }; 
        },
        validation: (gameState) => {
            return gameState.content.every(line => line.includes("new")) &&
                   gameState.content.every(line => !line.includes("old")) &&
                   gameState.regexPatternsUsed.size >= 1;
        }
    },
    
    // Level 25: Marks & Jumps
    {
        name: "Marks and Jumps",
        chapter: 2,
        instructions: "Set a mark with 'ma' at the first line, move to the last line, then jump back with ''a'.",
        initialContent: [
            "Set mark here",
            "Move to this line",
            "Jump back to mark"
        ],
        targetContent: [
            "Set mark here",
            "Move to this line", 
            "Jump back to mark"
        ],
        setup: (gameState) => { 
            gameState.cursor = { row: 0, col: 0 }; 
        },
        validation: (gameState) => {
            return gameState.marksSet >= 1 &&
                   gameState.jumpsPerformed >= 1;
        }
    },
    
    // Level 26: Advanced Motions
    {
        name: "Advanced Motions",
        chapter: 2,
        instructions: "Use '%' to jump between matching parentheses, then use 'f' to find the next 'x'.",
        initialContent: [
            "(nested (parentheses) here)",
            "find the x character"
        ],
        targetContent: [
            "(nested (parentheses) here)",
            "find the x character"
        ],
        setup: (gameState) => { 
            gameState.cursor = { row: 0, col: 7 }; 
        },
        validation: (gameState) => {
            return gameState.advancedMotionsUsed >= 2;
        }
    }
];

// Level Management Functions
export const loadLevel = (levelIndex) => {
    if (levelIndex < 0 || levelIndex >= levels.length) {
        return false;
    }
    
    const level = levels[levelIndex];
    
    // Update global state variables
    setCurrentLevel(levelIndex);
    setContent(level.initialContent);
    setCursor({ row: 0, col: 0 });
    setMode('NORMAL');
    
    // Reset level-specific state
    resetLevelState();
    
    // Run level setup with minimal state object
    if (level.setup) {
        level.setup({ 
            cursor: getCursor(), 
            commandHistory: getCommandHistory()
        });
    }
    
    return true;
};

export const getCurrentLevelFromGameState = (gameState) => {
    return levels[gameState.currentLevel];
};

export const getLevelCount = () => levels.length;

export const isLastLevel = (gameState) => {
    return gameState.currentLevel === levels.length - 1;
};
