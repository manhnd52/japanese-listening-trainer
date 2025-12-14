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
  const { user } = useAppSelector(state => state.auth); // ✅ Lấy user từ Redux
  
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState<AudioTrack | null>(null);

  useEffect(() => {
    if (user?.id) { // ✅ Kiểm tra user.id tồn tại
      dispatch(fetchAudios(user.id)); // ✅ Truyền userId từ Redux
      dispatch(fetchFolders(user.id)); // ✅ Truyền userId từ Redux
    }
  }, [dispatch, user?.id]);

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
    if (!user?.id) {
      alert('User not authenticated');
      return;
    }

    if (window.confirm('Are you sure you want to delete this audio?')) {
      const result = await dispatch(deleteAudio({ id, userId: user.id })); // ✅ Truyền userId
      if (deleteAudio.fulfilled.match(result)) {
        alert('Audio deleted successfully!');
      } else {
        alert('Failed to delete audio');
      }
    }
  };

  const handleMove = async (id: string, folderId: string) => {
    if (!user?.id) {
      alert('User not authenticated');
      return;
    }

    const result = await dispatch(moveAudio({ id, folderId, userId: user.id })); // ✅ Truyền userId
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