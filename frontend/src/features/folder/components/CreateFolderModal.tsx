'use client';

import { useEffect, useState } from 'react';
import { X, Lock, Unlock } from 'lucide-react';

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, isPublic: boolean) => void;
  loading?: boolean;
  initialData?: {
    name: string;
    isPublic: boolean;
  } | null;
}

const CreateFolderModal = ({
  isOpen,
  onClose,
  onSubmit,
  loading,
  initialData,
}: CreateFolderModalProps) => {
  const [folderName, setFolderName] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFolderName(initialData.name);
      setIsPublic(initialData.isPublic);
    } else {
      setFolderName('');
      setIsPublic(false);
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) return;
    onSubmit(folderName.trim(), isPublic);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold">
            {initialData ? 'Edit Folder' : 'Create Folder'}
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Folder name */}
          <div>
            <label className="text-sm font-semibold text-gray-700">
              Folder name
            </label>
            <input
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="e.g. JLPT N3 Listening"
              disabled={loading}
              autoFocus
              className="mt-2 w-full rounded-xl border px-4 py-3 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 outline-none"
            />
          </div>

          {/* Public switch */}
          <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
            <div className="flex items-center gap-3">
              {isPublic ? (
                <Unlock className="text-green-600" size={18} />
              ) : (
                <Lock className="text-gray-500" size={18} />
              )}
              <div>
                <p className="text-sm font-semibold">
                  {isPublic ? 'Public folder' : 'Private folder'}
                </p>
                <p className="text-xs text-gray-500">
                  {isPublic
                    ? 'Ai cũng có thể xem folder này'
                    : 'Chỉ mình bạn có thể xem'}
                </p>
              </div>
            </div>

            {/* Switch */}
            <button
              type="button"
              onClick={() => setIsPublic(!isPublic)}
              disabled={loading}
              className={`relative w-11 h-6 rounded-full transition ${
                isPublic ? 'bg-brand-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
                  isPublic ? 'right-0.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-xl border py-2.5 text-sm font-semibold hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !folderName.trim()}
              className="flex-1 rounded-xl bg-brand-500 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:bg-gray-300"
            >
              {loading
                ? 'Saving...'
                : initialData
                ? 'Save changes'
                : 'Create folder'}
            </button>
          </div>
        </form>
      </div>

      {/* Animation */}
      <style jsx>{`
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default CreateFolderModal;
