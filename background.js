/**
 * background.js
 * Optimized for personal use: YIFY Subtitles & Local AI (Transformers.js)
 */

const CONFIG = {
    // OpenSubtitles requires a specific User-Agent format: AppName vVersion
    USER_AGENT: 'AISubtitleSearch v2.0.0'
};

// --- Minimalistic ZIP Parser for Deflate ---
class ZipParser {
    static async unzipFirstFile(blob) {
        const buffer = await blob.arrayBuffer();
        const data = new Uint8Array(buffer);
        const view = new DataView(buffer);

        // Check Signature: PK\x03\x04
        if (view.getUint32(0, true) !== 0x04034b50) {
            throw new Error('Invalid ZIP format');
        }

        const compressionMethod = view.getUint16(8, true);
        const nameLen = view.getUint16(26, true);
        const extraLen = view.getUint16(28, true);

        // Offset to data
        const offset = 30 + nameLen + extraLen;

        // Find compressed size
        const compressedSize = view.getUint32(18, true);

        if (compressionMethod !== 8) {
            throw new Error('Unsupported compression method (only Deflate supported)');
        }

        const compressedData = data.subarray(offset, offset + compressedSize);

        // Inflate
        const stream = new DecompressionStream('deflate-raw');
        const writer = stream.writable.getWriter();
        writer.write(compressedData);
        writer.close();

        const response = new Response(stream.readable);
        return await response.text();
    }
}

class YIFYClient {
    static async search(title) {
        console.log(`[YIFY] Searching for: ${title}`);
        try {
            // TRY 1: YTS API for Movie ID
            const ytsRes = await fetch(`https://yts.mx/api/v2/list_movies.json?query_term=${encodeURIComponent(title)}&limit=1`);
            const ytsJson = await ytsRes.json();

            if (ytsJson.data.movie_count > 0) {
                return ytsJson.data.movies[0].imdb_code;
            }
            throw new Error('Movie not found on YTS');
        } catch (e) {
            console.error('[YIFY] Search failed:', e);
            throw new Error('Could not find subtitles (YIFY/YTS).');
        }
    }

    static async download(imdbId) {
        try {
            // 1. Get the movie page on yifysubtitles.ch
            const movieUrl = `https://yifysubtitles.ch/movie-imdb/${imdbId}`;
            const res = await fetch(movieUrl);
            const html = await res.text();

            // 2. Find English subtitle download link
            const regex = /<tr[^>]*>[\s\S]*?English[\s\S]*?<a[^>]+href="([^"]+)"/i;
            const match = html.match(regex);

            if (!match) throw new Error('No English subtitles found on YIFY.');

            const subPagePath = match[1];

            // 3. Get the Download Page
            const dlRes = await fetch(`https://yifysubtitles.ch${subPagePath}`);
            const dlHtml = await dlRes.text();

            // 4. Find the .zip link
            const zipMatch = dlHtml.match(/href="([^"]+\.zip)"/);
            if (!zipMatch) throw new Error('Download link not found.');

            const zipUrl = zipMatch[1].startsWith('http') ? zipMatch[1] : `https://yifysubtitles.ch${zipMatch[1]}`;

            // 5. Download ZIP
            const zipResp = await fetch(zipUrl);
            const blob = await zipResp.blob();

            // 6. Unzip
            return await ZipParser.unzipFirstFile(blob);

        } catch (e) {
            console.error('[YIFY] Download failed', e);
            throw new Error('Failed to download/extract subtitles.');
        }
    }
}

// Global state
let isCapturing = false;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // 1. Smart Process (YIFY)
    if (message.action === 'SMART_PROCESS') {
        (async () => {
            try {
                const { title } = message.params;
                const imdbId = await YIFYClient.search(title);

                if (!imdbId) {
                    sendResponse({ success: false, error: 'Movie not found' });
                    return;
                }

                const content = await YIFYClient.download(imdbId);
                sendResponse({ success: true, content, type: 'YIFY' });
            } catch (err) {
                console.error(err);
                sendResponse({ success: false, error: err.message });
            }
        })();
        return true;
    }

    // 2. Start AI Mode (Keyless / Transformers)
    if (message.action === 'START_AI_MODE') {
        (async () => {
            try {
                const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
                if (!tab) return;

                // Ensure Offscreen Document
                await setupOffscreenDocument('offscreen.html');

                // Get Tab Stream ID
                chrome.tabCapture.getMediaStreamId({ targetTabId: tab.id }, (streamId) => {
                    chrome.runtime.sendMessage({
                        target: 'offscreen',
                        action: 'START_CAPTURE_LOCAL',
                        streamId: streamId,
                        videoTime: 0
                    });
                });

                chrome.tabs.sendMessage(tab.id, { action: 'AI_MODE_STARTED' });
                isCapturing = true;
                sendResponse({ success: true });
            } catch (err) {
                console.error(err);
                sendResponse({ success: false, error: err.message });
            }
        })();
        return true;
    }

    // 3. Process Local AI Result (From Offscreen -> Worker -> Background -> Content)
    if (message.action === 'LOCAL_AI_RESULT') {
        (async () => {
            const { text, offset } = message;
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab && text) {
                chrome.tabs.sendMessage(tab.id, {
                    action: 'UPDATE_AI_SUBTITLES',
                    content: `WEBVTT\n\n00:00:00.000 --> 00:00:10.000\n${text}`,
                    offset: 0
                });
            }
        })();
        return true;
    }

    // 4. Stop AI Mode
    if (message.action === 'STOP_AI_MODE') {
        isCapturing = false;
        (async () => {
            chrome.runtime.sendMessage({ target: 'offscreen', action: 'STOP_CAPTURE' });
            await closeOffscreenDocument();

            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab) {
                chrome.tabs.sendMessage(tab.id, { action: 'STOP_RECORDING' });
            }
            sendResponse({ success: true });
        })();
        return true;
    }
});

// --- Offscreen Management ---

async function setupOffscreenDocument(path) {
    // Check if document exists
    const existingContexts = await chrome.runtime.getContexts({
        contextTypes: ['OFFSCREEN_DOCUMENT'],
        documentUrls: [chrome.runtime.getURL(path)]
    });

    if (existingContexts.length > 0) return;

    // Create document
    await chrome.offscreen.createDocument({
        url: path,
        reasons: ['USER_MEDIA'],
        justification: 'Capture tab audio for real-time transcription.'
    });
}

async function closeOffscreenDocument() {
    const existingContexts = await chrome.runtime.getContexts({
        contextTypes: ['OFFSCREEN_DOCUMENT']
    });

    if (existingContexts.length > 0) {
        await chrome.offscreen.closeDocument();
    }
}
