// Kuromoji tokenizer utilities
import kuromoji from 'kuromoji';

export type Token = {
    surface_form: string;
    pos: string;
    pos_detail_1: string;
    pos_detail_2: string;
    pos_detail_3: string;
    conjugated_type: string;
    conjugated_form: string;
    basic_form: string;
    reading: string;
    pronunciation: string;
};

let tokenizer: kuromoji.Tokenizer<kuromoji.IpadicFeatures> | null = null;
let isInitializing = false;
let initPromise: Promise<kuromoji.Tokenizer<kuromoji.IpadicFeatures>> | null = null;

export function initializeTokenizer(): Promise<kuromoji.Tokenizer<kuromoji.IpadicFeatures>> {
    // Return existing tokenizer if already initialized
    if (tokenizer) {
        return Promise.resolve(tokenizer);
    }

    // Return ongoing initialization promise if already initializing
    if (isInitializing && initPromise) {
        return initPromise;
    }

    // Start new initialization
    isInitializing = true;
    initPromise = new Promise((resolve, reject) => {
        kuromoji.builder({ dicPath: '/dict/' }).build((err, builtTokenizer) => {
            isInitializing = false;
            
            if (err) {
                console.error('Kuromoji initialization error:', err);
                reject(err);
                return;
            }
            
            tokenizer = builtTokenizer;
            console.log('✓ Kuromoji tokenizer initialized');
            resolve(builtTokenizer);
        });
    });

    return initPromise;
}
