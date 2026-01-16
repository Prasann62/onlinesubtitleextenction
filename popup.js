/**
 * popup.js - Enhanced v2.1
 * Premium Subtitle Search with AI & YIFY integration
 */

const elements = {
    findBtn: document.getElementById('find-btn'),
    stopAiBtn: document.getElementById('stop-ai-btn'),
    miniplayBtn: document.getElementById('miniplay-btn'),
    status: document.getElementById('status'),
    videoInfo: document.getElementById('video-info'),
    manualSearchInput: document.getElementById('manual-search-input'),
    modeSearch: document.getElementById('mode-search'),
    modeAi: document.getElementById('mode-ai'),
    aiSettings: document.getElementById('ai-settings'),
    searchSettings: document.getElementById('search-settings'),
    languageSelect: document.getElementById('language-select'),
    syncMinus: document.getElementById('sync-minus'),
    syncPlus: document.getElementById('sync-plus'),
    syncValue: document.getElementById('sync-value'),
    recentSearches: document.getElementById('recent-searches'),
    recentList: document.getElementById('recent-list'),
    clearHistory: document.getElementById('clear-history'),
    toastContainer: document.getElementById('toast-container'),
    btnLoader: document.querySelector('.btn-loader'),
    btnText: document.querySelector('.btn-text'),
    btnIcon: document.querySelector('.btn-icon')
};

let currentMeta = null;
let currentMode = 'search';
let currentFrameId = 0;
let syncOffset = 0;
let recentHistory = [];

// ========== INITIALIZATION ==========
async function init() {
    await loadSettings();
    loadRecentSearches();
    updateStatus('Scanning for video...', 'loading');

    let attempts = 0;
    const maxAttempts = 5;

    const interval = setInterval(async () => {
        attempts++;
        const found = await checkVideo();
        if (found) {
            clearInterval(interval);
            updateStatus('Ready to caption', 'ready');
        } else if (attempts >= maxAttempts) {
            clearInterval(interval);
            updateStatus('No video detected on this page', 'error');
        }
    }, 800);
}

async function loadSettings() {
    try {
        const result = await chrome.storage.local.get(['selectedLanguage', 'syncOffset']);
        if (result.selectedLanguage) {
            elements.languageSelect.value = result.selectedLanguage;
        }
        if (result.syncOffset) {
            syncOffset = result.syncOffset;
            updateSyncDisplay();
        }
    } catch (e) {
        console.log('Settings load error:', e);
    }
}

async function saveSettings() {
    try {
        await chrome.storage.local.set({
            selectedLanguage: elements.languageSelect.value,
            syncOffset: syncOffset
        });
    } catch (e) {
        console.log('Settings save error:', e);
    }
}

// ========== VIDEO DETECTION ==========
async function checkVideo() {
    return new Promise((resolve) => {
        chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
            if (!tabs[0] || !tabs[0].id) return resolve(false);
            const tabId = tabs[0].id;

            try {
                const results = await chrome.scripting.executeScript({
                    target: { tabId: tabId, allFrames: true },
                    func: () => {
                        const injector = window._aiSubtitleInjector;
                        return injector && injector.findVideo() ? injector.getVideoMetadata() : null;
                    }
                });

                const match = results.find(r => r.result !== null);

                if (match && match.result) {
                    currentMeta = match.result;
                    currentFrameId = match.frameId;

                    elements.videoInfo.classList.remove('hidden');
                    if (!elements.manualSearchInput.value) {
                        elements.manualSearchInput.value = match.result.title || '';
                    }
                    elements.findBtn.disabled = false;
                    resolve(true);
                } else {
                    resolve(false);
                }
            } catch (e) {
                console.error("Frame check failed", e);
                resolve(false);
            }
        });
    });
}

// ========== STATUS & TOAST ==========
function updateStatus(text, type = 'ready') {
    const statusBar = elements.status;
    const statusIcon = statusBar.querySelector('.status-icon');
    const statusText = statusBar.querySelector('.status-text');

    statusBar.className = 'status-bar';
    statusText.innerText = text;

    const icons = {
        ready: '✨',
        loading: '⏳',
        success: '✅',
        error: '❌'
    };

    statusIcon.innerText = icons[type] || '✨';

    if (type !== 'ready') {
        statusBar.classList.add(type);
    }
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${type === 'success' ? '✅' : '❌'}</span>
        <span class="toast-message">${message}</span>
    `;

    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'toast-out 0.3s ease-out forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ========== LOADING STATE ==========
function setLoading(isLoading) {
    if (isLoading) {
        elements.findBtn.disabled = true;
        elements.btnLoader.classList.remove('hidden');
        elements.btnText.style.opacity = '0';
        elements.btnIcon.style.opacity = '0';
    } else {
        elements.findBtn.disabled = false;
        elements.btnLoader.classList.add('hidden');
        elements.btnText.style.opacity = '1';
        elements.btnIcon.style.opacity = '1';
    }
}

// ========== RECENT SEARCHES ==========
function loadRecentSearches() {
    chrome.storage.local.get(['recentSearches'], (result) => {
        recentHistory = result.recentSearches || [];
        renderRecentSearches();
    });
}

function saveRecentSearch(query) {
    if (!query) return;

    // Remove duplicate if exists
    recentHistory = recentHistory.filter(item => item.query !== query);

    // Add to beginning
    recentHistory.unshift({
        query: query,
        timestamp: Date.now()
    });

    // Keep only last 5
    recentHistory = recentHistory.slice(0, 5);

    chrome.storage.local.set({ recentSearches: recentHistory });
    renderRecentSearches();
}

function renderRecentSearches() {
    if (recentHistory.length === 0) {
        elements.recentSearches.classList.add('hidden');
        return;
    }

    elements.recentSearches.classList.remove('hidden');
    elements.recentList.innerHTML = recentHistory.map(item => {
        const timeAgo = getTimeAgo(item.timestamp);
        return `
            <div class="recent-item" data-query="${escapeHtml(item.query)}">
                <span class="recent-item-icon">🎬</span>
                <span class="recent-item-text">${escapeHtml(item.query)}</span>
                <span class="recent-item-time">${timeAgo}</span>
            </div>
        `;
    }).join('');

    // Add click handlers
    elements.recentList.querySelectorAll('.recent-item').forEach(item => {
        item.addEventListener('click', () => {
            elements.manualSearchInput.value = item.dataset.query;
            elements.manualSearchInput.focus();
        });
    });
}

function getTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ========== SYNC CONTROLS ==========
function updateSyncDisplay() {
    const sign = syncOffset >= 0 ? '+' : '';
    elements.syncValue.textContent = `${sign}${syncOffset.toFixed(1)}s`;
}

function adjustSync(delta) {
    syncOffset = Math.round((syncOffset + delta) * 10) / 10; // Avoid float errors
    syncOffset = Math.max(-30, Math.min(30, syncOffset)); // Clamp
    updateSyncDisplay();
    saveSettings();

    // Send to content script
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
        if (tab) {
            chrome.tabs.sendMessage(tab.id, {
                action: 'SET_SYNC_OFFSET',
                offset: syncOffset
            }, { frameId: currentFrameId });
        }
    });
}

// ========== MODE SWITCHING ==========
elements.modeSearch.addEventListener('click', () => {
    currentMode = 'search';
    elements.modeSearch.classList.add('active');
    elements.modeAi.classList.remove('active');
    elements.aiSettings.classList.add('hidden');
    elements.searchSettings.classList.remove('hidden');
    elements.btnText.textContent = 'Search Subtitles';
    elements.btnIcon.textContent = '🔍';
    elements.findBtn.classList.remove('hidden');
    elements.stopAiBtn.classList.add('hidden');
});

elements.modeAi.addEventListener('click', () => {
    currentMode = 'ai';
    elements.modeAi.classList.add('active');
    elements.modeSearch.classList.remove('active');
    elements.aiSettings.classList.remove('hidden');
    elements.searchSettings.classList.add('hidden');
    elements.btnText.textContent = 'Start AI Listener';
    elements.btnIcon.textContent = '🎙️';
});

// ========== MAIN ACTION ==========
elements.findBtn.addEventListener('click', async () => {
    const searchQuery = elements.manualSearchInput.value.trim();
    if (!currentMeta && !searchQuery) {
        showToast('Please enter a movie title', 'error');
        return;
    }

    if (currentMode === 'search') {
        setLoading(true);
        updateStatus('Searching YIFY database...', 'loading');

        const query = searchQuery || currentMeta?.title;
        saveRecentSearch(query);

        chrome.runtime.sendMessage({
            action: 'SMART_PROCESS',
            params: {
                title: query,
                language: elements.languageSelect.value
            }
        }, (response) => {
            setLoading(false);

            if (chrome.runtime.lastError) {
                updateStatus('Connection error', 'error');
                showToast(chrome.runtime.lastError.message, 'error');
                return;
            }

            if (!response || !response.success) {
                updateStatus('No subtitles found', 'error');
                showToast(response?.error || 'No subtitles available', 'error');
                return;
            }

            updateStatus('Subtitles loaded successfully!', 'success');
            showToast(`Subtitles loaded for "${query}"`, 'success');

            chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
                chrome.tabs.sendMessage(tab.id, {
                    action: 'INJECT_SUBTITLE',
                    content: response.content,
                    syncOffset: syncOffset
                }, { frameId: currentFrameId });
            });
        });

    } else {
        // AI Mode
        elements.findBtn.classList.add('hidden');
        elements.stopAiBtn.classList.remove('hidden');
        updateStatus('Loading AI model... (first run may take time)', 'loading');

        chrome.runtime.sendMessage({ action: 'START_AI_MODE' }, (response) => {
            if (response && response.success) {
                updateStatus('AI is listening...', 'success');
                showToast('AI transcription active', 'success');
            } else {
                elements.stopAiBtn.classList.add('hidden');
                elements.findBtn.classList.remove('hidden');
                updateStatus('AI initialization failed', 'error');
                showToast(response?.error || 'Failed to start AI', 'error');
            }
        });
    }
});

// Stop AI
elements.stopAiBtn.addEventListener('click', () => {
    elements.stopAiBtn.classList.add('hidden');
    elements.findBtn.classList.remove('hidden');
    updateStatus('AI stopped', 'ready');
    showToast('AI transcription stopped', 'success');
    chrome.runtime.sendMessage({ action: 'STOP_AI_MODE' });
});

// Miniplay
elements.miniplayBtn.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
        if (tab) {
            chrome.tabs.sendMessage(tab.id, { action: 'TOGGLE_PIP' }, { frameId: currentFrameId });
        }
    });
});

// Sync Controls
elements.syncMinus.addEventListener('click', () => adjustSync(-0.5));
elements.syncPlus.addEventListener('click', () => adjustSync(0.5));

// Clear History
elements.clearHistory.addEventListener('click', () => {
    recentHistory = [];
    chrome.storage.local.set({ recentSearches: [] });
    renderRecentSearches();
    showToast('History cleared', 'success');
});

// Language Change
elements.languageSelect.addEventListener('change', saveSettings);

// Keyboard shortcuts for input
elements.manualSearchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        elements.findBtn.click();
    }
});

// Initialize
init();
