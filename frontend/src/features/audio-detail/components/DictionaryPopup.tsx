import React from 'react';
import { DictionaryPopupState } from '../types';

interface DictionaryPopupProps {
  popup: DictionaryPopupState;
  onClose: () => void;
}

/**
 * DictionaryPopup Component
 * 
 * Displays word definitions with examples
 * Positioned near the clicked word with arrow pointer
 */
export default function DictionaryPopup({ popup, onClose }: DictionaryPopupProps) {
  return (
    <>
      {/* Backdrop to catch clicks outside */}
      <div className="fixed inset-0 z-40" onClick={onClose} />
      
      {/* Popup Card */}
      <div
        className="fixed z-50 bg-white border border-brand-200 rounded-2xl shadow-xl p-4 w-72 text-sm transform -translate-y-full -translate-x-1/2 mt-[-12px]"
        style={{ left: popup.x + 20, top: popup.y }}
      >
        {popup.loading ? (
          <div className="flex items-center gap-2 text-brand-500 py-2">
            <div className="animate-spin h-4 w-4 border-2 border-brand-500 rounded-full border-t-transparent"></div>
            Looking up...
          </div>
        ) : popup.data ? (
          <div>
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-xl text-brand-900 capitalize">{popup.data.word}</h4>
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 bg-brand-100 px-2 py-0.5 rounded-full">
                {popup.data.type}
              </span>
            </div>
            <p className="text-brand-800 text-base mb-3 border-b border-brand-50 pb-2">
              {popup.data.definition}
            </p>
            <div className="bg-brand-50 p-3 rounded-lg text-brand-700 text-sm italic border border-brand-100 flex gap-2">
              <span className="not-italic">💡</span>
              &quot;{popup.data.example}&quot;
            </div>
          </div>
        ) : (
          <span className="text-red-400">Not found.</span>
        )}

        {/* Arrow pointer */}
        <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-brand-200 rotate-45"></div>
      </div>
    </>
  );
}
