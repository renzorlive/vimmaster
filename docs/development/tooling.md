# Tooling Philosophy

This document explains the reasoning behind our chosen infrastructure. It is meant for maintainers and those curious about the "Why" behind the "What".

## Why npm?
While `pnpm` is faster and `bun` is modern, `npm` is universally installed with Node.js. By sticking to `npm`, we reduce the barrier to entry for junior developers and casual contributors. The slight performance hit in CI is a worthwhile trade-off for zero-friction onboarding.

## Why Vitest?
Vitest is extremely fast and integrates seamlessly with Vite. Unlike Jest, which requires complex configuration to understand ES Modules and modern web features, Vitest supports ESM out of the box. Its API is almost identical to Jest, making the learning curve negligible.

## Why ESLint with Flat Config?
ESLint prevents a massive class of bugs (e.g., using undeclared variables). We adopted the **Flat Config** (`eslint.config.js`) because it is the new official standard. While `.eslintrc` might be more familiar to some, adopting Flat Config now prevents a painful migration in the future. We start with very minimal rules to avoid frustrating new contributors, and will slowly dial up strictness as the codebase matures.

## Why Prettier?
Arguments over code formatting waste time. Prettier acts as an objective, automated referee. We run Prettier independently of ESLint (rather than using `eslint-plugin-prettier`) to keep their concerns separate: Prettier handles formatting, ESLint handles code quality.

## Why GitHub Actions?
It is free, deeply integrated into our repository, and universally understood. Our CI pipeline is designed to be minimal: it installs dependencies using `npm ci` (which is faster and stricter than `npm install`), lints, and tests. We aggressively use concurrency groups to cancel redundant runs, saving CI minutes and reducing feedback time.
