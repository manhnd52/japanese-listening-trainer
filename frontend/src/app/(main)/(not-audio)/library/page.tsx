"use client";

import React, { useState, useEffect } from "react";
import { AudioTrack } from "@/types/types";
import { useAudioList, useAudioActions } from "@/features/audios/hooks";
import {
  AudioList,
  EditAudioModal,
  UploadAudioModal,
} from "@/features/audios/components";
import { useAppDispatch } from "@/hooks/redux";
import { setPlaylistArray } from "@/store/features/player/playerSlice";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

const LibraryPage = () => {
  const { audios, folders, loading } = useAudioList();
  const { handlePlay, handleToggleFavorite, handleDelete, handleMove } =
    useAudioActions();

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState<AudioTrack | null>(null);
  const dispatch = useAppDispatch();

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (audios && audios.length > 0) {
      dispatch(setPlaylistArray(audios));
    }
  }, [audios, dispatch]);

  // Open modal automatically when ?add=1 present
  useEffect(() => {
    const open = Boolean(searchParams?.get("add"));
    setUploadModalOpen(open);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams?.toString()]);

  const handleSelect = (audio: AudioTrack) => {
    handlePlay(audio);
  };

  const handleAddAudio = () => {
    // keep existing behavior for in-page Add button
    setUploadModalOpen(true);
  };

  const handleEdit = (audio: AudioTrack) => {
    setSelectedAudio(audio);
    setEditModalOpen(true);
  };

  const handleCloseUploadModal = () => {
    setUploadModalOpen(false);
    // remove query param from URL without full reload
    try {
      router.replace(pathname);
    } catch {
      // ignore if replace not possible
    }
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
        onClose={handleCloseUploadModal}
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