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

  const audioId = useAppSelector((state: RootState) => state.player.currentAudio?.id);
  const audioUrl = useAppSelector((state: RootState) => state.player.currentAudio?.url);
  const isPlaying = useAppSelector((state: RootState) => state.player.isPlaying);
  const volume = useAppSelector((state: RootState) => state.player.volume);
  const user = useAppSelector((state: RootState) => state.auth.user);
  const dispatch = useAppDispatch();
  const { triggerQuiz } = useQuiz();

  const handleAudioEnded = useCallback(async () => {
    dispatch(setIsPlaying(false));

    if (audioId && user?.id) {
      try {
        const res = await audioApi.incrementListenCount(Number(audioId), user.id);
        const newListenCount = res?.data?.listenCount ?? 1;
        dispatch(updateAudioListenCount({ id: audioId, listenCount: newListenCount }));
      } catch (error) {
        // handle error
      }
    }

    try {
      const apiClient = (await import("@/lib/api")).default;
      const res = await apiClient.post("/stats/streak");

      if (res.data.success) {
        dispatch(
          updateUserStreak({
            streak: res.data.data.streak,
            lastActiveDate: res.data.data.lastActiveDate,
          })
        );
      }
    } catch (error) {
      // handle error
    }

    if (audioId) {
      triggerQuiz(Number(audioId));
    }
  }, [dispatch, triggerQuiz, audioId, user]);

  useEffect(() => {
    const handler = (ev: Event) => {
      const e = ev as CustomEvent<{ audioId?: string }>;
      const requestedId = e?.detail?.audioId;
      if (!requestedId) return;
      if (String(audioId) !== String(requestedId)) return;

      const audioEl = audioRef.current;
      if (!audioEl) return;

      audioEl.currentTime = 0;

      const playPromise = audioEl.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          dispatch(setIsPlaying(false));
        });
      }
    };

    document.addEventListener("player:restart", handler as EventListener);
    return () =>
      document.removeEventListener("player:restart", handler as EventListener);
  }, [audioId, dispatch]);

  useEffect(() => {
    const handler = (ev: Event) => {
      const e = ev as CustomEvent<{ sec?: number }>;
      if (!audioRef.current) return;

      const sec = e.detail?.sec;
      if (typeof sec !== "number" || Number.isNaN(sec)) return;

      const audioEl = audioRef.current;
      const duration = audioEl.duration || sec;
      const clamped = Math.max(0, Math.min(sec, duration));

      audioEl.currentTime = clamped;
      dispatch(updateProgress(clamped));

      if (!isPlaying) dispatch(setIsPlaying(true));

      const playPromise = audioEl.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          dispatch(setIsPlaying(false));
        });
      }
    };

    document.addEventListener("player:seek", handler as EventListener);
    return () =>
      document.removeEventListener("player:seek", handler as EventListener);
  }, [dispatch, isPlaying]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume / 100;
  }, [volume]);

  // Sửa: chỉ load lại audio khi đổi bài mới (audioId hoặc audioUrl đổi)
  useEffect(() => {
    if (!audioRef.current) return;
    const audioEl = audioRef.current;

    if (!audioUrl || !audioId) {
      if (!audioEl.paused) audioEl.pause();
      audioEl.removeAttribute("src");
      audioEl.load();
      dispatch(updateProgress(0));
      isInitialLoadRef.current = true;
      return;
    }

    // Nếu đã đúng bài, không reset lại audio
    if (
      audioEl.src &&
      (audioEl.src.endsWith(audioUrl) || audioEl.src === audioUrl)
    ) {
      return;
    }

    const AUDIO_BASE =
      process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000";
    const resolvedUrl = audioUrl.startsWith("http")
      ? audioUrl
      : `${AUDIO_BASE}${audioUrl.startsWith("/") ? "" : "/"}${audioUrl}`;

    if (!audioEl.paused) audioEl.pause();
    audioEl.src = resolvedUrl;
    audioEl.currentTime = 0;
    audioEl.load();

    dispatch(updateProgress(0));
    isInitialLoadRef.current = true;

    audioEl.onended = handleAudioEnded;
    audioEl.ontimeupdate = () => {
      dispatch(updateProgress(audioEl.currentTime || 0));
    };

    audioEl.onloadedmetadata = () => {
      const duration = audioEl.duration || 0;
      dispatch(setDuration(duration));
    };

    audioEl.oncanplay = () => {
      if (isInitialLoadRef.current && isPlaying) {
        isInitialLoadRef.current = false;
        const playPromise = audioEl.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {})
            .catch(() => {
              dispatch(setIsPlaying(false));
            });
        }
      }
    };
  }, [audioId, audioUrl, dispatch, handleAudioEnded, isPlaying]);

  useEffect(() => {
    if (!audioRef.current || !audioUrl) return;
    const audioEl = audioRef.current;
    if (!audioEl.src) return;

    if (isInitialLoadRef.current) {
      return;
    }

    if (audioEl.readyState === 0) {
      return;
    }

    if (isPlaying) {
      if (audioEl.paused) {
        const playPromise = audioEl.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            dispatch(setIsPlaying(false));
          });
        }
      }
    } else {
      if (!audioEl.paused) {
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
          // handle error
        }}
      />
      <QuizModal />
    </>
  );
}