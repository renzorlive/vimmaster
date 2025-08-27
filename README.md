# VIM Master

VIM Master is a lightweight in-browser game that teaches core Vim motions and editing commands through short, focused levels. No installs required—just open `index.html` and start practicing.

## Demo
- Open `index.html` directly in your browser.
- Best viewed on desktop for full keyboard support.

## Features
- Normal/Insert modes with an on-screen status bar
- Command log showing your keystrokes
- Levels that validate your action outcomes (not just keystrokes)
- Supports: `h j k l`, `w b e`, `gg G`, `0 $`, `x`, `dd`, `dw`, `yy`, `p`, `i`, `a`, `o/O`, `cw`, `D`, `r`
- Completion modal with Enter to advance

## Levels
1. Basic Movement: `h j k l`
2. Word Movement: `w b e`
3. Line Jumps: `gg G`
4. Insert Mode: `i` + typing + `Esc`
5. Delete Basics: `dd`, `dw`, `x`
6. Yank & Put: `yy`, `p`
7. Line Bounds: `0`, `$`
8. Append & Open Lines: `a`, `o`, `O`
9. Change Word: `cw` (then type, `Esc`)
10. Delete to End & Replace: `D`, `r`

## Controls
- Navigation: `h` left, `j` down, `k` up, `l` right
- Words: `w` next, `b` back, `e` end
- Lines: `0` start, `$` end, `gg` first line, `G` last line
- Insert: `i` insert at cursor, `a` append after cursor, `o` new line below, `O` new line above
- Delete: `x` delete character, `dd` delete line, `dw` delete word, `D` delete to end of line
- Change: `cw` change word (deletes word and enters Insert)
- Replace: `r` then any printable character (supports symbols like `! @ # < > &`)
- Exit Insert mode: `Esc`

## How Validation Works
- Each level defines a target cursor location, target text, or target content layout.
- Validation is resilient to trailing spaces and blank lines where appropriate.
- You progress when the outcome matches the target; keystroke sequences themselves aren’t strictly enforced.

## Run Locally
- No build step. Just clone and open the file:

```bash
# Clone your fork
git clone https://github.com/<your-username>/vimmaster.git
cd vimmaster

# Open directly in a browser (double-click on Windows)
start index.html  # Windows
# or
open index.html   # macOS
# or
xdg-open index.html  # Linux
```

If your browser restricts local file access, serve it with any static server, for example:

```bash
npx serve .  # then visit the printed URL
```

## Tech Stack
- Plain HTML/CSS/JS
- Tailwind CDN for styling
- No dependencies, no frameworks

## Contributing
Issues and PRs are welcome!
- File: `index.html` contains all the logic and level definitions.
- Keep code readable and avoid adding heavy dependencies.
- Favor small, focused levels that teach a single concept well.

## License
MIT

## Acknowledgements
- Inspired by Vim’s modal editing and motion/operator design.
- ASCII logo included in the page for flair.
