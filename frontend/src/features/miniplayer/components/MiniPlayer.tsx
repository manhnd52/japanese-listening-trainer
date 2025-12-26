"use client";

import { useState, useRef, useEffect, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { Source, setIsPlaying } from "@/store/features/player/playerSlice";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Heart,
  Maximize2,
  Settings,
  HelpCircle,
} from "lucide-react";

import {
  nextTrack,
  prevTrack,
  setVolume,
  setRelaxModeSource,
  toggleEnableQuiz,
  toggleAiExplainMode,
  toggleFavoriteOptimistic,
} from "@/store/features/player/playerSlice";

import { toggleFavorite } from "@/store/features/audio/audioSlice";
import { AudioTrack } from "@/store/features/player/playerSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { useQuiz } from "@/features/quiz/useQuiz";
import VolumeControl from "./VolumeControl";
import MiniPlayerMenu from "./MiniPlayerMenu";
import { useRelaxMode } from "@/features/relax-mode/hooks";
import { message } from "antd";

function ProgressBar({
  progress,
  duration,
  onSeek,
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

function TrackInfo({
  currentAudio,
  onExpand,
}: {
  currentAudio: AudioTrack;
  onExpand: () => void;
}) {
  // Luôn tính lại status dựa trên listenCount (giống AudioList)
  const listenCount =
    typeof currentAudio.listenCount === "number" ? currentAudio.listenCount : 0;
  const status = listenCount === 0 ? "NEW" : "NORMAL";

  return (
    <div
      className="flex items-center gap-2 md:gap-4 flex-1 min-w-0 cursor-pointer"
      onClick={onExpand}
    >
      <div className="w-10 h-10 md:w-14 md:h-14 bg-brand-100 rounded-lg md:rounded-xl flex items-center justify-center overflow-hidden shadow-sm border border-brand-200 flex-shrink-0">
        <span className="text-xl md:text-3xl">🎵</span>
      </div>
      <div className="flex flex-col overflow-hidden min-w-0">
        <div className="hidden md:block">
          <h3 className="text-brand-900 font-bold truncate text-sm md:text-lg">
            {currentAudio.title}
          </h3>
        </div>

        <div className="md:hidden relative w-full overflow-hidden">
          <div className="flex min-w-full gap-6 animate-marquee text-brand-900 font-bold text-sm">
            <span className="whitespace-nowrap">{currentAudio.title}</span>
            <span className="whitespace-nowrap">{currentAudio.title}</span>
          </div>
        </div>

        <span className="text-brand-600 text-[10px] md:text-xs font-semibold truncate hidden md:block">
          Unit 1 • General English
        </span>
      </div>
      {status === "NEW" && (
        <span className="bg-brand-500 text-white text-[10px] px-1.5 py-0.5 rounded ml-2 font-bold">
          NEW
        </span>
      )}
    </div>
  );
}

function SettingsPopup({ onSourceChange }: { onSourceChange: (source: Source) => void }) {
  const dispatch = useAppDispatch();
  const relaxModeConfig = useAppSelector(
    (state) => state.player.relaxModeConfig
  );

  const handleSourceChange = (newSource: Source) => {
    dispatch(setRelaxModeSource(newSource));
    onSourceChange(newSource);
  };

  return (
    <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 w-56 md:w-64 bg-white border border-brand-200 rounded-xl p-3 md:p-4 shadow-xl text-xs md:text-sm">
      <h4 className="font-bold text-brand-900 mb-2 border-b border-brand-100 pb-2">
        Relax Mode Config
      </h4>
      <div className="space-y-3">
        <label className="flex items-center justify-between text-brand-700">
          <span>Source</span>
          <select
            className="bg-brand-50 border border-brand-200 rounded px-2 py-1 text-xs text-brand-900 outline-none"
            value={relaxModeConfig.source}
            onChange={(e) => handleSourceChange(e.target.value as Source)}
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
  onSourceChange,
  onExpand,
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
  onSourceChange: (source: Source) => void;
  onExpand: () => void;
}) {
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        settingsRef.current &&
        !(
          event.target instanceof Node &&
          settingsRef.current.contains(event.target)
        )
      ) {
        setShowSettings(false);
      }
    };

    if (showSettings) {
      document.addEventListener(
        "mousedown",
        handleClickOutside as unknown as EventListener
      );
    }

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside as unknown as EventListener
      );
    };
  }, [showSettings, setShowSettings]);

  const menuItems = [
    {
      label: isFavorite() ? "Remove from favorites" : "Add to favorites",
      icon: (
        <Heart
          className="w-4 md:w-5 h-4 md:h-5"
          fill={isFavorite() ? "currentColor" : "none"}
          strokeWidth={2.5}
        />
      ),
      onClick: toggleFavorite,
    },
    {
      label: "Take quiz",
      icon: <HelpCircle className="w-4 md:w-5 h-4 md:h-5" strokeWidth={2.5} />,
      onClick: onQuiz,
    },
    {
      label: "Settings",
      icon: <Settings className="w-4 md:w-5 h-4 md:h-5" strokeWidth={2.5} />,
      onClick: () => setShowSettings(true),
    },
    {
      label: "Open details",
      icon: <Maximize2 className="w-4 md:w-5 h-4 md:h-5" />,
      onClick: onExpand,
    },
  ];

  return (
    <div className="flex flex-col items-center flex-1">
      <div className="flex w-full items-center gap-2 md:gap-4 lg:gap-8">
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite();
            }}
            className={`inline-flex transition-all ${
              isFavorite()
                ? "text-rose-500 hover:text-rose-600"
                : "text-brand-400 hover:text-brand-600"
            }`}
            aria-label={
              isFavorite() ? "Remove from favorites" : "Add to favorites"
            }
          >
            <Heart
              className="w-5 md:w-6 h-5 md:h-6"
              fill={isFavorite() ? "currentColor" : "none"}
              strokeWidth={2.5}
            />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuiz();
            }}
            className="text-brand-400 hover:text-brand-600 transition-all"
            aria-label="Take quiz"
            title="Take quiz"
          >
            <HelpCircle className="w-5 md:w-6 h-5 md:h-6" strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex items-center gap-2 md:gap-4 flex-1 justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            className="text-brand-700 hover:text-brand-900"
          >
            <SkipBack className="w-5 md:w-7 h-5 md:h-7" fill="currentColor" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlayPause();
            }}
            className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-brand-500 text-white flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-brand-500/40"
          >
              {isPlaying ? (
                <Pause className="w-5 md:w-6 h-5 md:h-6" fill="currentColor" />
              ) : (
                <Play
                  className="w-5 md:w-6 h-5 md:h-6 ml-0.5 md:ml-1"
                  fill="currentColor"
                />
              )}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="text-brand-700 hover:text-brand-900"
          >
            <SkipForward className="w-5 md:w-7 h-5 md:h-7" fill="currentColor" />
          </button>
        </div>

        <div className="relative flex items-center gap-2" ref={settingsRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowSettings(!showSettings);
            }}
            className={`hidden md:inline-flex text-brand-400 hover:text-brand-600 transition-colors ${
              showSettings ? "text-brand-600" : ""
            }`}
            aria-label="Open relax mode settings"
          >
            <Settings className="w-5 md:w-6 h-5 md:h-6" strokeWidth={2.5} />
          </button>

          <div className="md:hidden">
            <MiniPlayerMenu items={menuItems} />
          </div>

          {showSettings && <SettingsPopup onSourceChange={onSourceChange} />}
        </div>
      </div>
    </div>
  );
}

function VolumeSection({
  volume,
  onVolume,
  onExpand,
}: {
  volume: number;
  onVolume: (v: number) => void;
  onExpand: () => void;
}) {
  return (
    <div className="hidden md:flex items-center justify-end flex-1 gap-4">
      <VolumeControl volume={volume} setVolume={onVolume} />
      <button
        onClick={onExpand}
        className="text-brand-400 hover:text-brand-600"
      >
        <Maximize2 className="w-4 md:w-5 h-4 md:h-5" />
      </button>
    </div>
  );
}

const MiniPlayer = () => {
  const router = useRouter();
  const playerState = useAppSelector((state) => state.player);
  const user = useAppSelector((state) => state.auth.user);
  const currentAudio = playerState.currentAudio;
  const isPlaying = playerState.isPlaying;
  const volume = playerState.volume;
  const progress = playerState.progress;
  const duration = playerState.currentAudio?.duration
    ? playerState.currentAudio.duration
    : 0;

  const dispatch = useAppDispatch();
  const [showSettings, setShowSettings] = useState(false);

  const { triggerQuiz } = useQuiz();

  // Lấy user từ state để gọi API favorite
  // Sử dụng hook useRelaxMode để load random audios
  const { loadRandomAudios } = useRelaxMode();

  const handleToggleFavorite = async () => {
    if (!currentAudio || !user?.id) return;

    dispatch(toggleFavoriteOptimistic());

    dispatch(
      toggleFavorite({
        id: currentAudio.id as string,
        userId: user.id,
        isFavorite: !currentAudio.isFavorite,
      })
    );
  };

  const handleQuizClick = async () => {
    if (currentAudio?.id) {
      const hasQuiz = await triggerQuiz(Number(currentAudio.id));
      if (!hasQuiz) {
        message.info('No quiz available for this audio.');
      }
    }
  };

  const handleExpand = () => {
    if (currentAudio?.id) {
      router.push(`/audios/${currentAudio.id}`);
    }
  };

  // Chỉ toggle isPlaying, không reload audio
  const handlePlayPause = () => {
    dispatch(setIsPlaying(!isPlaying));
  };

  const handleSourceChange = async (newSource: Source) => {
    
    // Load random audios from new source
    await loadRandomAudios(newSource);
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
          onPlayPause={handlePlayPause}
          onNext={() => dispatch(nextTrack())}
          showSettings={showSettings}
          setShowSettings={setShowSettings}
          onQuiz={handleQuizClick}
          onSourceChange={handleSourceChange}
          onExpand={handleExpand}
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
