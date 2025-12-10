'use client';

import React, { useEffect, useState } from 'react';
import TopHeader from '@/components/layout/TopHeader';
import { AudioTrack, Folder as FolderType } from '@/types/types';
import { fetchAudios } from '@/lib/api';
import AudioList from './AudioList';

const LibraryPage = () => {
  const [audios, setAudios] = useState<AudioTrack[]>([]);
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const audioData = await fetchAudios();
      setAudios(audioData);
      setFolders([]); 
      setLoading(false);
    };
    loadData();
  }, []);

 
  const handlePlay = (audio: AudioTrack) => {};
  const handleSelect = (audio: AudioTrack) => {};
  const handleAddAudio = () => {};
  const handleDelete = (id: string) => {};
  const handleMove = (id: string, folderId: string) => {};
  const handleEdit = (audio: AudioTrack) => {};

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <>
      <TopHeader />
      <div className="min-h-screen" style={{ background: '#FCFDF7' }}>
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
    </div>
    </>
  );
};

export default LibraryPage;