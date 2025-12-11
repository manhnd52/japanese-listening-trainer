import { useState, useRef } from 'react';
import { useDictionary } from '../hooks/useDictionary';
import DictionaryPopup from '../components/DictionaryPopup';

type PopupState = {
    x: number;
    y: number;
    word: string;
} | null;

type ContextMenu = {
    x: number;
    y: number;
    selectedText: string;
};

export default function DictionaryDemo() {
    const { isReady, error } = useDictionary();
    const [popup, setPopup] = useState<PopupState>(null);
    const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);
    const textRef = useRef<HTMLDivElement>(null);

    // Japanese sample text
    const japaneseText = "今日は天気がとても良く、青空が広がっていた。朝早く起きて散歩に出かけると、公園の木々は新緑に包まれ、鳥たちのさえずりが心地よく響いていた。通りを歩く人々も皆、どこか楽しそうで、笑顔が絶えなかった。私はベンチに座り、持ってきた本を開きながら静かな時間を過ごした。普段の忙しい生活ではなかなか感じることのできない、自然の美しさや小さな喜びを改めて実感することができた。昼になり、近くのカフェでランチを取りながら友人と話すと、日常の些細な出来事にも感謝する気持ちが湧いてくるのを感じた。こうした平凡な一日こそが、実は最も大切な瞬間なのかもしれないと思った。";


    // Handle double click - direct search
    const handleDoubleClick = async (event: React.MouseEvent) => {
        const selection = window.getSelection();
        const selectedText = selection?.toString().trim();

        if (!selectedText) return;

        setPopup({
            x: event.clientX,
            y: event.clientY,
            word: selectedText
        });

        console.log('Double clicked word:', selectedText);
    };

    // Handle right click - show context menu
    const handleContextMenu = (event: React.MouseEvent) => {
        event.preventDefault(); // Prevent default context menu
    
        const selection = window.getSelection();
        const selectedText = selection?.toString().trim();

        if (!selectedText) {
            setContextMenu(null);
            return;
        }

        // Show context menu
        setContextMenu({
            x: event.clientX,
            y: event.clientY,
            selectedText
        });

        console.log('Context menu for:', selectedText);
    };

    // Handle search from context menu - treat whole phrase as one word
    const handleSearchFromMenu = () => {
        if (!contextMenu) return;

        const selectedText = contextMenu.selectedText;
        
        // Show popup with raw word - it will handle tokenization
        setPopup({
            x: contextMenu.x,
            y: contextMenu.y,
            word: selectedText
        });
        
        // Close context menu
        setContextMenu(null);
    };

    const closePopup = () => {
        setPopup(null);
    };

    const closeContextMenu = () => {
        setContextMenu(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-accent-50 p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-brand-900 mb-2">
                        Japanese Dictionary Demo
                    </h1>
                    <p className="text-brand-700">
                        Powered by JMDict with Web Worker + IndexedDB
                    </p>
                </div>

                {/* Status */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <div className="flex items-center gap-3">
                        {!isReady && !error && (
                            <>
                                <div className="animate-spin h-5 w-5 border-2 border-brand-500 rounded-full border-t-transparent"></div>
                                <span className="text-brand-700">Loading dictionary...</span>
                            </>
                        )}
                        {isReady && (
                            <>
                                <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-green-700 font-semibold">Dictionary Ready!</span>
                            </>
                        )}
                        {error && (
                            <>
                                <div className="h-3 w-3 bg-red-500 rounded-full"></div>
                                <span className="text-red-700">Error: {error}</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Japanese Text */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-bold text-brand-900 mb-4">Japanese Text Demo</h2>
                    <p className="text-sm text-gray-600 mb-4">
                        <strong>Double click</strong> để tra trực tiếp, hoặc <strong>bôi đen + chuột phải</strong> để mở menu
                    </p>
                    

                    <div 
                        ref={textRef}
                        onDoubleClick={handleDoubleClick}
                        onContextMenu={handleContextMenu}
                        className="leading-loose text-lg select-text cursor-text text-brand-700 p-4 bg-gray-50 rounded-lg"
                    >
                        {japaneseText}
                    </div>
                    
                </div>

                {/* Info */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-brand-900 mb-3">Cách sử dụng</h2>
                    <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                            <span className="text-brand-500 font-bold">1.</span>
                            <span><strong>Double click</strong> vào 1 từ → Tra cứu trực tiếp</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-brand-500 font-bold">2.</span>
                            <span><strong>Bôi đen + Chuột phải</strong> → Mở context menu</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-brand-500 font-bold">3.</span>
                            <span>Click &ldquo;Search&rdquo; → Tra cứu cụm đã bôi đen</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-brand-500 font-bold">4.</span>
                            <span>Kuromoji tự động chuyển động từ về dạng từ điển</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Context Menu */}
            {contextMenu && (
                <div 
                    className="fixed z-50"
                    style={{ 
                        left: contextMenu.x, 
                        top: contextMenu.y
                    }}
                >
                    <div className="bg-white rounded-lg shadow-2xl border border-gray-200 py-1 min-w-[120px]">
                        <button
                            onClick={handleSearchFromMenu}
                            className="w-full px-4 py-2 text-left hover:bg-brand-50 transition-colors flex items-center gap-2 text-sm text-gray-700"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            Search
                        </button>
                        {/* Future: Add more options like Save, Copy, etc. */}
                    </div>
                    {/* Backdrop to close menu */}
                    <div 
                        className="fixed inset-0 -z-10" 
                        onClick={closeContextMenu}
                    ></div>
                </div>
            )}

            {/* Dictionary Popup */}
            {popup && (
                <DictionaryPopup
                    x={popup.x}
                    y={popup.y}
                    word={popup.word}
                    onClose={closePopup}
                />
            )}
        </div>

    );
}
