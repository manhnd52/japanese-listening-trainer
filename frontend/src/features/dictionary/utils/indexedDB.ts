// IndexedDB helper for caching dictionary data
import { DictData } from '../workers/dictWorker';

const DB_NAME = 'DictionaryDB';
const DB_VERSION = 1;
const STORE_NAME = 'dictionary';
const DICTIONARY_KEY = 'jmdict-data';

interface DictionaryCache {
    key: string;
    data: DictData;
    version: string;
    timestamp: number;
}

/**
 * Opens or creates the IndexedDB database
 */
function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            reject(new Error('Failed to open IndexedDB'));
        };

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            
            // Create object store if it doesn't exist
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'key' });
                console.log('[IndexedDB] Object store created');
            }
        };
    });
}

/**
 * Saves dictionary data to IndexedDB
 */
export async function saveDictionaryToCache(data: DictData, version: string): Promise<void> {
    try {
        const db = await openDB();
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        const cacheData: DictionaryCache = {
            key: DICTIONARY_KEY,
            data,
            version,
            timestamp: Date.now()
        };

        const request = store.put(cacheData);

        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                console.log('[IndexedDB] Dictionary saved to cache');
                resolve();
            };

            request.onerror = () => {
                reject(new Error('Failed to save dictionary to cache'));
            };

            transaction.oncomplete = () => {
                db.close();
            };
        });
    } catch (error) {
        console.error('[IndexedDB] Error saving dictionary:', error);
        throw error;
    }
}

/**
 * Retrieves dictionary data from IndexedDB
 */
export async function getDictionaryFromCache(): Promise<DictionaryCache | null> {
    try {
        const db = await openDB();
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(DICTIONARY_KEY);

        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                const result = request.result as DictionaryCache | undefined;
                if (result) {
                    console.log('[IndexedDB] Dictionary found in cache');
                    console.log('[IndexedDB] Cache version:', result.version);
                    console.log('[IndexedDB] Cache age:', Math.floor((Date.now() - result.timestamp) / 1000 / 60), 'minutes');
                }
                resolve(result || null);
            };

            request.onerror = () => {
                reject(new Error('Failed to retrieve dictionary from cache'));
            };

            transaction.oncomplete = () => {
                db.close();
            };
        });
    } catch (error) {
        console.error('[IndexedDB] Error retrieving dictionary:', error);
        return null;
    }
}

/**
 * Clears the dictionary cache
 */
export async function clearDictionaryCache(): Promise<void> {
    try {
        const db = await openDB();
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(DICTIONARY_KEY);

        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                console.log('[IndexedDB] Dictionary cache cleared');
                resolve();
            };

            request.onerror = () => {
                reject(new Error('Failed to clear dictionary cache'));
            };

            transaction.oncomplete = () => {
                db.close();
            };
        });
    } catch (error) {
        console.error('[IndexedDB] Error clearing cache:', error);
        throw error;
    }
}

/**
 * Checks if the cached dictionary is still valid
 * You can customize this based on your needs (e.g., check version, expiry time)
 */
export function isCacheValid(cache: DictionaryCache, expectedVersion?: string): boolean {
    // Cache is valid if version matches (if provided)
    if (expectedVersion && cache.version !== expectedVersion) {
        console.log('[IndexedDB] Cache version mismatch');
        return false;
    }

    // You can add time-based expiry here if needed
    // const MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days
    // if (Date.now() - cache.timestamp > MAX_AGE) {
    //     console.log('[IndexedDB] Cache expired');
    //     return false;
    // }

    return true;
}
