# Observability in VIM Master

Observability is crucial for understanding how our application behaves in the wild, identifying bottlenecks, and debugging issues efficiently. This document outlines our strategies and tools for making the application observable.

---

## 1. The Logger System

We use a custom, structured logger instead of direct `console` calls. This gives us complete control over log formatting, filtering, and destination (via Adapters).

### Architecture

The logger uses an **Event-based architecture**. Every time you log something, an event object is created internally:

```typescript
{
    timestamp: number, // e.g., Date.now()
    level: object,     // { name: 'warn', rank: 2, emoji: '⚠️' }
    category: string,  // 'lesson'
    message: string,   // 'Unused property'
    metadata: object   // { lessonId: 'hjkl', property: 'speed' }
}
```

This event is then passed to all registered **Adapters**. Currently, we use a `ConsoleAdapter`, but this architecture allows us to easily plug in `TestAdapter`, `AnalyticsAdapter`, or `RemoteAdapter` in the future without changing application code.

### Categories

Always use a specific category when logging. This makes it easy to filter logs in development and production.

| Category | Description |
| :--- | :--- |
| `engine` | Core game loop, parsing, execution, and state management. |
| `lesson` | Lesson loading, validation, rendering, and lifecycle. |
| `progress` | Saving, loading, and tracking user achievements. |
| `storage` | Interacting with localStorage or external databases. |
| `input` | Keyboard event handling, vim command parsing. |
| `ui` | Rendering logic, animations, component lifecycle. |
| `performance` | Timings, render speeds, optimization metrics. |
| `developer` | Debugging information strictly for developers. |

### Log Levels

Use the appropriate log level based on the context:

| Level | Usage Rule | Example Context |
| :--- | :--- | :--- |
| `debug` | Developer only. Verbose state changes. | `logger.debug('ui', 'Rendering modal', { id: 'completion' })` |
| `info` | Rare, significant lifecycle events. | `logger.info('engine', 'Game initialized', { version: '1.0' })` |
| `success`| Action successfully completed. | `logger.success('progress', 'Progress saved', { badges: 3 })` |
| `warn` | Recoverable errors, unexpected but handled states. | `logger.warn('lesson', 'Missing optional property', { prop: 'hint' })` |
| `error` | Unexpected, unhandled, or critical failures. | `logger.error('storage', 'Quota exceeded', { error: e.message })` |

### Log IDs

For standard or frequent errors, use a **Log ID** in your metadata or message. This makes it much easier to search for the exact error in the codebase or documentation.

* **Format**: `[CATEGORY_PREFIX][NUMBER]`
* **Examples**: 
  * `ENG001` - Engine failed to parse command.
  * `LES003` - Lesson file not found.
  * `PRG004` - Progress corrupted.

```javascript
logger.error('engine', 'Command parsing failed [ENG001]', { command: 'dd' });
```

### Measuring Performance

Instead of `console.time()`, use `logger.measure()` which automatically records duration via `performance.now()` and returns the function's result.

```javascript
// Synchronous
const user = logger.measure('storage', 'Load user data', () => {
    return loadUserFromStorage();
});

// Asynchronous
const data = await logger.measure('engine', 'Fetch remote lesson', () => {
    return fetchLesson();
});
```

---

## 2. Best Practices & Anti-patterns

### ✅ Do: Pass Metadata as an Object

Metadata must always be a structured object.

```javascript
// Good
logger.warn("lesson", "Unused property", { lessonId: "basics", property: "tags" });
```

### ❌ Don't: Pass Primitive Metadata

Do not pass primitives or multiple arguments as metadata. It breaks the adapter pattern.

```javascript
// Bad
logger.warn("lesson", "Unused property", "basics", "tags");
```

### ❌ Don't: Use Logger for Control Flow

The logger is an observer. It should never dictate how the application runs.

```javascript
// Bad
if (logger.debug('engine', 'Checking state')) { ... }
```

### ❌ Don't: Log Everything (e.g., Keystrokes)

Never log highly frequent events like every individual keystroke, mouse movement, or 60fps render tick. It destroys performance and pollutes logs.
*If absolutely necessary for debugging a specific issue, use a `developer` category flag temporarily.*

---

## 3. Migration Guide (`console.*` → `logger.*`)

When migrating old code to the new logger, follow this mapping:

* `console.log(...)` ➔ `logger.debug(...)` (usually) or `logger.info(...)`
* `console.warn(...)` ➔ `logger.warn(category, message, metadata)`
* `console.error(...)` ➔ `logger.error(category, message, metadata)`
* `console.time(...)` ➔ `logger.measure(category, label, fn)`

**Example Migration:**

*Before:*
```javascript
console.log('Loading lesson', lessonId);
console.warn('Lesson missing description');
```

*After:*
```javascript
logger.info('lesson', 'Loading lesson', { lessonId });
logger.warn('lesson', 'Lesson missing description', { lessonId });
```

---

## 4. Development & Configuration

In development, the logger uses emojis and nice console groups. In production, it falls back to flat, clean strings without emojis.

### Enabling Debug Mode

You can configure the logger dynamically in the browser console:

1. **Specific categories:**
   ```javascript
   localStorage.vimMasterDebug = "engine,lesson"
   ```
2. **All logs:**
   ```javascript
   localStorage.vimMasterDebug = "all" // or "1"
   ```
3. **Turn off debug filter (use default production levels):**
   ```javascript
   delete localStorage.vimMasterDebug
   ```

*(Note: Refresh the page to apply changes.)*

---

## Future Expansion

This `observability.md` file will serve as the hub for future enhancements. As the project grows, we will add sections here for:

* **Profiling**: CPU and memory profiling strategies.
* **Analytics**: Tracking user flow without compromising privacy.
* **Diagnostics**: Remote error reporting.
