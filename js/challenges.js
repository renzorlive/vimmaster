// VIM Master Game - Challenge Mode

// Challenge Definitions
export const challenges = [
    {
        name: "Speed Navigation",
        description: "Navigate to the target using the fastest route!",
        timeLimit: 90,
        tasks: [
            {
                instruction: "Move to the word 'target' using 3w",
                validation: (gameState) => {
                    const cursor = gameState.getCursor();
                    const content = gameState.getContent();
                    // Check if cursor is on the word 'target'
                    const line = content[cursor.row];
                    const wordStart = line.indexOf('target');
                    return cursor.row === 0 && cursor.col >= wordStart && cursor.col < wordStart + 6;
                },
                hint: "Use 3w to jump 3 words forward"
            },
            {
                instruction: "Jump to the end of the line with $",
                validation: (gameState) => {
                    const cursor = gameState.getCursor();
                    const content = gameState.getContent();
                    return cursor.col === content[cursor.row].length - 1;
                },
                hint: "Use $ to jump to end of line"
            },
            {
                instruction: "Go to the first line with gg",
                validation: (gameState) => gameState.getCursor().row === 0 && gameState.getCursor().col === 0,
                hint: "Use gg to jump to first line"
            }
        ],
        initialContent: [
            "one two three target here at end",
            "second line for practice"
        ]
    },
    {
        name: "Quick Deletion",
        description: "Delete and modify text rapidly!",
        timeLimit: 120,
        tasks: [
            {
                instruction: "Delete the word 'remove' from the first line using dw",
                validation: (gameState) => {
                    const content = gameState.getContent();
                    return content[0] === "delete this line" && !content[0].includes("remove");
                },
                hint: "Position cursor on 'r' of 'remove', then use dw"
            },
            {
                instruction: "Delete the second line completely using dd",
                validation: (gameState) => {
                    const content = gameState.getContent();
                    return content.length === 2 && content[1] === "This is BAD text";
                },
                hint: "Use j to go down to second line, then dd to delete it"
            },
            {
                instruction: "Change 'BAD' to 'GOOD' on the second line using cw",
                validation: (gameState) => {
                    const content = gameState.getContent();
                    return content[1].includes("GOOD") && !content[1].includes("BAD");
                },
                hint: "Position cursor on 'B' of 'BAD', use cw then type 'GOOD'"
            }
        ],
        initialContent: [
            "delete this remove line",
            "delete this line too",
            "This is BAD text"
        ]
    },
    {
        name: "Advanced Moves",
        description: "Master complex command combinations!",
        timeLimit: 150,
        tasks: [
            {
                instruction: "Yank the first line with yy",
                validation: (gameState) => {
                    const yankedLine = gameState.getYankedLine();
                    return yankedLine === "first line to copy";
                },
                hint: "Use yy to yank the current line"
            },
            {
                instruction: "Go to the third line and paste with p",
                validation: (gameState) => {
                    const content = gameState.getContent();
                    return content.length === 3 && content[2] === "first line to copy";
                },
                hint: "Use j to go down 2 lines, then p to paste"
            },
            {
                instruction: "Replace 'x' with '!' on the second line using r",
                validation: (gameState) => {
                    const content = gameState.getContent();
                    return content[1].includes("!") && !content[1].includes("x");
                },
                hint: "Position cursor on 'x', use r then !"
            }
        ],
        initialContent: [
            "first line to copy",
            "replace this x",
            ""
        ]
    }
];

// Challenge Management Functions
export const startChallenge = (gameState, challengeIndex = null) => {
    
    if (gameState.currentChallenge) {
        return;
    }

    // Fresh editing session: clear undo/redo (and search/command state) so
    // pressing `u` in a challenge can't restore the buffer the player was on
    // before entering it (issue #6).
    if (gameState.resetLevelState) {
        gameState.resetLevelState();
    }

    // Select a random challenge if none specified
    if (challengeIndex === null) {
        challengeIndex = Math.floor(Math.random() * challenges.length);
    }
    
    
    gameState.currentChallenge = challenges[challengeIndex];
    gameState.currentTaskIndex = 0;
    gameState.challengeScoreValue = 0;
    gameState.challengeProgressValue = 0;
    gameState.challengeStartTime = Date.now();
    
    
    // Load challenge content and update global state
    gameState.content = [...gameState.currentChallenge.initialContent];
    gameState.cursor = { row: 0, col: 0 };
    gameState.mode = 'NORMAL';
    
    
    // Update global state using setter functions
    if (gameState.setContent) {
        gameState.setContent([...gameState.currentChallenge.initialContent]);
    }
    
    if (gameState.setCursor) {
        gameState.setCursor({ row: 0, col: 0 });
    }
    
    if (gameState.setMode) {
        gameState.setMode('NORMAL');
    }
    
    if (gameState.setCurrentChallenge) {
        gameState.setCurrentChallenge(challenges[challengeIndex]);
    }
    
    if (gameState.setCurrentTaskIndex) gameState.setCurrentTaskIndex(0);
    if (gameState.setChallengeScoreValue) gameState.setChallengeScoreValue(0);
    if (gameState.setChallengeProgressValue) gameState.setChallengeProgressValue(0);
    if (gameState.setChallengeStartTime) gameState.setChallengeStartTime(Date.now());
    
    return gameState.currentChallenge;
};

// NOTE (TD-6): the former endChallenge/checkChallengeTask exports were dead
// code carrying a *divergent* scoring formula (100 + full time bonus) that
// was never what players experienced. Deleted; the single source of truth
// for task scoring is calculateTaskPoints below.

/**
 * Points awarded for completing a challenge task: base 10 plus 1 point per
 * 10 seconds remaining. Single source of truth for task scoring (TD-6).
 */
export const calculateTaskPoints = (challenge, challengeStartTime) => {
    const timeRemaining = getChallengeTimeRemaining({
        currentChallenge: challenge,
        challengeStartTime
    });
    return 10 + Math.max(0, Math.floor(timeRemaining / 10));
};

export const getCurrentTask = (gameState) => {
    if (!gameState.currentChallenge || gameState.currentTaskIndex >= gameState.currentChallenge.tasks.length) {
        return null;
    }
    return gameState.currentChallenge.tasks[gameState.currentTaskIndex];
};

export const getChallengeProgress = (gameState) => {
    if (!gameState.currentChallenge) return { current: 0, total: 0, percentage: 0 };
    
    const current = gameState.currentTaskIndex;
    const total = gameState.currentChallenge.tasks.length;
    const percentage = total > 0 ? (current / total) * 100 : 0;
    
    return { current, total, percentage };
};

export const getChallengeTimeRemaining = (gameState) => {
    if (!gameState.currentChallenge || !gameState.challengeStartTime) return 0;
    
    const elapsed = Math.floor((Date.now() - gameState.challengeStartTime) / 1000);
    return Math.max(0, gameState.currentChallenge.timeLimit - elapsed);
};
