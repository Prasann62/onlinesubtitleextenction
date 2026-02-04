// ==========================================
// UTILITIES & SHARED STATE
// ==========================================

// Global state for video navigation
window.Stitch = window.Stitch || {};

window.Stitch.toastTimeout = null;

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

        // Stitch effect
        const stitch = document.createElement("div");
        stitch.style.cssText = `
            position: absolute;
            top: 4px; left: 4px; right: 4px; bottom: 4px;
            border: 1px dashed rgba(255, 255, 255, 0.1);
            border-radius: 26px;
            pointer-events: none;
        `;
        toast.appendChild(stitch);

        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.opacity = "1";

    if (window.Stitch.toastTimeout) clearTimeout(window.Stitch.toastTimeout);
    window.Stitch.toastTimeout = setTimeout(() => {
        toast.style.opacity = "0";
    }, 2000);
}
