import { useState, useEffect, useCallback } from "react";
import { useAppSelector } from "@/hooks/redux";
import { playerApi } from "../api";
import { AudioTrack } from "@/store/features/player/playerSlice";

/**
 * Custom hook: Lấy danh sách audio của user hiện tại
 */
export const useAudioList = () => {
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = useAppSelector((state) => state.auth.user?.id);

  const loadTracks = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      setError("User not logged in");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await playerApi.getAllAudios(userId);
      setTracks(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load audio tracks";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadTracks();
  }, [loadTracks]);

  return { tracks, isLoading, error, refetch: loadTracks };
};
