"use client";

import React, { useState } from "react";
import { AudioTrack } from "@/types/types";
import { useAudioList, useAudioActions } from "@/features/audios/hooks";
import {
  AudioList,
  EditAudioModal,
  UploadAudioModal,
} from "@/features/audios/components";
import { useAppDispatch } from "@/hooks/redux";
import { setPlaylistArray } from "@/store/features/player/playerSlice";
const LibraryPage = () => {
  const { audios, folders, loading } = useAudioList();
  const { handlePlay, handleToggleFavorite, handleDelete, handleMove } =
    useAudioActions();

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState<AudioTrack | null>(null);
  const dispatch = useAppDispatch();
  React.useEffect(() => {
    if (audios && audios.length > 0) {
      const formattedAudios = audios.map((track) => ({
        ...track,
        url: track.fileUrl 
      }));
      dispatch(setPlaylistArray(formattedAudios as any));
    }
  }, [audios, dispatch]);
  const handleSelect = (audio: AudioTrack) => {
    handlePlay(audio);
  };

  const handleAddAudio = () => {
    setUploadModalOpen(true);
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
        onToggleFavorite={handleToggleFavorite}
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
