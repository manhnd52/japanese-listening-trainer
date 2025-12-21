// Dictionary Web Worker
// Handles dictionary loading, indexing, and search operations

import {
    getDictionaryFromCache,
    saveDictionaryToCache,
    isCacheValid
} from '../utils/indexedDB';

interface DictEntry {
    id: string;
    kanji: Array<{ text: string; common: boolean; tags: string[] }>;
    kana: Array<{ text: string; common: boolean; tags: string[] }>;
    sense: Array<{
        partOfSpeech: string[];
        gloss: Array<{ text: string; type?: string | null }>;
        misc?: string[];
        field?: string[];
    }>;
}

export interface DictData {
    version: string;
    words: DictEntry[];
}

interface SearchIndex {
    [key: string]: DictEntry[]; // Object này có nhiều key dạng string, và mỗi key sẽ chứa một mảng DictEntry.
}

// In-memory index for O(1) lookup
let index: SearchIndex = {};
let isReady = false;

// Message types
// Kiểu dữ liệu có thể 1 trong 3 object khác nhau
type WorkerMessage =
    | { type: 'load'; dictPath: string }
    | { type: 'search'; query: string }
    | { type: 'isReady' };

// Build index from dictionary data
function buildIndex(words: DictEntry[]): void {
    console.log('[DictWorker] Building index...');
    const startTime = performance.now();

    index = {};

    for (const entry of words) {
        // Index by kanji
        for (const k of entry.kanji) {
            const key = k.text.toLowerCase();
            if (!index[key]) {
                index[key] = [];
            }
            // Avoid duplicates
            if (!index[key].some(e => e.id === entry.id)) {
                index[key].push(entry);
            }
        }

        // Index by kana (hiragana/katakana readings)
        for (const k of entry.kana) {
            const key = k.text.toLowerCase();
            if (!index[key]) {
                index[key] = [];
            }

            if (!index[key].some(e => e.id === entry.id)) {
                index[key].push(entry);
            }
        }
    }

    const endTime = performance.now();
    console.log(`[DictWorker] Index built in ${(endTime - startTime).toFixed(2)}ms`);
    console.log(`[DictWorker] Total indexed keys: ${Object.keys(index).length}`);
}

// Load dictionary from public folder
async function loadDictionary(dictPath : string): Promise<void> {
    try {
        console.log('[DictWorker] Loading dictionary...');
        const startTime = performance.now();
        console.log('[DictWorker] Dictionary path:', dictPath);

        let data: DictData;

        // Try to get from IndexedDB cache first
        console.log('[DictWorker] Checking IndexedDB cache...');
        const cachedData = await getDictionaryFromCache();

        if (cachedData && isCacheValid(cachedData)) {
            // Use cached data
            console.log('[DictWorker] Using cached dictionary data');
            data = cachedData.data;
            const loadTime = performance.now();
            console.log(`[DictWorker] Dictionary loaded from cache in ${(loadTime - startTime).toFixed(2)}ms`);
        } else {
            // Fetch from network
            console.log('[DictWorker] No valid cache found, fetching from network...');
            const response = await fetch(dictPath);

            if (!response.ok) {
                throw new Error(`Failed to load dictionary: ${response.status} ${response.statusText}`);
            }

            console.log('[DictWorker] Parsing JSON...');
            data = await response.json();

            const loadTime = performance.now();
            console.log(`[DictWorker] Dictionary loaded and parsed in ${(loadTime - startTime).toFixed(2)}ms`);

            // Save to IndexedDB cache for next time
            console.log('[DictWorker] Saving to IndexedDB cache...');
            try {
                await saveDictionaryToCache(data, data.version);
                console.log('[DictWorker] Dictionary cached successfully');
            } catch (cacheError) {
                console.warn('[DictWorker] Failed to cache dictionary:', cacheError);
                // Continue even if caching fails
            }
        }

        console.log(`[DictWorker] Total entries: ${data.words.length}`);

        // Build index
        buildIndex(data.words);

        isReady = true;

        const totalTime = performance.now();
        console.log(`[DictWorker] Total initialization time: ${(totalTime - startTime).toFixed(2)}ms`);

        postMessage({ type: 'ready' });
    } catch (error) {
        console.error('[DictWorker] Error loading dictionary:', error);
        postMessage({
            type: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}


function searchWord(query: string): DictEntry[] {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
        return [];
    }
    return index[normalizedQuery] || [];
}

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
    const { type } = e.data;

    switch (type) {
        case 'load':
            loadDictionary(e.data.dictPath);
            break;

        case 'search':
            if (!isReady) {
                postMessage({
                    type: 'error',
                    error: 'Dictionary not loaded yet'
                });
                return;
            }

            const { query } = e.data as { type: 'search'; query: string };
            const results = searchWord(query);

            postMessage({
                type: 'result',
                query,
                results
            });
            break;

        case 'isReady':
            postMessage({
                type: 'readyStatus',
                isReady
            });
            break;

        default:
            console.warn('[DictWorker] Unknown message type:', type);
    }
};

export type { DictEntry, WorkerMessage };
