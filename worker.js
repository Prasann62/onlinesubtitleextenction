
import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.14.0';

// Skip local model checks as we are in browser
env.allowLocalModels = false;
env.useBrowserCache = true;

class PipelineSingleton {
    static instance = null;

    static async getInstance(progress_callback = null) {
        if (this.instance === null) {
            this.instance = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny.en', {
                progress_callback
            });
        }
        return this.instance;
    }
}

// Message Handler
self.addEventListener('message', async (event) => {
    const { type, audio } = event.data;

    if (type === 'transcribe') {
        try {
            const transcriber = await PipelineSingleton.getInstance((data) => {
                // Determine if we should post progress updates?
                // For now, just load.
                if (data.status === 'progress') {
                    self.postMessage({ type: 'status', status: 'downloading', file: data.file, progress: data.progress });
                }
            });

            // Transcribe
            // Audio should be Float32Array
            const output = await transcriber(audio, {
                chunk_length_s: 30,
                stride_length_s: 5,
                language: 'english',
                task: 'transcribe',
                return_timestamps: false // Just get text for live stream chunks
            });

            self.postMessage({
                type: 'result',
                text: output.text
            });

        } catch (e) {
            self.postMessage({ type: 'error', message: e.message });
        }
    }
});
