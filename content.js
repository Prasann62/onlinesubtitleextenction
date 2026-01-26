/**
 * content.js
 * Main entry point for the Brave Mini Player extension.
 * Responsible for video detection and UI orchestration.
 */

class BraveMiniPlayer {
    constructor() {
        this.video = null;
        this.observer = null;
        this.uiHost = null;
        this.shadow = null;

        this.init();
    }

    init() {
        console.log('[BraveMiniPlayer] Initializing...');
        this.detectVideos();
        this.setupMutationObserver();
        this.createUI();
        this.setupMessaging();
    }

    detectVideos() {
        // Find the "best" video on the page
        const videos = Array.from(document.querySelectorAll('video'));
        if (videos.length === 0) return;

        // Prioritize currently playing video
        const playing = videos.find(v => !v.paused);
        if (playing) {
            this.video = playing;
        } else {
            // Otherwise choose the largest one
            this.video = videos.sort((a, b) => {
                const rectA = a.getBoundingClientRect();
                const rectB = b.getBoundingClientRect();
                return (rectB.width * rectB.height) - (rectA.width * rectA.height);
            })[0];
        }

        if (this.video) {
            console.log('[BraveMiniPlayer] Video detected:', this.video);
        }
    }

    setupMutationObserver() {
        this.observer = new MutationObserver(() => {
            if (!this.video || !document.contains(this.video)) {
                this.detectVideos();
            }
        });
        this.observer.observe(document.body, { childList: true, subtree: true });
    }

    createUI() {
        if (document.getElementById('brave-player-root')) return;

        this.uiHost = document.createElement('div');
        this.uiHost.id = 'brave-player-root';
        this.shadow = this.uiHost.attachShadow({ mode: 'open' });

        // Load styles
        const style = document.createElement('style');
        fetch(chrome.runtime.getURL('ui.css'))
            .then(r => r.text())
            .then(css => {
                style.textContent = css;
                this.shadow.appendChild(style);

                // Once styles are loaded, let the MiniPlayer know it can build its UI
                if (window.MiniPlayerInstance) {
                    window.MiniPlayerInstance.buildUI(this.shadow);
                }
            });

        document.documentElement.appendChild(this.uiHost);
    }

    setupMessaging() {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.action === 'TOGGLE_MINI_PLAYER') {
                if (window.MiniPlayerInstance) {
                    window.MiniPlayerInstance.toggle();
                    sendResponse({ success: true });
                }
            } else if (message.action === 'TOGGLE_PIP') {
                if (window.PiPControllerInstance) {
                    window.PiPControllerInstance.toggle(this.video);
                    sendResponse({ success: true });
                }
            }
        });
    }
}

// Global initialization
window.BraveMiniPlayerInstance = new BraveMiniPlayer();
