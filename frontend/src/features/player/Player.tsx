"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { updateAudioListenCount } from "@/store/features/audio/audioSlice";
import type { RootState } from "@/store";
import {
  updateProgress,
  setIsPlaying,
  setDuration,
} from "@/store/features/player/playerSlice";
import { useQuiz } from "@/features/quiz/useQuiz";
import QuizModal from "@/features/quiz/QuizModal";
import { updateUserStreak } from "@/store/features/user/userSlice";
import { audioApi } from "@/features/audios/api";

export default function Player() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const isInitialLoadRef = useRef(true);

  // Sử dụng useAppSelector với kiểu RootState
  const audioId = useAppSelector((state: RootState) => state.player.currentAudio?.id);
  const audioUrl = useAppSelector((state: RootState) => state.player.currentAudio?.url);

  const isPlaying = useAppSelector((state: RootState) => state.player.isPlaying);
  const volume = useAppSelector((state: RootState) => state.player.volume);
  const user = useAppSelector((state: RootState) => state.auth.user);
  const dispatch = useAppDispatch();
  const { triggerQuiz } = useQuiz();

  // ✅ Xử lý khi audio kết thúc
  const handleAudioEnded = useCallback(async () => {
    console.log("🎵 Audio finished!");
    dispatch(setIsPlaying(false));

    // ✅ 1. Increment listen count
    if (audioId && user?.id) {
      try {
        console.log("📊 Incrementing listen count for audio:", audioId);
        const res = await audioApi.incrementListenCount(Number(audioId), user.id);
        // Lấy listenCount mới từ response, fallback = 1 nếu không có
        const newListenCount = res?.data?.listenCount ?? 1;
        dispatch(updateAudioListenCount({ id: audioId, listenCount: newListenCount }));
        console.log("✅ Listen count incremented");
      } catch (error) {
        console.error("❌ Failed to increment listen count:", error);
      }
    }

    // ✅ 2. Update streak (giữ nguyên logic cũ)
    try {
      console.log("🔥 Updating user streak...");
      const apiClient = (await import("@/lib/api")).default;
      const res = await apiClient.post("/stats/streak");

      if (res.data.success) {
        dispatch(
          updateUserStreak({
            streak: res.data.data.streak,
            lastActiveDate: res.data.data.lastActiveDate,
          })
        );
        console.log("✅ Streak updated");
      }
    } catch (error) {
      console.error("❌ Failed to update streak", error);
    }

    // ✅ 3. Trigger quiz (giữ nguyên logic cũ)
    if (audioId) {
      console.log("🎯 Triggering quiz for audio ID:", audioId);
      triggerQuiz(Number(audioId));
    }
  }, [dispatch, triggerQuiz, audioId, user]);

  // 🔄 Restart event
  useEffect(() => {
    const handler = (ev: Event) => {
      const e = ev as CustomEvent<{ audioId?: string }>;
      const requestedId = e?.detail?.audioId;
      if (!requestedId) return;
      if (String(audioId) !== String(requestedId)) return;

      const audioEl = audioRef.current;
      if (!audioEl) return;

      console.log("🔄 Restarting audio:", audioId);

      audioEl.currentTime = 0;

      const playPromise = audioEl.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.error("❌ Restart play failed:", err);
          dispatch(setIsPlaying(false));
        });
      }
    };

    document.addEventListener("player:restart", handler as EventListener);
    return () =>
      document.removeEventListener("player:restart", handler as EventListener);
  }, [audioId, dispatch]);

  // ⏩ Seek event
  useEffect(() => {
    const handler = (ev: Event) => {
      const e = ev as CustomEvent<{ sec?: number }>;
      if (!audioRef.current) return;

      const sec = e.detail?.sec;
      if (typeof sec !== "number" || Number.isNaN(sec)) return;

      const audioEl = audioRef.current;
      const duration = audioEl.duration || sec;
      const clamped = Math.max(0, Math.min(sec, duration));

      console.log("⏩ Seeking to:", clamped);

      audioEl.currentTime = clamped;
      dispatch(updateProgress(clamped));

      if (!isPlaying) dispatch(setIsPlaying(true));

      const playPromise = audioEl.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.error("❌ Seek play failed:", err);
          dispatch(setIsPlaying(false));
        });
      }
    };

    document.addEventListener("player:seek", handler as EventListener);
    return () =>
      document.removeEventListener("player:seek", handler as EventListener);
  }, [dispatch, isPlaying]);

  // 🔊 Volume
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume / 100;
  }, [volume]);

  // 🎵 Load new audio
  useEffect(() => {
    if (!audioRef.current) return;
    const audioEl = audioRef.current;

    if (!audioUrl || !audioId) {
      console.warn("⚠️ Invalid audio:", { audioId, audioUrl });
      if (!audioEl.paused) audioEl.pause();
      audioEl.removeAttribute("src");
      audioEl.load();
      dispatch(updateProgress(0));
      isInitialLoadRef.current = true;
      return;
    }

    const AUDIO_BASE =
      process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000";
    const resolvedUrl = audioUrl.startsWith("http")
      ? audioUrl
      : `${AUDIO_BASE}${audioUrl.startsWith("/") ? "" : "/"}${audioUrl}`;

    console.log("🎵 Loading new track:", {
      id: audioId,
      audioUrl,
      resolvedUrl
    });

    if (!audioEl.paused) audioEl.pause();
    audioEl.src = resolvedUrl;
    audioEl.currentTime = 0;
    audioEl.load();

    dispatch(updateProgress(0));
    isInitialLoadRef.current = true;

    audioEl.onended = handleAudioEnded; // ✅ Gán handler khi audio kết thúc
    audioEl.ontimeupdate = () => {
      dispatch(updateProgress(audioEl.currentTime || 0));
    };

    audioEl.onloadedmetadata = () => {
      const duration = audioEl.duration || 0;
      console.log("⌛ Duration:", duration);
      dispatch(setDuration(duration));
    };

    audioEl.oncanplay = () => {
      console.log("✅ Audio can play");
      
      if (isInitialLoadRef.current && isPlaying) {
        isInitialLoadRef.current = false;
        const playPromise = audioEl.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log("✅ Audio started playing");
            })
            .catch((err) => {
              console.error("❌ Auto-play failed:", err);
              dispatch(setIsPlaying(false));
            });
        }
      }
    };
  }, [audioId, audioUrl, dispatch, handleAudioEnded, isPlaying]);

  // ▶ Play/Pause control
  useEffect(() => {
    if (!audioRef.current || !audioUrl) return;
    const audioEl = audioRef.current;
    if (!audioEl.src) return;

    if (isInitialLoadRef.current) {
      console.log("⏳ Initial load, skipping play/pause control");
      return;
    }

    if (audioEl.readyState === 0) {
      console.log("⏳ Audio not ready yet, waiting...");
      return;
    }

    if (isPlaying) {
      if (audioEl.paused) {
        console.log("▶️ Resuming audio...");
        const playPromise = audioEl.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.error("❌ Play failed:", err);
            dispatch(setIsPlaying(false));
          });
        }
      }
    } else {
      if (!audioEl.paused) {
        console.log("⏸️ Pausing audio...");
        audioEl.pause();
      }
    }
  }, [isPlaying, audioUrl, dispatch]);

  return (
    <>
      <audio
        ref={audioRef}
        preload="metadata"
        onError={(e) => {
          const target = e.currentTarget;
          console.error("❌ Audio error:", {
            src: target.src,
            code: target.error?.code,
          });
        }}
      />
      <QuizModal />
    </>
  );
}