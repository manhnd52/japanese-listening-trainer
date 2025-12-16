"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { incrementProgress } from "@/store/features/player/playerSlice";

// Backend audio base URL
const AUDIO_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export default function Player() {
  const audioRef = useRef<HTMLAudioElement>(null);

  const volume = useAppSelector((s) => s.player.volume);
  const rawAudioUrl = useAppSelector((s) => s.player.currentAudio?.url);
  const isPlaying = useAppSelector((s) => s.player.isPlaying);

  const dispatch = useAppDispatch();

  //  Update progress mỗi giây
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    if (isPlaying) {
      interval = setInterval(() => {
        dispatch(incrementProgress());
      }, 1000);
    }

    return () => interval && clearInterval(interval);
  }, [isPlaying, dispatch]);
  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  //  Set volume
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume / 100;
  }, [volume]);

  //  Track change (Next / Prev)
  useEffect(() => {
    if (!audioRef.current || !rawAudioUrl) return;

    const audio = audioRef.current;

    const resolvedUrl = rawAudioUrl.startsWith("http")
      ? rawAudioUrl
      : `${AUDIO_BASE_URL}${
          rawAudioUrl.startsWith("/") ? "" : "/"
        }${rawAudioUrl}`;

    audio.pause();
    audio.currentTime = 0;
    audio.src = resolvedUrl;
    audio.load();
  }, [rawAudioUrl]);

  //  Play / Pause control
  useEffect(() => {
    if (!audioRef.current) return;
    if (!isPlaying) audioRef.current.pause();
  }, [isPlaying]);

  return (
    <audio
      ref={audioRef}
      preload="metadata"
      onCanPlay={() => {
        if (isPlaying) {
          audioRef.current?.play().catch(() => {});
        }
      }}
    />
  );
}
