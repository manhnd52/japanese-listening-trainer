'use client'
import { useState, useRef } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

export default function VolumeControl({ volume, setVolume }: { volume: number, setVolume: (volume: number) => void }) {
    const barRef = useRef<HTMLDivElement>(null)
    const [lastVolume, setLastVolume] = useState(volume)

    const handleMouseDown = (e: React.MouseEvent) => {
        const bar = barRef.current
        if (!bar) return

        const updateVolume = (clientX: number) => {
            const rect = bar.getBoundingClientRect()
            let newVolume = ((clientX - rect.left) / rect.width) * 100
            newVolume = Math.max(0, Math.min(100, newVolume))
            setVolume(newVolume)
        }

        updateVolume(e.clientX)

        const handleMouseMove = (e: MouseEvent) => updateVolume(e.clientX)
        const handleMouseUp = () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
        }

        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mouseup', handleMouseUp)
    }

    return (
        <div className="flex items-center gap-2 w-24">
            <div
                onClick={() => {
                    if (volume === 0) {
                        setVolume(lastVolume)
                    } else {
                        setLastVolume(volume)
                        setVolume(0)
                    }
                }}
                className="flex items-center gap-2"
            >
                {volume === 0 ? <VolumeX size={20} className="text-brand-400 cursor-pointer text-red-500" /> : <Volume2 size={20} className="text-brand-400 cursor-pointer" />}
            </div>
            <div
                ref={barRef}
                className="h-1.5 bg-brand-200 flex-1 rounded-full overflow-hidden cursor-pointer"
                onMouseDown={handleMouseDown}
            >
                <div
                    className="h-full bg-brand-400"
                    style={{ width: `${volume}%` }}
                />
            </div>
        </div>
    )
}
