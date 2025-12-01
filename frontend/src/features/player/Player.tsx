"use client"

import { useEffect, useRef } from "react"
import { useAppDispatch, useAppSelector } from "@/hooks/redux"
import { incrementProgress } from "@/store/features/player/playerSlice"

export default function Player() {
    const audioRef = useRef<HTMLAudioElement>(null)
    const volume = useAppSelector(state => state.player.volume)
    const audioUrl = useAppSelector(state => state.player.currentAudio?.url)
    const isPlaying = useAppSelector(state => state.player.isPlaying)
    const dispatch = useAppDispatch()

    useEffect(() => {
        let interval: any;

        if (isPlaying) {
            interval = setInterval(() => {
                dispatch(incrementProgress());
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [isPlaying]);

    useEffect(() => {
        if (!audioRef.current) return;
        audioRef.current.volume = volume / 100
    }, [volume])

    useEffect(() => {
        if (!audioRef.current) return;
        audioRef.current.src = audioUrl || ''
    }, [audioUrl])

    useEffect(() => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.play()
        } else {
            audioRef.current.pause()
        }
    }, [isPlaying])

    return (
        <audio
            ref={audioRef}
            autoPlay
        />
    )
}
