"use client"

import { useState, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Heart, Volume2, Maximize2, X, Settings, ListMusic } from 'lucide-react';

import {
  playPause,
  nextTrack,
  prevTrack,
  updateProgress,
  setExpanded,
  setVolume
} from "@/store/features/player/playerSlice";

import { AudioTrack } from '@/store/features/player/playerSlice';

import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { usePlayer } from '@/features/miniplayer/hooks/usePlayer';
import VolumeControl from './VolumeControl';

interface MiniPlayerProps {
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onExpand: () => void;
  onToggleFavorite: (id: string) => void;
}

const MiniPlayer = () => {
  const playerState = useAppSelector((state) => state.player);
  const currentAudio = playerState.currentAudio;
  const isPlaying = playerState.isPlaying;
  const volume = playerState.volume;
  const progress = playerState.progress;
  const duration = playerState.currentAudio?.duration ? playerState.currentAudio.duration : 0;

  const dispatch = useAppDispatch();
  const [showSettings, setShowSettings] = useState(false);

  // Use custom hook for player functionality
  const { toggleFavorite, isFavorite } = usePlayer();

  if (!currentAudio) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-jlt-sage/95 backdrop-blur-lg border-t border-brand-200 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] p-2 transition-all duration-300">
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-brand-200 cursor-pointer group">
        <div
          className="h-full bg-brand-500 group-hover:bg-brand-600 transition-all"
          style={{ width: `${progress / duration * 100}%` }}
        />
      </div>

      <div className="flex items-center justify-between max-w-7xl mx-auto px-2 md:px-4 h-20">

        {/* Track Info (Clickable to Expand) */}
        <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => dispatch(setExpanded(true))}>
          <div className="w-14 h-14 bg-brand-100 rounded-xl flex items-center justify-center overflow-hidden shadow-sm border border-brand-200">
            <span className="text-3xl">🎵</span>
          </div>
          <div className="flex flex-col overflow-hidden">
            <h3 className="text-brand-900 font-bold truncate text-lg">{currentAudio.title}</h3>
            <span className="text-brand-600 text-xs font-semibold truncate">Unit 1 • General English</span>
          </div>
          {currentAudio.status === 'NEW' && (
            <span className="bg-brand-500 text-white text-[10px] px-1.5 py-0.5 rounded ml-2 font-bold">NEW</span>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center flex-1">
          <div className="flex items-center gap-4 md:gap-8">
            <button
              onClick={async (e) => {
                e.stopPropagation();
                await toggleFavorite();
              }}
              className={`transition-all ${isFavorite()
                ? 'text-rose-500 hover:text-rose-600'
                : 'text-brand-400 hover:text-brand-600'
                }`}
              aria-label={isFavorite() ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart
                size={22}
                fill={isFavorite() ? "currentColor" : "none"}
                strokeWidth={2.5}
              />
            </button>

            <button onClick={(e) => { e.stopPropagation(); dispatch(prevTrack()); }} className="text-brand-700 hover:text-brand-900">
              <SkipBack size={28} fill="currentColor" />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); dispatch(playPause()); }}
              className="w-12 h-12 rounded-full bg-brand-500 text-white flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-brand-500/40"
            >
              {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
            </button>

            <button onClick={(e) => { e.stopPropagation(); dispatch(nextTrack()); }} className="text-brand-700 hover:text-brand-900">
              <SkipForward size={28} fill="currentColor" />
            </button>

            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); }}
                className={`text-brand-400 hover:text-brand-600 ${showSettings ? 'text-brand-600' : ''}`}
              >
                <Settings size={22} strokeWidth={2.5} />
              </button>

              {/* Relax Mode / Player Settings Popup */}
              {showSettings && (
                <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 w-64 bg-white border border-brand-200 rounded-xl p-4 shadow-xl text-sm">
                  <h4 className="font-bold text-brand-900 mb-2 border-b border-brand-100 pb-2">Relax Mode Config</h4>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between text-brand-800">
                      <span>Source</span>
                      <select className="bg-brand-50 border border-brand-200 rounded px-2 py-1 text-xs text-brand-900 outline-none">
                        <option>My List</option>
                        <option>Community</option>
                      </select>
                    </label>
                    <label className="flex items-center gap-2 text-brand-800">
                      <input type="checkbox" defaultChecked className="accent-brand-500" />
                      <span>Enable Quiz</span>
                    </label>
                    <label className="flex items-center gap-2 text-brand-800">
                      <input type="checkbox" className="accent-brand-500" />
                      <span>AI Explain Mode</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Volume & Misc */}
        <div className="hidden md:flex items-center justify-end flex-1 gap-4">
          <VolumeControl volume={volume} setVolume={(volume) => dispatch(setVolume(volume))} />
          <button onClick={() => dispatch(setExpanded(true))} className="text-brand-400 hover:text-brand-600">
            <Maximize2 size={20} />
          </button>
        </div>

      </div>
    </div>
  );
};

export default MiniPlayer;