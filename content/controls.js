// ==========================================
// CONTROLS (Keyboard, Media Session)
// ==========================================

// Navigation tracking
let currentVideos = [];
let currentIndex = -1;

function updateVideoIndex() {
    const isYouTubeShorts = location.href.includes("youtube.com/shorts");
    const isInstagramReels = location.href.includes("/reels/") || location.href.includes("/reel/");

    if (isYouTubeShorts || isInstagramReels) {
        currentVideos = Array.from(document.querySelectorAll("video")).filter(v => v.readyState >= 2);
        const activeVideo = document.querySelector('video[style*="object-fit: cover"]') || document.querySelector('video');
        currentIndex = currentVideos.indexOf(activeVideo);
    }
}

async function playNext() {
    updateVideoIndex();
    if (currentIndex < currentVideos.length - 1) {
        const nextVideo = currentVideos[currentIndex + 1];
        if (document.pictureInPictureElement) {
            try {
                await nextVideo.requestPictureInPicture();
            } catch (e) {
                console.warn("Autoplay PiP failed:", e);
            }
        }
        nextVideo.play();
        showToast("Next Short ⬇️");
    }
}

async function playPrev() {
    updateVideoIndex();
    if (currentIndex > 0) {
        const prevVideo = currentVideos[currentIndex - 1];
        if (document.pictureInPictureElement) {
            try {
                await prevVideo.requestPictureInPicture();
            } catch (e) {
                console.warn("Autoplay Prev PiP failed:", e);
            }
        }
        prevVideo.play();
        showToast("Previous Short ⬆️");
    }
}

function setupMediaSession() {
    if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('nexttrack', playNext);
        navigator.mediaSession.setActionHandler('previoustrack', playPrev);
    }
}

// Global Keyboard Shortcuts
window.addEventListener("keydown", (e) => {
    // Only trigger if a video exists on the page
    const video = document.querySelector("video");
    if (!video) return;

    // Ignore if typing in an input/textarea
    if (["INPUT", "TEXTAREA"].includes(document.activeElement.tagName) || document.activeElement.isContentEditable) {
        return;
    }

    switch (e.key.toLowerCase()) {
        case "m":
            video.muted = !video.muted;
            showToast(video.muted ? "Muted 🔇" : "Unmuted 🔊");
            break;
        case " ":
            // Only toggle if video is present and we are not in an input
            e.preventDefault();
            if (video.paused) {
                video.play().catch(() => { });
                showToast("Playing ▶️");
            } else {
                video.pause();
                showToast("Paused ⏸️");
            }
            break;
        case "arrowleft":
            video.currentTime = Math.max(0, video.currentTime - 5);
            showToast("Rewind 5s ⏪");
            break;
        case "arrowright":
            video.currentTime = Math.min(video.duration, video.currentTime + 5);
            showToast("Forward 5s ⏪");
            break;
        case "h":
            toggleHelpTooltip();
            break;
        case "x":
            if (e.altKey) {
                if (document.pictureInPictureElement) {
                    document.exitPictureInPicture();
                }
                window.postMessage({ type: "CLOSE_PIP" }, "*");
            }
            break;
        case "p":
            // Alt + P is usually handled by chrome.commands, but we can double handle here for responsiveness if wanted
            // but manifest command is safer.
            break;
        case "arrowdown":
            if (location.href.includes("youtube.com/shorts") || location.href.includes("/reel/")) {
                playNext();
            }
            break;
        case "arrowup":
            if (location.href.includes("youtube.com/shorts") || location.href.includes("/reel/")) {
                playPrev();
            }
            break;
    }
});

// Listener for background messages (Commands)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "TOGGLE_PIP") {
        if (typeof togglePiP === 'function') togglePiP(request.targetIndex);
    } else if (request.type === "CLOSE_PIP") {
        if (document.pictureInPictureElement) {
            document.exitPictureInPicture().catch(() => { });
        }
        window.postMessage({ type: "CLOSE_PIP" }, "*");
    }
});

// Listener for internal window messages
window.addEventListener("message", (e) => {
    if (e.data.type === "CLOSE_PIP" && document.pictureInPictureElement) {
        document.exitPictureInPicture().catch(() => { });
    }
});
