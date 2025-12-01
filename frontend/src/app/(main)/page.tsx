"use client";

import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { setTrack, playPause, toggleExpanded, toggleFavoriteOptimistic } from "@/store/features/player/playerSlice";
import { AudioStatus } from "@/types/types";
import { AudioTrack } from "@/store/features/player/playerSlice";

const DUMMY_TRACKS: AudioTrack[] = [
  {
    id: "1",
    title: "Lesson 1: Introduction",
    url: "https://www.vnjpclub.com/Audio/mimikaran3chokai/CD1/2.mp3",
    duration: 300,
    folderId: "folder-1",
    status: AudioStatus.NEW,
    isFavorite: false,
  },
  {
    id: "2",
    title: "Lesson 2: Basic Grammar",
    url: "https://www.vnjpclub.com/Audio/mimikaran3chokai/CD1/3.mp3",
    duration: 450,
    folderId: "folder-1",
    status: AudioStatus.IN_PROGRESS,
    isFavorite: true,
  },
  {
    id: "3",
    title: "Lesson 3: Vocabulary",
    url: "https://www.vnjpclub.com/Audio/mimikaran3chokai/CD1/4.mp3",
    duration: 200,
    folderId: "folder-2",
    status: AudioStatus.COMPLETED,
    isFavorite: false,
  }
];

export default function Home() {
  const dispatch = useAppDispatch();
  const playerState = useAppSelector((state) => state.player);

  const handlePlayTrack = (track: AudioTrack) => {
    dispatch(setTrack(track));
  };

  return (
    <div className="p-8 space-y-8 min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100">
      <h1 className="text-3xl font-bold">Player Store Demo</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Track List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Available Tracks</h2>
          <div className="flex flex-col gap-3">
            {DUMMY_TRACKS.map((track) => (
              <div
                key={track.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${playerState.currentAudio?.id === track.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'
                  }`}
                onClick={() => handlePlayTrack(track)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-lg">{track.title}</p>
                    <div className="flex gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <span>{Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}</span>
                      <span>•</span>
                      <span>{track.status}</span>
                    </div>
                  </div>
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm hover:bg-blue-700 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayTrack(track);
                    }}
                  >
                    Load Track
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Player State Visualization */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Current Store State</h2>

          {/* Controls */}
          <div className="flex gap-3 flex-wrap mb-4">
            <button
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${playerState.isPlaying
                ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              onClick={() => dispatch(playPause())}
            >
              {playerState.isPlaying ? 'Pause' : 'Play'}
            </button>
            <button
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${playerState.currentAudio?.isFavorite
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700'
                }`}
              onClick={() => dispatch(toggleFavoriteOptimistic())}
            >
              {playerState.currentAudio?.isFavorite ? '♥ Favorited' : '♡ Favorite'}
            </button>
            <button
              className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
              onClick={() => dispatch(toggleExpanded())}
            >
              {playerState.isExpanded ? 'Collapse Player' : 'Expand Player'}
            </button>
          </div>

          <div className="p-4 bg-gray-900 text-green-400 rounded-lg overflow-auto max-h-[600px] font-mono text-sm shadow-inner">
            <pre>
              {JSON.stringify(playerState, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
