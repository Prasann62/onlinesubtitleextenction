/**
 * uiOverlay.js
 * Manages the isolated UI layer using Shadow DOM.
 */

class UIOverlay {
    constructor() {
        this.host = null;
        this.shadow = null;
        this.container = null;

        this.init();
    }

    init() {
        if (document.getElementById('brave-extension-ui-root')) return;

        this.host = document.createElement('div');
        this.host.id = 'brave-extension-ui-root';
        this.host.style.all = 'initial'; // Reset all styles for the host

        this.shadow = this.host.attachShadow({ mode: 'open' });

        // Add base styles to Shadow DOM
        const style = document.createElement('style');
        style.textContent = `
            :host {
                position: fixed;
                top: 0;
                left: 0;
                width: 0;
                height: 0;
                z-index: 2147483647;
                pointer-events: none;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }
            .overlay-container {
                position: fixed;
                width: 100vw;
                height: 100vh;
                pointer-events: none;
            }
            /* Draggable elements should have pointer-events: auto */
            .draggable {
                pointer-events: auto;
                user-select: none;
            }
            #mini-player-host {
                position: absolute;
                bottom: 20px;
                right: 20px;
                width: 320px;
                height: 180px;
                background: #000;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                display: none;
                flex-direction: column;
                border: 1px solid rgba(255,255,255,0.1);
                transition: transform 0.2s ease;
            }
            #mini-player-host.active {
                display: flex;
            }
            .controls-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.4);
                opacity: 0;
                transition: opacity 0.3s;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                padding: 10px;
                box-sizing: border-box;
            }
            #mini-player-host:hover .controls-overlay {
                opacity: 1;
            }
            .top-bar {
                display: flex;
                justify-content: flex-end;
            }
            .bottom-bar {
                display: flex;
                flex-direction: column;
                gap: 5px;
            }
            .ctrl-btn {
                background: rgba(255,255,255,0.2);
                border: none;
                color: white;
                cursor: pointer;
                padding: 5px 10px;
                border-radius: 4px;
                font-size: 12px;
                backdrop-filter: blur(4px);
            }
            .ctrl-btn:hover {
                background: rgba(255,255,255,0.4);
            }
            .seek-bar {
                width: 100%;
                height: 4px;
                background: rgba(255,255,255,0.3);
                border-radius: 2px;
                cursor: pointer;
                position: relative;
            }
            .seek-progress {
                height: 100%;
                background: #ff0000;
                border-radius: 2px;
                width: 0%;
            }
        `;
        this.shadow.appendChild(style);

        this.container = document.createElement('div');
        this.container.className = 'overlay-container';
        this.shadow.appendChild(this.container);

        document.body.appendChild(this.host);
    }

    /**
     * Creates and returns a element within the Shadow DOM.
     */
    addElement(tag, className, id) {
        const el = document.createElement(tag);
        if (className) el.className = className;
        if (id) el.id = id;
        this.container.appendChild(el);
        return el;
    }
}

// Attach to window
window.UIOverlayInstance = new UIOverlay();
