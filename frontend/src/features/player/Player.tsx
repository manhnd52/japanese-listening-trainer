"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import {
  updateProgress,
  setIsPlaying,
  setDuration,
} from "@/store/features/player/playerSlice";
import { useQuiz } from "../quiz/useQuiz";
import QuizModal from "../quiz/QuizModal";
import { updateUserStreak } from "@/store/features/user/userSlice";
import { apiClient } from "@/lib/api";

export default function Player() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const isInitialLoadRef = useRef(true);

  const volume = useAppSelector((state) => state.player.volume);
  const currentAudio = useAppSelector((state) => state.player.currentAudio);
  const isPlaying = useAppSelector((state) => state.player.isPlaying);

  const dispatch = useAppDispatch();
  const { triggerQuiz } = useQuiz();

  const audioId = currentAudio?.id;
  const audioUrl = currentAudio?.url;

  // =============================
  // 🔥 Stable ended handler
  // =============================
  const handleAudioEnded = useCallback(async () => {
    console.log("🎵 Audio finished → streak update");
    dispatch(setIsPlaying(false));

    try {
      const res = await apiClient.post("/stats/streak");
      if (res.data.success) {
        dispatch(
          updateUserStreak({
            streak: res.data.data.streak,
            lastActiveDate: res.data.data.lastActiveDate,
          })
        );
      }
    } catch (err) {
      console.error("❌ streak error:", err);
    }

    if (audioId) {
      triggerQuiz(Number(audioId));
    }
  }, [audioId, dispatch, triggerQuiz]);

  // =============================
  // 🔁 Restart event
  // =============================
  useEffect(() => {
    const handler = (ev: Event) => {
      const e = ev as CustomEvent<{ audioId?: string }>;
      if (!e.detail?.audioId) return;
      if (String(e.detail.audioId) !== String(audioId)) return;

      const audioEl = audioRef.current;
      if (!audioEl) return;

      console.log("🔄 manual restart");

      audioEl.currentTime = 0;
      const play = audioEl.play();
      if (play) {
        play.catch(() => dispatch(setIsPlaying(false)));
      }
    };

    document.addEventListener("player:restart", handler as EventListener);
    return () =>
      document.removeEventListener("player:restart", handler as EventListener);
  }, [audioId, dispatch]);

  // =============================
  // ⏩ Seek event
  // =============================
  useEffect(() => {
    const handler = (ev: Event) => {
      const e = ev as CustomEvent<{ sec?: number }>;
      const sec = e.detail?.sec;
      if (!audioRef.current || typeof sec !== "number") return;

      const audioEl = audioRef.current;
      const duration = audioEl.duration || sec;
      const clamped = Math.max(0, Math.min(sec, duration));

      audioEl.currentTime = clamped;
      dispatch(updateProgress(clamped));

      if (!isPlaying) dispatch(setIsPlaying(true));

      const play = audioEl.play();
      if (play) play.catch(() => dispatch(setIsPlaying(false)));
    };

    document.addEventListener("player:seek", handler as EventListener);
    return () =>
      document.removeEventListener("player:seek", handler as EventListener);
  }, [dispatch, isPlaying]);

  // =============================
  // 🔊 Volume only
  // =============================
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // =============================
  // 🎵 Load new audio only when ID changes
  // =============================
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

    const BASE =
      process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
      "http://localhost:5000";
    const resolvedUrl = audioUrl.startsWith("http")
      ? audioUrl
      : `${BASE}${audioUrl.startsWith("/") ? "" : "/"}${audioUrl}`;

    // 🔥 KEY FIX: check same src using includes
    if (audioEl.src && audioEl.src.includes(resolvedUrl)) {
      console.log("🔁 Same source → skip reload");
      audioEl.onended = handleAudioEnded;
      audioEl.ontimeupdate = () => {
        dispatch(updateProgress(audioEl.currentTime || 0));
      };
      return;
    }

    console.log("🎧 New track:", resolvedUrl);

    if (!audioEl.paused) audioEl.pause();

    audioEl.src = resolvedUrl;
    audioEl.currentTime = 0;
    audioEl.load();

    dispatch(updateProgress(0));
    isInitialLoadRef.current = true;

    audioEl.onended = handleAudioEnded;
    audioEl.ontimeupdate = () =>
      dispatch(updateProgress(audioEl.currentTime || 0));

    audioEl.onloadedmetadata = () => {
      const d = audioEl.duration || 0;
      if (d !== currentAudio?.duration) {
        dispatch(setDuration(d));
      }
    };

    audioEl.oncanplay = () => {
      if (!isInitialLoadRef.current || !isPlaying) return;
      isInitialLoadRef.current = false;

      const play = audioEl.play();
      if (play)
        play.catch((err) => {
          console.error("⚠️ autoplay failed", err);
          dispatch(setIsPlaying(false));
        });
    };
  }, [audioId]); // ❌ removed handleAudioEnded / audioUrl

  // =============================
  // ▶ Play/pause only when NOT initial
  // =============================
  useEffect(() => {
    if (!audioRef.current) return;
    const audioEl = audioRef.current;
    if (!audioEl.src) return;

    if (isInitialLoadRef.current) return;
    if (audioEl.readyState === 0) return;

    if (isPlaying) {
      const play = audioEl.play();
      if (play) play.catch(() => dispatch(setIsPlaying(false)));
    } else {
      audioEl.pause();
    }
  }, [isPlaying, dispatch]);

  return (
    <>
      <audio
        ref={audioRef}
        preload="metadata"
        onError={(e) => {
          console.error("❌ audio error", {
            src: (e.target as HTMLAudioElement).src,
          });
        }}
      />
      <QuizModal />
    </>
  );
}
