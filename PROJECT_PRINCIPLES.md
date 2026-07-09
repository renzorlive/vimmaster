# Project Principles

Eight principles. Every PR, feature, and RFC is evaluated against them. When two conflict, the one higher on the list wins — except #8, which is absolute and outranks everything.

---

## 1. Learning first

VIMMaster exists to teach. Never sacrifice clarity for realism, cleverness, or completeness. If a lesson confuses one tester, the lesson is wrong — not the tester.

---

## 2. Offline first

The core experience works with no server and no connection after first load. Any networked feature must degrade to nothing, silently.

---

## 3. No login required

No accounts, ever, for anything. Your progress is yours, on your device, exportable as a code.

---

## 4. Content over code

Lessons, challenges, achievements, and translations are data. If adding content requires editing application code, the architecture is broken — fix the architecture, not the content.

---

## 5. Accessibility first

Keyboard-navigable, screen-reader-considerate, reduced-motion-respecting. A learning tool that excludes learners has failed at its only job.

---

## 6. Performance is a feature

The page loads in the time it takes to lose a beginner's courage. Every dependency, image, and script must justify its bytes.

---

## 7. Community before complexity

Prefer the solution a new contributor can understand. A simpler design that ten people can maintain beats a brilliant one that only its author can.

---

## 8. User data is never destroyed automatically

No code path may delete or discard a user's save because it failed validation, looks old, or has the wrong version. The order is always: **load → validate → repair if possible → otherwise keep the original, create a backup, and notify the user.** Only an explicit, confirmed user action may clear data — and even then, a backup is made first. *(Absolute — outranks every other principle. Origin: [PM-0001](docs/postmortems/PM-0001-save-corruption.md).)*
