'use client';

import { Search } from 'lucide-react';

type Props = {
  className?: string;
};

const SearchBar = ({ className = '' }: Props) => {
  return (
    <div className={`flex-1 max-w-2xl mx-4 md:mx-8 ${className}`}>
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
  );
};

export default SearchBar;
