"use client";

import React, { useState, Suspense,useEffect } from "react";
import { AudioTrack } from "@/types/types";
import { useAudioList, useAudioActions } from "@/features/audios/hooks";
import {
  AudioList,
  EditAudioModal,
  UploadAudioModal,
} from "@/features/audios/components";
import { useAppDispatch } from "@/hooks/redux";
import { setPlaylistArray } from "@/store/features/player/playerSlice";
import { useSearchParams, useRouter } from "next/navigation";

function LibraryContent() {
  const { audios, folders, loading } = useAudioList();
  const { handlePlay, handleToggleFavorite, handleDelete, handleMove } =
    useAudioActions();

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState<AudioTrack | null>(null);
  const dispatch = useAppDispatch();

  // Thêm để lấy query param
  const searchParams = useSearchParams();
  const router = useRouter();

  React.useEffect(() => {
    if (audios?.length) {
      const backend =
        process.env.NEXT_PUBLIC_ASSET_URL?.replace(/\/$/, "") ?? "";

      const formatted = audios.map((a) => {
        const raw = a.fileUrl;
        return {
          ...a,
          url: raw?.startsWith("http") ? raw : `${backend}${raw}`,
          status: a.status || "idle",
        } as AudioTrack;
      });

      dispatch(
        setPlaylistArray(
          formatted as import("@/store/features/player/playerSlice").AudioTrack[]
        )
      );
    }
  }, [audios, dispatch]);

  // Xử lý query edit=audioId để mở EditAudioModal
  useEffect(() => {
    const editId = searchParams.get("edit");
    if (editId && audios?.length) {
      const found = audios.find((a) => String(a.id) === String(editId));
      if (found) {
        setSelectedAudio(found);
        setEditModalOpen(true);
      }
    }
  }, [searchParams, audios]);

  const handleSelect = (audio: AudioTrack) => {
    handlePlay(audio);
  };

  const handleAddAudio = () => {
    setUploadModalOpen(true);
  };

  const handleEdit = (audio: AudioTrack) => {
    setSelectedAudio(audio);
    setEditModalOpen(true);
    // Đẩy query lên url để đồng bộ
    const params = new URLSearchParams(searchParams.toString());
    params.set("edit", String(audio.id));
    router.replace(`/library?${params.toString()}`, { scroll: false });
  };

  const handleCloseEdit = () => {
    setEditModalOpen(false);
    setSelectedAudio(null);
    // Xoá query edit khỏi url
    const params = new URLSearchParams(searchParams.toString());
    params.delete("edit");
    router.replace(`/library?${params.toString()}`, { scroll: false });
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <>
    <Suspense fallback={<div className="p-8">Loading...</div>}>
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
    </Suspense>
      <UploadAudioModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
      />
      <EditAudioModal
        isOpen={editModalOpen}
        onClose={handleCloseEdit}
        audio={selectedAudio}
      />
    </>
  );
}

const LibraryPage = () => {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <LibraryContent />
    </Suspense>
  );
};

export default LibraryPage;