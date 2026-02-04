// ==========================================
// MAIN ENTRY POINT
// ==========================================

console.log("Stitch PiP: Extension Loaded 🚀");

// Detect existing videos
document.querySelectorAll("video").forEach(enablePiP);

// Detect new videos (SPA sites)
const observer = new MutationObserver(() => {
    document.querySelectorAll("video").forEach(enablePiP);
    handleYouTubeInjection();
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

// Initial check
handleYouTubeInjection();

// Fallback interval check for YouTube's dynamic UI
setInterval(handleYouTubeInjection, 2000);
