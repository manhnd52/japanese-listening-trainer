'use client';

import { useParams, useRouter } from 'next/navigation';
import { AudioDetailContainer } from '@/features/audio-detail/components';

/**
 * Audio Detail Page - Dynamic route for individual audio tracks
 * Route: /audios/[audioId]
 * 
 * Can be accessed by:
 * - Clicking on MiniPlayer
 * - Clicking expand button on MiniPlayer
 * - Direct URL navigation
 */
export default function AudioDetailPage() {
  const params = useParams();
  const router = useRouter();
  const audioId = params.audioId as string;

  const handleBack = () => {
    router.back();
  };

  return (
    <main className="flex-1 min-h-screen bg-jlt-cream">
      <AudioDetailContainer audioId={audioId} onBack={handleBack} />
    </main>
  );
}
