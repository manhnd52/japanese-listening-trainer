'use client';

import React, { useState, useEffect } from 'react';
import { X, Upload, Folder } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { uploadAudio, fetchFolders, clearError } from '@/store/features/audio/audioSlice';
import { message } from "antd";
import { Progress } from "antd"; // ✅ import Progress

interface UploadAudioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UploadAudioModal: React.FC<UploadAudioModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const { folders, loading, error, uploadProgress } = useAppSelector(state => state.audio); // ✅ lấy uploadProgress
  const { user } = useAppSelector(state => state.auth);

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [script, setScript] = useState('');
  const [folderId, setFolderId] = useState('');
  const [duration, setDuration] = useState('');

  useEffect(() => {
    if (isOpen && user?.id) {
      dispatch(fetchFolders(user.id));
    }
  }, [isOpen, dispatch, user?.id]);

  useEffect(() => {
    if (error) {
      message.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (!title) {
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
      }
      const audio = new Audio(URL.createObjectURL(selectedFile));
      audio.onloadedmetadata = () => {
        setDuration(Math.floor(audio.duration).toString());
      };
    }
  };

  const handleScriptFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    const text = await selectedFile.text();
    setScript(text);
    e.target.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      message.error('User not authenticated');
      return;
    }

    if (!file || !title || !folderId || !duration) {
      message.warning('Please fill all required fields');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('script', script);
    formData.append('folderId', folderId);
    formData.append('duration', duration);

    const result = await dispatch(uploadAudio({ formData, userId: user.id }));
    if (uploadAudio.fulfilled.match(result)) {
      message.success('Audio uploaded successfully!');
      handleClose();
    }
  };

  const handleClose = () => {
    setFile(null);
    setTitle('');
    setScript('');
    setFolderId('');
    setDuration('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/20 backdrop-blur-sm animate-fade-in" onClick={handleClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl m-4 border border-brand-200 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-brand-200 sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-extrabold text-brand-900">Upload Audio</h2>
          <button onClick={handleClose} className="p-1 hover:bg-brand-50 rounded-full transition-colors">
            <X size={24} className="text-brand-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Progress Bar */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="w-full max-w-md mx-auto my-4">
              <Progress
                percent={uploadProgress}
                status={uploadProgress === 100 ? "success" : "active"}
                showInfo
                strokeColor="#22c55e"
                className="!bg-brand-100 !rounded-lg"
              />
              <div className="text-xs text-brand-500 mt-2 text-center">
                Uploading... {uploadProgress}%
              </div>
            </div>
          )}

          {/* File Upload */}
          <div>
            <label className="block text-sm font-bold text-brand-900 mb-2">Audio File *</label>
            <div className="relative">
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                className="hidden"
                id="audio-file"
              />
              <label
                htmlFor="audio-file"
                className="flex items-center justify-center gap-3 w-full p-6 border-2 border-dashed border-brand-300 rounded-xl cursor-pointer hover:border-brand-500 hover:bg-brand-50 transition-colors"
              >
                <Upload size={24} className="text-brand-500" />
                <span className="text-brand-700 font-bold">
                  {file ? file.name : 'Click to upload audio file'}
                </span>
              </label>
            </div>
          </div>

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
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-bold text-brand-900">Script / Transcript</label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept=".txt,.md"
                  onChange={handleScriptFileChange}
                  className="hidden"
                  id="script-file"
                />
                <label
                  htmlFor="script-file"
                  className="text-xs font-bold text-brand-600 hover:text-brand-700 cursor-pointer"
                >
                  Choose file
                </label>
              </div>
            </div>
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

          {/* Duration */}
          <div>
            <label className="block text-sm font-bold text-brand-900 mb-2">Duration (seconds) *</label>
            <input
              type="number"
              value={duration}
              onChange={e => setDuration(e.target.value)}
              className="w-full bg-brand-50 border border-brand-200 rounded-lg px-4 py-3 text-brand-900 focus:border-brand-500 focus:outline-none focus:bg-white transition-colors"
              placeholder="Auto-detected from file"
              required
              disabled
            />
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
              {loading ? 'Uploading...' : 'Upload Audio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadAudioModal;
