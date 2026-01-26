/**
 * videoDetector.js
 * Detects <video> elements in the page, including Shadow DOM and SPAs.
 */

class VideoDetector {
    constructor() {
        this.videos = new Set();
        this.primaryVideo = null;
        this.observer = null;
        this.onVideoFound = null;
        
        this.init();
    }

    init() {
        this.scanForVideos();
        this.setupMutationObserver();
        this.setupIntersectionObserver();
    }

    /**
     * Scans the document for video elements.
     */
    scanForVideos(root = document) {
        const videoElements = root.querySelectorAll('video');
        videoElements.forEach(video => this.addVideo(video));

        // Search in Shadow DOM
        const allElements = root.querySelectorAll('*');
        allElements.forEach(el => {
            if (el.shadowRoot) {
                this.scanForVideos(el.shadowRoot);
            }
        });

        // Search in iframes (if accessible)
        const iframes = root.querySelectorAll('iframe');
        iframes.forEach(iframe => {
            try {
                if (iframe.contentDocument) {
                    this.scanForVideos(iframe.contentDocument);
                }
            } catch (e) {
                // Ignore cross-origin iframe errors
            }
        });
    }

    /**
     * Adds a video to the tracked list and sets up basic listeners.
     */
    addVideo(video) {
        if (this.videos.has(video)) return;
        
        this.videos.add(video);
        
        video.addEventListener('play', () => this.updatePrimaryVideo(video));
        video.addEventListener('playing', () => this.updatePrimaryVideo(video));
        
        // If it's already playing, make it primary
        if (!video.paused) {
            this.updatePrimaryVideo(video);
        }

        if (this.onVideoFound) {
            this.onVideoFound(video);
        }
    }

    /**
     * Updates the primary video based on activity or visibility.
     */
    updatePrimaryVideo(video) {
        if (this.primaryVideo === video) return;
        this.primaryVideo = video;
        console.log('[VideoDetector] Primary video updated:', video);
    }

    /**
     * Finds the "best" video currently on the page.
     */
    getBestVideo() {
        if (this.primaryVideo && document.contains(this.primaryVideo) && this.primaryVideo.readyState > 0) {
            return this.primaryVideo;
        }

        const activeVideos = Array.from(this.videos).filter(v => document.contains(v) && v.readyState > 0);
        
        // 1. Return currently playing
        const playing = activeVideos.find(v => !v.paused);
        if (playing) return playing;

        // 2. Return largest visible video
        if (activeVideos.length > 0) {
            return activeVideos.sort((a, b) => {
                const rectA = a.getBoundingClientRect();
                const rectB = b.getBoundingClientRect();
                return (rectB.width * rectB.height) - (rectA.width * rectA.height);
            })[0];
        }

        return null;
    }

    /**
     * Watches for new DOM elements in SPAs.
     */
    setupMutationObserver() {
        this.observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.addedNodes.length) {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeName === 'VIDEO') {
                            this.addVideo(node);
                        } else if (node.querySelectorAll) {
                            const videos = node.querySelectorAll('video');
                            videos.forEach(v => this.addVideo(v));
                        }
                    });
                }
            }
        });

        this.observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    /**
     * Tracks visibility to help prioritize videos.
     */
    setupIntersectionObserver() {
        const options = {
            threshold: 0.5
        };

        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.target.nodeName === 'VIDEO') {
                    // Could be used to refine primary video selection
                }
            });
        }, options);

        this.videos.forEach(v => io.observe(v));
    }
}

// Export a singleton instance if needed, or attach to window for access by other modules
window.VideoDetectorInstance = new VideoDetector();
