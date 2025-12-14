'use client';

import { useState, useEffect, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { logout } from '@/store/features/auth/authSlice';
import { useRouter } from 'next/navigation';
import { Search, Flame, User as UserIcon, LogOut, Bell } from 'lucide-react';
import {apiClient} from '@/lib/api';

interface Notification {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const TopHeader = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const user = useAppSelector(state => state.auth.user);
  const stats = useAppSelector(state => state.user.stats);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [isNotiOpen, setIsNotiOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
      if (notiRef.current && !notiRef.current.contains(event.target as Node)) {
        setIsNotiOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        if (!user) return;
        const res = await apiClient.get('/notifications'); 
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      } catch (error) {
        console.error("Failed to fetch notifications", error);
        setNotifications([]);
      }
    };

    fetchNotifications();
  }, [user]); // Chạy lại khi user thay đổi

  const markAsRead = async (id: number) => {
    try {
        // Gọi API đánh dấu đã đọc (cần bổ sung API này ở backend nếu chưa có)
        // await apiClient.put(`/notifications/${id}/read`);
        
        // Cập nhật UI tạm thời
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
        console.error(error);
    }
  };

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

  return (
    <header className="h-16 bg-brand-500 border-b border-brand-600 flex items-center justify-between px-4 md:px-6 shrink-0 z-20 shadow-md relative">

      {/* Left: Logo */}
      <div className="flex items-center gap-2 w-64">
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
          onClick={() => navigate('/relax')}
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

        <div className="relative" ref={notiRef}>
            <button 
                onClick={() => setIsNotiOpen(!isNotiOpen)}
                className="relative p-2 text-brand-100 hover:text-white hover:bg-brand-600 rounded-full transition-colors"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-brand-500">
                        {unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Thông báo */}
            {isNotiOpen && (
                <div className="absolute right-0 top-full mt-3 w-80 bg-white rounded-xl shadow-xl border border-brand-100 overflow-hidden animate-fade-in z-50">
                    <div className="p-3 bg-brand-50 border-b border-brand-100 flex justify-between items-center">
                        <h3 className="font-bold text-brand-900 text-sm">Thông báo</h3>
                        <span className="text-xs text-brand-500 cursor-pointer hover:underline">Đánh dấu tất cả</span>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                        {(notifications?.length || 0) === 0 ? (
                            <div className="p-8 text-center text-gray-400 text-sm">Không có thông báo mới</div>
                        ) : (
                            notifications.map((noti) => (
                                <div 
                                    key={noti.id} 
                                    onClick={() => markAsRead(noti.id)}
                                    className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${!noti.isRead ? 'bg-blue-50/50' : ''}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <p className={`text-sm ${!noti.isRead ? 'font-bold text-brand-800' : 'text-gray-600'}`}>
                                            {noti.title}
                                        </p>
                                        {!noti.isRead && <span className="h-2 w-2 rounded-full bg-blue-500 mt-1.5"></span>}
                                    </div>
                                    <p className="text-xs text-gray-500 line-clamp-2">{noti.message}</p>
                                    <p className="text-[10px] text-gray-400 mt-1 text-right">
                                        {new Date(noti.createdAt).toLocaleDateString('vi-VN')}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
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
                <p className="text-brand-900 font-bold truncate">{user?.name}</p>
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
    </header>
  );
};

export default TopHeader;
