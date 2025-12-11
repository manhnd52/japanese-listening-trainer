'use client';

import { useState } from 'react';
import DictionaryPopup, { PopupData } from '@/features/dictionary/components/DictionaryPopup';

export default function TestDictionaryPage() {
    const [popupData, setPopupData] = useState<PopupData | null>(null);

    const showLoadingPopup = (e: React.MouseEvent) => {
        setPopupData({
            x: e.clientX,
            y: e.clientY - 100,
            loading: true,
            word: null
        });

        // Simulate async lookup
        setTimeout(() => {
            setPopupData({
                x: e.clientX,
                y: e.clientY - 100,
                loading: false,
                word: {
                    word: 'benevolent',
                    definition: 'Well meaning and kindly',
                    type: 'adjective',
                    example: 'He was a benevolent ruler who cared for his people.'
                }
            });
        }, 1500);
    };

    const showSuccessPopup = (e: React.MouseEvent) => {
        setPopupData({
            x: e.clientX,
            y: e.clientY - 100,
            loading: false,
            word: {
                word: 'serendipity',
                definition: 'The occurrence of events by chance in a happy or beneficial way',
                type: 'noun',
                example: 'A fortunate stroke of serendipity brought the two old friends together.'
            }
        });
    };

    const showNotFoundPopup = (e: React.MouseEvent) => {
        setPopupData({
            x: e.clientX,
            y: e.clientY - 100,
            loading: false,
            word: null
        });
    };

    const closePopup = () => {
        setPopupData(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-brand-800 via-brand-700 to-brand-900 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-2 text-white">Dictionary Popup Test</h1>
                <p className="text-brand-200 mb-8">Click on the buttons below to test different states of the dictionary popup.</p>

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-white/20">
                    <h2 className="text-2xl font-semibold mb-4 text-white">Test Buttons</h2>
                    <div className="flex flex-wrap gap-4">
                        <button
                            onClick={showLoadingPopup}
                            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                        >
                            Show Loading State
                        </button>
                        <button
                            onClick={showSuccessPopup}
                            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                        >
                            Show Success State
                        </button>
                        <button
                            onClick={showNotFoundPopup}
                            className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                        >
                            Show Not Found State
                        </button>
                    </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                    <h2 className="text-2xl font-semibold mb-4 text-white">Sample Text</h2>
                    <p className="text-brand-100 leading-relaxed text-lg">
                        Click on any of the buttons above to see how the dictionary popup appears.
                        The popup will show different states: loading (with spinner), success (with word details),
                        or not found (error message). You can also click outside the popup to close it.
                    </p>
                </div>

                {popupData && (
                    <div
                        style={{
                            position: 'fixed',
                            left: `${popupData.x}px`,
                            top: `${popupData.y}px`,
                            transform: 'translateX(-50%)'
                        }}
                    >
                        <DictionaryPopup data={popupData} onClose={closePopup} />
                    </div>
                )}
            </div>
        </div>
    );
}
