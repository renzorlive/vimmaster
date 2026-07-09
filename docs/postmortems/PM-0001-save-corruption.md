# PM-0001: Save corruption — finishing the game destroyed the player's progress

- **Severity:** 🔴 Critical (silent, permanent loss of user data)
- **Affected:** Every player who reached the final level and later reloaded the page
- **Status:** Fixed (branch `fix/td-1-save-corruption`)

## Timeline

- **Unknown (pre-2026):** The game ships with 15 levels; `progress-system.js` hardcodes the valid save range as `currentLevel ≤ 14` and `totalLevels: 15` (also copied into `sharing-system.js`).
- **Later:** A 16th level ("How to Exit") is added to `levels.js`. Nothing forces the hardcoded `14`/`15` to be updated; nothing fails; the numbers silently drift from reality.
- **From then on:** Any player reaching level 16 (index 15) writes a save that `validateProgressData()` classifies as invalid ("Invalid level number").
- **On their next page load:** `autoLoadProgress()` sees the "invalid" save and calls `localStorage.removeItem('vimMasterProgress')` — permanently deleting the player's badges, practiced commands, and challenge points. The players most affected were the most engaged ones: those who finished the game.
- **2026-07-09:** Found during a full-repository architecture review (logged as TD-1 in [docs/TechnicalDebt.md](../TechnicalDebt.md)); fixed with repair-first loading and a full hardcode audit.

A secondary destructive path existed in the same function: any save older than one year was also rejected — and therefore deleted — purely for its age.

## Root cause

Two independent failures compounded:

1. **A derivable value was hardcoded.** The valid level range was written as literals (`14`, `15`) in two files instead of being derived from `levels.length`. When the data changed, the copies didn't.
2. **Validation failure was treated as license to destroy.** The load path's answer to "I don't recognize this data" was deletion. Validation strictness and data retention were coupled: the stricter the check, the more data got destroyed.

Either failure alone would have been survivable; together, a routine content addition became a data-loss bug.

## Fix

- All level-count literals removed and derived from `levels.length` (`progress-system.js` ×2, `sharing-system.js`, and the "16 Progressive Levels" copy in `index.html`, now populated at runtime).
- Load path rewritten to: **load → validate → repair → else keep original + backup + notify.** Repair clamps out-of-range levels, defaults missing/mistyped fields, and migrates version mismatches best-effort. Unrepairable saves are left in place and copied to a backup key; the user is told, and nothing is ever deleted.
- The age-based rejection was removed entirely — old saves are data, not garbage.
- User-initiated "Clear Progress" now also writes a backup before clearing.
- Verified in-browser against three scenarios: the exact final-level save (now loads and resumes), a structurally broken save (repaired, original backed up, user notified), and unparseable garbage (kept, backed up, user notified, fresh start).

## Prevention

1. **New absolute principle:** [PROJECT_PRINCIPLES.md #8](../../PROJECT_PRINCIPLES.md) — *User data is never destroyed automatically.* It outranks every other principle.
2. **Constants policy:** [docs/architecture/constants.md](../architecture/constants.md) — every derivable constant must be derived; reviewers reject literals with a source of truth elsewhere.
3. **PR template** now requires a Root Cause section (problem, cause, why it happened, how it's prevented forever) for every bug fix.
4. **Structural (upcoming):** once the test infra lands (Phase 0.5), save/load round-trip tests including the final level become a required CI check; the Phase 2 content system makes level count a loader concern with schema validation.

## Lessons learned

- **Counts drift.** Any literal that mirrors data will eventually lie. Derive or die.
- **Validation must never be destructive.** Reject-and-delete turns every future validation bug into a data-loss bug. Repair-or-preserve turns them into cosmetic bugs.
- **The blast radius of "defensive" code needs review too.** Both the range check and the age check were written as protections; both destroyed the thing they protected.
- **Your best users hit edge cases first.** The trigger condition was *finishing the game* — bugs at the boundaries punish the most engaged players.
