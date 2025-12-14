'use client';

import React, { useState, useEffect } from 'react';
import { Folder as FolderIcon, Plus, MoreVertical, Users, Lock, ArrowRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchFolders, fetchAudios } from '@/store/features/audio/audioSlice';

interface Folder {
  id: number;
  name: string;
  isPublic: boolean;
  createdBy: number;
  _count?: {
    audios: number;
  };
}

const FolderListPage = () => {
  const dispatch = useAppDispatch();
  const { folders, loading } = useAppSelector(state => state.audio);
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    dispatch(fetchAudios()); // Fetch audios để tính count
    dispatch(fetchFolders(8));
  }, [dispatch]);

  const handleCreateFolder = async (name: string, isPublic: boolean) => {
    try {
      console.log('Create folder:', name, isPublic);
      setNewFolderName('');
      setIsCreating(false);
    } catch (error) {
      console.error('Failed to create folder:', error);
    }
  };

  const handleNavigate = (path: string) => {
    console.log('Navigate to:', path);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      handleCreateFolder(newFolderName, isPublic);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#FCFDF7] p-8 text-center">Loading folders...</div>;
  }

  return (
    <div className="min-h-screen bg-[#FCFDF7] p-4 md:p-8 pb-24">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-extrabold text-brand-900">My Folders</h1>
          <button 
            onClick={() => setIsCreating(true)}
            className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-colors shadow-md"
          >
            <Plus size={18} />
            <span>New Folder</span>
          </button>
        </div>

        {isCreating && (
          <div className="mb-8 bg-white border border-brand-200 p-6 rounded-2xl animate-fade-in shadow-sm">
            <h3 className="text-brand-900 font-bold mb-3">Create New Folder</h3>
            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
              <input 
                type="text" 
                placeholder="Folder Name" 
                autoFocus
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="flex-1 bg-brand-50 border border-brand-200 rounded-lg px-4 py-2 text-brand-900 focus:border-brand-500 focus:outline-none focus:bg-white transition-colors"
              />
              <div className="flex items-center gap-2 bg-brand-50 border border-brand-200 rounded-lg px-3">
                <label className="flex items-center gap-2 cursor-pointer text-brand-700 text-sm font-bold select-none">
                  <input 
                    type="checkbox" 
                    checked={isPublic} 
                    onChange={(e) => setIsPublic(e.target.checked)} 
                    className="accent-brand-500 w-4 h-4"
                  />
                  Public
                </label>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 text-brand-500 font-bold hover:text-brand-700">Cancel</button>
                <button type="submit" className="bg-brand-500 hover:bg-brand-600 text-white px-6 py-2 rounded-lg font-bold shadow-sm">Create</button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {folders.map(folder => (
            <div 
              key={folder.id} 
              onClick={() => handleNavigate(`/folders/${folder.id}`)}
              className="group bg-white hover:bg-brand-50 border border-brand-200 hover:border-brand-300 rounded-3xl p-6 cursor-pointer transition-all hover:-translate-y-1 shadow-sm hover:shadow-lg"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${folder.isPublic ? 'bg-blue-100 text-blue-600' : 'bg-jlt-sage text-brand-600'}`}>
                  <FolderIcon fill="currentColor" size={28} />
                </div>
                <button className="text-brand-300 hover:text-brand-600 p-1 rounded-full hover:bg-brand-100 transition-colors">
                  <MoreVertical size={20} />
                </button>
              </div>
              
              <h3 className="text-xl font-bold text-brand-900 mb-1 truncate">{folder.name}</h3>
              <p className="text-brand-500 text-xs font-semibold mb-6">{folder._count?.audios || 0} audio tracks</p>
              
              <div className="flex items-center justify-between text-xs border-t border-brand-100 pt-3 mt-2">
                <span className="flex items-center gap-1.5 text-brand-400 font-medium">
                  {folder.isPublic ? <Users size={14} /> : <Lock size={14} />}
                  {folder.isPublic ? 'Public' : 'Private'}
                </span>
                <span className="text-brand-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  Open <ArrowRight size={14} />
                </span>
              </div>
            </div>
          ))}
        </div>

        {folders.length === 0 && (
          <div className="text-center py-12 text-brand-400">
            <FolderIcon size={48} className="mx-auto mb-4 opacity-50" />
            <p>No folders yet. Create your first folder!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FolderListPage;