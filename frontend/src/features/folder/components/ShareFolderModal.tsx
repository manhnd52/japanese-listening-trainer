'use client';

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import {
  shareFolder,
  removeShare,
} from '@/store/features/sharring/sharringSlice';
import type { FolderShare } from '@/store/features/sharring/sharringSlice';

interface ShareFolderModalProps {
  folderId: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function ShareFolderModal({
  folderId,
  isOpen,
  onClose,
}: ShareFolderModalProps) {
  const dispatch = useAppDispatch();
  const folder = useAppSelector((state) => state.folder.currentFolder);

  const [shares, setShares] = useState<FolderShare[]>([]);
  const [email, setEmail] = useState('');
  const [shareLoading, setShareLoading] = useState(false);
  const [unsharingUserId, setUnsharingUserId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (folder && folder.id === folderId && Array.isArray(folder.folderShares)) {
      setShares(folder.folderShares as FolderShare[]);
    }
  }, [folder, folderId]);

  const handleShare = async () => {
    if (!email) return;

    setShareLoading(true);
    setError(null);
    try {
      const newShare = await dispatch(
        shareFolder({ folderId, email })
      ).unwrap();
      setShares((prev) => [...prev, newShare as FolderShare]);
      setEmail('');
    } catch (err) {
      console.error('Failed to share folder:', err);
      setError(
        typeof err === 'string' ? err : 'Failed to share folder'
      );
    } finally {
      setShareLoading(false);
    }
  };

  const handleUnshare = async (userId: number) => {
    setUnsharingUserId(userId);
    try {
      await dispatch(
        removeShare({ folderId, userId })
      ).unwrap();
    } catch (err) {
      console.error('Failed to unshare:', err);
      setError(
        typeof err === 'string' ? err : 'Failed to unshare'
      );
    } finally {
      setUnsharingUserId(null);
      setShares((prev) => prev.filter((s) => s.userId !== userId));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Share Folder</h2>

        <div className="mb-4 flex gap-2">
          <input
  type="email"
  placeholder="User email to share"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  className="flex-1 border px-3 py-2 rounded-lg 
             bg-white text-black 
             placeholder-gray-400
             focus:outline-none focus:ring-2 focus:ring-brand-500"
/>
          <button
            onClick={handleShare}
            disabled={shareLoading || !email}
            className="bg-brand-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-brand-600 disabled:opacity-50"
          >
            {shareLoading ? '...' : 'Share'}
          </button>
        </div>

        {error && <div className="text-red-600 mb-2">{error}</div>}

        <div>
          <h3 className="font-semibold mb-2">Shared with:</h3>

          <ul>
            {shares.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between py-1"
              >
                <span>
                  {s.user.fullname} ({s.user.email})
                </span>
                <button
                  onClick={() => handleUnshare(s.user.id)}
                  disabled={unsharingUserId === s.user.id}
                  className="text-red-500 hover:underline text-sm disabled:opacity-50"
                >
                  {unsharingUserId === s.user.id
                    ? 'Removing...'
                    : 'Remove'}
                </button>
              </li>
            ))}
            {shares.length === 0 && (
              <li className="text-gray-500">No shares yet</li>
            )}
          </ul>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-2 bg-gray-200 rounded-lg font-bold"
        >
          Close
        </button>
      </div>
    </div>
  );
}
