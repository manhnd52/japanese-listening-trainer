'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FolderOpen, Music, User, Settings, BarChart2, RotateCcw, Menu, X } from 'lucide-react';

const menuItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: FolderOpen, label: 'Folders', path: '/folders' },
  { icon: Music, label: 'Library', path: '/library' },
  { icon: RotateCcw, label: 'Review', path: '/review' },
  { icon: BarChart2, label: 'Stats', path: '/stats' },
  { icon: User, label: 'Profile', path: '/profile' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      {/* Mobile Menu Button - Fixed top left */}
      <button
        onClick={toggleMobileMenu}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-brand-200 hover:bg-brand-50 transition-colors"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X size={24} className="text-brand-600" /> : <Menu size={24} className="text-brand-600" />}
      </button>

      {/* Backdrop Overlay - Mobile Only */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* Sidebar - Responsive */}
      <aside
        className={`
          fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-brand-200 pt-4 z-40
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:top-16 md:z-10
        `}
        aria-label="Sidebar"
      >
        {/* Mobile Header Space */}
        <div className="h-16 md:hidden flex items-center justify-center border-b border-brand-200 mb-4">
          <span className="text-xl font-bold text-brand-600">Menu</span>
        </div>

        <nav className="flex-1 px-4 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={closeMobileMenu}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                  isActive
                    ? 'bg-brand-500 text-white font-bold'
                    : 'text-brand-600 hover:bg-brand-50 hover:text-brand-900'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}