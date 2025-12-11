'use client';

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchAudios, fetchFolders } from '@/store/features/audio/audioSlice';
import AudioList from './AudioList';
import UploadAudioModal from './UploadAudioModal';
import { AudioTrack } from '@/types/types';

const LibraryPage = () => {
  const dispatch = useAppDispatch();
  const { audios, folders, loading } = useAppSelector(state => state.audio);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchAudios());
    dispatch(fetchFolders(8)); // TODO: lấy userId từ auth
  }, [dispatch]);

  const handlePlay = (audio: AudioTrack) => {
    console.log('Play:', audio);
    // TODO: dispatch player action
  };

  const handleSelect = (audio: AudioTrack) => {
    console.log('Select:', audio);
  };

  const handleAddAudio = () => {
    setUploadModalOpen(true);
  };

  const handleDelete = (id: string) => {
    console.log('Delete:', id);
    // TODO: dispatch delete action
  };

  const handleMove = (id: string, folderId: string) => {
    console.log('Move:', id, folderId);
    // TODO: dispatch move action
  };

  const handleEdit = (audio: AudioTrack) => {
    console.log('Edit:', audio);
    // TODO: open edit modal
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <>
      <AudioList
        audios={audios}
        folders={folders}
        onPlay={handlePlay}
        onSelect={handleSelect}
        onAddAudio={handleAddAudio}
        onDelete={handleDelete}
        onMove={handleMove}
        onEdit={handleEdit}
      />
      <UploadAudioModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
      />
    </>
  );
};

export default LibraryPage;