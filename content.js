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
            await nextVideo.requestPictureInPicture();
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
            await prevVideo.requestPictureInPicture();
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

// Toast UI Helper

function showToast(message) {
    let toast = document.getElementById("pip-toast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "pip-toast";
        toast.style.cssText = `
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(10, 10, 12, 0.9);
            color: #f8fafc;
            padding: 10px 24px;
            border-radius: 30px;
            z-index: 2147483647;
            font-family: 'Outfit', sans-serif;
            font-size: 14px;
            font-weight: 600;
            pointer-events: none;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(10px);
        `;
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.opacity = "1";

    if (window.toastTimeout) clearTimeout(window.toastTimeout);
    window.toastTimeout = setTimeout(() => {
        toast.style.opacity = "0";
    }, 2000);
}

function enablePiP(video) {
    if (video.dataset.pipEnabled) return;
    video.dataset.pipEnabled = "true";

    // Double click = PiP
    video.addEventListener("dblclick", async () => {
        try {
            if (document.pictureInPictureElement) {
                await document.exitPictureInPicture();
            } else {
                await video.requestPictureInPicture();
                setupMediaSession();
            }
        } catch (e) {
            console.error("PiP error:", e);
        }
    });

    // PiP Event Hooks
    video.addEventListener("enterpictureinpicture", () => {
        showToast("PiP Mode Enabled 📺");
        setupMediaSession();
    });

    video.addEventListener("leavepictureinpicture", () => {
        showToast("PiP Mode Closed");
    });

    // Document PiP Support (Advanced)
    video.dataset.docPipSupported = 'documentPictureInPicture' in window;
}

async function requestDocumentPiP(video) {
    if (!('documentPictureInPicture' in window)) return false;

    try {
        // Save original styles and state
        const originalStyle = video.getAttribute("style") || "";
        const originalParent = video.parentElement;
        const originalNextSibling = video.nextSibling;

        const pipWindow = await window.documentPictureInPicture.requestWindow({
            width: video.videoWidth || 640,
            height: video.videoHeight || 360,
        });

        // Style the PiP window
        pipWindow.document.body.style.margin = "0";
        pipWindow.document.body.style.background = "black";
        pipWindow.document.body.style.display = "flex";
        pipWindow.document.body.style.alignItems = "center";
        pipWindow.document.body.style.justifyContent = "center";
        pipWindow.document.body.style.overflow = "hidden";

        // Create a container for video and custom controls
        const container = document.createElement("div");
        container.style.position = "relative";
        container.style.width = "100vw";
        container.style.height = "100vh";
        container.style.display = "flex";
        container.style.alignItems = "center";
        container.style.justifyContent = "center";

        // Apply override styles to the video to force it to fit
        video.style.setProperty("width", "100%", "important");
        video.style.setProperty("height", "100%", "important");
        video.style.setProperty("position", "relative", "important");
        video.style.setProperty("left", "0", "important");
        video.style.setProperty("top", "0", "important");
        video.style.setProperty("object-fit", "contain", "important");

        // Move video to PiP
        container.appendChild(video);
        pipWindow.document.body.appendChild(container);

        // Custom Overlay for Controls (Simplified)
        const overlay = document.createElement("div");
        overlay.style.cssText = "position:absolute;bottom:20px;left:50%;transform:translateX(-50%);display:none;gap:15px;background:rgba(0,0,0,0.6);padding:10px 20px;border-radius:30px;transition:opacity 0.2s;backdrop-filter:blur(5px);z-index:1000;";
        overlay.innerHTML = `
            <button id="rewind" style="background:none;border:none;color:white;cursor:pointer;font-size:20px;">⏪</button>
            <button id="playPause" style="background:none;border:none;color:white;cursor:pointer;font-size:24px;">${video.paused ? '▶️' : '⏸️'}</button>
            <button id="forward" style="background:none;border:none;color:white;cursor:pointer;font-size:20px;">⏩</button>
        `;
        container.appendChild(overlay);

        container.onmouseenter = () => overlay.style.display = "flex";
        container.onmouseleave = () => overlay.style.display = "none";

        // Logic for custom buttons
        overlay.querySelector("#playPause").onclick = () => {
            if (video.paused) video.play(); else video.pause();
            overlay.querySelector("#playPause").textContent = video.paused ? '▶️' : '⏸️';
        };
        overlay.querySelector("#rewind").onclick = () => video.currentTime -= 5;
        overlay.querySelector("#forward").onclick = () => video.currentTime += 5;

        // Restore video on close
        pipWindow.addEventListener("pagehide", () => {
            // Restore original styles
            if (originalStyle) {
                video.setAttribute("style", originalStyle);
            } else {
                video.removeAttribute("style");
            }

            // Move back to original position
            if (originalNextSibling) {
                originalParent.insertBefore(video, originalNextSibling);
            } else {
                originalParent.appendChild(video);
            }
        }, { once: true });

        return true;
        // Detect resize and move shortcuts for Document PiP
        pipWindow.addEventListener("keydown", (e) => {
            if (e.altKey) {
                switch (e.key) {
                    case "+":
                    case "=":
                        pipWindow.resizeBy(20, 20);
                        break;
                    case "-":
                        pipWindow.resizeBy(-20, -20);
                        break;
                    case "ArrowUp":
                        pipWindow.moveBy(0, -20);
                        break;
                    case "ArrowDown":
                        pipWindow.moveBy(0, 20);
                        break;
                    case "ArrowLeft":
                        pipWindow.moveBy(-20, 0);
                        break;
                    case "ArrowRight":
                        pipWindow.moveBy(20, 0);
                        break;
                    case "x":
                    case "X":
                        pipWindow.close();
                        break;
                }
            }
        });

        // Handle close from background
        window.addEventListener("message", (e) => {
            if (e.data.type === "CLOSE_PIP") {
                pipWindow.close();
            }
        });

        return true;
    } catch (e) {
        console.error("Document PiP failed:", e);
        return false;
    }
}

// Help Tooltip UI
function toggleHelpTooltip() {
    let help = document.getElementById("pip-help-tooltip");
    if (help) {
        help.remove();
        return;
    }

    help = document.createElement("div");
    help.id = "pip-help-tooltip";
    help.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(10, 10, 12, 0.95);
        color: #f8fafc;
        padding: 20px;
        border-radius: 16px;
        z-index: 2147483647;
        font-family: 'Outfit', sans-serif;
        font-size: 13px;
        line-height: 1.6;
        box-shadow: 0 20px 40px rgba(0,0,0,0.6);
        border: 1px solid rgba(255,255,255,0.1);
        backdrop-filter: blur(12px);
    `;
    help.innerHTML = `
        <div style="font-weight: 700; font-size: 16px; color: #c5a059; margin-bottom: 12px; border-bottom: 1px dashed rgba(255,255,255,0.1); padding-bottom: 8px; display: flex; align-items: center; gap: 8px;">
            <span>⌨️</span> Shortcuts
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px 24px;">
            <span>Toggle PiP</span> <span style="color: #6366f1; font-weight: 500;">Alt + P</span>
            <span>Close PiP</span> <span style="color: #6366f1; font-weight: 500;">Alt + X</span>
            <span>Play/Pause</span> <span style="color: #6366f1; font-weight: 500;">Space</span>
            <span>Mute/Unmute</span> <span style="color: #6366f1; font-weight: 500;">M</span>
            <span>Seek 5s</span> <span style="color: #6366f1; font-weight: 500;">← / →</span>
            <span>Resize</span> <span style="color: #6366f1; font-weight: 500;">Alt ±</span>
            <span>Move</span> <span style="color: #6366f1; font-weight: 500;">Alt Arw</span>
            <span>Help</span> <span style="color: #6366f1; font-weight: 500;">H</span>
        </div>
        <div style="margin-top: 12px; font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 8px;">Press 'H' to dismiss</div>
    `;
    document.body.appendChild(help);
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
            showToast("Forward 5s ⏩");
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

// Listener for background messages
window.addEventListener("message", (e) => {
    if (e.data.type === "CLOSE_PIP" && document.pictureInPictureElement) {
        document.exitPictureInPicture().catch(() => { });
    }
});

// Detect existing videos
document.querySelectorAll("video").forEach(enablePiP);

// Detect new videos (SPA sites)
const observer = new MutationObserver(() => {
    document.querySelectorAll("video").forEach(enablePiP);
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});
