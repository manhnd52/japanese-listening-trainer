import { useState } from 'react';
import { DictionaryPopupState, DictionaryResult } from '../types';

/**
 * Mock dictionary lookup - Replace with actual API call
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function lookupWord(word: string, _context: string): Promise<DictionaryResult | null> {
  // TODO: Integrate with actual dictionary API (Gemini or other service)
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call

  // Mock response
  return {
    word,
    definition: 'A placeholder definition for the word.',
    type: 'noun',
    example: `This is an example sentence using the word ${word}.`,
  };
}

/**
 * Hook to manage dictionary popup state and word lookup
 */
export function useDictionary(script: string) {
  const [dictPopup, setDictPopup] = useState<DictionaryPopupState | null>(null);

  const handleWordClick = async (e: React.MouseEvent, word: string) => {
    e.stopPropagation();
    const rect = (e.target as HTMLElement).getBoundingClientRect();

    // Initial loading state at position
    setDictPopup({
      x: rect.left,
      y: rect.top - 10, // slightly above
      loading: true,
      data: null,
    });

    const wordIndex = script.indexOf(word);
    const context = script.substring(
      Math.max(0, wordIndex - 20),
      Math.min(script.length, wordIndex + word.length + 20)
    );

    // Call dictionary service
    const result = await lookupWord(word, context);

    setDictPopup(prev => (prev ? { ...prev, loading: false, data: result } : null));
  };

  const closeDictionary = () => {
    setDictPopup(null);
  };

  return {
    dictPopup,
    handleWordClick,
    closeDictionary,
  };
}
