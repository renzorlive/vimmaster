<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# **VIM Master Chapter 2: Advanced Features Implementation Prompt**

Based on my comprehensive analysis of your VIM Master game, here's a detailed prompt for Cursor to implement Chapter 2 with advanced VIM features including visual mode, macros, text objects, and more:[^1]

## **Implementation Overview**

Your VIM Master game currently has excellent foundational lessons covering basic movements, editing, and search. Chapter 2 should introduce advanced VIM features that transform users from beginners to intermediate practitioners. The implementation should follow your existing modular architecture and validation system.

## **Chapter 2: Advanced VIM Mastery**

### **Level Structure \& Features**

**Level 17: Visual Mode Fundamentals**

- **Objective**: Introduce character-wise visual mode (`v`)
- **Commands**: `v`, movement keys, `d`, `y`, `c`
- **Validation**: Select specific text regions and perform operations
- **Content Example**:

```javascript
{
  name: "Visual Mode: Character Selection",
  instructions: "Press 'v' to enter visual mode, select the word 'target' using movement keys, then press 'd' to delete it.",
  initialContent: [
    "Visual mode allows precise text selection.",
    "Select the target word in this sentence.",
    "Practice makes perfect with visual selection."
  ],
  targetContent: [
    "Visual mode allows precise text selection.", 
    "Select the word in this sentence.",
    "Practice makes perfect with visual selection."
  ]
}
```

**Level 18: Line-wise Visual Mode**

- **Objective**: Master line selection (`V`)
- **Commands**: `V`, `j`/`k`, `d`, `y`, `>`/`<` (indentation)
- **Validation**: Select and manipulate entire lines

**Level 19: Block Visual Mode**

- **Objective**: Rectangular selections (`Ctrl+v`)
- **Commands**: `Ctrl+v`, `I`, `A`, `c`
- **Validation**: Edit columns of text simultaneously

**Level 20: Text Objects Introduction**

- **Objective**: Inner vs around concepts (`iw` vs `aw`)
- **Commands**: `diw`, `daw`, `ciw`, `caw`, `yiw`
- **Validation**: Operate on word boundaries precisely

**Level 21: Advanced Text Objects**

- **Objective**: Parentheses, brackets, quotes
- **Commands**: `di(`, `da[`, `ci"`, `ca'`, `dit` (HTML tags)
- **Validation**: Edit within paired delimiters

**Level 22: Paragraph \& Sentence Objects**

- **Objective**: Larger text structures
- **Commands**: `dip`, `yap`, `dis`, `cas`
- **Validation**: Manipulate text blocks efficiently

**Level 23: Basic Macros**

- **Objective**: Record and replay keystroke sequences
- **Commands**: `qa`, recording keystrokes, `q`, `@a`, `@@`
- **Validation**: Automate repetitive editing tasks

**Level 24: Advanced Search \& Replace**

- **Objective**: Regex patterns in substitution
- **Commands**: `:%s/pattern/replacement/g`, `:%s/$word$/new\1/g`
- **Validation**: Transform text using capture groups

**Level 25: Marks \& Jumps**

- **Objective**: Navigation bookmarks
- **Commands**: `ma`, `'a`, `\`a`, `''`, `\`\``
- **Validation**: Set markers and jump between positions

**Level 26: Advanced Motions**

- **Objective**: Efficient navigation
- **Commands**: `f`, `F`, `t`, `T`, `;`, `,`, `%`
- **Validation**: Quick character-based movement


## **Technical Implementation Requirements**

### **1. Visual Mode System Extension**

```javascript
// In vim-commands.js - extend handleNormalMode
const visualModes = {
  VISUAL_CHAR: 'VISUAL',
  VISUAL_LINE: 'VISUAL_LINE', 
  VISUAL_BLOCK: 'VISUAL_BLOCK'
};

// Add visual mode state tracking
let visualMode = null;
let visualStart = null;
let visualSelection = [];

// Visual mode entry handlers
if (key === 'v' && mode === 'NORMAL') {
  setMode('VISUAL');
  visualMode = visualModes.VISUAL_CHAR;
  visualStart = { ...cursor };
}

if (key === 'V' && mode === 'NORMAL') {
  setMode('VISUAL_LINE');
  visualMode = visualModes.VISUAL_LINE;
  visualStart = { ...cursor };
}

if (key === 'v' && ctrlKey && mode === 'NORMAL') {
  setMode('VISUAL_BLOCK');
  visualMode = visualModes.VISUAL_BLOCK; 
  visualStart = { ...cursor };
}
```


### **2. Text Objects Implementation**

```javascript
// Text object definitions
const textObjects = {
  word: {
    inner: (cursor, content) => findWordBoundaries(cursor, content, false),
    around: (cursor, content) => findWordBoundaries(cursor, content, true)
  },
  parentheses: {
    inner: (cursor, content) => findPairedDelimiters(cursor, content, '()', false),
    around: (cursor, content) => findPairedDelimiters(cursor, content, '()', true)
  },
  quotes: {
    inner: (cursor, content) => findQuotedText(cursor, content, '"', false),
    around: (cursor, content) => findQuotedText(cursor, content, '"', true) 
  },
  paragraph: {
    inner: (cursor, content) => findParagraph(cursor, content, false),
    around: (cursor, content) => findParagraph(cursor, content, true)
  }
};

// Handle text object commands like "diw", "caw"
function handleTextObjectCommand(operator, textObj, isInner, cursor, content) {
  const bounds = textObjects[textObj][isInner ? 'inner' : 'around'](cursor, content);
  if (bounds) {
    performOperation(operator, bounds);
  }
}
```


### **3. Macro Recording System**

```javascript
// In game-state.js - add macro state
let macroState = {
  recording: false,
  register: null,
  keystrokes: [],
  macros: {} // Store completed macros
};

// Macro recording logic
function startMacroRecording(register) {
  macroState.recording = true;
  macroState.register = register;
  macroState.keystrokes = [];
}

function recordKeystroke(keystroke) {
  if (macroState.recording) {
    macroState.keystrokes.push(keystroke);
  }
}

function stopMacroRecording() {
  if (macroState.recording) {
    macroState.macros[macroState.register] = [...macroState.keystrokes];
    macroState.recording = false;
  }
}

function playMacro(register) {
  const macro = macroState.macros[register];
  if (macro) {
    // Replay each keystroke in sequence
    macro.forEach(keystroke => executeKeystroke(keystroke));
  }
}
```


### **4. Enhanced UI Components**

```javascript
// In ui-components.js - visual selection highlighting
export function renderEditor(content, cursor, mode, visualSelection = []) {
  // ... existing code ...
  
  // Add visual selection highlighting
  if (mode.startsWith('VISUAL') && visualSelection.length > 0) {
    visualSelection.forEach(pos => {
      // Add visual selection CSS class to selected characters
      if (pos.row === rowIndex && pos.col === colIndex) {
        html += `<span class="visual-selection">${safeChar}</span>`;
        return;
      }
    });
  }
  
  // ... rest of rendering code ...
}

// Add visual mode status display
export function updateStatusBar(mode, searchMode, searchQuery, lastSearchDirection, searchMatches, currentMatchIndex, visualSelection) {
  let text = `-- ${mode.toUpperCase()} --`;
  
  if (mode === 'VISUAL' && visualSelection.length > 0) {
    text += ` (${visualSelection.length} chars)`;
  } else if (mode === 'VISUAL_LINE' && visualSelection.length > 0) {
    const lines = new Set(visualSelection.map(pos => pos.row)).size;
    text += ` (${lines} lines)`;
  }
  
  // ... existing search mode display code ...
}
```


### **5. Level Validation Extensions**

```javascript
// Enhanced validation system for advanced features
function validateVisualModeLevel(level, gameState) {
  if (level.targetVisualOperation) {
    const { operation, selection, result } = level.targetVisualOperation;
    
    // Check if correct operation was performed on correct selection
    return gameState.lastVisualOperation === operation &&
           gameState.lastVisualSelection.equals(selection) &&
           gameState.content.equals(result);
  }
}

function validateTextObjectLevel(level, gameState) {
  if (level.targetTextObject) {
    const { command, targetObject } = level.targetTextObject;
    
    // Verify text object command was used correctly
    return gameState.lastCommand === command &&
           gameState.lastTextObject === targetObject;
  }
}

function validateMacroLevel(level, gameState) {
  if (level.targetMacro) {
    const { register, expectedKeystrokes, finalContent } = level.targetMacro;
    
    // Check macro recording and execution
    return gameState.macros[register] &&
           gameState.macros[register].equals(expectedKeystrokes) &&
           gameState.content.equals(finalContent);
  }
}
```


### **6. Advanced Search \& Replace**

```javascript
// Enhanced search system with regex support
function handleAdvancedSubstitution(pattern, replacement, flags) {
  const regex = new RegExp(pattern, flags);
  const content = getContent();
  
  const newContent = content.map(line => {
    if (flags.includes('g')) {
      return line.replace(regex, replacement);
    } else {
      return line.replace(regex, replacement);
    }
  });
  
  setContent(newContent);
}

// Support for capture groups in replacement
function processReplacementString(replacement, matches) {
  return replacement.replace(/\\(\d+)/g, (match, groupNumber) => {
    const groupIndex = parseInt(groupNumber);
    return matches[groupIndex] || '';
  });
}
```


### **7. CSS Styling for Advanced Features**

```css
/* Visual mode selection highlighting */
.visual-selection {
  background-color: rgba(100, 149, 237, 0.4);
  color: inherit;
}

.visual-line-selection {
  background-color: rgba(100, 149, 237, 0.2);
  width: 100%;
  display: inline-block;
}

.visual-block-selection {
  background-color: rgba(147, 112, 219, 0.4);
  border: 1px solid rgba(147, 112, 219, 0.6);
}

/* Macro recording indicator */
.macro-recording {
  background-color: #ff6b6b;
  color: white;
  padding: 2px 6px;
  border-radius: 3px;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Text object highlighting */
.text-object-preview {
  background-color: rgba(255, 223, 0, 0.3);
  border: 1px dashed rgba(255, 223, 0, 0.6);
}
```


### **8. Badge System Extensions**

```javascript
// New badges for Chapter 2
const advancedBadges = {
  'visual-master': {
    label: 'Visual Master',
    emoji: '👁️',
    title: 'Mastered all visual mode operations',
    condition: (gameState) => {
      const visualLevels = [17, 18, 19];
      return visualLevels.every(level => gameState.completedLevels.includes(level));
    }
  },
  'text-object-pro': {
    label: 'Text Object Pro', 
    emoji: '🎯',
    title: 'Mastered text object manipulation',
    condition: (gameState) => gameState.textObjectsUsed.size >= 8
  },
  'macro-wizard': {
    label: 'Macro Wizard',
    emoji: '🪄', 
    title: 'Created and executed complex macros',
    condition: (gameState) => gameState.macrosCreated >= 3
  },
  'regex-ninja': {
    label: 'Regex Ninja',
    emoji: '🥷',
    title: 'Advanced search and replace patterns',
    condition: (gameState) => gameState.regexPatternsUsed >= 5
  }
};
```


## **Integration with Existing Architecture**

### **Level Management Updates**

```javascript
// In levels.js - extend level array
export const levels = [
  // ... existing levels 1-16 ...
  
  // Chapter 2: Advanced Features
  {
    name: "Visual Mode: Character Selection",
    chapter: 2,
    instructions: "Press 'v' to enter visual mode, select text, then perform operations on the selection.",
    initialContent: [
      "Visual mode allows precise text selection.",
      "Select the word TARGET in this sentence.",
      "Use visual mode to edit efficiently."
    ],
    targetContent: [
      "Visual mode allows precise text selection.", 
      "Select the word EDITED in this sentence.",
      "Use visual mode to edit efficiently."
    ],
    setup: (gameState) => { 
      gameState.cursor = { row: 1, col: 15 }; 
      gameState.expectedVisualMode = 'VISUAL';
      gameState.expectedOperation = 'change';
    },
    validation: (gameState) => {
      return gameState.content[^1].includes("EDITED") && 
             gameState.usedVisualMode && 
             gameState.mode === 'NORMAL';
    }
  },
  
  // ... additional levels 18-26 ...
];
```


### **Challenge Mode Extensions**

```javascript
// In challenges.js - advanced challenges
export const advancedChallenges = [
  {
    name: "Visual Mode Mastery",
    description: "Complete visual selection tasks rapidly!",
    timeLimit: 180,
    tasks: [
      {
        instruction: "Select the entire function using visual line mode and indent it",
        validation: (gameState) => {
          return gameState.usedVisualLineMode && 
                 gameState.content.every(line => line.startsWith('  '));
        },
        hint: "Use 'V' to select lines, then '>' to indent"
      },
      {
        instruction: "Use visual block mode to add '//' to multiple line beginnings",
        validation: (gameState) => {
          const targetLines = [0, 1, 2];
          return targetLines.every(i => gameState.content[i].startsWith('//'));
        },
        hint: "Use Ctrl+v, select column, then I to insert text"
      }
    ],
    initialContent: [
      "function example() {",
      "console.log('test');", 
      "return true;",
      "}"
    ]
  },
  
  {
    name: "Text Object Speed Run",
    description: "Master text object operations under pressure!",
    timeLimit: 120,
    tasks: [
      {
        instruction: "Delete the content inside parentheses using text objects",
        validation: (gameState) => {
          return gameState.content[^0].includes("function()");
        },
        hint: "Use 'di(' to delete inside parentheses"
      },
      {
        instruction: "Change the quoted string using text objects", 
        validation: (gameState) => {
          return gameState.content[^1].includes('"new text"');
        },
        hint: "Use 'ci\"' to change inside quotes"
      }
    ],
    initialContent: [
      "function(old parameters)",
      'console.log("old text");'
    ]
  }
];
```


## **Implementation Priority \& Rollout Strategy**

### **Phase 1: Core Visual Mode (Levels 17-19)**

1. Implement basic visual mode state management
2. Add visual selection rendering and highlighting
3. Create character-wise, line-wise, and block-wise visual modes
4. Build validation system for visual operations

### **Phase 2: Text Objects (Levels 20-22)**

1. Develop text object detection algorithms
2. Implement inner vs around logic for various objects
3. Add text object validation and feedback
4. Create comprehensive text object lessons

### **Phase 3: Advanced Features (Levels 23-26)**

1. Build macro recording and playback system
2. Enhance search/replace with regex support
3. Implement marks and advanced navigation
4. Add character-based motion commands

### **Phase 4: Integration \& Polish**

1. Update challenge mode with advanced tasks
2. Add new badge system for Chapter 2
3. Enhance UI with advanced feature indicators
4. Comprehensive testing and bug fixes

## **Key Implementation Notes**

1. **Maintain Consistency**: Follow existing code patterns in `game-state.js`, `vim-commands.js`, and `levels.js`[^1]
2. **Validation Strategy**: Each advanced feature should have clear, testable validation criteria that match real VIM behavior
3. **Progressive Difficulty**: Start with simple visual selections and build to complex text object manipulations
4. **User Feedback**: Provide clear visual indicators for mode changes, selections, and macro recording status
5. **Performance**: Ensure macro playback and complex regex operations don't impact game responsiveness
6. **Accessibility**: Maintain keyboard-only operation and provide clear status indicators

This implementation will transform your VIM Master game from a beginner-friendly introduction to a comprehensive VIM learning platform that prepares users for real-world text editing mastery. The modular architecture you've established makes this expansion both feasible and maintainable.[^1]
<span style="display:none">[^10][^11][^12][^13][^14][^15][^16][^17][^18][^19][^2][^20][^21][^22][^23][^24][^25][^26][^27][^28][^29][^3][^30][^31][^32][^33][^34][^35][^36][^4][^5][^6][^7][^8][^9]</span>

<div style="text-align: center">⁂</div>

[^1]: https://github.com/renzorlive/vimmaster

[^2]: https://github.com/renzorlive/vimmaster/blob/main/index.html

[^3]: https://github.com/renzorlive/vimmaster/blob/main/js/main.js

[^4]: https://github.com/renzorlive/vimmaster/blob/main/js/levels.js

[^5]: https://github.com/renzorlive/vimmaster/blob/main/js/vim-commands.js

[^6]: https://github.com/renzorlive/vimmaster/blob/main/js/game-state.js

[^7]: https://github.com/renzorlive/vimmaster/blob/main/js/event-handlers.js

[^8]: https://github.com/renzorlive/vimmaster/blob/main/js/challenges.js

[^9]: https://github.com/renzorlive/vimmaster/blob/main/js/progress-system.js

[^10]: https://github.com/renzorlive/vimmaster/blob/main/js/ui-components.js

[^11]: https://github.com/renzorlive/vimmaster/blob/main/js/cheat-mode.js

[^12]: https://github.com/renzorlive/vimmaster/blob/main/css/main.css

[^13]: https://github.com/renzorlive/vimmaster/blob/main/profile.html

[^14]: https://github.com/renzorlive/vimmaster/blob/main/README.md

[^15]: https://github.com/renzorlive/vimmaster/blob/main/js/sharing-system.js

[^16]: https://builtin.com/articles/vim-visual-mode

[^17]: https://homelab-alpha.nl/back-to-basics/vim/advanced-guide/

[^18]: https://www.redhat.com/en/blog/use-vim-macros

[^19]: https://learnbyexample.gitbooks.io/vim-reference/content/Visual_mode.html

[^20]: https://blog.sebastian-daschner.com/entries/vim-10-advanced-features

[^21]: https://spin.atomicobject.com/record-vim-macros/

[^22]: https://linuxhandbook.com/vim-visual-mode/

[^23]: https://mustapha.hashnode.dev/vim-basics-to-advanced-a-comprehensive-tutorial

[^24]: https://learnvim.irian.to/basics/macros

[^25]: https://vim.rtorr.com

[^26]: https://www.integralist.co.uk/posts/vim-advanced/

[^27]: https://vim.kishorenewton.com/docs/advanced_editing/mastering-regular-expressions-in-vim-for-search-and-replace/

[^28]: https://thevaluable.dev/vim-create-text-objects/

[^29]: https://www.youtube.com/watch?v=zE0hno3vV9M

[^30]: https://fullscale.io/blog/vim-search-and-replace-ultimate-guide/

[^31]: https://agill.xyz/vim/text-objects

[^32]: https://blog.codeminer42.com/a-noobs-neovim-journey-pt-1-but-why/

[^33]: https://www.baeldung.com/linux/vim-search-replace

[^34]: https://martinlwx.github.io/en/learn-to-use-text-objects-in-vim/

[^35]: https://dev.to/aviavinav/vim-a-beginners-guide-from-a-beginner-b11

[^36]: https://www.reddit.com/r/neovim/comments/1abgc5b/any_documentation_for_advanced_usage_of_search/

