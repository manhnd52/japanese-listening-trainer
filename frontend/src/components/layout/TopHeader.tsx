'use client';

import { useState, useEffect, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { logout } from '@/store/features/auth/authSlice';
import { useRouter } from 'next/navigation';
import { Search, Flame, User as UserIcon, LogOut, Link, Upload, Coffee } from 'lucide-react';
import RelaxModeModal from '@/features/relax-mode/components/RelaxModeModal';
import { setRelaxModeSource, Source } from '@/store/features/player/playerSlice';
import { authApi } from '@/features/auth/api';
import { setStats } from '@/store/features/user/userSlice';

const TopHeader = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const user = useAppSelector(state => state.auth.user);
  const { stats, isCompletedToday } = useAppSelector(state => state.user);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRelaxModalOpen, setIsRelaxModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const currentExpInLevel = stats?.currentLevelExp ?? (stats?.exp || 0) % 100;
  const progressPercent = Math.min(100, Math.max(0, currentExpInLevel));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const loadStats = async () => {
      if (!user) return;
      try {
        const res = await authApi.getUserStats();
        if (res.success && res.data) {
          dispatch(setStats({
            streak: res.data.streak,
            level: res.data.level,
            exp: res.data.exp,
            lastActiveDate: res.data.lastActiveDate
          }));
        }
      } catch (error) {
        console.error("Failed to load user stats", error);
      }
    };
    loadStats();
  }, [user, dispatch]);

  const navigate = (path: string) => router.push(path);

  const handleLogout = () => {
    dispatch(logout());
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      document.cookie = 'accessToken=; path=/; max-age=0';
    }
    router.push('/login');
  };

  const handleRelaxModalSelect = (option: Source) => {
    dispatch(setRelaxModeSource(option));  
    setIsRelaxModalOpen(false);
  };

  return (
    <header className="h-16 bg-brand-500 border-b border-brand-600 flex items-center justify-between px-4 md:px-6 shrink-0 z-20 shadow-md fixed inset-x-0 top-0">

      {/* Left: Logo */}
      <div 
        onClick={() => navigate('/')}
        className="flex items-center gap-2 w-64 cursor-pointer hover:opacity-80 transition-opacity"
      >
        <div className="w-8 h-8 bg-jlt-cream rounded-lg flex items-center justify-center font-bold text-brand-500 text-lg shadow-sm">
          J
        </div>
        <span className="font-bold text-xl tracking-tight text-white">JLT</span>
      </div>
      
      {/* Right section */}
      <div className="flex items-center gap-3 md:gap-6">
        <div
          onClick={() => setIsRelaxModalOpen(true)}
          className="
            hidden md:flex items-center gap-2
            bg-jlt-cream text-brand-600
            px-4 py-2 rounded-full text-sm font-semibold
            shadow-lg
            hover:shadow-2xl
            hover:scale-110
            transition-all duration-300
            cursor-pointer select-none
            transform-gpu
          "
        >
          <Coffee className="w-5 h-5 animate-bounce-slow" />
          <span>Relax</span>
        </div>

        {/* Add audio */}
        <button
          onClick={() => navigate("/library?add=1")}
          className="
            hidden md:flex items-center gap-2 
            bg-jlt-peach text-brand-900 
            px-4 py-2 rounded-full text-sm font-bold
            shadow-sm border-b-2 border-orange-300
            hover:translate-y-0.5 hover:shadow-md
            transition-all
            focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-1
          "
        >
          <Upload className="w-4 h-4" />
          Add Audio
        </button>

        {/* Streak */}
        <div 
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all duration-300
            ${isCompletedToday 
              ? 'bg-orange-100 border-orange-200 shadow-[0_0_10px_rgba(251,146,60,0.5)]'
              : 'bg-brand-600/50 border-brand-400/30 opacity-70 grayscale'
            }`}
          title={isCompletedToday ? "Bạn đã duy trì chuỗi hôm nay!" : "Hãy nghe 1 bài để giữ chuỗi!"}
        >
          <Flame 
            className={isCompletedToday ? 'text-orange-500 fill-orange-500 animate-pulse' : 'text-gray-300 fill-gray-300'} 
            size={16} 
          />
          <span className={`font-bold text-sm ${isCompletedToday ? 'text-orange-600' : 'text-gray-200'}`}>
            {stats?.streak ?? 0}
          </span>
        </div>

        {/* Level info */}
        <div
          className="hidden md:flex flex-col items-end min-w-[120px]"
          onClick={() => navigate('/achievements')}
        >
          <div className="flex justify-between w-full items-baseline">
             <span className="text-sm font-bold text-white leading-none">
              Lv. {stats?.level ?? 1}
            </span>
             <span className="text-[10px] font-medium text-brand-100 leading-none">
              {currentExpInLevel}/100 XP
            </span>
          </div>
         
          {/* Thanh Progress Bar */}
          <div className="w-full h-2 bg-brand-800/50 rounded-full mt-1.5 overflow-hidden border border-brand-600/30">
            <div 
              className="h-full bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.6)] transition-all duration-700 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Avatar + Dropdown */}
        <div className="relative" ref={menuRef}>
          <div
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`h-9 w-9 rounded-full border flex items-center justify-center text-brand-600 overflow-hidden 
              cursor-pointer transition-colors ${isMenuOpen
                ? 'bg-white border-white ring-2 ring-brand-300'
                : 'bg-brand-100 border-brand-200 hover:border-white hover:bg-white'
              }`}
          >
            <UserIcon size={20} />
          </div>

          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-3 w-64 bg-white rounded-2xl shadow-xl border border-brand-100 overflow-hidden animate-fade-in z-50">
              <div className="p-4 bg-brand-50 border-b border-brand-100">
                <p className="text-brand-900 font-bold truncate">{user?.fullname}</p>
                <p className="text-brand-500 text-xs truncate">{user?.email}</p>
              </div>

              <div className="p-2">
                <button
                  onClick={() => { setIsMenuOpen(false); navigate('/profile'); }}
                  className="w-full text-left px-4 py-3 rounded-xl hover:bg-brand-50 text-brand-700 font-bold text-sm flex items-center gap-3 transition-colors"
                >
                  <UserIcon size={18} /> My Profile
                </button>

                <div className="h-px bg-brand-100 my-1"></div>

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 rounded-xl hover:bg-rose-50 text-rose-500 font-bold text-sm flex items-center gap-3 transition-colors"
                >
                  <LogOut size={18} /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <RelaxModeModal
        isOpen={isRelaxModalOpen}
        onClose={() => setIsRelaxModalOpen(false)}
        onSelectOption={handleRelaxModalSelect}
      />
    </header>
  );
};

export default TopHeader;