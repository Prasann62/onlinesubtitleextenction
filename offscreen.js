
let audioContext;
let mediaStream;
let worker;

// Initialize Worker
worker = new Worker('worker.js', { type: 'module' });

worker.onmessage = (e) => {
    const { type, text, status, progress, message } = e.data;
    if (type === 'result') {
        chrome.runtime.sendMessage({
            action: 'LOCAL_AI_RESULT',
            text: text,
            offset: 0
        });
    } else if (type === 'status') {
        if (status === 'downloading') {
            console.log(`[AI Model] Downloading: ${Math.round(progress)}%`);
        }
    } else if (type === 'error') {
        console.error('[Worker Error]', message);
    }
};

chrome.runtime.onMessage.addListener(async (message) => {
    if (message.target !== 'offscreen') return;

    if (message.action === 'START_CAPTURE_LOCAL') {
        await startCapture(message.streamId);
    } else if (message.action === 'STOP_CAPTURE') {
        stopCapture();
    }
});

async function startCapture(streamId) {
    if (audioContext) stopCapture();

    try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
            audio: {
                mandatory: {
                    chromeMediaSource: 'tab',
                    chromeMediaSourceId: streamId
                }
            },
            video: false
        });

        // Continue playing audio in the tab while capturing
        audioContext = new AudioContext({ sampleRate: 16000 });
        const source = audioContext.createMediaStreamSource(mediaStream);

        // Dest for playback (to hear audio) ? 
        // When capturing tab audio, it mutes the tab unless we connect to destination.
        // But if we connect to destination here in offscreen, does user hear it?
        // Usually yes.
        source.connect(audioContext.destination);

        // Processor for AI
        const processor = audioContext.createScriptProcessor(4096, 1, 1);
        source.connect(processor);
        // We also need to connect processor to destination or it won't fire 'onaudioprocess' in some browsers?
        // Actually it's good practice to connect to destination with gain 0 if we don't want to hear it twice, 
        // but here the source is already connected.
        // processor.connect(audioContext.destination); // Careful of feedback/echo if it passes through.
        // ScriptProcessor is old but reliable. AudioWorklet is better but harder in one file.
        // We need 'processor' to be connected to *something* for the events to fire.
        const muteNode = audioContext.createGain();
        muteNode.gain.value = 0;
        processor.connect(muteNode);
        muteNode.connect(audioContext.destination);

        let audioBuffer = [];
        const CHUNK_SIZE = 16000 * 5; // ~5 seconds

        processor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            audioBuffer.push(...inputData);

            if (audioBuffer.length >= CHUNK_SIZE) {
                const chunk = new Float32Array(audioBuffer);
                worker.postMessage({
                    type: 'transcribe',
                    audio: chunk
                });
                audioBuffer = [];
            }
        };

    } catch (e) {
        console.error('Capture failed', e);
    }
}

function stopCapture() {
    if (audioContext) {
        audioContext.close();
        audioContext = null;
    }
    if (mediaStream) {
        mediaStream.getTracks().forEach(t => t.stop());
        mediaStream = null;
    }
}
