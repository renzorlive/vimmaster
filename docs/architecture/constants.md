# Constants Policy

> **Every constant that can be derived from project data MUST be derived automatically.**

A hardcoded copy of a derivable value is a bug waiting for the data to change. This is not hypothetical: [PM-0001](../postmortems/PM-0001-save-corruption.md) — our first user-facing data-loss bug — was caused by exactly this (`15` written down while `levels.length` grew to 16).

## The rule

❌ Never:

```js
const TOTAL_LEVELS = 15;
if (data.currentLevel > 14) { … }
totalLevels: 15,
<span>16 Progressive Levels</span>
```

✔ Always:

```js
levels.length
if (data.currentLevel >= levels.length) { … }
totalLevels: levels.length,
featureLevelCount.textContent = `${levels.length} Progressive Levels`;
```

## What this applies to

Any value that has a source of truth elsewhere in the project:

| Value | Derive from |
|---|---|
| Number of levels/lessons | `levels.length` (later: the content loader) |
| Number of challenges | `challenges.length` |
| Number of achievements/badges | the achievements definition (single source — see TD-12: today there are three divergent badge maps) |
| Number of commands in the cheat sheet | `commandCatalog` |
| Number of tracks | the content directory (Phase 2) |
| Maximum score / points per task | the challenge's own `scoring` data |
| Valid ranges of any saved field | the data that defines the range (e.g. level index < `levels.length`) |
| Counts displayed in UI or marketing copy ("16 Progressive Levels") | computed at runtime or at build time — never typed by hand |

If a value is a genuine free-standing decision (autosave interval, undo-stack cap, toast duration), it is allowed — but it must be a **named constant defined once**, not a literal repeated at call sites.

## Review checklist

When reviewing a PR, reject any diff that:

1. introduces a numeric/string literal whose value is derivable from data;
2. repeats an existing named constant as a literal;
3. duplicates a definition (badge maps, level lists, key names) instead of importing the existing one.

## Known remaining violations (tracked, out of scope of PM-0001's fix)

These are content-coupling issues scheduled for the Phase 2 content system ([docs/ContentSystem.md](../ContentSystem.md)):

- `event-handlers.js` — badge award threshold `getCurrentLevel() >= 2` (magic level index) and hardcoded search-level name arrays (TD-7);
- `challenges.js` / `event-handlers.js` — scoring literals (`10`, `100`, time-bonus divisors) pending the `scoring` schema (TD-6);
- three divergent badge definition maps (TD-12).

When you fix one, remove it from this list.
