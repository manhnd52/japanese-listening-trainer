"use client";

import React, { useState, Suspense } from "react";
import { AudioTrack } from "@/types/types";
import { useAudioList, useAudioActions } from "@/features/audios/hooks";
import {
  AudioList,
  EditAudioModal,
  UploadAudioModal,
} from "@/features/audios/components";
import { useAppDispatch } from "@/hooks/redux";
import { setPlaylistArray } from "@/store/features/player/playerSlice";

function LibraryContent() {
  const { audios, folders, loading } = useAudioList();
  const { handlePlay, handleToggleFavorite, handleDelete, handleMove } =
    useAudioActions();

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState<AudioTrack | null>(null);
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    if (audios?.length) {
      const backend =
        process.env.NEXT_PUBLIC_ASSET_URL?.replace(/\/$/, "") ?? "";
      
      const formatted = audios.map((a) => {
        // ✅ Chỉ dùng fileUrl - property chính thức của AudioTrack
        const raw = a.fileUrl;
        
        return {
          ...a,
          url: raw?.startsWith("http") ? raw : `${backend}${raw}`,
          status: a.status || 'idle', // ✅ Đảm bảo status luôn có giá trị
        } as AudioTrack;
      });

      dispatch(setPlaylistArray(formatted as import("@/store/features/player/playerSlice").AudioTrack[]));
    }
  }, [audios, dispatch]); // ✅ Thêm dispatch vào dependencies

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

const LibraryPage = () => {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <LibraryContent />
    </Suspense>
  );
};

export default LibraryPage;