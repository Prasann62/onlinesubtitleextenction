// ==========================================
// CENTRALIZED CONFIGURATION
// ==========================================

const CONFIG = {
    // Player Size Configurations
    SIZES: {
        small: { width: 300, height: 169 },
        medium: { width: 380, height: 175 },
        large: { width: 500, height: 281 }
    },

    // Keyboard Shortcuts Reference
    SHORTCUTS: {
        togglePip: 'Alt+P',
        closePip: 'Alt+X',
        playPause: 'Space',
        mute: 'M',
        seekBackward: '←',
        seekForward: '→',
        volumeUp: 'Alt+↑',
        volumeDown: 'Alt+↓',
        speedUp: 'Shift+>',
        speedDown: 'Shift+<',
        resize: 'Alt+±',
        move: 'Alt+Arrows',
        help: 'H'
    },

    // UI Configuration
    TOAST_DURATION: 2000,
    TOAST_FADE_DURATION: 400,
    DEBOUNCE_DELAY: 300,
    MUTATION_OBSERVER_DELAY: 300,

    // Playback Speeds
    PLAYBACK_SPEEDS: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],

    // Volume Settings
    VOLUME_STEP: 0.1,
    DEFAULT_VOLUME: 1,

    // Video Detection
    MIN_VIDEO_WIDTH: 200,  // Ignore thumbnail videos
    MIN_VIDEO_HEIGHT: 150,

    // PiP Settings
    PIP_Z_INDEX: 2147483647,
    FLOATING_PADDING: 20,
    DEFAULT_POSITION: 'bottom-right', // bottom-right, bottom-left, top-right, top-left

    // Platform Detection
    PLATFORMS: {
        YOUTUBE: 'youtube',
        NETFLIX: 'netflix',
        PRIME: 'prime',
        TWITCH: 'twitch',
        GENERIC: 'generic'
    },

    // Feature Flags
    FEATURES: {
        AUTO_PIP_ON_TAB_SWITCH: false,
        DOCUMENT_PIP_PREFERRED: true,
        DRAGGABLE_FLOATING: true,
        SHOW_PROGRESS_BAR: true,
        SHOW_VOLUME_CONTROL: true,
        SHOW_SPEED_CONTROL: true
    },

    // Styling
    COLORS: {
        PRIMARY: '#6366f1',
        SECONDARY: '#c5a059',
        SUCCESS: '#10b981',
        ERROR: '#ef4444',
        WARNING: '#f59e0b',
        INFO: '#3b82f6'
    }
};

// Make config immutable
Object.freeze(CONFIG);
Object.freeze(CONFIG.SIZES);
Object.freeze(CONFIG.SHORTCUTS);
Object.freeze(CONFIG.PLAYBACK_SPEEDS);
Object.freeze(CONFIG.PLATFORMS);
Object.freeze(CONFIG.FEATURES);
Object.freeze(CONFIG.COLORS);
