'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
// import { Modal, message } from 'antd';
import {
  Folder,
  Plus,
  Lock,
  Unlock,
  Music,
  Edit,
  Trash2,
} from 'lucide-react';

import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import {
  fetchFolders,
  createFolder as createFolderThunk,
  updateFolderThunk,
  deleteFolder,
} from '@/store/features/folder/folderSlice';
import { Folder as FolderType } from '@/features/folder/types';
import CreateFolderModal from '@/features/folder/components/CreateFolderModal';

const FoldersPage = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { folders, loading, error } = useAppSelector((state) => state.folder);
  const user = useAppSelector((state) => state.auth.user);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [editingFolder, setEditingFolder] = useState<FolderType | null>(null);

  // =====================
  // Fetch folders
  // =====================
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchFolders());
    }
  }, [user?.id, dispatch]);

  // =====================
  // Create
  // =====================
  const handleCreateFolder = async (name: string, isPublic: boolean) => {
    if (!user?.id) return;

    try {
      setCreateLoading(true);
      await dispatch(createFolderThunk({ name, isPublic })).unwrap();
      message.success('Tạo folder thành công');
      setIsModalOpen(false);
    } catch {
      message.error('Failed to create folder');
    } finally {
      setCreateLoading(false);
    }
  };

  // =====================
  // Update
  // =====================
  const handleUpdateFolder = async (name: string, isPublic: boolean) => {
    if (!editingFolder) return;

    try {
      await dispatch(
        updateFolderThunk({
          id: editingFolder.id,
          data: { name, isPublic },
        })
      ).unwrap();

      message.success('Cập nhật folder thành công');
      setEditingFolder(null);
    } catch {
      message.error('Cập nhật folder thất bại');
    }
  };

  // =====================
  // Delete
  // =====================
  const handleDeleteFolder = (folderId: number) => {
    Modal.confirm({
      title: 'Xóa folder?',
      content: 'Folder sẽ bị xóa vĩnh viễn. Bạn có chắc không?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await dispatch(deleteFolder(folderId)).unwrap();
          message.success('Đã xóa folder');
        } catch {
          message.error('Xóa folder thất bại');
        }
      },
    });
  };

  // =====================
  // Loading / Error
  // =====================
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => dispatch(fetchFolders())}
            className="px-4 py-2 bg-brand-500 text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // =====================
  // Render
  // =====================
  return (
    <div className="min-h-screen bg-jlt-cream p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Folders</h1>
          <p className="text-gray-600">
            Dễ dàng luyện tập cùng các folder do chính bạn tạo ra
          </p>
        </div>

        {/* Create button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="mb-6 flex items-center gap-2 px-4 py-3 bg-brand-500 text-white rounded-lg"
        >
          <Plus size={20} />
          Create New Folder
        </button>

        {/* Modal (Create + Edit) */}
        <CreateFolderModal
          isOpen={isModalOpen || !!editingFolder}
          onClose={() => {
            setIsModalOpen(false);
            setEditingFolder(null);
          }}
          onSubmit={editingFolder ? handleUpdateFolder : handleCreateFolder}
          loading={createLoading}
          initialData={editingFolder}
        />

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {folders.map((folder) => (
            <div
              key={folder.id}
              className="relative bg-white rounded-lg shadow group border hover:border-brand-400"
            >
              {/* Edit / Delete */}
              <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingFolder(folder);
                  }}
                  className="p-2 bg-white rounded-full shadow"
                >
                  <Edit size={16} className="text-blue-600" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteFolder(folder.id);
                  }}
                  className="p-2 bg-white rounded-full shadow"
                >
                  <Trash2 size={16} className="text-red-600" />
                </button>
              </div>

              <div
                className="p-6 cursor-pointer"
                onClick={() => router.push(`/folders/${folder.id}`)}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-brand-400 to-brand-600 rounded-lg flex items-center justify-center mb-4">
                  <Folder size={32} className="text-white" />
                </div>

                <h3 className="font-bold truncate mb-2">{folder.name}</h3>

                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span className="flex items-center gap-1">
                    <Music size={14} />
                    {folder._count?.audios ?? 0} audios
                  </span>
                  {folder.isPublic ? (
                    <Unlock size={14} className="text-green-600" />
                  ) : (
                    <Lock size={14} />
                  )}
                </div>

                <p className="text-xs text-gray-500">
                  Created {new Date(folder.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FoldersPage;
