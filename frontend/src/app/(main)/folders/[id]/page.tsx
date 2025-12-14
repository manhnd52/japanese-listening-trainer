"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import {
  ArrowLeft,
  Music,
  Play,
  Clock,
  Lock,
  Unlock,
  Users,
  Share2,
} from "lucide-react";
import ShareFolderModal from "@/features/folder/components/ShareFolderModal";
import { fetchFolderById } from "@/store/features/folder/folderSlice";
import {
  setTrack,
  setPlaylistByFolder,
  AudioTrack as PlayerAudioTrack,
} from "@/store/features/player/playerSlice";

interface FolderAudio {
  id: number;
  title: string;
  script: string;
  fileUrl: string;
  duration: number;
  createdAt: string;
  status?: string;
  isFavorite?: boolean;
  url?: string;
}

const FolderDetailPage = () => {
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const folderId = parseInt(params.id as string);

  const {
    currentFolder: folder,
    loading,
    error,
  } = useAppSelector((state) => state.folder);
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    if (folderId && user) {
      console.log("Fetching folder:", folderId);
      dispatch(fetchFolderById(folderId));
    }

    return () => {
      dispatch({ type: "folder/setCurrentFolder", payload: null });
    };
  }, [folderId, user, dispatch]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn("API call taking too long...");
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [loading]);

  const handlePlayInFolder = (audio: FolderAudio, index: number) => {
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
      "http://localhost:5000";

    if (!folder || !folder.audios) return;

    // Map tất cả audios trong folder sang PlayerAudioTrack
    const playerAudios: PlayerAudioTrack[] = folder.audios.map(
      (a: FolderAudio) => {
        let url = a.url || a.fileUrl || "";
        if (url && !url.startsWith("http")) {
          url = backendUrl + url;
        }
        return {
          id: String(a.id),
          title: a.title,
          url,
          duration: a.duration,
          folderId: String(folder.id),
          status: (a.status ?? "NEW") as any,
          isFavorite: a.isFavorite ?? false,
          folderName: folder.name,
          script: a.script ?? "",
        };
      }
    );

    console.log("🎵 Playing in folder:", {
      folderId,
      totalTracks: playerAudios.length,
      currentTrack: audio.title,
    });

    dispatch(
      setPlaylistByFolder({ tracks: playerAudios, folderId: String(folderId) })
    );

    const selectedAudio = playerAudios[index];
    if (selectedAudio) {
      dispatch(setTrack(selectedAudio));
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading folder...</p>
        </div>
      </div>
    );
  }

  if (error || !folder) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Folder not found"}</p>
          <button
            onClick={() => router.push("/folders")}
            className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
          >
            Back to Folders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/folders")}
            className="flex items-center gap-2 text-gray-600 hover:text-brand-600 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Folders</span>
          </button>

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-brand-400 to-brand-600 rounded-lg flex items-center justify-center">
                  <Music className="text-white" size={32} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {folder.name}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Music size={16} />
                      <span>
                        {folder._count?.audios ?? 0} audio
                        {(folder._count?.audios ?? 0) !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {folder.isPublic ? (
                        <>
                          <Unlock size={16} className="text-green-600" />
                          <span className="text-green-600">Public</span>
                        </>
                      ) : (
                        <>
                          <Lock size={16} className="text-gray-400" />
                          <span>Private</span>
                        </>
                      )}
                    </div>
                    {folder._count?.folderShares &&
                      folder._count.folderShares > 0 && (
                        <div className="flex items-center gap-1">
                          <Users size={16} />
                          <span>Shared with {folder._count.folderShares}</span>
                        </div>
                      )}
                  </div>
                </div>
              </div>
              {user && folder.createdBy === user.id && (
                <button
                  onClick={() => setShareModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg font-bold hover:bg-brand-600 transition-colors"
                >
                  <Share2 size={18} />
                  <span>Share</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {user && folder.createdBy === user.id && (
          <ShareFolderModal
            folderId={folder.id}
            isOpen={shareModalOpen}
            onClose={() => setShareModalOpen(false)}
          />
        )}

        {/* Audio List */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Audio Files</h2>
          </div>

          {!folder.audios || folder.audios.length === 0 ? (
            <div className="text-center py-16">
              <Music className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No audio files yet
              </h3>
              <p className="text-gray-600">
                Upload audio files to this folder to get started
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {folder.audios.map((audio: FolderAudio, index: number) => (
                <div
                  key={audio.id}
                  className="p-4 hover:bg-gray-50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    {/* ✅ Play Button */}
                    <button
                      onClick={() => handlePlayInFolder(audio, index)}
                      className="w-10 h-10 flex-shrink-0 bg-brand-500 hover:bg-brand-600 rounded-full flex items-center justify-center text-white transition-colors shadow-md group-hover:shadow-lg"
                    >
                      <Play size={20} fill="white" />
                    </button>

                    {/* Audio Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 truncate group-hover:text-brand-600 transition-colors">
                        {audio.title}
                      </h3>
                      <p className="text-sm text-gray-600 truncate mt-1">
                        {audio.script.substring(0, 100)}
                        {audio.script.length > 100 ? "..." : ""}
                      </p>
                    </div>

                    {/* Duration */}
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Clock size={16} />
                      <span>{formatDuration(audio.duration)}</span>
                    </div>

                    {/* Track Number */}
                    <div className="text-sm font-semibold text-gray-400 w-8 text-right">
                      #{index + 1}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FolderDetailPage;
