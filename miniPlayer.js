/**
 * miniPlayer.js
 * Floating Mini Player implementation.
 */

class MiniPlayer {
    constructor() {
        this.isActive = false;
        this.container = null;
        this.videoProxy = null;
        this.shadow = null;

        this.dragState = {
            active: false,
            startX: 0,
            startY: 0,
            initialX: 20,
            initialY: 20
        };

        this.resizeState = {
            active: false,
            startX: 0,
            startY: 0,
            initialWidth: 340,
            initialHeight: 191
        };
    }

    buildUI(shadow) {
        this.shadow = shadow;
        this.container = document.createElement('div');
        this.container.className = 'mini-player-host';
        this.container.innerHTML = `
            <video id="mini-video-proxy" autoplay muted playsinline></video>
            <div class="controls-overlay">
                <div class="top-bar">
                    <button class="btn-icon btn-close" id="mini-close">✕</button>
                </div>
                <div class="bottom-bar">
                    <div class="seek-bar" id="mini-seek">
                        <div class="seek-progress" id="mini-progress"></div>
                    </div>
                    <div class="control-row">
                        <div style="display:flex; gap: 8px;">
                            <button class="btn-icon" id="mini-play">▶</button>
                            <button class="btn-icon" id="mini-mute">🔊</button>
                        </div>
                    </div>
                </div>
                <div class="resize-handle" id="mini-resize"></div>
            </div>
        `;

        this.videoProxy = this.container.querySelector('#mini-video-proxy');
        this.shadow.appendChild(this.container);

        this.setupEvents();
    }

    setupEvents() {
        const closeBtn = this.container.querySelector('#mini-close');
        const playBtn = this.container.querySelector('#mini-play');
        const muteBtn = this.container.querySelector('#mini-mute');
        const seek = this.container.querySelector('#mini-seek');
        const resize = this.container.querySelector('#mini-resize');

        closeBtn.onclick = () => this.hide();

        playBtn.onclick = () => {
            const main = window.BraveMiniPlayerInstance.video;
            if (main) {
                if (main.paused) main.play();
                else main.pause();
            }
        };

        muteBtn.onclick = () => {
            const main = window.BraveMiniPlayerInstance.video;
            if (main) {
                main.muted = !main.muted;
                muteBtn.textContent = main.muted ? '🔇' : '🔊';
            }
        };

        seek.onclick = (e) => {
            const main = window.BraveMiniPlayerInstance.video;
            if (main) {
                const rect = seek.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                main.currentTime = pos * main.duration;
            }
        };

        // Drag events
        this.container.onmousedown = (e) => {
            if (e.target.closest('.btn-icon') || e.target === resize) return;
            this.dragState.active = true;
            this.dragState.startX = e.clientX;
            this.dragState.startY = e.clientY;
            const rect = this.container.getBoundingClientRect();
            // Store offset from bottom-right as it's our base
            this.dragState.initialX = window.innerWidth - rect.right;
            this.dragState.initialY = window.innerHeight - rect.bottom;
            this.container.style.transition = 'none';
        };

        // Resize events
        resize.onmousedown = (e) => {
            e.stopPropagation();
            this.resizeState.active = true;
            this.resizeState.startX = e.clientX;
            this.resizeState.startY = e.clientY;
            const rect = this.container.getBoundingClientRect();
            this.resizeState.initialWidth = rect.width;
            this.resizeState.initialHeight = rect.height;
            this.container.style.transition = 'none';
        };

        document.addEventListener('mousemove', (e) => {
            if (this.dragState.active) {
                const dx = this.dragState.startX - e.clientX;
                const dy = this.dragState.startY - e.clientY;
                this.container.style.right = `${this.dragState.initialX + dx}px`;
                this.container.style.bottom = `${this.dragState.initialY + dy}px`;
            } else if (this.resizeState.active) {
                const dx = e.clientX - this.resizeState.startX;
                const newWidth = Math.max(200, this.resizeState.initialWidth + dx);
                const newHeight = newWidth * (9 / 16);
                this.container.style.width = `${newWidth}px`;
                this.container.style.height = `${newHeight}px`;
            }
        });

        document.addEventListener('mouseup', () => {
            if (this.dragState.active) {
                this.snapToEdges();
            }
            this.dragState.active = false;
            this.resizeState.active = false;
            this.container.style.transition = 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
        });

        // Sync loop
        setInterval(() => this.sync(), 500);
    }

    snapToEdges() {
        const rect = this.container.getBoundingClientRect();
        const margin = 20;
        // Snap logic simplified for bottom-right bias
        if (rect.right > window.innerWidth - 100) this.container.style.right = `${margin}px`;
        if (rect.bottom > window.innerHeight - 100) this.container.style.bottom = `${margin}px`;
    }

    sync() {
        if (!this.isActive) return;
        const main = window.BraveMiniPlayerInstance.video;
        if (!main) return;

        // Sync visual appearance
        const progress = this.container.querySelector('#mini-progress');
        const playBtn = this.container.querySelector('#mini-play');
        progress.style.width = `${(main.currentTime / main.duration) * 100}%`;
        playBtn.textContent = main.paused ? '▶' : '⏸';

        // Mirror stream (if possible)
        if (this.videoProxy.src !== main.src && main.src) {
            this.videoProxy.src = main.src;
            this.videoProxy.currentTime = main.currentTime;
        }
    }

    show() {
        const main = window.BraveMiniPlayerInstance.video;
        if (!main) return;
        this.isActive = true;
        this.container.classList.add('active');
        this.videoProxy.src = main.src;
        this.videoProxy.currentTime = main.currentTime;
    }

    hide() {
        this.isActive = false;
        this.container.classList.remove('active');
        this.videoProxy.src = '';
    }

    toggle() {
        if (this.isActive) this.hide();
        else this.show();
    }
}

window.MiniPlayerInstance = new MiniPlayer();
