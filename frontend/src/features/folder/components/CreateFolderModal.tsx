'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, isPublic: boolean) => void;
  loading?: boolean;
}

const CreateFolderModal = ({ isOpen, onClose, onSubmit, loading }: CreateFolderModalProps) => {
  const [folderName, setFolderName] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (folderName.trim()) {
      onSubmit(folderName.trim(), isPublic);
      setFolderName('');
      setIsPublic(false);
    }
  };

  const handleClose = () => {
    setFolderName('');
    setIsPublic(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Create New Folder</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label htmlFor="folderName" className="block text-sm font-semibold text-gray-700 mb-2">
              Folder Name
            </label>
            <input
              type="text"
              id="folderName"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              placeholder="Enter folder name"
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-4 h-4 text-brand-500 border-gray-300 rounded focus:ring-brand-500"
                disabled={loading}
              />
              <span className="text-sm text-gray-700">Công khai</span>
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-6">
              Người dùng khác có thể xem folders công khai của bạn
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
              disabled={loading || !folderName.trim()}
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFolderModal;
