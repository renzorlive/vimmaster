# VIM Master

Learn Vim by playing. VIM Master is an interactive, browser-based game designed to teach Vim commands through short, focused lessons, progressive difficulty, and gamification.

[![Tests](https://github.com/renzorlive/vimmaster/actions/workflows/test.yml/badge.svg)](https://github.com/renzorlive/vimmaster/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-v3.0.0-blue.svg)](https://github.com/renzorlive/vimmaster/releases/tag/v3.0.0)

<p align="center">
  <img src="images/vm.gif" alt="VIM Master Screenshot" width="100%">
</p>

## ✨ Features

- 🎮 **Interactive Learning:** Learn Vim commands directly in a simulated editor environment.
- 🏆 **Gamification:** Earn XP, build Combos, and unlock achievements and badges as you progress.
- 📚 **JSON-Driven Engine:** Every lesson is a self-contained JSON file, making it incredibly easy to add new content.
- 🚀 **Practice Arena:** Test your speed and accuracy in time-limited challenges.
- 📘 **Cheat Mode:** An easily accessible command reference to help you remember commands.
- 💾 **Local Saves:** Your progress, badges, and XP are automatically saved locally and can be imported/exported.

---

## 🚀 Quick Start

To run the game locally:

```bash
git clone https://github.com/renzorlive/vimmaster.git
cd vimmaster
npm install
npm run check
npm start
```
The game will be served locally via Vite (usually on `http://localhost:5173/`).

---

## 🏗️ Architecture

Starting with V3, VIM Master uses a **Content Platform Architecture**:
- **Engine as API:** The game engine purely consumes content. It does not hardcode lessons.
- **One JSON = One Lesson:** All content lives in `content/lessons/*.json`.
- **Content Provider:** During build time (`npm run build:content`), JSON lessons are compiled into a single optimized source of truth (`content/index.json`) that the engine reads.

### Project Structure
```text
content/     # JSON lessons and schema definitions
docs/        # Community guides, architecture, and principles
js/          # Game engine, progress system, and UI components
tests/       # Contract, Golden, and Regression test suites
```

---

## 🛡️ Testing & Validation

VIM Master takes stability seriously. We employ a robust 4-pillar testing strategy:

- **Contract Suite (`npm run test:contract`):** Validates all JSON lessons against strict schemas. It ensures no missing fields, valid metadata, and valid keys.
- **Golden Suite (`npm run test:golden`):** E2E validation. It runs the exact keypresses from a lesson's `solution` array through the actual game engine and validates that the final editor state matches the expected `targetContent`.
- **Regression Suite:** Protects against previously resolved bugs (e.g. Save Corruption `TD-0001`) re-emerging.
- **Unit Suite:** Verifies internal state logic and helper functions.

Run all tests at once using:
```bash
npm run check
```

---

## 🤝 Contributing

**Community First!** Our architecture is designed specifically so that anyone can contribute new lessons without needing to touch or understand the game engine code.

Want to add a new lesson for a Vim command? 
Just copy an existing JSON file, edit the text, and open a PR!
👉 Read our full guide: [Contributing a Lesson](docs/community/contributing-a-lesson.md)

---

## 🗺️ Roadmap

- ✅ **V2 Architecture Freeze:** JSON-driven content migration complete.
- ✅ **Community Alpha:** Testing suites, documentation, and gamification (XP/Combo) integrated.
- 🚧 **V3 UX Polish:** First-Time User Experience (FTUE), minimalist UI, and reduced cognitive load.
- 🔜 **Public Beta:** Launch and community lesson gathering.

---

## 📄 License

MIT License

[![Buy Me A Coffee](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/renzorlive)
