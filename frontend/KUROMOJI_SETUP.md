# Quick Start: Kuromoji + Dictionary Integration

## What's New?

You now have integrated kuromoji tokenizer with dictionary lookup. This allows you to:
- Tokenize Japanese text into words
- Convert conjugated forms to dictionary forms (e.g., "食べました" → "食べる")
- Look up dictionary definitions for each word
- All done automatically!

## 3-Step Setup

### Step 1: Download Dictionary Files
```bash
cd frontend
npm run download-kuromoji-dict
```

### Step 2: The App Will Auto-Initialize
- `DictionaryInitializer` component automatically loads kuromoji and dictionary when user logs in
- No additional code needed in root layout (already integrated)

### Step 3: Use in Your Components

Simple example:

```tsx
import { useDictionaryWithTokenizer } from '@/features/dictionary/hooks/useDictionaryWithTokenizer';

export function MyComponent() {
    const { isReady, tokenizeAndSearch } = useDictionaryWithTokenizer();

    const handleClick = async () => {
        const result = await tokenizeAndSearch('日本語を勉強しています');
        console.log(result.tokens);    // Tokenized words
        console.log(result.results);   // Dictionary entries
    };

    return <button onClick={handleClick}>Search</button>;
}
```

## Available Functions

### Hook (Recommended for Components)
```tsx
const { isReady, isLoading, error, tokenizeAndSearch, lookup } = useDictionaryWithTokenizer();
```

### Direct Functions (for utilities)
```tsx
import { tokenizeAndLookup, lookupWord, initializeAll } from '@/features/dictionary/utils/dictionaryWithTokenizer';

// Initialize
await initializeAll();

// Tokenize + lookup
const result = await tokenizeAndLookup('こんにちは');

// Lookup single word
const entries = await lookupWord('日本');
```

### Pre-built Component (for quick testing)
```tsx
import { DictionaryWithTokenizerComponent } from '@/features/dictionary/components/DictionaryWithTokenizerComponent';

<DictionaryWithTokenizerComponent />
```

## What Gets Loaded?

1. **Kuromoji Dictionary**: 12 .dat.gz files (shared publicly, ~5-10MB total)
2. **Japanese Dictionary**: jmdict-eng (loaded on demand, ~30MB)
3. Both cached in IndexedDB for instant loading on subsequent sessions

## Features Included

✅ Japanese text tokenization
✅ Automatic verb conjugation detection (食べました → 食べる)
✅ Filter out particles, auxiliaries, punctuation automatically
✅ Dictionary lookup with definitions and readings
✅ Web Worker processing (non-blocking)
✅ IndexedDB caching (fast subsequent loads)
✅ Parallel initialization (kuromoji + dictionary load together)
✅ Error handling and retry logic

## Files Added/Modified

### New Files
- `utils/dictionaryWithTokenizer.ts` - Integrated tokenizer + dictionary
- `hooks/useDictionaryWithTokenizer.ts` - React hook
- `components/DictionaryWithTokenizerComponent.tsx` - Example component
- `KUROMOJI_DICTIONARY_INTEGRATION.md` - Full documentation

### Modified Files
- `components/provider/DictionaryInitializer.tsx` - Now initializes both kuromoji and dictionary

## Next Steps

1. Run `npm run download-kuromoji-dict` in the `frontend` folder
2. Start your app - kuromoji and dictionary will auto-load for authenticated users
3. Use `useDictionaryWithTokenizer()` hook in your components
4. See full docs in `KUROMOJI_DICTIONARY_INTEGRATION.md`

## Troubleshooting

**Dictionary files not found?**
```bash
npm run download-kuromoji-dict
```

**Kuromoji not initializing?**
- Check browser console for errors
- Make sure dictionary files downloaded correctly
- Check that `public/dict/` directory exists

**Need detailed documentation?**
- See `src/features/dictionary/KUROMOJI_DICTIONARY_INTEGRATION.md`
