// VIM Master Game - Game State Management

// Private state variables (not exported)
let _content = [];
let _cursor = { row: 0, col: 0 };
let _mode = 'NORMAL';
let _currentLevel = 0;
let _commandHistory = '';
let _commandLog = [];
let _yankedLine = null;
let _replacePending = false;
let _countBuffer = '';
let _undoStack = [];
let _redoStack = [];
let _level12Undo = false;
let _level12RedoAfterUndo = false;
let _lastExCommand = null;
let _searchMode = false;
let _searchQuery = '';
let _lastSearchQuery = null;
let _lastSearchDirection = 'forward';
let _searchMatches = [];
let _currentMatchIndex = -1;
let _usedSearchInLevel = false;
let _navCountSinceSearch = 0;
let _badges = new Set();
let _practicedCommands = new Set();

// Challenge Mode State
let _challengeMode = false;
let _currentChallenge = null;
let _challengeTimerInterval = null;
let _challengeStartTime = null;
let _challengeScoreValue = 0;
let _challengeProgressValue = 0;
let _currentTaskIndex = 0;

// State getter functions
export const getContent = () => [..._content];
export const getCursor = () => ({ ..._cursor });
export const getMode = () => _mode;
export const getCurrentLevel = () => _currentLevel;
export const getCommandHistory = () => _commandHistory;
export const getCommandLog = () => [..._commandLog];
export const getYankedLine = () => _yankedLine;
export const getReplacePending = () => _replacePending;
export const getCountBuffer = () => _countBuffer;
export const getUndoStack = () => [..._undoStack];
export const getRedoStack = () => [..._redoStack];
export const getLevel12Undo = () => _level12Undo;
export const getLevel12RedoAfterUndo = () => _level12RedoAfterUndo;
export const getLastExCommand = () => _lastExCommand;
export const getSearchMode = () => _searchMode;
export const getSearchQuery = () => _searchQuery;
export const getLastSearchQuery = () => _lastSearchQuery;
export const getLastSearchDirection = () => _lastSearchDirection;
export const getSearchMatches = () => [..._searchMatches];
export const getCurrentMatchIndex = () => _currentMatchIndex;
export const getUsedSearchInLevel = () => _usedSearchInLevel;
export const getNavCountSinceSearch = () => _navCountSinceSearch;
export const getBadges = () => new Set(_badges);
export const getPracticedCommands = () => new Set(_practicedCommands);
export const getChallengeMode = () => _challengeMode;
export const getCurrentChallenge = () => _currentChallenge;
export const getChallengeTimerInterval = () => _challengeTimerInterval;
export const getChallengeStartTime = () => _challengeStartTime;
export const getChallengeScoreValue = () => _challengeScoreValue;
export const getChallengeProgressValue = () => _challengeProgressValue;
export const getCurrentTaskIndex = () => _currentTaskIndex;

// State setter functions
export const setContent = (newContent) => {
    _content = [...newContent];
};

export const setCursor = (newCursor) => {
    _cursor = { ...newCursor };
};

export const setCursorRow = (newRow) => {
    _cursor.row = newRow;
};

export const setCursorCol = (newCol) => {
    _cursor.col = newCol;
};

export const setMode = (newMode) => {
    _mode = newMode;
};

export const setCurrentLevel = (newLevel) => {
    _currentLevel = newLevel;
};

export const setCommandHistory = (newHistory) => {
    _commandHistory = newHistory;
};

export const setCommandLog = (newLog) => {
    _commandLog = [...newLog];
};

export const setYankedLine = (newYankedLine) => {
    _yankedLine = newYankedLine;
};

export const setReplacePending = (newReplacePending) => {
    _replacePending = newReplacePending;
};

export const setCountBuffer = (newCountBuffer) => {
    _countBuffer = newCountBuffer;
};

export const setCountBufferAppend = (newCountBuffer) => {
    _countBuffer += newCountBuffer;
};

export const setSearchMode = (newSearchMode) => {
    _searchMode = newSearchMode;
};

export const setSearchQuery = (newSearchQuery) => {
    _searchQuery = newSearchQuery;
};

export const setLastSearchQuery = (newLastSearchQuery) => {
    _lastSearchQuery = newLastSearchQuery;
};

export const setLastSearchDirection = (newLastSearchDirection) => {
    _lastSearchDirection = newLastSearchDirection;
};

export const setSearchMatches = (newSearchMatches) => {
    _searchMatches = [...newSearchMatches];
};

export const setCurrentMatchIndex = (newCurrentMatchIndex) => {
    _currentMatchIndex = newCurrentMatchIndex;
};

export const setUsedSearchInLevel = (newUsedSearchInLevel) => {
    _usedSearchInLevel = newUsedSearchInLevel;
};

export const setNavCountSinceSearch = (newNavCountSinceSearch) => {
    _navCountSinceSearch = newNavCountSinceSearch;
};

export const setLevel12Undo = (newLevel12Undo) => {
    _level12Undo = newLevel12Undo;
};

export const setLevel12RedoAfterUndo = (newLevel12RedoAfterUndo) => {
    _level12RedoAfterUndo = newLevel12RedoAfterUndo;
};

export const setLastExCommand = (newLastExCommand) => {
    _lastExCommand = newLastExCommand;
};

export const setChallengeMode = (newChallengeMode) => {
    _challengeMode = newChallengeMode;
};

export const setCurrentChallenge = (newCurrentChallenge) => {
    _currentChallenge = newCurrentChallenge;
};

export const setChallengeTimerInterval = (newChallengeTimerInterval) => {
    _challengeTimerInterval = newChallengeTimerInterval;
};

export const setChallengeStartTime = (newChallengeStartTime) => {
    _challengeStartTime = newChallengeStartTime;
};

export const setChallengeScoreValue = (newChallengeScoreValue) => {
    _challengeScoreValue = newChallengeScoreValue;
};

export const setChallengeProgressValue = (newChallengeProgressValue) => {
    _challengeProgressValue = newChallengeProgressValue;
};

export const setCurrentTaskIndex = (newCurrentTaskIndex) => {
    _currentTaskIndex = newCurrentTaskIndex;
};

// Utility Functions
export const cloneState = () => ({
    content: [..._content],
    cursor: { ..._cursor },
    mode: _mode,
    yankedLine: _yankedLine
});

export const pushUndo = () => {
    _undoStack.push(cloneState());
    if (_undoStack.length > 200) _undoStack.shift();
    _redoStack = [];
};

export const escapeHtml = (s) => s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

// Treat Ctrl-[ as Escape (common Vim alias)
export const isEscapeKey = (e) => e.key === 'Escape' || (e.key === '[' && e.ctrlKey && !e.shiftKey && !e.altKey && !e.metaKey);

// State Reset Functions
export const resetGameState = () => {
    _content = [];
    _cursor = { row: 0, col: 0 };
    _mode = 'NORMAL';
    _commandHistory = '';
    _commandLog = [];
    _yankedLine = null;
    _replacePending = false;
    _countBuffer = '';
    _undoStack = [];
    _redoStack = [];
    _level12Undo = false;
    _level12RedoAfterUndo = false;
    _lastExCommand = null;
    _searchMode = false;
    _searchQuery = '';
    _lastSearchQuery = null;
    _lastSearchDirection = 'forward';
    _searchMatches = [];
    _currentMatchIndex = -1;
    _usedSearchInLevel = false;
    _navCountSinceSearch = 0;
};

export const resetChallengeState = () => {
    _challengeMode = false;
    _currentChallenge = null;
    _currentTaskIndex = 0;
    _challengeScoreValue = 0;
    _challengeProgressValue = 0;
    if (_challengeTimerInterval) {
        clearInterval(_challengeTimerInterval);
        _challengeTimerInterval = null;
    }
};

export const resetLevelState = () => {
    _level12Undo = false;
    _level12RedoAfterUndo = false;
    _lastExCommand = null;
    _usedSearchInLevel = false;
    _searchMode = false;
    _searchQuery = '';
    _lastSearchQuery = null;
    _lastSearchDirection = 'forward';
    _searchMatches = [];
    _currentMatchIndex = -1;
    _navCountSinceSearch = 0;
    _commandHistory = '';
    _commandLog = [];
    _yankedLine = null;
};

// Content manipulation functions
export const updateContentLine = (row, newLine) => {
    if (row >= 0 && row < _content.length) {
        _content[row] = newLine;
    }
};

export const insertContentLine = (row, newLine) => {
    _content.splice(row, 0, newLine);
};

export const removeContentLine = (row) => {
    if (row >= 0 && row < _content.length) {
        return _content.splice(row, 1)[0];
    }
    return null;
};

export const addContentLine = (newLine) => {
    _content.push(newLine);
};

// Command history manipulation
export const appendCommandHistory = (command) => {
    _commandHistory += command;
};

export const clearCommandHistory = () => {
    _commandHistory = '';
};

export const appendCommandLog = (log) => {
    _commandLog.push(log);
};

export const clearCommandLog = () => {
    _commandLog = [];
};

// Search manipulation
export const addSearchMatch = (match) => {
    _searchMatches.push(match);
};

export const clearSearchMatches = () => {
    _searchMatches = [];
};

// Badge manipulation
export const addBadge = (badge) => {
    _badges.add(badge);
};

export const hasBadge = (badge) => {
    return _badges.has(badge);
};

// Undo/Redo manipulation
export const popUndo = () => {
    return _undoStack.pop();
};

export const pushRedo = (state) => {
    _redoStack.push(state);
};

export const clearRedo = () => {
    _redoStack = [];
};
