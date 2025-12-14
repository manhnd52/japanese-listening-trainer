'use client';

import { useEffect, useState } from 'react';
import { useAppSelector } from '@/hooks/redux';
import { Folder, Plus, Lock, Unlock, Music } from 'lucide-react';
import { getFolders, createFolder } from '@/features/folder/api';
import { Folder as FolderType } from '@/features/folder/types';
import CreateFolderModal from '@/features/folder/components/CreateFolderModal';

const FoldersPage = () => {
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    if (user) {
      fetchFolders();
    }
  }, [user]);

  const fetchFolders = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await getFolders(user.id);
      setFolders(data);
    } catch (err) {
      console.error('Error fetching folders:', err);
      setError('Failed to load folders');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async (name: string, isPublic: boolean) => {
    if (!user?.id) return;
    
    try {
      setCreateLoading(true);
      await createFolder({ name, isPublic, userId: user.id });
      setIsModalOpen(false);
      await fetchFolders();
    } catch (err) {
      console.error('Error creating folder:', err);
      alert('Failed to create folder');
    } finally {
      setCreateLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading folders...</p>
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
            onClick={fetchFolders}
            className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Folders</h1>
          <p className="text-gray-600">Dễ dàng luyện tập cùng các folder do chính bạn tạo ra</p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="mb-6 flex items-center gap-2 px-4 py-3 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors shadow-md hover:shadow-lg"
        >
          <Plus size={20} />
          <span className="font-semibold">Create New Folder</span>
        </button>

        {/* Create Folder Modal */}
        <CreateFolderModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateFolder}
          loading={createLoading}
        />

        {/* Folders Grid */}
        {folders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow">
            <Folder className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có folders</h3>
            <p className="text-gray-600 mb-6">Tạo thư mục đầu tiên để sắp xếp các audio của bạn</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
            >
              <Plus size={20} />
              <span>Create Folder</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {folders.map((folder) => (
              <div
                key={folder.id}
                className="bg-white rounded-lg shadow hover:shadow-xl transition-all cursor-pointer border border-gray-200 hover:border-brand-400 overflow-hidden group"
              >
                <div className="p-6">
                  {/* Folder Icon */}
                  <div className="w-16 h-16 bg-gradient-to-br from-brand-400 to-brand-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Folder className="text-white" size={32} />
                  </div>

                  {/* Folder Name */}
                  <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">
                    {folder.name}
                  </h3>

                  {/* Folder Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <Music size={16} />
                      <span>{folder._count?.audios ?? 0} audio{(folder._count?.audios ?? 0) !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {folder.isPublic ? (
                        <Unlock size={16} className="text-green-600" />
                      ) : (
                        <Lock size={16} className="text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Created Date */}
                  <p className="text-xs text-gray-500">
                    Created {new Date(folder.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Hover Actions */}
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="text-brand-600 text-sm font-semibold hover:text-brand-700">
                    Open Folder →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FoldersPage;
