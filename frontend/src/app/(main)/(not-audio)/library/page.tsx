"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AudioTrack } from "@/types/types";
import { useAudioList, useAudioActions } from "@/features/audios/hooks";
import {
  AudioList,
  EditAudioModal,
  UploadAudioModal,
} from "@/features/audios/components";

const LibraryPage = () => {
  const { audios, folders, loading } = useAudioList();
  const { handlePlay, handleToggleFavorite, handleDelete, handleMove } =
    useAudioActions();

  const searchParams = useSearchParams();
  const router = useRouter();

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState<AudioTrack | null>(null);

  // ✅ Mở modal tự động khi có query param upload=true
  useEffect(() => {
    const shouldOpen = searchParams.get("upload") === "true";
    if (shouldOpen && !uploadModalOpen) {
      setUploadModalOpen(true);
      router.replace("/library", { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

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
