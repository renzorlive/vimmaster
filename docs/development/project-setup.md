# Developer Platform Setup

Welcome to the VIM Master project! Our goal is to ensure you can clone the repository and run your first test in under 5 minutes.

## Prerequisites
- **Node.js**: We require version 22 or higher. The project includes an `.nvmrc` file, so if you use `nvm`, simply run:
  ```bash
  nvm use
  ```

## 1. Clone & Install
```bash
git clone https://github.com/renzorlive/vimmaster.git
cd vimmaster
npm install
```

## 2. Verify Setup
Run our check script to ensure the platform is functioning correctly on your machine:
```bash
npm run check
```
*This will run both the linter and the test suite.*

## 3. Local Development Commands

While VIM Master can currently be run just by opening `index.html` in your browser, using the NPM scripts is required when contributing code:

- `npm run test` - Runs the Vitest suite once.
- `npm run test:watch` - Runs tests in watch mode (ideal for TDD).
- `npm run coverage` - Generates a test coverage report.
- `npm run lint` - Lints the JavaScript files via ESLint.
- `npm run format` - Formats the codebase via Prettier.

## Troubleshooting

### Node version errors
If you see errors during `npm install` related to engine versions, make sure you are using Node 22+.
*Fix:* Install the correct version using `nvm install 22` or download it from [nodejs.org](https://nodejs.org).

### Tests won't start or Vitest hangs
Sometimes the npm cache or Vitest cache gets corrupted.
*Fix:* Delete `node_modules` and the cache, then reinstall:
```bash
rm -rf node_modules
npm cache clean --force
npm install
```

### Issues on Windows
If you are developing on Windows and tests fail due to line-ending mismatches, ensure your git configuration respects the `.editorconfig`.
*Fix:* Run `git config --global core.autocrlf true` and re-clone the repository.
