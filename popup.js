/**
 * popup.js
 * Controls the Brave Mini Player popup interface.
 */

document.addEventListener('DOMContentLoaded', () => {
    const btnMiniPlayer = document.getElementById('btn-miniplayer');
    const btnPiP = document.getElementById('btn-pip');
    const statusText = document.getElementById('status-text');

    // Initial check (optional, detection happens in content script)
    btnMiniPlayer.addEventListener('click', async () => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab) {
            chrome.tabs.sendMessage(tab.id, { action: 'TOGGLE_MINI_PLAYER' });
            window.close(); // Close popup on action
        }
    });

    btnPiP.addEventListener('click', async () => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab) {
            chrome.tabs.sendMessage(tab.id, { action: 'TOGGLE_PIP' });
            window.close();
        }
    });

    // Simple fade in effect
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.3s ease';
    requestAnimationFrame(() => {
        document.body.style.opacity = '1';
    });
});
