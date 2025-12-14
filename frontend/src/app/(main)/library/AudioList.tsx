'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { AudioTrack, AudioStatus, Folder as FolderType } from '@/types/types';
import { Search, Play, MoreVertical, Plus, Folder, Heart, Pencil, FolderInput, Trash2, X } from 'lucide-react';

interface AudioListProps {
  audios: AudioTrack[];
  folders: FolderType[];
  onPlay: (audio: AudioTrack) => void;
  onSelect: (audio: AudioTrack) => void;
  onAddAudio: () => void;
  onDelete: (id: string) => void | Promise<void>;
  onMove: (id: string, folderId: string) => void | Promise<void>;
  onEdit: (audio: AudioTrack) => void;
  onToggleFavorite: (audio: AudioTrack) => void;
}

const FILTERS = [
  { label: 'All', value: 'ALL' },
  { label: 'New', value: 'NEW' },
  { label: 'Favorites', value: 'FAV' },
  { label: 'Suspended', value: 'SUSPENDED' },
];

const AudioList: React.FC<AudioListProps> = ({
  audios = [],
  folders = [],
  onPlay,
  onSelect,
  onAddAudio,
  onDelete,
  onMove,
  onEdit,
  onToggleFavorite, // <-- Thêm dòng này
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [audioToMove, setAudioToMove] = useState<AudioTrack | null>(null);

  // Filter and search
  const filteredAudios = useMemo(() => {
    return audios.filter(audio => {
      const matchesSearch = audio.title.toLowerCase().includes(searchTerm.toLowerCase());
      let matchesFilter = true;
      if (filterStatus === 'NEW') matchesFilter = audio.status === AudioStatus.NEW;
      else if (filterStatus === 'FAV') matchesFilter = !!audio.isFavorite;
      else if (filterStatus === 'SUSPENDED') matchesFilter = !!audio.isSuspend;
      return matchesSearch && matchesFilter;
    });
  }, [audios, searchTerm, filterStatus]);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    if (activeMenuId) {
      window.addEventListener('click', handleClickOutside);
    }
    return () => window.removeEventListener('click', handleClickOutside);
  }, [activeMenuId]);

  const handleContextMenu = (e: React.MouseEvent, audioId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveMenuId(audioId);
  };

  const handleActionClick = async (e: React.MouseEvent, action: () => void | Promise<void>) => {
    e.stopPropagation();
    await action();
    setActiveMenuId(null);
  };

  const openMoveModal = (audio: AudioTrack) => {
    setAudioToMove(audio);
    setMoveModalOpen(true);
  };

  return (
    <div className="bg-[#FCFDF7] min-h-screen p-8">
      <div className="max-w-5xl mx-auto flex flex-col">
        {/* Move Modal */}
        {moveModalOpen && audioToMove && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm animate-fade-in" onClick={() => setMoveModalOpen(false)}>
            <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md m-4 border border-brand-200" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-brand-900">Move &quot;{audioToMove.title}&quot; to...</h3>
                <button onClick={() => setMoveModalOpen(false)} className="p-1 hover:bg-brand-50 rounded-full"><X size={20} className="text-brand-400" /></button>
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {folders.map(f => (
                  <button
                    key={f.id}
                    onClick={() => {
                      onMove(audioToMove.id, f.id);
                      setMoveModalOpen(false);
                    }}
                    disabled={f.id === audioToMove.folderId}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${
                      f.id === audioToMove.folderId
                        ? 'bg-brand-50 text-brand-300 cursor-default'
                        : 'hover:bg-brand-50 text-brand-700 hover:text-brand-900'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${f.id === audioToMove.folderId ? 'bg-brand-100' : 'bg-brand-100 text-brand-600'}`}>
                      <Folder size={20} fill="currentColor" />
                    </div>
                    <span className="font-bold">{f.name}</span>
                    {f.id === audioToMove.folderId && <span className="ml-auto text-xs font-bold">Current</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Header & Add Audio */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-extrabold text-brand-900">Library</h1>
          <button onClick={onAddAudio} className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-colors shadow-sm">
            <Plus size={18} />
            <span>Add Audio</span>
          </button>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-400" size={18} />
            <input
              type="text"
              placeholder="Search audio..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-brand-200 rounded-lg py-2 pl-10 pr-4 text-brand-900 placeholder-brand-300 focus:outline-none focus:border-brand-500 transition-colors shadow-sm"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setFilterStatus(f.value)}
                className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors border ${
                  filterStatus === f.value
                    ? 'bg-brand-500 text-white border-brand-500'
                    : 'bg-white border-brand-200 text-brand-500 hover:bg-brand-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Audio List */}
        <div className="grid grid-cols-1 gap-3">
          {filteredAudios.length === 0 ? (
            <div className="text-center py-20 text-brand-400">
              <p>No audios found matching your criteria.</p>
            </div>
          ) : (
            filteredAudios.map(audio => (
              <div
                key={audio.id}
                onContextMenu={e => handleContextMenu(e, audio.id)}
                className="group bg-jlt-sage hover:bg-brand-200/70 rounded-xl p-3 transition-all flex items-center gap-4 shadow-sm border border-transparent hover:border-brand-300 relative"
              >
                {/* Icon/Image */}
                <div
                  onClick={() => onPlay(audio)}
                  className="w-12 h-12 flex-shrink-0 bg-brand-300/50 rounded-full flex items-center justify-center text-xl cursor-pointer hover:bg-brand-500 hover:text-white transition-colors relative text-brand-700"
                >
                  <div className="group-hover:hidden">💿</div>
                  <Play size={20} fill="currentColor" className="hidden group-hover:block ml-0.5" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onSelect(audio)}>
                  <h3 className="text-brand-900 font-bold text-lg truncate">{audio.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-brand-600 font-medium mt-0.5">
                    <span className="flex items-center gap-1">
                      <Folder size={12} /> 
                      {folders.find(f => String(f.id) === String(audio.folderId))?.name || 'Uncategorized'}
                    </span>
                  </div>
                </div>

                {/* Status Badges & Actions */}
                <div className="flex items-center gap-2">
                  {audio.status === AudioStatus.NEW && (
                    <span className="bg-brand-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm hidden md:inline-block">NEW</span>
                  )}

                  {/* Heart Icon */}
                  <button onClick={() => onToggleFavorite(audio)} className={`${audio.isFavorite ? 'text-brand-600' : 'text-brand-400 hover:text-brand-600'}`}>
                    <Heart size={20} fill={audio.isFavorite ? 'currentColor' : 'none'} strokeWidth={2.5} />
                  </button>

                  {/* Dropdown Menu Trigger */}
                  <div className="relative">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === audio.id ? null : audio.id);
                      }}
                      className="p-1.5 rounded-full text-brand-400 hover:bg-brand-100 hover:text-brand-600 transition-colors"
                    >
                      <MoreVertical size={20} />
                    </button>

                    {/* Dropdown Menu */}
                    {activeMenuId === audio.id && (
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-brand-100 z-20 overflow-hidden animate-fade-in">
                        <button
                          onClick={e => handleActionClick(e, () => onEdit(audio))}
                          className="w-full px-4 py-3 text-left text-brand-700 hover:bg-brand-50 hover:text-brand-900 flex items-center gap-3 font-bold text-sm"
                        >
                          <Pencil size={16} /> Edit Audio
                        </button>
                        <button
                          onClick={e => handleActionClick(e, () => openMoveModal(audio))}
                          className="w-full px-4 py-3 text-left text-brand-700 hover:bg-brand-50 hover:text-brand-900 flex items-center gap-3 font-bold text-sm"
                        >
                          <FolderInput size={16} /> Move to Folder
                        </button>
                        <div className="h-px bg-brand-100 mx-2"></div>
                        <button
                          onClick={e =>
                            handleActionClick(e, () => {
                              onDelete(audio.id);
                            })
                          }
                          className="w-full px-4 py-3 text-left text-rose-500 hover:bg-rose-50 hover:text-rose-700 flex items-center gap-3 font-bold text-sm"
                        >
                          <Trash2 size={16} /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AudioList;