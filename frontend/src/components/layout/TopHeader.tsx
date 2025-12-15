'use client';

import { useState, useEffect, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { logout } from '@/store/features/auth/authSlice';
import { useRouter } from 'next/navigation';
import { Search, Flame, User as UserIcon, LogOut, Link } from 'lucide-react';
import RelaxModeModal from '@/features/relax-mode/components/RelaxModeModal';
import { setRelaxModeSource, Source } from '@/store/features/player/playerSlice';

const TopHeader = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const user = useAppSelector(state => state.auth.user);
  const stats = useAppSelector(state => state.user.stats);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRelaxModalOpen, setIsRelaxModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navigate = (path: string) => router.push(path);

  const handleLogout = () => {
    // Clear Redux state
    dispatch(logout());
    
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      // Clear cookie
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
      
      {/* Center: Search */}
      <div className="flex-1 max-w-2xl mx-4 md:mx-8 hidden md:block">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-brand-200 group-focus-within:text-white transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-brand-400 rounded-full leading-5 bg-brand-600/50 text-white placeholder-brand-200 
              focus:outline-none focus:bg-brand-600 focus:border-white focus:ring-1 focus:ring-white sm:text-sm transition-all shadow-inner"
            placeholder="Search audio..."
          />
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3 md:gap-6">
        

        {/* Relax btn */}
        <div
          onClick={() => setIsRelaxModalOpen(true)}
          className="hidden md:block bg-jlt-peach text-brand-900 px-3 py-1 rounded-full text-sm font-bold shadow-sm 
            border-b-2 border-orange-300 cursor-pointer hover:translate-y-0.5 transition-transform"
        >
          Relax
        </div>

        <div
          onClick={() => navigate('/folders')}
          className="hidden md:block bg-jlt-peach text-brand-900 px-3 py-1 rounded-full text-sm font-bold shadow-sm 
            border-b-2 border-orange-300 cursor-pointer hover:translate-y-0.5 transition-transform"
        >
          My Folder
        </div>

        {/* Add audio */}
        <div
          onClick={() => navigate('/add-audio')}
          className="hidden md:block bg-jlt-peach text-brand-900 px-3 py-1 rounded-full text-sm font-bold shadow-sm 
            border-b-2 border-orange-300 cursor-pointer hover:translate-y-0.5 transition-transform"
        >
          Add Audio
        </div>

        {/* Streak */}
        <div className="flex items-center gap-1.5 bg-brand-600/50 px-3 py-1.5 rounded-lg border border-brand-400/30">
          <Flame className="text-jlt-peach fill-jlt-peach" size={16} />
          <span className="font-bold text-jlt-peach text-sm">
            {stats?.streak ?? 0}
          </span>
        </div>

        {/* Level info */}
        <div
          className="hidden md:flex flex-col items-end cursor-pointer"
          onClick={() => navigate('/achievements')}
        >
          <span className="text-sm font-bold text-white leading-none">
            Level {stats?.level ?? 1}
          </span>
          <span className="text-[10px] font-medium text-brand-100 leading-none mt-1">
            {stats?.exp ?? 0}/100 EXP
          </span>
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
