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
                    console.log('🔍 DEBUG: Challenge validation - content[0]:', content[0]);
                    console.log('🔍 DEBUG: Challenge validation - expected: "delete this line"');
                    console.log('🔍 DEBUG: Challenge validation - includes "remove":', content[0].includes("remove"));
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
    console.log('🔍 startChallenge called with gameState:', gameState);
    
    if (gameState.currentChallenge) {
        console.log('🔍 Challenge already exists, returning');
        return;
    }
    
    // Select a random challenge if none specified
    if (challengeIndex === null) {
        challengeIndex = Math.floor(Math.random() * challenges.length);
    }
    
    console.log('🔍 Selected challenge index:', challengeIndex);
    console.log('🔍 Available challenges:', challenges);
    
    gameState.currentChallenge = challenges[challengeIndex];
    gameState.currentTaskIndex = 0;
    gameState.challengeScoreValue = 0;
    gameState.challengeProgressValue = 0;
    gameState.challengeStartTime = Date.now();
    
    console.log('🔍 Challenge selected:', gameState.currentChallenge);
    console.log('🔍 Challenge initial content:', gameState.currentChallenge.initialContent);
    
    // Load challenge content and update global state
    gameState.content = [...gameState.currentChallenge.initialContent];
    gameState.cursor = { row: 0, col: 0 };
    gameState.mode = 'NORMAL';
    
    console.log('🔍 Local gameState updated:');
    console.log('🔍 - content:', gameState.content);
    console.log('🔍 - cursor:', gameState.cursor);
    console.log('🔍 - mode:', gameState.mode);
    
    // Update global state using setter functions
    console.log('🔍 Updating global state...');
    if (gameState.setContent) {
        console.log('🔍 Calling setContent with:', [...gameState.currentChallenge.initialContent]);
        gameState.setContent([...gameState.currentChallenge.initialContent]);
    } else {
        console.log('🔍 setContent function not found!');
    }
    
    if (gameState.setCursor) {
        console.log('🔍 Calling setCursor with:', { row: 0, col: 0 });
        gameState.setCursor({ row: 0, col: 0 });
    } else {
        console.log('🔍 setCursor function not found!');
    }
    
    if (gameState.setMode) {
        console.log('🔍 Calling setMode with: NORMAL');
        gameState.setMode('NORMAL');
    } else {
        console.log('🔍 setMode function not found!');
    }
    
    if (gameState.setCurrentChallenge) {
        console.log('🔍 Calling setCurrentChallenge with:', challenges[challengeIndex]);
        gameState.setCurrentChallenge(challenges[challengeIndex]);
    } else {
        console.log('🔍 setCurrentChallenge function not found!');
    }
    
    if (gameState.setCurrentTaskIndex) gameState.setCurrentTaskIndex(0);
    if (gameState.setChallengeScoreValue) gameState.setChallengeScoreValue(0);
    if (gameState.setChallengeProgressValue) gameState.setChallengeProgressValue(0);
    if (gameState.setChallengeStartTime) gameState.setChallengeStartTime(Date.now());
    
    console.log('🔍 startChallenge returning:', gameState.currentChallenge);
    return gameState.currentChallenge;
};

export const endChallenge = (gameState, success) => {
    if (gameState.challengeTimerInterval) {
        clearInterval(gameState.challengeTimerInterval);
        gameState.challengeTimerInterval = null;
    }
    
    let result = null;
    if (success) {
        const elapsed = Math.floor((Date.now() - gameState.challengeStartTime) / 1000);
        const finalScore = gameState.challengeScoreValue + Math.max(0, gameState.currentChallenge.timeLimit - elapsed) * 10;
        result = {
            success: true,
            score: finalScore,
            time: elapsed
        };
    } else {
        result = {
            success: false,
            score: gameState.challengeScoreValue,
            time: Math.floor((Date.now() - gameState.challengeStartTime) / 1000)
        };
    }
    
    // Reset challenge state
    gameState.resetChallengeState();
    
    return result;
};

export const checkChallengeTask = (gameState) => {
    if (!gameState.currentChallenge || gameState.currentTaskIndex >= gameState.currentChallenge.tasks.length) {
        return false;
    }
    
    const task = gameState.currentChallenge.tasks[gameState.currentTaskIndex];
    if (task.validation(gameState)) {
        // Task completed
        gameState.challengeProgressValue++;
        
        // Calculate score based on time
        const elapsed = Math.floor((Date.now() - gameState.challengeStartTime) / 1000);
        const timeBonus = Math.max(0, gameState.currentChallenge.timeLimit - elapsed);
        const taskScore = 100 + timeBonus;
        gameState.challengeScoreValue += taskScore;
        
        gameState.currentTaskIndex++;
        
        if (gameState.currentTaskIndex >= gameState.currentChallenge.tasks.length) {
            // All tasks completed
            return { completed: true, taskCompleted: true };
        } else {
            // Show next task
            return { completed: false, taskCompleted: true, nextTask: gameState.currentChallenge.tasks[gameState.currentTaskIndex] };
        }
    }
    
    return { completed: false, taskCompleted: false };
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
