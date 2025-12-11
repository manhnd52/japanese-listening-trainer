import { useEffect, useState, useCallback } from 'react';
import { initializeTokenizer } from '../utils/tokenizer';
import kuromoji from 'kuromoji';

export function useTokenizer() {
  const [tokenizer, setTokenizer] = useState<kuromoji.Tokenizer<kuromoji.IpadicFeatures> | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const tokenize = useCallback((text: string) => {
    if (!tokenizer) {
      throw new Error('Tokenizer not initialized');
    }
    const tokens = tokenizer.tokenize(text);

    const meaningfulTokens = tokens.filter(token => 
        !token.pos.includes('助詞') &&      // Particle
        !token.pos.includes('助動詞') &&    // Auxiliary verb
        !token.pos.includes('記号') &&      // Symbol/punctuation
        token.basic_form !== '*'
    )

    if (meaningfulTokens.length === 0) {
        return null;
    }
    
    const token = meaningfulTokens[0];
    return token.basic_form || token.surface_form || text;

  }, [tokenizer]);

  useEffect(() => {
    initializeTokenizer()
      .then(tk => { setTokenizer(tk); setIsReady(true); })
      .catch(err => setError(err.message));
  }, []);

  return { tokenizer, isReady, error, tokenize }; // trả về nhiều giá trị cùng lúc
}