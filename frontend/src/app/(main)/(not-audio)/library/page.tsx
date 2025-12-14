"use client";

import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import {
  fetchAudios,
  fetchFolders,
  deleteAudio,
  moveAudio,
} from "@/store/features/audio/audioSlice";
import AudioList from "./AudioList";
import UploadAudioModal from "./UploadAudioModal";
import EditAudioModal from "./EditAudioModal";
import {
  setTrack,
  AudioTrack as PlayerAudioTrack,
} from "@/store/features/player/playerSlice"; 
import { AudioStatus } from "@/store/features/player/playerSlice";
import { AudioTrack as RawAudioTrack } from "@/types/types";
import { toggleFavorite } from "@/store/features/audio/audioSlice";
const LibraryPage = () => {
  const dispatch = useAppDispatch();
  const { audios, folders, loading } = useAppSelector((state) => state.audio);
  const { user } = useAppSelector((state) => state.auth);

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState<RawAudioTrack | null>(
    null
  );

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchAudios(user.id));
      dispatch(fetchFolders(user.id));
    }
  }, [dispatch, user?.id]);

  const handlePlay = (audio: RawAudioTrack) => {
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
      "http://localhost:5000";
    let url =
      (audio as { url?: string }).url ||
      (audio as { fileUrl?: string }).fileUrl ||
      "";
    if (url && !url.startsWith("http")) {
      url = backendUrl + url;
    }

    const playerAudio: PlayerAudioTrack = {
      id: audio.id,
      title: audio.title,
      url,
      duration: audio.duration,
      folderId: audio.folderId,
      status: (audio.status ?? "NEW") as AudioStatus,
      isFavorite: audio.isFavorite ?? false,
      folderName: (audio as { folderName?: string }).folderName ?? "",
      script: (audio as { script?: string }).script ?? "",
    };
    dispatch(setTrack(playerAudio));
  };

  const handleSelect = (audio: RawAudioTrack) => {};

  const handleAddAudio = () => {
    setUploadModalOpen(true);
  };


  const handleDelete = async (id: string) => {
    if (!user?.id) {
      alert("User not authenticated");
      return;
    }

    if (window.confirm("Are you sure you want to delete this audio?")) {
      const result = await dispatch(deleteAudio({ id, userId: user.id }));
      if (deleteAudio.fulfilled.match(result)) {
        alert("Audio deleted successfully!");
      } else {
        alert("Failed to delete audio");
      }
    }
  };

  const handleMove = async (id: string, folderId: string) => {
    if (!user?.id) {
      alert("User not authenticated");
      return;
    }

    const result = await dispatch(moveAudio({ id, folderId, userId: user.id }));
    if (moveAudio.fulfilled.match(result)) {
      alert("Audio moved successfully!");
      dispatch(fetchAudios(user.id)); 

    } else {
      alert("Failed to move audio");
    }
  };

  const handleEdit = (audio: RawAudioTrack) => {
    setSelectedAudio(audio);
    setEditModalOpen(true);
  };

  const handleToggleFavorite = async (audio: RawAudioTrack) => {
  if (!user?.id) {
    alert("User not authenticated");
    return;
  }
  dispatch(toggleFavorite({ id: audio.id, userId: user.id, isFavorite: !audio.isFavorite }));
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
