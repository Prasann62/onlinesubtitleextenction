/**
 * content.js - Enhanced v2.1
 * Video Detection, Subtitle Injection, Draggable Overlay & Controls
 */

class SubtitleInjector {
    constructor() {
        this.video = null;
        this.overlay = null;
        this.cues = [];
        this.isListening = false;
        this.syncOffset = 0;
        this.fontSize = 24;
        this.position = { bottom: 80, dragging: false };

        // Bind logic
        this.onTimeUpdate = this.onTimeUpdateLogic.bind(this);
        this.onDrag = this.handleDrag.bind(this);
        this.onDragEnd = this.handleDragEnd.bind(this);
    }

    findVideo() {
        this.video = this.searchForVideo(document);
        if (this.video) {
            try {
                if (!this.video.crossOrigin) this.video.crossOrigin = "anonymous";
            } catch (e) {
                console.log("Cannot set crossOrigin on video");
            }
            if (!this.overlay) this.createOverlay();
        }
        return this.video;
    }

    searchForVideo(root) {
        let video = root.querySelector('video');
        if (video) return video;

        const allElements = root.querySelectorAll('*');
        for (const el of allElements) {
            if (el.shadowRoot) {
                video = this.searchForVideo(el.shadowRoot);
                if (video) return video;
            }
        }

        const iframes = root.querySelectorAll('iframe');
        for (const iframe of iframes) {
            try {
                if (iframe.contentDocument) {
                    video = this.searchForVideo(iframe.contentDocument);
                    if (video) return video;
                }
            } catch (e) { }
        }
        return null;
    }

    createOverlay() {
        if (document.getElementById('ai-subtitle-overlay')) return;

        this.overlay = document.createElement('div');
        this.overlay.id = 'ai-subtitle-overlay';

        // Inner container
        const container = document.createElement('div');
        container.className = 'subtitle-container';

        // Text element
        const textSpan = document.createElement('span');
        textSpan.id = 'ai-subtitle-text';
        container.appendChild(textSpan);

        // Controls bar (hidden by default, shown on hover)
        const controls = document.createElement('div');
        controls.className = 'subtitle-controls';
        controls.innerHTML = `
            <button class="sub-ctrl-btn" id="sub-font-minus" title="Decrease font size">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
            </button>
            <span class="sub-font-size" id="sub-font-display">${this.fontSize}px</span>
            <button class="sub-ctrl-btn" id="sub-font-plus" title="Increase font size">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
            </button>
            <div class="sub-divider"></div>
            <button class="sub-ctrl-btn" id="sub-sync-minus" title="Subtitle earlier">
                ⏪
            </button>
            <span class="sub-sync-value" id="sub-sync-display">0.0s</span>
            <button class="sub-ctrl-btn" id="sub-sync-plus" title="Subtitle later">
                ⏩
            </button>
        `;

        this.overlay.appendChild(container);
        this.overlay.appendChild(controls);
        document.body.appendChild(this.overlay);

        // Add control event listeners
        this.setupControls();

        // Make draggable
        this.makeDraggable();

        // Position updates
        setInterval(() => this.repositionOverlay(), 500);
    }

    setupControls() {
        const fontMinus = document.getElementById('sub-font-minus');
        const fontPlus = document.getElementById('sub-font-plus');
        const syncMinus = document.getElementById('sub-sync-minus');
        const syncPlus = document.getElementById('sub-sync-plus');

        fontMinus?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.adjustFontSize(-2);
        });

        fontPlus?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.adjustFontSize(2);
        });

        syncMinus?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.adjustSync(-0.5);
        });

        syncPlus?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.adjustSync(0.5);
        });

        // Keyboard shortcuts when video is focused
        document.addEventListener('keydown', (e) => {
            if (!this.video) return;

            // Only if not in an input field
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            switch (e.key) {
                case 'ArrowUp':
                    if (e.shiftKey) {
                        e.preventDefault();
                        this.adjustSync(0.5);
                    }
                    break;
                case 'ArrowDown':
                    if (e.shiftKey) {
                        e.preventDefault();
                        this.adjustSync(-0.5);
                    }
                    break;
                case '+':
                case '=':
                    if (e.shiftKey) {
                        e.preventDefault();
                        this.adjustFontSize(2);
                    }
                    break;
                case '-':
                case '_':
                    if (e.shiftKey) {
                        e.preventDefault();
                        this.adjustFontSize(-2);
                    }
                    break;
            }
        });
    }

    adjustFontSize(delta) {
        this.fontSize = Math.max(14, Math.min(48, this.fontSize + delta));
        const textEl = document.getElementById('ai-subtitle-text');
        const display = document.getElementById('sub-font-display');

        if (textEl) textEl.style.fontSize = `${this.fontSize}px`;
        if (display) display.textContent = `${this.fontSize}px`;

        this.showTooltip(`Font: ${this.fontSize}px`);
    }

    adjustSync(delta) {
        this.syncOffset = Math.round((this.syncOffset + delta) * 10) / 10;
        this.syncOffset = Math.max(-30, Math.min(30, this.syncOffset));

        const display = document.getElementById('sub-sync-display');
        const sign = this.syncOffset >= 0 ? '+' : '';
        if (display) display.textContent = `${sign}${this.syncOffset.toFixed(1)}s`;

        // Re-sync cues
        this.resyncCues(delta);

        this.showTooltip(`Sync: ${sign}${this.syncOffset.toFixed(1)}s`);
    }

    setSync(offset) {
        const delta = offset - this.syncOffset;
        this.syncOffset = offset;

        const display = document.getElementById('sub-sync-display');
        const sign = this.syncOffset >= 0 ? '+' : '';
        if (display) display.textContent = `${sign}${this.syncOffset.toFixed(1)}s`;

        this.resyncCues(delta);
    }

    resyncCues(delta) {
        this.cues = this.cues.map(cue => ({
            ...cue,
            start: cue.start + delta,
            end: cue.end + delta
        }));
    }

    showTooltip(text) {
        let tooltip = document.getElementById('subtitle-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'subtitle-tooltip';
            document.body.appendChild(tooltip);
        }

        tooltip.textContent = text;
        tooltip.classList.add('visible');

        clearTimeout(tooltip._hideTimer);
        tooltip._hideTimer = setTimeout(() => {
            tooltip.classList.remove('visible');
        }, 1500);
    }

    makeDraggable() {
        const overlay = this.overlay;
        let startY = 0;
        let startBottom = 0;

        overlay.addEventListener('mousedown', (e) => {
            // Don't drag if clicking controls
            if (e.target.closest('.subtitle-controls')) return;

            this.position.dragging = true;
            startY = e.clientY;
            startBottom = this.position.bottom;

            overlay.style.cursor = 'grabbing';
            overlay.classList.add('dragging');

            document.addEventListener('mousemove', this.onDrag);
            document.addEventListener('mouseup', this.onDragEnd);
        });
    }

    handleDrag(e) {
        if (!this.position.dragging) return;

        const deltaY = this.startY - e.clientY;
        this.position.bottom = Math.max(20, Math.min(window.innerHeight - 100, this.startBottom + deltaY));

        if (this.overlay) {
            this.overlay.style.bottom = `${this.position.bottom}px`;
        }
    }

    handleDragEnd() {
        this.position.dragging = false;
        if (this.overlay) {
            this.overlay.style.cursor = 'grab';
            this.overlay.classList.remove('dragging');
        }

        document.removeEventListener('mousemove', this.onDrag);
        document.removeEventListener('mouseup', this.onDragEnd);
    }

    repositionOverlay() {
        if (!this.video) this.findVideo();
        if (!this.video) return;

        const overlayEl = document.getElementById('ai-subtitle-overlay');
        if (!overlayEl) return;

        const rect = this.video.getBoundingClientRect();

        if (rect.width === 0 || rect.height === 0) {
            overlayEl.style.display = 'none';
            return;
        }

        overlayEl.style.display = 'flex';

        // Only reposition horizontally, keep vertical where user dragged
        overlayEl.style.left = `${rect.left + (rect.width / 2)}px`;
        overlayEl.style.transform = 'translateX(-50%)';
        overlayEl.style.maxWidth = `${rect.width * 0.85}px`;
    }

    showTempMessage(text, isPersistent = false) {
        const textEl = document.getElementById('ai-subtitle-text');
        if (textEl) {
            textEl.innerHTML = '';

            if (isPersistent && text.includes('AI Mode')) {
                const indicator = document.createElement('span');
                indicator.className = 'status-indicator';
                textEl.appendChild(indicator);
            }

            const messageText = document.createTextNode(text);
            textEl.appendChild(messageText);

            textEl.style.display = 'inline-block';
            textEl.style.opacity = '1';

            if (!isPersistent) {
                setTimeout(() => {
                    if (textEl.innerText === text) {
                        textEl.style.opacity = '0';
                        setTimeout(() => {
                            if (textEl.style.opacity === '0') textEl.style.display = 'none';
                        }, 300);
                    }
                }, 4000);
            }
        }
    }

    onTimeUpdateLogic() {
        if (!this.video) return;
        const time = this.video.currentTime;
        const currentCue = this.cues.find(c => time >= c.start && time <= c.end);

        const textEl = document.getElementById('ai-subtitle-text');
        if (!textEl) return;

        if (currentCue) {
            if (textEl.innerText !== currentCue.text) {
                // Fade transition
                textEl.style.opacity = '0';
                setTimeout(() => {
                    textEl.innerText = currentCue.text;
                    textEl.style.display = 'inline-block';
                    textEl.style.opacity = '1';
                }, 100);
            }
        } else {
            textEl.style.display = 'none';
        }
    }

    injectSubtitle(content, syncOffsetFromPopup = 0) {
        if (!this.video) this.findVideo();
        if (!this.video) return;

        // Set sync offset if provided
        if (syncOffsetFromPopup !== 0) {
            this.setSync(syncOffsetFromPopup);
        }

        console.log(`[Subtitle] Injecting ${content.length} chars`);
        this.cues = this.parseSubtitles(content);

        const textEl = document.getElementById('ai-subtitle-text');
        if (textEl) textEl.style.opacity = '1';

        this.video.removeEventListener('timeupdate', this.onTimeUpdate);
        this.video.addEventListener('timeupdate', this.onTimeUpdate);

        this.showTempMessage('✅ Subtitles loaded!');
    }

    parseSubtitles(content) {
        const cues = [];
        const cleanContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        const blocks = cleanContent.split(/\n\n+/);
        const timeRegex = /((?:\d{2}:)?\d{2}:\d{2}[.,]\d{3}) --> ((?:\d{2}:)?\d{2}:\d{2}[.,]\d{3})/;

        for (const block of blocks) {
            const lines = block.split('\n');
            let timeMatch = null;
            let textLines = [];

            for (const line of lines) {
                if (line.includes('WEBVTT') || line.match(/^\d+$/)) continue;

                const match = line.match(timeRegex);
                if (match) {
                    timeMatch = match;
                } else if (line.trim()) {
                    // Remove HTML tags from subtitle text
                    textLines.push(line.trim().replace(/<[^>]+>/g, ''));
                }
            }

            if (timeMatch && textLines.length > 0) {
                cues.push({
                    start: this.parseTime(timeMatch[1]) + this.syncOffset,
                    end: this.parseTime(timeMatch[2]) + this.syncOffset,
                    text: textLines.join('\n')
                });
            }
        }
        return cues;
    }

    parseTime(timeStr) {
        const parts = timeStr.replace(',', '.').split(':').reverse();
        let seconds = parseFloat(parts[0]) || 0;
        let minutes = parseInt(parts[1]) || 0;
        let hours = parseInt(parts[2]) || 0;
        return hours * 3600 + minutes * 60 + seconds;
    }

    getVideoMetadata() {
        const video = this.findVideo();
        if (!video) return null;
        return {
            title: this.cleanTitle(document.title),
            url: window.location.href,
            duration: video.duration,
            currentTime: video.currentTime
        };
    }

    cleanTitle(title) {
        // Try to extract movie/show title patterns
        const patterns = [
            /([a-zA-Z]{2,6}-?\d{3,4})/i, // JAV pattern
            /^(.+?)\s*[-–|]\s*(?:Watch|Stream|Online|Free|HD)/i, // "Title - Watch Online"
            /^(.+?)\s*\(\d{4}\)/i, // "Title (2024)"
        ];

        for (const pattern of patterns) {
            const match = title.match(pattern);
            if (match) return match[1].trim();
        }

        // Fallback cleanup
        return title
            .replace(/\[.*?\]/g, '')
            .replace(/\(.*?\)/g, '')
            .replace(/[-–|].+$/, '')
            .trim();
    }

    stopCapture() {
        this.isListening = false;
        const textEl = document.getElementById('ai-subtitle-text');
        if (textEl) textEl.style.display = 'none';
        console.log('[AI] Display stopped.');
    }

    async togglePiP() {
        if (!this.video) this.findVideo();
        if (!this.video) {
            console.log('[PiP] No video found');
            return false;
        }

        try {
            if (document.pictureInPictureElement) {
                await document.exitPictureInPicture();
            } else {
                await this.video.requestPictureInPicture();
            }
            return true;
        } catch (err) {
            console.error('[PiP] Error:', err);
            return false;
        }
    }
}

// Singleton
const injector = new SubtitleInjector();
window._aiSubtitleInjector = injector;

// Auto-check for video
function aggressiveVideoCheck() {
    const v = injector.findVideo();
    if (v) console.log('[Content] Video found in frame:', window.location.href);
}

aggressiveVideoCheck();

// DOM mutation observer
const observer = new MutationObserver((mutations) => {
    if (!injector.video) aggressiveVideoCheck();
});
observer.observe(document.body, { childList: true, subtree: true });

// Message handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    try {
        if (message.action === 'GET_VIDEO_METADATA') {
            if (!injector.findVideo()) {
                sendResponse(null);
                return;
            }
            sendResponse(injector.getVideoMetadata());

        } else if (message.action === 'INJECT_SUBTITLE') {
            injector.injectSubtitle(message.content, message.syncOffset || 0);
            sendResponse({ success: true });

        } else if (message.action === 'SET_SYNC_OFFSET') {
            injector.setSync(message.offset);
            sendResponse({ success: true });

        } else if (message.action === 'START_RECORDING' || message.action === 'AI_MODE_STARTED') {
            if (injector.video) {
                injector.isListening = true;
                injector.showTempMessage('🎙️ AI Mode: Listening...', true);
            }
            sendResponse({ success: true });

        } else if (message.action === 'STOP_RECORDING') {
            injector.stopCapture();
            sendResponse({ success: true });

        } else if (message.action === 'UPDATE_AI_SUBTITLES') {
            if (injector.video) {
                injector.injectSubtitle(message.content, message.offset);
            }
            sendResponse({ success: true });

        } else if (message.action === 'TOGGLE_PIP') {
            injector.togglePiP().then(success => {
                sendResponse({ success });
            });
            return true; // Keep channel open for async response
        }
    } catch (e) {
        console.error("Content Script Error:", e);
        sendResponse({ success: false, error: e.message });
    }
});
