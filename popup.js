const pipBtn = document.getElementById("pipBtn");
const videoListContainer = document.getElementById("videoListContainer");
const videoList = document.getElementById("videoList");

async function init() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Detect videos
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
            const videos = Array.from(document.querySelectorAll("video"));
            return videos.map((v, i) => ({
                id: i,
                currentSrc: v.currentSrc || "Unnamed Video",
                playing: !v.paused
            }));
        }
    }, (results) => {
        if (!results || !results[0].result) return;
        const videos = results[0].result;

        if (videos.length > 1) {
            videoListContainer.style.display = "block";
            videoList.innerHTML = "";
            videos.forEach(v => {
                const btn = document.createElement("button");
                btn.style.cssText = "width:100%;padding:8px;background:#27272a;color:white;border:none;border-radius:6px;font-size:11px;text-align:left;cursor:pointer;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;";
                btn.textContent = `Video ${v.id + 1}: ${v.currentSrc.split('/').pop() || 'Blob/Stream'}`;
                btn.onclick = () => triggerPiPForIndex(tab.id, v.id);
                videoList.appendChild(btn);
            });
        }
    });
}

pipBtn.addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    triggerPiPForIndex(tab.id, 0); // Default to first video
});

function triggerPiPForIndex(tabId, index) {
    chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: (idx) => {
            const videos = document.querySelectorAll("video");
            const video = videos[idx];
            if (!video) return;

            if (document.pictureInPictureElement) {
                document.exitPictureInPicture();
            } else {
                video.requestPictureInPicture().catch(console.error);
            }
        },
        args: [index]
    });
}

init();

