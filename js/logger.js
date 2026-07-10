export const CATEGORIES = {
    ENGINE: 'engine',
    LESSON: 'lesson',
    PROGRESS: 'progress',
    STORAGE: 'storage',
    INPUT: 'input',
    UI: 'ui',
    PERFORMANCE: 'performance',
    DEVELOPER: 'developer'
};

export const LEVELS = {
    DEBUG: { name: 'debug', rank: 0, emoji: '🐛' },
    INFO: { name: 'info', rank: 1, emoji: '💡' },
    SUCCESS: { name: 'success', rank: 1, emoji: '✅' },
    WARN: { name: 'warn', rank: 2, emoji: '⚠️' },
    ERROR: { name: 'error', rank: 3, emoji: '❌' }
};

class ConsoleAdapter {
    constructor(loggerInstance) {
        this.logger = loggerInstance;
    }

    logEvent(event) {
        const { timestamp, level, category, message, metadata } = event;
        const isDev = this.logger.config.development;
        
        if (!isDev) {
            // Production style - no emojis, flat format
            const fn = console[level.name] || console.log;
            fn(`[${new Date(timestamp).toISOString()}] [${category}] ${message}`, Object.keys(metadata).length ? metadata : '');
            return;
        }

        // Development style - groups and emojis
        const prefix = `${level.emoji} [${category.toUpperCase()}]`;
        const timeStr = new Date(timestamp).toLocaleTimeString();
        
        if (metadata && Object.keys(metadata).length > 0) {
            // Use groupCollapsed for cleaner console if it's info/debug
            const groupMethod = (level.name === 'error' || level.name === 'warn') ? console.group : console.groupCollapsed;
            groupMethod(`${prefix} ${message} - ${timeStr}`);
            
            // Nice output of metadata keys
            for (const [key, value] of Object.entries(metadata)) {
                if (key === 'duration') {
                    console.log(`⏱️ %c${key}:`, 'font-weight: bold', `${value.toFixed(2)}ms`);
                } else if (key === 'error') {
                    console.log(`❌ %c${key}:`, 'font-weight: bold; color: red', value);
                } else {
                    console.log(`%c${key}:`, 'font-weight: bold', value);
                }
            }
            console.groupEnd();
        } else {
            const fn = console[level.name] || console.log;
            fn(`${prefix} ${message} - ${timeStr}`);
        }
    }
}

class Logger {
    constructor() {
        this.adapters = [];
        this.config = {
            development: false,
            activeCategories: new Set(),
            debugAll: false
        };
        
        this._autoConfigure();
        this.addAdapter(new ConsoleAdapter(this));
    }

    addAdapter(adapter) {
        this.adapters.push(adapter);
    }

    configure(options) {
        this.config = { ...this.config, ...options };
        if (options.development !== undefined) {
            this._setupDebugCategories();
        }
    }

    _autoConfigure() {
        // Fallback environment detection hierarchy
        let isDev = false;
        try {
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('debug') === '1') {
                isDev = true;
            } else if (localStorage.getItem('vimMasterDebug')) {
                isDev = true;
            } else if (['localhost', '127.0.0.1'].includes(window.location.hostname)) {
                isDev = true;
            }
        } catch {
            // In case we're in an environment without window/localStorage
        }
        
        this.config.development = isDev;
        this._setupDebugCategories();
    }

    _setupDebugCategories() {
        this.config.activeCategories = new Set();
        this.config.debugAll = false;
        
        try {
            const configStr = localStorage.getItem('vimMasterDebug');
            if (configStr) {
                if (configStr === '1' || configStr === 'all') {
                    this.config.debugAll = true;
                } else {
                    const cats = configStr.split(',').map(c => c.trim().toLowerCase());
                    this.config.activeCategories = new Set(cats);
                }
            } else if (this.config.development) {
                // If development mode is on but no specific filter is set, show all logs.
                this.config.debugAll = true;
            }
        } catch {
            this.config.debugAll = true;
        }
    }

    _shouldLog(level, category) {
        // Always log Errors and Warnings
        if (level.rank >= LEVELS.WARN.rank) return true;
        
        // In development, respect the active categories filter
        if (this.config.development) {
            if (this.config.debugAll) return true;
            return this.config.activeCategories.has(category);
        }
        
        // In production, generally skip debug level unless specifically required
        return level.rank >= LEVELS.INFO.rank;
    }

    _createEvent(level, category, message, metadata) {
        // Enforce that metadata is ALWAYS an object
        if (metadata !== undefined && metadata !== null) {
            if (typeof metadata !== 'object' || Array.isArray(metadata)) {
                // We warn the developer if they break the contract, but still wrap it so it doesn't crash
                console.warn(`[LOGGER WARNING] Metadata for "${message}" must be an object. Wrapping raw value.`);
                metadata = { rawValue: metadata };
            }
        }

        return {
            timestamp: Date.now(),
            level,
            category,
            message,
            metadata: metadata || {}
        };
    }

    _dispatch(event) {
        if (!this._shouldLog(event.level, event.category)) return;
        for (const adapter of this.adapters) {
            try {
                adapter.logEvent(event);
            } catch (e) {
                console.error('Logger adapter failed:', e);
            }
        }
    }

    debug(category, message, metadata = {}) { this._dispatch(this._createEvent(LEVELS.DEBUG, category, message, metadata)); }
    info(category, message, metadata = {}) { this._dispatch(this._createEvent(LEVELS.INFO, category, message, metadata)); }
    warn(category, message, metadata = {}) { this._dispatch(this._createEvent(LEVELS.WARN, category, message, metadata)); }
    error(category, message, metadata = {}) { this._dispatch(this._createEvent(LEVELS.ERROR, category, message, metadata)); }
    success(category, message, metadata = {}) { this._dispatch(this._createEvent(LEVELS.SUCCESS, category, message, metadata)); }

    /**
     * Measures the execution time of a function.
     * Supports both synchronous and asynchronous functions.
     * @param {string} category - Log category
     * @param {string} label - The operation being measured
     * @param {Function} fn - The function to execute
     * @returns {*} The result of the function
     */
    measure(category, label, fn) {
        const start = performance.now();
        try {
            const result = fn();
            
            // Handle Promises for async functions
            if (result && typeof result.then === 'function') {
                return result.then(res => {
                    const duration = performance.now() - start;
                    this.debug(category, `⏱️ Measured: ${label}`, { duration });
                    return res;
                }).catch(error => {
                    const duration = performance.now() - start;
                    this.error(category, `❌ Measurement failed: ${label}`, { duration, error: error.message });
                    throw error;
                });
            }
            
            // Synchronous completion
            const duration = performance.now() - start;
            this.debug(category, `⏱️ Measured: ${label}`, { duration });
            return result;
        } catch (error) {
            const duration = performance.now() - start;
            this.error(category, `❌ Measurement failed: ${label}`, { duration, error: error.message });
            throw error;
        }
    }
}

// Export a singleton instance
export const logger = new Logger();
