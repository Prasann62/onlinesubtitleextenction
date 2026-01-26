/**
 * pipController.js
 * Native Picture-in-Picture logic for Brave.
 */

class PiPController {
    constructor() {
        this.isPipActive = false;
        this.setupListeners();
    }

    setupListeners() {
        document.addEventListener('enterpictureinpicture', () => {
            this.isPipActive = true;
            console.log('[PiPController] Native PiP Started');
        });

        document.addEventListener('leavepictureinpicture', () => {
            this.isPipActive = false;
            console.log('[PiPController] Native PiP Ended');
        });
    }

    async toggle(video) {
        if (!video) {
            console.warn('[PiPController] No video to PiP');
            return;
        }

        try {
            if (document.pictureInPictureElement) {
                await document.exitPictureInPicture();
            } else {
                if (document.pictureInPictureEnabled) {
                    await video.requestPictureInPicture();
                } else {
                    console.error('[PiPController] PiP not supported by browser/site');
                }
            }
        } catch (err) {
            console.error('[PiPController] Toggle failed:', err);
        }
    }
}

window.PiPControllerInstance = new PiPController();
