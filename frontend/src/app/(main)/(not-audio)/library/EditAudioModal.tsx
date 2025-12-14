'use client';

import React, { useState, useEffect } from 'react';
import { X, Folder } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { updateAudio, clearError } from '@/store/features/audio/audioSlice';
import { AudioTrack } from '@/types/types';

interface EditAudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  audio: AudioTrack | null;
}

const EditAudioModal: React.FC<EditAudioModalProps> = ({ isOpen, onClose, audio }) => {
  const dispatch = useAppDispatch();
  const { folders, loading, error } = useAppSelector(state => state.audio);
  const { user } = useAppSelector(state => state.auth); // ✅ Lấy user từ Redux

  // Initialize state from audio prop only when modal opens
  const [title, setTitle] = useState(audio?.title || '');
  const [script, setScript] = useState(audio?.script || '');
  const [folderId, setFolderId] = useState(audio?.folderId?.toString() || '');

  // Reset form when audio changes or modal opens
  useEffect(() => {
    if (isOpen && audio) {
      setTitle(audio.title);
      setScript(audio.script || '');
      setFolderId(audio.folderId?.toString() || '');
    }
  }, [isOpen, audio]);

  useEffect(() => {
    if (error) {
      alert(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      alert('User not authenticated');
      return;
    }

    if (!audio || !title.trim()) {
      alert('Title is required');
      return;
    }

    const result = await dispatch(updateAudio({
      id: audio.id,
      data: { title, script, folderId },
      userId: user.id // ✅ Truyền userId
    }));

    if (updateAudio.fulfilled.match(result)) {
      alert('Audio updated successfully!');
      handleClose();
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen || !audio) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm animate-fade-in" onClick={handleClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl m-4 border border-brand-200 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-brand-200 sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-extrabold text-brand-900">Edit Audio</h2>
          <button onClick={handleClose} className="p-1 hover:bg-brand-50 rounded-full transition-colors">
            <X size={24} className="text-brand-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-bold text-brand-900 mb-2">Title *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-brand-50 border border-brand-200 rounded-lg px-4 py-3 text-brand-900 focus:border-brand-500 focus:outline-none focus:bg-white transition-colors"
              placeholder="Enter audio title"
              required
            />
          </div>

          {/* Script */}
          <div>
            <label className="block text-sm font-bold text-brand-900 mb-2">Script / Transcript</label>
            <textarea
              value={script}
              onChange={e => setScript(e.target.value)}
              className="w-full bg-brand-50 border border-brand-200 rounded-lg px-4 py-3 text-brand-900 focus:border-brand-500 focus:outline-none focus:bg-white transition-colors min-h-[120px]"
              placeholder="Enter Japanese script or transcript..."
            />
          </div>

          {/* Folder */}
          <div>
            <label className="block text-sm font-bold text-brand-900 mb-2">Folder *</label>
            <div className="relative">
              <Folder size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-400" />
              <select
                value={folderId}
                onChange={e => setFolderId(e.target.value)}
                className="w-full bg-brand-50 border border-brand-200 rounded-lg pl-10 pr-4 py-3 text-brand-900 focus:border-brand-500 focus:outline-none focus:bg-white transition-colors appearance-none"
                required
              >
                <option value="">Select a folder</option>
                {folders.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-6 py-3 border border-brand-300 text-brand-700 font-bold rounded-lg hover:bg-brand-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {loading ? 'Updating...' : 'Update Audio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAudioModal;