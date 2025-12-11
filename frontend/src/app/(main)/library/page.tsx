'use client';

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchAudios, fetchFolders, deleteAudio, moveAudio } from '@/store/features/audio/audioSlice';
import AudioList from './AudioList';
import UploadAudioModal from './UploadAudioModal';
import EditAudioModal from './EditAudioModal';
import { AudioTrack } from '@/types/types';

const LibraryPage = () => {
  const dispatch = useAppDispatch();
  const { audios, folders, loading } = useAppSelector(state => state.audio);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState<AudioTrack | null>(null);

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

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this audio?')) {
      const result = await dispatch(deleteAudio(id));
      if (deleteAudio.fulfilled.match(result)) {
        alert('Audio deleted successfully!');
      } else {
        alert('Failed to delete audio');
      }
    }
  };

  const handleMove = async (id: string, folderId: string) => {
    const result = await dispatch(moveAudio({ id, folderId }));
    if (moveAudio.fulfilled.match(result)) {
      alert('Audio moved successfully!');
    } else {
      alert('Failed to move audio');
    }
  };

  const handleEdit = (audio: AudioTrack) => {
    setSelectedAudio(audio);
    setEditModalOpen(true);
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
      <EditAudioModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedAudio(null);
        }}
        audio={selectedAudio}
      />
    </>
  );
};

export default LibraryPage;