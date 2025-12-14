'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { statsApi } from '@/features/stats/api';
import { audioApi } from '@/features/audios/api';
import { mergeRecentlyListened } from '@/store/features/audio/audioSlice';
import { Music, BarChart3, TrendingUp, RefreshCw } from 'lucide-react';
import { AudioTrack } from '@/types/types';
import { useAudioActions } from '@/features/audios/hooks';
import { Heart } from 'lucide-react';

interface UserStats {
  streak: number;
  totalListened: number;
  totalTime: number;
  level: number;
  exp: number;
  quizAccuracy: number;
  totalCorrectQuizzes: number;
  activity: { day: string; value: number }[];
  heatmap: { date: string; level: 0 | 1 | 2 | 3 | 4 }[];
  quizStats: {
    correct: number;
    wrong: number;
    totalCorrect: number;
    totalWrong: number;
  };
}

export default function HomePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth?.user);
  const audios = useAppSelector((state) => state.audio.audios);
  const { handlePlay, handleToggleFavorite} = useAudioActions();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch stats and recent audios
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const statsResponse = await statsApi.getStats();
        setStats(statsResponse.data.data);

        // Fetch recently listened audios và merge vào store
        if (user?.id) {
          const NUM_LISTENED = 5;
          const audiosResponse = await audioApi.getRecentlyListened(user.id, NUM_LISTENED);
          if (audiosResponse.data) {
            dispatch(mergeRecentlyListened(audiosResponse.data));
          }
        }
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user, dispatch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-brand-600" />
          <p className="text-gray-600">Loading Home...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition"
          >
            Retry
          </button>
          <Link 
            href="/review"
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition"
          >
            📝 Review Mistakes
          </Link>
        </div>
      </div>
    );
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto bg-jlt-cream min-h-screen">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.fullname || 'User'} 👋
        </h1>
        <p className="text-gray-600">Ready for your daily session?</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Total Listen Time */}
        <div className="bg-gradient-to-br from-green-50 to-green-100/50 border border-green-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-green-700 text-sm font-semibold uppercase tracking-wide mb-2">
                Total Listen Time
              </p>
              <h2 className="text-4xl font-bold text-green-900">
                {stats && stats.totalTime > 0
                  ? formatTime(stats.totalTime)
                  : '0m'}
              </h2>
            </div>
            <Music className="w-10 h-10 text-green-500" />
          </div>
        </div>

        {/* Quiz Accuracy */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-blue-700 text-sm font-semibold uppercase tracking-wide mb-2">
                Quiz Accuracy
              </p>
              <h2 className="text-4xl font-bold text-blue-900">
                {stats?.quizAccuracy || 0}%
              </h2>
            </div>
            <BarChart3 className="w-10 h-10 text-blue-500" />
          </div>
        </div>

        {/* Weekly Activity */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-purple-700 text-sm font-semibold uppercase tracking-wide mb-2">
                Weekly Activity
              </p>
              <div className="flex items-end gap-1">
                {stats?.activity && stats.activity.length > 0 ? (
                  stats.activity.map((day, idx) => (
                    <div
                      key={idx}
                      className="flex-1 bg-purple-500 rounded-sm"
                      style={{
                        height: `${Math.min(60, Math.max(10, day.value / 2))}px`,
                        opacity: day.value > 0 ? 1 : 0.3,
                      }}
                    />
                  ))
                ) : (
                  <p className="text-purple-500">No data yet</p>
                )}
              </div>
            </div>
            <TrendingUp className="w-10 h-10 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Relax Mode */}
        <button
          onClick={() => router.push('/relax-mode')}
          className="group bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200 rounded-2xl p-6 hover:from-amber-100 hover:to-amber-200/50 transition-all duration-300 text-left shadow-sm"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-amber-500"></div>
            </div>
          </div>
          <h3 className="text-xl font-bold text-amber-900 mb-1 group-hover:translate-x-1 transition">
            Relax Mode
          </h3>
          <p className="text-amber-700">Auto-play & Chill</p>
        </button>

        {/* Review Mistakes */}
        <button
          onClick={() => router.push('/review-mistakes')}
          className="group bg-gradient-to-br from-sky-50 to-sky-100/50 border border-sky-200 rounded-2xl p-6 hover:from-sky-100 hover:to-sky-200/50 transition-all duration-300 text-left shadow-sm"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-full bg-sky-500/20 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-sky-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-bold text-sky-900 mb-1 group-hover:translate-x-1 transition">
            Review Mistakes
          </h3>
          <p className="text-sky-700">Improve your weak spots</p>
        </button>
      </div>

      {/* Recently Listening Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Recently Listening</h2>
         <button
            onClick={() => router.push('/library')}
            className="text-brand-600 text-sm font-semibold
                        hover:underline hover:text-brand-700
                        transition"
            >
            View All
        </button>
        </div>

        {audios && audios.length > 0 ? (
          <div className="space-y-3">
            {audios.slice(0, 5).map((audio) => (
              <div
                key={audio.id}
                className="group bg-jlt-sage hover:bg-brand-200/70 rounded-xl p-3 transition-all flex items-center gap-4 shadow-sm border border-transparent hover:border-brand-300 cursor-pointer"
                onClick={() => handlePlay(audio)}
              >
                {/* Icon/Image */}
                <div className="w-12 h-12 flex-shrink-0 bg-brand-300/50 rounded-full flex items-center justify-center text-xl hover:bg-brand-500 hover:text-white transition-colors relative text-brand-700">
                  <div className="group-hover:hidden">🎵</div>
                  <svg
                    className="hidden group-hover:block w-5 h-5 fill-current"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-brand-900 font-bold text-lg truncate">
                    {audio.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-brand-600 font-medium mt-0.5">
                    <span>
                      {audio.duration ? `${Math.floor(audio.duration / 60)}:${String(audio.duration % 60).padStart(2, '0')}` : 'Unknown duration'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(audio);
                    }}
                    className={`transition ${audio.isFavorite ? 'red-600' : 'text-brand-400 hover:text-brand-600'}`}
                  >
                    <Heart size={22} fill={audio.isFavorite ? 'currentColor' : 'none'} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white border border-gray-200 rounded-xl shadow-sm">
            <Music className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">No recently listened audios</p>
            <button
              onClick={() => router.push('/library')}
              className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition inline-block"
            >
              Browse Library
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

