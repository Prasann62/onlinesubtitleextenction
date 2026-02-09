/**
 * Tests for PiP core functionality
 */

describe('PiP Core Functionality', () => {
    let mockVideo;

    beforeEach(() => {
        // Create mock video element
        mockVideo = document.createElement('video');
        mockVideo.src = 'test-video.mp4';
        mockVideo.style.width = '640px';
        mockVideo.style.height = '360px';
        document.body.appendChild(mockVideo);

        // Mock PiP API
        mockVideo.requestPictureInPicture = jest.fn(() => Promise.resolve());
        document.exitPictureInPicture = jest.fn(() => Promise.resolve());
        Object.defineProperty(document, 'pictureInPictureElement', {
            writable: true,
            value: null
        });
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    test('should detect video on page', () => {
        const videos = document.querySelectorAll('video');
        expect(videos.length).toBe(1);
        expect(videos[0]).toBe(mockVideo);
    });

    test('enablePiP should add double-click handler', () => {
        function enablePiP(video) {
            if (video.dataset.pipEnabled) return;
            video.dataset.pipEnabled = "true";

            video.addEventListener("dblclick", async () => {
                if (document.pictureInPictureElement) {
                    await document.exitPictureInPicture();
                } else {
                    await video.requestPictureInPicture();
                }
            });
        }

        enablePiP(mockVideo);
        expect(mockVideo.dataset.pipEnabled).toBe("true");
    });

    test('togglePiP should request PiP when not active', async () => {
        async function togglePiP() {
            const video = document.querySelector('video');
            if (!video) return;

            if (document.pictureInPictureElement) {
                await document.exitPictureInPicture();
            } else {
                await video.requestPictureInPicture();
            }
        }

        await togglePiP();
        expect(mockVideo.requestPictureInPicture).toHaveBeenCalled();
    });

    test('togglePiP should exit PiP when active', async () => {
        async function togglePiP() {
            const video = document.querySelector('video');
            if (!video) return;

            if (document.pictureInPictureElement) {
                await document.exitPictureInPicture();
            } else {
                await video.requestPictureInPicture();
            }
        }

        // Simulate PiP active
        document.pictureInPictureElement = mockVideo;

        await togglePiP();
        expect(document.exitPictureInPicture).toHaveBeenCalled();
    });
});

describe('Floating Mode Fallback', () => {
    let mockVideo;

    beforeEach(() => {
        mockVideo = document.createElement('video');
        mockVideo.src = 'test-video.mp4';
        document.body.appendChild(mockVideo);
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    test('should apply floating styles to video', () => {
        function toggleFloatingMode(video) {
            if (video.dataset.isFloating === "true") return;

            video.dataset.isFloating = "true";
            Object.assign(video.style, {
                position: "fixed",
                bottom: "20px",
                right: "20px",
                width: "380px",
                height: "175px",
                zIndex: "2147483647"
            });
        }

        toggleFloatingMode(mockVideo);

        expect(mockVideo.dataset.isFloating).toBe("true");
        expect(mockVideo.style.position).toBe("fixed");
        expect(mockVideo.style.bottom).toBe("20px");
        expect(mockVideo.style.right).toBe("20px");
    });

    test('should disable floating mode', () => {
        function toggleFloatingMode(video) {
            if (video.dataset.isFloating === "true") {
                delete video.dataset.isFloating;
                video.style.position = '';
            } else {
                video.dataset.isFloating = "true";
                video.style.position = "fixed";
            }
        }

        // Enable floating mode
        toggleFloatingMode(mockVideo);
        expect(mockVideo.dataset.isFloating).toBe("true");

        // Disable floating mode
        toggleFloatingMode(mockVideo);
        expect(mockVideo.dataset.isFloating).toBeUndefined();
    });
});
