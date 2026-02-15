// Load settings
document.addEventListener('DOMContentLoaded', () => {
    // Populate shortcuts from CONFIG
    const list = document.getElementById('shortcutList');
    if (CONFIG && CONFIG.SHORTCUTS) {
        for (const [action, key] of Object.entries(CONFIG.SHORTCUTS)) {
            const div = document.createElement('div');
            div.className = 'shortcut-item';
            div.innerHTML = `<span>${action.replace(/([A-Z])/g, ' $1').trim()}</span> <span class="key">${key}</span>`;
            list.appendChild(div);
        }
    }

    // Restore options
    chrome.storage.local.get(['playerSize', 'autoPipEnabled', 'theme'], (items) => {
        document.getElementById('defaultSize').value = items.playerSize || 'medium';
        document.getElementById('autoPip').checked = items.autoPipEnabled || false;

        if (items.theme === 'light') {
            document.body.classList.add('light-theme');
        }
    });
});

// Save settings
document.getElementById('saveBtn').addEventListener('click', () => {
    const size = document.getElementById('defaultSize').value;
    const autoPip = document.getElementById('autoPip').checked;

    chrome.storage.local.set({
        playerSize: size,
        autoPipEnabled: autoPip
    }, () => {
        // Update status to let user know options were saved.
        const status = document.getElementById('status');
        status.textContent = 'Settings Saved.';
        setTimeout(() => {
            status.textContent = '';
        }, 2000);
    });
});
