'use client';
import  { useEffect, useState } from 'react';
import {  Play } from 'lucide-react';

import { fetchAudios } from '@/lib/api'; 

type Audio = {
  id: number;
  title: string;
  overview?: string;
  fileUrl: string;
  duration: number;
  folder: { name: string };
  
};

const Home = () => {
  const [recentAudios, setRecentAudios] = useState<Audio[]>([]);

  useEffect(() => {
    fetchAudios().then(setRecentAudios);
  }, []);

  

  return (
    <div className="p-4 md:p-8 space-y-8 pb-24 max-w-7xl mx-auto">
      

      
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-brand-900">Recently Listening</h2>
          <button
            onClick={() => window.location.href = '/library'}
            className="text-brand-600 font-bold text-sm hover:underline"
          >
            View All
          </button>
        </div>
        <div className="space-y-3">
          {recentAudios.map((audio) => (
            <div
              key={audio.id}
              className="group flex items-center justify-between bg-brand-100 hover:bg-white p-3 rounded-xl border border-transparent hover:border-brand-300 cursor-pointer transition-all shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-200 rounded-full flex items-center justify-center text-lg text-brand-700 shadow-inner">
                  🎵
                </div>
                <div>
                  <h4 className="font-bold text-brand-900 group-hover:text-brand-700 transition-colors">
                    {audio.title}
                  </h4>
                  <p className="text-xs text-brand-600 font-medium">
                    {audio.folder?.name}
                  </p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-brand-300 flex items-center justify-center text-brand-500 group-hover:bg-brand-500 group-hover:text-white group-hover:border-transparent transition-all">
                <Play size={14} fill="currentColor" className="ml-0.5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;