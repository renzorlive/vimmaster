// VIM Master Game - Retention and Learning Flow State

const STORAGE_KEY = 'vimMasterRetentionState';

let _state = {
    streakDays: 0,
    lastActiveDay: null,
    completedAllLessons: false,
    resumeSnapshot: null,
    welcomeBack: false
};

let _lastSnapshotKey = '';
let _activeLessonKey = '';

let _session = {
    startedAt: Date.now(),
    lessonStartedAt: Date.now(),
    lessonName: '',
    focusCommand: '',
    currentLevel: 0,
    mistakes: 0,
    lessonsCompleted: 0,
    xpEarned: 0,
    comboPeak: 0
};

const pad = (value) => String(value).padStart(2, '0');

function getLocalDayKey(date = new Date()) {
    return [
        date.getFullYear(),
        pad(date.getMonth() + 1),
        pad(date.getDate())
    ].join('-');
}

function dayDiff(a, b) {
    const start = new Date(`${a}T00:00:00`);
    const end = new Date(`${b}T00:00:00`);
    return Math.round((end - start) / 86400000);
}

function safeParse(raw) {
    try {
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function loadState() {
    const parsed = safeParse(localStorage.getItem(STORAGE_KEY));
    if (!parsed || typeof parsed !== 'object') {
        return { ..._state };
    }

    return {
        streakDays: Number.isFinite(parsed.streakDays) ? parsed.streakDays : 0,
        lastActiveDay: typeof parsed.lastActiveDay === 'string' ? parsed.lastActiveDay : null,
        completedAllLessons: Boolean(parsed.completedAllLessons),
        resumeSnapshot: parsed.resumeSnapshot && typeof parsed.resumeSnapshot === 'object' ? parsed.resumeSnapshot : null,
        welcomeBack: false
    };
}

function persistState() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(_state));
    } catch {
        // UI-only state; failure here is non-fatal.
    }
}

function cloneSnapshot(progressSummary, lessonName, focusCommand) {
    return {
        savedAt: Date.now(),
        level: progressSummary.currentLevel,
        totalLevels: progressSummary.totalLevels,
        lessonName,
        focusCommand,
        badgesEarned: progressSummary.badgesEarned,
        commandsPracticed: progressSummary.commandsPracticed,
        challengePoints: progressSummary.challengePoints
    };
}

function snapshotKey(snapshot) {
    return [
        snapshot?.level ?? '',
        snapshot?.lessonName ?? '',
        snapshot?.focusCommand ?? '',
        snapshot?.badgesEarned ?? '',
        snapshot?.commandsPracticed ?? '',
        snapshot?.challengePoints ?? ''
    ].join('|');
}

export function initializeRetentionState(progressSummary = {}, lessonName = '', focusCommand = '') {
    const loaded = loadState();
    const today = getLocalDayKey();

    if (loaded.lastActiveDay) {
        const diff = dayDiff(loaded.lastActiveDay, today);
        if (diff === 0) {
            loaded.welcomeBack = false;
        } else if (diff === 1) {
            loaded.streakDays = Math.max(1, loaded.streakDays) + 1;
            loaded.welcomeBack = true;
        } else if (diff > 1) {
            loaded.streakDays = 1;
            loaded.welcomeBack = true;
        }
    } else if ((progressSummary.currentLevel ?? 0) > 0 || (progressSummary.badgesEarned ?? 0) > 0) {
        loaded.streakDays = 1;
    }

    loaded.lastActiveDay = today;
    loaded.completedAllLessons = loaded.completedAllLessons || false;
    loaded.resumeSnapshot = loaded.resumeSnapshot || cloneSnapshot(progressSummary, lessonName, focusCommand);
    _lastSnapshotKey = snapshotKey(loaded.resumeSnapshot);
    _state = loaded;
    _session.startedAt = Date.now();
    _session.lessonStartedAt = Date.now();
    _session.lessonName = lessonName;
    _session.focusCommand = focusCommand;
    _session.currentLevel = progressSummary.currentLevel ?? 0;
    _session.mistakes = 0;
    _session.lessonsCompleted = 0;
    _session.xpEarned = 0;
    _session.comboPeak = 0;
    _activeLessonKey = '';
    persistState();
    return getRetentionViewModel(progressSummary, lessonName, focusCommand);
}

export function resetRetentionState() {
    _state = {
        streakDays: 0,
        lastActiveDay: null,
        completedAllLessons: false,
        resumeSnapshot: null,
        welcomeBack: false
    };
    _lastSnapshotKey = '';
    _session = {
        startedAt: Date.now(),
        lessonStartedAt: Date.now(),
        lessonName: '',
        focusCommand: '',
        currentLevel: 0,
        mistakes: 0,
        lessonsCompleted: 0,
        xpEarned: 0,
        comboPeak: 0
    };
    _activeLessonKey = '';
}

export function noteLessonStart(currentLevel, lessonName, focusCommand = '') {
    const nextKey = `${currentLevel}|${lessonName || ''}|${focusCommand || ''}`;
    if (nextKey === _activeLessonKey) return;

    _activeLessonKey = nextKey;
    _session.lessonStartedAt = Date.now();
    _session.lessonName = lessonName || _session.lessonName;
    _session.focusCommand = focusCommand || _session.focusCommand;
    _session.currentLevel = currentLevel;
}

export function noteMistake() {
    _session.mistakes += 1;
}

export function noteLessonComplete({ earnedXp = 0, combo = 0, progressSummary = {}, lessonName = '', focusCommand = '', finalLevel = false } = {}) {
    _session.lessonsCompleted += 1;
    _session.xpEarned += earnedXp;
    _session.comboPeak = Math.max(_session.comboPeak, combo);
    _state.completedAllLessons = _state.completedAllLessons || finalLevel;
    _state.resumeSnapshot = cloneSnapshot(progressSummary, lessonName || _session.lessonName, focusCommand || _session.focusCommand);
    persistState();
}

export function captureResumeSnapshot(progressSummary, lessonName, focusCommand) {
    const nextSnapshot = cloneSnapshot(progressSummary, lessonName, focusCommand);
    const key = snapshotKey(nextSnapshot);
    if (key === _lastSnapshotKey) return;

    _lastSnapshotKey = key;
    _state.resumeSnapshot = nextSnapshot;
    persistState();
}

export function markSessionExit(progressSummary, lessonName, focusCommand) {
    if (progressSummary) {
        _state.resumeSnapshot = cloneSnapshot(progressSummary, lessonName, focusCommand);
        _lastSnapshotKey = snapshotKey(_state.resumeSnapshot);
    }
    persistState();
}

export function recordCompletionState(finalLevel) {
    _state.completedAllLessons = Boolean(finalLevel);
    persistState();
}

export function getSessionMetrics() {
    const durationMs = Math.max(0, Date.now() - _session.startedAt);
    const lessonDurationMs = Math.max(0, Date.now() - _session.lessonStartedAt);
    const attempts = _session.lessonsCompleted + _session.mistakes;
    const accuracy = attempts > 0 ? Math.round((_session.lessonsCompleted / attempts) * 100) : 100;

    return {
        sessionMinutes: Math.max(1, Math.round(durationMs / 60000)),
        lessonSeconds: Math.max(1, Math.round(lessonDurationMs / 1000)),
        lessonsCompleted: _session.lessonsCompleted,
        mistakes: _session.mistakes,
        accuracy,
        xpEarned: _session.xpEarned,
        comboPeak: _session.comboPeak
    };
}

export function getRetentionViewModel(progressSummary = {}, lessonName = '', focusCommand = '') {
    const metrics = getSessionMetrics();
    const totalLevels = progressSummary.totalLevels || 1;
    const currentLevel = progressSummary.currentLevel ?? 0;
    const hasProgress = (progressSummary.currentLevel ?? 0) > 0 || (progressSummary.badgesEarned ?? 0) > 0 || (progressSummary.commandsPracticed ?? 0) > 0;
    const progressPercent = Math.max(0, Math.min(100, ((currentLevel + 1) / totalLevels) * 100));
    const resumeSnapshot = _state.resumeSnapshot;

    return {
        welcomeBack: _state.welcomeBack,
        streakDays: _state.streakDays,
        completedAllLessons: _state.completedAllLessons,
        hasProgress,
        continueLearning: hasProgress && !_state.completedAllLessons ? {
            lessonLabel: `Lesson ${currentLevel + 1} / ${totalLevels}`,
            progressPercent,
            lessonName: lessonName || resumeSnapshot?.lessonName || 'Continue learning',
            focusCommand: focusCommand || resumeSnapshot?.focusCommand || '',
            estimatedMinutes: Math.max(1, Math.round((progressSummary.currentLevel ?? 0) + 1))
        } : null,
        dashboard: metrics,
        resumeSnapshot,
        emptyState: !hasProgress ? {
            title: 'Ready to learn Vim?',
            description: `${totalLevels} interactive lessons`,
            estimate: '~30 minutes',
            cta: 'Start'
        } : (_state.completedAllLessons ? {
            title: 'Congratulations!',
            description: "You've completed all lessons.",
            estimate: 'Practice Random',
            cta: 'Practice Random'
        } : null),
        lastSession: resumeSnapshot ? {
            lessonLabel: `Lesson ${resumeSnapshot.level + 1} / ${resumeSnapshot.totalLevels}`,
            lessonName: resumeSnapshot.lessonName,
            focusCommand: resumeSnapshot.focusCommand,
            savedAt: resumeSnapshot.savedAt
        } : null,
        whyThisMatters: getLessonWhy(lessonName, focusCommand)
    };
}

function getLessonWhy(lessonName, focusCommand) {
    const normalized = String(focusCommand || '').trim();
    const reasons = {
        ':q': 'Real-world usage: quit Vim quickly when you are done.',
        ':wq': 'Real-world usage: save and exit in one step.',
        'dd': 'Real-world usage: remove the current line without reaching for the mouse.',
        'dw': 'Real-world usage: delete a word in a single motion.',
        'x': 'Real-world usage: remove one character with surgical precision.',
        'cw': 'Real-world usage: change a word and keep your hands on the keyboard.',
        'ciw': 'Real-world usage: edit the word under the cursor without leaving insert flow.',
        'diw': 'Real-world usage: delete a word from anywhere inside it.',
        'j': 'Real-world usage: move down one line instantly.',
        'k': 'Real-world usage: move up one line without leaving home row.',
        'h': 'Real-world usage: move left without using arrow keys.',
        'l': 'Real-world usage: move right without leaving the keyboard cluster.',
        '/': 'Real-world usage: search text fast when you know what you need.',
        '?': 'Real-world usage: search backward through the buffer.'
    };

    if (reasons[normalized]) {
        return reasons[normalized];
    }

    if (lessonName) {
        return `Real-world usage: ${lessonName.toLowerCase()} is a core Vim habit worth memorizing.`;
    }

    return '';
}
