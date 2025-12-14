'use client';

import { ChevronDown, Pencil, PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { playPause, setTrack, toggleFavoriteOptimistic } from '@/store/features/player/playerSlice';
import { useAudioDetail } from '../hooks';
import { useQuiz } from '@/features/quiz/useQuiz'; // Use global quiz system (same as MiniPlayer)
import { AudioStatus } from '@/types/types';
import AudioDetailInfo from './AudioDetailInfo';
import AudioScript from './AudioScript';
import { AudioTrack } from '@/types/types';

interface AudioDetailContainerProps {
  audioId: string;
  onBack: () => void;
}

/**
 * AudioDetailContainer Component
 * 
 * Main container that orchestrates all audio detail functionality
 * Integrates with Redux for playback control and state management
 */

export default function AudioDetailContainer({ audioId, onBack }: AudioDetailContainerProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  
  // Redux state
  const { currentAudio, isPlaying } = useAppSelector((state) => state.player);
  
  // Fetch audio details
  const { audio, loading, error } = useAudioDetail(audioId);
  
  // Global quiz hook - same as MiniPlayer uses
  const { triggerQuiz } = useQuiz();

  const handlePlay = () => {
    if (audio && currentAudio?.id !== audio.id) {
      // Set new track if different
      dispatch(setTrack({
        id: audio.id,
        title: audio.title,
        url: audio.fileUrl,
        duration: audio.duration,
        folderId: audio.folderId,
        status: (audio.status || AudioStatus.NEW) as AudioStatus,
        isFavorite: audio.isFavorite || false,
      }));
    } else if (!isPlaying) {
      // Resume playback
      dispatch(playPause());
    }
  };

  const handlePause = () => {
    if (isPlaying) {
      dispatch(playPause());
    }
  };

  const handleOpenQuiz = () => {
    handlePause();
    // Use global quiz system - same as MiniPlayer
    triggerQuiz(Number(audioId));
  };

  const handleToggleFavorite = () => {
    dispatch(toggleFavoriteOptimistic());
  };

  const handleEditQuiz = () => {
    // Navigate to quiz management page with this audio's ID pre-selected
    router.push(`/test-quiz?audioId=${audioId}`);
  };

  const handleEditAudio = () => {
    // TODO: Navigate to audio edit page or open modal
    console.log('Edit audio clicked');
  };

  const handleUpdateAudio = (updatedAudio: AudioTrack) => {
    // TODO: Persist audio updates to backend
    console.log('Update audio:', updatedAudio);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-jlt-cream">
        <div className="text-center space-y-4">
          <div className="animate-spin w-12 h-12 border-4 border-brand-200 border-t-brand-500 rounded-full mx-auto"></div>
          <p className="text-brand-500 font-bold">Loading audio details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !audio) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-jlt-cream">
        <div className="text-center space-y-4 p-8">
          <div className="text-6xl">😔</div>
          <h2 className="text-2xl font-bold text-brand-900">Audio Not Found</h2>
          <p className="text-brand-500">{error || 'Could not load audio details'}</p>
          <button
            onClick={onBack}
            className="bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-xl font-bold"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Use current audio from Redux if it matches, otherwise use fetched audio
  const displayAudio = currentAudio?.id === audio.id ? { ...audio, isFavorite: currentAudio.isFavorite } : audio;

  return (
    <div className="flex flex-col bg-jlt-cream animate-fade-in">
      {/* Top Navigation */}
      <div className="px-4 py-4 md:px-8 md:py-6 flex-shrink-0 w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-4 justify-between w-full">
          {/* Back button */}
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-brand-600 hover:text-brand-900 font-bold transition-colors"
          >
            <div className="bg-white p-2 rounded-full shadow-sm border border-brand-100">
              <ChevronDown size={20} />
            </div>
            <span className="text-lg">Hide</span>
          </button>

          {/* Right Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleEditAudio}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white hover:bg-brand-50 text-brand-600 font-bold text-sm transition-colors border border-brand-200"
            >
              <Pencil size={16} />
              <span>Edit</span>
            </button>

            <button
              onClick={handleEditQuiz}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white hover:bg-purple-50 text-brand-600 hover:text-purple-600 font-bold text-sm transition-colors border border-purple-200"
            >
              <div className="w-5 h-5 text-purple-600 rounded flex items-center justify-center">
                <PlusCircle size={14} />
              </div>
              <span>Manage Quizzes</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Split View */}
      <div className="flex-1 flex flex-col md:flex-row px-4 md:px-8 gap-6 overflow-hidden min-h-0 max-w-7xl mx-auto w-full">
        {/* LEFT SIDEBAR: Audio Info */}
        <AudioDetailInfo
          audio={displayAudio}
          isPlaying={isPlaying && currentAudio?.id === audio.id}
          onPlay={handlePlay}
          onPause={handlePause}
          onOpenQuiz={handleOpenQuiz}
          onToggleFavorite={handleToggleFavorite}
        />

        {/* RIGHT PANEL: Script / Content */}
        <AudioScript audio={audio} onUpdateAudio={handleUpdateAudio} />
      </div>
    </div>
  );
}
