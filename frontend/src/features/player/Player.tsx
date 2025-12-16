"use client"

import { useEffect, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { incrementProgress } from '@/store/features/player/playerSlice'
import { useQuiz } from "../quiz/useQuiz"
import QuizModal from "../quiz/QuizModal"
import { setIsPlaying } from '@/store/features/player/playerSlice'
import { updateUserStreak } from '@/store/features/user/userSlice'
import { apiClient } from '@/lib/api'

export default function Player() {
    const audioRef = useRef<HTMLAudioElement>(null)
    const volume = useAppSelector(state => state.player.volume)
    const audioUrl = useAppSelector(state => state.player.currentAudio?.url)
    const audioId = useAppSelector(state => state.player.currentAudio?.id)
    const isPlaying = useAppSelector(state => state.player.isPlaying)
    const dispatch = useAppDispatch()
    const { triggerQuiz } = useQuiz()

    // ✅ 1. Hàm xử lý khi nghe hết bài
    const handleAudioEnded = async () => {
        console.log("Audio finished! Updating streak...");
        dispatch(setIsPlaying(false)); // Dừng player

        try {
            // Gọi API (đường dẫn phải khớp với Route ở Bước 2)
            const res = await apiClient.post('/stats/streak'); 
            
            if (res.data.success) {
                // Cập nhật Redux để UI nhảy số và sáng đèn
                dispatch(updateUserStreak({
                    streak: res.data.data.streak,
                    lastActiveDate: res.data.data.lastActiveDate
                }));
            }
        } catch (error) {
            console.error("Failed to update streak", error);
        }

        if (audioId) {
            console.log("Triggering quiz for audio ID:", audioId);
            triggerQuiz(Number(audioId));
        }
    };

    // ✅ Update progress mỗi giây
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isPlaying) {
            interval = setInterval(() => {
                dispatch(incrementProgress())
            }, 1000)
        }

        return () => clearInterval(interval);
    }, [isPlaying, dispatch]);

    // ✅ Set volume
    useEffect(() => {
        if (!audioRef.current) return;
        audioRef.current.volume = volume / 100;
        console.log('Volume set to:', volume / 100);
    }, [volume])

    // ✅ Set audio source - CHỈ KHI CÓ URL HỢP LỆ
    useEffect(() => {
        if (!audioRef.current) return;
        
        // ✅ Kiểm tra URL có hợp lệ không
        if (!audioUrl || audioUrl === 'undefined' || audioUrl === 'null') {
            console.warn('Invalid audio URL:', audioUrl);
            return;
        }
        
        console.log('Setting audio URL:', audioUrl);
        
        // ✅ Load audio mới
        audioRef.current.src = audioUrl;
        audioRef.current.load(); // Force reload
        
    }, [audioUrl])

    // ✅ Play/Pause control
    useEffect(() => {
        if (!audioRef.current || !audioUrl) return;
        
        if (isPlaying) {
            console.log('Playing audio...');
            
            const playPromise = audioRef.current.play();
            
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        console.log('✅ Audio playing successfully');
                    })
                    .catch(err => {
                        console.error('❌ Play failed:', err.message);
                    });
            }
        } else {
            console.log('Pausing audio...');
            audioRef.current.pause();
        }
    }, [isPlaying, audioUrl])

    return (
        <>
        <audio
            ref={audioRef}
            preload="metadata"
            onLoadedMetadata={() => console.log('✅ Audio metadata loaded')}
            onCanPlay={() => console.log('✅ Audio can play')}
            onError={(e) => {
                const target = e.currentTarget;
                console.error('❌ Audio error:', {
                    src: target.src,
                    error: target.error?.message,
                    code: target.error?.code
                });
            }}
            onPlay={() => console.log('▶️ Audio started playing')}
            onPause={() => console.log('⏸️ Audio paused')}
            onEnded={handleAudioEnded}
        />
        <QuizModal />
        </>
    )
}