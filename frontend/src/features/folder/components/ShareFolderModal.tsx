import React, { useState, useEffect } from 'react'; 
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchFolderShares, shareFolder, unshareFolder } from '@/store/features/folder/folderSlice';

interface ShareFolderModalProps {
  folderId: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function ShareFolderModal({ folderId, isOpen, onClose }: ShareFolderModalProps) {
  const dispatch = useAppDispatch();
  const { shares = [], loading, error } = useAppSelector(state => state.folder); 
  const [email, setEmail] = useState('');
  const [shareLoading, setShareLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchFolderShares(folderId));
    }
  }, [isOpen, folderId, dispatch]);

  const handleShare = async () => {
    if (!email) return;
    setShareLoading(true);
    try {
      await dispatch(shareFolder({ folderId, email })).unwrap();
      setEmail('');
      dispatch(fetchFolderShares(folderId)); 
    } catch (err) {
    } finally {
      setShareLoading(false);
    }
  };

  const handleUnshare = async (userId: number) => {
    try {
      await dispatch(unshareFolder({ folderId, userId })).unwrap();
      dispatch(fetchFolderShares(folderId));
    } catch (error) {
      console.error("Failed to unshare", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Share Folder</h2>
        <div className="mb-4 flex gap-2">
          <input
            type="email"
            placeholder="User email to share"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="flex-1 border px-3 py-2 rounded-lg"
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
          {loading ? (
            <div>Loading...</div>
          ) : (
            <ul>
              {shares?.map(s => (
                <li key={s.id} className="flex items-center justify-between py-1">
                  <span>{s.user.fullname} ({s.user.email})</span>
                  <button
                    onClick={() => handleUnshare(s.user.id)}
                    className="text-red-500 hover:underline text-sm"
                  >
                    Remove
                  </button>
                </li>
              ))}
              {shares?.length === 0 && <li className="text-gray-500">No shares yet</li>}
            </ul>
          )}
        </div>
        <button onClick={onClose} className="mt-6 w-full py-2 bg-gray-200 rounded-lg font-bold">Close</button>
      </div>
    </div>
  );
}