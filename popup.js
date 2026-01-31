const pipBtn = document.getElementById("pipBtn");
const videoListContainer = document.getElementById("videoListContainer");
const videoList = document.getElementById("videoList");
const statusMsg = document.getElementById("statusMsg");

function showStatus(msg, isError = true) {
    statusMsg.textContent = msg;
    statusMsg.style.display = "block";
    statusMsg.style.background = isError ? "rgba(239, 68, 68, 0.1)" : "rgba(99, 102, 241, 0.1)";
    statusMsg.style.color = isError ? "#f87171" : "#6366f1";
    statusMsg.style.borderColor = isError ? "rgba(239, 68, 68, 0.2)" : "rgba(99, 102, 241, 0.2)";
}

async function init() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
            const videos = Array.from(document.querySelectorAll("video"));
            const iframes = document.querySelectorAll("iframe").length;
            const canvas = document.querySelectorAll("canvas").length;

            return {
                videos: videos.map((v, i) => ({
                    id: i,
                    currentSrc: v.currentSrc || "Unnamed Video",
                    playing: !v.paused
                })),
                hasIframes: iframes > 0,
                hasCanvas: canvas > 0
            };
        }
    }, (results) => {
        if (!results || !results[0].result) return;
        const { videos, hasIframes, hasCanvas } = results[0].result;

        if (videos.length === 0) {
            let msg = "No HTML5 video detected.";
            if (hasIframes) msg += " (Inside iframe)";
            else if (hasCanvas) msg += " (Canvas based)";
            showStatus(msg);
            pipBtn.style.opacity = "0.5";
            pipBtn.disabled = true;
        } else if (videos.length > 1) {
            videoListContainer.style.display = "block";
            videoList.innerHTML = "";
            videos.forEach(v => {
                const btn = document.createElement("button");
                btn.className = "stitch-btn stitch-btn-outline";
                btn.style.cssText = "width:100%; padding:8px; font-size:11px; text-align:left; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; border-style: dashed;";
                btn.textContent = `Video ${v.id + 1}: ${v.currentSrc.split('/').pop() || 'Blob/Stream'}`;
                btn.onclick = () => triggerPiPForIndex(tab.id, v.id);
                videoList.appendChild(btn);
            });
        }
    });
}

pipBtn.addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    triggerPiPForIndex(tab.id, 0);
});

function triggerPiPForIndex(tabId, index) {
    chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: (idx) => {
            const videos = document.querySelectorAll("video");
            const video = videos[idx];
            if (!video) return { success: false, error: "Video not found" };

            try {
                if (document.pictureInPictureElement) {
                    document.exitPictureInPicture();
                    return { success: true, action: "exit" };
                } else {
                    return video.requestPictureInPicture()
                        .then(() => ({ success: true, action: "enter" }))
                        .catch(err => ({ success: false, error: err.message }));
                }
            } catch (err) {
                return { success: false, error: err.message };
            }
        },
        args: [index]
    }, (results) => {
        const res = results[0].result;
        if (res && !res.success) {
            showStatus(`PiP Failed: ${res.error}`);
        }
    });
}

init();

