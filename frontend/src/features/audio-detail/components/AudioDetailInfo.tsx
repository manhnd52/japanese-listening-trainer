import React from 'react';
import { Play, Pause, Heart, Share2, HelpCircle } from 'lucide-react';
import { AudioTrack } from '@/types/types';

interface AudioDetailInfoProps {
  audio: AudioTrack;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onOpenQuiz: () => void;
  onToggleFavorite?: () => void;
}

/**
 * AudioDetailInfo Component
 * 
 * Left sidebar displaying audio metadata, controls, and stats
 * Includes play/pause, quiz button, favorite, and share actions
 */
export default function AudioDetailInfo({
  audio,
  isPlaying,
  onPlay,
  onPause,
  onOpenQuiz,
  onToggleFavorite,
}: AudioDetailInfoProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="w-full md:w-80 flex flex-col gap-6 flex-shrink-0">
      {/* Info Card */}
      <div className="bg-white p-6 rounded-3xl border border-brand-200 shadow-sm flex flex-col items-center text-center relative group">
        <div className="absolute top-4 right-4 flex gap-2">
          <button className="p-2 rounded-full transition-colors bg-brand-50 text-brand-300 hover:text-brand-600 hover:bg-brand-100">
            <Share2 size={20} />
          </button>
          <button
            onClick={onToggleFavorite}
            className={`p-2 rounded-full transition-colors ${
              audio.isFavorite ? 'bg-rose-50 text-rose-500' : 'bg-brand-50 text-brand-300 hover:text-brand-500'
            }`}
          >
            <Heart size={20} fill={audio.isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>

        <div className="w-48 h-48 aspect-square bg-brand-100 rounded-2xl mb-6 flex items-center justify-center text-brand-300 shadow-inner">
          <span className="text-6xl">💿</span>
        </div>

        <h1 className="text-xl md:text-2xl font-extrabold text-brand-900 mb-2 line-clamp-2">{audio.title}</h1>
        <p className="text-brand-500 font-bold text-sm mb-6 bg-brand-50 px-3 py-1 rounded-full inline-block">
          {audio.folder?.name || 'General English'}
        </p>

        {/* Play Controls */}
        <div className="flex items-center justify-center gap-4 w-full mb-6">
          <button
            onClick={isPlaying ? onPause : onPlay}
            className="w-16 h-16 bg-brand-500 hover:bg-brand-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-brand-500/40 transition-transform hover:scale-105"
          >
            {isPlaying ? (
              <Pause size={32} fill="currentColor" />
            ) : (
              <Play size={32} fill="currentColor" className="ml-1" />
            )}
          </button>

          <button
            onClick={onOpenQuiz}
            className="w-16 h-16 bg-jlt-peach hover:bg-orange-200 text-brand-900 rounded-full flex items-center justify-center shadow-lg shadow-orange-200/50 transition-transform hover:scale-105"
            title="Take Quiz"
          >
            <HelpCircle size={32} strokeWidth={2.5} />
          </button>
        </div>

        {/* Stats Row */}
        <div className="flex justify-center gap-6 text-xs font-bold text-brand-400 border-t border-brand-100 w-full pt-4">
          <div className="flex flex-col">
            <span className="text-brand-900 text-lg">0</span>
            <span>PLAYS</span>
          </div>
          <div className="flex flex-col">
            <span className="text-brand-900 text-lg">{formatDuration(audio.duration)}</span>
            <span>TIME</span>
          </div>
        </div>
      </div>
    </div>
  );
}
