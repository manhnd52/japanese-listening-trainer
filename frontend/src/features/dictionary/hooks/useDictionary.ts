import { useEffect, useState, useCallback } from 'react';
import { DictEntry } from '../workers/dictWorker';

interface WorkerResponse {
    type: 'ready' | 'result' | 'error' | 'readyStatus';
    query?: string;
    results?: DictEntry[];
    error?: string;
    isReady?: boolean;
}

export interface DictionarySearchResult {
    word: string;           // Kanji or kana
    reading: string;        // Kana reading
    definition: string;     // English definition
    type: string;          // Part of speech
}

// Convert DictEntry to simplified DictionarySearchResult
const convertToSearchResults = (entries: DictEntry[]): DictionarySearchResult[] => {
    return entries.slice(0, 5).map(entry => {
        // Get kanji or first kana as word
        const word = entry.kanji.length > 0
            ? entry.kanji[0].text
            : entry.kana[0]?.text || '';

        // Get primary reading
        const reading = entry.kana[0]?.text || '';

        // Get first sense for definition
        const firstSense = entry.sense[0];
        const definition = firstSense?.gloss
            .filter(g => !g.type || g.type === null)
            .map(g => g.text)
            .join('; ') || 'No definition available';

        // Get part of speech
        const type = firstSense?.partOfSpeech?.[0] || 'unknown';

        return {
            word,
            reading,
            definition,
            type,
        };
    });
};

let worker: Worker | null = null;
let isReady = false;
let initPromise: Promise<void> | null = null;
const pendingSearches = new Map<string, (results: DictionarySearchResult[]) => void>();
const readyCallbacks: (() => void)[] = [];

/**
 * Initialize dictionary worker (singleton)
 */
export function initializeDictionary(): Promise<void> {
    // Return existing promise if already initializing
    if (initPromise) {
        return initPromise;
    }

    // Already ready
    if (isReady && worker) {
        return Promise.resolve();
    }

    console.log('[Dictionary] Initializing worker (singleton)...');

    initPromise = new Promise((resolve, reject) => {
        worker = new Worker(
            new URL('../workers/dictWorker.ts', import.meta.url),
            { type: 'module' }
        );

        worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
            const { type } = e.data;

            switch (type) {
                case 'ready':
                    console.log('✓ Dictionary worker ready!');
                    isReady = true;
                    resolve();
                    // Call all ready callbacks
                    readyCallbacks.forEach(cb => cb());
                    readyCallbacks.length = 0;
                    break;

                case 'result':
                    const { query, results } = e.data;
                    if (query && results) {
                        const callback = pendingSearches.get(query);
                        if (callback) {
                            const searchResults = convertToSearchResults(results);
                            callback(searchResults);
                            pendingSearches.delete(query);
                        }
                    }
                    break;

                case 'error':
                    console.error('[Dictionary] Worker error:', e.data.error);
                    reject(new Error(e.data.error || 'Unknown error'));
                    break;
            }
        };

        worker.onerror = (error) => {
            console.error('[Dictionary] Worker error:', error);
            reject(error);
        };

        worker.postMessage({ type: 'load' , dictPath: process.env.NEXT_PUBLIC_DICTIONARY_PATH || ''});
    });

    return initPromise;
}

/**
 * Check if dictionary is ready
 */
export function isDictionaryReady(): boolean {
    return isReady;
}

/**
 * Search for a word in dictionary
 */
export function searchDictionary(query: string): Promise<DictionarySearchResult[]> {
    return new Promise((resolve) => {
        if (!worker || !isReady) {
            console.warn('[Dictionary] Worker not ready');
            resolve([]);
            return;
        }

        const normalizedQuery = query.trim();
        if (!normalizedQuery) {
            resolve([]);
            return;
        }

        // Store callback for this query
        pendingSearches.set(normalizedQuery, resolve);

        // Send search request to worker
        worker.postMessage({
            type: 'search',
            query: normalizedQuery
        });

        // Timeout after 5 seconds
        setTimeout(() => {
            if (pendingSearches.has(normalizedQuery)) {
                console.warn('[Dictionary] Search timeout for:', normalizedQuery);
                pendingSearches.delete(normalizedQuery);
                resolve([]);
            }
        }, 5000);
    });
}

// ========== REACT HOOK ==========

export function useDictionary() {
    const [ready, setReady] = useState(isReady);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Initialize dictionary if not already initialized
        initializeDictionary()
            .then(() => {
                setReady(true);
            })
            .catch((err) => {
                console.error('[useDictionary] Failed to initialize:', err);
                setError(err.message || 'Failed to initialize dictionary');
            });

        // Register callback for when dictionary becomes ready
        if (!isReady) {
            const callback = () => setReady(true);
            readyCallbacks.push(callback);

            return () => {
                const index = readyCallbacks.indexOf(callback);
                if (index > -1) {
                    readyCallbacks.splice(index, 1);
                }
            };
        }
    }, []);

    const searchWord = useCallback((query: string) => {
        return searchDictionary(query);
    }, []);

    return {
        isReady: ready,
        error,
        searchWord
    };
}
