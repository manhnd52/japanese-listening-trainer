'use client';

import { Dispatch, SetStateAction, RefObject } from 'react';
import { User as UserIcon, LogOut } from 'lucide-react';

type User = {
  email?: string;
  username?: string;
  name?: string;
} | null;

type Props = {
  user: User;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  menuRef: RefObject<HTMLDivElement | null>;
  onNavigate: (path: string) => void;
  onLogout: () => void;
};

const UserMenu = ({ user, isOpen, setIsOpen, menuRef, onNavigate, onLogout }: Props) => {
  const displayName = user?.username || user?.name || 'User';

  return (
    <div className="relative" ref={menuRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`h-9 w-9 rounded-full border flex items-center justify-center text-brand-600 overflow-hidden 
          cursor-pointer transition-colors ${isOpen ? 'bg-white border-white ring-2 ring-brand-300' : 'bg-brand-100 border-brand-200 hover:border-white hover:bg-white'}`}
      >
        <UserIcon size={20} />
      </div>

      {isOpen && (
        <div className="absolute right-0 top-full mt-3 w-64 bg-white rounded-2xl shadow-xl border border-brand-100 overflow-hidden animate-fade-in z-50">
          <div className="p-4 bg-brand-50 border-b border-brand-100">
            <p className="text-brand-900 font-bold truncate">{displayName}</p>
            <p className="text-brand-500 text-xs truncate">{user?.email || ''}</p>
          </div>

          <div className="p-2">
            <button
              onClick={() => { setIsOpen(false); onNavigate('/profile'); }}
              className="w-full text-left px-4 py-3 rounded-xl hover:bg-brand-50 text-brand-700 font-bold text-sm flex items-center gap-3 transition-colors"
            >
              <UserIcon size={18} /> My Profile
            </button>

            <div className="h-px bg-brand-100 my-1"></div>

            <button
              onClick={onLogout}
              className="w-full text-left px-4 py-3 rounded-xl hover:bg-rose-50 text-rose-500 font-bold text-sm flex items-center gap-3 transition-colors"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
