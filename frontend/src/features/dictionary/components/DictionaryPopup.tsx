import { useState, useEffect } from 'react';
import { useDictionary, type DictionarySearchResult } from '../hooks/useDictionary';
import { useTokenizer } from '../hooks/useTokenizer';

export interface PopupProps {
    x: number;
    y: number;
    word: string; // Raw word (may not be tokenized yet)
    onClose: () => void;
}

export default function DictionaryPopup({ x, y, word, onClose }: PopupProps) {
    const [loading, setLoading] = useState(true);
    const { isReady: isDictionaryReady, searchWord } = useDictionary();
    const [results, setResults] = useState<DictionarySearchResult[] | null>(null);
    const [searchedWord, setSearchedWord] = useState<string>('');
    const { isReady: isTokenizerReady, tokenize} = useTokenizer();
    const isReady = isDictionaryReady && isTokenizerReady;

    useEffect(() => {
        if (!isReady) return;
        let cancelled = false;
        const performSearch = async () => {
            setLoading(true);
            let wordToSearch: string = word.trim();

            try {
                wordToSearch = tokenize(wordToSearch) || wordToSearch;
            } catch (err) {
                console.warn('Failed to tokenize, using original word:', err);
            }
        
            setSearchedWord(wordToSearch);
            const searchResults = await searchWord(wordToSearch);
            if (!cancelled) {
                setResults(searchResults);
                setLoading(false);
            }
        };

        performSearch();
        return () => { cancelled = true; };
    }, [word, isReady]);

    if (!word) return null;

    // Calculate optimal position to keep popup in viewport
    const calculatePosition = () => {
        const popupWidth = 320; // w-80 = 320px
        const popupHeight = 400; // approximate max height
        const offset = 12; // spacing from cursor
        
        let posX = x;
        let posY = y - offset; // Position above cursor by default
        let transform = 'translate(-50%, -100%)'; // Center horizontally, position above
        
        // Check if popup would go off left edge
        if (posX - popupWidth / 2 < 10) {
            posX = popupWidth / 2 + 10;
        }
        
        // Check if popup would go off right edge
        if (posX + popupWidth / 2 > window.innerWidth - 10) {
            posX = window.innerWidth - popupWidth / 2 - 10;
        }
        
        // Check if popup would go off top edge
        if (posY - popupHeight < 10) {
            // Position below cursor instead
            posY = y + offset;
            transform = 'translate(-50%, 0)';
        }
        
        return { x: posX, y: posY, transform };
    };

    const position = calculatePosition();

    const formatPartOfSpeech = (pos: string): string => {
        const posMap: Record<string, string> = {
            'n': 'noun',
            'v': 'verb',
            'adj-i': 'i-adj',
            'adj-na': 'na-adj',
            'adv': 'adverb',
            'prt': 'particle',
            'int': 'interjection',
            'exp': 'expression',
            'v5r': 'verb',
            'v1': 'verb',
            'vs': 'verb',
        };
        return posMap[pos] || pos;
    };

    return (
        <>
            <div className="fixed inset-0 z-40" onClick={onClose} />

            <div
                className="fixed bg-white border border-brand-200 rounded-2xl shadow-xl p-4 w-80 max-w-[90vw] text-sm z-50 max-h-[80vh] overflow-y-auto"
                style={{
                    top: `${position.y}px`,
                    left: `${position.x}px`,
                    transform: position.transform
                }}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors group z-10"
                    aria-label="Close"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {loading ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-8">
                        <div className="relative">
                            <div className="animate-spin h-10 w-10 border-4 border-brand-200 rounded-full border-t-brand-500"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="h-6 w-6 bg-white rounded-full"></div>
                            </div>
                        </div>
                        <div className="text-brand-600 text-sm font-medium">
                            Looking up &quot;{searchedWord || word}&quot;...
                        </div>
                    </div>
                ) : results && results.length > 0 ? (
                    <div className="space-y-4">
                        {results.map((result, index) => (
                            <div key={index} className={index > 0 ? 'border-t border-brand-100 pt-3' : ''}>
                                {/* Word and Reading */}
                                <div className="mb-2">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-lg text-brand-900">
                                            {result.word}
                                        </h4>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 bg-brand-100 rounded-full px-2 py-1">
                                            {formatPartOfSpeech(result.type)}
                                        </span>
                                    </div>
                                    {result.reading && result.reading !== result.word && (
                                        <div className="text-sm text-brand-600 mt-1">
                                            [{result.reading}]
                                        </div>
                                    )}
                                </div>

                                {/* Definition */}
                                <p className="text-brand-900 text-base mb-2">
                                    {result.definition}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-2">
                        <span className="text-red-400">No results found for &quot;{searchedWord || word}&quot;.</span>
                    </div>
                )}

                {/* Pointer - only show when positioned above cursor */}
                {position.transform.includes('-100%') && (
                    <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-brand-200 rotate-45"></div>
                )}
                {/* Pointer - show when positioned below cursor */}
                {!position.transform.includes('-100%') && (
                    <div className="absolute top-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-t border-l border-brand-200 rotate-45"></div>
                )}
            </div>
        </>
    );
}
