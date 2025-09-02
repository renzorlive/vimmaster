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
let _exCommandBuffer = '';
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

// Visual Mode State
let _visualMode = null; // 'VISUAL', 'VISUAL_LINE', 'VISUAL_BLOCK'
let _visualStart = null; // { row, col }
let _visualSelection = []; // Array of { row, col } positions
let _visualEnd = null; // { row, col }

// Text Objects State
let _textObjectsUsed = new Set();
let _lastTextObjectCommand = null;

// Macro State
let _macroState = {
    recording: false,
    register: null,
    keystrokes: [],
    macros: {} // Store completed macros
};

// Command Mode State
let _commandMode = false;

// Marks State
let _marks = {}; // Store marks by letter
let _lastJumpPosition = null; // For '' and `` navigation

// Advanced Search State
let _regexPatternsUsed = new Set();
let _lastSubstitution = null;

// Level validation tracking
let _usedVisualMode = false;
let _usedVisualLineMode = false;
let _usedVisualBlockMode = false;
let _usedTextObject = false;
let _macrosCreated = 0;
let _macroPlayed = false;
let _marksSet = 0;
let _jumpsPerformed = 0;
let _advancedMotionsUsed = 0;

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
export const getExCommandBuffer = () => _exCommandBuffer;
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

// Visual Mode getters
export const getVisualMode = () => _visualMode;
export const getVisualStart = () => _visualStart ? { ..._visualStart } : null;
export const getVisualSelection = () => [..._visualSelection];
export const getVisualEnd = () => _visualEnd ? { ..._visualEnd } : null;

// Text Objects getters
export const getTextObjectsUsed = () => new Set(_textObjectsUsed);
export const getLastTextObjectCommand = () => _lastTextObjectCommand;

// Macro getters
export const getMacroState = () => ({ ..._macroState });
export const getMacros = () => ({ ..._macroState.macros });

// Command mode getter - for status bar display
export const getCommandMode = () => _commandMode;

// Marks getters
export const getMarks = () => ({ ..._marks });
export const getLastJumpPosition = () => _lastJumpPosition ? { ..._lastJumpPosition } : null;

// Advanced Search getters
export const getRegexPatternsUsed = () => new Set(_regexPatternsUsed);
export const getLastSubstitution = () => _lastSubstitution;

// Level validation getters
export const getUsedVisualMode = () => _usedVisualMode;
export const getUsedVisualLineMode = () => _usedVisualLineMode;
export const getUsedVisualBlockMode = () => _usedVisualBlockMode;
export const getUsedTextObject = () => _usedTextObject;
export const getMacrosCreated = () => _macrosCreated;
export const getMacroPlayed = () => _macroPlayed;
export const getMarksSet = () => _marksSet;
export const getJumpsPerformed = () => _jumpsPerformed;
export const getAdvancedMotionsUsed = () => _advancedMotionsUsed;

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

export const setExCommandBuffer = (newExCommandBuffer) => {
    _exCommandBuffer = newExCommandBuffer;
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

// Visual Mode setters
export const setVisualMode = (newVisualMode) => {
    _visualMode = newVisualMode;
};

export const setVisualStart = (newVisualStart) => {
    _visualStart = newVisualStart ? { ...newVisualStart } : null;
};

export const setVisualSelection = (newVisualSelection) => {
    _visualSelection = [...newVisualSelection];
};

export const setVisualEnd = (newVisualEnd) => {
    _visualEnd = newVisualEnd ? { ...newVisualEnd } : null;
};

export const clearVisualSelection = () => {
    _visualMode = null;
    _visualStart = null;
    _visualSelection = [];
    _visualEnd = null;
};

// Text Objects setters
export const addTextObjectUsed = (textObject) => {
    _textObjectsUsed.add(textObject);
};

export const setLastTextObjectCommand = (command) => {
    _lastTextObjectCommand = command;
};

// Macro setters
export const setMacroRecording = (recording, register = null) => {
    _macroState.recording = recording;
    _macroState.register = register;
    if (recording) {
        _macroState.keystrokes = [];
    }
};

export const recordKeystroke = (keystroke) => {
    if (_macroState.recording) {
        _macroState.keystrokes.push(keystroke);
    }
};

export const stopMacroRecording = () => {
    if (_macroState.recording && _macroState.register) {
        _macroState.macros[_macroState.register] = [..._macroState.keystrokes];
        _macroState.recording = false;
        _macroState.register = null;
        _macroState.keystrokes = [];
    }
};

// Command mode setter
export const setCommandMode = (commandMode) => {
    _commandMode = commandMode;
};

// Marks setters
export const setMark = (letter, position) => {
    _marks[letter] = { ...position };
};

export const setLastJumpPosition = (position) => {
    _lastJumpPosition = position ? { ...position } : null;
};

// Advanced Search setters
export const addRegexPatternUsed = (pattern) => {
    _regexPatternsUsed.add(pattern);
};

export const setLastSubstitution = (substitution) => {
    _lastSubstitution = substitution;
};

// Level validation setters
export const setUsedVisualMode = (used) => {
    _usedVisualMode = used;
};

export const setUsedVisualLineMode = (used) => {
    _usedVisualLineMode = used;
};

export const setUsedVisualBlockMode = (used) => {
    _usedVisualBlockMode = used;
};

export const setUsedTextObject = (used) => {
    _usedTextObject = used;
};

export const setMacrosCreated = (count) => {
    _macrosCreated = count;
};

export const setMacroPlayed = (played) => {
    _macroPlayed = played;
};

export const setMarksSet = (count) => {
    _marksSet = count;
};

export const setJumpsPerformed = (count) => {
    _jumpsPerformed = count;
};

export const setAdvancedMotionsUsed = (count) => {
    _advancedMotionsUsed = count;
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
    _exCommandBuffer = '';
    _searchMode = false;
    _searchQuery = '';
    _lastSearchQuery = null;
    _lastSearchDirection = 'forward';
    _searchMatches = [];
    _currentMatchIndex = -1;
    _usedSearchInLevel = false;
    _navCountSinceSearch = 0;
    
    // Clear advanced features state
    _visualMode = null;
    _visualStart = null;
    _visualSelection = [];
    _visualEnd = null;
    _textObjectsUsed = new Set();
    _lastTextObjectCommand = null;
    _macroState = { recording: false, register: null, keystrokes: [], macros: {} };
    _commandMode = false;
    _marks = {};
    _lastJumpPosition = null;
    _regexPatternsUsed = new Set();
    _lastSubstitution = null;
    
    // Reset level validation tracking
    _usedVisualMode = false;
    _usedVisualLineMode = false;
    _usedVisualBlockMode = false;
    _usedTextObject = false;
    _macrosCreated = 0;
    _macroPlayed = false;
    _marksSet = 0;
    _jumpsPerformed = 0;
    _advancedMotionsUsed = 0;
    
    // Also clear badges and practiced commands
    _badges = new Set();
    _practicedCommands = new Set();
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
    _exCommandBuffer = '';
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
    
    // Clear visual mode and other level-specific advanced features
    _visualMode = null;
    _visualStart = null;
    _visualSelection = [];
    _visualEnd = null;
    _lastTextObjectCommand = null;
    _lastSubstitution = null;
    
    // Reset level validation tracking
    _usedVisualMode = false;
    _usedVisualLineMode = false;
    _usedVisualBlockMode = false;
    _usedTextObject = false;
    _macrosCreated = 0;
    _macroPlayed = false;
    _marksSet = 0;
    _jumpsPerformed = 0;
    _advancedMotionsUsed = 0;
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

export const setBadges = (badges) => {
    _badges = new Set(badges);
};

export const setPracticedCommands = (commands) => {
    _practicedCommands = new Set(commands);
};

export const addPracticedCommand = (command) => {
    _practicedCommands.add(command);
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
