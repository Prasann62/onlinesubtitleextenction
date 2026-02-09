// ==========================================
// CONTEXT MENU
// ==========================================

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "toggle-pip-menu",
        title: "Toggle Picture-in-Picture",
        contexts: ["video", "page"]
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "toggle-pip-menu") {
        triggerPiP(tab.id);
    }
});

// ==========================================
// KEYBOARD COMMANDS
// ==========================================

chrome.commands.onCommand.addListener((command) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        if (!tab) return;

        if (command === "toggle-pip") {
            triggerPiP(tab.id);
        } else if (command === "close-pip") {
            closePiP(tab.id);
        }
    });
});

// ==========================================
// AUTO-PIP ON TAB SWITCH (OPTIONAL FEATURE)
// ==========================================

chrome.tabs.onActivated.addListener(async (activeInfo) => {
    try {
        const settings = await chrome.storage.local.get(['autoPipEnabled']);
        if (settings.autoPipEnabled) {
            // Get all tabs
            const tabs = await chrome.tabs.query({});

            // Find tabs with video that are not the active tab
            tabs.forEach(tab => {
                if (tab.id !== activeInfo.tabId && tab.url && !tab.url.startsWith('chrome://')) {
                    // Check if tab has video playing before triggering PiP
                    chrome.tabs.sendMessage(tab.id, { type: "AUTO_PIP_CHECK" }).catch(() => {
                        // Ignore errors for tabs without content script
                    });
                }
            });
        }
    } catch (error) {
        console.warn("Auto-PiP tab switch error:", error);
    }
});

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function closePiP(tabId) {
    chrome.tabs.sendMessage(tabId, { type: "CLOSE_PIP" }).catch(() => {
        // If content script not ready or error
    });
}

function triggerPiP(tabId) {
    chrome.tabs.sendMessage(tabId, { type: "TOGGLE_PIP" }).catch((err) => {
        // Fallback or ignore if script not ready
        console.log("Could not send message to tab (styles/scripts might not be loaded):", err);
        // Optionally inject scripts if missing (advanced) but simplified for now
    });
}

