'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FolderOpen, Music, User, Settings, BarChart2} from 'lucide-react';

const menuItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: FolderOpen, label: 'Folders', path: '/folders' },
  { icon: Music, label: 'Library', path: '/library' },
  { icon: BarChart2, label: 'Stats', path: '/stats' },
  { icon: User, label: 'Profile', path: '/profile' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();

  // Sidebar is hidden on mobile, fixed on md+
  return (
    <aside
      className="hidden md:flex flex-col w-64 bg-white border-r border-brand-200 fixed left-0 top-16 bottom-0 pt-4 z-10"
      aria-label="Sidebar"
    >
      <nav className="flex-1 px-4 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              href={item.path}
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
  );
}