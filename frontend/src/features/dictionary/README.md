# Japanese Dictionary Feature

A high-performance Japanese-English dictionary powered by JMDict with **214,000+ entries**.

## 🚀 Features

- ✅ **214,000+ Japanese-English word entries** from JMDict
- ✅ **Web Worker architecture** - No UI blocking during dictionary loading
- ✅ **O(1) lookup speed** - In-memory index for instant searches
- ✅ **~109 MB JSON file** - Loads once and stays in RAM
- ✅ **Kanji and Kana indexing** - Search by both kanji (漢字) and kana (かな)
- ✅ **Rich word information** - Part of speech, definitions, readings, examples

## �️ Setup

The dictionary JSON file is **not included in git** due to its large size (~109 MB).

### Download the Dictionary

1. **Download JMDict JSON** from one of these sources:
   - [JMDict-Simplified](https://github.com/scriptin/jmdict-simplified) (Recommended)
   - Official JMDict: Convert from XML to JSON

2. **Place the file** in both locations:
   ```bash
   # Copy to public folder (required for Web Worker)
   cp jmdict-eng-3.6.1.json frontend/public/
   
   # Copy to assets folder (optional, for reference)
   cp jmdict-eng-3.6.1.json frontend/src/assets/
   ```

3. **Verify the structure:** The JSON should have this format:
   ```json
   {
     "version": "3.6.1",
     "words": [
       {
         "id": "...",
         "kanji": [...],
         "kana": [...],
         "sense": [...]
       }
     ]
   }
   ```

**Note:** If you already have the file in `src/assets/`, just copy it to `public/`:
```bash
cd frontend
cp src/assets/jmdict-eng-3.6.1.json public/
```

## �📁 Architecture

```
frontend/src/features/dictionary/
├── workers/
│   └── dictWorker.ts          # Web Worker for dictionary loading & indexing
├── hooks/
│   └── useDictionary.ts       # React hook for dictionary operations
├── components/
│   └── DictionaryPopup.tsx    # UI component for displaying word definitions
└── pages/
    └── DictionaryDemoPage.tsx # Demo page for testing
```

## 🔧 How It Works

### 1. **Web Worker Loading**
```typescript
// Worker loads dictionary asynchronously
worker.postMessage({ type: 'load' });

// Dictionary is parsed and indexed in the background
// UI remains fully responsive during this process
```

### 2. **RAM Index Building**
```typescript
// Build index for O(1) lookups
const index = {};

for (const entry of words) {
    // Index by kanji
    for (const k of entry.kanji) {
        index[k.text] = entry;
    }
    
    // Index by kana
    for (const k of entry.kana) {
        index[k.text] = entry;
    }
}
```

### 3. **Lightning-Fast Search**
```typescript
// Search takes < 1ms after indexing
const results = index[query]; // O(1) lookup
```

## 💻 Usage

### Basic Usage

```tsx
import { useDictionary } from '@/features/dictionary/hooks/useDictionary';

function MyComponent() {
    const { isReady, searchWord } = useDictionary();

    const handleSearch = async (word: string) => {
        if (!isReady) {
            console.warn('Dictionary not ready yet');
            return;
        }

        const results = await searchWord(word);
        console.log(results);
    };

    return (
        <div>
            <button onClick={() => handleSearch('寿司')}>
                Search 寿司
            </button>
        </div>
    );
}
```

### With Popup Component

```tsx
import { useState } from 'react';
import { useDictionary } from '@/features/dictionary/hooks/useDictionary';
import DictionaryPopup from '@/features/dictionary/components/DictionaryPopup';

function MyComponent() {
    const { isReady, searchWord } = useDictionary();
    const [popupData, setPopupData] = useState(null);

    const handleWordClick = async (word: string, event: React.MouseEvent) => {
        // Show loading state
        setPopupData({
            x: event.clientX,
            y: event.clientY,
            loading: true,
            results: null,
            query: word
        });

        // Search
        const results = await searchWord(word);

        // Update with results
        setPopupData(prev => ({
            ...prev,
            loading: false,
            results
        }));
    };

    return (
        <div>
            <span onClick={(e) => handleWordClick('食べる', e)}>
                食べる
            </span>

            {popupData && (
                <DictionaryPopup 
                    data={popupData} 
                    onClose={() => setPopupData(null)} 
                />
            )}
        </div>
    );
}
```

## 📊 Performance Metrics

| Metric | Value |
|--------|-------|
| Dictionary Size | ~109 MB (JSON) |
| Total Entries | 214,178 words |
| Load Time | ~2-4 seconds (one-time) |
| Index Build Time | ~200-500ms |
| Search Time | < 1ms (after indexing) |
| Memory Usage | ~150-200 MB (after load) |

## 🎯 API Reference

### `useDictionary()` Hook

Returns:
- `isReady: boolean` - Dictionary ready for searches
- `error: string | null` - Error message if loading failed
- `searchWord: (query: string) => Promise<DictionarySearchResult[]>` - Search function

### `DictionarySearchResult` Interface

```typescript
interface DictionarySearchResult {
    word: string;       // Kanji or kana
    reading: string;    // Kana reading
    definition: string; // English definition
    type: string;       // Part of speech (noun, verb, etc.)
    example?: string;   // Usage example
}
```

### `PopupData` Interface

```typescript
interface PopupData {
    x: number;                              // X position for popup
    y: number;                              // Y position for popup
    loading: boolean;                       // Loading state
    results: DictionarySearchResult[] | null; // Search results
    query: string;                          // Search query
}
```

## 🧪 Testing

Visit `/test-dictionary` to try the dictionary demo:

```
http://localhost:3000/test-dictionary
```

Features:
- Real-time loading status
- Custom search input
- Sample Japanese words
- Interactive popup display

## 🔍 Data Source

This dictionary uses **JMDict** (Japanese-Multilingual Dictionary):
- File Location: `public/jmdict-eng-3.6.1.json` (also in `src/assets/` for reference)
- Version: 3.6.1
- Date: 2025-11-17
- Source: [JMdict Project](http://www.edrdg.org/jmdict/j_jmdict.html)

**Note:** The file must be in the `public` folder so the Web Worker can fetch it via `/jmdict-eng-3.6.1.json`.


## 🚀 Future Enhancements

Potential improvements:
1. **IndexedDB Caching** - Cache parsed dictionary for faster subsequent loads
2. **Partial Loading** - Load common words first, rare words on-demand
3. **Fuzzy Search** - Support typos and approximate matches
4. **Romaji Support** - Search using romaji (e.g., "sushi" → "寿司")
5. **Kanji Decomposition** - Search by radicals or components
6. **Compression** - Use Brotli/Gzip compression for the JSON file
7. **Sentence Examples** - Add real sentence usage examples

## 📝 Notes

- The dictionary loads automatically when the hook is first used
- Only one worker instance is created per application
- Search is case-insensitive
- Supports both exact kanji and kana matches

## 🐛 Troubleshooting

### Dictionary not loading?
1. Check browser console for errors
2. Ensure `jmdict-eng-3.6.1.json` exists in `/src/assets/`
3. Check if Web Workers are supported in your browser

### Slow initial load?
- This is normal - 109 MB needs to be loaded and parsed
- Subsequent searches will be instant
- Consider implementing IndexedDB caching

### Out of memory errors?
- Close other browser tabs
- The dictionary needs ~200 MB of RAM
- Consider implementing partial loading for low-memory devices
