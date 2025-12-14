import React, { useState, useRef } from 'react';
import { BookOpen, Film, Sparkles } from 'lucide-react';
import { AudioTrack } from '@/types/types';
import DictionaryPopup from '@/features/dictionary/components/DictionaryPopup';

interface AudioScriptProps {
  audio: AudioTrack;
  onUpdateAudio?: (audio: AudioTrack) => void;
}

/**
 * AudioScript Component
 * 
 * Displays audio transcript with built-in dictionary lookup (double click or context menu)
 * Self-control dictionary popup state
 */
enum ViewMode {
    Script = 'script',
    Overview = 'overview',
}

type PopupState = {
  x: number;
  y: number;
  word: string;
} | null;

type ContextMenu = {
  x: number;
  y: number;
  selectedText: string;
} | null;

export default function AudioScript({ audio }: AudioScriptProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Script);
  const [popup, setPopup] = useState<PopupState>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenu>(null);
  const textRef = useRef<HTMLDivElement>(null);

  // Handle double click - direct search
  const handleDoubleClick = (event: React.MouseEvent) => {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();

    if (!selectedText) return;

    setPopup({
      x: event.clientX,
      y: event.clientY,
      word: selectedText,
    });
  };

  // Handle right click - show context menu
  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();

    if (!selectedText) {
      setContextMenu(null);
      return;
    }

    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      selectedText,
    });
  };

  const handleSearchFromMenu = () => {
    if (!contextMenu) return;

    setPopup({
      x: contextMenu.x,
      y: contextMenu.y,
      word: contextMenu.selectedText,
    });

    setContextMenu(null);
  };

  const closePopup = () => setPopup(null);
  const closeContextMenu = () => setContextMenu(null);

  return (
    <div className="flex-1 bg-white rounded-3xl border border-brand-200 shadow-sm flex flex-col overflow-hidden relative h-full">
      {/* Header / Toggle */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-brand-100 bg-white z-10 flex-wrap gap-3">
        <h3 className="text-lg font-extrabold text-brand-900 flex items-center gap-2">
          {viewMode === ViewMode.Script ? (
            <BookOpen size={20} className="text-brand-500" />
          ) : (
            <Film size={20} className="text-brand-500" />
          )}
          {viewMode === ViewMode.Script ? 'Transcript' : 'Context Overview'}
        </h3>

        <div className="flex items-center gap-3">
          <div className="bg-brand-50 p-1 rounded-xl flex gap-1">
            <button
              onClick={() => setViewMode(ViewMode.Script)}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                viewMode === ViewMode.Script ? 'bg-white text-brand-600 shadow-sm' : 'text-brand-400 hover:text-brand-600'
              }`}
            >
              Script
            </button>
            <button
              onClick={() => setViewMode(ViewMode.Overview)}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                viewMode === ViewMode.Overview ? 'bg-white text-brand-600 shadow-sm' : 'text-brand-400 hover:text-brand-600'
              }`}
            >
              Overview
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar text-brand-700">
        {viewMode === ViewMode.Script ? (
          <div
            ref={textRef}
            onDoubleClick={handleDoubleClick}
            onContextMenu={handleContextMenu}
            className="max-w-3xl text-lg mx-auto animate-fade-in leading-9 select-text cursor-text"
          >
            {audio.script}
          </div>
        ) : (
          <div className="max-w-2xl mx-auto animate-fade-in py-8 flex flex-col items-center justify-center h-full">
            <div className="relative bg-brand-50 p-8 md:p-12 rounded-3xl border border-brand-100 max-w-xl shadow-inner text-center">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-3 rounded-full shadow-sm border border-brand-100">
                <Sparkles size={32} className="text-purple-500" />
            </div>
            <p className="text-lg md:text-2xl text-brand-800 leading-relaxed text-justify">
                {audio.overview || 'No overview available.'}
            </p>
            </div>
          </div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-50"
          style={{ left: contextMenu.x, top: contextMenu.y }}
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
          </div>
          <div className="fixed inset-0 -z-10" onClick={closeContextMenu}></div>
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
