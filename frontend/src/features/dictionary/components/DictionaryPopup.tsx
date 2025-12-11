export interface WordData {
    word: string;
    definition: string;
    type: string;
    example: string;
}

export interface PopupData {
    x: number,
    y: number,
    loading: boolean,
    word: WordData | null
}

export default function DictionaryPopup({ data, onClose }: { data: PopupData, onClose: () => void }) {
    if (!data) return null;

    return (
        <>
            <div className="fixed inset-0 z-40" onClick={onClose} />

            <div className="bg-white border border-brand-200 rounded-2xl shadow-xl p-4 w-72 text-sm relative z-50">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors group"
                    aria-label="Close"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {data.loading ? (
                    <div className="flex items-center gap-2 text-brand-500 py-2">
                        <div className="animate-spin h-4 w-4 border-2 border-brand-500 rounded-full border-t-transparent"></div>
                        Looking up...
                    </div>
                ) : data.word ? (
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-bold text-xl text-brand-900 capitalize">
                                {data.word.word}
                            </h4>

                            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 bg-brand-100 rounded-full px-2 py-1 align-middle">
                                {data.word.type}
                            </span>
                        </div>
                        <p className="text-brand-900 text-base mb-3 border-b border-brand-50 pb-2">
                            {data.word.definition}
                        </p>
                        <div className="bg-brand-50 p-3 rounded-lg text-brand-700 text-sm italic border border-brand-100 flex gap-2">
                            <span className="not-italic">💡</span>
                            "{data.word.example}"
                        </div>
                    </div>
                ) : (
                    <span className="text-red-400">Not found.</span>
                )}

                <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-brand-200 rotate-45"></div>
            </div>
        </>
    );
}
