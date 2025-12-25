"use client"

import { useState, useRef, useEffect, type MouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Source } from '@/store/features/player/playerSlice';
import { Play, Pause, SkipForward, SkipBack, Heart, Volume2, Maximize2, X, Settings, ListMusic, HelpCircle } from 'lucide-react';
import {
  playPause,
  nextTrack,
  prevTrack,
  setVolume,
  setRelaxModeSource,
  toggleEnableQuiz,
  toggleAiExplainMode,
  toggleFavoriteOptimistic, // ✅ Thêm import
} from "@/store/features/player/playerSlice";
import { toggleFavorite } from '@/store/features/audio/audioSlice';
import { AudioTrack } from '@/store/features/player/playerSlice';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { useQuiz } from '@/features/quiz/useQuiz';
import VolumeControl from './VolumeControl';

function ProgressBar({
  progress,
  duration,
  onSeek
}: {
  progress: number;
  duration: number;
  onSeek: (sec: number) => void;
}) {
  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!duration || duration <= 0) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = clickX / rect.width;

    const sec = pct * duration;
    onSeek(sec);
  };

  const pct = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <div
      className="absolute top-0 left-0 right-0 h-1.5 bg-brand-200 cursor-pointer group"
      onClick={handleClick}
    >
      <div
        className="h-full bg-brand-500 group-hover:bg-brand-600 transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function TrackInfo({ currentAudio, onExpand }: { currentAudio: AudioTrack; onExpand: () => void }) {
  return (
    <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0 cursor-pointer" onClick={onExpand}>
      <div className="w-10 h-10 md:w-14 md:h-14 bg-brand-100 rounded-lg md:rounded-xl flex items-center justify-center overflow-hidden shadow-sm border border-brand-200 flex-shrink-0">
        <span className="text-xl md:text-3xl">🎵</span>
      </div>
      <div className="flex flex-col overflow-hidden min-w-0">
        <h3 className="text-brand-900 font-bold truncate text-sm md:text-lg">{currentAudio.title}</h3>
        <span className="text-brand-600 text-[10px] md:text-xs font-semibold truncate">Unit 1 • General English</span>
      </div>
      {currentAudio.status === 'NEW' && (
        <span className="bg-brand-500 text-white text-[10px] px-1.5 py-0.5 rounded ml-2 font-bold">NEW</span>
      )}
    </div>
  );
}

function SettingsPopup() {
  const dispatch = useAppDispatch();
  const relaxModeConfig = useAppSelector((state) => state.player.relaxModeConfig);

  return (
    <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 w-56 md:w-64 bg-white border border-brand-200 rounded-xl p-3 md:p-4 shadow-xl text-xs md:text-sm">
      <h4 className="font-bold text-brand-900 mb-2 border-b border-brand-100 pb-2">Relax Mode Config</h4>
      <div className="space-y-3">
        <label className="flex items-center justify-between text-brand-700">
          <span>Source</span>
          <select 
            className="bg-brand-50 border border-brand-200 rounded px-2 py-1 text-xs text-brand-900 outline-none"
            value={relaxModeConfig.source}
            onChange={(e) => dispatch(setRelaxModeSource(e.target.value as Source))}
          >
            <option value={Source.MyList}>My List</option>
            <option value={Source.Community}>Community</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-brand-700">
          <input 
            type="checkbox" 
            checked={relaxModeConfig.enableQuiz}
            onChange={() => dispatch(toggleEnableQuiz())}
            className="accent-brand-500" 
          />
          <span>Enable Quiz</span>
        </label>
        <label className="flex items-center gap-2 text-brand-700">
          <input 
            type="checkbox"
            checked={relaxModeConfig.aiExplainMode}
            onChange={() => dispatch(toggleAiExplainMode())}
            className="accent-brand-500" 
          />
          <span>AI Explain Mode</span>
        </label>
      </div>
    </div>
  );
}

function Controls({
  isPlaying,
  isFavorite,
  toggleFavorite,
  onPrev,
  onPlayPause,
  onNext,
  showSettings,
  setShowSettings,
  onQuiz,
}: {
  isPlaying: boolean;
  isFavorite: () => boolean;
  toggleFavorite: () => void;
  onPrev: () => void;
  onPlayPause: () => void;
  onNext: () => void;
  showSettings: boolean;
  setShowSettings: (v: boolean) => void;
  onQuiz: () => void;
}) {
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !(event.target instanceof Node && settingsRef.current.contains(event.target))) {
        setShowSettings(false);
      }
    };

    if (showSettings) {
      document.addEventListener('mousedown', handleClickOutside as unknown as EventListener);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside as unknown as EventListener);
    };
  }, [showSettings, setShowSettings]);

  return (
    <div className="flex flex-col items-center flex-1">
      <div className="flex items-center gap-2 md:gap-4 lg:gap-8">
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(); // ✅ Gọi hàm, không await
          }}
          className={`hidden md:inline-flex transition-all ${isFavorite() ? 'text-rose-500 hover:text-rose-600' : 'text-brand-400 hover:text-brand-600'}`}
          aria-label={isFavorite() ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart size={20} fill={isFavorite() ? 'currentColor' : 'none'} strokeWidth={2.5} />
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); onQuiz(); }}
          className="hidden md:inline-flex text-brand-400 hover:text-brand-600 transition-all"
          aria-label="Take quiz"
          title="Take quiz"
        >
          <HelpCircle size={20} strokeWidth={2.5} />
        </button>

        <button onClick={(e) => { e.stopPropagation(); onPrev(); }} className="text-brand-700 hover:text-brand-900">
          <SkipBack size={24} className="md:w-7 md:h-7" fill="currentColor" />
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); onPlayPause(); }}
          className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-brand-500 text-white flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-brand-500/40"
        >
          {isPlaying ? <Pause size={22} className="md:w-6 md:h-6" fill="currentColor" /> : <Play size={22} className="md:w-6 md:h-6 ml-0.5 md:ml-1" fill="currentColor" />}
        </button>

        <button onClick={(e) => { e.stopPropagation(); onNext(); }} className="text-brand-700 hover:text-brand-900">
          <SkipForward size={24} className="md:w-7 md:h-7" fill="currentColor" />
        </button>

        <div className="relative" ref={settingsRef}>
          <button
            onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); }}
            className={`text-brand-400 hover:text-brand-600 ${showSettings ? 'text-brand-600' : ''}`}
          >
            <Settings size={20} strokeWidth={2.5} />
          </button>

          {showSettings && <SettingsPopup />}
        </div>
      </div>
    </div>
  );
}

function VolumeSection({ volume, onVolume, onExpand }: { volume: number; onVolume: (v: number) => void; onExpand: () => void }) {
  return (
    <div className="hidden md:flex items-center justify-end flex-1 gap-4">
      <VolumeControl volume={volume} setVolume={onVolume} />
      <button onClick={onExpand} className="text-brand-400 hover:text-brand-600">
        <Maximize2 size={20} />
      </button>
    </div>
  );
}

const MiniPlayer = () => {
  const router = useRouter();
  const playerState = useAppSelector((state) => state.player);
  const currentAudio = playerState.currentAudio;
  const isPlaying = playerState.isPlaying;
  const volume = playerState.volume;
  const progress = playerState.progress;
  const duration = playerState.currentAudio?.duration ? playerState.currentAudio.duration : 0;

  const dispatch = useAppDispatch();
  const [showSettings, setShowSettings] = useState(false);

  const { user } = useAppSelector((state) => state.auth);
  const { triggerQuiz } = useQuiz();

  // ✅ Sửa: Dispatch 2 actions - optimistic update + async toggle
  const handleToggleFavorite = () => {
    if (!currentAudio || !user?.id) return;
    
    // ✅ Optimistic update: update UI ngay
    dispatch(toggleFavoriteOptimistic());
    
    // ✅ Backend sync: gọi async thunk
    dispatch(
      toggleFavorite({
        id: currentAudio.id as string,
        userId: user.id,
        isFavorite: !currentAudio.isFavorite,
      })
    );
  };

  const handleQuizClick = () => {
    if (currentAudio?.id) {
      triggerQuiz(Number(currentAudio.id));
    }
  };

  const handleExpand = () => {
    if (currentAudio?.id) {
      router.push(`/audios/${currentAudio.id}`);
    }
  };

  if (!currentAudio) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-jlt-sage/95 backdrop-blur-lg border-t border-brand-200 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] py-1 md:py-2 transition-all duration-300">
      <ProgressBar
        progress={progress}
        duration={duration}
        onSeek={(sec) => {
          document.dispatchEvent(
            new CustomEvent("player:seek", { detail: { sec } })
          );
        }}
      />

      <div className="flex items-center gap-2 md:gap-4 max-w-7xl mx-auto px-2 md:px-4 h-16 md:h-20">
        <TrackInfo currentAudio={currentAudio} onExpand={handleExpand} />

        <Controls
          isPlaying={isPlaying}
          isFavorite={() => !!currentAudio.isFavorite}
          toggleFavorite={handleToggleFavorite}
          onPrev={() => dispatch(prevTrack())}
          onPlayPause={() => dispatch(playPause())}
          onNext={() => dispatch(nextTrack())}
          showSettings={showSettings}
          setShowSettings={setShowSettings}
          onQuiz={handleQuizClick}
        />

        <VolumeSection
          volume={volume}
          onVolume={(v) => dispatch(setVolume(v))}
          onExpand={handleExpand}
        />
      </div>
    </div>
  );
};

export default MiniPlayer;