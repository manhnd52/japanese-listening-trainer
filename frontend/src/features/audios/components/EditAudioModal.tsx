'use client';

import React, { useState, useEffect } from 'react';
import { X, Folder } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { updateAudio, clearError, fetchAudios } from '@/store/features/audio/audioSlice';
import { AudioTrack } from '@/types/types';

interface EditAudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  audio: AudioTrack | null;
}

const EditAudioModal: React.FC<EditAudioModalProps> = ({ isOpen, onClose, audio }) => {
  const dispatch = useAppDispatch();
  const { folders, loading, error } = useAppSelector(state => state.audio);
  const { user } = useAppSelector(state => state.auth);

  // Initialize state
  const [title, setTitle] = useState('');
  const [script, setScript] = useState('');
  const [folderId, setFolderId] = useState('');

  // Reset form when audio changes or modal opens
  useEffect(() => {
    if (isOpen && audio) {
      setTitle(audio.title);
      setScript(audio.script || '');
      setFolderId(audio.folderId?.toString() || '');
    }
  }, [isOpen, audio]);

  // Handle Redux errors
  useEffect(() => {
    if (error) {
      alert(`Error: ${error}`); // Thay thế message.error của antd bằng alert
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      alert('Bạn cần đăng nhập để thực hiện thao tác này.');
      return;
    }

    if (!audio || !title.trim()) {
      alert('Vui lòng nhập tiêu đề audio.');
      return;
    }

    const result = await dispatch(updateAudio({
      id: audio.id,
      data: { title, script, folderId },
      userId: user.id 
    }));

    if (updateAudio.fulfilled.match(result)) {
      alert('Cập nhật Audio thành công!'); // Thay thế message.success của antd
      dispatch(fetchAudios({ userId: user.id }));
      handleClose();
    }
  };

  if (!isOpen || !audio) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in" 
      onClick={handleClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl m-4 border border-brand-200 max-h-[90vh] overflow-y-auto transform transition-all" 
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-brand-200 sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-extrabold text-brand-900">Edit Audio</h2>
          <button 
            onClick={handleClose} 
            className="p-2 hover:bg-brand-50 rounded-full transition-colors group"
            title="Close"
          >
            <X size={24} className="text-brand-400 group-hover:text-brand-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-bold text-brand-900 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-brand-50 border border-brand-200 rounded-lg px-4 py-3 text-brand-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 focus:outline-none focus:bg-white transition-all"
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
              className="w-full bg-brand-50 border border-brand-200 rounded-lg px-4 py-3 text-brand-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 focus:outline-none focus:bg-white transition-all min-h-[120px] resize-y"
              placeholder="Enter Japanese script or transcript..."
            />
          </div>

          {/* Folder */}
          <div>
            <label className="block text-sm font-bold text-brand-900 mb-2">
              Folder <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Folder size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-400 pointer-events-none" />
              <select
                value={folderId}
                onChange={e => setFolderId(e.target.value)}
                className="w-full bg-brand-50 border border-brand-200 rounded-lg pl-10 pr-4 py-3 text-brand-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 focus:outline-none focus:bg-white transition-all appearance-none cursor-pointer"
                required
              >
                <option value="">Select a folder</option>
                {folders.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
              {/* Custom arrow for select */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none border-t-4 border-l-4 border-transparent border-t-brand-400"></div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-brand-100 mt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-6 py-3 border border-brand-300 text-brand-700 font-bold rounded-lg hover:bg-brand-50 hover:border-brand-400 transition-all focus:ring-2 focus:ring-brand-100 focus:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg focus:ring-2 focus:ring-brand-300 focus:outline-none"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </span>
              ) : 'Update Audio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAudioModal;