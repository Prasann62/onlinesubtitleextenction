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

chrome.commands.onCommand.addListener((command) => {
    if (command === "toggle-pip") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tab = tabs[0];
            if (!tab) return;
            triggerPiP(tab.id);
        });
    }
});

function triggerPiP(tabId) {
    chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: async () => {
            const video = document.querySelector("video");
            if (!video) {
                alert("No video found on this page");
                return;
            }

            // Try Document PiP first (Phase 3)
            if (typeof requestDocumentPiP === 'function') {
                const success = await requestDocumentPiP(video);
                if (success) return;
            }

            // Fallback to native PiP
            try {
                if (document.pictureInPictureElement) {
                    await document.exitPictureInPicture();
                } else {
                    await video.requestPictureInPicture();
                }
            } catch (e) {
                console.error("PiP failed:", e);
            }
        }
    });
}

