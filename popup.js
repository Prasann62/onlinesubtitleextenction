// DOM element references with null checking
const pipBtn = document.getElementById("pipBtn");
const videoListContainer = document.getElementById("videoListContainer");
const videoList = document.getElementById("videoList");
const statusMsg = document.getElementById("statusMsg");
const themeToggleBtn = document.getElementById("themeToggleBtn");
const sizeBtns = document.querySelectorAll(".segment-btn");

// Early exit if critical elements missing
if (!pipBtn) {
    console.error("PiP Extension: Critical popup elements missing");
}

// ==========================================
// SETTINGS
// ==========================================
function loadSettings() {
    chrome.storage.local.get(['theme', 'playerSize', 'autoPipEnabled'], (result) => {
        // Theme
        if (result.theme === 'light') {
            document.body.classList.add('light-theme');
        } else {
            document.body.classList.remove('light-theme');
        }

        // Size
        const size = result.playerSize || 'medium';
        sizeBtns.forEach(btn => {
            if (btn.dataset.size === size) btn.classList.add('active');
            else btn.classList.remove('active');
        });

        // Auto-PiP
        const autoPipToggle = document.getElementById('autoPipToggle');
        if (autoPipToggle) {
            autoPipToggle.checked = result.autoPipEnabled || false;
        }
    });
}

// Theme Listener (Button Click)
if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        const isLight = document.body.classList.toggle('light-theme');
        chrome.storage.local.set({ theme: isLight ? 'light' : 'dark' });
    });
}

// Size Listener
sizeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        sizeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        chrome.storage.local.set({ playerSize: btn.dataset.size });

        // Send message to update live player
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    type: "UPDATE_SIZE",
                    size: btn.dataset.size
                }).catch(() => {
                    // Ignore errors if content script isn't ready
                });
            }
        });
    });
});

// Auto-PiP Toggle
const autoPipToggle = document.getElementById('autoPipToggle');
if (autoPipToggle) {
    autoPipToggle.addEventListener('change', (e) => {
        const isEnabled = e.target.checked;
        chrome.storage.local.set({ autoPipEnabled: isEnabled });

        // Show feedback
        showStatus(isEnabled
            ? "AUTO-PROTOCOL ENGAGED"
            : "AUTO-PROTOCOL DISENGAGED", false);
    });
}


// ==========================================
// PIP LOGIC
// ==========================================
function showStatus(msg, isError = true) {
    if (!statusMsg) return;
    statusMsg.textContent = `> ${msg}`;
    statusMsg.style.display = "block";
    statusMsg.style.color = isError ? "var(--danger)" : "var(--neon-cyan)";
    statusMsg.style.borderLeftColor = isError ? "var(--danger)" : "var(--neon-cyan)";

    // Auto hide after 3 seconds
    setTimeout(() => {
        statusMsg.style.display = "none";
    }, 3000);
}

async function init() {
    loadSettings();

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) return;

    // Detect videos via script injection just to get list
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
            const videos = Array.from(document.querySelectorAll("video"));
            const iframes = document.querySelectorAll("iframe").length;
            const canvas = document.querySelectorAll("canvas").length;

            return {
                videos: videos.map((v, i) => ({
                    id: i,
                    currentSrc: v.currentSrc || "Stream " + (i + 1),
                    playing: !v.paused
                })),
                hasIframes: iframes > 0,
                hasCanvas: canvas > 0
            };
        }
    }, (results) => {
        if (chrome.runtime.lastError || !results || !results[0].result) return;
        const { videos, hasIframes, hasCanvas } = results[0].result;

        if (videos.length === 0) {
            let msg = "NO SIGNAL DETECTED";
            if (hasIframes) msg += " (IFRAME LOCKED)";
            else if (hasCanvas) msg += " (CANVAS RENDER)";
            showStatus(msg, true);
            pipBtn.style.opacity = "0.5";
            pipBtn.disabled = true;
        } else if (videos.length > 1) {
            videoListContainer.style.display = "block";
            videoList.innerHTML = "";
            videos.forEach(v => {
                const btn = document.createElement("button");
                btn.className = "stitch-btn-outline";
                btn.textContent = `[CAM-${v.id + 1}] ${v.currentSrc.substring(0, 30)}...`;
                btn.onclick = () => sendToggleMessage(tab.id, v.id);
                videoList.appendChild(btn);
            });
        }
    });
}

function sendToggleMessage(tabId, index = null) {
    chrome.tabs.sendMessage(tabId, { type: "TOGGLE_PIP", targetIndex: index }).catch(err => {
        showStatus("CONNECTION FAILED", true);
    });
}

pipBtn.addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    sendToggleMessage(tab.id, null); // Null means auto-select
});

init();
